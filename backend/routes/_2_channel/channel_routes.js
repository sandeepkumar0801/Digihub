const validations = require("./channel_validations");
const constants = require("../../misc/constants");
const helpers = require("../../misc/helpers");
const auth = require("../../middleware/auth");
const express = require('express');
const router = express.Router();
const channelService = require("../../services/channel_service");

router.post('/', auth.checkMultiAuthorization, async (req, res) => {
    try {
        if (!validations.channelValidationPOST(req, res)) return;

        let operationId = helpers.getUUID();
        req.body.operationId = operationId;

        let { variables, result } = await channelService.processChannelRequest(req);

        if (variables === undefined || variables === null) {
            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                req.body
            );

        }
        else if (
            variables.isErrorAlreadyExists !== undefined
            && variables.isErrorAlreadyExists
        ) {

            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.CONFLICT,
                constants.ERRORCODES.DUPLICATE_RESOURCE,
                constants.ERRORMESSAGES.DUPLICATE_RESOURCE,
                req.body
            );

        }
        else if (
            variables.isErrorClientNotFound !== undefined
            && variables.isErrorClientNotFound
        ) {
            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.BAD_REQUEST,
                constants.ERRORCODES.BAD_REQUEST,
                `Client-ownerCode ${req.body.ownerCode} does not exists! Please create client first.`,
                req.body
            );

        }
        else if (variables === undefined || variables.channelId === undefined || !variables.channelId) {
            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                req.body
            );

        }

        var isEmpty = (helpers.isEmpty(result)
            && helpers.isEmpty(result[0])
            && helpers.isEmpty(result[0].password));


        if (!isEmpty) {
            result[0].apiKey = await helpers.getDecryptedData(result[0].apiKey);        // amazon accessKey
            result[0].secret = await helpers.getDecryptedData(result[0].secret);        // amazon secretKey
            result[0].username = await helpers.getDecryptedData(result[0].username);    // amazon clientId
            result[0].password = await helpers.getDecryptedData(result[0].password);    // amazon clientSecret
            result[0].token = await helpers.getDecryptedData(result[0].token);          // amazon refreshToken

            result[0].ebay_devid = helpers.getDecryptedData(result[0].ebay_devid);
            result[0].ebay_appid = helpers.getDecryptedData(result[0].ebay_appid);
            result[0].ebay_certid = helpers.getDecryptedData(result[0].ebay_certid);

        }
        var channelDetails = result[0];
        var restulConverted = null;
        if (result) {

            restulConverted = {
                "channelId": channelDetails.channelId,
                "groupCode": channelDetails.groupCode,
                "currencyCode": channelDetails.currencyCode,
                "ownerCode": channelDetails.ownerCode,
                "platformCode": channelDetails.platformCode,
                "platformName": channelDetails.platformName,
                "channelCode": channelDetails.channelCode,
                "channelName": channelDetails.channelName,
                "domain": channelDetails.domain,
                "username": channelDetails.username,
                "password": channelDetails.password,
                "apiKey": channelDetails.apiKey,
                "secret": channelDetails.secret,
                "token": channelDetails.token,
                "isEnabled": channelDetails.isEnabled,
                "createdOn": channelDetails.createdOn,
                "modifiedOn": channelDetails.modifiedOn,
                "orderSyncStartDate": channelDetails.orderSyncStartDate,
                "warehouseLocationId": channelDetails.warehouseLocationId,
                "ebay": {
                    "compatibilityLevel": channelDetails.compatibilityLevel,
                    "devId": channelDetails.ebay_devid,
                    "appId": channelDetails.ebay_appid,
                    "certId": channelDetails.ebay_certid,
                    "siteId": channelDetails.siteId
                },
                "amazon_sp_api": {
                    "accessKey": channelDetails.apiKey,
                    "secretKey": channelDetails.secret,
                    "roleArn": channelDetails.amazon_Role,
                    "clientId": channelDetails.username,
                    "clientSecret": channelDetails.secret,
                    "refreshToken": channelDetails.token,
                    "marketPlaceId": channelDetails.amazon_MarketPlaceID,
                    "sellerId": channelDetails.amazon_SellerID,
                    "region": channelDetails.amazon_region,
                },
                "services": {
                    "stockUpdate": channelDetails.stockUpdate == 1,
                    "priceUpdate": channelDetails.priceUpdate == 1,
                    "orderSync": channelDetails.orderSync == 1,
                    "productPublish": channelDetails.productPublish == 1
                }

            };

            if (restulConverted.ebay != null
                && restulConverted.ebay != ""
                && restulConverted.ebay != undefined
                && restulConverted.ebay.devId != undefined
                && restulConverted.ebay.devId != null
                && restulConverted.ebay.devId != ""

            ) {
                console.log('restulConverted.ebay: ', restulConverted.ebay);
            }
            else {
                restulConverted.ebay = null;

            }

            if (restulConverted.amazon_sp_api != null
                && restulConverted.amazon_sp_api != ""
                && restulConverted.amazon_sp_api != undefined
                && restulConverted.amazon_sp_api.clientId != undefined
                && restulConverted.amazon_sp_api.clientId != null
                && restulConverted.amazon_sp_api.clientId != ""

            ) {
                //restulConverted.username = '';
                //restulConverted.password = '';
                restulConverted.apiKey = '';
                restulConverted.secret = '';
                restulConverted.token = '';
            }
            else {
                restulConverted.amazon_sp_api = null;

            }
        }

        helpers.sendSuccess(
            res,
            constants.HTTPSTATUSCODES.OK,
            req.body.action.toUpperCase() + constants.SUCESSSMESSAGES.EXECUTED,
            restulConverted,
            req.body
        );

    } catch (error) {
        console.error(error);
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
});

router.get('/', auth.checkMultiAuthorization, async (req, res) => {
    try {
        let operationId = helpers.getUUID();

        req.body = {
            operationId: operationId,
            action: 'get',
            ownerCode: '',
            channel: {
                name: ''
            }
        };

        let { variables, result } = await channelService.processChannelRequest(req);

        if (variables === undefined) {
            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                req.body
            );

        }
        else if (
            variables.isErrorAlreadyExists !== undefined
            && variables.isErrorAlreadyExists
        ) {

            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.CONFLICT,
                constants.ERRORCODES.DUPLICATE_RESOURCE,
                constants.ERRORMESSAGES.DUPLICATE_RESOURCE,
                req.body
            );

        }
        else if (
            variables.isErrorClientNotFound !== undefined
            && variables.isErrorClientNotFound
        ) {
            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.BAD_REQUEST,
                constants.ERRORCODES.BAD_REQUEST,
                `Client-ownerCode ${req.body.ownerCode} does not exists! Please create client first.`,
                req.body
            );

        }
        else if (variables === undefined || variables.channelId === undefined || !variables.channelId) {
            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                req.body
            );

        }

        var isEmpty = (helpers.isEmpty(result)
            && helpers.isEmpty(result[0])
            && helpers.isEmpty(result[0].password));

        if (!isEmpty) {
            for (var i = 0; i < result.length; i++) {
                result[i].password = helpers.getDecryptedData(result[i].password);
                result[i].ebay_devid = helpers.getDecryptedData(result[i].ebay_devid);
                result[i].ebay_appid = helpers.getDecryptedData(result[i].ebay_appid);
                result[i].ebay_certid = helpers.getDecryptedData(result[i].ebay_certid);
            }
        }

        helpers.sendSuccess(
            res,
            constants.HTTPSTATUSCODES.OK,
            req.body.action.toUpperCase() + constants.SUCESSSMESSAGES.EXECUTED,
            result,
            req.body
        );
    } catch (error) {
        console.error(error);
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
});

module.exports = router;