const db = require('../../startup/db');
const constants = require("../../misc/constants");
const db_constants = require("../../misc/db_constants");
const request = require("request-promise");
const dateTime = require("node-datetime");
const axios = require("axios");
const helpers = require("../../misc/helpers");
const xmlSchema = require("../../misc/xmlSchemas");
const logger = require("../../misc/logger");
const server_constants = require("../../server/constants/constants");
const common = require("../../server/constants/common");
const mail = require("../../server/constants/email");
const fbyService = require("../fby_service");
const NodeCache = require("node-cache");
const ccCache = new NodeCache({ stdTTL: 3000, checkperiod: 300 });
const moment = require("moment");
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const channel = "prestashop";
let CircularJSON = require('circular-json');
const { array } = require('joi');
const Entities = require("../../entities/Entities");
const dbCCLogs = require('../../startup/dbcclogs');

/**--------------Products------------------**/

/*
* Get Products from PrestaShop
* getPrestaProducts() function will check fby_user_id through 'user' and 'prestashop' table.
* if all ok, then it will get products from prestashop channel and insert into products table.
*/
exports.getPrestaProducts = async (req, res, operationId) => {
    let cron_name = "get_presta_products";
    let cron_id = operationId;

    //log info
    logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body });

    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
    await db.execute(
        db_constants.DB_CONSTANTS_CRON.INSERT_CRONPROCESS,
        inputs
    );


    // get user details
    var { variables, result } = await db.execute(
        db_constants.DB_CONSTANTS_ACCOUNT.USER,
        [req.query.fby_user_id]
    );
    let isEmpty = (helpers.isEmpty(result)
        && helpers.isEmpty(result[0]));

    if (!isEmpty) {
        let fby_id = req.query.fby_user_id;
        // get prestashop user details
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ACCOUNT.GET_SHOPIFY_USER,
            [fby_id]
        );
        isEmpty = (helpers.isEmpty(result)
            && helpers.isEmpty(result[0]));

        if (result.length > 0) {
            let prestaAccount = result;
            let dt = dateTime.create();
            let new_cron_id = cron_id;
            let exist_cron = 0;

            var { variables, result } = await db.execute(
                db_constants.DB_CONSTANTS_ACCOUNT.BULK_CRON_LOG,
                [fby_id, cron_name, dt.format('Y-m-d')]
            );
            if (result.length > 0) {
                new_cron_id = variables.cron_id;
                exist_cron = 1;
            }

            let response = await getProducts(req, res, prestaAccount, exist_cron, fby_id, cron_name, new_cron_id)

            // res.send(response);
            helpers.sendSuccess(
                res,
                constants.HTTPSTATUSCODES.OK,
                constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                response,
            );
        } else {
            let message = {
                fby_user_id: req.query.fby_user_id,
                query_action: constants.CUSTOM_MESSAGES.GET_PRESTASHOP_USER
            }
            helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                message
            );
        }
    } else {
        let message = {
            fby_user_id: req.query.fby_user_id,
            query_action: constants.CUSTOM_MESSAGES.GET_USER
        }
        helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.NOT_FOUND,
            constants.ERRORCODES.NOT_FOUND,
            constants.ERRORMESSAGES.NOT_FOUND,
            message
        );
    }

    //after finish update cron status as 0
    res.on('finish', async function () {
        var dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        await db.execute(
            db_constants.DB_CONSTANTS_CRON.UPDATE_CRONPROCESS,
            inputs
        );
    });

}

/*
* Send Products to Fby
* this function will check fby_user_id through 'user' and 'product' table.
* if all ok, then it will get product details from product table having status '0' and send to fby through fby controler.
*/
exports.sendProductsFby = async (req, res, operationId) => {
    let cron_name = "send_Products_Fby";
    let cron_id = operationId;

    //log info
    logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body });

    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
    await db.execute(
        db_constants.DB_CONSTANTS_CRON.INSERT_CRONPROCESS,
        inputs
    );

    /* get user details from users table */
    var { variables, result } = await db.execute(
        db_constants.DB_CONSTANTS_ACCOUNT.USER,
        [req.query.fby_user_id]
    );
    let isEmpty = (helpers.isEmpty(result)
        && helpers.isEmpty(result[0]));

    if (!isEmpty) {
        let user = variables;
        let fby_id = req.query.fby_user_id;

        /* get JWT token from fby */
        var { result } = await fbyService.getFBYToken(res, user, cron_name, cron_id);
        if (result.error) {
            helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.UNAUTHORIZED,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                result.error
            );
            return
        }
        let api_key = result;

        /*
        * get product details from products table having same 'fby_user_id' as in 'user' table and status 0.
        */
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_PRODUCT.UNSEND_PRODUCT,
            [fby_id]
        );

        if (result.length > 0) {
            let products = result;
            let set_response = {
                details: []
            };
            /* Product loop start */
            for (const product of products) {
                let new_cron_id = cron_id;
                let exist_cron = 0;
                if (product.cron_name == cron_name && product.cron_id) {
                    new_cron_id = product.cron_id;
                    exist_cron = 1;
                } else {
                    /* Update with new cron id */
                    let updt_time = dateTime.create();
                    let inputs = [product.sku, cron_name, new_cron_id, updt_time.format('Y-m-d H:M:S'), product.item_id];

                }
                let response = await fbyService.insertSku(api_key, product, exist_cron, cron_name, new_cron_id);
                set_response.details.push(response);
            }
            /* Product loop end */
            setTimeout(() => {
                // res.send(set_response);
                helpers.sendSuccess(
                    res,
                    constants.HTTPSTATUSCODES.OK,
                    constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                    set_response,
                );
            }, 15000);

        } else {
            let message = {
                fby_user_id: fby_id,
                query_action: constants.CUSTOM_MESSAGES.GET_UNSEND_PRODUCT
            }
            helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                message
            );
        }

    } else {
        let message = {
            fby_user_id: req.query.fby_user_id,
            query_action: constants.CUSTOM_MESSAGES.GET_USER
        }
        helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.NOT_FOUND,
            constants.ERRORCODES.NOT_FOUND,
            constants.ERRORMESSAGES.NOT_FOUND,
            message
        );
    }

    //after finish update cron status as 0
    res.on('finish', async function () {
        var dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        await db.execute(
            db_constants.DB_CONSTANTS_CRON.UPDATE_CRONPROCESS,
            inputs
        );
    });
}


/*
* Get Stoks From Fby
* this function will check fby_user_id through 'user' and 'prestashop' table.
* if all ok, then it will get user credentials,prestashop account groupcode,owner_code and get the stocks from fby through fby controller.
*/
exports.getFbyStock = async (req, res, operationId) => {
    let cron_name = "get_Fby_Stock";
    let cron_id = operationId;
    let fby_user_id = req.query.fby_user_id;
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
        //log info
        logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body });
        // when url hits, it insert the cron details and make status 1 as its running
        let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
        await db.execute(
            db_constants.DB_CONSTANTS_CRON.INSERT_CRONPROCESS,
            inputs
        );

        //process url request
        // get user details
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ACCOUNT.USER,
            [req.query.fby_user_id]
        );
        let isEmpty = (helpers.isEmpty(result)
            && helpers.isEmpty(result[0]));

        if (!isEmpty) {
            let fby_id = req.query.fby_user_id;
            let user = variables;
            /* get JWT token from fby */
            var { result } = await fbyService.getFBYToken(res, user, cron_name, cron_id);

            if (result.error) {
                helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.UNAUTHORIZED,
                    constants.ERRORCODES.NOT_FOUND,
                    constants.ERRORMESSAGES.NOT_FOUND,
                    result.error
                );
                return
            }
            let api_key = result;

            // get prestashop user details
            var { variables, result } = await db.execute(
                db_constants.DB_CONSTANTS_ACCOUNT.GET_SHOPIFY_USER,
                [fby_id]
            );
            isEmpty = (helpers.isEmpty(result)
                && helpers.isEmpty(result[0]));

            if (!isEmpty) {
                let set_response = {
                    details: []
                };
                /* prestashop_account loop start */
                for (const prestaAccount of result) {
                    let dt = dateTime.create();
                    let new_cron_id = cron_id;
                    let exist_cron = 0;

                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_ACCOUNT.BULK_CRON_LOG,
                        [fby_id, cron_name, dt.format('Y-m-d')]
                    );
                    if (result.length > 0) {
                        new_cron_id = variables.cron_id;
                        exist_cron = 1;
                    }

                    let response = await fbyService.getStockList(api_key, prestaAccount, req, exist_cron, fby_id, cron_name, new_cron_id)
                    set_response.details.push(response);
                }
                /* prestashop_account loop end */

                setTimeout(() => {
                    // res.send(set_response);
                    helpers.sendSuccess(
                        res,
                        constants.HTTPSTATUSCODES.OK,
                        constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                        set_response,
                    );
                }, 15000);


            } else {
                let message = {
                    fby_user_id: req.query.fby_user_id,
                    query_action: constants.CUSTOM_MESSAGES.GET_PRESTASHOP_USER
                }
                helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.NOT_FOUND,
                    constants.ERRORCODES.NOT_FOUND,
                    constants.ERRORMESSAGES.NOT_FOUND,
                    message
                );
            }
        } else {
            let message = {
                fby_user_id: req.query.fby_user_id,
                query_action: constants.CUSTOM_MESSAGES.GET_USER
            }
            helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                message
            );
        }

        //after finish update cron status as 0
        res.on('finish', async function () {
            var dt = dateTime.create();
            let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
            await db.execute(
                db_constants.DB_CONSTANTS_CRON.UPDATE_CRONPROCESS,
                inputs
            );
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
* Send Stoks to PrestaShop
* this function will check fby_user_id through 'user' and 'prestashop' table.
* if all ok, then it will get all the user credential from 'prestashop table'.
* then it will get products of same 'fby_user_id' and 'domain' from product table and update product quantity in prestashop stock_availales
*/
exports.pushStockPresta = async (req, res, operationId) => {
    let cron_name = "push_stock_presta";
    let cron_id = operationId;

    //log info
    logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body });
    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
    await db.execute(
        db_constants.DB_CONSTANTS_CRON.INSERT_CRONPROCESS,
        inputs
    );


    // get user details
    var { variables, result } = await db.execute(
        db_constants.DB_CONSTANTS_ACCOUNT.USER,
        [req.query.fby_user_id]
    );
    let isEmpty = (helpers.isEmpty(result)
        && helpers.isEmpty(result[0]));

    if (!isEmpty) {
        let fby_id = req.query.fby_user_id;
        // get prestashop user details
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ACCOUNT.GET_SHOPIFY_USER,
            [fby_id]
        );
        isEmpty = (helpers.isEmpty(result)
            && helpers.isEmpty(result[0]));

        if (!isEmpty) {
            let set_response = {
                details: []
            };
            /* prestashop_account loop start */
            for (const prestaAccount of result) {
                // get product details to update product quantity
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_PRODUCT.SEND_NEW_QUANTITY,
                    [fby_id, prestaAccount.domain]
                );

                if (result.length > 0) {
                    let products = result;
                    let response = await updateQuantityPrestashop(products, prestaAccount, fby_id, cron_name, cron_id);
                    set_response.details.push(response)
                } else {
                    let message = {
                        code: constants.HTTPSTATUSCODES.NOT_FOUND,
                        error_type: constants.ERRORCODES.NOT_FOUND,
                        domain: prestaAccount.domain,
                        action: constants.CUSTOM_MESSAGES.GET_PRODUCT_BY_DOMAIN
                    }
                    set_response.details.push(message)
                }

            }
            /* prestashop_account loop end */
            setTimeout(() => {
                if (!res.headersSent) {
                    // res.send(set_response);
                    helpers.sendSuccess(
                        res,
                        constants.HTTPSTATUSCODES.OK,
                        constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                        set_response,
                    );
                }
            }, 15000);
        } else {
            let message = {
                fby_user_id: req.query.fby_user_id,
                query_action: constants.CUSTOM_MESSAGES.GET_PRESTASHOP_USER
            }
            helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                message
            );
        }
    } else {
        let message = {
            fby_user_id: req.query.fby_user_id,
            query_action: constants.CUSTOM_MESSAGES.GET_USER
        }
        helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.NOT_FOUND,
            constants.ERRORCODES.NOT_FOUND,
            constants.ERRORMESSAGES.NOT_FOUND,
            message
        );
    }




    //after finish update cron status as 0
    res.on('finish', async function () {
        var dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        await db.execute(
            db_constants.DB_CONSTANTS_CRON.UPDATE_CRONPROCESS,
            inputs
        );
    });
}



/*-----------internal functions for Products Start---------- */
/*  
* function for getting products
*/
const getProducts = async (req, res, prestaAccount, exist_cron, fby_id, cron_name, cron_id) => {

    let details = {
        request: {
            operationId: cron_id
        },
        response: null,
    };
    let set_response = {};
    /* prestashop account loop start */
    for (const client of prestaAccount) {
        req.body.ownerCode = client.owner_code;
        req.body.channel.name = channel;
        let lim = 100;
        client.api_key = helpers.getDecryptedData(client.api_key);
        /**
         * 1st Url to get all product details from prestashop
         */
        for (let offset = 0, plen = 1; plen != 0; offset += lim) {
            try {
                let URL = `http://${client.api_key}@${client.domain}/api/products/`;
                let options = {
                    output_format: 'JSON',
                    display: 'full',
                    limit: `${offset},${lim}`,
                };

                let response = await axios({
                    url: URL,
                    method: "get",
                    params: options,
                }).then(async (response) => {
                    return response;
                })
                    .catch(async (error) => {
                        return error.response;
                    })
                if (response != undefined && response.data != undefined && (response.data.products) && (response.data.products).length > 0) {
                    let products = response.data.products;
                    let response_data = [];
                    let success_data = [];
                    let error_data = [];
                    /* Product Loop start */
                    for (const product of products) {
                        try {
                            /**
                            * 2nd Url to get variation products if a product have variations
                            */
                            let combination_data = null;
                            let comination_URL = `http://${client.api_key}@${client.domain}/api/combinations/`;
                            let comination_options = {
                                output_format: "JSON",
                                display: "full",
                                "filter[id_product]": product.id,
                            };
                            await axios({ url: comination_URL, method: "get", params: comination_options })
                                .then(async (response) => {
                                    if (!helpers.isEmpty(response.data)
                                        && response.data.combinations != undefined
                                        && response.data.combinations != null
                                        && response.data.combinations.length > 0
                                    ) {
                                        combination_data = response.data.combinations;
                                    } else {
                                        combination_data = [];
                                    }
                                })
                                .catch(async (error) => {
                                    combination_data = [];
                                })

                            if (combination_data.length > 0) {

                                let error_count = 0;
                                /* variation loop start */
                                for (const combination of combination_data) {
                                    /**
                                    * 3rd Url to get quantity of a product variant by it's id_attribute
                                    */
                                    let URL = `http://${client.api_key}@${client.domain}/api/stock_availables/`;
                                    let options = {
                                        output_format: "JSON",
                                        display: "full",
                                        "filter[id_product]": product.id,
                                        "filter[id_product_attribute]": combination.id,
                                    };
                                    await axios({
                                        url: URL,
                                        method: "get",
                                        params: options,
                                    })
                                        .then(async (response) => {
                                            let stock_available = response.data.stock_availables;
                                            let img = "";
                                            let flag = 0;
                                            let bar_code = 0;
                                            let inventory_item_id = null;
                                            let location_id = 0;
                                            if (combination.location != "") {
                                                location_id = combination.location;
                                            }
                                            let total_price = parseFloat(product.price);
                                            if (combination.price != "") {
                                                let combination_price = parseFloat(combination.price);
                                                total_price = parseFloat(total_price) + parseFloat(combination_price);
                                            }
                                            if (combination.reference == "") {
                                                flag = 1;
                                            }
                                            if (combination.ean13 != "") {
                                                bar_code = combination.ean13;
                                            }
                                            if (combination.isbn != "") {
                                                bar_code = combination.isbn;
                                            }
                                            if (combination.upc != "") {
                                                bar_code = combination.upc;
                                            }
                                            if (combination.mpn != "") {
                                                bar_code = combination.mpn;
                                            }


                                            if (flag == 0 && bar_code) {
                                                let fby_user_id = fby_id;
                                                let domain = client.domain;
                                                let owner_code = client.owner_code;
                                                let sku = combination.reference;
                                                let barcode = bar_code;
                                                let item_id = combination.id;
                                                let title = product.name;
                                                let item_product_id = product.id;
                                                let inventory_quantity = stock_available[0].quantity;
                                                let image = img;
                                                let price = total_price;

                                                //insert products got from prestashop into products table
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
                                                    inventory_item_id,
                                                    inventory_quantity,
                                                    inventory_quantity,
                                                    image,
                                                    price,
                                                    cron_name,
                                                    cron_id,
                                                    location_id
                                                ];
                                                let { variables, result } = await db.execute(
                                                    db_constants.DB_CONSTANTS_PRODUCT.INSERT_PRODUCT,
                                                    inputs
                                                );
                                                success_data.push(combination);

                                            } else {
                                                let msg = {
                                                    message: "barcode or sku empty",
                                                    data: combination,
                                                };
                                                success_data.push(msg);
                                            }
                                        })
                                        .catch((error) => {
                                            error_count++;
                                            let details = {
                                                request: {
                                                    operationId: cron_id,
                                                },
                                                response: error.stack,
                                            };
                                            //log error
                                            logger.logError(cron_name + " error", details);

                                            error_data.push(error)
                                        });
                                }
                                /* variation loop end */
                                //set response
                                if (error_count) {
                                    let msg = { error: { data: error_data } };
                                    set_response[product.id] = msg;
                                } else {
                                    let msg = { success: { data: success_data } };
                                    set_response[product.id] = msg;
                                }
                                success_data = [];
                                error_data = [];
                            } else {
                                /**
                                * 3rd Url to get quantity of a perticular product by it's id
                                */
                                let URL = `http://${client.api_key}@${client.domain}/api/stock_availables/`;
                                let options = {
                                    output_format: "JSON",
                                    display: "full",
                                    "filter[id_product]": product.id,
                                    "filter[id_product_attribute]": 0,
                                };
                                await axios({
                                    url: URL,
                                    method: "get",
                                    params: options,
                                })
                                    .then(async (response) => {
                                        let stock_available = response.data.stock_availables;
                                        let img = "";
                                        let flag = 0;
                                        let bar_code = 0;
                                        let inventory_item_id = null;
                                        let location_id = 0;
                                        if (product.location != "") {
                                            location_id = product.location;
                                        }
                                        if (product.reference == "") {
                                            flag = 1;
                                        }
                                        if (product.ean13 != "") {
                                            bar_code = product.ean13;
                                        }
                                        if (product.isbn != "") {
                                            bar_code = product.isbn;
                                        }
                                        if (product.upc != "") {
                                            bar_code = product.upc;
                                        }
                                        if (product.mpn != "") {
                                            bar_code = product.mpn;
                                        }


                                        if (flag == 0 && bar_code) {
                                            let fby_user_id = fby_id;
                                            let domain = client.domain;
                                            let owner_code = client.owner_code;
                                            let sku = product.reference;
                                            let barcode = bar_code;
                                            let item_id = product.id;
                                            let title = product.name;
                                            let item_product_id = 0;
                                            let inventory_quantity = stock_available[0].quantity;
                                            let image = img;
                                            let price = product.price;

                                            //insert products got from prestashop into products table
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
                                                inventory_item_id,
                                                inventory_quantity,
                                                inventory_quantity,
                                                image,
                                                price,
                                                cron_name,
                                                cron_id,
                                                location_id
                                            ];
                                            let { variables, result } = await db.execute(
                                                db_constants.DB_CONSTANTS_PRODUCT.INSERT_PRODUCT,
                                                inputs
                                            );
                                            response_data.push(product);
                                            //set response
                                            let msg = { success: { data: product } };
                                            set_response[product.id] = msg;
                                        } else {
                                            let msg = {
                                                success: {
                                                    message: "barcode or sku empty",
                                                    data: product,
                                                },
                                            };
                                            set_response[product.id] = msg;
                                        }
                                    })
                                    .catch((error) => {
                                        let details = {
                                            request: {
                                                operationId: cron_id,
                                            },
                                            response: error.stack,
                                        };
                                        //log error
                                        logger.logError(cron_name + " error", details);
                                        //set response
                                        let msg = { error: { data: error.stack } };
                                        set_response[product.id] = msg;
                                    });
                            }
                        } catch (error) {
                            details.response = error.stack;
                            //log error
                            logger.logError(cron_name + " error", details);
                        }
                    }
                    /* Product Loop end */
                    logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body, ...response_data });
                } else {
                    plen = 0;
                    let error = JSON.parse(CircularJSON.stringify(response));
                    details.response = error.data;

                    if (exist_cron) {
                        let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(error.data), fby_id, exist_cron];
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                            inputs
                        );
                        //log error
                        logger.logError(cron_name + " error", details);
                        //send response
                        let msg = { error: { message: server_constants.GET_PRODUCT_ERROR, data: error.data } };
                        set_response[client.domain] = msg;
                    } else {
                        //mail
                        mail.GetProdMail(channel, cron_name, cron_id, fby_id, JSON.stringify(error.data));
                        //store update product status error log
                        let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(error.data), fby_id, exist_cron];
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                            inputs
                        );
                        //log error
                        logger.logError(cron_name + " error", details);
                        //send response
                        let msg = { error: { message: server_constants.GET_PRODUCT_ERROR, data: error.data } };
                        set_response[client.domain] = msg;
                    }
                }
            }
            catch (err) {
                //console.log('err: ', err.message);

            }
        }
    }
    /* prestashop account loop end */
    return (set_response);
}
/*  
* function for update prestashop product quantity
*/
const updateQuantityPrestashop = async (products, prestaAccount, fby_id, cron_name, new_cron_id) => {
    let set_response = {};
    let details = {
        request: {
            operationId: new_cron_id
        },
        response: null,
    };
    prestaAccount.api_key = await helpers.getDecryptedData(prestaAccount.api_key);
    /* product loop start */
    for (const item of products) {
        let cron_id = new_cron_id;
        let exist_cron = 0;
        if (item.cron_name == cron_name && item.cron_id) {
            cron_id = item.cron_id;
            exist_cron = 1;
        } else {
            /* Update with new cron id */
            let updt_time = dateTime.create();
            let inputs = [item.sku, cron_name, cron_id, updt_time.format('Y-m-d H:M:S'), item.item_id];

        }

        let stock_url = `http://${prestaAccount.api_key}@${prestaAccount.domain}/api/stock_availables/`;
        let stock_options = {
            display: "full",
            output_format: "JSON",
            "filter[id_product]": item.item_product_id,
            "filter[id_product_attribute]": item.item_id
        }
        if (item.item_product_id == 0) {
            stock_options = {
                display: "full",
                output_format: "JSON",
                "filter[id_product]": item.item_id,
                "filter[id_product_attribute]": item.item_product_id
            }
        }
        await axios({
            url: stock_url,
            method: "get",
            params: stock_options,
        }).then(async (response) => {
            let stock_availables = (response.data.stock_availables[0]);

            let xmlBodyStr = xmlSchema.getStockavAilableSchema(stock_availables, item);

            await axios({
                url: stock_url,
                method: "put",
                params: stock_options,
                headers: { 'Content-Type': 'text/plain' },
                data: xmlBodyStr,
            }).then(async (response) => {
                details.response = response.data;
                let updt_time = dateTime.create();
                let inputs = [fby_id, item.sku, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];//, item.item_id];
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_PRODUCT.updateProductAftrSndChanl,
                    inputs
                );
                //info log
                logger.logInfo("action " + cron_name, details);
                //set response
                let msg = { success: { message: server_constants.PUSH_STOCK_CHANNEL_SUCCESS, data: response.data } };
                set_response[item.sku] = msg;
            })
                .catch(async (err) => {
                    details.response = err;
                    if (exist_cron) {
                        /* Update products count=count+1 and update error log */
                        let updt_time = dateTime.create();
                        let inputs = [fby_id, item.sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(err.response.data), updt_time.format('Y-m-d H:M:S')];
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_CRON.FBY_PRODUCT_ERR_MANAGE,
                            inputs
                        );
                        //log error
                        logger.logError(cron_name + " error", details);
                        //set response
                        let msg = { error: { message: server_constants.PUSH_STOCK_CHANNEL_ERROR, data: err.response.data } };
                        set_response[item.sku] = msg;
                    } else {
                        let updt_time = dateTime.create();
                        let inputs = [fby_id, item.sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(err.response.data), updt_time.format('Y-m-d H:M:S')];

                        let msg = { error: { message: server_constants.PUSH_STOCK_CHANNEL_ERROR, data: err.response.data } };
                        set_response[item.sku] = msg;
                    }
                })
        })
            .catch(async (err) => {
                details.response = err;
                if (exist_cron) {
                    /* Update products count=count+1 and update error log */
                    let updt_time = dateTime.create();
                    let inputs = [fby_id, item.sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(err.response.data), updt_time.format('Y-m-d H:M:S')];
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_CRON.FBY_PRODUCT_ERR_MANAGE,
                        inputs
                    );
                    //log error
                    logger.logError(cron_name + " error", details);
                    //set response
                    let msg = { error: { message: server_constants.PUSH_STOCK_CHANNEL_ERROR, data: err.response.data } };
                    set_response[item.sku] = msg;
                } else {
                    let updt_time = dateTime.create();
                    let inputs = [fby_id, item.sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(err.response.data), updt_time.format('Y-m-d H:M:S')];
                    /* Update products count=count+1 and flag 1 */
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_CRON.FBY_PRODUCT_ERR_MANAGE,
                        inputs
                    );
                    //mail
                    mail.PushProdMail(channel, cron_name, cron_id, fby_id, JSON.stringify(err.response.data));
                    //store update quantity catch cron log
                    inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(err.response.data), fby_id];
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_CRON.CRON_ERROR_LOG,
                        inputs
                    );
                    //log error
                    logger.logError(cron_name + " error", details);
                    //set response
                    let msg = { error: { message: server_constants.PUSH_STOCK_CHANNEL_ERROR, data: err.response.data } };
                    set_response[item.sku] = msg;
                }

            })
    }
    /* product loop end */
    return set_response;
}

/*-----------internal functions for Products End---------- */


/**--------------Orders------------------**/

/*
* Get Oredrs from PrestaShop
* this function will check fby_user_id through 'user' and 'prestashop' table.
* if all ok, then it will get unshiped orders from prestashop channel and insert into Order_details and order_master table.
*/
exports.getPrestaOrders = async (req, res, operationId) => {
    let cron_name = "get_presta_orders";
    let cron_id = operationId;

    //log info
    logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body });

    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
    await db.execute(
        db_constants.DB_CONSTANTS_CRON.INSERT_CRONPROCESS,
        inputs
    );


    // get user details
    var { variables, result } = await db.execute(
        db_constants.DB_CONSTANTS_ACCOUNT.USER,
        [req.query.fby_user_id]
    );
    let isEmpty = (helpers.isEmpty(result)
        && helpers.isEmpty(result[0]));

    if (!isEmpty) {
        let fby_id = req.query.fby_user_id;
        // get prestashop user details
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ACCOUNT.GET_SHOPIFY_USER,
            [fby_id]
        );
        isEmpty = (helpers.isEmpty(result)
            && helpers.isEmpty(result[0]));

        if (result.length > 0) {
            let prestaAccount = result;
            let dt = dateTime.create();
            let new_cron_id = cron_id;
            let exist_cron = 0;

            var { variables, result } = await db.execute(
                db_constants.DB_CONSTANTS_ACCOUNT.BULK_CRON_LOG,
                [fby_id, cron_name, dt.format('Y-m-d')]
            );
            if (result.length > 0) {
                new_cron_id = variables.cron_id;
                exist_cron = 1;
            }

            let response = await getOrders(req, res, prestaAccount, exist_cron, fby_id, cron_name, new_cron_id)

            // res.send(response);
            helpers.sendSuccess(
                res,
                constants.HTTPSTATUSCODES.OK,
                constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                response,
            );
        } else {
            let message = {
                fby_user_id: req.query.fby_user_id,
                query_action: constants.CUSTOM_MESSAGES.GET_PRESTASHOP_USER
            }
            helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                message
            );
        }
    } else {
        let message = {
            fby_user_id: req.query.fby_user_id,
            query_action: constants.CUSTOM_MESSAGES.GET_USER
        }
        helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.NOT_FOUND,
            constants.ERRORCODES.NOT_FOUND,
            constants.ERRORMESSAGES.NOT_FOUND,
            message
        );
    }

    //after finish update cron status as 0
    res.on('finish', async function () {
        var dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        await db.execute(
            db_constants.DB_CONSTANTS_CRON.UPDATE_CRONPROCESS,
            inputs
        );
    });

}

/*
* Send Oredrs to Fby
* this function will check fby_user_id through 'user' and 'order_masters' table.
* if all ok, then it will get order details from order_masters table having status '0' and send to fby through fby controler.
*/

exports.sendOrdersFby = async (req, res, operationId) => {
    let cron_name = "send_Orders_Fby";
    let cron_id = operationId;

    //log info
    logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body });

    try {
        //when url hits, it insert the cron details and make status 1 as its running
        let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
        await db.execute(
            db_constants.DB_CONSTANTS_CRON.INSERT_CRONPROCESS,
            inputs
        );

        /* get user details from users table */
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ACCOUNT.USER,
            [req.query.fby_user_id]
        );
        if (variables.orderSync == 1) {
            let isEmpty = (helpers.isEmpty(result)
                && helpers.isEmpty(result[0]));

            if (!isEmpty) {
                let user = variables;
                let fby_id = req.query.fby_user_id;

                /* get JWT token from fby */
                var { result } = await fbyService.getFBYToken(res, user, cron_name, cron_id);
                if (result.error) {
                    helpers.sendError(
                        res,
                        constants.HTTPSTATUSCODES.UNAUTHORIZED,
                        constants.ERRORCODES.NOT_FOUND,
                        constants.ERRORMESSAGES.NOT_FOUND,
                        result.error
                    );
                    return
                }
                let api_key = result;

                /**
                  * get order details from order_masters table having same 'fby_user_id' as in 'user' table and fby_send_status 0.
                  * Once successfully send to fby the status be set to 1.
                */
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_ORDER.GET_UNSEND_ORDER,
                    [fby_id]
                );

                if (result.length > 0) {
                    let orders = result;
                    let set_response = {
                        details: []
                    };
                    /* Order loop start */
                    for (const order of orders) {
                        let new_cron_id = cron_id;
                        let exist_cron = 0;
                        if (order.cron_name == cron_name && order.cron_id) {
                            new_cron_id = order.cron_id;
                            exist_cron = 1;
                        } else {
                            /* Update with new cron id */
                            let updt_time = dateTime.create();
                            let inputs = [order.order_no, cron_name, new_cron_id, updt_time.format('Y-m-d H:M:S')];
                            await db.execute(
                                db_constants.DB_CONSTANTS_ORDER.UPDATE_ORDER_CRON,
                                inputs
                            );
                        }
                        let response = await fbyService.insertOrder(api_key, order, exist_cron, cron_name, new_cron_id);
                        set_response.details.push(response);
                    }
                    /* Order loop end */
                    setTimeout(() => {
                        helpers.sendSuccess(
                            res,
                            constants.HTTPSTATUSCODES.OK,
                            constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                            set_response,
                        );
                    }, 15000);

                } else {
                    let message = {
                        fby_user_id: fby_id,
                        query_action: constants.CUSTOM_MESSAGES.GET_UNSEND_ORDER
                    }
                    helpers.sendError(
                        res,
                        constants.HTTPSTATUSCODES.NOT_FOUND,
                        constants.ERRORCODES.NOT_FOUND,
                        constants.ERRORMESSAGES.NOT_FOUND,
                        message
                    );
                }

            } else {
                let message = {
                    fby_user_id: req.query.fby_user_id,
                    query_action: constants.CUSTOM_MESSAGES.GET_USER
                }
                helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.NOT_FOUND,
                    constants.ERRORCODES.NOT_FOUND,
                    constants.ERRORMESSAGES.NOT_FOUND,
                    message
                );
            }
        }
        else {
            if (!res.headersSent) {

                helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.BAD_REQUEST,
                    constants.ERRORCODES.BAD_REQUEST,
                    constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG,
                    constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG
                );
            }
        }
    }
    catch (error) {
        //console.log('\nsendOrders Fbyerror:', req.body);
        //console.log(error);
        //console.log('\n');


    }
    //after finish update cron status as 0
    res.on('finish', async function () {
        var dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        await db.execute(
            db_constants.DB_CONSTANTS_CRON.UPDATE_CRONPROCESS,
            inputs
        );
    });

}

/*
* Send Canceled Oredrs to Fby
* this function will check fby_user_id through 'user' and 'prestashop_account' table.
* if all ok, then it will get order details from 'order_details' table having is_canceled_fby '0' and send to fby through fby controler.
*/
exports.sendCanceledOrdersFby = async (req, res, operationId) => {
    let cron_name = "send_Canceled_Orders_Fby";
    let cron_id = operationId;

    //log info
    logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body });

    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
    await db.execute(
        db_constants.DB_CONSTANTS_CRON.INSERT_CRONPROCESS,
        inputs
    );

    // get user details
    var { variables, result } = await db.execute(
        db_constants.DB_CONSTANTS_ACCOUNT.USER,
        [req.query.fby_user_id]
    );
    let isEmpty = (helpers.isEmpty(result)
        && helpers.isEmpty(result[0]));

    if (!isEmpty) {
        let user = variables;
        /* get JWT token from fby */
        var { result } = await fbyService.getFBYToken(res, user, cron_name, cron_id);
        if (result.error) {
            helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.UNAUTHORIZED,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                result.error
            );
            return
        }
        let api_key = result;

        let fby_id = req.query.fby_user_id;
        // get prestashop user details
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ACCOUNT.GET_SHOPIFY_USER,
            [fby_id]
        );
        isEmpty = (helpers.isEmpty(result)
            && helpers.isEmpty(result[0]));

        if (result.length > 0) {
            let prestaAccount = result;
            let set_response = {
                details: []
            };
            /* prestashop_account loop start */
            for (const client of prestaAccount) {
                let inputs = [fby_id, client.id, client.channel_code, channel]

                // get canceled order details
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_ORDER.GET_CANCELED_ORDERS,
                    inputs
                );

                if (result.length > 0) {
                    /* order_details loop start */
                    for (const order of result) {
                        let new_cron_id = cron_id;
                        let exist_cron = 0;
                        if (order.cron_name == cron_name && order.cron_id) {
                            new_cron_id = order.cron_id;
                            exist_cron = 1;
                        } else {
                            /* Update with new cron id */
                            let updt_time = dateTime.create();
                            let inputs = [order.order_no, cron_name, new_cron_id, updt_time.format('Y-m-d H:M:S')];
                            await db.execute(
                                db_constants.DB_CONSTANTS_ORDER.UPDATE_CANCEL_ORDER_CRON,
                                inputs
                            );
                        }
                        let response = await fbyService.insertCanceledOrder(api_key, order, exist_cron, cron_name, new_cron_id);
                        set_response.details.push(response);
                    }
                    /* order_details loop end */
                } else {
                    let message = {
                        code: constants.HTTPSTATUSCODES.NOT_FOUND,
                        error_type: constants.ERRORCODES.NOT_FOUND,
                        domain: prestaAccount.domain,
                        action: constants.CUSTOM_MESSAGES.GET_CANCELED_ORDERS
                    }
                    set_response.details.push(message)
                }
            }
            /* prestashop_account loop end */

            setTimeout(() => {
                helpers.sendSuccess(
                    res,
                    constants.HTTPSTATUSCODES.OK,
                    constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                    set_response,
                );
            }, 15000);
        } else {
            let message = {
                fby_user_id: req.query.fby_user_id,
                query_action: constants.CUSTOM_MESSAGES.GET_PRESTASHOP_USER
            }
            helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                message
            );
        }
    } else {
        let message = {
            fby_user_id: req.query.fby_user_id,
            query_action: constants.CUSTOM_MESSAGES.GET_USER
        }
        helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.NOT_FOUND,
            constants.ERRORCODES.NOT_FOUND,
            constants.ERRORMESSAGES.NOT_FOUND,
            message
        );
    }


    //after finish update cron status as 0
    res.on('finish', async function () {
        var dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        await db.execute(
            db_constants.DB_CONSTANTS_CRON.UPDATE_CRONPROCESS,
            inputs
        );
    });
}

/*
* Get Tracking Numer From Fby
* this function will check fby_user_id through 'user' table.
* if all ok, then it will get user credentials and get active notifiable orders/traking orders from fby through fby controller.
*/
exports.getFbyTraknumber = async (req, res, operationId) => {
    let cron_name = "get_track_number";
    let cron_id = operationId;

    //log info
    logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body });

    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
    await db.execute(
        db_constants.DB_CONSTANTS_CRON.INSERT_CRONPROCESS,
        inputs
    );

    /* get user details from users table */
    var { variables, result } = await db.execute(
        db_constants.DB_CONSTANTS_ACCOUNT.USER,
        [req.query.fby_user_id]
    );
    let isEmpty = (helpers.isEmpty(result)
        && helpers.isEmpty(result[0]));

    if (!isEmpty) {
        let user = variables;
        let fby_id = req.query.fby_user_id;
        let dt = dateTime.create();
        let new_cron_id = cron_id;
        let exist_cron = 0;

        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ACCOUNT.BULK_CRON_LOG,
            [fby_id, cron_name, dt.format('Y-m-d')]
        );
        if (result.length > 0) {
            new_cron_id = variables.cron_id;
            exist_cron = 1;
        }

        /* get JWT token from fby */
        var { result } = await fbyService.getFBYToken(res, user, cron_name, cron_id);
        if (result.error) {
            helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.UNAUTHORIZED,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                result.error
            );
            return
        }
        let api_key = result;

        /*
        * get order details from 'order_details' table having same 'fby_user_id' as in 'user' table and is_trackable 0.
        */
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ORDER.GET_UNTRACKED_ORDERS,
            [fby_id, channel]
        );

        if (result.length > 0) {
            let orders = result;
            let set_response = {
                details: []
            };
            /* order loop start */
            //for (const order_details of orders) {
            const order_details = orders[0];
            let response = await fbyService.getTrackList(api_key, fby_id, order_details.owner_code, exist_cron, cron_name, new_cron_id);
            set_response.details.push(response);
            //}
            /* order loop end */
            setTimeout(() => {
                helpers.sendSuccess(
                    res,
                    constants.HTTPSTATUSCODES.OK,
                    constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                    set_response,
                );
            }, 15000);

        } else {
            let message = {
                fby_user_id: fby_id,
                query_action: constants.CUSTOM_MESSAGES.GET_UNTRACKED_ORDER
            }
            helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                message
            );
        }

    } else {
        let message = {
            fby_user_id: req.query.fby_user_id,
            query_action: constants.CUSTOM_MESSAGES.GET_USER
        }
        helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.NOT_FOUND,
            constants.ERRORCODES.NOT_FOUND,
            constants.ERRORMESSAGES.NOT_FOUND,
            message
        );
    }

    //after finish update cron status as 0
    res.on('finish', async function () {
        var dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id];
        await db.execute(
            db_constants.DB_CONSTANTS_CRON.UPDATE_CRONPROCESS,
            inputs
        );
    });
}

/*
* Send Tracking number to PrestaShop
* this function will check fby_user_id through 'user' and 'PrestaShop_account' table.
* if all ok, then it will get all the user credential from 'PrestaShop_account' table.
* then it will get orders of same 'fby_user_id', 'account_id' and having is_trackable 1 from order_details table and add tracking information in shopify channel
*/
exports.pushTrackPresta = async (req, res, operationId) => {
    let cron_name = "push_Track_Presta";
    let cron_id = operationId;

    //log info
    logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body });

    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
    await db.execute(
        db_constants.DB_CONSTANTS_CRON.INSERT_CRONPROCESS,
        inputs
    );

    // get user details
    var { variables, result } = await db.execute(
        db_constants.DB_CONSTANTS_ACCOUNT.USER,
        [req.query.fby_user_id]
    );
    let isEmpty = (helpers.isEmpty(result)
        && helpers.isEmpty(result[0]));

    if (!isEmpty) {
        let fby_id = req.query.fby_user_id;
        // get prestashop user details
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ACCOUNT.GET_SHOPIFY_USER,
            [fby_id]
        );
        isEmpty = (helpers.isEmpty(result)
            && helpers.isEmpty(result[0]));

        if (!isEmpty) {
            let set_response = {
                details: []
            };
            /* prestashop_account loop start */
            for (const prestaAccount of result) {
                /**for each prestashop_account id
                 * get order details from order_masters table where its account_id matches with prestashop_account table id
                */
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_ORDER.GET_ORDER_BY_ACCOUNT,
                    [fby_id, prestaAccount.id]
                );

                if (result.length > 0) {
                    let orders = result;
                    let response = await pushTrackingPresta(orders, prestaAccount, fby_id, cron_name, cron_id);
                    set_response.details.push(response)
                } else {
                    let message = {
                        code: constants.HTTPSTATUSCODES.NOT_FOUND,
                        error_type: constants.ERRORCODES.NOT_FOUND,
                        domain: prestaAccount.domain,
                        action: constants.CUSTOM_MESSAGES.GET_ORDER_BY_ACCOUNT
                    }
                    set_response.details.push(message)
                }

            }
            /* prestashop_account loop end */
            setTimeout(() => {
                if (!res.headersSent) {
                    helpers.sendSuccess(
                        res,
                        constants.HTTPSTATUSCODES.OK,
                        constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                        set_response,
                    );
                }
            }, 15000);
        } else {
            let message = {
                fby_user_id: req.query.fby_user_id,
                query_action: constants.CUSTOM_MESSAGES.GET_PRESTASHOP_USER
            }
            helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                message
            );
        }
    } else {
        let message = {
            fby_user_id: req.query.fby_user_id,
            query_action: constants.CUSTOM_MESSAGES.GET_USER
        }
        helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.NOT_FOUND,
            constants.ERRORCODES.NOT_FOUND,
            constants.ERRORMESSAGES.NOT_FOUND,
            message
        );
    }


    //after finish update cron status as 0
    res.on('finish', async function () {
        var dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id];
        await db.execute(
            db_constants.DB_CONSTANTS_CRON.UPDATE_CRONPROCESS,
            inputs
        );
    });

}


/*-----------internal functions for Orders Start---------- */
/*  
* function for getting orders
*/
const getOrders = async (req, res, prestaAccount, exist_cron, fby_id, cron_name, cron_id) => {

    let fby_user_id = fby_id;
    let logMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;
    let details = {
        request: {
            operationId: cron_id
        },
        response: null,
    };
    let set_response = {};
    var updated_at = moment();
    updated_at = updated_at.subtract(2, "days");
    updated_at = updated_at.format(MOMENT_DATE_FORMAT);

    let batchInfoListDB = [];
    let order_no_log = '';

    let lim = 100;

    if (req.query.updated_after) {
        updated_at = req.query.updated_after;
    }
    if (req.query.item_per_page) {
        lim = parseInt(req.query.item_per_page);
    }

    var now = moment();
    now = now.format(MOMENT_DATE_FORMAT);

    let isCanSync = false;
    /* prestashop account loop start */
    for (const client of prestaAccount) {
        let orderSyncStartDate = client.orderSyncStartDate;
        if (orderSyncStartDate != null || orderSyncStartDate != '') {
            if (now > orderSyncStartDate) {
                isCanSync = true;
            }
            else {
                isCanSync = false;
                set_response[client.domain] = { "cron": cron_name, "updated_at": updated_at, message: "Order import date is not set." };
                return set_response;
            }

        }
        req.body.ownerCode = client.owner_code;
        req.body.channel.name = channel;
        client.api_key = await helpers.getDecryptedData(client.api_key);

        if (isCanSync) {

            for (let offset = 0, plen = 1; plen != 0; offset += lim) {

                let URL = `http://${client.api_key}@${client.domain}/api/orders/`;
                let options = {
                    output_format: 'JSON',
                    display: 'full',
                    limit: `${offset},${lim}`,
                    "filter[date_upd]": `[${updated_at},${now}]`,
                    date: 1,
                };
                await axios({
                    url: URL,
                    method: "get",
                    params: options,
                })
                    .then(async (response) => {
                        try {
                            if (response != undefined && response != null
                                && response.data != undefined && response.data != null
                                && response.data.orders != undefined && response.data.orders != null
                                && Array.isArray(response.data.orders)
                                && (response.data.orders).length > 0

                            ) {

                                plen = (response.data.orders).length;
                                let orders = response.data.orders;
                                let response_data = {};
                                let msg = null;
                                /* Order Loop start */
                                for (const jsonData of orders) {

                                    try {
                                        order_no_log = jsonData.id;
                                        let infoItem = new Entities.CCLogs(
                                            fby_user_id,
                                            order_no_log,
                                            '',
                                            logMessage,
                                            jsonData,
                                            server_constants.LOG_LEVEL.ERROR,
                                            server_constants.FBY_ALERT_CODES.ORDER_SYNC,
                                            cron_name,
                                            cron_id
                                        );
                                        batchInfoListDB.push(infoItem);
                                    }
                                    catch (error) {
                                        //console.log();
                                        //console.log(error);

                                    }
                                    let payment = await helpers.getOrderStatus(jsonData.current_state);

                                    if (payment == "paid" || payment == "cod") {
                                        let date_created = dateTime.create(jsonData.date_add).format('Y-m-d H:M:S');
                                        let date_modified = dateTime.create(jsonData.date_upd).format('Y-m-d H:M:S');

                                        let channel_code = client.channel_code;
                                        let owner_code = client.owner_code;
                                        let account_id = client.id;
                                        let currency_code = client.currency_code;
                                        fby_user_id = fby_id;
                                        let order_no = jsonData.id;
                                        let seller_order_id = jsonData.reference;
                                        let total_order = jsonData.total_paid_tax_incl;
                                        let total_items = (jsonData.associations.order_rows).length;
                                        let total_tax = null;//not set in api
                                        let total_discount = parseFloat(jsonData.total_discounts);
                                        let total_items_price = jsonData.total_products_wt;
                                        let payment_method = jsonData.payment;
                                        let sales_record_no = order_no;
                                        let purchase_date = date_created;
                                        let payment_time = date_modified;
                                        let payment_status = payment;
                                        let order_status = server_constants.ORDER_STATUS;
                                        let location_id = null;
                                        let item_total_ship_price = parseFloat(jsonData.total_shipping_tax_incl);
                                        let payment_id = "";

                                        let address = null;
                                        let customer = null;
                                        let state = null;
                                        let country = null;
                                        let invoiceAddress = null;

                                        let payment_URL = `http://${client.api_key}@${client.domain}/api/order_payments/`;
                                        let payment_options = {
                                            output_format: 'JSON',
                                            display: 'full',
                                            "filter[order_reference]": seller_order_id,
                                        };
                                        // get order_payments of order 
                                        await axios({ url: payment_URL, method: "get", params: payment_options })
                                            .then((response) => {
                                                if ((response.data.order_payments).length > 0) {
                                                    let payment_data = response.data.order_payments[0];
                                                    payment_id = payment_data.transaction_id;
                                                } else {
                                                    payment_id = "";
                                                }
                                            })
                                            .catch((error) => {
                                                payment_id = "";
                                            })

                                        let customer_URL = `http://${client.api_key}@${client.domain}/api/customers/`;
                                        let customer_options = {
                                            output_format: 'JSON',
                                            display: 'full',
                                            "filter[id]": jsonData.id_customer,
                                        };
                                        let address_URL = `http://${client.api_key}@${client.domain}/api/addresses/`;
                                        let address_options = {
                                            output_format: 'JSON',
                                            display: 'full',
                                            "filter[id]": jsonData.id_address_delivery,
                                        };

                                        let orders_options = {
                                            output_format: 'JSON',
                                            display: 'full',
                                            "filter[id]": jsonData.id_address_invoice,
                                        };
                                        // get customer and address of order 
                                        await axios({ url: customer_URL, method: "get", params: customer_options })
                                            .then((response) => {
                                                if ((response.data.customers).length > 0) {
                                                    customer = response.data.customers[0];
                                                } else {
                                                    customer = null;
                                                }
                                            })
                                            .catch((error) => {
                                                customer = null;
                                            })
                                        await axios({ url: address_URL, method: "get", params: address_options })
                                            .then((response) => {
                                                if ((response.data.addresses).length > 0) {
                                                    address = response.data.addresses[0];
                                                } else {
                                                    address = null;
                                                }
                                            })
                                            .catch((error) => {
                                                address = null;
                                            })

                                        // get invoice address of order 
                                        try {
                                            await axios({ url: address_URL, method: "get", params: orders_options })
                                                .then((response) => {
                                                    if ((response.data.addresses).length > 0) {
                                                        invoiceAddress = response.data.addresses[0];
                                                    } else {
                                                        invoiceAddress = null;
                                                    }
                                                })
                                                .catch((error) => {
                                                    invoiceAddress = "";
                                                })
                                        } catch (error) {
                                            //log error
                                            logger.logError("error-->>", error);
                                        }

                                        let isEmpty = (helpers.isEmpty(address) || helpers.isEmpty(customer));

                                        if (!isEmpty) {
                                            // get states and country of order 
                                            let state_url = `http://${client.api_key}@${client.domain}/api/states/?display=full&output_format=JSON&filter[id]=${address.id_state}`;
                                            let country_url = `http://${client.api_key}@${client.domain}/api/countries/?display=full&output_format=JSON&filter[id]=${address.id_country}`;
                                            await axios.get(state_url)
                                                .then((response) => {
                                                    if ((response.data.states).length > 0) {
                                                        state = response.data.states[0];
                                                    } else {
                                                        state = null;
                                                    }
                                                })
                                                .catch((error) => {
                                                    state = null;
                                                })
                                            await axios.get(country_url)
                                                .then((response) => {
                                                    if ((response.data.countries).length > 0) {
                                                        country = response.data.countries[0];
                                                    } else {
                                                        country = null;
                                                    }
                                                })
                                                .catch((error) => {
                                                    country = null;
                                                })

                                            let isEmpty = (helpers.isEmpty(state) || helpers.isEmpty(country));

                                            if (!isEmpty) {
                                                //buyer detail
                                                let buyer_email = customer.email;
                                                let buyer_id = customer.id;
                                                let buyer_fname = customer.firstname;
                                                let buyer_lname = customer.lastname;
                                                let buyer_name = buyer_fname + ' ' + buyer_lname;

                                                //shiping address

                                                let shiper_fname = address.firstname;
                                                let shiper_lname = address.lastname;
                                                let recipient_name = shiper_fname + ' ' + shiper_lname;
                                                let shiper_company = address.company;
                                                let shiper_strt1 = address.address1;
                                                let shiper_strt2 = address.address2;
                                                let shiper_city = address.city;
                                                let shiper_state = state.name;
                                                let shiper_state_code = state.iso_code;
                                                let shiper_zip = address.postcode;
                                                let shiper_country = country.name;
                                                let shiper_country_iso2 = country.iso_code;
                                                let shiper_phone = address.phone;
                                                let shiper_email = customer.email;

                                                // Billing Address---
                                                let bill_generator_fname = invoiceAddress.firstname || '';
                                                let bill_generator_lname = invoiceAddress.lastname || '';
                                                let bill_generator_name = bill_generator_fname + ' ' + bill_generator_lname || '';
                                                let bill_company = invoiceAddress.company || '';
                                                let bill_strt1 = invoiceAddress.address1 || '';
                                                let bill_strt2 = invoiceAddress.address2 || '';
                                                let bill_city = invoiceAddress.city || '';
                                                let bill_state = state.name || '';
                                                let bill_state_code = state.iso_code || '';
                                                let bill_zip = invoiceAddress.postcode || '';
                                                let bill_country = country.name || '';
                                                let bill_country_iso2 = country.iso_code || '';
                                                let bill_phone = invoiceAddress.phone || '';

                                                let order_product_data = jsonData.associations.order_rows;

                                                let orderdetail_id = 0;
                                                let managedByChannel = false;
                                                /* line items loop start*/
                                                for (const jsonItemData of order_product_data) {

                                                    let item_tax = 0;
                                                    let exchange_rate = 0;
                                                    let order_line_item_id = jsonItemData.id;
                                                    let sku = jsonItemData.product_reference;
                                                    let order_item_id = jsonItemData.product_id;

                                                    let check_empty = helpers.isEmpty(jsonItemData.product_attribute_id);

                                                    if (check_empty) {
                                                        order_item_id = jsonItemData.product_id;
                                                    } else {
                                                        order_item_id = jsonItemData.product_attribute_id;
                                                    }

                                                    let transaction_id = jsonItemData.id;
                                                    let product_name = jsonItemData.product_name;
                                                    let quantity_purchased = jsonItemData.product_quantity;
                                                    let line_item_price = parseFloat(jsonItemData.unit_price_tax_incl);
                                                    let line_item_total_tax = item_tax * quantity_purchased;
                                                    let item_total_price_extax = line_item_price * quantity_purchased;
                                                    let item_price = line_item_price * quantity_purchased;
                                                    let item_ship_price = parseFloat(item_total_ship_price / total_items);
                                                    let promotion_discount = 0;
                                                    let item_total_price_intax = item_total_price_extax + line_item_total_tax - promotion_discount;
                                                    let barcode = null;
                                                    if (jsonItemData.product_ean13) {
                                                        barcode = jsonItemData.product_ean13;
                                                    }
                                                    if (jsonItemData.product_isbn) {
                                                        barcode = jsonItemData.product_isbn;
                                                    }
                                                    if (jsonItemData.product_upc) {
                                                        barcode = jsonItemData.product_upc;
                                                    }
                                                    if (jsonItemData.product_mpn) {
                                                        barcode = jsonItemData.product_mpn;
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
                                                        managedByChannel
                                                    ];

                                                    var { variables, result } = await db.execute(
                                                        db_constants.DB_CONSTANTS_ORDER.INSERT_ORDER_LINEITEM,
                                                        dataArray
                                                    );

                                                    if (result.length > 0) {
                                                        orderdetail_id++;
                                                    }
                                                }
                                                /* line items loop end*/
                                                if (orderdetail_id) {
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
                                                        shiper_company,
                                                        shiper_strt1,
                                                        shiper_strt2,
                                                        shiper_city,
                                                        shiper_state,
                                                        shiper_state_code,
                                                        shiper_zip,
                                                        shiper_country,
                                                        shiper_country_iso2,
                                                        shiper_phone,
                                                        total_order,
                                                        total_items,
                                                        total_items_price,
                                                        item_total_ship_price,
                                                        total_tax,
                                                        total_discount,
                                                        payment_id,
                                                        payment_method,
                                                        currency_code,
                                                        buyer_id,
                                                        buyer_email,
                                                        buyer_name,
                                                        sales_record_no,
                                                        payment_status,
                                                        order_status,
                                                        cron_name,
                                                        cron_id,
                                                        managedByChannel,
                                                        bill_generator_name,
                                                        bill_company,
                                                        bill_strt1,
                                                        bill_strt2,
                                                        bill_city,
                                                        bill_state,
                                                        bill_state_code,
                                                        bill_zip,
                                                        bill_country,
                                                        bill_country_iso2,
                                                        bill_phone
                                                    ];
                                                    var { variables, result } = await db.execute(
                                                        db_constants.DB_CONSTANTS_ORDER.INSERT_ORDER_TOTAL,
                                                        order_masters
                                                    );
                                                }

                                                response_data[order_no] = { success: { order_no: order_no, dataJson: jsonData } };

                                            } else {
                                                response_data[order_no] = { error: { message: server_constants.GET_ORDER_ERROR, data: "state or country detail missing" } };
                                            }
                                        } else {
                                            response_data[order_no] = { error: { message: server_constants.GET_ORDER_ERROR, data: "address or customer detail missing" } };
                                        }
                                    } else if (payment == "canceled" || payment == "refunded" || payment == "partially_refunded") {
                                        // if order is canceled,then update payment and order status
                                        let updt_time = dateTime.create();
                                        cancel_reason = "unknown";
                                        let inputs = [fby_id, jsonData.id, payment, cancel_reason, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];

                                        var { variables, result } = await db.execute(
                                            db_constants.DB_CONSTANTS_ORDER.UPDATE_ORDER_CANCEL_STATUS,
                                            inputs
                                        );
                                    }
                                }
                                msg = response_data;
                                set_response[client.domain] = msg;
                                /* Order Loop end */
                                logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body, ...response_data });
                            } else {
                                plen = 0;
                                // let msg = { error: { message: server_constants.NODATA, data: response.data } };
                                // set_response[client.domain] = msg;
                            }
                        } catch (error) {
                            plen = 0;
                            details.response = error.stack;
                            //log error
                            logger.logError(cron_name + " error", details);
                        }
                    })
                    .catch(async (error) => {
                        plen = 0;
                        details.response = error;
                        if (exist_cron) {
                            let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(error), fby_id, exist_cron];
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                                inputs
                            );
                            //log error
                            logger.logError(cron_name + " error", details);
                            //send response
                            let msg = { error: { message: server_constants.GET_ORDER_ERROR, data: error } };
                            set_response[client.domain] = msg;
                        } else {
                            //mail
                            mail.GetOrderMail(channel, cron_name, cron_id, fby_id, JSON.stringify(error));
                            //store update order status error log
                            let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(error), fby_id, exist_cron];
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                                inputs
                            );
                            //log error
                            logger.logError(cron_name + " error", details);
                            //send response
                            let msg = { error: { message: server_constants.GET_ORDER_ERROR, data: error } };
                            set_response[client.domain] = msg;
                        }

                        try {

                            let errorMessage = error.message;
                            await logger.LogForAlert(
                                fby_user_id,
                                '',
                                '',
                                errorMessage,
                                '',
                                server_constants.LOG_LEVEL.ERROR,
                                server_constants.FBY_ALERT_CODES.ORDER_SYNC,
                                server_constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL,
                                cron_name,
                                cron_id
                            );
                        }
                        catch (error) {
                            //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                        }
                    })

            }
        }
    }

    try {
        await dbCCLogs.bulkInsert(batchInfoListDB);
    } catch (error) {
        //console.log('\nERROR While bulkInsert: \n', error.message);

    }
    /* prestashop account loop end */
    return (set_response);
}

/*  
* function for update prestashop order tracking number
*/
const pushTrackingPresta = async (orders, prestaAccount, fby_id, cron_name, new_cron_id) => {
    let set_response = {};
    let details = {
        request: {
            operationId: new_cron_id
        },
        response: null,
    };
    prestaAccount.api_key = helpers.getDecryptedData(prestaAccount.api_key);
    /* order loop start */
    for (const item of orders) {

        let order_number = item.order_no;
        let sku = item.sku || '';

        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ORDER.GET_TRACKABLE_LINEITEMS,
            [fby_id, order_number]
        );

        if (result.length > 0) {
            let order_details = result;
            /*order_details loop start */
            for (const item of order_details) {
                let cron_id = new_cron_id;
                let exist_cron = 0;
                if (item.cron_name == cron_name && item.cron_id) {
                    cron_id = item.cron_id;
                    exist_cron = 1;
                } else {
                    /* Update with new cron id */
                    let updt_time = dateTime.create();
                    let inputs = [order_number, cron_name, new_cron_id, updt_time.format('Y-m-d H:M:S')];
                    await db.execute(
                        db_constants.DB_CONSTANTS_ORDER.UPDATE_ORDER_TRACKING_CRON,
                        inputs
                    );
                }
                let domain = `http://${prestaAccount.api_key}@${prestaAccount.domain}`;
                let stock_url = `${domain}/api/order_carriers/`;


                await axios({
                    url: stock_url,
                    method: "get",
                    params: {
                        display: "full",
                        output_format: "JSON",
                        "filter[id_order]": order_number,
                    },
                }).then(async (response) => {
                    try {
                        let order_carriers = (response.data.order_carriers[0]);

                        /* XML schema for updating tracking numer */
                        let xmlBodyStr = xmlSchema.getOrderCarierSchema(order_carriers, item, domain);

                        await axios({
                            url: stock_url,
                            method: "put",
                            params: {
                                display: "full",
                                output_format: "JSON",
                                "filter[id_order]": order_number,
                            },
                            headers: { 'Content-Type': 'text/plain' },
                            data: xmlBodyStr,
                        }).then(async (response) => {
                            try {
                                let responseBodyjson = JSON.stringify(response);
                                let infoMessage = `fby_user_id: ${fby_id}, ${cron_name}`;
                                await logger.LogForAlert(
                                    fby_id,
                                    '',
                                    sku != undefined ? sku : '',
                                    `${infoMessage}`,
                                    responseBodyjson,
                                    server_constants.LOG_LEVEL.INFO,
                                    server_constants.FBY_ALERT_CODES.TRACK_SYNC,
                                    cron_id,
                                    false
                                );
                            } catch (error) {
                                //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
                                //console.log(error);
                            }
                            details.response = response.data;
                            let updt_time = dateTime.create();
                            let inputs = [fby_id, order_number, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_ORDER.UPDATE_TRACK_NO_SENT,
                                inputs
                            );
                            //info log
                            logger.logInfo("action " + cron_name, details);
                            //set response
                            let msg = { success: { message: server_constants.PUSH_TRACKNO_CHANNEL_SUCCESS, data: response.data } };
                            set_response[order_number] = msg;

                            //set order status to sent
                            let order_url = `http://${prestaAccount.api_key}@${prestaAccount.domain}/api/orders/`;

                            await axios({
                                url: order_url,
                                method: "get",
                                params: {
                                    display: "full",
                                    output_format: "JSON",
                                    "filter[id]": order_number,
                                },
                            }).then(async (response) => {
                                try {
                                    let order_data = response.data.orders[0];
                                    if (order_data.current_state != constants.CUSTOM_MESSAGES.CURRENT_STATE) {
                                        /* XML schema for updating order status */
                                        let xmlBodyStr = xmlSchema.getOrderSchema(order_data);
                                        await axios({
                                            url: order_url,
                                            method: "put",
                                            params: {
                                                display: "full",
                                                output_format: "JSON",
                                                "filter[id]": order_number,
                                            },
                                            headers: { 'Content-Type': 'text/plain' },
                                            data: xmlBodyStr,
                                        }).then(async (response) => {
                                            try {
                                                details.response = response.data;
                                                logger.logInfo("action " + cron_name, details);
                                            } catch (error) {
                                                details.response = error.stack;
                                                //log error
                                                logger.logError(cron_name + " error", details);
                                            }

                                        })
                                            .catch(async (err) => {
                                                details.response = err;
                                                //log error
                                                logger.logError(cron_name + " error", details);
                                            })
                                    }
                                } catch (error) {
                                    details.response = error.stack;
                                    //log error
                                    logger.logError(cron_name + " error", details);
                                }

                            })
                                .catch(async (err) => {
                                    details.response = err;
                                    //log error
                                    logger.logError(cron_name + " error", details);
                                })

                        })
                            .catch(async (err) => {
                                details.response = err;
                                try {
                                    let infoMessage = `fby_user_id: ${fby_id}, ${cron_name}`;
                                    let errorMessage = `${infoMessage}\n, ErrorMessage: ${err.message}`;
                                    await logger.LogForAlert(
                                        fby_id,
                                        '',
                                        sku,
                                        errorMessage,
                                        err,
                                        server_constants.LOG_LEVEL.ERROR,
                                        server_constants.FBY_ALERT_CODES.TRACK_SYNC,
                                        cron_name,
                                        cron_id
                                    );

                                } catch (error) {
                                    //console.log('\n ERROR: pushTrackingShopify', error.message);
                                }
                                if (exist_cron) {
                                    /* Update products count=count+1 and update error log */
                                    let updt_time = dateTime.create();
                                    let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(err.response.data), updt_time.format('Y-m-d H:M:S')];
                                    var { variables, result } = await db.execute(
                                        db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                        inputs
                                    );
                                    //log error
                                    logger.logError(cron_name + " error", details);
                                    //set response
                                    let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: err.response.data } };
                                    set_response[order_number] = msg;
                                } else {
                                    let updt_time = dateTime.create();
                                    let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(err.response.data), updt_time.format('Y-m-d H:M:S')];
                                    /* Update products count=count+1 and flag 1 */
                                    var { variables, result } = await db.execute(
                                        db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                        inputs
                                    );
                                    //mail
                                    mail.PushTrackMail(channel, cron_name, cron_id, fby_id, JSON.stringify(err.response.data));
                                    //store update quantity catch cron log
                                    inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(err.response.data), fby_id];
                                    var { variables, result } = await db.execute(
                                        db_constants.DB_CONSTANTS_CRON.CRON_ERROR_LOG,
                                        inputs
                                    );
                                    //log error
                                    logger.logError(cron_name + " error", details);
                                    //set response
                                    let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: err.response.data } };
                                    set_response[order_number] = msg;
                                }
                            })
                    } catch (error) {
                        details.response = error.stack;
                        //log error
                        logger.logError(cron_name + " error", details);
                    }
                })
                    .catch(async (err) => {
                        details.response = err;
                        if (exist_cron) {
                            /* Update products count=count+1 and update error log */
                            let updt_time = dateTime.create();
                            let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(err.response.data), updt_time.format('Y-m-d H:M:S')];
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                inputs
                            );
                            //log error
                            logger.logError(cron_name + " error", details);
                            //set response
                            let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: err.response.data } };
                            set_response[order_number] = msg;
                        } else {
                            let updt_time = dateTime.create();
                            let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(err.response.data), updt_time.format('Y-m-d H:M:S')];
                            /* Update products count=count+1 and flag 1 */
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                inputs
                            );
                            //mail
                            mail.PushTrackMail(channel, cron_name, cron_id, fby_id, JSON.stringify(err.response.data));
                            //store update quantity catch cron log
                            inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(err.response.data), fby_id];
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.CRON_ERROR_LOG,
                                inputs
                            );
                            //log error
                            logger.logError(cron_name + " error", details);
                            //set response
                            let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: err.response.data } };
                            set_response[order_number] = msg;
                        }

                    })

            }
            /*order_details loop end */
        } else {
            let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, action: constants.CUSTOM_MESSAGES.GET_TRACKABLE_LISTITEM } };
            set_response[order_number] = msg;
        }
    }
    /* product loop end */
    return set_response;
}

/*-----------internal functions for Orders end---------- */


exports.getProducts = getProducts;
exports.updateQuantityPrestashop = updateQuantityPrestashop;

exports.getOrders = getOrders;
exports.pushTrackingPresta = pushTrackingPresta;
