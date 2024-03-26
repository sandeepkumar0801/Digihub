const db = require('../../startup/db');
const constants = require("../../misc/constants");
const db_constants = require("../../misc/db_constants");
const dateTime = require("node-datetime");
const axios = require("axios");
const helpers = require("../../misc/helpers");
const xmlSchema = require("../../misc/xmlSchemas");
const logger = require("../../misc/logger");
const server_constants = require("../../server/constants/constants");
const common = require("../../server/constants/common");
const mail = require("../../server/constants/email");
const fbyService = require("../fby_service");
const moment = require("moment");
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
let parse = require('xml-js');
const { addSlashes, stripSlashes } = require('slashes');
const { response } = require('express');
const MOMENT_DATE_FORMAT_EBAY = "YYYY-MM-DDTHH:mm:ss.SSSZ";
const channel = "ebay";
const Entities = require("../../entities/Entities");
const dbCCLogs = require('../../startup/dbcclogs');

let allProduct = constants.EBAY_KEYS.ALL_ITEM;
let singleProduct = constants.EBAY_KEYS.SINGLE_ITEM;
let getEbayOrders = constants.EBAY_KEYS.GET_ORDERS;
let updateQuantity = constants.EBAY_KEYS.UPDATE_QUANTITY;
let updateTracking = constants.EBAY_KEYS.UPDATE_TRACKING;

/**--------------Products------------------**/

/*
* Get Products from ebay
* getEbayProducts() function will check fby_user_id through 'user' and '_2_channel' table.
* if all ok, then it will get products from ebay channel and insert into products table.
*/
exports.getEbayProducts = async (req, res, operationId) => {
    let cron_name = "get_ebay_products";
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

    if (result.length > 0) {
        let fby_id = req.query.fby_user_id;
        // get ebay user details
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ACCOUNT.GET_SHOPIFY_USER,
            [fby_id]
        );
        isEmpty = (helpers.isEmpty(result)
            && helpers.isEmpty(result[0]));

        if (result.length > 0) {
            let ebayAccount = result;
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

            let response = await getProducts(req, res, ebayAccount, exist_cron, fby_id, cron_name, new_cron_id)

            // res.send(response);
            helpers.sendSuccess(
                res,
                constants.HTTPSTATUSCODES.OK,
                constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                response,
            );
        } else {
            let message = {
                channelId: req.query.fby_user_id,
                query_action: "Get " + channel + constants.CUSTOM_MESSAGES.GET_CHHANEL_USER
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
                    let inputs = [product.sku, cron_name, new_cron_id, updt_time.format('Y-m-d H:M:S')];

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
* this function will check fby_user_id through 'user' and '_2_channel' table.
* if all ok, then it will get user credentials,ebay account groupcode,owner_code and get the stocks from fby through fby controller.
*/
exports.getFbyStock = async (req, res, operationId) => {
    let cron_name = "get_Fby_Stock";
    let cron_id = operationId;

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

    if (result.length > 0) {
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

        // get ebay user details
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ACCOUNT.GET_SHOPIFY_USER,
            [fby_id]
        );

        if (result.length > 0) {
            let set_response = {
                details: []
            };
            /* ebay_account loop start */
            for (const ebayAccount of result) {
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

                let response = await fbyService.getStockList(api_key, ebayAccount, req, exist_cron, fby_id, cron_name, new_cron_id)
                set_response.details.push(response);
            }
            /* ebay_account loop end */

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
                query_action: "Get " + channel + constants.CUSTOM_MESSAGES.GET_CHHANEL_USER
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
* Send Stoks to Ebay
* this function will check fby_user_id through 'user' and '_2_channel' table.
* if all ok, then it will get all the user credential from '_2_channel' table'.
* then it will get products of same 'fby_user_id' and 'domain' from product table and update product quantity in ebay
*/
exports.pushStockEbay = async (req, res, operationId) => {
    let cron_name = "push_stock_ebay";
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
        // get ebay user details
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
            /* ebay_account loop start */
            for (const ebayAccount of result) {
                // get product details to update product quantity
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_PRODUCT.SEND_NEW_QUANTITY,
                    [fby_id, ebayAccount.domain]
                );

                if (result.length > 0) {
                    let products = result;
                    let response = await updateQuantityEbay(products, ebayAccount, fby_id, cron_name, cron_id);
                    set_response.details.push(response)
                } else {
                    let message = {
                        code: constants.HTTPSTATUSCODES.NOT_FOUND,
                        error_type: constants.ERRORCODES.NOT_FOUND,
                        domain: ebayAccount.domain,
                        action: constants.CUSTOM_MESSAGES.GET_PRODUCT_BY_DOMAIN
                    }
                    set_response.details.push(message)
                }

            }
            /* ebay_account loop end */
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
                query_action: "Get " + channel + constants.CUSTOM_MESSAGES.GET_CHHANEL_USER
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
const getProducts = async (req, res, ebayAccount, exist_cron, fby_id, cron_name, cron_id) => {

    let details = {
        request: {
            operationId: cron_id
        },
        response: null,
    };
    let response_data = [];
    let set_response = {};
    /* ebay account loop start */
    for (const client of ebayAccount) {

        client.token = helpers.getDecryptedData(client.token);
        client.ebay_devid = helpers.getDecryptedData(client.ebay_devid);
        client.ebay_appid = helpers.getDecryptedData(client.ebay_appid);
        client.ebay_certid = helpers.getDecryptedData(client.ebay_certid);

        let LIVE_DEVID = client.ebay_devid;
        let LIVE_APPID = client.ebay_appid;
        let LIVE_CERTID = client.ebay_certid;

        let lastPageCount = 0;
        let totalItems = 0;
        let perPage = 100;
        let siteId = client.siteId;
        let compatibilityLevel = client.compatibilityLevel;
        let authTokenLIVE = client.token;
        let serverUrl = client.domain;

        /* product fetching loop start */
        for (let currentPage = 1, totalPages = 1; currentPage <= totalPages; currentPage++) {
            let products = null;
            let xmlBodyStr = xmlSchema.GetMyeBaySellingSchema(authTokenLIVE, perPage, currentPage);
            //Call to get all products
            await axios({
                url: serverUrl,
                method: "post",
                headers: helpers.EBAY_HEADERS(compatibilityLevel, LIVE_DEVID, LIVE_APPID, LIVE_CERTID, allProduct, siteId),
                data: xmlBodyStr,
            }).then(async (response) => {
                let xmlparse_options = { compact: true, spaces: 4, textKey: "text", attributesKey: "attributes" };
                products = JSON.parse(parse.xml2json(response.data, xmlparse_options));
                try {
                    if (Object.keys(products).length) {
                        if (!products.GetMyeBaySellingResponse.Errors) {
                            //set totalPages
                            if (currentPage == 1) {
                                totalPages = products.GetMyeBaySellingResponse.ActiveList.PaginationResult.TotalNumberOfPages.text;
                                totalItems = products.GetMyeBaySellingResponse.ActiveList.PaginationResult.TotalNumberOfEntries.text;
                                lastPageCount = totalItems % perPage;
                            }

                            let responseSummary = products.GetMyeBaySellingResponse.ActiveList.ItemArray.Item;
                            if (currentPage == totalPages && lastPageCount == 1) {

                                responseSummaryNew[0] = responseSummary;
                                responseSummary = responseSummaryNew;
                            }
                            for (const itemData of responseSummary) {
                                let variations = itemData.Variations;
                                if (variations) {
                                    // store variations of a product
                                    let ParentSKU = itemData.SKU.text ? itemData.SKU.text : '';
                                    let ParentTitle = addSlashes(itemData.Title.text);
                                    let ItemID = itemData.ItemID.text;
                                    let variationDtls = variations.Variation;

                                    let varSize = variationDtls.length;
                                    let singleChild = false;

                                    if (variationDtls.StartPrice) {
                                        singleChild = true;
                                    }

                                    let variationDtls_data = [];
                                    /* variation loop start */
                                    for (let i = 0; i < varSize; i++) {
                                        let sku = '';
                                        let getItemData = null;
                                        let barcode = "";
                                        let image = "";
                                        let location_id = 0;

                                        sku = singleChild ? variationDtls.SKU.text : variationDtls[i].SKU.text;

                                        if (!sku) {
                                            continue;
                                        }

                                        let buyit_now_price = singleChild ? variationDtls.StartPrice.text : variationDtls[i].StartPrice.text;

                                        let VarQuantity = singleChild ? (variationDtls.Quantity ? variationDtls.Quantity.text : 0) : (variationDtls[i].Quantity ? variationDtls[i].Quantity.text : 0);
                                        let VarQuantitySold = singleChild ? (variationDtls.SellingStatus.QuantitySold.text ? variationDtls.SellingStatus.QuantitySold.text : 0) : (variationDtls[i].SellingStatus.QuantitySold.text ? variationDtls[i].SellingStatus.QuantitySold.text : 0);
                                        let Quantity = VarQuantity - VarQuantitySold;
                                        let title = singleChild ? addSlashes(variationDtls.VariationTitle.text) : addSlashes(variationDtls[i].VariationTitle.text);


                                        let xmlBodyStr = xmlSchema.GetItemVariationSchema(authTokenLIVE, ItemID, sku);
                                        //Call to get a single variation detail. this used to get variation barcode
                                        await axios({
                                            url: serverUrl,
                                            method: "post",
                                            headers: helpers.EBAY_HEADERS(compatibilityLevel, LIVE_DEVID, LIVE_APPID, LIVE_CERTID, singleProduct, siteId),
                                            data: xmlBodyStr,
                                        }).then(async (response) => {
                                            let xmlparse_options = { compact: true, spaces: 4, textKey: "text", attributesKey: "attributes" };
                                            getItemData = JSON.parse(parse.xml2json(response.data, xmlparse_options));
                                        })
                                            .catch(async (error) => {
                                                getItemData = null;
                                            })

                                        if (getItemData) {
                                            let getItemSpecificsArray = getItemData.GetItemResponse.Item.ItemSpecifics.NameValueList;
                                            let getVariationArray = getItemData.GetItemResponse.Item.Variations.Variation.VariationProductListingDetails;
                                            let Item = getItemData.GetItemResponse.Item;
                                            image = (Item.PictureDetails && Item.PictureDetails.GalleryURL) ? Item.PictureDetails.GalleryURL.text : '';


                                            if (getVariationArray && getVariationArray.EAN) {
                                                barcode = getVariationArray.EAN.text;
                                            }

                                            for (const item of getItemSpecificsArray) {
                                                if (helpers.inVariationExist(item.Name.text)) {
                                                    barcode = item.Value.text;
                                                }
                                            }
                                            var isExist = helpers.isExist(barcode);
                                            if (isExist) {
                                                for (const item of getItemSpecificsArray) {
                                                    if (helpers.inItemspecExist(item.Name.text)) {
                                                        barcode = item.Value.text;
                                                    }
                                                }
                                            }
                                        }

                                        let data = {
                                            sku: sku,
                                            barcode: barcode,
                                            item_id: ItemID,
                                            title: title,
                                            item_product_id: ItemID,
                                            inventory_item_id: ItemID,
                                            location_id: location_id,
                                            previous_inventory_quantity: Quantity,
                                            inventory_quantity: Quantity,
                                            image: image,
                                            price: buyit_now_price,
                                        }
                                        //check barcode exist or not
                                        var isExist = helpers.isExist(barcode);
                                        if (barcode && !isExist) {
                                            let inputs = [
                                                fby_id,
                                                channel,
                                                client.domain,
                                                client.owner_code,
                                                data.sku,
                                                barcode,
                                                data.item_id,
                                                data.title,
                                                data.item_product_id,
                                                data.inventory_item_id,
                                                data.inventory_quantity,
                                                data.inventory_quantity,
                                                data.image,
                                                data.price,
                                                cron_name,
                                                cron_id,
                                                data.location_id
                                            ];
                                            let { variables, result } = await db.execute(
                                                db_constants.DB_CONSTANTS_PRODUCT.INSERT_PRODUCT,
                                                inputs
                                            );
                                            variationDtls_data.push(data);
                                        } else {
                                            let msg = {
                                                message: "barcode or sku empty",
                                                data: data,
                                            };
                                            variationDtls_data.push(msg);
                                        }

                                    }

                                    /* end variation loop */
                                    let var_item = {
                                        ParentSKU: ParentSKU,
                                        ParentTitle: ParentTitle,
                                        ItemID: ItemID,
                                        total_variation: varSize,
                                        singleChild: singleChild,
                                        variation_details: variationDtls_data,
                                    }
                                    response_data.push(var_item);
                                } else {
                                    //store single product which have no variations
                                    let sku = itemData.SKU.text;

                                    if (!sku) {
                                        continue;
                                    }

                                    let getItemData = null;
                                    let barcode = "";
                                    let image = "";
                                    let location_id = 0;
                                    let xmlBodyStr = xmlSchema.GetItemSchema(authTokenLIVE, itemData.ItemID.text);

                                    //Call to get a single product detail. this used to get product barcode
                                    await axios({
                                        url: serverUrl,
                                        method: "post",
                                        headers: helpers.EBAY_HEADERS(compatibilityLevel, LIVE_DEVID, LIVE_APPID, LIVE_CERTID, singleProduct, siteId),
                                        data: xmlBodyStr,
                                    }).then(async (response) => {
                                        let xmlparse_options = { compact: true, spaces: 4, textKey: "text", attributesKey: "attributes" };
                                        getItemData = JSON.parse(parse.xml2json(response.data, xmlparse_options));
                                    })
                                        .catch(async (error) => {
                                            getItemData = null;
                                        })

                                    if (getItemData) {
                                        let getItemSpecificArray = getItemData.GetItemResponse.Item.ItemSpecifics.NameValueList;
                                        let Item = getItemData.GetItemResponse.Item;
                                        image = (Item.PictureDetails && Item.PictureDetails.GalleryURL) ? Item.PictureDetails.GalleryURL.text : '';
                                        for (const item of getItemSpecificArray) {
                                            if (helpers.inItemspecExist(item.Name.text)) {
                                                barcode = item.Value.text;
                                            }
                                        }
                                        var isExist = helpers.isExist(barcode);
                                        if (isExist) {
                                            for (const item of getItemSpecificArray) {
                                                if (helpers.inVariationExist(item.Name.text)) {
                                                    barcode = item.Value.text;
                                                }
                                            }
                                        }
                                    }
                                    let item = {
                                        sku: sku,
                                        barcode: barcode,
                                        item_id: itemData.ItemID.text,
                                        title: addSlashes(itemData.Title.text),
                                        item_product_id: itemData.ItemID.text,
                                        inventory_item_id: itemData.ItemID.text,
                                        location_id: location_id,
                                        previous_inventory_quantity: itemData.QuantityAvailable.text,
                                        inventory_quantity: itemData.QuantityAvailable.text,
                                        image: image,
                                        price: itemData.BuyItNowPrice.text,
                                    }
                                    //check barcode exist or not
                                    var isExist = helpers.isExist(barcode);
                                    if (barcode && !isExist) {
                                        let inputs = [
                                            fby_id,
                                            channel,
                                            client.domain,
                                            client.owner_code,
                                            item.sku,
                                            barcode,
                                            item.item_id,
                                            item.title,
                                            item.item_product_id,
                                            item.inventory_item_id,
                                            item.inventory_quantity,
                                            item.inventory_quantity,
                                            item.image,
                                            item.price,
                                            cron_name,
                                            cron_id,
                                            location_id
                                        ];
                                        let { variables, result } = await db.execute(
                                            db_constants.DB_CONSTANTS_PRODUCT.INSERT_PRODUCT,
                                            inputs
                                        );
                                        response_data.push(item);
                                    } else {
                                        let msg = {
                                            message: "barcode or sku empty",
                                            data: item,
                                        };
                                        response_data.push(msg);
                                    }
                                }

                            }
                            logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body, ...response_data });
                            let msg = { message: "success", data: response_data };
                            set_response[client.domain] = msg;
                        } else {
                            let msg = { message: "error", data: products.GetMyeBaySellingResponse };
                            set_response[client.domain] = msg;
                        }
                    } else {
                        details.response = response.config;
                        if (exist_cron) {
                            let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(response.config), fby_id, exist_cron];
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                                inputs
                            );
                            //log error
                            logger.logError(cron_name + " error", details);
                            //send response
                            let msg = { error: { message: server_constants.GET_PRODUCT_ERROR, data: response.config } };
                            set_response[client.domain] = msg;
                        } else {
                            //mail
                            mail.GetProdMail(channel, cron_name, cron_id, fby_id, JSON.stringify(response.config));
                            //store update product status error log
                            let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(response.config), fby_id, exist_cron];
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                                inputs
                            );
                            //log error
                            logger.logError(cron_name + " error", details);
                            //send response
                            let msg = { error: { message: server_constants.GET_PRODUCT_ERROR, data: response.config } };
                            set_response[client.domain] = msg;
                        }
                    }
                } catch (error) {
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
                        let msg = { error: { message: server_constants.GET_PRODUCT_ERROR, data: error.stack } };
                        set_response[client.domain] = msg;
                    } else {
                        //mail
                        mail.GetProdMail(channel, cron_name, cron_id, fby_id, error.stack);
                        //store update product status error log
                        let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, error.stack, fby_id, exist_cron];
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                            inputs
                        );
                        //log error
                        logger.logError(cron_name + " error", details);
                        //send response
                        let msg = { error: { message: server_constants.GET_PRODUCT_ERROR, data: error.stack } };
                        set_response[client.domain] = msg;
                    }
                }
            })
                .catch(async (error) => {
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
                        let msg = { error: { message: server_constants.GET_PRODUCT_ERROR, data: error } };
                        set_response[client.domain] = msg;
                    } else {
                        //mail
                        mail.GetProdMail(channel, cron_name, cron_id, fby_id, JSON.stringify(error));
                        //store update product status error log
                        let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(error), fby_id, exist_cron];
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                            inputs
                        );
                        //log error
                        logger.logError(cron_name + " error", details);
                        //send response
                        let msg = { error: { message: server_constants.GET_PRODUCT_ERROR, data: error } };
                        set_response[client.domain] = msg;
                    }
                })
        }
        /* product fetching loop  end */
    }
    /* ebay account loop end */

    return (set_response);
}

/*  
* function for update ebay product quantity
*/
const updateQuantityEbay = async (products, ebayAccount, fby_id, cron_name, new_cron_id) => {
    let set_response = {};
    let details = {
        request: {
            operationId: new_cron_id
        },
        response: null,
    };

    ebayAccount.token = helpers.getDecryptedData(ebayAccount.token);
    ebayAccount.ebay_devid = helpers.getDecryptedData(ebayAccount.ebay_devid);
    ebayAccount.ebay_appid = helpers.getDecryptedData(ebayAccount.ebay_appid);
    ebayAccount.ebay_certid = helpers.getDecryptedData(ebayAccount.ebay_certid);

    let LIVE_DEVID = ebayAccount.ebay_devid;
    let LIVE_APPID = ebayAccount.ebay_appid;
    let LIVE_CERTID = ebayAccount.ebay_certid;
    let siteId = ebayAccount.siteId;
    let compatibilityLevel = ebayAccount.compatibilityLevel;
    let authTokenLIVE = ebayAccount.token;
    let serverUrl = ebayAccount.domain;

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
        // set_response[item.sku] = item;
        let xmlBodyStr = xmlSchema.ReviseInventoryStatusSchema(authTokenLIVE, item.item_id, item.inventory_quantity, item.sku);
        await axios({
            url: serverUrl,
            method: "post",
            headers: helpers.EBAY_HEADERS(compatibilityLevel, LIVE_DEVID, LIVE_APPID, LIVE_CERTID, updateQuantity, siteId),
            data: xmlBodyStr,
        }).then(async (response) => {
            let xmlparse_options = { compact: true, spaces: 4, textKey: "text", attributesKey: "attributes" };
            products = JSON.parse(parse.xml2json(response.data, xmlparse_options));
            try {
                if (Object.keys(products).length) {
                    let ack = products.ReviseInventoryStatusResponse.Ack.text;
                    if (ack == 'Success' || ack == 'Warning') {
                        details.response = products.ReviseInventoryStatusResponse;
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
                    } else {
                        let msg = { message: "error", data: products.ReviseInventoryStatusResponse.Errors };
                        set_response[item.sku] = msg;
                    }
                } else {
                    details.response = response.config;
                    if (exist_cron) {
                        /* Update products count=count+1 and update error log */
                        let updt_time = dateTime.create();
                        let inputs = [fby_id, item.sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, response.config, updt_time.format('Y-m-d H:M:S')];
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_CRON.FBY_PRODUCT_ERR_MANAGE,
                            inputs
                        );
                        //log error
                        logger.logError(cron_name + " error", details);
                        //set response
                        let msg = { error: { message: server_constants.PUSH_STOCK_CHANNEL_ERROR, data: response.config } };
                        set_response[item.sku] = msg;
                    } else {
                        let updt_time = dateTime.create();
                        let inputs = [fby_id, item.sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, response.config, updt_time.format('Y-m-d H:M:S')];
                        /* Update products count=count+1 and flag 1 */
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_CRON.FBY_PRODUCT_ERR_MANAGE,
                            inputs
                        );
                        //mail
                        mail.PushProdMail(channel, cron_name, cron_id, fby_id, response.config);
                        //store update quantity catch cron log
                        inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, response.config, fby_id];
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_CRON.CRON_ERROR_LOG,
                            inputs
                        );
                        //log error
                        logger.logError(cron_name + " error", details);
                        //set response
                        let msg = { error: { message: server_constants.PUSH_STOCK_CHANNEL_ERROR, data: response.config } };
                        set_response[item.sku] = msg;
                    }
                }

            } catch (error) {
                details.response = error.stack;
                if (exist_cron) {
                    /* Update products count=count+1 and update error log */
                    let updt_time = dateTime.create();
                    let inputs = [fby_id, item.sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, error.stack, updt_time.format('Y-m-d H:M:S')];
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_CRON.FBY_PRODUCT_ERR_MANAGE,
                        inputs
                    );
                    //log error
                    logger.logError(cron_name + " error", details);
                    //set response
                    let msg = { error: { message: server_constants.PUSH_STOCK_CHANNEL_ERROR, data: error.stack } };
                    set_response[item.sku] = msg;
                } else {
                    let updt_time = dateTime.create();
                    let inputs = [fby_id, item.sku, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, error.stack, updt_time.format('Y-m-d H:M:S')];
                    /* Update products count=count+1 and flag 1 */
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_CRON.FBY_PRODUCT_ERR_MANAGE,
                        inputs
                    );
                    //mail
                    mail.PushProdMail(channel, cron_name, cron_id, fby_id, error.stack);
                    //store update quantity catch cron log
                    inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, error.stack, fby_id];
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_CRON.CRON_ERROR_LOG,
                        inputs
                    );
                    //log error
                    logger.logError(cron_name + " error", details);
                    //set response
                    let msg = { error: { message: server_constants.PUSH_STOCK_CHANNEL_ERROR, data: error.stack } };
                    set_response[item.sku] = msg;
                }
            }
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
* Get Oredrs from ebay
* this function will check fby_user_id through 'user' and '_2_channel' table.
* if all ok, then it will get unshiped orders from ebay channel and insert into Order_details and order_master table.
*/
exports.getEbayOrders = async (req, res, operationId) => {
    let cron_name = "get_ebay_orders";
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
        // get ebay user details
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ACCOUNT.GET_SHOPIFY_USER,
            [fby_id]
        );
        isEmpty = (helpers.isEmpty(result)
            && helpers.isEmpty(result[0]));

        if (result.length > 0) {
            let ebayAccount = result;
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

            let response = await getOrders(req, res, ebayAccount, exist_cron, fby_id, cron_name, new_cron_id)

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
                query_action: "Get " + channel + constants.CUSTOM_MESSAGES.GET_CHHANEL_USER
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
* this function will check fby_user_id through 'user' and '_2_channel' table.
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
        // get ebay user details
        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ACCOUNT.GET_SHOPIFY_USER,
            [fby_id]
        );
        isEmpty = (helpers.isEmpty(result)
            && helpers.isEmpty(result[0]));

        if (result.length > 0) {
            let ebayAccount = result;
            let set_response = {
                details: []
            };
            /* ebay_account loop start */
            for (const client of ebayAccount) {
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
                        domain: ebayAccount.domain,
                        action: constants.CUSTOM_MESSAGES.GET_CANCELED_ORDERS
                    }
                    set_response.details.push(message)
                }
            }
            /* ebay_account loop end */

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
                query_action: "Get " + channel + constants.CUSTOM_MESSAGES.GET_CHHANEL_USER
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
* Send Tracking number to ebay
* this function will check fby_user_id through 'user' and '_2_channel' table.
* if all ok, then it will get all the user credential from '_2_channel' table.
* then it will get orders of same 'fby_user_id', 'account_id' and having is_trackable 1 from order_details table and add tracking information in ebay
*/
exports.pushTrackEbay = async (req, res, operationId) => {
    let cron_name = "push_Track_ebay";
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
        // get ebay user details
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
            /* ebay_account loop start */
            for (const ebayAccount of result) {
                /**for each ebay_account id
                 * get order details from order_masters table where its account_id matches with '_2_channel' table id
                */
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_ORDER.GET_ORDER_BY_ACCOUNT,
                    [fby_id, ebayAccount.id]
                );

                if (result.length > 0) {
                    let orders = result;
                    let response = await pushTrackingEbay(orders, ebayAccount, fby_id, cron_name, cron_id);
                    set_response.details.push(response)
                } else {
                    let message = {
                        code: constants.HTTPSTATUSCODES.NOT_FOUND,
                        error_type: constants.ERRORCODES.NOT_FOUND,
                        domain: ebayAccount.domain,
                        action: constants.CUSTOM_MESSAGES.GET_ORDER_BY_ACCOUNT
                    }
                    set_response.details.push(message)
                }

            }
            /* ebay_account loop end */
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
                query_action: "Get " + channel + constants.CUSTOM_MESSAGES.GET_CHHANEL_USER
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
const getOrders = async (req, res, ebayAccount, exist_cron, fby_id, cron_name, cron_id) => {

    let fby_user_id = fby_id;
    let logMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;
    let details = {
        request: {
            operationId: cron_id
        },
        response: null,
    };
    let set_response = {};
    let response_data = [];
    let perPage = 100;
    let modTimeFrom = moment().subtract(2, "days").format(MOMENT_DATE_FORMAT);
    let modTimeTo = moment().format(MOMENT_DATE_FORMAT);

    let batchInfoListDB = [];
    let order_no_log = '';

    if (req.query.updated_after) {
        modTimeFrom = req.query.updated_after;
    }
    if (req.query.item_per_page) {
        perPage = req.query.item_per_page;
    }


    var now = moment();
    now = now.format(MOMENT_DATE_FORMAT);

    let isCanSync = false;
    /* ebay account loop start */
    for (const client of ebayAccount) {
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
        req.body.ownerCode = client.owner_code;
        req.body.channel.name = channel;
        client.token = helpers.getDecryptedData(client.token);
        client.ebay_devid = helpers.getDecryptedData(client.ebay_devid);
        client.ebay_appid = helpers.getDecryptedData(client.ebay_appid);
        client.ebay_certid = helpers.getDecryptedData(client.ebay_certid);

        let LIVE_DEVID = client.ebay_devid;
        let LIVE_APPID = client.ebay_appid;
        let LIVE_CERTID = client.ebay_certid;

        if (isCanSync) {
            let lastPageCount = 0;
            let totalOrders = 0;
            let siteId = client.siteId;
            let compatibilityLevel = client.compatibilityLevel;
            let authTokenLIVE = client.token;
            let serverUrl = client.domain;
            /* order fetching loop start */
            for (let currentPage = 1, totalPages = 1; currentPage <= totalPages; currentPage++) {
                let orders = null;
                let responseSummary = null;
                let xmlBodyStr = null;
                xmlBodyStr = xmlSchema.GetOrdersSchema(authTokenLIVE, modTimeFrom, modTimeTo, perPage, currentPage);

                await axios({
                    url: serverUrl,
                    method: "post",
                    headers: helpers.EBAY_HEADERS(compatibilityLevel, LIVE_DEVID, LIVE_APPID, LIVE_CERTID, getEbayOrders, siteId),
                    data: xmlBodyStr,
                }).then(async (response) => {
                    let xmlparse_options = { compact: true, spaces: 4, textKey: "text", attributesKey: "attributes" };
                    orders = JSON.parse(parse.xml2json(response.data, xmlparse_options));

                    try {
                        if (Object.keys(orders).length) {
                            if (!orders.GetOrdersResponse.Errors) {
                                //set totalPages
                                if (currentPage == 1) {
                                    totalPages = orders.GetOrdersResponse.PaginationResult.TotalNumberOfPages.text;
                                    totalOrders = orders.GetOrdersResponse.PaginationResult.TotalNumberOfEntries.text;

                                    lastPageCount = totalOrders % perPage;
                                }

                                responseSummary = orders.GetOrdersResponse.OrderArray;
                                let count = 0;
                                if (currentPage == totalPages && lastPageCount == 1) {

                                    responseSummaryNew[0] = responseSummary;
                                    responseSummary = responseSummaryNew;
                                }

                                if (Object.keys(responseSummary).length) {
                                    response_data.push(responseSummary.Order);
                                    /* order loop start*/
                                    for (const jsonData of responseSummary.Order) {

                                        try {
                                            order_no_log = jsonData.OrderID.text;
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

                                        let date_created = dateTime.create(jsonData.CreatedTime.text).format('Y-m-d H:M:S');

                                        let date_modified = dateTime.create(jsonData.CheckoutStatus.LastModifiedTime.text).format('Y-m-d H:M:S');

                                        let order_no = jsonData.OrderID.text;
                                        let seller_order_id = jsonData.OrderID.text;
                                        let order_status = jsonData.OrderStatus.text;
                                        let shippedTime = jsonData.ShippedTime ? dateTime.create(jsonData.ShippedTime.text).format('Y-m-d H:M:S') : null;
                                        let paidTime = jsonData.PaidTime ? dateTime.create(jsonData.PaidTime.text).format('Y-m-d H:M:S') : null;
                                        let checkoutStatus = jsonData.CheckoutStatus.Status.text;
                                        /* Check if order is paid and unshiped */
                                        if (order_status == "Completed" && paidTime != null && shippedTime == null) {
                                            let channel_code = client.channel_code;
                                            let owner_code = client.owner_code;
                                            let account_id = client.id;
                                            let currency_code = client.currency_code;
                                            fby_user_id = fby_id;
                                            let total_order = parseFloat(jsonData.Total.text);
                                            let total_items = null;
                                            let total_tax = 0.00;
                                            let total_discount = 0.00;
                                            let total_items_price = parseFloat(jsonData.Subtotal.text);
                                            let payment_method = jsonData.CheckoutStatus.PaymentMethod.text;
                                            let sales_record_no = jsonData.ShippingDetails.SellingManagerSalesRecordNumber.text;
                                            let purchase_date = date_created;
                                            let payment_time = date_modified;
                                            let payment_status = "paid";
                                            let location_id = null;
                                            // let paymentAray = Array.isArray(jsonData.MonetaryDetails.Payments.Payment) ? jsonData.MonetaryDetails.Payments.Payment : [jsonData.MonetaryDetails.Payments.Payment];
                                            // let payment_id = "";
                                            let payment_id = jsonData.ExternalTransaction ? jsonData.ExternalTransaction.ExternalTransactionID.text : "";

                                            // for (const payment of paymentAray) {
                                            //     if (payment.ReferenceID) {
                                            //         payment_id = payment.ReferenceID.text;
                                            //     }
                                            // }

                                            let shippingServiceCost = parseFloat(jsonData.ShippingServiceSelected.ShippingServiceCost.text);
                                            let importCharge = jsonData.ShippingServiceSelected.ImportCharge ? parseFloat(jsonData.ShippingServiceSelected.ImportCharge.text) : 0.00;
                                            let item_total_ship_price = shippingServiceCost + importCharge;
                                            let local_time = date_modified;


                                            let TransactionArray = jsonData.TransactionArray ? jsonData.TransactionArray : {};
                                            let transaction = Array.isArray(TransactionArray.Transaction) ? TransactionArray.Transaction : [TransactionArray.Transaction];
                                            let TrasactionArrayCount = transaction.length
                                            total_items = TrasactionArrayCount;
                                            //buyer detail

                                            let buyer_email = "";
                                            let buyer_id = jsonData.BuyerUserID.text;

                                            let buyer_fname = "";
                                            let buyer_lname = "";
                                            let buyer_name = "";
                                            //shiping address

                                            let shiper_name = (jsonData.ShippingAddress.Name.text);
                                            let recipient_name = shiper_name ? shiper_name : null;
                                            let shiper_company = "";
                                            let shiper_strt1 = jsonData.ShippingAddress.Street1 ? (jsonData.ShippingAddress.Street1.text ? jsonData.ShippingAddress.Street1.text : "") : "";
                                            let shiper_strt2 = jsonData.ShippingAddress.Street2 ? (jsonData.ShippingAddress.Street2.text ? jsonData.ShippingAddress.Street2.text : "") : "";
                                            let shiper_city = jsonData.ShippingAddress.CityName ? (jsonData.ShippingAddress.CityName.text ? jsonData.ShippingAddress.CityName.text : "") : "";

                                            let shiper_state = jsonData.ShippingAddress.StateOrProvince ? (jsonData.ShippingAddress.StateOrProvince.text ? jsonData.ShippingAddress.StateOrProvince.text : "") : "";
                                            let shiper_state_code = "";
                                            let shiper_zip = jsonData.ShippingAddress.PostalCode ? (jsonData.ShippingAddress.PostalCode.text ? jsonData.ShippingAddress.PostalCode.text : "") : "";

                                            let shiper_country = jsonData.ShippingAddress.CountryName ? (jsonData.ShippingAddress.CountryName.text ? jsonData.ShippingAddress.CountryName.text : "") : "";
                                            let shiper_country_iso2 = "";
                                            let shiper_phone = jsonData.ShippingAddress.Phone ? (jsonData.ShippingAddress.Phone.text ? jsonData.ShippingAddress.Phone.text : "") : "";
                                            let shiper_email = "";
                                            let orderdetail_id = 0;
                                            let managedByChannel = false;
                                            /* line items loop start*/
                                            for (const jsonItemData of transaction) {
                                                let item_tax = 0;
                                                let exchange_rate = 0;
                                                let order_line_item_id = jsonItemData.OrderLineItemID.text;
                                                let sku = jsonItemData.Item.SKU.text;
                                                if (jsonItemData.Variation && jsonItemData.Variation.SKU) {
                                                    sku = jsonItemData.Variation.SKU.text;
                                                }
                                                let order_item_id = jsonItemData.Item.ItemID.text;
                                                let transaction_id = jsonItemData.TransactionID.text;
                                                let product_name = jsonItemData.Item.Title.text;
                                                let quantity_purchased = jsonItemData.QuantityPurchased.text;

                                                buyer_email = jsonItemData.Buyer.Email.text != "Invalid Request" ? jsonItemData.Buyer.Email.text : "";

                                                buyer_fname = Object.keys(jsonItemData.Buyer.UserFirstName).length ? jsonItemData.Buyer.UserFirstName.text : "";
                                                buyer_lname = Object.keys(jsonItemData.Buyer.UserFirstName).length ? jsonItemData.Buyer.UserLastName.text : "";
                                                buyer_name = buyer_fname + ' ' + buyer_lname;

                                                let line_item_price = parseFloat(jsonItemData.TransactionPrice.text);
                                                let line_item_total_tax = item_tax * quantity_purchased;
                                                let item_total_price_extax = line_item_price * quantity_purchased;
                                                let item_price = line_item_price * quantity_purchased;

                                                let item_ship_price = parseFloat(item_total_ship_price / total_items);

                                                let promotion_discount = 0;
                                                let item_total_price_intax = item_total_price_extax + line_item_total_tax - promotion_discount;
                                                total_tax += parseFloat(jsonItemData.Taxes.TotalTaxAmount.text);
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
                                                    managedByChannel
                                                ];

                                                var { variables, result } = await db.execute(
                                                    db_constants.DB_CONSTANTS_ORDER.INSERT_ORDER_LINEITEM,
                                                    dataArray
                                                );

                                                // if (result.length > 0) {
                                                //     orderdetail_id++;
                                                // }
                                                orderdetail_id++;
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
                                                    '',
                                                    '',
                                                    '',
                                                    '',
                                                    '',
                                                    '',
                                                    '',
                                                    '',
                                                    '',
                                                    '',
                                                    ''
                                                ];
                                                var { variables, result } = await db.execute(
                                                    db_constants.DB_CONSTANTS_ORDER.INSERT_ORDER_TOTAL,
                                                    order_masters
                                                );
                                            }

                                        } else if (order_status == "Cancelled") {
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

                                    }
                                    /* order loop end*/
                                } else {
                                    set_response[client.domain] = { "cron": cron_name, "ModTimeFrom": modTimeFrom, message: constants.NODATA }
                                }

                                response_Details = {
                                    currentPage: currentPage,
                                    totalPages: totalPages,
                                    totalOrders: totalOrders,
                                    lastPageCount: lastPageCount,
                                    Orders: response_data
                                }

                                let msg = { message: "success", data: response_Details };
                                set_response = msg;
                                logger.logInfo("action " + cron_name, { url: res.req.baseUrl, method: res.req.method, request: req.body, ...response_Details });
                            } else {
                                let msg = { message: "error", data: orders.GetOrdersResponse };
                                set_response[client.domain] = msg;
                            }
                        } else {
                            details.response = response.config;
                            if (exist_cron) {
                                let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(response.config), fby_id, exist_cron];
                                var { variables, result } = await db.execute(
                                    db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                                    inputs
                                );
                                //log error
                                logger.logError(cron_name + " error", details);
                                //send response
                                let msg = { error: { message: server_constants.GET_ORDER_ERROR, data: response.config } };
                                set_response[client.domain] = msg;
                            } else {
                                //mail
                                mail.GetOrderMail(channel, cron_name, cron_id, fby_id, JSON.stringify(response.config));
                                //store update product status error log
                                let inputs = [cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(response.config), fby_id, exist_cron];
                                var { variables, result } = await db.execute(
                                    db_constants.DB_CONSTANTS_CRON.FBY_CRON_MANAGE,
                                    inputs
                                );
                                //log error
                                logger.logError(cron_name + " error", details);
                                //send response
                                let msg = { error: { message: server_constants.GET_ORDER_ERROR, data: response.config } };
                                set_response[client.domain] = msg;
                            }
                        }
                    } catch (error) {
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
                            //mail
                            mail.GetOrderMail(channel, cron_name, cron_id, fby_id, error.stack);
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
                            //store update product status error log
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
            /* order fetching loop end */
        }
    }
    try {
        await dbCCLogs.bulkInsert(batchInfoListDB);

    } catch (error) {
        //console.log('\nERROR While bulkInsert: \n', error.message);
    }
    /* ebay account loop end */
    return (set_response);
}

/*  
* function for update ebay order tracking number
*/
const pushTrackingEbay = async (orders, ebayAccount, fby_id, cron_name, new_cron_id) => {
    let set_response = {};
    let details = {
        request: {
            operationId: new_cron_id
        },
        response: null,
    };
    let infoMessage = `fby_user_id: ${fby_id}, ${cron_name}`;
    ebayAccount.token = helpers.getDecryptedData(ebayAccount.token);
    ebayAccount.ebay_devid = helpers.getDecryptedData(ebayAccount.ebay_devid);
    ebayAccount.ebay_appid = helpers.getDecryptedData(ebayAccount.ebay_appid);
    ebayAccount.ebay_certid = helpers.getDecryptedData(ebayAccount.ebay_certid);

    let LIVE_DEVID = ebayAccount.ebay_devid;
    let LIVE_APPID = ebayAccount.ebay_appid;
    let LIVE_CERTID = ebayAccount.ebay_certid;
    let siteId = ebayAccount.siteId;
    let compatibilityLevel = ebayAccount.compatibilityLevel;
    let authTokenLIVE = ebayAccount.token;
    let serverUrl = ebayAccount.domain;
    /* order loop start */
    for (const item of orders) {

        let order_number = item.order_no;

        var { variables, result } = await db.execute(
            db_constants.DB_CONSTANTS_ORDER.GET_EBAY_TRACKABLE_ORDERDETAILS,
            [fby_id, order_number, channel]
        );
        let sku = item.sku || '';
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

                let xmlBodyStr = xmlSchema.CompleteSaleSchema(authTokenLIVE, item.order_no, item.tracking_id, item.tracking_courier);
                await axios({
                    url: serverUrl,
                    method: "post",
                    headers: helpers.EBAY_HEADERS(compatibilityLevel, LIVE_DEVID, LIVE_APPID, LIVE_CERTID, updateTracking, siteId),
                    data: xmlBodyStr,
                }).then(async (response) => {
                    let xmlparse_options = { compact: true, spaces: 4, textKey: "text", attributesKey: "attributes" };
                    orders = JSON.parse(parse.xml2json(response.data, xmlparse_options));
                    try {
                        if (Object.keys(orders).length) {
                            let ack = orders.CompleteSaleResponse.Ack.text;
                            if (ack == 'Success') {
                                details.response = orders.CompleteSaleResponse;
                                let updt_time = dateTime.create();
                                let inputs = [fby_id, order_number, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];
                                var { variables, result } = await db.execute(
                                    db_constants.DB_CONSTANTS_ORDER.UPDATE_EBAY_TRACK_NO_SENT,
                                    inputs
                                );
                                //info log
                                logger.logInfo("action " + cron_name, details);
                                //set response
                                let msg = { success: { message: server_constants.PUSH_TRACKNO_CHANNEL_SUCCESS, data: orders.CompleteSaleResponse } };
                                set_response[order_number] = msg;
                            } else {
                                details.response = orders.CompleteSaleResponse;
                                if (exist_cron) {
                                    let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(orders.CompleteSaleResponse), updt_time.format('Y-m-d H:M:S')];
                                    var { variables, result } = await db.execute(
                                        db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                        inputs
                                    );
                                    //log error
                                    logger.logError(cron_name + " error", details);
                                    //send response
                                    let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: orders.CompleteSaleResponse } };
                                    set_response[order_number] = msg;
                                } else {
                                    //mail
                                    mail.PushTrackMail(channel, cron_name, cron_id, fby_id, JSON.stringify(orders.CompleteSaleResponse));
                                    //store update product status error log
                                    let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(orders.CompleteSaleResponse), updt_time.format('Y-m-d H:M:S')];
                                    var { variables, result } = await db.execute(
                                        db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                        inputs
                                    );
                                    //log error
                                    logger.logError(cron_name + " error", details);
                                    //send response
                                    let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: orders.CompleteSaleResponse } };
                                    set_response[order_number] = msg;
                                }

                            }
                        } else {
                            details.response = response.config;
                            if (exist_cron) {
                                let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(response.config), updt_time.format('Y-m-d H:M:S')];
                                var { variables, result } = await db.execute(
                                    db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                    inputs
                                );
                                //log error
                                //send response
                                let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: response.config } };
                                set_response[order_number] = msg;
                            } else {
                                //mail
                                mail.PushTrackMail(channel, cron_name, cron_id, fby_id, JSON.stringify(response.config));
                                //store update product status error log
                                let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(response.config), updt_time.format('Y-m-d H:M:S')];
                                var { variables, result } = await db.execute(
                                    db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                    inputs
                                );
                                //log error
                                logger.logError(cron_name + " error", details);
                                //send response
                                let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: response.config } };
                                set_response[order_number] = msg;
                            }
                        }
                    } catch (error) {
                        details.response = error.stack;
                        if (exist_cron) {
                            let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, error.stack, updt_time.format('Y-m-d H:M:S')];
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                inputs
                            );
                            //log error
                            logger.logError(cron_name + " error", details);
                            //send response
                            let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: error.stack } };
                            set_response[order_number] = msg;
                        } else {
                            //mail
                            mail.PushTrackMail(channel, cron_name, cron_id, fby_id, error.stack);
                            //store update product status error log
                            let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, error.stack, updt_time.format('Y-m-d H:M:S')];
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                inputs
                            );
                            //log error
                            logger.logError(cron_name + " error", details);
                            //send response
                            let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: error.stack } };
                            set_response[order_number] = msg;
                        }
                    }
                    try {
                        let responseBodyjson = JSON.stringify(response);
                        infoMessage = `fby_user_id: ${fby_id}, sku: ${sku}, ${cron_name}`;
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
                })
                    .catch(async (error) => {
                        details.response = error;
                        if (exist_cron) {
                            let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(error), updt_time.format('Y-m-d H:M:S')];
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                inputs
                            );
                            //log error
                            logger.logError(cron_name + " error", details);
                            //send response
                            let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: error } };
                            set_response[order_number] = msg;
                        } else {
                            //mail
                            mail.PushTrackMail(channel, cron_name, cron_id, fby_id, JSON.stringify(error));
                            //store update product status error log
                            let inputs = [fby_id, order_number, exist_cron, cron_name, cron_id, server_constants.CATCH_TYPE, JSON.stringify(error), updt_time.format('Y-m-d H:M:S')];
                            var { variables, result } = await db.execute(
                                db_constants.DB_CONSTANTS_CRON.FBY_ORDER_TRACKING_ERR_MANAGE,
                                inputs
                            );
                            //log error
                            logger.logError(cron_name + " error", details);
                            //send response
                            let msg = { error: { message: server_constants.PUSH_TRACKNO_CHANNEL_ERROR, data: error } };
                            set_response[order_number] = msg;
                        }
                        try {
                            let errorMessage = `${infoMessage}\n, ErrorMessage: ${error.message}`;
                            await logger.LogForAlert(
                                fby_user_id,
                                '',
                                sku,
                                errorMessage,
                                error,
                                server_constants.LOG_LEVEL.ERROR,
                                server_constants.FBY_ALERT_CODES.TRACK_SYNC,
                                cron_name,
                                cron_id
                            );

                        } catch (error) {
                            //console.log('\n ERROR: pushTrackingEbay', error.message);
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
/*-----------internal functions for Orders End---------- */

exports.getProducts = getProducts;
exports.updateQuantityEbay = updateQuantityEbay;
exports.getOrders = getOrders;
exports.pushTrackingEbay = pushTrackingEbay;

