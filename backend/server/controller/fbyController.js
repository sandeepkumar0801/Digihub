const CircularJSON = require('circular-json');
const constants = require("../constants/constants.js");
const common = require("../constants/common.js");
const mail = require("../constants/email.js");
const dateTime = require("node-datetime");
const moment = require("moment");
const axios = require("axios");
require("dotenv/config");
const logger = require("../../misc/logger");
const v4 = require('uuid').v4;
let uuid = v4;

const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const helpers = require("../../misc/helpers");
const fbyService = require("../../services/fby_service");
const NodeCache = require("node-cache");
const ccCache = new NodeCache({ stdTTL: 3000, checkperiod: 300 });
const urlencode = require('urlencode');
/* Get JWT token */
/**
 * this function get the JWT token from FBY and send a call back as response to channel controller
 */
exports.getFBYToken = async (user, cron_name, cron_id, callback) => {

    cron_name = constants.CC_OPERATIONS.GET_AUTH_TOKEN_FROM_FBY;
    let resultToken = await fbyService.getFBYToken(null, user, cron_name, cron_id);
    let api_token = resultToken.result;
    let msg = {
        success: {
            data: api_token,
        },
    };
    if (api_token == null || api_token == undefined || api_token == '') {
        let authUsername = user.auth_username;
        let authPassword = user.auth_password;
        let cacheKey = "fby_auth_token";
        let cachedResult = ccCache.get(cacheKey);
        msg = {
            success: {
                data: api_token,
            },
        };
        if (cachedResult == undefined || !cachedResult || cachedResult == null) {
            await axios
                .post(constants.FBY_TOKEN_URL, {
                    username: authUsername,
                    password: authPassword,
                })
                .then(async (response) => {
                    try {
                        if (Array.isArray(response.data)) {
                            response.data = response.data[0];
                        }
                    } catch (error) {
                        //console.log("ERROR\n ", error.message);
                    }
                    api_token = response.data.token;
                    let msg = {
                        success: {
                            data: api_token,
                        },
                    };
                    if (api_token && api_token != "" && api_token != null) {
                        ccCache.set(cacheKey, api_token, ((60 * 50))); //cache for 50 minutes
                    }
                    return callback(msg);
                })
                .catch((error) => {
                    //console.log('\nERROR :\n', error.message);
                    let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), user.fby_user_id];
                    //set response
                    msg = { error: { data: error } };
                    return callback(msg);
                });
        }
    }

    return callback(msg);
};

/* Get FBY Stock */
/**
 * this function get the Stocks from FBY,store in 'temp_master_inventory'. 
 * then update new quantity in product table and send a call back as response to channel controller.
 */
exports.getStockList = async (api_token, shopifyAccount, req, fby_id, cron_name, cron_id, callback) => {
    let fby_user_id = fby_id;
    cron_name = constants.CC_OPERATIONS.GET_STOCK_FROM_FBY;
    let file_and_method_name = 'fbyController.js getStockList';

    try {
        if (shopifyAccount == undefined || shopifyAccount == null) {
            try {
                await common.shopifyUserDetail(fby_user_id, cron_name, cron_id, function (result) {
                    if (!helpers.isEmpty(result.success.data)) {
                        shopifyAccount = result.success.data[0];

                    }
                });
            }
            catch (error) {
                //console.log('\nERROR While getStockList for user account or api_token for FBY \n', error.message);

            }
        }
        if (api_token == undefined || api_token == null || api_token == '') {
            api_token = await fbyService.get_fby_token_from_fby_user_id(fby_user_id);
        }
    }
    catch (error) {
        //console.log('\nERROR While common.deleteStockBeforeAddStocks: \n', error.message);

    }
    let set_response = {};
    let page = 0;
    let total_page = 0;
    let count = 1;
    let updated_at = moment();
    let isAmazonChannel = false;

    updated_at = updated_at.subtract(1, "days");
    updated_at = updated_at.format(MOMENT_DATE_FORMAT);

    let ownerCode = shopifyAccount.owner_code;
    let groupCode = shopifyAccount.group_code;
    let item_per_page = constants.FBY_PERPAGE;
    let items = [];
    let logMessage = `fby_user_id: ${fby_id}, ${constants.CC_OPERATIONS.GET_STOCK_FROM_FBY}`;


    let cacheKey_Job = `${constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL},group_code-${groupCode},owner_code-${ownerCode}`;
    // `${cron_name}-${fby_id}`;
    try {
        let jobRunning = ccCache.get(cacheKey_Job);
        if (jobRunning == undefined || !jobRunning || jobRunning == null) {
            ccCache.set(cacheKey_Job, true);
        }
        else {
            let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_id}.`;
            set_response = {
                sucess: {
                    message: msg
                }
            };
            //console.log(msg);
            return set_response;
        }

        /*
        if (req.query.updated_after) {
            updated_at = req.query.updated_after;
        }

        //##todo
        var startat = moment('2023-06-08 18:30:00');
        updated_at = moment();
        var duration = moment.duration(updated_at.diff(startat));
        var hours = duration.asHours();
        //console.log('stock startat: ', startat.format(MOMENT_DATE_FORMAT));
        //console.log('stock updated_at: ', updated_at.format(MOMENT_DATE_FORMAT));
        if (hours > 2) {
            updated_at = updated_at.subtract(1, "hours");
        }
        else {
            updated_at = startat;
        }
        //console.log('stock updateafter: ', updated_at.format(MOMENT_DATE_FORMAT));
        let updated_at_before_encoded = updated_at.format(MOMENT_DATE_FORMAT);
        updated_at = updated_at.format(MOMENT_DATE_FORMAT);
        */

        if (req.query.item_per_page) {
            item_per_page = req.query.item_per_page;
        }
        if (shopifyAccount.channelName.toLowerCase().includes('amazon')) {
            isAmazonChannel = true;
        }


        try {
            await common.getLastSyncOperationTime(fby_user_id, cron_name, function (result) {
                if (result != undefined && result != null && result.success && result.success.data.length > 0) {
                    updated_at = result.success.data[0].last_opearion_sync_time;
                    updated_at = moment(updated_at).format(MOMENT_DATE_FORMAT);
                    updated_at_before_encoded = updated_at;
                    //updated_at = moment('2023-06-20').format(MOMENT_DATE_FORMAT);
                }
                req.query.updated_after = updated_at;
            });

            await common.deleteStockBeforeAddStocks(fby_id);
        }
        catch (error) {
            //console.log('\nERROR While common.deleteStockBeforeAddStocks: \n', error.message);

        }
        //*
        if (fby_user_id == 50 || fby_user_id == 37
        ) {
            updated_at = '2023-06-01 00:00:00';
            req.query.updated_after = updated_at;
        }
        //*/


        let url = constants.FBY_STOCKLIST_URL;

        do {
            page++;
            let params = {
                channelGroupCode: groupCode,
                updatedAfter: updated_at,
                itemsPerPage: item_per_page,
                ownerCode: ownerCode,
                page: page,
                fby_user_id: fby_user_id,
            };
            logMessage = `fby_user_id: ${fby_id}, ${constants.CC_OPERATIONS.GET_STOCK_FROM_FBY} url: ${url}`;
            try {
                //console.log(`\nAPI Call STARTED -----------------fby_user_id ${fby_user_id}, updated_at <${updated_at}> ${moment().format(MOMENT_DATE_FORMAT)}`);
                //console.log(`${file_and_method_name}`);
                //console.log(JSON.stringify({ params, url }));
            }
            catch (error) {
            }
            await axios({
                url: url,
                method: "get",
                headers: {
                    Authorization: `Bearer ${api_token}`,
                },
                params: params,
            })
                .then(async (response) => {
                    if (response.data != undefined && response.data) {
                        try {


                            try {
                                //console.log(`API Call COMPLTETED -----------------fby_user_id ${fby_user_id}, updated_at <${updated_at}> ${moment().format(MOMENT_DATE_FORMAT)}`);
                                //console.log(`${file_and_method_name}`);
                                //console.log(JSON.stringify({ params, url }));
                                //console.log('\n');
                            }
                            catch (error) {
                            }
                            //console.log('response: ', response);

                            if (Object.keys(response.data) == "errors") {
                                //mail
                                try {
                                    var reqres = {
                                        request: {
                                            url: url,
                                            method: "get",
                                            headers: {
                                                Authorization: `Bearer ${api_token}`,
                                            },
                                            params: params
                                        },
                                        response: {
                                            data: response.data
                                        }
                                    };

                                    await logger.LogForAlert(
                                        fby_id,
                                        '',
                                        '',
                                        constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                                        CircularJSON.stringify(reqres),
                                        constants.LOG_LEVEL.ERROR,
                                        constants.FBY_ALERT_CODES.STOCK_SYNC,
                                        constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                                        cron_id
                                    );
                                }
                                catch (error) {
                                    //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                                }

                                set_response = { error: { "key": fby_id, data: response.data } };
                            } else if (Object.keys(response.data) == "incrementalStock") {

                                count++;

                                try {
                                    var reqres = {
                                        request: {
                                            url: url,
                                            method: "get",
                                            headers: {
                                                Authorization: `Bearer ${api_token}`,
                                            },
                                            params: params
                                        },
                                        response: {
                                            data: response.data
                                        }
                                    };

                                    try {
                                        await logger.LogForAlert(
                                            fby_id,
                                            'yocabe-stock-list',
                                            '',
                                            constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                                            CircularJSON.stringify(reqres),
                                            constants.LOG_LEVEL.INFO,
                                            constants.FBY_ALERT_CODES.STOCK_SYNC,
                                            constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                                            cron_id
                                        );
                                    }
                                    catch (error) {
                                        //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                                    }
                                }
                                catch (error) {
                                    //console.log(error);

                                }

                                // add to products !
                                items = response.data.incrementalStock.items.map(async item => {
                                    return item;
                                });
                                let paramsJson = JSON.stringify(params);
                                //console.log(`\n${logMessage},\ntotalItems: ${items.length},\n${paramsJson}`);

                                if (items !== undefined && items.length > 0) {
                                    let counter = 0;
                                    // items.forEach(async (item) => {
                                    for await (let item of items) {
                                        counter++;
                                        if (isAmazonChannel == false) {
                                            if (counter == 1 || counter == items.length - 1) {
                                                //console.log(`\n${counter}/ ${items.length}) ${logMessage}, \n${paramsJson}\nitem:\n`, JSON.stringify(item));
                                            }
                                        }
                                        let item_arr = [item.skuId, item.skuCode, item.ean, item.quantity, item.priority, cron_id];
                                        try {

                                            await common.addStock(item_arr, fby_id, async function (result) {
                                                if (result.error) {
                                                    // store add stock error log
                                                    let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                                                    //console.log('inputs: ', inputs);
                                                }
                                            });

                                            /*
                                            await logger.LogForAlert(
                                                fby_id,
                                                '',
                                                item.skuCode,
                                                `${logMessage}, sku: ${item.skuCode}, qty: ${item.quantity}`,
                                                CircularJSON.stringify(item),
                                                constants.LOG_LEVEL.INFO,
                                                constants.FBY_ALERT_CODES.STOCK_SYNC,
                                                constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                                                cron_id,
                                                false
                                            );
                                            */

                                            //await helpers.sleep();
                                        }
                                        catch (error) {
                                            //console.log('\nERROR While common.addStock: \n', error.message);

                                        }
                                    }
                                }
                                total_page = response.data.incrementalStock.totalPages;
                            }


                        } catch (error) {
                            //console.log('error: ', error);
                        }
                    }
                })
                .catch(async function (error) {
                    let responseData = error.message;
                    //console.log("getStockList CATCH_TYPE", responseData);

                    try {
                        var reqres = {
                            request: {
                                url: url,
                                method: "get",
                                headers: {
                                    Authorization: `Bearer ${api_token}`,
                                },
                                params: params
                            },
                            response: {
                                data: responseData
                            }
                        };
                        let logData = CircularJSON.stringify(reqres);
                        await logger.LogForAlert(
                            fby_id,
                            '',
                            '',
                            error.message,
                            logData,
                            constants.LOG_LEVEL.ERROR,
                            constants.FBY_ALERT_CODES.STOCK_SYNC,
                            constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                            cron_id
                        );
                    }
                    catch (error) {
                        //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                    }
                    //set response
                    set_response = { error: { data: responseData } };
                });
        } while (page <= total_page)


        if (count > 1) {
            set_response = { success: { data: constants.FBY_GETSTOCK_SUCCESS, items: items } };
        }
        await common.updateLastSyncOperationTime(fby_user_id, null, cron_name, function (result) {
            if (result != null && result.error) {
                //console.log("Failed to update sync time in the database");
            }
        });
        // update product Quantity
        let updt_time = dateTime.create();
        let inputs = [cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];

        try {
            await common.updateProduct(inputs, fby_id, cron_name, cron_id, function (result) {
                //console.log('result: ', result);
                if (result.error) {
                    // store update product error log
                    let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                    //console.log('\nERROR : ', JSON.stringify(inputs));

                }
            });
        }
        catch (error) {
            //console.log('\nERROR While common.updateProduct: \n', error.message);

        }
    }
    catch (error) {
        //console.log('\nERROR While common.updateProduct: \n', error.message);

    }
    finally {
        ccCache.del(cacheKey_Job);
    }
    return await set_response;
};

exports.getProductsList = async (api_token, shopifyAccount, req, fby_id, cron_name, cron_id, callback) => {
    try {

        let fby_user_id = fby_id;
        let set_response = {};
        let page = 1;
        let total_page = 0;
        let count = 1;
        let updated_at = moment();
        updated_at = updated_at.subtract(20, "days");
        updated_at = updated_at.format(MOMENT_DATE_FORMAT);

        let ownerCode = shopifyAccount.owner_code;
        let groupCode = shopifyAccount.group_code;
        let item_per_page = constants.FBY_PERPAGE;
        let items = [];

        if (req.query.updated_after) {
            updated_at = req.query.updated_after;
        }
        if (req.query.item_per_page) {
            item_per_page = req.query.item_per_page;
        }

        let url = constants.FBY_PRODUCTLIST_URL;

        do {
            let params = {
                channelGroupCode: groupCode,
                updatedAfter: updated_at,
                itemsPerPage: item_per_page,
                ownerCode: ownerCode,
                page: page++
            };
            let apiRequest = {
                url: url,
                method: "get",
                headers: {
                    Authorization: `Bearer ${api_token}`,
                },
                params: params,
            };
            var apiRequestResponse = {
                fby_user_id: fby_user_id,
                request: apiRequest,
                response: {
                    data: null
                }
            };

            await axios(apiRequest)
                .then(async (response) => {
                    if (response.data != undefined && response.data) {
                        try {
                            let itemsInResult = 0;
                            try {
                                itemsInResult = response.data.incrementalSkuPublications.items.length;
                            }
                            catch (error) {

                            }
                            apiRequestResponse.response.data = JSON.parse(JSON.stringify(response.data));
                            let logData = JSON.stringify(apiRequestResponse);
                            let infoMessage = `fby_user_id: ${fby_user_id}, ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY}`;
                            //console.log(infoMessage);
                            infoMessage = `\n${infoMessage}, Total itemsInResult: ${itemsInResult}`;

                            await logger.LogForAlert(
                                fby_user_id,
                                '',
                                '',
                                infoMessage,
                                logData,
                                constants.LOG_LEVEL.INFO,
                                constants.FBY_ALERT_CODES.STOCK,
                                constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY,
                                cron_id
                            );

                            infoMessage = `\n${infoMessage}\n${logData}`;
                            //console.log(infoMessage);
                        }
                        catch (error) {
                            //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                        }

                        if (Object.keys(response.data) == "errors") {

                            try {

                                let logData = JSON.stringify(apiRequestResponse);
                                let errorMessage = response.data.errors != undefined && response.data.errors != null ? JSON.stringify(response.data.errors) : constants.GET_PRODUCT_ERROR;
                                await logger.LogForAlert(
                                    fby_id,
                                    '',
                                    '',
                                    errorMessage,
                                    logData,
                                    constants.LOG_LEVEL.ERROR,
                                    constants.FBY_ALERT_CODES.STOCK,
                                    constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY,
                                    cron_id
                                );
                            }
                            catch (error) {
                                //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                            }

                            set_response = { error: { "key": fby_id, data: response.data } };
                        } else if (Object.keys(response.data) == "incrementalSkuPublications") {

                            count++;

                            // add to products !
                            items = response.data.incrementalSkuPublications.items.map(item => {
                                return item;
                            });
                            let paramsJson = JSON.stringify(params);
                            logger.logInfo(`getProductsList : ${url}, ${paramsJson}`, items);


                            if (items !== undefined && items.length > 0) {
                                items.forEach(async (item) => {
                                    let img = constants.DEFAULT_SHOPIFY_IMAGE;
                                    if (item.images != undefined && item.images != null && item.images.length > 0) {
                                        img = item.images[0];
                                    }
                                    else {
                                        item.images = [];
                                        //item.images.push(img);
                                    }
                                    let fby_user_id = fby_id;
                                    let domain = shopifyAccount.domain;
                                    let owner_code = ownerCode;
                                    let channel = groupCode;
                                    let sku = item.skuCode;
                                    let barcode = item.ean;
                                    let item_id = 0;
                                    let title = item.title;
                                    let item_product_id = 0;
                                    let inventory_item_id = 0;
                                    let inventory_quantity = 0;
                                    let image = '';//img;
                                    let price = null;
                                    let location_id = 0;
                                    let description = item.description != undefined && item.description != null ? item.description : '';
                                    let inputs = [
                                        fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id,
                                        inventory_quantity, inventory_quantity, '', price, cron_name, cron_id, location_id
                                        , description
                                    ];
                                    if (item.skuFamily != "Unknown" && item.skuCode.includes(item.skuFamily)) {
                                        //console.log('variant---   ',inputs);
                                        await common.addCreateProductVariant(inputs, fby_id, cron_name, cron_id, async function (result) {
                                            if (result.error) {
                                                //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                                            }
                                        });
                                        sku = item.skuFamily;
                                        barcode = '';
                                    }
                                    inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id
                                        , description
                                    ];
                                    //console.log('product---   ',inputs);
                                    await common.addCreateProduct(inputs, fby_id, cron_name, cron_id, async function (result) {
                                        if (result.error) {
                                            logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                                        }
                                    });


                                    if (item.images != undefined && item.images != null) {
                                        let imageOrder = 0;
                                        item.images.forEach(async element => {
                                            imageOrder++;
                                            let insImg = [element, item.skuCode, item.skuFamily, fby_id, null, imageOrder];
                                            //console.log('images---   ',insImg);
                                            await common.addImages(insImg, fby_id, cron_name, cron_id, function (result) {
                                                if (result.error) {
                                                    logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(insImg));
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                            total_page = response.data.incrementalSkuPublications.totalPages;
                        }

                    }
                })
                .catch(async function (error) {
                    try {
                        apiRequestResponse.response.data = JSON.stringify(error);
                        let logData = JSON.stringify(apiRequestResponse);
                        let errorMessage = error.message;
                        await logger.LogForAlert(
                            fby_id,
                            '',
                            '',
                            errorMessage,
                            logData,
                            constants.LOG_LEVEL.ERROR,
                            constants.FBY_ALERT_CODES.UNKNOWN,
                            constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY,
                            cron_id
                        );
                    }
                    catch (error) {
                        //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                    }
                    set_response = { error: { data: responseData } };
                });
        } while (page <= total_page)


        if (count > 1) {
            set_response = { success: { data: constants.GET_PRODUCT_SUCCESS, items: items } };
        }
        // update product Quantity
        let updt_time = dateTime.create();
        let inputs = [cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];

        return set_response;
    }
    catch (error) {
        //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY}: \n`, error.message);

    }
};

exports.getProductPrices = async (api_token, shopifyAccount, req, fby_id, cron_name, cron_id, callback) => {
    let fby_user_id = fby_id;
    try {

        let set_response = {};
        let page = 1;
        let total_page = 0;
        let count = 1;
        let updated_at = moment();

        if (req.query.updated_after) {
            updated_at = moment(req.query.updated_after).format(MOMENT_DATE_FORMAT);
        }
        else {
            updated_at = updated_at.subtract(10, "days");
            updated_at = updated_at.format(MOMENT_DATE_FORMAT);
        }


        if (fby_user_id == 50 || fby_user_id == 37
        ) {
            updated_at = '2023-06-01 00:00:00';
            req.query.updated_after = updated_at;
        }

        let ownerCode = shopifyAccount.owner_code;
        let groupCode = shopifyAccount.group_code;
        let item_per_page = constants.FBY_PERPAGE;
        let items = [];

        if (req.query.updated_after) {
            updated_at = req.query.updated_after;
        }
        if (req.query.item_per_page) {
            item_per_page = req.query.item_per_page;
        }

        let url = constants.FBY_PRODUCT_PRICES;

        do {
            try {
                let params = {
                    codeChannel: shopifyAccount.channel_code,
                    updatedAfter: updated_at,
                    itemsPerPage: item_per_page,
                    ownerCode: ownerCode,
                    page: page++
                };


                let apiRequest = {
                    url: url,
                    method: "get",
                    headers: {
                        Authorization: `Bearer ${api_token}`,
                    },
                    params: params,
                };
                var apiRequestResponse = {
                    fby_user_id: fby_user_id,
                    request: apiRequest,
                    response: {
                        data: null
                    }
                };

                await axios(apiRequest)
                    .then(async (response) => {
                        if (response.data != undefined && response.data) {
                            try {

                                try {

                                    apiRequestResponse.response.data = JSON.parse(JSON.stringify(response.data));
                                    let logData = JSON.stringify(apiRequestResponse);
                                    let infoMessage = `fby_user_id: ${fby_user_id}, ${constants.CC_OPERATIONS.GET_PRICES_FROM_FBY}`;
                                    if (response.data != null && response.data != undefined
                                        && response.data.prices != null && response.data.prices != undefined
                                        && response.data.prices.items != null && response.data.prices.items != undefined
                                        && Array.isArray(response.data.prices.items)
                                    ) {
                                        infoMessage = `\n${infoMessage}, Total Prices Fetched: ${response.data.prices.items.length}`;
                                    }

                                    await logger.LogForAlert(
                                        fby_user_id,
                                        '',
                                        '',
                                        infoMessage,
                                        logData,
                                        constants.LOG_LEVEL.INFO,
                                        constants.FBY_ALERT_CODES.STOCK_SYNC,
                                        constants.CC_OPERATIONS.GET_PRICES_FROM_FBY,
                                        cron_id
                                    );

                                    infoMessage = `\n${infoMessage}\n${JSON.stringify(apiRequestResponse)}`;
                                    //console.log(infoMessage);
                                }
                                catch (error) {
                                    //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                                }

                                if (Object.keys(response.data) == "errors") {

                                    try {

                                        let logData = JSON.stringify(apiRequestResponse);
                                        let errorMessage = response.data.errors != undefined && response.data.errors != null ? JSON.stringify(response.data.errors) : constants.FBY_GET_PRODUCT_PRICE_ERROR;
                                        await logger.LogForAlert(
                                            fby_id,
                                            '',
                                            '',
                                            errorMessage.trim(),
                                            logData.trim(),
                                            constants.LOG_LEVEL.ERROR,
                                            constants.FBY_ALERT_CODES.STOCK_SYNC,
                                            constants.CC_OPERATIONS.GET_PRICES_FROM_FBY,
                                            cron_id
                                        );
                                    }
                                    catch (error) {
                                        //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                                    }
                                    set_response = { error: { "key": fby_id, data: response.data } };
                                } else if (Object.keys(response.data) == "prices") {

                                    count++;

                                    if (response.data.prices.items.length == 0 && process.env.IS_MOCK == 1) {
                                        response.data.prices.items = [{
                                            skuCode: "BN_BRL_WFQ14479_S398_F9",
                                            skuId: 7,
                                            fullPrice: 10,
                                            specialPrice: 7,
                                            priority: 10,
                                            source: "nation",
                                            marketPlace: {
                                                channelCode: {
                                                    itemId: "SHIT"
                                                }
                                            },
                                            currency: "EUR"
                                        }
                                        ]
                                    }
                                    // add to products !
                                    items = response.data.prices.items.map(item => {
                                        return item;
                                    });
                                    let paramsJson = JSON.stringify(params);

                                    if (items !== undefined && items.length > 0) {
                                        items.forEach(async (item) => {
                                            try {
                                                let price = item.fullPrice;
                                                let specialPrice = item.specialPrice;
                                                let skuCode = item.skuCode;
                                                let inputs = [fby_user_id, price, specialPrice, skuCode];
                                                await common.updatePrices(inputs, async function (result) {
                                                    if (result.error) {
                                                        logger.logError(`getProductPricesFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                                                        // store log
                                                        let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                                                        await common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                                            if (result.error) {
                                                                mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                                                            }
                                                        })
                                                    }
                                                });
                                            }
                                            catch (err) {
                                                try {

                                                    apiRequestResponse.response.data['errors'] = JSON.parse(JSON.stringify(err));
                                                    let logData = JSON.stringify(item);
                                                    let infoMessage = `fby_user_id: ${fby_user_id}, ${constants.CC_OPERATIONS.GET_PRICES_FROM_FBY}`;
                                                    infoMessage = `\n${infoMessage}, ERROR: ${err.message}`;

                                                    await logger.LogForAlert(
                                                        fby_user_id,
                                                        '',
                                                        item.skuCode,
                                                        infoMessage,
                                                        logData,
                                                        constants.LOG_LEVEL.INFO,
                                                        constants.FBY_ALERT_CODES.STOCK_SYNC,
                                                        constants.CC_OPERATIONS.GET_PRICES_FROM_FBY,
                                                        cron_id,
                                                        false
                                                    );

                                                    infoMessage = `\n${infoMessage}\n${JSON.stringify(err)}`;
                                                    //console.log(infoMessage);
                                                }
                                                catch (error) {
                                                    //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                                                }

                                            }
                                        });
                                    }
                                    total_page = response.data.prices.totalPages;
                                }


                            }
                            catch (error) {
                                //console.log('error: ', error);
                            }
                        }
                    })
                    .catch(async function (error) {
                        try {

                            apiRequestResponse.response.data = JSON.stringify(error);
                            let logData = JSON.stringify(apiRequestResponse);
                            let errorMessage = error.message;

                            await logger.LogForAlert(
                                fby_id,
                                '',
                                '',
                                errorMessage,
                                logData,
                                constants.LOG_LEVEL.ERROR,
                                constants.FBY_ALERT_CODES.STOCK_SYNC,
                                constants.CC_OPERATIONS.GET_PRICES_FROM_FBY,
                                cron_id
                            );
                        }
                        catch (error) {
                            //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                        }
                        let responseData = error.message;
                        set_response = { error: { data: responseData } };
                    });
            }

            catch (error) {
                //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRICES_FROM_FBY}: \n`, error.message);

            }
        } while (page <= total_page)


        if (count > 1) {
            set_response = { success: { data: constants.FBY_GETSTOCK_SUCCESS, items: items } };
        }
        // update product Quantity
        let updt_time = dateTime.create();
        let inputs = [cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];

        return set_response;
    }
    catch (error) {
        //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRICES_FROM_FBY}: \n`, error.message);

    }
};

exports.getPrices = async (api_token, amazonAccount, req, fby_id, cron_name, cron_id, callback) => {
    let fby_user_id = fby_id;
    try {
        cron_name = constants.CC_OPERATIONS.GET_PRICES_FROM_FBY;
        let infoMessgae = `fby_use_id = ${fby_id},${cron_name}`;
        let set_response = {};
        let page = 1;
        let total_page = 0;
        let count = 1;
        let updated_at = moment();
        updated_at = updated_at.subtract(1, "days");
        updated_at = updated_at.format(MOMENT_DATE_FORMAT);

        let ownerCode = amazonAccount.owner_code;
        let groupCode = amazonAccount.group_code;
        let item_per_page = constants.FBY_PERPAGE;
        let items = [];

        if (req.query.updated_after) {
            updated_at = req.query.updated_after;
        }
        if (req.query.item_per_page) {
            item_per_page = req.query.item_per_page;
        }

        let url = constants.FBY_PRODUCT_PRICES;
        try {
            await common.deletePricesBeforeAddStocks(fby_user_id);
        }
        catch (error) {
            //console.log('deletePricesBeforeAddStocks error: ', error.message);

        }

        do {
            try {
                let params = {
                    codeChannel: amazonAccount.channel_code,
                    updatedAfter: updated_at,
                    itemsPerPage: item_per_page,
                    ownerCode: ownerCode,
                    page: page++
                };

                let apiRequest = {
                    url: url,
                    method: "get",
                    headers: {
                        Authorization: `Bearer ${api_token}`,
                    },
                    params: params,
                };
                var apiRequestResponse = {
                    fby_user_id: fby_user_id,
                    request: apiRequest,
                    response: {
                        data: null
                    }
                };
                await axios(apiRequest)
                    .then(async (response) => {
                        if (response.data != undefined && response.data) {
                            try {

                                try {

                                    apiRequestResponse.response.data = JSON.parse(JSON.stringify(response.data));
                                    let logData = JSON.stringify(apiRequestResponse);
                                    infoMessage = `fby_user_id: ${fby_user_id}, ${constants.CC_OPERATIONS.GET_PRICES_FROM_FBY}, priceItems ${response.data.prices.totalItems}, page: ${page - 1}`;
                                    //console.log(infoMessage);
                                    if (response.data != null && response.data != undefined
                                        && response.data.prices != null && response.data.prices != undefined
                                        && response.data.prices.items != null && response.data.prices.items != undefined
                                        && Array.isArray(response.data.prices.items)
                                    ) {
                                        infoMessage = `\n${infoMessage}, Total Prices Fetched: ${response.data.prices.items.length}`;
                                    }

                                    await logger.LogForAlert(
                                        fby_user_id,
                                        '',
                                        '',
                                        infoMessage,
                                        logData,
                                        constants.LOG_LEVEL.INFO,
                                        constants.FBY_ALERT_CODES.PRICE_SYNC,
                                        constants.CC_OPERATIONS.GET_PRICES_FROM_FBY,
                                        cron_id
                                    );

                                    infoMessage = `\n${infoMessage}\n${JSON.stringify(apiRequestResponse)}`;
                                    //console.log(infoMessage);
                                }
                                catch (error) {
                                    //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                                }

                                if (Object.keys(response.data) == "errors") {

                                    try {

                                        let logData = JSON.stringify(apiRequestResponse);
                                        let errorMessage = response.data.errors != undefined && response.data.errors != null ? JSON.stringify(response.data.errors) : constants.FBY_GET_PRODUCT_PRICE_ERROR;
                                        await logger.LogForAlert(
                                            fby_id,
                                            '',
                                            '',
                                            errorMessage.trim(),
                                            logData.trim(),
                                            constants.LOG_LEVEL.ERROR,
                                            constants.FBY_ALERT_CODES.PRICE_SYNC,
                                            constants.CC_OPERATIONS.GET_PRICES_FROM_FBY,
                                            cron_id
                                        );
                                    }
                                    catch (error) {
                                        //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                                    }
                                    set_response = { error: { "key": fby_id, data: response.data } };
                                } else if (Object.keys(response.data) == "prices") {

                                    count++;

                                    try {
                                        await logger.LogForAlert(
                                            fby_user_id,
                                            'yocabe-price-list',
                                            '',
                                            `${constants.CC_OPERATIONS.GET_PRICES_FROM_FBY} page: (${page}/${total_page})`,
                                            CircularJSON.stringify(response.data),
                                            constants.LOG_LEVEL.INFO,
                                            constants.FBY_ALERT_CODES.PRICE_SYNC,
                                            constants.CC_OPERATIONS.GET_PRICES_FROM_FBY,
                                            cron_id
                                        );
                                    }
                                    catch (error) {
                                        //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                                    }
                                    // add to prices !
                                    items = response.data.prices.items.map(item => {
                                        return item;
                                    });
                                    let paramsJson = JSON.stringify(params);

                                    if (items !== undefined && items.length > 0) {
                                        for await (var item of items) {
                                            try {
                                                let skuId = item.skuId;
                                                let skuCode = item.skuCode;
                                                let barcode = item.barcode || ''
                                                let price = item.fullPrice;
                                                let specialPrice = item.specialPrice;
                                                let priority = item.priority;
                                                let source = item.source;
                                                let currency = item.currency;
                                                let itemId = item.skuId;


                                                let inputs = [skuId, skuCode, barcode, price, specialPrice, priority, source, currency, itemId, cron_id, fby_id];
                                                await common.updatePricesFromFby(inputs, async function (result) {
                                                    if (result.error) {
                                                    }
                                                });
                                            }
                                            catch (err) {
                                                try {

                                                    apiRequestResponse.response.data['errors'] = JSON.parse(JSON.stringify(err));
                                                    let logData = JSON.stringify(item);
                                                    infoMessage = `fby_user_id: ${fby_user_id}, ${constants.CC_OPERATIONS.GET_PRICES_FROM_FBY}`;
                                                    infoMessage = `\n${infoMessage}, ERROR: ${err.message}`;

                                                    await logger.LogForAlert(
                                                        fby_user_id,
                                                        '',
                                                        item.skuCode,
                                                        infoMessage,
                                                        logData,
                                                        constants.LOG_LEVEL.INFO,
                                                        constants.FBY_ALERT_CODES.PRICE_SYNC,
                                                        constants.CC_OPERATIONS.GET_PRICES_FROM_FBY,
                                                        cron_id,
                                                        false
                                                    );

                                                    infoMessage = `\n${infoMessage}\n${JSON.stringify(err)}`;
                                                    //console.log(infoMessage);
                                                }
                                                catch (error) {
                                                    //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                                                }

                                            }
                                        }
                                    }
                                    total_page = response.data.prices.totalPages;
                                }

                            } catch (error) {
                                //console.log('error: ', error);
                            }
                        }
                    })
                    .catch(async function (error) {
                        try {

                            apiRequestResponse.response.data = JSON.stringify(error);
                            let logData = JSON.stringify(apiRequestResponse);
                            let errorMessage = error.message;

                            await logger.LogForAlert(
                                fby_id,
                                '',
                                '',
                                errorMessage,
                                logData,
                                constants.LOG_LEVEL.ERROR,
                                constants.FBY_ALERT_CODES.STOCK_SYNC,
                                constants.CC_OPERATIONS.GET_PRICES_FROM_FBY,
                                cron_id
                            );
                        }
                        catch (error) {
                            //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                        }
                        let responseData = error.message;
                        set_response = { error: { data: responseData } };
                    });
            }

            catch (error) {
                //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRICES_FROM_FBY}: \n`, error.message);

            }
        } while (page <= total_page)


        if (count > 1) {
            set_response = { success: { data: constants.FBY_GETSTOCK_SUCCESS, items: items } };
        }
        // update product Quantity
        let updt_time = dateTime.create();
        let inputs = [cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];

        return set_response;
    }
    catch (error) {
        //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRICES_FROM_FBY}: \n`, error.message);

    }
};

/* Insert SKU */
/**
 * this function send product details to FBY,update the status of 'product' table to 1 and send a call back as response to channel controller
 */
exports.insertSku = async (api_token, product, exist_cron, cron_name, cron_id, callback) => {
    let set_response = {};
    let barcode = product.barcode || '';
    let item_id = product.item_id || '';
    let item_product_id = product.item_product_id || '';
    let inventory_item_id = product.inventory_item_id || '';
    let skus = {
        "code": product.sku,
        "ean": product.barcode,
        "title": product.title,
        "partnerItemId": `${product.item_id}`,
        "partnerItemCode": `${product.item_product_id}`,
        "image": product.image,
        "inventory_item_id": `${product.inventory_item_id}`,
        "ownerCode": product.owner_code,
    };
    let fby_id = product.fby_user_id;
    let sku = product.sku;
    let postData = {
        skus: [skus],
    };

    let axiosConfig = {
        headers: {
            Authorization: `Bearer ${api_token}`,
        },
    };

    //api for inserting skus
    await axios
        .post(
            constants.FBY_SKUINSERT_URL,
            postData,
            axiosConfig
        )
        .then((result) => {
            try {
                if (Array.isArray(result.data)) {
                    result.data = result.data[0];
                }
            } catch (error) {
                //console.log("ERROR\n ", error.message);
            }
            try {
                if (Object.values(result.data.success) == "Ok") {
                    let updt_time = dateTime.create();

                    let inputs = [fby_id, sku, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')
                        , barcode
                        , item_id
                        , item_product_id
                        , inventory_item_id
                    ];
                    common.updateProductStatus(inputs, fby_id, cron_name, cron_id, function (result) {
                        if (result.error) {
                            //mail
                            mail.updateProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                            //store update product status error log
                            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
                            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                if (result.error) {
                                    mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                                }
                            })
                        }
                    })
                    // set response 
                    let msg = { success: { message: constants.FBY_SKUINSERT_SUCCESS, data: JSON.stringify(result.data) } };
                    set_response[sku] = (msg);
                }
            } catch (error) {

                if (result.data.errors) {
                    if (exist_cron) {
                        /* Update products count=count+1 and update error log */
                        let updt_time = dateTime.create();
                        let inputs = [fby_id, sku, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data.errors), updt_time.format('Y-m-d H:M:S')];
                        common.fbyProductErrorManage(inputs, fby_id, cron_name, cron_id, function (result) {
                            if (result.error) {
                                //mail
                                mail.updateProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                                //store update product status error log
                                let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
                                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                    if (result.error) {
                                        mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                                    }
                                })
                            }
                        })
                        //set response
                        let msg = { error: { message: constants.FBY_SKUINSERT_ERROR, data: JSON.stringify(result.data.errors) } };
                        set_response[sku] = (msg);
                    } else {
                        let updt_time = dateTime.create();
                        let inputs = [fby_id, sku, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data.errors), updt_time.format('Y-m-d H:M:S')];
                        /* Update products count=count+1 and flag 1 */
                        common.fbyProductErrorManage(inputs, fby_id, cron_name, cron_id, function (result) {
                            if (result.error) {
                                //mail
                                mail.updateProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                                //store update product status error log
                                let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
                                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                    if (result.error) {
                                        mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                                    }
                                })
                            }
                        })
                        //  mail
                        mail.skuInsertMail(cron_name, cron_id, fby_id, JSON.stringify(result.data));
                        //store sku insert response catch log
                        inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
                        common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                            if (result.error) {
                                mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                            }
                        })
                        //set response
                        let msg = { error: { message: constants.FBY_SKUINSERT_ERROR, data: JSON.stringify(result.data.errors) } };
                        set_response[sku] = (msg);
                    }
                }
            }
        })
        .catch((error) => {
            if (exist_cron) {
                /* Update products count=count+1 and update error log */
                let updt_time = dateTime.create();
                let inputs = [fby_id, sku, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error.message), updt_time.format('Y-m-d H:M:S')];
                //console.log('\n ERROR: ', JSON.stringify(inputs));

                //set response
                let msg = { error: { data: JSON.stringify(error) } };
                set_response[sku] = (msg);
            } else {
                let updt_time = dateTime.create();
                let inputs = [fby_id, sku, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), updt_time.format('Y-m-d H:M:S')];
                /* Update products count=count+1 and flag 1 */
                common.fbyProductErrorManage(inputs, fby_id, cron_name, cron_id, function (result) {
                    if (result.error) {
                        //console.log('\n ERROR: ', JSON.stringify(result.error));
                    }
                })

                let msg = { error: { data: JSON.stringify(error) } };
                set_response[sku] = msg;
            }

        });

    return callback(set_response);
}



/* Get FBY Track Number */
/**
 * this function get notifiable orders/traking orders from FBY,store in 'temp_order_master_inventory'. 
 * then update new tracking details in product table and send a call back as response to channel controller.
 */
exports.getTrackList = async (api_token, fby_id, order_details, cron_name, cron_id, callback, channelName = '') => {
    let set_response = {};
    let set_response_data = {};
    let page = 1;
    let total_page = 0;
    let count = 1;
    let fby_user_id = fby_id;

    cron_name = constants.CC_OPERATIONS.GET_TRAKING_FROM_FBY;
    let fby_alert_code = constants.FBY_ALERT_CODES.ORDER_TRAKING;
    let order_no = '';
    let sku = ''

    let logMessage = `fby_user_id ${fby_user_id},${cron_name}`;
    let logData = '';
    try {
        let shopifyAccount = null;
        try {
            await common.shopifyUserDetail(fby_user_id, cron_name, cron_id, function (result) {
                if (!helpers.isEmpty(result.success.data)) {
                    shopifyAccount = result.success.data[0];
                    channelName = shopifyAccount.channelName;
                }
            });
        }
        catch (error) {
            //console.log('\nERROR While common.shopifyUserDetail: \n', error.message);

        }
        do {
            api_token = await fbyService.get_fby_token_from_fby_user_id(fby_user_id);
            let params = {
                //channelOrderId: order_details.order_no || order_details,//for perticular record
                // channelOrderId: 2000020151612438,//for perticular record
                itemsPerPage: constants.FBY_PERPAGE,
                page: page++,
                // channelOrderId: '5107606323429'
            }
            if (shopifyAccount.owner_code !== undefined && shopifyAccount.owner_code !== null) {
                params.ownerCode = shopifyAccount.owner_code;
            }
            else
                if (order_details !== undefined && order_details !== null && order_details.owner_code !== undefined && order_details.owner_code != '') {
                    params.ownerCode = order_details.owner_code;
                }
                else {
                    //console.log(`\n${logMessage}\n`, JSON.stringify(order_details));
                }
            // //console.log('374 params: ', params);
            let apiRequest = {
                url: constants.FBY_NOTIFY_ORDER_URL,
                method: "get",
                headers: {
                    Authorization: `Bearer ${api_token}`,
                },
                params: params,
            };
            var apiRequestResponse = {
                fby_user_id: fby_user_id,
                request: apiRequest,
                response: {
                    data: null
                }
            };
            await axios(apiRequest)
                .then(async (response) => {
                    if (response.data != undefined && response.data) {
                        try {


                            apiRequestResponse.response.data = JSON.parse(JSON.stringify(response.data));
                            set_response_data = response.data;
                            let paramsJson = JSON.stringify(params);
                            logData = JSON.stringify(apiRequestResponse);
                            //console.log(`\n getTrackList, fby_user_id:${fby_id}, url: ${constants.FBY_NOTIFY_ORDER_URL}, params: ${paramsJson}\n`);
                            if (Object.keys(response.data) == "errors") {
                                //mail

                                try {


                                    let errorMessage = response.data.errors != undefined && response.data.errors != null ? JSON.stringify(response.data.errors) : constants.FBY_GETTRACK_ERROR;
                                    await logger.LogForAlert(
                                        fby_id,
                                        '',
                                        '',
                                        errorMessage,
                                        logData,
                                        constants.LOG_LEVEL.ERROR,
                                        constants.FBY_ALERT_CODES.ORDER_TRAKING,
                                        constants.CC_OPERATIONS.GET_TRAKING_FROM_FBY,
                                        cron_id
                                    );
                                }
                                catch (error) {
                                    //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                                }

                                set_response = { error: { "key": fby_id, data: response.data } };
                            } else if (Object.keys(response.data) == "notifiableOrders") {
                                count++;
                                await logger.LogForAlert(
                                    fby_id,
                                    '',
                                    '',
                                    logMessage,
                                    logData,
                                    constants.LOG_LEVEL.INFO,
                                    constants.FBY_ALERT_CODES.TRACK_SYNC,
                                    constants.CC_OPERATIONS.GET_TRAKING_FROM_FBY,
                                    cron_id
                                );
                                // add to products !
                                let items = response.data.notifiableOrders.items.map(item => {
                                    return item;
                                })
                                //console.log(`\ngetTrackList, fby_user_id:${fby_id}, url: ${constants.FBY_NOTIFY_ORDER_URL}, params: ${paramsJson}\nTotal Orders To Notify : `, JSON.stringify(items.length));
                                let counter = 0;
                                //items.forEach(async (item) => {
                                for (let item of items) {
                                    try {
                                        counter++;

                                        let traking = "";
                                        let shipmentDate = "";
                                        let carrier = "";
                                        let ship_url = "";
                                        let isReturn = "";
                                        //console.log(`\n${counter} ) getTrackList, fby_user_id:${fby_id}, url: ${constants.FBY_NOTIFY_ORDER_URL}, params: ${paramsJson}\nOrder To Notify : \n`, JSON.stringify(item));


                                        if (item.shippings && item.shippings[0].tracking) {
                                            traking = item.shippings[0].tracking;
                                            shipmentDate = item.shippings[0].shipmentDate;
                                            carrier = item.shippings[0].carrier;
                                            ship_url = item.shippings[0].url;
                                            isReturn = item.shippings[0].isReturn;


                                            let updt_time = dateTime.create();

                                            try {
                                                order_no = item.channelOrderId;
                                                sku = item.skuCode != undefined ? item.skuCode : "";
                                                let logMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;
                                                if (order_no != '') {
                                                    logMessage = `${logMessage}, order_no: ${order_no}`

                                                }
                                                if (sku != '') {
                                                    logMessage = `${logMessage}, sku: ${sku}`

                                                }


                                                await logger.LogForAlert(
                                                    fby_id,
                                                    order_no,
                                                    sku,
                                                    logMessage,
                                                    item,
                                                    constants.LOG_LEVEL.INFO,
                                                    fby_alert_code,
                                                    cron_name,
                                                    cron_id
                                                );
                                            } catch (error) {
                                                //console.log(error);

                                            }

                                            let item_arr = [
                                                cron_name,
                                                cron_id,
                                                updt_time.format('Y-m-d H:M:S'),
                                                traking,
                                                carrier,
                                                ship_url,
                                                item.channelOrderId,
                                                item.channelCode,
                                                item.skuEan,
                                                item.skuCode != undefined ? item.skuCode : ""
                                            ];


                                            // update order Track Number

                                            await common.updateOrder(item_arr, fby_id, cron_name, cron_id, function (result) {
                                                if (result.error) {
                                                    //console.log(`\n${counter} ) getTrackList, fby_user_id:${fby_id}, url: ${constants.FBY_NOTIFY_ORDER_URL}, params: ${paramsJson}\nOrder To Notify : \n`, JSON.stringify(item));
                                                    //console.log('\n ERROR: ', JSON.stringify(result.error));
                                                }
                                            })
                                        }
                                        order = {
                                            fby_user_id: fby_id,
                                            order_no: item.channelOrderId,
                                            sku: item.skuCode,
                                            barcode: item.skuEan,
                                            order_line_item_id: null,
                                            original_Channel_OrderId: item.originalChannelOrderId
                                        }
                                        //if (order.order_no == '5588716093784' || order.order_no ==5590845161816) {
                                        await fbyService.changeOrderStatus(null, order, cron_id, cron_name, cron_id);
                                        //}
                                    }
                                    catch (error) {
                                        //console.log(`\nERROR:${error.message}}\nWHILE ${counter} )getTrackList, fby_user_id:${fby_id}, url: ${constants.FBY_NOTIFY_ORDER_URL}, params: ${paramsJson}\nOrder To Notify : \n`, JSON.stringify(item));

                                        //console.log('\n ERROR: ',);
                                    }
                                }
                                total_page = response.data.notifiableOrders.totalPages;
                            }

                        }
                        catch (error) {
                            //console.log('error: ', error);
                        }
                    }
                })
                .catch(async function (error) {

                    let errorJson = error.message;
                    try {

                        apiRequestResponse.response.data = error.message;
                        let errorMessage = error.message;
                        await logger.LogForAlert(
                            fby_id,
                            '',
                            '',
                            errorMessage,
                            logData,
                            constants.LOG_LEVEL.ERROR,
                            constants.FBY_ALERT_CODES.ORDER_TRAKING,
                            constants.CC_OPERATIONS.GET_TRAKING_FROM_FBY,
                            cron_id
                        );


                        //store log
                        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, errorJson, fby_id];
                        common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                            if (result.error) {
                                mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                            }
                        });
                        //set response
                        set_response = { error: { data: error } };
                    }
                    catch (error) {
                        //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                    }
                });

        } while (page <= total_page)
        if (count > 1) {
            set_response = { success: { data: set_response_data } };
        }
    }
    catch (error) {
        //console.log();
        //console.log(error);

    }
    return callback(set_response);
}

/* Insert Order */
/**
 * this function send order details to FBY,update the status of 'order_masters' table to 1 and send a call back as response to channel controller
 */

exports.insertOrder = async (api_token, order, exist_cron, cron_name, cron_id, callback) => {
    let set_response = {};

    let order_number = order.order_no;
    let fby_user_id = order.fby_user_id;
    let logMsg = `\n fby_user_id ${fby_user_id}, order_number ${order_number} , ${constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY}`;
    let sku = '';
    let infoMessage = logMsg;
    let client = null;

    await common.shopifyUserDetail(fby_user_id, cron_name, cron_id, function (result) {
        client = result.success.data[0];
    });

    let isShopifyOrWoocommerce = client.platformName.toLowerCase().includes('shopify')
        || client.platformName.toLowerCase().includes('woocomm') ? true : false;

    //console.log(logMsg);
    let isCanceledOrderNotExists = order.order_status = 'non esiste';
    await common.getOrderDetails(fby_user_id, order_number, cron_name, cron_id, async function (result) {
        // set_response[client.domain] = result;
        if (isCanceledOrderNotExists) {

            if (result.success) {
                if (Array.isArray(result.success.data)
                    && result.success.data != undefined
                    && result.success.data != null
                ) {
                    //console.log('\n order_master fetch when not existing on fby: \n', JSON.stringify(order));
                    order.order_status = 'unfulfilled'
                    for (let i = 0; i < result.success.data.length; i++) {
                        result.success.data[i].order_status = 'unfulfilled';
                    }

                }


            }
            else {
                //console.log(`\n${logMsg}`, JSON.stringify(result));
                result.error = true;

            }


        }
        if (result.error) {
            let errorJson = JSON.stringify(result.error);
            //console.log(`\n${logMsg} result.error: `, errorJson);
            // store log
            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, errorJson, fby_user_id];
            //console.log('inputs: ', inputs);

        }
        if (result.success) {
            let order_data = result.success.data;
            let IsCheckAfter48Hours = order_data[0].IsCheckAfter48Hours || 0;
            let currDateTime = new Date();
            let orderCheckDate = new Date(order_data[0].checked_at || currDateTime);
            let diffHours = (currDateTime - orderCheckDate) / 3600000;

            if (orderCheckDate == null || IsCheckAfter48Hours == 0 || diffHours > constants.PAYMENT_ERROR_RETRY_AFTER_HOURS || isCanceledOrderNotExists) {

                let noOfItems = order_data.length;
                let sumAmountItems = 0.0;
                let counterLineItems = 0;

                let products = order_data.map((orderdetail) => {
                    counterLineItems++;
                    sumAmountItems += parseFloat(orderdetail.item_total_price);
                    let barcode = "";
                    if (orderdetail.barcode) {
                        barcode = orderdetail.barcode;
                    }
                    if ((orderdetail.sku || '') != '') {
                        sku = sku.concat(", ", orderdetail.sku)
                    }
                    let products_new = {
                        code: orderdetail.sku || '',
                        ean: barcode || '',
                        quantity: orderdetail.quantity_purchased,
                        itemPriceTotal: parseFloat(orderdetail.item_total_price),
                        shippingContributionPriceTotal: parseFloat(orderdetail.item_total_ship_price),
                    };

                    //console.log(`\n${counterLineItems}) ${logMsg}, SKU: ${orderdetail.sku}, barcode: ${barcode}, LineItem\n${JSON.stringify(products_new)}`);
                    return products_new;
                })

                products = order_data.map((orderdetail) => {
                    //  //console.log(`FBY insertOrder ${orderdetail.order_no}`);
                    let shippingContributionPriceTotal = parseFloat(orderdetail.item_total_ship_price) > 0 ? parseFloat(orderdetail.item_total_ship_price) : ((parseFloat(orderdetail.total_order) - parseFloat(sumAmountItems)) / noOfItems);
                    // //console.log(`\n${logMsg} ((parseFloat(orderdetail.total_order) - sumAmountItems) : `, (parseFloat(orderdetail.total_order) - sumAmountItems));
                    // //console.log(`${logMsg} noOfItems: `, noOfItems);
                    // //console.log(`${logMsg} item_total_price: `, parseFloat(orderdetail.item_total_price));
                    // //console.log(`${logMsg} shippingContributionPriceTotal: `, parseFloat(shippingContributionPriceTotal));

                    let barcode = "";
                    if (orderdetail.barcode) {
                        barcode = orderdetail.barcode;
                    }

                    let itemPriceTotalC = parseFloat(orderdetail.item_total_price);
                    let shippingContributionPriceTotalC = parseFloat(parseFloat(shippingContributionPriceTotal).toFixed(2));

                    let products_new = {
                        code: orderdetail.sku || '',
                        ean: barcode || '',
                        quantity: parseFloat(orderdetail.quantity_purchased),
                        itemPriceTotal: parseFloat(itemPriceTotalC),
                        shippingContributionPriceTotal: parseFloat(shippingContributionPriceTotalC),
                    };
                    return products_new;
                })
                let phone_no = "";
                if (order.ship_phone_number) {
                    phone_no = order.ship_phone_number;
                }

                let shippingAddress = (order.ship_address_1 || '')
                // if (shippingAddress != '') {
                //     shippingAddress = shippingAddress + ', '
                // }
                // shippingAddress = shippingAddress + order.ship_address_2 || '';

                let customerShipment = {
                    fullName: order.recipient_name || '',
                    company: order.ship_company || '',
                    address: shippingAddress,
                    addressLine2: order.ship_address_2 || '',
                    postalCode: order.ship_postal_code || '',
                    city: order.ship_city || '',
                    province: order.ship_state_code || '',
                    nation: order.ship_country || '',
                    codeNation: order.ship_country_code || '',
                    phone: phone_no || '',
                    email: order.buyer_email || '',
                    alias: (order.recipient_name !== undefined ? order.recipient_name.split(" ").join("") : ''),
                };

                let invoiceDetails = {
                    fullName: order.bill_generator_name || '',
                    company: order.bill_company || '',
                    address: order.bill_address_1 || '',
                    addressLine2: order.bill_address_2 || '',
                    postalCode: order.bill_postal_code || '',
                    city: order.bill_city || '',
                    province: order.bill_state_code || '',
                    nation: order.bill_country || '',
                    codeNation: order.bill_country_code || '',
                    phone: order.bill_phone_number || '',
                    email: order.buyer_email || '',
                    alias: (order.bill_generator_name !== undefined ? order.bill_generator_name.split(" ").join("") : ''),
                };

                let payment_method = order.fby_payment_method || order.payment_method;// constants.DEFAULT_PAYMENT_METHOD;

                try {
                    order.payment_date = moment(order.payment_date).format(MOMENT_DATE_FORMAT);
                    if (order.payment_date == 'Invalid date' || order.fby_payment_method == 'COD') {
                        order.payment_date = null;
                    }
                }
                catch (error) {
                    order.payment_date = null;
                }
                let payment = {
                    paymentMethodCode: payment_method || '',
                    paymentDate: order.payment_date,
                    paymentTransactionId: order.payment_transaction_id || '',
                    paymentAmount: parseFloat(order.total_order),
                };

                let managedByChannel = false;
                try {

                    if (order_data.managedByChannel != undefined
                        && order_data.managedByChannel != null
                        && (order_data.managedByChannel == 1 || order.managedByChannel == true)
                    ) {
                        managedByChannel == true;
                    }
                }
                catch (error) {

                }
                order.purchase_date = moment(order.purchase_date).format(MOMENT_DATE_FORMAT);
                if (invoiceDetails.fullName == '' || invoiceDetails.fullName == null
                    || invoiceDetails.address == '' || invoiceDetails.address == null
                    || invoiceDetails.codeNation == '' || invoiceDetails.codeNation == null
                ) {
                    invoiceDetails = customerShipment;
                }

                let ordersInsert_data = {
                    "managedByChannel": managedByChannel,
                    "ownerCode": order.owner_code,
                    "channelOrderId": order.order_no,
                    "channelCode": order.channel_code,
                    "orderDate": order.purchase_date,
                    "currencyCode": order.currency_code,
                    "products": products,
                    "customerShipment": customerShipment,
                    "customerInvoice": invoiceDetails,
                    "payment": payment,
                    "channelCredentialId": parseInt(fby_user_id),
                };

                if (order.seller_order_id && order.seller_order_id != "" && isShopifyOrWoocommerce) {
                    ordersInsert_data['channelOrderName'] = order.seller_order_id;
                }
                let postData = {
                    ordersInsert: [ordersInsert_data],
                };


                //console.log(`\n${logMsg} \n`);
                //console.log(JSON.stringify(postData));
                //console.log(`\n`);
                /*
                //console.log(postData.ordersInsert[0].products);
                //console.log(postData.ordersInsert[0].products[0].shippingContributionPriceTotal);
                //console.log(typeof postData.ordersInsert[0].products[0].shippingContributionPriceTotal);
               */


                if (order.fby_send_status != undefined && order.fby_send_status == 1) {
                    set_response[order_number] = { success: { message: "Already Sent", data: JSON.stringify(postData) } };
                    return set_response;
                }

                let apiRequest = {
                    url: constants.FBY_ORDERINSERT_URL,
                    method: "post",
                    headers: {
                        Authorization: `Bearer ${api_token}`,
                    },
                    params: postData,
                };
                var apiRequestResponse = {
                    fby_user_id: fby_user_id,
                    request: apiRequest,
                    response: {
                        data: null
                    }
                };

                let axiosConfig = {
                    headers: {
                        Authorization: `Bearer ${api_token}`,
                    },
                };

                try {
                    await logger.LogForAlert(
                        fby_user_id,
                        order_number,
                        '',
                        `STARTED ${infoMessage}`,
                        apiRequestResponse,
                        constants.LOG_LEVEL.INFO,
                        constants.FBY_ALERT_CODES.ORDER_SYNC,
                        constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY,
                        cron_id,
                        false
                    );
                }
                catch (error) {
                    //console.log();
                    //console.log(error.message);

                }
                axios
                    .post(
                        constants.FBY_ORDERINSERT_URL,
                        postData,
                        axiosConfig
                    )
                    .then(async (response) => {

                        apiRequestResponse.response.data = JSON.parse(JSON.stringify(response.data));
                        try {
                            if (Array.isArray(response.data)) {
                                response.data = response.data[0];
                            }
                        } catch (error) {
                            //console.log("ERROR\n ", error.message);
                        }
                        let paramJson = JSON.stringify(postData);
                        try {

                            let logData = JSON.stringify(apiRequestResponse);
                            infoMessage = logMsg;
                            //console.log(infoMessage);
                            infoMessage = `fby_user_id: ${fby_user_id}, order_number: ${order_number}, SKU: ${sku}, ${constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY}`;

                            await logger.LogForAlert(
                                fby_user_id,
                                order_number,
                                '',
                                `COMPLETED ${infoMessage}`,
                                logData,
                                constants.LOG_LEVEL.INFO,
                                constants.FBY_ALERT_CODES.ORDER_SYNC,
                                constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY,
                                cron_id,
                                false
                            );

                        }
                        catch (error) {
                            //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                        }


                        let errorAlreadyEisits = response.data != undefined && response.data.errors != undefined ?
                            JSON.stringify(response.data.errors) : '';

                        let isPaymentMethodEnabledError = errorAlreadyEisits.toLowerCase().includes(constants.PAYMENT_ERROR_METHOD_NOT_ENABLED);
                        let isPaymentDateNullError = errorAlreadyEisits.toLowerCase().includes(constants.PAYMENT_ERROR_PAYMENT_DATE_NULL);
                        let isFbyOrderAlreadyExists = errorAlreadyEisits.includes(constants.FBY_ORDER_ALREADY_EXISTS);
                        let isNoPaymentMethodError = errorAlreadyEisits != '' && ((isPaymentMethodEnabledError || isPaymentDateNullError) ? true : false);
                        let isProductNotFoundError = errorAlreadyEisits.includes(constants.FBY_ORDER_PRODUCT_NOT_FOUND);

                        if (response.data.success
                            || (errorAlreadyEisits != '' && isFbyOrderAlreadyExists)
                            || (errorAlreadyEisits != '' && isPaymentMethodEnabledError)
                            || (errorAlreadyEisits != '' && isPaymentDateNullError)
                            || (errorAlreadyEisits != '' && isProductNotFoundError)
                        ) {
                            let updt_time = dateTime.create();

                            let inputs = [fby_user_id, order_number, cron_name, cron_id, updt_time.format('Y-m-d H:M:S'), updt_time.format('Y-m-d H:M:S'), isNoPaymentMethodError];

                            await common.updateOrderStatus(inputs, fby_user_id, cron_name, cron_id, function (result) {
                                if (result.error) {

                                    //store update product status error log
                                    let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_user_id];
                                    //console.log('\n ERROR: ', JSON.stringify(result.error));

                                }
                            })

                            let msg = { success: { message: constants.FBY_PROCESSING_SUCCESS, data: JSON.stringify(response.data) } };
                            set_response[order_number] = msg;
                        } else if (response.data.errors) {
                            try {

                                let infoMessage = `fby_user_id: ${fby_user_id}, order_number: ${order_number}, SKU: ${sku}, ${constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY}`;
                                let logData = JSON.stringify(response.data.errors);

                                //console.log(`\n${logMsg}\n${logData}`);

                                await logger.LogForAlert(
                                    fby_user_id,
                                    order_number,
                                    '',
                                    infoMessage,
                                    logData,
                                    constants.LOG_LEVEL.ERROR,
                                    constants.FBY_ALERT_CODES.ORDER_SYNC,
                                    constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY,
                                    cron_id,
                                    false
                                );

                            }
                            catch (error) {
                                //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                            }

                            try {

                                let logData = JSON.stringify(apiRequestResponse);
                                let errorMessage = `fby_user_id: ${fby_user_id}, order_number: ${order_number}, SKU: ${sku}, ${constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY}, ERROR: ${constants.FBY_ORDERINSERT_ERROR}`;
                                let infoMessage = errorMessage;
                                await logger.LogForAlert(
                                    fby_user_id,
                                    order != null && order.order_no != undefined && order.order_no != "" ? order.order_no : "",
                                    order != null && order.sku != undefined && order.sku != "" ? order.sku : "",
                                    errorMessage,
                                    logData,
                                    constants.LOG_LEVEL.ERROR,
                                    constants.FBY_ALERT_CODES.ORDER_SYNC,
                                    constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY,
                                    cron_id
                                );
                            }
                            catch (error) {
                                //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                            }

                            if (exist_cron) {
                                /* Update order_master count=count+1 and update error log */
                                let updt_time = dateTime.create();
                                let inputs = [fby_user_id, order_number, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(response.data.errors), updt_time.format('Y-m-d H:M:S')];
                                common.fbyOrderErrorManage(inputs, fby_user_id, cron_name, cron_id, function (result) {
                                    if (result.error) {
                                        //mail
                                        mail.updateOrderErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                                        //store update product status error log
                                        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_user_id];
                                        common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                            if (result.error) {
                                                mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                                            }
                                        })
                                    }
                                })
                                //response.data
                                let msg = { error: { message: constants.FBY_ORDERINSERT_ERROR, data: JSON.stringify(response.data.errors) } };
                                set_response[order_number] = msg;

                            } else {
                                let updt_time = dateTime.create();
                                let inputs = [fby_user_id, order_number, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(response.data.errors), updt_time.format('Y-m-d H:M:S')];
                                common.fbyOrderErrorManage(inputs, fby_user_id, cron_name, cron_id, function (result) {
                                    if (result.error) {
                                        //mail
                                        mail.updateOrderErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                                        //store update product status error log
                                        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_user_id];
                                        common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                            if (result.error) {
                                                mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                                            }
                                        })
                                    }
                                })
                                //store log
                                inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(response.data.errors), fby_user_id];
                                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                    if (result.error) {
                                        mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                                    }
                                })
                                //response.data
                                let msg = { error: { message: constants.FBY_ORDERINSERT_ERROR, data: JSON.stringify(response.data.errors) } };
                                set_response[order_number] = msg;
                            }

                        }
                    })
                    .catch(async (error) => {
                        //console.log(`\n ERROR : fby_user_id ${fby_user_id}, ${constants.FBY_ORDERINSERT_URL} : \n ${JSON.stringify(postData)} \n`, JSON.stringify(error));

                        try {
                            apiRequestResponse.response.data = error.message;
                            let logData = JSON.stringify(apiRequestResponse);
                            let errorMessage = `fby_user_id: ${fby_user_id}, order_number: ${order_number}, SKU: ${sku}, ${constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY}, ERROR: ${error.message}`;
                            await logger.LogForAlert(
                                fby_user_id,
                                order != null && order.order_no != undefined && order.order_no != "" ? order.order_no : "",
                                order != null && order.sku != undefined && order.sku != "" ? order.sku : "",
                                errorMessage,
                                logData,
                                constants.LOG_LEVEL.ERROR,
                                constants.FBY_ALERT_CODES.ORDER_SYNC,
                                constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY,
                                cron_id
                            );
                        }
                        catch (error) {
                            //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                        }
                        if (exist_cron) {
                            /* Update order_master count=count+1 and update error log */
                            let updt_time = dateTime.create();
                            let inputs = [fby_user_id, order_number, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), updt_time.format('Y-m-d H:M:S')];
                            common.fbyOrderErrorManage(inputs, fby_user_id, cron_name, cron_id, function (result) {
                                if (result.error) {
                                    //mail
                                    mail.updateOrderErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                                    //store update product status error log
                                    let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_user_id];
                                    common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                        if (result.error) {
                                            mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                                        }
                                    })
                                }
                            })
                            //set response
                            let msg = { error: { data: JSON.stringify(error) } };
                            set_response[order_number] = (msg);

                        } else {
                            let updt_time = dateTime.create();
                            let inputs = [fby_user_id, order_number, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), updt_time.format('Y-m-d H:M:S')];
                            /* Update order_master count=count+1 and flag 1 */
                            common.fbyOrderErrorManage(inputs, fby_user_id, cron_name, cron_id, function (result) {
                                if (result.error) {
                                    //mail
                                    mail.updateOrderErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                                    //store update product status error log
                                    let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_user_id];
                                    common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                        if (result.error) {
                                            mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                                        }
                                    })
                                }
                            })
                            //mail
                            mail.tokenMail(cron_name, cron_id, fby_user_id, JSON.stringify(error));
                            //store log
                            inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), fby_user_id];
                            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                if (result.error) {
                                    mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                                }
                            })
                            //set response
                            let msg = { error: { data: JSON.stringify(error) } };
                            set_response[order_number] = (msg);
                        }

                    });
                // );
            }
            else {
                //console.log(`${logMsg}\n error: Payment Error orderCheckDate ${orderCheckDate} == null || IsCheckAfter48Hours ${IsCheckAfter48Hours}== 0 || diffHours ${diffHours} > ${constants.PAYMENT_ERROR_RETRY_AFTER_HOURS}`);
            }
        }
    })
    return callback(set_response);
}
/* Insert Canceled Order */
/**
 * this function send order details to FBY,update the status of 'order_masters' table to 1 and send a call back as response to channel controller
 */

exports.insertCanceledOrder = async (api_token, order, client, fby_id, cron_name, cron_id, callback) => {
    let set_response = {};

    let order_number = order.order_no;
    let fby_user_id = order.fby_user_id;
    let sku = order.sku;
    let logMsg = `fby_user_id ${fby_user_id},${constants.CC_OPERATIONS.PUSH_CANCELLED_ORDER_TO_FBY}, Order_Number ${order_number}, SKU: ${sku}`;
    let cancel_reason = constants.DEFAULT_cancel_reason;
    try {
        await common.getCancelReason(order.cancel_reason, order.channel, cron_name, cron_id, function (result) {
            if (result.success) {
                try {
                    cancel_reason = result.success.data != undefined
                        && result.success.data.length > 0
                        && result.success.data != null
                        && result.success.data[0].fby_cancel_reason != undefined
                        ?
                        result.success.data[0].fby_cancel_reason
                        : "customer"
                }
                catch (error) {
                    cancel_reason = "customer";
                }
            }

        })

        let canceled_order_data = {
            "channelOrderId": order_number.toString(),
            "skuCode": order.sku,
            "eanCode": order.barcode,
            "cancellationReasonCode": cancel_reason,
            "ownerCode": client.owner_code
        }


        let postData = {
            "ordersDelete": [canceled_order_data],
        };

        let axiosConfig = {
            headers: {
                Authorization: `Bearer ${api_token}`,
            },
        };

        let apiRequest = {
            url: constants.FBY_CANCELED_ORDER_URL,
            method: "post",
            headers: {
                Authorization: `Bearer ${api_token}`,
            },
            params: postData,
        };
        var apiRequestResponse = {
            fby_user_id: fby_user_id,
            request: apiRequest,
            response: {
                data: null
            }
        };

        axios
            .post(
                constants.FBY_CANCELED_ORDER_URL,
                postData,
                axiosConfig
            )
            .then(async (response) => {
                try {

                    apiRequestResponse.response.data = JSON.parse(JSON.stringify(response.data));
                    try {
                        if (Array.isArray(response.data)) {
                            response.data = response.data[0];
                        }
                    } catch (error) {
                        //console.log("ERROR\n ", error.message);
                    }
                    let logData = JSON.stringify(apiRequestResponse);
                    let infoMessage = `${logMsg}`;
                    await logger.LogForAlert(
                        fby_user_id,
                        order_number,
                        sku,
                        infoMessage,
                        logData,
                        constants.LOG_LEVEL.INFO,
                        constants.FBY_ALERT_CODES.ORDER_SYNC,
                        constants.CC_OPERATIONS.PUSH_CANCELLED_ORDER_TO_FBY,
                        cron_id,
                        false
                    );

                    infoMessage = `\n${infoMessage}\n${logData}`;
                    //console.log(infoMessage);
                }
                catch (error) {
                    //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                }

                if (response.data.success) {
                    //console.log(`\n${logMsg} insertCanceledOrder success.`);
                    let updt_time = dateTime.create();
                    let inputs = [fby_user_id, order_number, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];
                    await common.updateOrderCancel(inputs, fby_user_id, cron_name, cron_id, function (result) {
                        if (result.error) {
                            //mail
                            //store update product status error log
                            let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.data), fby_user_id];
                            //console.log('inputs: ', inputs);

                        }
                    })
                    set_response[order_number] = constants.FBY_ORDERINSERT_SUCCESS;
                } else if (response.data.errors) {
                    //store log
                    let errorJson = JSON.stringify(response.data.errors);
                    //console.log(`\n${logMsg} insertCanceledOrder ERROR : \n`, errorJson);
                    try {

                        let logData = JSON.stringify(apiRequestResponse);
                        let errorMessage = `fby_user_id: ${fby_user_id}, order_number: ${order_number}, SKU: ${sku}, ${constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY}, ERROR: ${constants.FBY_CANCELED_ORDERINSERT_ERROR}`;
                        logger.LogForAlert(
                            fby_id,
                            order != null && order.order_no != undefined && order.order_no != "" ? order.order_no : "",
                            order != null && order.sku != undefined && order.sku != "" ? order.sku : "",
                            errorMessage,
                            logData,
                            constants.LOG_LEVEL.ERROR,
                            constants.FBY_ALERT_CODES.ORDER_CANCEL,
                            constants.CC_OPERATIONS.PUSH_CANCELLED_ORDER_TO_FBY,
                            cron_id
                        );
                    }
                    catch (error) {
                        //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                    }

                    let inputs = [cron_name, cron_id, constants.QUERY_TYPE, errorJson, fby_user_id];

                    if (errorJson.includes("non esiste")) {
                        order.order_status = 'non esiste';
                        await this.insertOrder(api_token, order, 0, cron_name, cron_id, function (result) {
                            set_response[order.id] = result;
                        });
                    }

                    await common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                        if (result.error) {
                            mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                        }
                    })
                    //response.data
                    set_response[order_number] = constants.FBY_CANCELED_ORDERINSERT_ERROR;
                }
            })
            .catch(async (error) => {
                //mail
                //console.log('Error insertCanceledOrder ', JSON.stringify(error));


                try {

                    let logData = JSON.stringify(apiRequestResponse);
                    let errorMessage = `fby_user_id: ${fby_user_id}, order_number: ${order_number}, SKU: ${sku}, ${constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY}, ERROR: ${error.message}`;
                    await logger.LogForAlert(
                        fby_user_id,
                        order != null && order.order_no != undefined && order.order_no != "" ? order.order_no : "",
                        order != null && order.sku != undefined && order.sku != "" ? order.sku : "",
                        errorMessage,
                        logData,
                        constants.LOG_LEVEL.ERROR,
                        constants.FBY_ALERT_CODES.ORDER_CANCEL,
                        constants.CC_OPERATIONS.PUSH_CANCELLED_ORDER_TO_FBY,
                        cron_id
                    );
                }
                catch (error) {
                    //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                }            //store log
                let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), fby_user_id];
                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                    if (result.error) {
                        mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                    }
                })
                //set response
                let msg = { error: { data: error } };
                set_response[order_number] = (msg);
            });
    }
    catch (error) {
        //console.log(`\n${logMsg} ERROR:\n`, JSON.stringify(error));

    }
    return callback(set_response);
}



exports.insertAlert = async (api_token, result, channel, owner_code, cron_name, cron_id, callback) => {
    let set_response = {};

    if (result.error) {

        let alert_code = constants.DEFAULT_ALERT_CODE;
        common.getAlertCode(cron_name, channel, cron_id, function (result) {
            if (result.error) {
                alert_code = constants.DEFAULT_ALERT_CODE;
            }
            if (result.success) {
                alert_code = result.success.data[0].fby_alert_code;
            }
        })

        let err_data = JSON.stringify(result.error);
        let alert_domain = constants.ALERT_DOMAIN;

        let alert_data = {
            "alertCode": alert_code,
            "alertName": err_data,
            "alertUniqueId": "alert-" + cron_id,
            "alertDomain": alert_domain,
            "ownerCode": owner_code
        }
        let postData = {
            "alerts": [alert_data],
        };

        let axiosConfig = {
            headers: {
                Authorization: `Bearer ${api_token}`,
            },
        };
        // /* Alert insert */
        axios
            .post(
                constants.FBY_ALERTINSERT_URL,
                postData,
                axiosConfig
            )
            .then((response) => {
                set_response["alert"] = response;
                //console.log(response.data);
            })
            .catch((error) => {
                set_response["alert"] = error;
            })


    } else if (result.success) {
        set_response = result.success;
    }
    return callback(set_response);
}

exports.sendAlertToFBY = async (req, res) => {
    let cron_name = "send_alert_to_fby";
    let file_and_method_name = 'commonApiController.js sendAlertToFBY';
    let cron_id = uuid();
    let fby_user_id = req.query.fby_user_id;
    let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;

    try {
        // `${cron_name}-${fby_id}`;
        let jobRunning = ccCache.get(cacheKey_Job);
        if (jobRunning == undefined || !jobRunning || jobRunning == null) {
            ccCache.set(cacheKey_Job, true);
        }
        else {
            let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
            set_response = {
                sucess: {
                    message: msg
                }
            };
            //console.log(msg);
            return set_response;
        }
        //when url hits, it insert the cron details and make status 1 as its running
        let inputs = [req.query.fby_user_id, cron_name, cron_id, 1]
        common.insertCron(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
                //console.log('\n ERROR: ', JSON.stringify(result.error));
            }
        })
        //process url request
        if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
            if (!res.headersSent) {
                res.send(constants.EMPTY);
            }
        } else {
            //get user
            common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
                if (result.error) {
                    //send response
                    if (!res.headersSent) {
                        res.send(result.error);
                    }
                } else {
                    for (const client of result.success.data) {
                        let fby_id = client.fby_user_id;
                        //get shopify account detail
                        common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                            if (result.error) {
                                //send response
                                if (!res.headersSent) {
                                    res.send(result.error);
                                }
                            } else {
                                set_response = {
                                    message: null,
                                };
                                /* account loop start */
                                for (const shopifyAccount of result.success.data) {
                                    /**for each shopifyAccount
                                    */
                                    let fby_user_id = shopifyAccount.fby_user_id;
                                    let alert_response = await fbyService.insertAlertCCLogs(fby_user_id);
                                    set_response.message = alert_response;
                                }
                                /* Shopify account loop end */
                                /**
                                * set time out is required to await to get all the responses from 'pushProductsShopify'
                                */
                                setTimeout(() => {
                                    if (!res.headersSent) {
                                        res.send(set_response);
                                    }
                                }, 15000);
                            }
                        })
                    }
                }
            });
        }
        //after finish update cron status as 0
        res.on('finish', function () {
            let dt = dateTime.create();
            let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
            common.updateCron(inputs, cron_name, cron_id, function (result) {
                if (result.error) {
                    //console.log('\n ERROR: ', JSON.stringify(result.error));
                }
            })
        });
    }
    catch (error) {
        //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
    }
    finally {
        ccCache.del(cacheKey_Job);
    }
}



exports.getCronSchedule = async (req, res) => {
    let fby_user_id = req.query.fby_user_id;
    let cc_operation = req.query.cc_operation;
    try {
        //when url hits, it insert the cron details and make status 1 as its running
        let inputs = [fby_user_id, cc_operation]
        await common.getCronLogs(inputs, function (result) {
            if (result.error) {
                //console.log('\n ERROR: ', JSON.stringify(result.error));
                res.send(result.error);
            } else {

                if (!res.headersSent) {
                    res.send(result);
                }

            }

        })

    }
    catch (error) {
        //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
        res.send(error.message);

    }
}

exports.getLogsByAlertId = async (req, res) => {
    let alertId = req.query.alertId;
    let response = [];
    try {
        //when url hits, it insert the cron details and make status 1 as its running
        let inputs = [alertId];
        await common.getLogsByAlertId(inputs, function (result) {
            if (result.error) {
                //console.log('\n ERROR: ', JSON.stringify(result.error));
                res.send(result.error);
            } else {

                if (!res.headersSent) {
                    let dataObj = null;
                    for (let item of result.success.data) {
                        try {
                            dataObj = JSON.parse(item.data);
                        }
                        catch (error) { 

                        }
                        let alertLogs = {
                            "alert-Id": item.id,
                            "fby_user_id": item.fby_user_id,
                            "order_no": item.order_no,
                            "message": item.message,
                            "data": dataObj ? JSON.stringify(dataObj) : item.data,
                            "fby_alert_code": item.fby_alert_code,
                            "cc_operation": item.cc_operation,
                            "alertSentOn": item.alertSentOn,
                            "alert_Sent_To_FBY_on": item.alertSentOn,
                            "alert_Created_IN_CC_on": item.createdOn

                        }

                        response.push(alertLogs);
                    }
                }

                res.send(response);

            }

        })

    }
    catch (error) {
        //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
        res.send(error.message);

    }
}