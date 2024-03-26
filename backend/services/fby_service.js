const CC_OPERATIONS = require('../server/constants/constants');
const db = require("../startup/db");
const constants = require("../misc/constants");
const db_constants = require("../misc/db_constants");
const request = require("request-promise");
const dateTime = require("node-datetime");
const axios = require("axios");
const helpers = require("../misc/helpers");
const logger = require("../misc/logger");
const server_constants = require("../server/constants/constants");
const common = require("../server/constants/common");
const mail = require("../server/constants/email");
const moment = require("moment");
const dbCCLogs = require('../startup/dbcclogs');

const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const CircularJSON = require('circular-json');
const NodeCache = require("node-cache");
const ccCache = new NodeCache({ stdTTL: 3000, checkperiod: 300 });
const urlencode = require('urlencode');
const Entities = require("../entities/Entities");
const v4 = require('uuid').v4;
let uuid = v4;

/* Get JWT token */
/**
 * getFBYToken() function takes user details,express response,cron name,cron id as parameter and get the JWT token from FBY
 */
exports.getFBYToken = async (res, user, cron_name, cron_id) => {
    let authUsername = user.auth_username;
    let authPassword = user.auth_password;
    let cacheKey = "fby_auth_token";
    let cachedResult = ccCache.get(cacheKey);
    let dbResult = {
        result: null,
    };


    if (cachedResult == undefined || !cachedResult || cachedResult == null) {

        await axios
            .post(server_constants.FBY_TOKEN_URL, {
                username: authUsername,
                password: authPassword,
            })
            .then((response) => {
                try {
                    if (Array.isArray(response.data)) {
                        response.data = response.data[0];
                    }
                } catch (error) {
                    //console.log("ERROR\n ", error.message);
                }
                let api_token = response.data.token;
                dbResult.result = api_token;
                if (api_token && api_token != "" && api_token != null) {
                    ccCache.set(cacheKey, api_token, ((60 * 5))); //cache for 50 minutes
                }
            })
            .catch((error) => {
                dbResult.result = { error: error };
            });
    }
    else {
        dbResult.result = api_token = cachedResult;
    }
    return {
        result: dbResult.result,
    };
};


/* Insert SKU */
/**
 * this function send product details to FBY,update the status of 'product' table to 1 and send a call back as response to channel controller
 */
exports.insertSku = async (api_token, product, exist_cron, cron_name, cron_id) => {
    let details = {
        request: {
            operationId: cron_id
        },
        response: null,
    };
    let set_response = {};
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
    var postData = {
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
            server_constants.FBY_SKUINSERT_URL,
            postData,
            axiosConfig
        )
        .then(async (response) => {
            try {
                if (Array.isArray(response.data)) {
                    response.data = response.data[0];
                }
            } catch (error) {
                //console.log("ERROR\n ", error.message);
            }
            try {
                if (Object.values(response.data.success) == "Ok") {
                    details.response = response.data;
                    let updt_time = dateTime.create();
                    let inputs = [fby_id, sku, cron_name, cron_id, updt_time.format('Y-m-d H:M:S'), product.barcode, product.item_id, product.item_product_id, product.inventory_item_id];
                    await db.execute(
                        db_constants.DB_CONSTANTS_PRODUCT.PRODUCT_SEND_FBY,
                        inputs
                    );
                    //info log
                    logger.logInfo("action " + cron_name, details);
                    // set response 
                    let msg = { success: { message: server_constants.FBY_SKUINSERT_SUCCESS, data: CircularJSON.stringify(response.data) } };
                    set_response[sku] = (msg);
                }
            } catch (error) {
                if (response.data.errors) {
                    details.response = response.data;
                    if (exist_cron) {
                        /* Update products count=count+1 and update error log */
                        let updt_time = dateTime.create();
                        let inputs = [fby_id, sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(response.data.errors), updt_time.format('Y-m-d H:M:S')];
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_CRON.FBY_PRODUCT_ERR_MANAGE,
                            inputs
                        );
                        //log error
                        logger.logError(cron_name + " error", details);
                        //set response
                        let msg = { error: { message: server_constants.FBY_SKUINSERT_ERROR, data: CircularJSON.stringify(response.data.errors) } };
                        set_response[sku] = (msg);
                    } else {
                        let updt_time = dateTime.create();
                        let inputs = [fby_id, sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(response.data.errors), updt_time.format('Y-m-d H:M:S')];
                        /* Update products count=count+1 and flag 1 */
                        await db.execute(
                            db_constants.DB_CONSTANTS_CRON.FBY_PRODUCT_ERR_MANAGE,
                            inputs
                        );
                        //  mail
                        mail.skuInsertMail(cron_name, cron_id, fby_id, CircularJSON.stringify(response.data));
                        //store sku insert response catch log
                        inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(response.data), fby_id];
                        await db.execute(
                            db_constants.DB_CONSTANTS_CRON.CRON_ERROR_LOG,
                            inputs
                        );
                        //log error
                        logger.logError(cron_name + " error", details);
                        //set response
                        let msg = { error: { message: server_constants.FBY_SKUINSERT_ERROR, data: CircularJSON.stringify(response.data.errors) } };
                        set_response[sku] = (msg);
                    }
                }
            }
        })
        .catch(async (error) => {
            details.response = error.response.data;
            if (exist_cron) {
                /* Update products count=count+1 and update error log */
                let updt_time = dateTime.create();
                let inputs = [fby_id, sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(error.response.data), updt_time.format('Y-m-d H:M:S')];
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_CRON.FBY_PRODUCT_ERR_MANAGE,
                    inputs
                );
                //log error
                logger.logError(cron_name + " error", details);
                //set response
                let msg = { error: { data: (error.response.data) } };
                set_response[sku] = (msg);
            } else {
                let updt_time = dateTime.create();
                let inputs = [fby_id, sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(error.response.data), updt_time.format('Y-m-d H:M:S')];
                /* Update products count=count+1 and flag 1 */
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_CRON.FBY_PRODUCT_ERR_MANAGE,
                    inputs
                );

                //mail
                mail.skuInsertMail(cron_name, cron_id, fby_id, CircularJSON.stringify(error.response.data));
                //store sku insert catch log
                inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(error.response.data), fby_id];
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_CRON.CRON_ERROR_LOG,
                    inputs
                );
                //log error
                logger.logError(cron_name + " error", details);
                //set response
                let msg = { error: { data: (error.response.data) } };
                set_response[sku] = msg;
            }

        });

    return set_response;
}


/* Get FBY Stock */
/**
 * this function get the Stocks from FBY,store in 'temp_master_inventory'. 
 * then update new quantity in product table and send a call back as response to channel controller.
 */
exports.getStockList = async (api_token, client, req, exist_cron, fby_id, cron_name, cron_id) => {
    cron_name = server_constants.CC_OPERATIONS.GET_STOCK_FROM_FBY;
    let file_and_method_name = 'fby_service.js getStockList';
    let fby_user_id = fby_id;
    let url = server_constants.FBY_STOCKLIST_URL;
    let details = {
        request: {
            operationId: cron_id
        },
        response: null,
    };
    let set_response = {};
    let page = 0;
    var total_page = 0;
    let total_items = 0;
    var count = 1;
    var updated_at = moment();
    updated_at = updated_at.subtract(2, "days");
    updated_at = updated_at.format(MOMENT_DATE_FORMAT);

    let ownerCode = client.owner_code;
    let groupCode = client.group_code;
    let item_per_page = server_constants.FBY_PERPAGE;
    let items = [];

    if (req.query.updated_after) {
        updated_at = req.query.updated_after;
    }
    if (req.query.item_per_page) {
        item_per_page = req.query.item_per_page;
    }

    //##todo
    var startat = moment('2023-06-08 18:30:00');
    updated_at = moment();
    var duration = moment.duration(updated_at.diff(startat));
    var hours = duration.asHours();
    // //console.log('stock startat: ', startat.format(MOMENT_DATE_FORMAT));
    // //console.log('stock updated_at: ', updated_at.format(MOMENT_DATE_FORMAT));
    if (hours > 2) {
        updated_at = updated_at.subtract(1, "hours");
    }
    else {
        updated_at = startat;
    }
    //console.log('stock updateafter: ', updated_at.format(MOMENT_DATE_FORMAT));
    let updated_at_before_encoded = updated_at.format(MOMENT_DATE_FORMAT);
    updated_at = urlencode(updated_at.format(MOMENT_DATE_FORMAT));

    try {
        await common.getLastSyncOperationTime(fby_user_id, cron_name, function (result) {
            if (result != undefined && result != null && result.success && result.success.data.length > 0) {
                if (updated_at = result.success.data[0].last_opearion_sync_time) {
                    updated_at = result.success.data[0].last_opearion_sync_time;
                    updated_at = moment(updated_at).format(MOMENT_DATE_FORMAT);
                    updated_at_before_encoded = updated_at;
                    // updated_at = urlencode(updated_at);
                }
            }
            req.query.updated_after = updated_at;
        });
    } catch (error) {
        //console.log("\n Error while getting last sync operation time: \n", error.message);
    }
    let params = null;

    if (fby_user_id == 50 || fby_user_id == 37
    ) {
        updated_at = '2023-06-01 00:00:00';
        req.query.updated_after = updated_at;
    }

    do {
        page++;
        params = {
            channelGroupCode: groupCode,
            updatedAfter: updated_at,
            itemsPerPage: item_per_page,
            page: page,
            fby_user_id: fby_user_id
        };

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

                            total_page = response.data.incrementalStock.totalPages || 0;
                            total_items = response.data.incrementalStock.totalItems || 0;
                            //console.log(`\nAPI Call COMPLTETED Page ${page}/${total_page})\ttotal_items ${total_items}\t-----------------\tfby_user_id ${fby_user_id},\tupdated_at <${updated_at}>\t${moment().format(MOMENT_DATE_FORMAT)}`);
                            //console.log(`${file_and_method_name}`);
                            //console.log(JSON.stringify({ url, params }));
                            //console.log('\n');
                        }
                        catch (error) {
                            //console.log('error: ', error);
                        }

                        if (Object.keys(response.data) == "errors") {
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
                                        '',
                                        '',
                                        server_constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                                        CircularJSON.stringify(reqres),
                                        server_constants.LOG_LEVEL.ERROR,
                                        server_constants.FBY_ALERT_CODES.STOCK_SYNC,
                                        server_constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
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
                                        '',
                                        '',
                                        server_constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                                        CircularJSON.stringify(reqres),
                                        server_constants.LOG_LEVEL.INFO,
                                        server_constants.FBY_ALERT_CODES.STOCK_SYNC,
                                        server_constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
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

                            // add to temp_master_inventory !
                            items = response.data.incrementalStock.items.map(item => {
                                return item;
                            });
                            details.response = "total incrementalStock items= " + items.length;
                            //info log
                            logger.logInfo("action " + cron_name, details);
                            if (items !== undefined && items.length > 0) {
                                for (let item of items) {
                                    counter++;
                                    let item_arr = [item.skuId, item.skuCode, item.ean, item.quantity, item.priority, cron_id];
                                    await helpers.sleep();
                                    await common.addStock(item_arr, fby_id, cron_name, cron_id, (result) => {
                                        if (result.error) {
                                            //mail
                                            mail.addStockErrMail(cron_name, cron_id, fby_id, CircularJSON.stringify(result.error.data));
                                            // store add stock error log
                                            let inputs = [cron_name, cron_id, server_constants.QUERY_TYPE, CircularJSON.stringify(result.error), fby_id];
                                            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                                if (result.error) {
                                                    mail.cronLogErrMail(cron_name, cron_id, fby_id, CircularJSON.stringify(result.error.data));
                                                }
                                            });
                                        }
                                    });
                                };
                            }
                            total_page = response.data.incrementalStock.totalPages;
                        }



                    } catch (error) {
                        //console.log('error: ', error);
                    }

                }
            })
            .catch(async (error) => {
                details.response = error.response;
                if (exist_cron) {
                    let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(error.response.data), fby_id, exist_cron];
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                        inputs
                    );
                    //log error
                    logger.logError(cron_name + " error", details);
                    //send response
                    let msg = { error: { message: server_constants.FBY_GETSTOCK_ERROR, data: CircularJSON.stringify(error.response.data) } };
                    set_response[client.domain] = msg;
                } else {
                    //mail
                    mail.stockListMail(cron_name, cron_id, fby_id, CircularJSON.stringify(error.response.data));
                    //store update product status error log
                    let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(error.response.data), fby_id, exist_cron];
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                        inputs
                    );
                    //log error
                    logger.logError(cron_name + " error", details);
                    //send response
                    let msg = { error: { message: server_constants.FBY_GETSTOCK_ERROR, data: CircularJSON.stringify(error.response.data) } };
                    set_response[client.domain] = msg;
                }
            });
    } while (page <= total_page)

    if (count > 1) {
        set_response = { success: { data: server_constants.FBY_GETSTOCK_SUCCESS, items: items } };
    }
    await common.updateLastSyncOperationTime(fby_user_id, null, cron_name, function (result) {
        if (result != null && result.error) {
            //console.log("Failed to update sync time in the database");
        }
    });
    // update product Quantity
    let updt_time = dateTime.create();
    let inputs = [cron_name, cron_id, updt_time.format('Y-m-d H:M:S'), fby_id];
    await db.execute(
        db_constants.DB_CONSTANTS_PRODUCT.SET_NEW_QUANTITY,
        inputs
    );

    return set_response;
};

/* Insert Order */
/**
 * this function send order details to FBY,update the status of 'order_masters' table to 1.
 */
exports.insertOrder = async (api_token, order, exist_cron, cron_name, cron_id) => {
    let details = {
        request: {
            operationId: cron_id
        },
        response: null,
    };
    let set_response = {};

    let order_number = order.order_no;
    let fby_id = order.fby_user_id;
    //getting all line items details having same order number
    var { variables, result } = await db.execute(
        db_constants.DB_CONSTANTS_ORDER.GET_UNSEND_ORDER_LINEITEMS,
        [fby_id, order_number]
    );

    if (result != undefined && result != null && result.length > 0) {

        //let order_data = result.success.data;

        let order_data = result;
        let IsCheckAfter48Hours = order_data[0].IsCheckAfter48Hours || 0;
        let currDateTime = new Date();
        let orderCheckDate = new Date(order_data[0].checked_at || currDateTime);
        let diffHours = (currDateTime - orderCheckDate) / 3600000;
        if (orderCheckDate == null || IsCheckAfter48Hours == 0 || diffHours > server_constants.PAYMENT_ERROR_RETRY_AFTER_HOURS) {
            let products = order_data.map((orderdetail) => {
                let barcode = "";
                if (orderdetail.barcode) {
                    barcode = orderdetail.barcode;
                }
                let products_new = {
                    code: orderdetail.sku,
                    ean: barcode,
                    quantity: orderdetail.quantity_purchased,
                    itemPriceTotal: parseFloat(orderdetail.item_total_price),
                    shippingContributionPriceTotal: parseFloat(orderdetail.item_total_ship_price),
                };
                return products_new;
            })
            let phone_no = "";
            if (order.ship_phone_number) {
                phone_no = order.ship_phone_number;
            }
            let customerShipment = {
                fullName: order.recipient_name,
                company: order.ship_company,
                address: order.ship_address_1,
                postalCode: order.ship_postal_code,
                city: order.ship_city,
                province: order.ship_state_code,
                nation: order.ship_country,
                codeNation: order.ship_country_code,
                phone: phone_no,
                email: order.buyer_email,
                alias: (order.recipient_name !== undefined ? order.recipient_name.split(" ").join("") : ''),
            };
            let payment_method = server_constants.DEFAULT_PAYMENT_METHOD;

            let promise = new Promise(async function (resolve, reject) {
                //get maped payment method code
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_MAP_CODES.GET_PAYMENT_METHOD,
                    [order.payment_method, order.channel]
                );
                if (result.length > 0) {
                    resolve(payment_method = variables.fby_payment_method);
                }
            });

            promise.then(async () => {
                let payment = {
                    paymentMethodCode: payment_method,
                    paymentDate: order.payment_date,
                    paymentTransactionId: order.payment_transaction_id,
                    paymentAmount: parseFloat(order.total_order),
                };
                let ordersInsert_data = {
                    "managedByChannel": false,
                    "ownerCode": order.owner_code,
                    "channelOrderId": (order.channel.toLowerCase().includes("presta") == true ? order.seller_order_id.toString() : order.order_no.toString()),
                    "channelCode": order.channel_code,
                    "orderDate": order.purchase_date,
                    "currencyCode": order.currency_code,
                    "products": products,
                    "customerShipment": customerShipment,
                    "customerInvoice": customerShipment,
                    "payment": payment,
                    "channelCredentialId": parseInt(order.fby_user_id),
                };
                var postData = {
                    ordersInsert: [ordersInsert_data],
                };

                let axiosConfig = {
                    headers: {
                        Authorization: `Bearer ${api_token}`,
                    },
                };
                //calling fby api to insert new order
                await axios
                    .post(
                        server_constants.FBY_ORDERINSERT_URL,
                        postData,
                        axiosConfig
                    )
                    .then(async (response) => {
                        try {
                            try {
                                if (Array.isArray(response.data)) {
                                    response.data = response.data[0];
                                }
                            } catch (error) {
                                //console.log("ERROR\n ", error.message);
                            }
                            let errorAlreadyEisits = response.data != undefined && response.data.errors != undefined ?
                                CircularJSON.stringify(response.data.errors) : '';

                            let isPaymentMethodEnabledError = errorAlreadyEisits.toLowerCase().includes(server_constants.PAYMENT_ERROR_METHOD_NOT_ENABLED);
                            let isPaymentDateNullError = errorAlreadyEisits.toLowerCase().includes(server_constants.PAYMENT_ERROR_PAYMENT_DATE_NULL);
                            let isFbyOrderAlreadyExists = errorAlreadyEisits.includes(server_constants.FBY_ORDER_ALREADY_EXISTS);
                            let isNoPaymentMethodError = errorAlreadyEisits != '' && ((isPaymentMethodEnabledError || isPaymentDateNullError) ? true : false);

                            if (response.data.success
                                || (errorAlreadyEisits != '' && isFbyOrderAlreadyExists)
                                || (errorAlreadyEisits != '' && isPaymentMethodEnabledError)
                                || (errorAlreadyEisits != '' && isPaymentDateNullError)
                            ) {
                                details.response = response.data;
                                let updt_time = dateTime.create();

                                let inputs = [fby_id, order_number, cron_name, cron_id, updt_time.format('Y-m-d H:M:S'), updt_time.format('Y-m-d H:M:S'), isNoPaymentMethodError];
                                await db.execute(
                                    db_constants.DB_CONSTANTS_ORDER.UPDATE_ORDER_SEND_FBY,
                                    inputs
                                );
                                //info log
                                logger.logInfo("action " + cron_name, details);
                                // set response 
                                let msg = { success: { message: server_constants.FBY_ORDERINSERT_SUCCESS, data: CircularJSON.stringify(response.data) } };
                                set_response[order_number] = (msg);
                            } else if (response.data.errors) {
                                details.response = response.data;
                                if (exist_cron) {
                                    /* Update order_master count=count+1 and update error log */
                                    let updt_time = dateTime.create();
                                    let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(response.data.errors), updt_time.format('Y-m-d H:M:S')];
                                    var { variables, result } = await db.execute(
                                        db_constants.DB_CONSTANTS_CRON.FBY_ORDER_ERR_MANAGE,
                                        inputs
                                    );
                                    //log error
                                    logger.logError(cron_name + " error", details);
                                    //set response
                                    let msg = { error: { message: server_constants.FBY_ORDERINSERT_ERROR, data: CircularJSON.stringify(response.data.errors) } };
                                    set_response[order_number] = (msg);
                                } else {
                                    let updt_time = dateTime.create();
                                    let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(response.data.errors), updt_time.format('Y-m-d H:M:S')];
                                    /* Update order_master count=count+1 and flag 1 */
                                    var { variables, result } = await db.execute(
                                        db_constants.DB_CONSTANTS_CRON.FBY_ORDER_ERR_MANAGE,
                                        inputs
                                    );
                                    //  mail
                                    mail.orderInsertMail(cron_name, cron_id, fby_id, CircularJSON.stringify(response.data));
                                    //store order insert response catch log
                                    inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(response.data), fby_id];
                                    var { variables, result } = await db.execute(
                                        db_constants.DB_CONSTANTS_CRON.CRON_ERROR_LOG,
                                        inputs
                                    );
                                    //log error
                                    logger.logError(cron_name + " error", details);
                                    //set response
                                    let msg = { error: { message: server_constants.FBY_ORDERINSERT_ERROR, data: CircularJSON.stringify(response.data.errors) } };
                                    set_response[order_number] = (msg);
                                }
                            }
                        } catch (error) {
                            details.response = error.stack;
                            //log error
                            logger.logError(cron_name + " error", details);
                        }
                    })
                    .catch(async (error) => {
                        details.response = error.response.data;
                        if (exist_cron) {
                            /* Update order_master count=count+1 and update error log */
                            let updt_time = dateTime.create();
                            let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(error.response.data), updt_time.format('Y-m-d H:M:S')];
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.FBY_ORDER_ERR_MANAGE,
                                inputs
                            );
                            //log error
                            logger.logError(cron_name + " error", details);
                            //set response
                            let msg = { error: { data: CircularJSON.stringify(error.response.data) } };
                            set_response[order_number] = (msg);
                        } else {
                            let updt_time = dateTime.create();
                            let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(error.response.data), updt_time.format('Y-m-d H:M:S')];
                            /* Update order_master count=count+1 and flag 1 */
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.FBY_ORDER_ERR_MANAGE,
                                inputs
                            );

                            //mail
                            mail.orderInsertMail(cron_name, cron_id, fby_id, CircularJSON.stringify(error.response.data));
                            //store order insert catch log
                            inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(error.response.data), fby_id];
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.CRON_ERROR_LOG,
                                inputs
                            );
                            //log error
                            logger.logError(cron_name + " error", details);
                            //set response
                            let msg = { error: { data: CircularJSON.stringify(error.response.data) } };
                            set_response[order_number] = msg;
                        }

                    });
            });
        }
    } else {
        details.response = {
            fby_user_id: fby_id,
            query_action: constants.CUSTOM_MESSAGES.GET_ORDER_DETAIL
        };
        //log error
        logger.logError(cron_name + " error", details);
        //set response
        let msg = { error: { message: server_constants.FBY_ORDERINSERT_ERROR, data: details } };
        set_response[order_number] = (msg);
    }

    return set_response;
}

/* Insert Canceled Order */
/**
 * this function send canceled order details to FBY,update the cancel status of 'order_deails' and 'order_masters' table to 1.
 */
exports.insertCanceledOrder = async (api_token, order, exist_cron, cron_name, cron_id,) => {
    let details = {
        request: {
            operationId: cron_id
        },
        response: null,
    };
    let set_response = {};

    let order_number = order.order_no;
    let fby_id = order.fby_user_id;
    let cancel_reason = server_constants.DEFAULT_cancel_reason;

    //get maped cancel reason
    var { variables, result } = await db.execute(
        db_constants.DB_CONSTANTS_MAP_CODES.GET_CANCEL_REASON,
        [order.cancel_reason, order.channel]
    );

    if (result.length > 0) {
        cancel_reason = variables.fby_cancel_reason;
    }
    let canceled_order_data = {
        "channelOrderId": (order.channel.toLowerCase().includes("presta") ? order.seller_order_id.toString() : order.order_no.toString()),
        "skuCode": order.sku,
        "eanCode": order.barcode,
        "cancellationReasonCode": cancel_reason,
        "ownerCode": order.owner_code,
        // "channelCredentialId": parseInt(order.fby_user_id),
    }

    var postData = {
        "ordersDelete": [canceled_order_data],
    };

    let axiosConfig = {
        headers: {
            Authorization: `Bearer ${api_token}`,
        },
    };
    //calling fby api to insert new order
    await axios
        .post(
            server_constants.FBY_CANCELED_ORDER_URL,
            postData,
            axiosConfig
        )
        .then(async (response) => {
            try {
                if (Array.isArray(response.data)) {
                    response.data = response.data[0];
                }
            } catch (error) {
                //console.log("ERROR\n ", error.message);
            }
            try {
                if (response.data.success) {
                    details.response = response.data;
                    let updt_time = dateTime.create();
                    let inputs = [fby_id, order_number, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];
                    await db.execute(
                        db_constants.DB_CONSTANTS_ORDER.UPDATE_CANCEL_ORDER_SENT,
                        inputs
                    );
                    //info log
                    logger.logInfo("action " + cron_name, details);
                    // set response 
                    let msg = { success: { message: server_constants.FBY_CANCELED_ORDERINSERT_SUCCESS, data: CircularJSON.stringify(response.data) } };
                    set_response[order.sku] = (msg);
                } else if (response.data.errors) {
                    details.response = response.data;
                    if (exist_cron) {
                        /* Update order_master count=count+1 and update error log */
                        let updt_time = dateTime.create();
                        let inputs = [fby_id, order_number, order.sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(response.data.errors), updt_time.format('Y-m-d H:M:S')];
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_CRON.FBY_CANCEL_ORDER_ERR_MANAGE,
                            inputs
                        );
                        //log error
                        logger.logError(cron_name + " error", details);
                        //set response
                        let msg = { error: { message: server_constants.FBY_CANCELED_ORDERINSERT_ERROR, data: CircularJSON.stringify(response.data.errors) } };
                        set_response[order.sku] = (msg);
                    } else {
                        let updt_time = dateTime.create();
                        let inputs = [fby_id, order_number, order.sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(response.data.errors), updt_time.format('Y-m-d H:M:S')];
                        /* Update products count=count+1 and flag 1 */
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_CRON.FBY_CANCEL_ORDER_ERR_MANAGE,
                            inputs
                        );
                        //  mail
                        mail.cancelOrderInsertMail(cron_name, cron_id, fby_id, CircularJSON.stringify(response.data));
                        //store sku insert response catch log
                        inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(response.data), fby_id];
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_CRON.CRON_ERROR_LOG,
                            inputs
                        );
                        //log error
                        logger.logError(cron_name + " error", details);
                        //set response
                        let msg = { error: { message: server_constants.FBY_CANCELED_ORDERINSERT_ERROR, data: CircularJSON.stringify(response.data.errors) } };
                        set_response[order.sku] = (msg);
                    }
                }
            } catch (error) {
                //console.log(CircularJSON.stringify(error));
            }
        })
        .catch(async (error) => {
            details.response = error.response.data;
            if (exist_cron) {
                /* Update products count=count+1 and update error log */
                let updt_time = dateTime.create();
                let inputs = [fby_id, order_number, order.sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(error.response.data), updt_time.format('Y-m-d H:M:S')];
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_CRON.FBY_CANCEL_ORDER_ERR_MANAGE,
                    inputs
                );
                //log error
                logger.logError(cron_name + " error", details);
                //set response
                let msg = { error: { data: CircularJSON.stringify(error.response.data) } };
                set_response[order.sku] = (msg);
            } else {
                let updt_time = dateTime.create();
                let inputs = [fby_id, order_number, order.sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(error.response.data), updt_time.format('Y-m-d H:M:S')];
                /* Update products count=count+1 and flag 1 */
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_CRON.FBY_CANCEL_ORDER_ERR_MANAGE,
                    inputs
                );

                //mail
                mail.cancelOrderInsertMail(cron_name, cron_id, fby_id, CircularJSON.stringify(error.response.data));
                //store sku insert catch log
                inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(error.response.data), fby_id];
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_CRON.CRON_ERROR_LOG,
                    inputs
                );
                //log error
                logger.logError(cron_name + " error", details);
                //set response
                let msg = { error: { data: CircularJSON.stringify(error.response.data) } };
                set_response[order.sku] = msg;
            }

        });


    return set_response;
}

/* Get FBY Stock */
/**
 * this function get the Stocks from FBY,store in 'temp_master_inventory'. 
 * then update new quantity in product table.
 */
exports.getTrackList = async (api_token, fby_id, order_no, exist_cron, cron_name, cron_id) => {
    let details = {
        request: {
            operationId: cron_id
        },
        response: null,
    };
    let set_response = {};
    let page = 1;
    var total_page = 0;
    var count = 1;
    let items = [];
    do {
        await axios({
            url: server_constants.FBY_NOTIFY_ORDER_URL,
            method: "get",
            headers: {
                Authorization: `Bearer ${api_token}`,
            },
            params: {
                //channelOrderId: order_no,//for perticular record
                // channelOrderId: "LVPWGJROV",//for perticular record
                ownerCode: order_no,
                itemsPerPage: server_constants.FBY_PERPAGE,
                page: page++,
            },
        })
            .then(async (response) => {
                if (response.data != undefined && response.data) {
                    try {

                        if (Object.keys(response.data) == "errors") {
                            details.response = response.data;
                            //log error
                            logger.logError(cron_name + " error", details);
                            //mail
                            mail.trakListMail(cron_name, cron_id, fby_id, CircularJSON.stringify(response.data));
                            set_response = { error: { "key": fby_id, data: response.data } };
                        } else if (Object.keys(response.data) == "notifiableOrders") {
                            count++;
                            // add to temp_master_inventory !
                            items = response.data.notifiableOrders.items.map(item => {
                                return item;
                            });

                            details.response = "total notifiableOrders items= " + items.length;
                            //info log
                            logger.logInfo("action " + cron_name, details);

                            if (items !== undefined && items.length > 0) {
                                for await (const item of items) {
                                    let traking = "";
                                    let shipmentDate = "";
                                    let carrier = "";
                                    let ship_url = "";
                                    let isReturn = "";
                                    if (item.shippings && item.shippings[0].tracking) {
                                        traking = item.shippings[0].tracking;
                                        shipmentDate = item.shippings[0].shipmentDate;
                                        carrier = item.shippings[0].carrier;
                                        ship_url = item.shippings[0].url;
                                        isReturn = item.shippings[0].isReturn;

                                        let updt_time = dateTime.create();
                                        let item_arr = [cron_name, cron_id, updt_time.format('Y-m-d H:M:S'), traking, carrier, ship_url, item.channelOrderId, item.channelCode, item.channelOrderLineId || '', fby_id];

                                        var { variables, result } = await db.execute(
                                            db_constants.DB_CONSTANTS_ORDER.UPDATE_ORDER_TRACK_NO,
                                            item_arr
                                        );
                                        //console.log(db_constants.DB_CONSTANTS_ORDER.UPDATE_ORDER_TRACK_NO,item_arr);
                                        //console.log('result: ', result);
                                    }
                                }
                            }
                            total_page = response.data.notifiableOrders.totalPages;
                        }

                    } catch (error) {
                        details.response = error.stack;
                        //log error
                        logger.logError(cron_name + " error", details);
                    }
                }

            })
            .catch(async (error) => {
                details.response = error.response.data;
                if (exist_cron) {
                    let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(error.response.data), fby_id, exist_cron];
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                        inputs
                    );
                    //log error
                    logger.logError(cron_name + " error", details);
                    //send response
                    let msg = { error: { data: CircularJSON.stringify(error.response.data) } };
                    set_response[order_no] = msg;
                } else {
                    //mail
                    mail.trakListMail(cron_name, cron_id, fby_id, CircularJSON.stringify(error.response.data));
                    //store update product status error log
                    let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, CircularJSON.stringify(error.response.data), fby_id, exist_cron];
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                        inputs
                    );
                    //log error
                    logger.logError(cron_name + " error", details);
                    //send response
                    let msg = { error: { data: CircularJSON.stringify(error.response.data) } };
                    set_response[order_no] = msg;
                }
            });
    } while (page <= total_page)

    if (count > 1) {
        if (items.length > 0) {
            set_response[order_no] = { success: { data: server_constants.FBY_GETTRACK_SUCCESS, items: items } };
        } else {
            set_response[order_no] = { success: { data: server_constants.FBY_GETTRACK_SUCCESS, message: "Tracking not Set", items: items } };
        }

    }

    return set_response;
};

exports.changeOrderStatus = async (api_token, order, exist_cron, cron_name, cron_id) => {

    let fby_user_id = 0;
    let order_number = '';
    let sku = '';
    let ean = '';
    let logMessage = '';
    let set_response = {};
    let isAlreadyNotified = true;
    let fby_alert_code = server_constants.FBY_ALERT_CODES.NOTIFY;
    cron_name = server_constants.CC_OPERATIONS.PUSH_TRAKING_NOTIFICATION_TO_FBY;
    try {

        let details = {
            request: {
                operationId: cron_id
            },
            response: null,
        };

        if (order == null) {
            //console.log(`\nchangeStatusOrder fby_user_id ${fby_user_id}, NULL order`);
            return details;

        }


        let orderDetails = null;
        if (Array.isArray(order) && order[0] != null && order[0] != undefined && order[0].hasOwnProperty('order_no')) {
            orderDetails = order[0];
            order = orderDetails;
            order_number = order.order_no;

        }

        fby_user_id = order != null && order != undefined && order.fby_user_id != undefined ? order.fby_user_id : 0;
        order_number = order != null && order != undefined && order.order_no != undefined ? order.order_no : '';
        sku = order != null && order != undefined && order.sku != undefined ? order.sku : '';
        let client = null;
        await common.shopifyUserDetail(fby_user_id, cron_name, cron_id, function (result) {
            client = result.success.data[0];
        });

        if (client.orderSync != 1) {
            set_response["message"] = "Order Notification not enabled for this client.";
            return set_response;
        }

        if (api_token == undefined || api_token == null || api_token == '') {
            api_token = await this.get_fby_token_from_fby_user_id(fby_user_id);
        }

        if (order != undefined && order != null
            && order.order_no != undefined && order.order_no != null && order_number != ''
            && order.sku != undefined && order.sku != null && sku != ''
            //&& order.order_line_item_id != undefined && order.order_line_item_id != null
            && fby_user_id > 0
            && order.original_Channel_OrderId != undefined
            && order.original_Channel_OrderId != null
            && order.original_Channel_OrderId != ''
        ) {
            order_number = order.order_no;
            sku = order.sku;
            logMessage = `fby_user_id: ${fby_user_id}, order_no: ${order.order_no}, sku: ${order.sku}, ${server_constants.CC_OPERATIONS.PUSH_TRAKING_NOTIFICATION_TO_FBY}`;
            //console.log('\n', logMessage);

            let { variables, result } = await db.execute(
                db_constants.DB_CONSTANTS_ORDER.IS_ORDER_NOTIFIED,
                [fby_user_id, order_number, sku, order.original_Channel_OrderId],
                null,
                false

            );
            if (variables == undefined
                || variables == null
                || variables.IsNotifiedFBY == undefined) {
                await logger.LogForAlert(
                    fby_user_id,
                    order_number != undefined ? order_number : '',
                    sku != undefined ? sku : '',
                    `${logMessage}, Order not notified to channel yet.`,
                    order,
                    server_constants.LOG_LEVEL.URGENT,
                    fby_alert_code,
                    cron_name,
                    cron_id,
                    false
                );
                return;
            }

            if (variables != undefined
                && variables != null
                && variables.IsNotifiedFBY != undefined
            ) {
                isAlreadyNotified = (variables.IsNotifiedFBY == 1);
                order.order_line_item_id = variables.order_line_item_id;
            }

            if (variables != undefined
                && variables != null
                && variables.barcode != undefined
                && variables.barcode != null
                && variables.barcode != ''
                && (order.barcode == undefined || order.barcode == null || order.barcode == '')
            ) {
                order.barcode = variables.barcode
            }

            set_response = {
                fby_user_id: fby_user_id,
                order_no: order.order_no,
                sku: sku,
                isAlreadyNotified: isAlreadyNotified,
            };
            let changeStatusOrder = [
                {
                    "channelOrderId": order.original_Channel_OrderId,
                    "products": [
                        {
                            "code": order.sku,
                            "ean": order.barcode,
                            "statusCode": "NOT",
                            "note": "Notified"
                        }
                    ]
                }
            ];

            var postData = {
                changeStatusOrder
            };

            let axiosConfig = {
                headers: {
                    Authorization: `Bearer ${api_token}`,
                },
            };


            let apiRequest = {
                url: server_constants.FBY_ORDERSTATUSCHANGE,
                method: "post",
                headers: {
                    Authorization: `Bearer ${api_token}`,
                },
                body: changeStatusOrder,
                json: true,
            };
            let apiRequestResponse = {
                fby_user_id: fby_user_id,
                request: apiRequest,
                response: {
                    data: null
                }
            };

            if (
                variables != undefined
                && variables != null
                && variables.status != undefined
                && (variables.status == 1 || variables.status == true)
                && isAlreadyNotified == false
            ) {
                //calling fby api to change order status
                await axios.post(
                    server_constants.FBY_ORDERSTATUSCHANGE,
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
                            set_response['data'] = response.data;

                            if (response.data.success) {
                                logMessage = `${logMessage}, Order Notification SUCCESS`;
                                //console.log(`\n${logMessage}`, CircularJSON.stringify(response.data.success));

                                try {

                                    let { variables, result } = await db.execute(
                                        db_constants.DB_CONSTANTS_ORDER.UPDATE_ORDER_NOTIFIED,
                                        [fby_user_id, order_number, sku, order.order_line_item_id]
                                    );

                                    await logger.LogForAlert(
                                        fby_user_id,
                                        order_number != undefined ? order_number : '',
                                        sku != undefined ? sku : '',
                                        logMessage,
                                        apiRequestResponse,
                                        server_constants.LOG_LEVEL.INFO,
                                        fby_alert_code,
                                        cron_name,
                                        cron_id,
                                        false
                                    );

                                }
                                catch (error) {
                                    //console.log(`\nERROR While ${logMessage}: \n`, JSON.stringify(error));

                                }
                            }
                            if (response.data.errors) {
                                logMessage = `${logMessage}, Order Notification rejected by FBY`;
                                //console.log(`\n${logMessage}`, CircularJSON.stringify(response.data));


                                try {
                                    await logger.LogForAlert(
                                        fby_user_id,
                                        order_number != undefined ? order_number : '',
                                        sku != undefined ? sku : '',
                                        logMessage,
                                        logData,
                                        server_constants.LOG_LEVEL.ERROR,
                                        fby_alert_code,
                                        server_constants.CC_OPERATIONS.PUSH_TRAKING_NOTIFICATION_TO_FBY,
                                        cron_id
                                    );

                                }
                                catch (error) {
                                    //console.log(`\nERROR While ${logMessage}: \n`, JSON.stringify(error));

                                }
                            }

                            //do nothing
                        } catch (error) {

                            apiRequestResponse.response.data = JSON.parse(JSON.stringify(error));
                            let logData = JSON.stringify(apiRequestResponse);

                            logMessage = `${logMessage}, Order Notification FAILED, ${error.message}`;
                            //console.log(`\n${logMessage}`);

                            try {
                                await logger.LogForAlert(
                                    fby_user_id,
                                    order_number != undefined ? order_number : '',
                                    sku != undefined ? sku : '',
                                    logMessage,
                                    logData,
                                    server_constants.LOG_LEVEL.URGENT,
                                    fby_alert_code,
                                    cron_name,
                                    cron_id,
                                    false
                                );

                            }
                            catch (error) {
                                //console.log(`\nERROR While ${logMessage}: \n`, JSON.stringify(error));

                            }
                        }
                    })
                    .catch(async (error) => {
                        apiRequestResponse.response.data = JSON.parse(JSON.stringify(error));
                        let logData = JSON.stringify(apiRequestResponse);

                        logMessage = `${logMessage}, Order Notification FAILED, ${error.message}`;
                        //console.log(`\n${logMessage}`);

                        try {
                            await logger.LogForAlert(
                                fby_user_id,
                                order_number != undefined ? order_number : '',
                                sku != undefined ? sku : '',
                                logMessage,
                                logData,
                                server_constants.LOG_LEVEL.ERROR,
                                fby_alert_code,
                                cron_name,
                                cron_id
                            );

                        }
                        catch (error) {
                            //console.log(`\nERROR While ${logMessage}: \n`, JSON.stringify(error));

                        }

                    });
            }
            else {
                try {
                    await logger.LogForAlert(
                        fby_user_id,
                        order_number != undefined ? order_number : '',
                        sku != undefined ? sku : '',
                        `${logMessage}, Already Notified to FBY`,
                        order,
                        server_constants.LOG_LEVEL.URGENT,
                        fby_alert_code,
                        cron_name,
                        cron_id,
                        false
                    );

                }
                catch (error) {
                    //console.log(`\nERROR While ${logMessage}: \n`, JSON.stringify(error));

                }
            }
        }

    }
    catch (error) {
        //console.log(`\nfby_user_id ${fby_user_id}, order_number ${order_number}, changeOrderStatus \n`, JSON.stringify(error.message));
    }
    return set_response;
}

/* send an alert */
/**
 * this function send alert to fby
 */
exports.insertAlert = async (api_token, responce, channel, owner_code, cron_name, cron_id) => {
    let set_response = {};

    if (responce.error) {

        let alert_code = server_constants.DEFAULT_ALERT_CODE;
        //get maped alert codes
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_MAP_CODES.GET_ALERT_CODE,
            [cron_name, channel]
        );
        let isEmpty = (helpers.isEmpty(result)
            && helpers.isEmpty(result[0]));

        if (result.length > 0) {
            alert_code = variables.fby_alert_code;
        }

        let err_data = CircularJSON.stringify(responce.error);
        let alert_domain = server_constants.ALERT_DOMAIN;

        let alert_data = {
            "alertCode": alert_code,
            "alertName": err_data,
            "alertUniqueId": "alert-" + cron_id,
            "alertDomain": alert_domain,
            "ownerCode": owner_code
        }
        var postData = {
            "alerts": [alert_data],
        };

        let axiosConfig = {
            headers: {
                Authorization: `Bearer ${api_token}`,
            },
        };
        // /* Alert insert */
        await axios
            .post(
                server_constants.FBY_ALERTINSERT_URL,
                postData,
                axiosConfig
            )
            .then((response) => {
                set_response["message"] = response.data;
            })
            .catch((error) => {
                set_response["message"] = error;
            })
    } else {
        set_response = responce;
    }
    return set_response;
}

/* send an alert to FBY from db logs */
/**
 * this function send alert to fby
 */
exports.insertAlertCCLogs = async (fby_user_id, isTest = false) => {
    let set_response = {};
    let fby_api_token = "";
    let logsAletsFromDB = [];
    var sucessAlertIds = [];
    let cron_name = "send_alert_to_fby";
    let cron_id = uuid();
    let cacheKey_FBYUSER = `${constants.CACHE_KEYS.FBYUSER}-${fby_user_id}`;
    let resultLogs = "";
    //get maped alert codes
    try {
        await dbCCLogs.executeCCLogs(
            db_constants.DB_CONSTANTS_CCLOGS.GET,
            [fby_user_id],
            function (result) {
                if (result != null && result.error) {
                    //console.log("Failed to get logs from the database");
                } else if (result != null && result.success != null && result.success.data != null) {
                    resultLogs = result.success.data;
                }
            }
        );
        if (isTest) {
            let testData = {
                "id": 52375,
                "fby_user_id": 50,
                "order_no": "2522489356-A",
                "message": "TESTING ALERT Ordine 2522489356-A non importato per dati obbligatori mancanti",
                "data": "[\"Manor CH\",\"MNCH\",\"YT\",50,65,\"2522489356-A\",\"2522489356\",\"2023-10-08 14:43:19\",null,\"Manuela Bernasconi\",\"\",\"\",\"\",\"\",\"\",\"\",null,\"\",\"\",\"\",85,1,85,0,0,0,\"2522489356\",\"creditcard\",\"CHF\",\"manuela_bernasconi@bluewin.ch\",\"rga16o6ak00.b0dtpvwfi@notification.mirakl.net\",\"Manuela Bernasconi\",\"2522489356\",\"PAY_ON_ACCEPTANCE\",\"waiting_debit_payment\",\"GET_ORDER_FROM_CHANNEL\",\"168b0edc-4e3b-4ce4-8b54-7df53ac69ddd\",false,\"Manuela Bernasconi\",\"\",\"\",\"\",null,\"\",\"\",null,\"\",\"\",\"\"]",
                "fby_alert_code": "ORDER",
                "cc_operation": "TESTING PUSH_ORDER_TO_FBY_MISSING_DATA",
                "alertSentOn": "2023-10-08 14:45:03"
            }
            resultLogs = [testData];
        }
        if (resultLogs == "" || resultLogs == null) {
            set_response["alert"] = "Failed to get logs data from the database";
            return set_response;
        }
        logsAletsFromDB = JSON.parse(JSON.stringify(resultLogs));

        let user = ccCache.get(cacheKey_FBYUSER);
        if (user == undefined || !user || user == null) {
            let sql = "CALL get_user(?)";
            let userResult = await db.execute(sql, [fby_user_id]);
            user = JSON.parse(JSON.stringify(userResult.variables));
        }

        let getTokenResult = await this.getFBYToken(null, user, "", "");
        fby_api_token = getTokenResult.result;

        if (fby_api_token && fby_api_token != "" && fby_api_token != null) {
            ccCache.set(cacheKey_FBYUSER, user);
        }


        let alertsDataFby = [];
        for await (const alertData of logsAletsFromDB) {

            try {

                if (alertData != null && alertData != undefined
                    && alertData.fby_alert_code != undefined && alertData.fby_alert_alert != ""
                    && alertData.message != undefined
                    && user.owner_code != undefined && user.owner_code != ""
                ) {
                    let domain = user.domain.replace("https://", "").replace("http://", "");
                    let alertlink = `<a target="_blank" rel="noopener" href="${process.env.BASE_URL}api/get_logs_by_alert_id?alertId=${alertData.id}">alert-${alertData.id}</a>`;
                    let alert_data = {
                        "alertCode": alertData.fby_alert_code,
                        "alertName": `[CC] ${user.owner_code}: ${domain}: ${alertlink} ${alertData.message}`,
                        "alertUniqueId": `alert-${alertData.id}`,
                        "alertDomain": server_constants.FBY_ALERT_DOMAIN.SATELLITE,
                        "ownerCode": "YT" || user.owner_code
                    }
                    if (alertData.cc_operation == "PUSH_ORDER_TO_FBY_MISSING_DATA") {
                        alert_data["alertDomain"] = "Ordini";
                    }
                    alertsDataFby.push(alert_data);
                }
            }
            catch (error) {
                //console.log('alertData preparation error: ', error.message);

            }

        }

        if (alertsDataFby.length > 0 && fby_api_token != null && fby_api_token != "" && isTest != true) {
            var postData = {
                "alerts": alertsDataFby,
            };

            let axiosConfig = {
                headers: {
                    Authorization: `Bearer ${fby_api_token}`,
                },
            };
            // /* Alert insert */
            let logMsg = `\n${server_constants.CC_OPERATIONS.FBY_ALERT_INSERT}: ${server_constants.FBY_ALERTINSERT_URL}\n${CircularJSON.stringify(postData)}`;
            await axios
                .post(
                    server_constants.FBY_ALERTINSERT_URL,
                    postData,
                    axiosConfig
                )
                .then(async (response) => {
                    try {
                        await logger.LogForAlert(
                            fby_user_id,
                            '',
                            '',
                            postData,
                            JSON.stringify(response.data),
                            server_constants.LOG_LEVEL.INFO,
                            server_constants.FBY_ALERT_CODES.UNKNOWN,
                            cron_name,
                            cron_id,
                            false
                        );
                    }
                    catch (error) {
                        //console.log();
                        //console.log(error.message);

                    }
                    try {
                        if (Array.isArray(response.data)) {
                            response.data = response.data[0];
                        }
                    } catch (error) {
                        //console.log("ERROR\n ", error.message);
                    }
                    //console.log(logMsg);
                    //console.log(CircularJSON.stringify(response.data));
                    for (const alertData of logsAletsFromDB) {
                        try {
                            let alertid = `alert-${alertData.id}`
                            //console.log('alertid: ', alertid);
                            if (
                                response.data != undefined && response.data != null
                            ) {
                                if (
                                    response.data.success != undefined && response.data.success != null
                                    && response.data.success[alertid] != undefined && response.data.success[alertid] == "Ok"
                                ) {
                                    sucessAlertIds.push(alertData.id);
                                }

                                if (
                                    response.data.errors != undefined && response.data.errors != null
                                    && response.data.errors[alertid] != undefined && response.data.errors[alertid] != null && response.data.errors[alertid] != ""
                                ) {
                                    let updateFailsInputs = [fby_user_id, alertData.id, CircularJSON.stringify(response.data.errors[alertid])];

                                    await dbCCLogs.executeCCLogs(
                                        db_constants.DB_CONSTANTS_CCLOGS.UPDATE_FAIL,
                                        updateFailsInputs,
                                        function (result) {
                                            if (result != null && result.error) {
                                                //console.log("Failed to update data in the database");
                                            }
                                        }
                                    );
                                    set_response["alert"] = updateFailsInputs;

                                }
                            }

                        }
                        catch (error) {
                            //console.log(`\nERROR RESPOSNE PROCESS ${logMsg}\n`, error.message);

                        }
                    }

                    //console.log('sucessAlertIds: ', sucessAlertIds);
                    if (sucessAlertIds.length > 0) {

                        let updateSucessInputs = [fby_user_id, sucessAlertIds.join(',')];

                        await dbCCLogs.executeCCLogs(
                            db_constants.DB_CONSTANTS_CCLOGS.UPDATE_SUCESS,
                            updateSucessInputs,
                            function (result) {
                                if (result != null && result.error) {
                                    //console.log("Failed to update in the database");
                                }
                            }
                        );
                        set_response["alert"] = updateSucessInputs;

                    }
                })
                .catch((error) => {
                    //console.log(`\nERROR ${logMsg}\n`, error.message);
                });
            //console.log();
        }
    } catch (error) {
        //console.log(`\nfby_user_id=${fby_user_id}, Error: ${error.message}`);
    }
    return set_response;

};

exports.get_fby_token_from_fby_user_id = async (fby_user_id) => {

    try {
        let fby_api_token = "";
        let logsAletsFromDB = [];

        let cacheKey_FBYUSER = `${constants.CACHE_KEYS.FBYUSER}-${fby_user_id}`;
        /*
        //get maped alert codes
        let { variables, result } = await dbCCLogs.executeCCLogs(
            db_constants.DB_CONSTANTS_CCLOGS.GET,
            [fby_user_id]
        );
        logsAletsFromDB = JSON.parse(JSON.stringify(result));
        */

        let user = ccCache.get(cacheKey_FBYUSER);
        if (user == undefined || !user || user == null) {
            let sql = "CALL get_user(?)";
            let userResult = await db.execute(sql, [fby_user_id]);
            user = JSON.parse(JSON.stringify(userResult.variables));
        }

        let getTokenResult = await this.getFBYToken(null, user, "", "");
        fby_api_token = getTokenResult.result;

        if (fby_api_token && fby_api_token != "" && fby_api_token != null) {
            ccCache.set(cacheKey_FBYUSER, user);
        }

        return fby_api_token;
    }
    catch (error) {
        //console.log('\nerror: get_fby_token_from_fby_user_id', error.message);
        return '';
    }
};

exports.getStockListForPushDirectly = async (req, fby_user_id, is_insert_into_DB = false) => {
    let file_and_method_name = 'fby_service.js getStockListForPushDirectly';
    let set_response = {};
    let page = 0;
    let total_page = 0;
    let total_items = 0;
    let count = 1;
    let updated_at = moment();
    let cron_name = server_constants.CC_OPERATIONS.GET_STOCK_FROM_FBY;
    let cron_id = helpers.getUUID();
    updated_at = updated_at.subtract(2, "days");
    updated_at = updated_at.format(MOMENT_DATE_FORMAT);
    let updated_at_before_encoded = updated_at;

    let shopifyAccount = null;

    try {
        await common.shopifyUserDetail(fby_user_id, cron_name, cron_id, function (result) {
            if (!helpers.isEmpty(result.success.data)) {
                shopifyAccount = result.success.data[0];

            }
        });
    }
    catch (error) {
        //console.log('\nERROR While common.shopifyUserDetail: \n', error.message);

    }
    if (helpers.isEmpty(shopifyAccount)) {
        //console.log('\nERROR Cound not get shopifyAccount\n', error.message);
    }
    if (shopifyAccount.stockUpdate != 1) {
        //console.log(`\nfby_user_id=${fby_user_id}, ${server_constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG}`);
        return [];
    }

    let api_token = ''; //await this.get_fby_token_from_fby_user_id(fby_user_id);


    let groupCode = shopifyAccount.group_code;
    let ownerCode = shopifyAccount.owner_code;
    let item_per_page = server_constants.FBY_PERPAGE || 10000;
    let items = [];
    let itemsResult = [];
    let logMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;

    try {
        if (!helpers.isEmpty(req)
            && req.query != undefined && req.query.updated_after != undefined
            && !helpers.isEmpty(req.query)
            && !helpers.isEmpty(req.query.updated_after)
        ) {
            updated_at = req.query.updated_after;
        }
        if (req.query.item_per_page != undefined && req.query.item_per_page != null
        ) {
            item_per_page = req.query.item_per_page;
        }
    }
    catch (error) {

    }
    /*
    if (shopifyAccount.channelName.toLowerCase().includes('amazon')
        //&& moment(updated_at) <= moment('2023-02-01 13:00:00')
    ) {
        updated_at = '2023-01-01 00:00:00';
    }
    
    if (fby_user_id == 39 || fby_user_id == 40
    ) {
        updated_at = '2022-01-01 00:00:00';
    }
    if (fby_user_id == 34
    ) {
        updated_at = '2022-12-30 00:00:00';
    }
    */

    //##todo
    if (process.env.env != 'QA') {
        var startat = moment('2023-06-08 18:30:00');
        updated_at = moment();
        var duration = moment.duration(updated_at.diff(startat));
        var hours = duration.asHours();
        // //console.log('stock startat: ', startat.format(MOMENT_DATE_FORMAT));
        // //console.log('stock updated_at: ', updated_at.format(MOMENT_DATE_FORMAT));
        if (hours > 2) {
            updated_at = updated_at.subtract(1, "hours");
        }
        else {
            updated_at = startat;
        }
        //console.log('stock updateafter: ', updated_at.format(MOMENT_DATE_FORMAT));
        updated_at_before_encoded = updated_at.format(MOMENT_DATE_FORMAT);

        updated_at = updated_at.format(MOMENT_DATE_FORMAT);
    }



    try {
        await common.getLastSyncOperationTime(fby_user_id, cron_name, function (result) {
            if (result != undefined && result != null && result.success && result.success.data.length > 0) {
                if (updated_at = result.success.data[0].last_opearion_sync_time) {
                    updated_at = result.success.data[0].last_opearion_sync_time;
                    updated_at = moment(updated_at).format(MOMENT_DATE_FORMAT);
                    updated_at_before_encoded = updated_at;
                }
                else {
                    updated_at = updated_at_before_encoded;
                }
                // updated_at = urlencode(updated_at);
            }
        });

        ///* ##updated_at date TODO  //if (shopifyAccount.priceUpdate != 1)
        // if (fby_user_id == 50 || fby_user_id == 37
        if (shopifyAccount.priceUpdate == 1 && shopifyAccount.platformName.toLowerCase().includes('mirakl')
        ) {
            updated_at = '2023-06-01 00:00:00';
            req.query.updated_after = updated_at;
        }
        /*
        if (fby_user_id == 39 || fby_user_id == 40
        ) {
            updated_at = '2023-08-07 00:00:00';
        }
        */
        req.query.updated_after = updated_at;

        // if (fby_user_id == 42
        //     ) {
        //         updated_at = '2023-06-20 00:00:00';
        //         req.query.updated_after = updated_at;
        //     }

        //*/

        if (!shopifyAccount.platformName.toLowerCase().includes('amazon')) {

            //if (shopifyAccount.platformName.toLowerCase().includes('shopify')) {
            is_insert_into_DB = true;
        }
        await common.deleteStockBeforeAddStocks(fby_user_id);
    }
    catch (error) {
        //console.log('\nERROR While common.deleteStockBeforeAddStocks: \n', error.message);

    }

    if (shopifyAccount.stockUpdate != 1) {
        //console.log(`\nfby_user_id=${fby_user_id}, ${server_constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG}`);
        return [];
    }

    let url = server_constants.FBY_STOCKLIST_URL;
    let isAnyError = false;
    // updated_at = '2023-09-01 00:00:00';
    do {
        try {
            api_token = await this.get_fby_token_from_fby_user_id(fby_user_id);
            page++;
            let params = {
                channelGroupCode: groupCode,
                page: page,
                itemsPerPage: item_per_page,
                ownercode: ownerCode,
                fby_user_id: fby_user_id,
                updatedAfter: updated_at
            };

            logMessage = `fby_user_id: ${fby_user_id}, ${cron_name} url: ${url}`;


            try {
                //console.log(`\nAPI Call STARTED Page ${page}/${total_page}) -----------------\tfby_user_id ${fby_user_id},\tupdated_at <${updated_at}>\t${moment().format(MOMENT_DATE_FORMAT)}`);
                //console.log(`${file_and_method_name}`);
                //console.log(JSON.stringify({ url, params }));
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

                                total_page = response.data.incrementalStock.totalPages || 0;
                                total_items = response.data.incrementalStock.totalItems || 0;
                                //console.log(`\nAPI Call COMPLTETED Page ${page}/${total_page})\ttotal_items ${total_items}\t-----------------\tfby_user_id ${fby_user_id},\tupdated_at <${updated_at}>\t${moment().format(MOMENT_DATE_FORMAT)}`);
                                //console.log(`${file_and_method_name}`);
                                //console.log(JSON.stringify({ url, params }));
                                //console.log('\n');
                            }
                            catch (error) {
                                //console.log('error: ', error);
                            }

                            if (Object.keys(response.data) == "errors") {
                                //mail
                                isAnyError = true;
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
                                        fby_user_id,
                                        '',
                                        '',
                                        server_constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                                        CircularJSON.stringify(reqres),
                                        server_constants.LOG_LEVEL.ERROR,
                                        server_constants.FBY_ALERT_CODES.STOCK_SYNC,
                                        server_constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                                        cron_id
                                    );
                                }
                                catch (error) {
                                    //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                                }

                                set_response = { error: { "key": fby_user_id, data: response.data } };
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

                                    await logger.LogForAlert(
                                        fby_user_id,
                                        'yocabe-stock-list',
                                        '',
                                        `${server_constants.CC_OPERATIONS.GET_STOCK_FROM_FBY} page: (${page}/${total_page})`,
                                        CircularJSON.stringify(reqres),
                                        server_constants.LOG_LEVEL.INFO,
                                        server_constants.FBY_ALERT_CODES.STOCK_SYNC,
                                        server_constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                                        cron_id
                                    );
                                }
                                catch (error) {
                                    //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                                }

                                // add to products !
                                items = response.data.incrementalStock.items.map(item => {
                                    return item;
                                });
                                let paramsJson = JSON.stringify(params);
                                //console.log(`\n${logMessage}, totalItems: ${items.length},\n${paramsJson}`);

                                if (items !== undefined && items.length > 0) {
                                    let counter = 0;
                                    // items.forEach(async (item) => {
                                    for (let item of items) {
                                        counter++;
                                        try {
                                            if (counter == 1 || counter == items.length) {
                                                //console.log(`\n${counter}/${total_items}) ${logMessage}`);
                                            }
                                            itemsResult.push(item);

                                            // await logger.LogForAlert(
                                            //     fby_user_id,
                                            //     '',
                                            //     item.skuCode || '',
                                            //     server_constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                                            //     CircularJSON.stringify(reqres),
                                            //     server_constants.LOG_LEVEL.INFO,
                                            //     server_constants.FBY_ALERT_CODES.STOCK_SYNC,
                                            //     server_constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                                            //     cron_id
                                            // );
                                        }
                                        catch (error) {
                                            //console.log('\nERROR While services\\fby_service.js: \n', error.message);

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
                    let errMessage = error.response.data.message;;

                    if (errMessage.toLowerCase().includes("request failed with status code 401")
                        && (page > total_page)
                    ) {
                        isAnyError = false;
                    }

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
                            fby_user_id,
                            '',
                            '',
                            error.message,
                            logData,
                            server_constants.LOG_LEVEL.ERROR,
                            server_constants.FBY_ALERT_CODES.STOCK_SYNC,
                            server_constants.CC_OPERATIONS.GET_STOCK_FROM_FBY,
                            cron_id
                        );
                    }
                    catch (error) {
                        //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                    }
                    //set response
                    set_response = { error: { data: responseData } };
                });
        }
        catch (error) {
            //console.log('\nERROR While getStockListForPushDirectly: \n', error.message);

        }
        await helpers.sleep(2);
    } while (page < total_page)


    if (count > 1) {
        set_response = { success: { data: server_constants.FBY_GETSTOCK_SUCCESS, items: items } };
    }
    if (isAnyError == false) {
        await common.updateLastSyncOperationTime(fby_user_id, null, cron_name, function (result) {
            if (result != null && result.error) {
                console.log("Failed to update sync time in the database");
            }
        });
    }
    // update product Quantity
    let updt_time = dateTime.create();
    let inputs = [cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];

    /* //filter out particular sku in case need to test and verify
    itemsResult = itemsResult.filter(p => p.skuCode == 'CT901-B'
      || p.skuCode == 'CT310-S'
      
      || p.skuCode == 'BN_BRL_WFT14464_E136_F9'
      || p.skuCode == 'ZS_CLT_A1SLASH3626_A6_SS23_37'
      

    ); 
    */
    if (is_insert_into_DB) {
        await this.INSERT_FBY_INVENTORY(fby_user_id, itemsResult, cron_name, cron_id);
    }

    return itemsResult;
};

exports.INSERT_FBY_INVENTORY = async (fby_user_id, invetoryList, cron_name, cron_id) => {
    if (helpers.isEmpty(invetoryList)) return null;

    let isAmazonApi = false;
    let channelName = '';

    let totalProducts = invetoryList.length;
    let chunkedProducts, chunk = totalProducts > 500 ? 500 : totalProducts;
    let slice_i = 0;
    let slice_j = slice_i + chunk;
    let chunkCounter = 0;
    let chunktotal = totalProducts / chunk;

    let counter = 0;
    let invetoryListDB = []
    let infoListDB = []

    let fby_alert_code = server_constants.FBY_ALERT_CODES.STOCK_SYNC;
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
    if (helpers.isEmpty(shopifyAccount)) {
        //console.log('\nERROR Cound not get shopifyAccount\n', error.message);
    }

    if (shopifyAccount.channelName.toLowerCase().includes('amazon')
        //&& moment(updated_at) <= moment('2023-02-01 13:00:00')
    ) {
        isAmazonApi = true;
    }

    for (slice_i = 0; slice_i < slice_j && slice_j <= totalProducts; slice_i += chunk) {
        chunkCounter++;
        let batchInvetoryListDB = [];
        let batchInfoListDB = [];
        try {
            chunkedProducts = invetoryList.slice(slice_i, slice_j);
            logMessage = `fby_user_id: ${fby_user_id}, chunkCounter: ${chunkCounter}, slice_i: ${slice_i}, slice_j: ${slice_j}, chunkTotal:${chunktotal}, ${cron_name}`;
            if (chunkCounter == 1 || chunkCounter == chunktotal) {
                //console.log(`\n${chunkCounter}/${chunktotal}) fby_user_id: ${fby_user_id}, ${channelName},${cron_name}, totalProducts: ${totalProducts}`);
                //console.log('Batch Start: ', slice_i + 1);
                //console.log('Batch End  : ', slice_j);
            }
            if (slice_j + chunk > totalProducts) {
                //chunk = totalProducts - slice_j;
                slice_j = totalProducts;
                //slice_i++;
            }
            else if (slice_j < totalProducts) {
                slice_j = slice_j + chunk;
                //slice_i++;
            }

            for await (const item of chunkedProducts) {
                try {
                    sku = item.skuCode;
                    let qty = item.quantity != undefined ? item.quantity : 'NULL'
                    let invetoryItem = new Entities.TempMasterInventory(item.skuId, item.skuCode, item.ean, item.quantity, item.priority, cron_id, fby_user_id);
                    let infoItem = new Entities.CCLogs(
                        fby_user_id,
                        '',
                        sku,
                        `fby_user_id ${fby_user_id}, sku ${sku}, qty ${qty}`,
                        item,
                        server_constants.LOG_LEVEL.INFO,
                        fby_alert_code,
                        cron_name,
                        cron_id
                    );

                    invetoryListDB.push(invetoryItem);
                    infoListDB.push(infoItem);

                    batchInvetoryListDB.push(invetoryItem);
                    batchInfoListDB.push(infoItem);

                }
                catch (error) {
                    //console.log(`\n${logMessage}, sku ${sku}\ batch creation error ${error.message}\n${JSON.stringify(item)}`);
                }
                counter++;
            }
            if (!isAmazonApi) {
                await db.bulkInsert(Entities.TABLE_NAME.TempMasterInventory, batchInvetoryListDB);
            }
            await dbCCLogs.bulkInsert(batchInfoListDB);
        }
        catch (error) {
            //console.log(`\nBatch creation error ${error.message}`);
            //console.log(error);

        }

        /*
        conn.query(sql, [batchInvetoryListDB], function (err) {
            if (err) throw err;
            conn.end();
        });
        */
    }
    /* batch loop end */

};

