const db = require('../startup/db');
const constants = require("../misc/constants");
const db_constants = require("../misc/db_constants");
const moment = require("moment");
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const miscConstants = require("../misc/constants");
const NodeCache = require("node-cache");
const ccCache = new NodeCache({ stdTTL: 3000, checkperiod: 300 });
const logger = require("../misc/logger");
const loggerConstants = require("../server/constants/constants.js");

/*
{
   "action":"insert",
   "ownerCode":"TEST",
   "channel":{
      "id":23,
      "name":"Pricy IT",
      "code":"PRICY",
      "isEnabled":true,
      "groupCode":"PREU",
      "currencyCode":"EUR",
      "credentials":{
         "username":"",
         "password":"d3e2c4b2bd21e1db54a3035c5582218dZKiv+xYhNRQZCdj2Ir\/iuw==",
         "secret":"",
         "token":"",
         "domain":"myDomain.com",
         "apiKey":"myApiKey"
      }
   }
}
*/
exports.processChannelRequest = async (req, res) => {

    let fby_user_id = req.body.channel.id || 0;
    let dbResult = {
        result: null,
        variables: null
    };
    let orderSyncStartDate;
    if (req.body.channel !== undefined &&
        (req.body.channel.orderSyncStartDate !== undefined && req.body.channel.orderSyncStartDate !== '')
    ) {
        orderSyncStartDate = req.body.channel.orderSyncStartDate;
    }
    else {
        var updated_at = moment();
        updated_at = updated_at.subtract(1, "days");
        updated_at = updated_at.format(MOMENT_DATE_FORMAT);
        //orderSyncStartDate = updated_at;
    }
    //console.log('orderSyncStartDate: ', orderSyncStartDate);

    try {
        let ebaycompatibilityLevel = '';
        let ebaydevId = '';
        let ebayappId = '';
        let ebaycertId = '';
        let ebaysiteId = '';
        let isStockUpdate = true;
        let isOrderSync = true;
        let isProductPublish = false;
        let isPriceUpdate = false;
        let amazon_sp_api = {
            "accessKey": '',
            "secretKey": '',
            "roleArn": '',
            "clientId": '',
            "clientSecret": '',
            "refreshToken": '',
            "marketPlaceId": '',
            "sellerId": '',
            "region": '',
        };

        if (
            req.body.channel != undefined
            && req.body.channel != null
            && req.body.channel.services != undefined
            && req.body.channel.services != null
        ) {
            isStockUpdate = req.body.channel.services.stockUpdate;
            isOrderSync = req.body.channel.services.orderSync;
            isProductPublish = req.body.channel.services.productPublish;
            isPriceUpdate = req.body.channel.services.priceUpdate;
        }

        if (
            req.body.channel != undefined
            && req.body.channel != null
            && req.body.channel.credentials != undefined
            && req.body.channel.credentials.ebay != undefined
            && req.body.channel.credentials.ebay != null
        ) {
            ebaycompatibilityLevel = req.body.channel.credentials.ebay.compatibilityLevel || '';
            ebaydevId = req.body.channel.credentials.ebay.devId || '';
            ebayappId = req.body.channel.credentials.ebay.appId || '';
            ebaycertId = req.body.channel.credentials.ebay.certId || '';
            ebaysiteId = req.body.channel.credentials.ebay.siteId || '';
        }

        if (
            req.body.channel != undefined
            && req.body.channel != null
            && req.body.channel.credentials != undefined
            && req.body.channel.credentials.amazon_sp_api != undefined
            && req.body.channel.credentials.amazon_sp_api != null
            && req.body.channel.credentials.amazon_sp_api.refreshToken != ''
        ) {

            amazon_sp_api = {
                "accessKey": req.body.channel.credentials.amazon_sp_api.accessKey || '',
                "secretKey": req.body.channel.credentials.amazon_sp_api.secretKey || '',
                "roleArn": req.body.channel.credentials.amazon_sp_api.roleArn || '',
                "clientId": req.body.channel.credentials.amazon_sp_api.clientId || '',
                "clientSecret": req.body.channel.credentials.amazon_sp_api.clientSecret || '',
                "refreshToken": req.body.channel.credentials.amazon_sp_api.refreshToken || '',
                "marketPlaceId": req.body.channel.credentials.amazon_sp_api.marketPlaceId || '',
                "sellerId": req.body.channel.credentials.amazon_sp_api.sellerId || '',
                "region": req.body.channel.credentials.amazon_sp_api.region || '',
            };
            //console.log('amazon_sp_api: ', amazon_sp_api);
        }

        let username = req.body.channel.credentials.username;   //accessKey
        let password = req.body.channel.credentials.password;   //secretKey
        let apiKey = req.body.channel.credentials.apiKey;       //clientId
        let secret = req.body.channel.credentials.secret;       //clientSecret

        if (
            amazon_sp_api != null
            && amazon_sp_api.refreshToken != undefined
            && amazon_sp_api.refreshToken != null
            && amazon_sp_api.refreshToken != ''
        ) {

            amazon_sp_api = {
                "accessKey": req.body.channel.credentials.amazon_sp_api.accessKey || '',
                "secretKey": req.body.channel.credentials.amazon_sp_api.secretKey || '',
                "roleArn": req.body.channel.credentials.amazon_sp_api.roleArn || '',
                "clientId": req.body.channel.credentials.amazon_sp_api.clientId || '',
                "clientSecret": req.body.channel.credentials.amazon_sp_api.clientSecret || '',
                "refreshToken": req.body.channel.credentials.amazon_sp_api.refreshToken || '',
                "marketPlaceId": req.body.channel.credentials.amazon_sp_api.marketPlaceId || '',
                "sellerId": req.body.channel.credentials.amazon_sp_api.sellerId || '',
                "region": req.body.channel.credentials.amazon_sp_api.region || '',
            };

            req.body.channel.credentials.username = req.body.channel.credentials.amazon_sp_api.clientId;         //accessKey // LWA Credentials
            //req.body.channel.credentials.password = req.body.channel.credentials.amazon_sp_api.clientSecret;     //secretKey // LWA Credentials
            req.body.channel.credentials.apiKey = req.body.channel.credentials.amazon_sp_api.accessKey;          //clientId  // AWS user key
            req.body.channel.credentials.secret = req.body.channel.credentials.amazon_sp_api.secretKey;
            req.body.channel.credentials.token = req.body.channel.credentials.amazon_sp_api.refreshToken;          //clientId  // AWS user secret
        }



        switch (req.body.action) {
            case constants.ACTION.INSERT:
                {

                    let { result, variables } = await db.execute(
                        db_constants.DB_CONSTANTS_CHANNEL.POST,
                        [
                            req.body.channel.id,
                            req.body.channel.groupCode || '',
                            req.body.channel.currencyCode || '',
                            req.body.ownerCode || '',
                            req.body.channel.code || '',
                            req.body.channel.name || '',
                            req.body.channel.credentials.domain || '',
                            req.body.channel.credentials.username || '',
                            req.body.channel.credentials.password || '',
                            req.body.channel.credentials.apiKey || '',
                            req.body.channel.credentials.secret || '',
                            req.body.channel.credentials.token || '',
                            req.body.channel.isEnabled ? 1 : 0,
                            orderSyncStartDate || null,
                            ebaycompatibilityLevel,
                            ebaydevId,
                            ebayappId,
                            ebaycertId,
                            ebaysiteId,
                            isStockUpdate,
                            isOrderSync,
                            isProductPublish,
                            isPriceUpdate,
                            amazon_sp_api.roleArn,
                            amazon_sp_api.marketPlaceId,
                            amazon_sp_api.sellerId,
                            amazon_sp_api.region,
                            req.body.channel.platformCode || '',
                            req.body.channel.platformName || '',
                            req.body.channel.credentials.warehouseLocationId || '',
                        ], null, false
                    );
                    dbResult.variables = variables;
                    dbResult.result = result;
                    try {
                        await logger.LogForAlert(
                            fby_user_id,
                            '',
                            '',
                            'INSERT',
                            result,
                            loggerConstants.LOG_LEVEL.INFO,
                            loggerConstants.FBY_ALERT_CODES.UNKNOWN,
                            "PROCESSCHANNELREQUEST",
                            ""
                        );
                    }
                    catch (error) {
                        console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                    }

                    break;
                }
            case constants.ACTION.UPDATE:
                {

                    let { result, variables } = await db.execute(
                        db_constants.DB_CONSTANTS_CHANNEL.PUT,
                        [
                            req.body.channel.id,
                            req.body.channel.groupCode || '',
                            req.body.channel.currencyCode || '',
                            req.body.ownerCode || '',
                            req.body.channel.code || '',
                            req.body.channel.name || '',
                            req.body.channel.credentials.domain || '',
                            req.body.channel.credentials.username || '',
                            req.body.channel.credentials.password || '',
                            req.body.channel.credentials.apiKey || '',
                            req.body.channel.credentials.secret || '',
                            req.body.channel.credentials.token || '',
                            req.body.channel.isEnabled ? 1 : 0,
                            orderSyncStartDate || null,
                            ebaycompatibilityLevel,
                            ebaydevId,
                            ebayappId,
                            ebaycertId,
                            ebaysiteId,
                            isStockUpdate,
                            isOrderSync,
                            isProductPublish,
                            isPriceUpdate,
                            amazon_sp_api.roleArn,
                            amazon_sp_api.marketPlaceId,
                            amazon_sp_api.sellerId,
                            amazon_sp_api.region,
                            req.body.channel.platformCode || '',
                            req.body.channel.platformName || '',
                            req.body.channel.credentials.warehouseLocationId || '',
                        ], null, false
                    );
                    dbResult.variables = variables;
                    dbResult.result = result;
                    try {
                        let cacheKey_FBYUSER = `${miscConstants.CACHE_KEYS.FBYUSER}-${fby_user_id}`;
                        let cacheKey_CHANNEL_USER = `${miscConstants.CACHE_KEYS.CHANNEL_USER}-${fby_user_id}`;
                        ccCache.del(cacheKey_FBYUSER);
                        ccCache.del(cacheKey_CHANNEL_USER);
                    }
                    catch (error) {
                        console.log('Error while removing cahce on channel change: ', error.message);
                    }
                    try {
                        await logger.LogForAlert(
                            fby_user_id,
                            '',
                            '',
                            'UPDATE',
                            result,
                            loggerConstants.LOG_LEVEL.INFO,
                            loggerConstants.FBY_ALERT_CODES.UNKNOWN,
                            "PROCESSCHANNELREQUEST",
                            ""
                        );
                    }
                    catch (error) {
                        console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                    }
                    break;
                }
            case constants.ACTION.DELETE:
                {
                    let { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_CHANNEL.DELETE,
                        [
                            req.body.channel.id,
                        ], null, false
                    );
                    dbResult.variables = variables;
                    dbResult.result = result;
                    try {
                        let cacheKey_FBYUSER = `${miscConstants.CACHE_KEYS.FBYUSER}-${fby_user_id}`;
                        let cacheKey_CHANNEL_USER = `${miscConstants.CACHE_KEYS.CHANNEL_USER}-${fby_user_id}`;
                        ccCache.del(cacheKey_FBYUSER);
                        ccCache.del(cacheKey_CHANNEL_USER);
                    }
                    catch (error) {
                        console.log('Error while removing cahce on channel change: ', error.message);
                    }
                    try {
                        await logger.LogForAlert(
                            fby_user_id,
                            '',
                            '',
                            'DELETE',
                            result,
                            loggerConstants.LOG_LEVEL.INFO,
                            loggerConstants.FBY_ALERT_CODES.UNKNOWN,
                            "PROCESSCHANNELREQUEST",
                            ""
                        );
                    }
                    catch (error) {
                        console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                    }
                    break;
                }
            case constants.ACTION.GET:
                {

                    let { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_CHANNEL.GET,
                        [
                            req.body.channel.id,
                        ], null, false
                    );
                    dbResult.variables = variables;
                    dbResult.result = result;
                    break;
                }
            default:
                {
                    console.log('default: no action matched.');
                }
        }
    }
    catch (err) {
        console.log('err: ', err);

    }

    return {
        result: dbResult.result,
        variables: dbResult.variables
    };


};
