const db = require('../../startup/db');
const constants = require("../constants/constants.js");
const common = require("../constants/common.js");
const magentoController = require("../controller/shopifyController");

const db_constants = require("../../misc/db_constants");
const dateTime = require("node-datetime");
const axios = require("axios");
const helpers = require("../../misc/helpers");
const xmlSchema = require("../../misc/xmlSchemas");
const logger = require("../../misc/logger");
const server_constants = require("../../server/constants/constants");
const mail = require("../../server/constants/email");
const fbyController = require("../controller/fbyController.js");
const fbyService = require("../../services/fby_service");
const moment = require("moment");
const { addSlashes, stripSlashes } = require('slashes');
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const channel = "magento";
const v4 = require('uuid').v4;
let uuid = v4;
const NodeCache = require("node-cache");
const ccCache = new NodeCache({ stdTTL: 3000, checkperiod: 300 });



/**--------------Products------------------**/

/*
* Get Products from magento
* getMagentoProducts() function will check fby_user_id through 'user' and '_2_channel' table.
* if all ok, then it will get products from magento channel and insert into products table.
*/
exports.getMagentoProducts = async (req, res) => {
    let cron_name = constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL;
    let file_and_method_name = 'magentoController.js getMagentoProducts';
    let cron_id = uuid();
    let fby_user_id = req.query.fby_user_id;
    let query_product_id = req.query.product_id != undefined ? req.query.product_id : 0;
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
        let inputs = [fby_user_id, cron_name, cron_id, 1];
        common.insertCron(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
                mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            }
        });
        //process url request
        if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
            if (!res.headersSent) {
                res.send(constants.EMPTY);
            }
        } else {
            //get user
            await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
                if (result.error) {
                    // store user error log
                    let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
                    common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                        if (result.error) {
                            // mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
                        }
                    });
                    //send response
                    if (!res.headersSent) {
                        res.send(result.error);
                    }
                } else {
                    let fby_id = null;
                    for await (const client of result.success.data) {
                        fby_id = client.fby_user_id;
                        //get shopify account detail
                        await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result1) {
                            if (result1.error) {
                                //console.log(`shopifyUserDetail result.error: in File ${currentfileName} line : 159 `, result.error);
                                // store shopify account error log
                                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                                //console.log('inputs: ', inputs);

                                //send response
                                if (!res.headersSent) {
                                    res.send(result1.error);
                                }
                            } else {
                                let shopifyAccount = null;

                                //internal asynchronous function for adding products to table and getting response parameters
                                if (result1.success.data != undefined) {
                                    shopifyAccount = result1.success.data[0];
                                    result1.success.data.query_product_id = req.query.product_id != undefined ? req.query.product_id : '';
                                    result1.success.data.query_variant_id = req.query.variant_id != undefined ? req.query.variant_id : '';
                                }



                                await getProducts(result1.success.data, fby_id, cron_name, cron_id)
                                    .then((params) => {
                                        if (!res.headersSent) {
                                            res.send(params);
                                        }
                                    });


                            }
                        });
                    }
                }
            });
        }
        //after finish update cron status as 0
        res.on('finish', function () {
            //console.log('fby_user_id: ', fby_user_id);
            req.query = {
                fby_user_id: fby_user_id
            };
            //console.log('getShopifyLocation: location synced');
            let dt = dateTime.create();
            let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
            common.updateCron(inputs, cron_name, cron_id, function (result) {
                if (result.error) {
                    mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
                }
            });
        });

    }
    catch (error) {
        //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
    }
    finally {
        ccCache.del(cacheKey_Job);
    }

}

/*
* Send Stoks to Magento
* this function will check fby_user_id through 'user' and '_2_channel' table.
* if all ok, then it will get all the user credential from '_2_channel' table'.
* then it will get products of same 'fby_user_id' and 'domain' from product table and update product quantity in magento
*/
exports.pushStockMagento = async (req, res, operationId) => {
    let cron_name = constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL;
    let file_and_method_name = 'magentoController.js pushStockShopify';
    let cron_id = uuid();
    let fby_user_id = req.query.fby_user_id;
    let fby_id = fby_user_id;
    let infoMessage = `fby_user_id=${fby_user_id}, ${cron_name} `;
    let cacheKey_Job = `${constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL}_fby_user_id_${fby_user_id}`;
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
        let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
        await common.insertCron(inputs, cron_name, cron_id, async function (result) {
            if (result.error) {
                mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            }
        });

        //process url request
        if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
            if (!res.headersSent) {
                res.send(constants.EMPTY);
            }
        } else {
            //get user
            await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
                if (result.error) {
                    // store user error log
                    let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
                    common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                        if (result.error) {
                            mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
                        }
                    });
                    //send response
                    if (!res.headersSent) {
                        res.send(result.error);
                    }
                } else {
                    for (const client of result.success.data) {
                        let fby_id = client.fby_user_id;
                        //get shopify account detail
                        await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                            if (result.error) {
                                // store shopify account error log
                                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];

                                //send response
                                if (!res.headersSent) {
                                    res.send(result.error);
                                }
                            } else {
                                let set_response = {};
                                /* Shopify account loop start */
                                for await (const shopifyAccount of result.success.data) {
                                    /**for each shopifyAccount
                                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                                    */
                                    if (shopifyAccount.stockUpdate == 1) {

                                        //console.log(`shopifyController.getStockListForPushDirectly ${infoMessage}`, moment().format(MOMENT_DATE_FORMAT));
                                        await fbyService.getStockListForPushDirectly(req, fby_id, true);
                                        await common.getProduct(shopifyAccount, "domain", cron_name, cron_id, async function (result) {
                                            if (result.error) {
                                                // store get product error log
                                                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];

                                                return false;
                                            } else {
                                                //asynchronous function for updating shopify inventory
                                                try {

                                                    //console.log(`shopifyController.pushProductsShopify ${infoMessage}`, moment().format(MOMENT_DATE_FORMAT));
                                                    await pushProductMagento(result.success.data, shopifyAccount, cron_name, cron_id)
                                                        .then((params) => {
                                                            if (Object.keys(params).length > 0) {
                                                                set_response[shopifyAccount.domain] = (params);
                                                            }
                                                        });
                                                }
                                                catch (error) {
                                                    //console.log(error);

                                                }
                                            }
                                        })
                                    }
                                    else {
                                        //  //console.log('\n shopifyController.js--> pushStockShopify--> CC_STOCK_UPDATE_NOT_ALLOWED_MSG: ', constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG);
                                        set_response[shopifyAccount.domain] = constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG;
                                    }
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
                    mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
                }
            });
        });
    }
    catch (error) {
        //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
    }
    finally {
        ccCache.del(cacheKey_Job);
    }

}

/*-----------internal functions for Products Start---------- */
/*  
* function for getting products
*/
const getProducts = async (result, fby_id, cron_name, cron_id) => {

    let details = {
        request: {
            operationId: cron_id
        },
        response: null,
    };
    let response_data = [];
    let hasError = 0;
    let set_response = {};
    let infoMessage = `fby_user_id: ${fby_id}, ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL}`;
    /* magento account loop start */
    for (const client of result) {

        client.token = helpers.getDecryptedData(client.token);

        let perPage = 100;
        let accessToken = client.token;
        let serverUrl = client.domain;
        /* product fetching loop start */
        for (let currentPage = 1, totalPages = 1; currentPage <= totalPages; currentPage++) {
            // for (let currentPage = 1, totalPages = 1; currentPage <= 2; currentPage++) {
            let URL = `${serverUrl}/rest/V1/products`;
            let options = {
                "searchCriteria[filter_groups][0][filters][0][field]": "type_id",
                "searchCriteria[filter_groups][0][filters][0][value]": "simple",
                "searchCriteria[filter_groups][0][filters][0][condition_type]": "eq",
                "searchCriteria[page_size]": perPage,
                "searchCriteria[currentPage]": currentPage
            };

            await axios({
                url: URL,
                method: "get",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: options,
            })
                .then(async (response) => {
                    try {
                        try {
                            infoMessage = `${infoMessage}, ${URL}`;
                            await logger.LogForAlert(
                                fby_id,
                                '',
                                '',
                                infoMessage,
                                response.data,
                                constants.LOG_LEVEL.INFO,
                                constants.FBY_ALERT_CODES.UNKNOWN,
                                constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL,
                                cron_id
                            );
                        } catch (error) {

                        }
                        if ((response.data.items) && (response.data.items).length > 0) {
                            let products = response.data.items;

                            if (currentPage == 1) {
                                let TotalNumberOfEntries = response.data.total_count;
                                totalPages = Math.ceil(TotalNumberOfEntries / perPage);
                            }



                            /* Product sku Loop start */
                            for (const product of products) {
                                if (!product.sku) {
                                    continue;
                                }
                                let sku_url = `${serverUrl}/rest/V1/products/${product.sku}`;
                                await axios({
                                    url: sku_url,
                                    method: "get",
                                    headers: {
                                        Authorization: `Bearer ${accessToken}`,
                                    }
                                }).then(async (response) => {
                                    try {
                                        try {
                                            infoMessage = `${infoMessage}, ${sku_url}`;
                                            await logger.LogForAlert(
                                                fby_id,
                                                '',
                                                '',
                                                infoMessage,
                                                response.data,
                                                constants.LOG_LEVEL.INFO,
                                                constants.FBY_ALERT_CODES.UNKNOWN,
                                                constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL,
                                                cron_id
                                            );
                                        } catch (error) {

                                        }
                                        let productsBySku = response.data.extension_attributes.stock_item;
                                        let inventory_item_id = null;
                                        let img = "";
                                        let location_id = 0;
                                        let bar_code = 0;
                                        let flag = 0;
                                        /* By default magento does not provide barcode. for test we addedd product id */
                                        bar_code = product.id;

                                        if (flag == 0 && bar_code) {
                                            let fby_user_id = fby_id;
                                            let domain = client.domain;
                                            let owner_code = client.owner_code;
                                            let sku = product.sku;
                                            let barcode = bar_code;
                                            let item_id = product.id;
                                            let title = product.name;
                                            let item_product_id = productsBySku.item_id;
                                            let inventory_quantity = productsBySku.qty;
                                            let image = img;
                                            let price = parseFloat(product.price).toFixed(2);

                                            //insert products got from magento into products table

                                            let inputs = [
                                                fby_user_id,
                                                channel,
                                                domain,
                                                owner_code,
                                                sku,
                                                barcode,
                                                item_id,
                                                title,
                                                item_product_id,
                                                inventory_item_id || '',
                                                inventory_quantity,
                                                inventory_quantity,
                                                image,
                                                price,
                                                cron_name,
                                                cron_id,
                                                location_id
                                            ];
                                            await common.addProduct(inputs, fby_id, cron_name, cron_id, function (result) {
                                                if (result.error) {
                                                    //console.log(`\ngetProducts fby_user_id: ${client.fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                                                    //mail
                                                    //mail.addProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                                                    // store log
                                                    inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                                                    common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                                        if (result.error) {
                                                            //   mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                                                        }
                                                    })
                                                }
                                            })
                                            response_data.push(product);
                                        } else {
                                            let msg = {
                                                success: {
                                                    message: "barcode or sku empty",
                                                    data: product,
                                                },
                                            };
                                            response_data.push(msg);
                                        }
                                    } catch (error) {
                                        let msg = {
                                            type: "error",
                                            productSku: product.sku,
                                            message: error.stack,
                                        };
                                        response_data.push(msg);
                                    }

                                })
                                    .catch(async function (err) {
                                        let msg = {
                                            productSku: product.sku,
                                            message: err.response.data,
                                            request: err,
                                        };
                                        response_data.push(msg);
                                        try {
                                            let errorMessage = `${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL} fby_user_id: ${fby_id}, error : ${err.message}`;
                                            await logger.LogForAlert(
                                                fby_id,
                                                '',
                                                '',
                                                errorMessage,
                                                JSON.stringify(err),
                                                constants.LOG_LEVEL.ERROR,
                                                constants.FBY_ALERT_CODES.UNKNOWN,
                                                constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL,
                                                cron_id
                                            );
                                        } catch (error) {

                                        }
                                    })
                            }
                            /* Product sku Loop end */
                            let msg = { data: response_data };
                            set_response[client.domain] = msg;
                        }
                    } catch (error) {
                        hasError = 1;
                        details.response = error.stack;
                    }

                    // console.log(set_response);
                })
                .catch(async (err) => {
                    hasError = 1;
                    set_response = err.response.data;
                    try {
                        let errorMessage = `${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL} fby_user_id: ${fby_id}, error : ${err.message}`;
                        await logger.LogForAlert(
                            fby_id,
                            '',
                            '',
                            errorMessage,
                            JSON.stringify(err),
                            constants.LOG_LEVEL.ERROR,
                            constants.FBY_ALERT_CODES.UNKNOWN,
                            constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL,
                            cron_id
                        );
                    } catch (error) {

                    }
                });
        }
        /* product fetching loop  end */
    }
    /* magento account loop end */
    let set_data = {
        hasError: hasError,
        data: set_response
    }
    return (set_data);
}

/*  
* function for update magento product quantity
*/
const pushProductMagento = async (products, magentoAccount, cron_name, cron_id) => {
    let fby_user_id = magentoAccount.fby_user_id;
    let set_response = {};
    let details = {
        request: {
            operationId: cron_id
        },
        response: null,
    };


    magentoAccount.token = helpers.getDecryptedData(magentoAccount.token);

    let accessToken = magentoAccount.token;
    let serverUrl = magentoAccount.domain;
    /*
        products = [{
            "item_product_id": 1,
            "inventory_quantity": 98,
            "sku": "Test_product_1"
        }]
    */
    /* product loop start */
    for await (const item of products) {
        let exist_cron = 0;
        set_response[item.sku] = item;
        let status = item.inventory_quantity != 0 ? true : false;
        let xmlBodyStr = xmlSchema.Stock_Item_Schema(item.item_product_id, item.inventory_quantity, status);
        let URL = `${serverUrl}/rest/V1/products/${item.sku}/stockItems/${item.item_product_id}`;

        await axios({
            url: URL,
            method: "put",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            data: xmlBodyStr,
        }).then(async (response) => {
            try {
                try {
                    await logger.LogForAlert(
                        fby_user_id,
                        '',
                        item.sku,
                        `${xmlBodyStr}`,
                        response.data,
                        constants.LOG_LEVEL.INFO,
                        constants.FBY_ALERT_CODES.STOCK_SYNC,
                        cron_name,
                        cron_id
                    );
                }
                catch (error) {
                    console.log('error: ', error.message);

                }
                if (response.data == item.item_product_id) {
                    details.response = response.data;
                    let updt_time = dateTime.create();
                    // let inputs = [fby_id, item.sku, cron_name, cron_id, updt_time.format('Y-m-d H:M:S'), item.item_id];
                    let inputs = [fby_user_id, item.sku, cron_name, cron_id, null];
                    await common.updateProductAftrSndChanl(
                        inputs,
                        fby_user_id,
                        cron_name,
                        cron_id,
                        async function (result) {
                            if (result.error) {
                                //console.log(`${infoMessage}\nERROR\n`, JSON.stringify(result.error));
                            }

                        }
                    );
                    //info log
                    logger.logInfo("action " + cron_name, details);
                    //set response
                    let msg = { success: { message: server_constants.PUSH_STOCK_CHANNEL_SUCCESS, data: response.data } };
                    set_response[item.sku] = msg;
                }

            } catch (error) {

            }
        })
            .catch(async (err) => {
                details.response = err;
                let msg = { error: { message: server_constants.PUSH_STOCK_CHANNEL_ERROR, data: err.response.data, request: err } };
                try {
                    await logger.LogForAlert(
                        fby_user_id,
                        '',
                        item.sku,
                        `${xmlBodyStr}`,
                        err,
                        constants.LOG_LEVEL.ERROR,
                        constants.FBY_ALERT_CODES.STOCK_SYNC,
                        cron_name,
                        cron_id
                    );
                }
                catch (error) {
                    //console.log('error: ', error.message);

                }
                set_response[item.sku] = msg;
            });
        await helpers.sleep();

    }
    /* product loop end */
    return set_response;
}


/*-----------internal functions for Products End---------- */



/**--------------Orders------------------**/
/*
* Get Oredrs from magento
* this function will check fby_user_id through 'user' and '_2_channel' table.
* if all ok, then it will get unshiped orders from magento channel and insert into Order_details and order_master table.
*/
exports.getMagentoOrders = async (req, res) => {
    let cron_name = constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL;
    let file_and_method_name = 'magentoController.js getMagentoOrders';
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
        await common.insertCron(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
                mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            }
        })
        //process url request
        if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
            if (!res.headersSent) {
                res.send(constants.EMPTY);
            }
        } else {
            //get user
            await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
                if (result.error) {
                    // store user error log
                    let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
                    await common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                        if (result.error) {
                            mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
                        }
                    })
                    //send response
                    if (!res.headersSent) {
                        res.send(result.error);
                    }
                } else {
                    for (const client of result.success.data) {
                        let fby_id = client.fby_user_id;
                        //get shopify account detail
                        await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                            if (result.error) {
                                // store shopify account error log
                                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                                //console.log('\n ERROR: ', JSON.stringify(inputs));

                                //send response
                                //console.log("shopifyUserDetail");
                                if (!res.headersSent) {
                                    res.send(result.error);
                                }
                            } else {
                                //internal asynchronous function for adding products to table and getting response parameters
                                if (result.success.data[0].orderSync == 1) {
                                    await getOrders(result.success.data, client, fby_id, cron_name, cron_id)
                                        .then((params) => {
                                            if (!res.headersSent) {
                                                res.send(params);
                                            }
                                        });
                                }
                                else {
                                    //  //console.log('\n shopifyController.js--> getShopifyOrders--> CC_ORDER_UPDATE_NOT_ALLOWED_MSG: ', constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG);
                                    set_response = {};
                                    set_response[result.success.data[0].domain] = constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG;
                                    if (!res.headersSent) {
                                        res.send(set_response);
                                    }
                                }
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
                    mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
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

/*
* Send Tracking number to magento
* this function will check fby_user_id through 'user' and '_2_channel' table.
* if all ok, then it will get all the user credential from '_2_channel' table.
* then it will get orders of same 'fby_user_id', 'account_id' and having is_trackable 1 from order_details table and add tracking information in magento
*/
exports.pushTrackMagento = async (req, res) => {
    let cron_name = constants.CC_OPERATIONS.PUSH_TRAKING_TO_CHANNEL;
    let file_and_method_name = 'magentoController.js pushTrackMagento';
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
        let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
        common.insertCron(inputs, cron_name, cron_id, async function (result) {
            if (result.error) {
                let inputs = [cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error)];
                //console.log('inputs: ', inputs);
            }
        })

        //process url request
        if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
            if (!res.headersSent) {
                res.send(constants.EMPTY);
            }
        } else {
            //get user
            await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
                if (result.error) {
                    // store user error log
                    let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
                    //console.log('inputs: ', inputs);

                    //send response
                    if (!res.headersSent) {
                        res.send(result.error);
                    }
                } else {
                    for await (const client of result.success.data) {
                        let fby_id = client.fby_user_id;
                        //get shopify account detail
                        await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                            if (result.error) {
                                // store shopify account error log
                                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                                //console.log('inputs: ', inputs);

                                //send response
                                if (!res.headersSent) {
                                    res.send(result.error);
                                }
                            } else {
                                let set_response = {};
                                for (const shopifyAccount of result.success.data) {
                                    /**for each shopifyAccount
                                     * get order details from order_masters table
                                    */
                                    if (shopifyAccount.orderSync == 1) {
                                        await common.getOrder(shopifyAccount, "tracking", cron_name, cron_id, async function (result) {
                                            if (result.error) {
                                                // store get product error log
                                                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                                                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                                    if (result.error) {
                                                        // mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                                                    }
                                                })
                                                return false;
                                            } else {
                                                //asynchronous function for updating shopify inventory
                                                await pushTrackingMagento(result.success.data, shopifyAccount, cron_name, cron_id, req, res)
                                                    .then((params) => {
                                                        //console.log('params: ', params);
                                                        if (params !== undefined) {
                                                            set_response[shopifyAccount.domain] = (params);
                                                        }
                                                    });
                                            }
                                        })
                                    }
                                    else {
                                        //  //console.log('\n shopifyController.js--> pushTrackShopify--> CC_ORDER_UPDATE_NOT_ALLOWED_MSG: ', constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG);
                                        set_response[shopifyAccount.domain] = constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG;
                                        if (!res.headersSent) {
                                            res.send(set_response);
                                        }
                                    }
                                }
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
                    mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
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

/*-----------internal functions for Orders Start---------- */
/*  
* function for getting orders
*/
const getOrders = async (result, client, fby_id, cron_name, cron_id) => {

    let details = {
        request: {
            operationId: cron_id
        },
        response: null,
    };
    let set_response = {};
    let response_data = [];
    let hasError = 0;
    let perPage = 100;
    let order_processed = '';
    let modTimeFrom = moment().subtract(2, "days").format(MOMENT_DATE_FORMAT);
    // let modTimeFrom = "2023-09-28 15:46:42";
    let modTimeTo = moment().format(MOMENT_DATE_FORMAT);

    var now = moment();
    now = now.format(MOMENT_DATE_FORMAT);

    let isCanSync = false;
    /* magento account loop start */
    for (const client of result) {
        let orderSyncStartDate = client.orderSyncStartDate;
        if (orderSyncStartDate != null || orderSyncStartDate != '') {
            if (now > orderSyncStartDate) {
                isCanSync = true;
            }
            else {
                isCanSync = false;
                set_response[client.domain] = { "cron": cron_name, "updated_at": modTimeFrom, message: "Order import date is not set." };
                return set_response;
            }

        }
        client.token = helpers.getDecryptedData(client.token);

        if (isCanSync) {
            let accessToken = client.token;
            let serverUrl = client.domain;
            /* order fetching loop start */
            for (let currentPage = 1, totalPages = 1; currentPage <= totalPages; currentPage++) {
                try {
                    let URL = `${serverUrl}/rest/V1/orders`;
                    let options = {
                        "searchCriteria[filter_groups][1][filters][0][field]": "updated_at",
                        "searchCriteria[filter_groups][1][filters][0][condition_type]": "from",
                        "searchCriteria[filter_groups][1][filters][0][value]": modTimeFrom,
                        "searchCriteria[page_size]": perPage,
                        "searchCriteria[currentPage]": currentPage
                    };
                    try {
                        await logger.LogForAlert(
                            fby_id,
                            '',
                            '',
                            `STARTED ${URL}`,
                            '',
                            constants.LOG_LEVEL.INFO,
                            constants.FBY_ALERT_CODES.ORDER_SYNC,
                            cron_name,
                            cron_id
                        );
                    }
                    catch (error) {
                        //console.log();
                        //console.log(error.message);

                    }
                    await axios({
                        url: URL,
                        method: "get",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                        params: options,
                    })
                        .then(async (response) => {
                            try {

                                try {
                                    await logger.LogForAlert(
                                        fby_id,
                                        '',
                                        '',
                                        `COMPLETED ${URL}`,
                                        JSON.stringify(response.data),
                                        constants.LOG_LEVEL.INFO,
                                        constants.FBY_ALERT_CODES.ORDER_SYNC,
                                        cron_name,
                                        cron_id
                                    );
                                }
                                catch (error) {
                                    //console.log();
                                    //console.log(error.message);

                                }
                                if ((response.data.items) && (response.data.items).length > 0) {
                                    let orders = response.data.items;
                                    if (currentPage == 1) {
                                        let TotalNumberOfEntries = response.data.total_count;
                                        totalPages = Math.ceil(TotalNumberOfEntries / perPage);
                                    }

                                    /* Order Loop start */
                                    for (const jsonData of orders) {
                                        try {
                                            let date_created = dateTime.create(jsonData.created_at).format('Y-m-d H:M:S');
                                            let date_modified = dateTime.create(jsonData.updated_at).format('Y-m-d H:M:S');

                                            let order_no = jsonData.increment_id;
                                            console.log('order_no: ', order_no);

                                            order_processed = `${order_processed ? order_processed + ',' : ''}${order_no}`;
                                            let order_status = jsonData.status;
                                            let isCOD = false;
                                            if (jsonData.payment && jsonData.payment.method
                                                && jsonData.payment.method.toLowerCase() == 'cashondelivery'
                                            ) {
                                                isCOD = true;
                                            }

                                            try {
                                                await logger.LogForAlert(
                                                    fby_id,
                                                    order_no,
                                                    '',
                                                    `fby_user_id ${fby_id}, order_no ${order_no}`,
                                                    jsonData,
                                                    constants.LOG_LEVEL.INFO,
                                                    constants.FBY_ALERT_CODES.ORDER_SYNC,
                                                    cron_name,
                                                    cron_id
                                                );
                                            }
                                            catch (error) {
                                                //console.log();
                                                console.log(error.message);

                                            }

                                            if ((order_status == "processing" && jsonData.total_due == 0) || isCOD) {

                                                // order_status = isCOD ? server_constants.CASH_ON_DELIVERY : server_constants.ORDER_STATUS;
                                                order_status = server_constants.ORDER_STATUS;
                                                let channel_code = client.channel_code;
                                                let owner_code = client.owner_code;
                                                let account_id = client.id;
                                                let currency_code = client.currency_code;
                                                let fby_user_id = fby_id;
                                                let seller_order_id = jsonData.entity_id;
                                                let total_order = parseFloat(jsonData.total_paid);
                                                let total_items = (jsonData.total_item_count);
                                                let total_tax = parseFloat(jsonData.tax_amount);
                                                let total_discount = Math.abs(parseFloat(jsonData.discount_amount));
                                                let total_items_price = parseFloat(jsonData.subtotal);
                                                let payment_method = isCOD ? server_constants.CASH_ON_DELIVERY : jsonData.payment.method;
                                                let sales_record_no = order_no;
                                                let purchase_date = date_created;
                                                let payment_time = isCOD ? null : date_modified;
                                                let payment_status = isCOD ? server_constants.CASH_ON_DELIVERY : "paid";
                                                let location_id = null;
                                                let payment_id = ""; //#TODO
                                                let item_total_ship_price = jsonData.shipping_incl_tax;
                                                let local_time = date_modified;

                                                //buyer details

                                                let buyer_email = jsonData.customer_email;
                                                let buyer_id = jsonData.customer_id ? jsonData.customer_id : "";
                                                let buyer_fname = jsonData.customer_firstname;
                                                let buyer_lname = jsonData.customer_lastname;
                                                let buyer_name = buyer_fname + ' ' + buyer_lname;

                                                //shiping address
                                                let address = jsonData.extension_attributes.shipping_assignments[0].shipping.address;

                                                let shiper_fname = address.firstname;
                                                let shiper_lname = address.lastname;
                                                let recipient_name = shiper_fname + ' ' + shiper_lname;
                                                let shiper_company = address.company || " ";
                                                let shiper_strt1 = addSlashes(address.street[0]);
                                                let shiper_strt2 = "";
                                                let shiper_city = addSlashes(address.city);

                                                let shiper_state = address.region;
                                                let shiper_state_code = address.region_code
                                                let shiper_zip = address.postcode;

                                                let shiper_country = address.country_id;
                                                let shiper_country_iso2 = address.country_id;
                                                let shiper_phone = address.telephone;
                                                let shiper_email = address.email;
                                                let orderdetail_id = 0;

                                                let bill_generator_name = null;
                                                let bill_company = '';
                                                let bill_address_1 = '';
                                                let bill_address_2 = '';
                                                let bill_city = null;
                                                let bill_state = '';
                                                let bill_state_code = '';
                                                let bill_zip = null;
                                                let bill_country = '';
                                                let bill_country_iso2 = '';
                                                let bill_phone = '';

                                                if (jsonData.billing_address != undefined && jsonData.billing_address != null) {
                                                    bill_generator_name = jsonData.billing_address.firstname + ' ' + jsonData.billing_address.lastname;
                                                    bill_company = jsonData.billing_address.company || '';
                                                    bill_address_1 = addSlashes(jsonData.billing_address.street[0]) || '';
                                                    bill_address_2 = '';
                                                    bill_city = jsonData.billing_address.city;
                                                    bill_state = jsonData.billing_address.region || '';
                                                    bill_state_code = jsonData.billing_address.region_code || '';
                                                    bill_zip = jsonData.billing_address.postcode;
                                                    bill_country = jsonData.billing_address.country_id || '';
                                                    bill_country_iso2 = jsonData.billing_address.country_id || '';
                                                    bill_phone = jsonData.billing_address.telephone || '';

                                                }
                                                if (bill_generator_name == undefined || bill_generator_name == null) {
                                                    bill_generator_name = recipient_name;
                                                }

                                                if (bill_city == undefined || bill_city == null ||
                                                    bill_zip == undefined || bill_zip == null) {
                                                    bill_company = shiper_company;
                                                    bill_address_1 = shiper_strt1;
                                                    bill_address_2 = shiper_strt2;
                                                    bill_city = shiper_city;
                                                    bill_state = shiper_state;
                                                    bill_state_code = shiper_state_code;
                                                    bill_zip = shiper_zip;
                                                    bill_country = shiper_country;
                                                    bill_country_iso2 = shiper_country_iso2;
                                                    bill_phone = shiper_phone;

                                                }

                                                let order_product_data = jsonData.items;
                                                let managedByChannel = false;
                                                let fulfillment_orderId = null;

                                                /* line items loop start*/
                                                for (const jsonItemData of order_product_data) {

                                                    try {
                                                        await logger.LogForAlert(
                                                            fby_id,
                                                            order_no,
                                                            jsonItemData.sku,
                                                            `fby_user_id ${fby_id}, order_no ${order_no}, sku ${jsonItemData.sku}`,
                                                            jsonItemData,
                                                            constants.LOG_LEVEL.INFO,
                                                            constants.FBY_ALERT_CODES.ORDER_SYNC,
                                                            cron_name,
                                                            cron_id
                                                        );
                                                    }
                                                    catch (error) {
                                                        //console.log();
                                                        //console.log(error.message);

                                                    }
                                                    if (jsonItemData.parent_item) {
                                                        continue;
                                                    }
                                                    let item_tax = parseFloat(jsonItemData.tax_amount).toFixed(2);
                                                    let exchange_rate = 0;
                                                    let order_line_item_id = jsonItemData.item_id;
                                                    let sku = jsonItemData.sku;
                                                    let order_item_id = jsonItemData.product_id;
                                                    var { variables, result } = await db.execute(
                                                        db_constants.DB_CONSTANTS_PRODUCT.GET_PRODUCT_BY_SKU,
                                                        [fby_id, sku]
                                                    );
                                                    if (result.length > 0) {
                                                        order_item_id = variables.item_id;
                                                    }
                                                    let transaction_id = " ";
                                                    let product_name = jsonItemData.name;
                                                    let quantity_purchased = jsonItemData.qty_ordered;

                                                    let line_item_price = parseFloat(jsonItemData.price);
                                                    let line_item_total_tax = item_tax * quantity_purchased;
                                                    let item_total_price_extax = line_item_price * quantity_purchased;
                                                    let item_price = line_item_price + quantity_purchased;

                                                    let item_ship_price = parseFloat(item_total_ship_price / total_items);


                                                    let promotion_discount = parseFloat(jsonItemData.discount_amount).toFixed(2);
                                                    let item_total_price_intax = item_total_price_extax + line_item_total_tax - promotion_discount;
                                                    item_price = item_total_price_intax + item_ship_price;
                                                    let fulfillment_orderLineItemId = null;

                                                    /* get barcode from product table using sku and order item id */
                                                    let barcode = "";
                                                    var { variables, result } = await db.execute(
                                                        db_constants.DB_CONSTANTS_PRODUCT.GET_PRODUCT_BARCODE,
                                                        [fby_id, sku, order_item_id]
                                                    );
                                                    if (result.length > 0) {
                                                        barcode = variables.barcode;
                                                    }
                                                    let dataArray = [
                                                        channel,
                                                        channel_code,
                                                        owner_code,
                                                        fby_user_id,
                                                        account_id,
                                                        order_no,
                                                        location_id,
                                                        seller_order_id,
                                                        purchase_date,
                                                        payment_time,
                                                        order_line_item_id,
                                                        sku,
                                                        barcode,
                                                        order_item_id,
                                                        transaction_id,
                                                        product_name,
                                                        quantity_purchased,
                                                        currency_code,
                                                        exchange_rate,
                                                        item_price,
                                                        line_item_price,
                                                        item_tax,
                                                        line_item_total_tax,
                                                        promotion_discount,
                                                        item_total_price_intax,
                                                        item_ship_price,
                                                        cron_name,
                                                        cron_id,
                                                        payment_status,
                                                        order_status,
                                                        managedByChannel,
                                                        fulfillment_orderId,
                                                        fulfillment_orderLineItemId,
                                                    ];

                                                    await common.addOrderDetailsV1(dataArray, cron_name, cron_id, async function (result) {

                                                        set_response[client.domain] = result;
                                                        if (result != null && result.error != undefined) {

                                                            // store log
                                                            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.error), fby_id];
                                                            //console.log('\n ERROR: ', JSON.stringify(inputs));

                                                        }
                                                        if (result.success) {

                                                            //console.log('addOrderDetails result.success: ', result.success);
                                                            orderdetail_id = result.success.data;

                                                        }
                                                    });

                                                }
                                                /* line items loop end*/

                                                let order_masters = [
                                                    channel,
                                                    channel_code,
                                                    owner_code,
                                                    fby_user_id,
                                                    account_id,
                                                    order_no,
                                                    seller_order_id,
                                                    purchase_date,
                                                    payment_time,
                                                    recipient_name,
                                                    shiper_company || '',
                                                    shiper_strt1 || '',
                                                    shiper_strt2 || '',
                                                    shiper_city,
                                                    shiper_state || '',
                                                    shiper_state_code || '',
                                                    shiper_zip,
                                                    shiper_country || '',
                                                    shiper_country_iso2 || '',
                                                    shiper_phone || '',
                                                    total_order,
                                                    total_items,
                                                    total_items_price,
                                                    item_total_ship_price,
                                                    total_tax,
                                                    total_discount,
                                                    payment_id,
                                                    payment_method || '',
                                                    currency_code || '',
                                                    buyer_id,
                                                    buyer_email || '',
                                                    buyer_name || '',
                                                    sales_record_no || '',
                                                    payment_status,
                                                    order_status,
                                                    cron_name,
                                                    cron_id,
                                                    managedByChannel,
                                                    bill_generator_name,
                                                    bill_company,
                                                    bill_address_1,
                                                    bill_address_2,
                                                    bill_city,
                                                    bill_state,
                                                    bill_state_code,
                                                    bill_zip,
                                                    bill_country,
                                                    bill_country_iso2,
                                                    bill_phone
                                                ];
                                                await common.addOrderMaster(order_masters, cron_name, cron_id, async function (result) {
                                                    // set_response[client.domain] = result;

                                                    if (result.error) {
                                                        // store log
                                                        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.error), fby_id];

                                                        //console.log('\n ERROR: ', JSON.stringify(inputs));

                                                    }
                                                    if (result.success) {
                                                        //console.log('addOrderMaster result.success: ', result.success);
                                                        orderdetail_id = result.success.data;
                                                    }
                                                }, true, jsonData)

                                            }
                                            if (order_status == "canceled" || order_status == "closed") {
                                                // if order is canceled,then update payment and order status
                                                let updt_time = dateTime.create();
                                                let cancel_reason = "unknown";
                                                let payment = "canceled";
                                                let inputs = [fby_id, order_no, payment, cancel_reason, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];

                                                var { variables, result } = await db.execute(
                                                    db_constants.DB_CONSTANTS_ORDER.UPDATE_ORDER_CANCEL_STATUS,
                                                    inputs
                                                );
                                            }
                                        } catch (error) {

                                            console.log(error.message);
                                        }
                                    }
                                    /* Order Loop end */
                                    response_data.push(orders);
                                    let msg = { message: "success", data: `${order_processed} \\ (${orders.length})` };
                                    set_response[client.domain] = msg;
                                    // logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body, ...response_data });
                                } else {
                                    let msg = { error: { message: constants.NORECORD, "updated_at": modTimeFrom, data: response.data } };
                                    set_response[client.domain] = msg;
                                }

                            } catch (error) {
                                hasError = 1;
                                details.response = error.stack;
                                if (exist_cron) {
                                    let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, error.stack, fby_id, exist_cron];
                                    var { variables, result } = await db.execute(
                                        db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                                        inputs
                                    );
                                    //log error
                                    logger.logError(cron_name + " error", details);
                                    //send response
                                    let msg = { error: { message: server_constants.GET_ORDER_ERROR, data: error.stack } };
                                    set_response[client.domain] = msg;
                                } else {

                                    //store update product status error log
                                    let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, error.stack, fby_id, exist_cron];
                                    var { variables, result } = await db.execute(
                                        db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                                        inputs
                                    );
                                    //log error
                                    logger.logError(cron_name + " error", details);
                                    //send response
                                    let msg = { error: { message: server_constants.GET_ORDER_ERROR, data: error.stack } };
                                    set_response[client.domain] = msg;
                                }
                            }
                        })
                        .catch(async (error) => {
                            hasError = 1;
                            details.response = error;
                            let msg = { error: { message: server_constants.GET_ORDER_ERROR, data: error.response.data, request: error } };
                            set_response[client.domain] = msg;
                            try {
                                await logger.LogForAlert(
                                    fby_id,
                                    '',
                                    '',
                                    error.message,
                                    msg,
                                    constants.LOG_LEVEL.ERROR,
                                    constants.FBY_ALERT_CODES.ORDER_SYNC,
                                    constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL,
                                    cron_name,
                                    cron_id
                                );
                            } catch (error) {

                            }
                        });
                } catch (error) {

                    console.log(error.message);
                }
            }
        }
    }
    /* magento account loop end */
    let set_data = {
        hasError: hasError,
        data: set_response
    }
    return (set_data);
}

/*  
* function for update magento order tracking number
*/
const pushTrackingMagento = async (orders, magentoAccount, cron_name, cron_id, req, res) => {
    let set_response = {};
    let fby_user_id = magentoAccount.fby_user_id;
    let details = {
        request: {
            operationId: cron_id
        },
        response: null,
    };
    magentoAccount.token = helpers.getDecryptedData(magentoAccount.token);

    let accessToken = magentoAccount.token;
    let serverUrl = magentoAccount.domain;
    let infoMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;
    /*
    orders = [{
        "order_no": "000000004",
        "seller_order_id": 4
    }]
    */
    /* order loop start */
    for (const item of orders) {

        let order_number = item.order_no;
        let order_id = item.seller_order_id;
        try {
            await common.getOrderDetailsTracking(fby_user_id, order_number, cron_name, cron_id, async function (result) {
                if (result.success.data.length > 0) {
                    let order_details = result.success.data;
                    /*order_details loop start */
                    for (const item of order_details) {
                        try {
                            let exist_cron = 0;

                            /* check if shippment row exist or not */
                            let URL = `${serverUrl}/rest/V1/shipments`;
                            let options = {
                                "searchCriteria[filter_groups][1][filters][0][field]": "order_id",
                                "searchCriteria[filter_groups][1][filters][0][value]": order_id,
                                "searchCriteria[filter_groups][1][filters][0][condition_type]": "eq"
                            };
                            await axios({
                                url: URL,
                                method: "get",
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                },
                                params: options,
                            }).then(async (response) => {
                                try {
                                    try {
                                        infoMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;
                                        await logger.LogForAlert(
                                            fby_user_id,
                                            order_number,
                                            '',
                                            `${infoMessage}, line_items ${order_id}`,
                                            response.data,
                                            constants.LOG_LEVEL.INFO,
                                            constants.FBY_ALERT_CODES.TRACK_SYNC,
                                            cron_name,
                                            cron_id

                                        );
                                    } catch (error) {
                                        //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
                                        //console.log(error);
                                    }
                                    if ((response.data.items).length > 0 && response.data.items[0].entity_id) {

                                        let parent_id = response.data.items[0].entity_id;
                                        let bodyStr = xmlSchema.Shipment_Track_Schema(order_id, parent_id, item.tracking_id, item.tracking_courier);
                                        let URL = `${serverUrl}/rest/V1/shipment/track`;

                                        /* if shipment row exist, then update tracking detail */
                                        await axios({
                                            url: URL,
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${accessToken}`
                                            },
                                            data: bodyStr,
                                        }).then(async (response) => {
                                            try {
                                                infoMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;
                                                await logger.LogForAlert(
                                                    fby_user_id,
                                                    order_number,
                                                    '',
                                                    `${infoMessage}, line_items ${order_id}`,
                                                    response,
                                                    constants.LOG_LEVEL.INFO,
                                                    constants.FBY_ALERT_CODES.TRACK_SYNC,
                                                    cron_name,
                                                    cron_id
                                                );
                                            } catch (error) {
                                                //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
                                                //console.log(error);
                                            }
                                            if (response.data.order_id) {
                                                details.response = response.data;
                                                let updt_time = dateTime.create();
                                                let inputs = [fby_user_id, order_number, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];
                                                await common.updateOrderDetailStatus(inputs, fby_user_id, cron_name, cron_id, function (result) {
                                                    if (result.error) {
                                                        //store update product status error log
                                                        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_user_id];
                                                        common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                                            if (result.error) {

                                                            }
                                                        })
                                                    }
                                                })
                                                //info log
                                                logger.logInfo("action " + cron_name, details);
                                                //set response
                                                let msg = { success: { message: server_constants.PUSH_TRACKNO_CHANNEL_SUCCESS, data: response.data } };
                                                set_response[order_number] = msg;
                                            } else {
                                                details.response = response.data;
                                                var updt_time = dateTime.create();
                                                if (exist_cron) {
                                                    let inputs = [fby_user_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(response.data), updt_time.format('Y-m-d H:M:S')];
                                                    var { variables, result } = await db.execute(
                                                        db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                                        inputs
                                                    );
                                                    //log error
                                                    logger.logError(cron_name + " error", details);
                                                    //send response
                                                    let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, action: "Shipment_Track", data: response.data } };
                                                    set_response[order_number] = msg;
                                                } else {
                                                    //store update product status error log
                                                    let inputs = [fby_user_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(response.data), updt_time.format('Y-m-d H:M:S')];
                                                    var { variables, result } = await db.execute(
                                                        db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                                        inputs
                                                    );
                                                    //log error
                                                    logger.logError(cron_name + " error", details);
                                                    //send response
                                                    let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, action: "Shipment_Track", data: response.data } };
                                                    set_response[order_number] = msg;
                                                }
                                            }
                                        })
                                            .catch(async (error) => {
                                                details.response = error.response.data;
                                                var updt_time = dateTime.create();
                                                //send response
                                                let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, action: "Shipment_Track", data: error.response.data, request: error } };
                                                set_response[order_number] = msg;
                                                try {
                                                    infoMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;
                                                    let errorMessage = `${infoMessage}, ErrorMessage: ${error.message}`;
                                                    await logger.LogForAlert(
                                                        fby_user_id,
                                                        order_number,
                                                        '',
                                                        `${errorMessage}, line_items ${order_id}`,
                                                        error.message,
                                                        constants.LOG_LEVEL.ERROR,
                                                        constants.FBY_ALERT_CODES.TRACK_SYNC,
                                                        cron_name,
                                                        cron_id,
                                                    );
                                                } catch (error) {
                                                    //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
                                                    //console.log(error);
                                                }
                                            })
                                    } else {
                                        let TrackingTitle = helpers.getTitle(item.tracking_courier);
                                        let bodyStr = xmlSchema.Shipment_Create_Schema(item.tracking_id, item.tracking_courier, TrackingTitle);
                                        let URL = `${serverUrl}/rest/V1/order/${order_id}/ship`;

                                        /* if shipment row not exist, then create one with tracking detail */
                                        await axios({
                                            url: URL,
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${accessToken}`
                                            },
                                            data: bodyStr,
                                        }).then(async (response) => {
                                            if (response.data == order_id) {
                                                details.response = response.data;
                                                let updt_time = dateTime.create();
                                                let inputs = [fby_user_id, order_number, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];
                                                await common.updateOrderDetailStatus(inputs, fby_user_id, cron_name, cron_id, function (result) {
                                                    if (result.error) {
                                                        //store update product status error log
                                                        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_user_id];
                                                        common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                                            if (result.error) {
                                                                mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                                                            }
                                                        })
                                                    }
                                                })
                                                //info log
                                                logger.logInfo("action " + cron_name, details);
                                                //set response
                                                let msg = { success: { message: server_constants.PUSH_TRACKNO_CHANNEL_SUCCESS, data: response.data } };
                                                set_response[order_number] = msg;
                                            } else {
                                                details.response = response.data;
                                                var updt_time = dateTime.create();
                                                if (exist_cron) {
                                                    let inputs = [fby_user_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(response.data), updt_time.format('Y-m-d H:M:S')];
                                                    var { variables, result } = await db.execute(
                                                        db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                                        inputs
                                                    );
                                                    //log error
                                                    logger.logError(cron_name + " error", details);
                                                    //send response
                                                    let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, action: "Shipment_Create", data: response.data } };
                                                    set_response[order_number] = msg;
                                                } else {
                                                    //store update product status error log
                                                    let inputs = [fby_user_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(response.data), updt_time.format('Y-m-d H:M:S')];
                                                    var { variables, result } = await db.execute(
                                                        db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                                        inputs
                                                    );
                                                    //log error
                                                    logger.logError(cron_name + " error", details);
                                                    //send response
                                                    let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, action: "Shipment_Create", data: response.data } };
                                                    set_response[order_number] = msg;
                                                }
                                            }
                                        })
                                            .catch(async (error) => {
                                                details.response = error.response.data;
                                                var updt_time = dateTime.create();

                                                //send response
                                                let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, action: "Shipment_Create", data: error.response.data, request: error } };
                                                set_response[order_number] = msg;
                                            })
                                    }
                                } catch (error) {
                                    details.response = error.stack;
                                    var updt_time = dateTime.create();
                                    //send response
                                    let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: error.stack } };
                                    set_response[order_number] = msg;
                                }
                            })
                                .catch(async (error) => {
                                    details.response = error;
                                    var updt_time = dateTime.create();
                                    //send response
                                    let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: error } };
                                    set_response[order_number] = msg;
                                    try {
                                        infoMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;
                                        let errorMessage = `${infoMessage}, ErrorMessage: ${error.message}`;
                                        await logger.LogForAlert(
                                            fby_user_id,
                                            order_number,
                                            '',
                                            `${errorMessage}, line_items ${order_id}`,
                                            error.message,
                                            constants.LOG_LEVEL.ERROR,
                                            constants.FBY_ALERT_CODES.TRACK_SYNC,
                                            cron_name,
                                            cron_id,
                                        );
                                    } catch (error) {
                                        //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
                                        //console.log(error);
                                    }
                                })

                        }
                        catch (error) {
                            //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
                            //console.log(error);
                        }
                    }
                    /*order_details loop end */
                } else {
                    let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, action: constants.CUSTOM_MESSAGES.GET_TRACKABLE_LISTITEM } };
                    set_response[order_number] = msg;
                }
            });
        }
        catch (error) {
            //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
            //console.log(error);
        }
    }
    /* order loop end */
    return set_response;
}
/*-----------internal functions for Orders End---------- */

exports.getProducts = getProducts;
exports.pushProductMagento = pushProductMagento;
exports.getOrders = getOrders;
exports.pushTrackingMagento = pushTrackingMagento;

