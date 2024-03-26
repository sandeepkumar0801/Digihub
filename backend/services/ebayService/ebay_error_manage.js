const db = require("../../startup/db");
const constants = require("../../misc/constants");
const db_constants = require("../../misc/db_constants");
const request = require("request-promise");
const dateTime = require("node-datetime");
const axios = require("axios");
const helpers = require("../../misc/helpers");
const logger = require("../../misc/logger");
const server_constants = require("../../server/constants/constants");
const common = require("../../server/constants/common");
const mail = require("../../server/constants/email");
const fbyService = require("../fby_service");
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const ebayService = require("../ebayService/ebay_service");

const channel = "ebay";

exports.errorManager = async (req, res) => {
    let search_case = req.query.case;
    let msg = {
        message: null,
    };
    let details = {};
    let dt = dateTime.create();
    switch (search_case) {
        case "get_ebay_products":
            //get cron details from bulk_process_error_log able having count 1 and flag 1
            var { variables, result } = await db.execute(
                db_constants.DB_CONSTANTS_CRON.GET_BULK_CRON_LOG,
                [search_case, dt.format("Y-m-d")]
            );

            let isEmpty = helpers.isEmpty(result) && helpers.isEmpty(result[0]);

            if (result.length > 0) {
                let bulk_data = variables;
                let old_cron_id = bulk_data.cron_id;
                let exist_cron = 1;
                let cron_name = bulk_data.cron_name;
                let fby_id = bulk_data.fby_user_id;

                // get user details
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_ACCOUNT.USER,
                    [fby_id]
                );
                let isEmpty = helpers.isEmpty(result) && helpers.isEmpty(result[0]);

                if (result.length > 0) {
                    let user = variables;
                    /* get JWT token from fby */
                    var { result } = await fbyService.getFBYToken(res, user, cron_name, old_cron_id);
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
                    isEmpty = (helpers.isEmpty(result)
                        && helpers.isEmpty(result[0]));

                    if (result.length > 0) {

                        /*ebay account loop start */
                        for (const ebayAccount of result) {
                            let response = await ebayService.getProducts(req, res, [ebayAccount], exist_cron, fby_id, cron_name, old_cron_id);

                            let alert_response = await fbyService.insertAlert(api_key, response[ebayAccount.domain], channel, ebayAccount.owner_code, cron_name, old_cron_id);
                            msg.message = alert_response;
                        }
                        /*ebay account loop start */
                        // res.send(msg);
                        helpers.sendSuccess(
                            res,
                            constants.HTTPSTATUSCODES.OK,
                            constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                            msg,
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
                        case: search_case,
                        query_action: constants.CUSTOM_MESSAGES.GET_USER,
                    };
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
                    case: search_case,
                    query_action: "Get Bulk Cron Log",
                };
                helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.NOT_FOUND,
                    constants.ERRORCODES.NOT_FOUND,
                    constants.ERRORMESSAGES.NOT_FOUND,
                    message
                );
            }

            break;
        case "send_Products_Fby":
            var { variables, result } = await db.execute(
                db_constants.DB_CONSTANTS_PRODUCT.GET_PRODUCT_BY_FLAG,
                [search_case]
            );

            if (result.length > 0) {
                /* product loop start */
                for (const product of result) {
                    let fby_id = product.fby_user_id;
                    let old_cron_id = product.cron_id;
                    let exist_cron = 1;
                    let cron_name = product.cron_name;
                    // get user details
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_ACCOUNT.USER,
                        [fby_id]
                    );
                    let isEmpty = helpers.isEmpty(result) && helpers.isEmpty(result[0]);

                    if (!isEmpty) {
                        let user = variables;

                        var { result } = await fbyService.getFBYToken(res, user, cron_name, old_cron_id);
                        if (result.error) {
                            details[product.sku] = {
                                fby_user_id: fby_id,
                                query_action: constants.CUSTOM_MESSAGES.GET_JWT_TOKEN
                            }
                            return
                        }
                        let api_key = result;

                        let response = await fbyService.insertSku(api_key, product, exist_cron, cron_name, old_cron_id);

                        let alert_response = await fbyService.insertAlert(api_key, response[product.sku], product.channel, product.owner_code, cron_name, old_cron_id);
                        details[product.sku] = {
                            fby_user_id: fby_id,
                            result: alert_response
                        }
                    } else {
                        details[product.sku] = {
                            fby_user_id: fby_id,
                            query_action: constants.CUSTOM_MESSAGES.GET_USER
                        }
                    }

                }
                /* product loop end */
                msg.message = details;
                // res.send(msg);
                helpers.sendSuccess(
                    res,
                    constants.HTTPSTATUSCODES.OK,
                    constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                    msg,
                );
            } else {
                let message = {
                    case: search_case,
                    query_action: "Get Product By Flag",
                };
                helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.NOT_FOUND,
                    constants.ERRORCODES.NOT_FOUND,
                    constants.ERRORMESSAGES.NOT_FOUND,
                    message
                );
            }

            break;
        case "get_Fby_Stock":
            //get cron details from bulk_process_error_log able having count 1 and flag 1
            var { variables, result } = await db.execute(
                db_constants.DB_CONSTANTS_CRON.GET_BULK_CRON_LOG,
                [search_case, dt.format("Y-m-d")]
            );

            if (result.length > 0) {
                let bulk_data = variables;
                let old_cron_id = bulk_data.cron_id;
                let exist_cron = 1;
                let cron_name = bulk_data.cron_name;
                let fby_id = bulk_data.fby_user_id;

                // get user details
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_ACCOUNT.USER,
                    [fby_id]
                );
                let isEmpty = helpers.isEmpty(result) && helpers.isEmpty(result[0]);

                if (result.length > 0) {
                    let user = variables;
                    /* get JWT token from fby */
                    var { result } = await fbyService.getFBYToken(res, user, cron_name, old_cron_id);
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
                    isEmpty = (helpers.isEmpty(result)
                        && helpers.isEmpty(result[0]));

                    if (result.length > 0) {

                        /*ebay account loop start */
                        for (const ebayAccount of result) {
                            let response = await fbyService.getStockList(api_key, ebayAccount, req, exist_cron, fby_id, cron_name, old_cron_id);

                            let alert_response = await fbyService.insertAlert(api_key, response[ebayAccount.domain], channel, ebayAccount.owner_code, cron_name, old_cron_id);
                            msg.message = alert_response;
                        }
                        /*ebay account loop start */
                        // res.send(msg);
                        helpers.sendSuccess(
                            res,
                            constants.HTTPSTATUSCODES.OK,
                            constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                            msg,
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
                        case: search_case,
                        query_action: constants.CUSTOM_MESSAGES.GET_USER,
                    };
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
                    case: search_case,
                    query_action: "Get Bulk Cron Log",
                };
                helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.NOT_FOUND,
                    constants.ERRORCODES.NOT_FOUND,
                    constants.ERRORMESSAGES.NOT_FOUND,
                    message
                );
            }

            break;
        case "push_stock_ebay":
            var { variables, result } = await db.execute(
                db_constants.DB_CONSTANTS_PRODUCT.GET_PRODUCT_BY_FLAG,
                [search_case]
            );

            if (result.length > 0) {
                /* product loop start */
                for (const product of result) {
                    let fby_id = product.fby_user_id;
                    let old_cron_id = product.cron_id;
                    let cron_name = product.cron_name;
                    // get user details
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_ACCOUNT.USER,
                        [fby_id]
                    );

                    if (result.length > 0) {
                        let user = variables;

                        var { result } = await fbyService.getFBYToken(res, user, cron_name, old_cron_id);
                        if (result.error) {
                            details[product.sku] = {
                                fby_user_id: fby_id,
                                query_action: constants.CUSTOM_MESSAGES.GET_JWT_TOKEN
                            }
                            return
                        }
                        let api_key = result;

                        // get ebay user details
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_ACCOUNT.GET_SHOPIFY_USER,
                            [fby_id]
                        );

                        if (result.length > 0) {
                            /*ebay account loop start */
                            for (const ebayAccount of result) {
                                let response = await ebayService.updateQuantityEbay([product], ebayAccount, fby_id, cron_name, old_cron_id);
                                let alert_response = await fbyService.insertAlert(api_key, response[product.sku], channel, ebayAccount.owner_code, cron_name, old_cron_id);
                                details[product.sku] = {
                                    fby_user_id: fby_id,
                                    result: alert_response
                                }
                            }
                            /*ebay account loop start */

                        } else {
                            details[product.sku] = {
                                fby_user_id: fby_id,
                                query_action: "Get " + channel + constants.CUSTOM_MESSAGES.GET_CHHANEL_USER
                            }
                        }
                    } else {
                        details[product.sku] = {
                            fby_user_id: fby_id,
                            query_action: constants.CUSTOM_MESSAGES.GET_USER
                        }
                    }

                }
                /* product loop end */
                msg.message = details;
                res.send(msg);
            } else {
                let message = {
                    case: search_case,
                    query_action: "Get Product By Flag",
                };
                helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.NOT_FOUND,
                    constants.ERRORCODES.NOT_FOUND,
                    constants.ERRORMESSAGES.NOT_FOUND,
                    message
                );
            }

            break;
        case "get_ebay_orders":
            //get cron details from bulk_process_error_log able having count 1 and flag 1
            var { variables, result } = await db.execute(
                db_constants.DB_CONSTANTS_CRON.GET_BULK_CRON_LOG,
                [search_case, dt.format("Y-m-d")]
            );

            if (result.length > 0) {
                let bulk_data = variables;
                let old_cron_id = bulk_data.cron_id;
                let exist_cron = 1;
                let cron_name = bulk_data.cron_name;
                let fby_id = bulk_data.fby_user_id;

                // get user details
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_ACCOUNT.USER,
                    [fby_id]
                );
                // isEmpty = helpers.isEmpty(result) && helpers.isEmpty(result[0]);

                if (result.length > 0) {
                    let user = variables;
                    /* get JWT token from fby */
                    var { result } = await fbyService.getFBYToken(res, user, cron_name, old_cron_id);
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

                    // get ebay_account user details
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_ACCOUNT.GET_SHOPIFY_USER,
                        [fby_id]
                    );
                    // isEmpty = (helpers.isEmpty(result)
                    //     && helpers.isEmpty(result[0]));

                    if (result.length > 0) {

                        /*ebay account loop start */
                        for (const ebayAccount of result) {
                            let response = await ebayService.getOrders(req, res, [ebayAccount], exist_cron, fby_id, cron_name, old_cron_id);

                            let alert_response = await fbyService.insertAlert(api_key, response[ebayAccount.domain], channel, ebayAccount.owner_code, cron_name, old_cron_id);
                            msg.message = alert_response;
                        }
                        /*ebay account loop start */
                        // res.send(msg);
                        helpers.sendSuccess(
                            res,
                            constants.HTTPSTATUSCODES.OK,
                            constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                            msg,
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
                        case: search_case,
                        query_action: constants.CUSTOM_MESSAGES.GET_USER,
                    };
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
                    case: search_case,
                    query_action: "Get Bulk Cron Log",
                };
                helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.NOT_FOUND,
                    constants.ERRORCODES.NOT_FOUND,
                    constants.ERRORMESSAGES.NOT_FOUND,
                    message
                );
            }

            break;
        case "send_Orders_Fby":
            var { variables, result } = await db.execute(
                db_constants.DB_CONSTANTS_ORDER.GET_ORDER_BY_FLAG,
                [search_case]
            );

            if (result.length > 0) {
                /* order loop start */
                for (const order of result) {
                    let fby_id = order.fby_user_id;
                    let old_cron_id = order.cron_id;
                    let exist_cron = 1;
                    let cron_name = order.cron_name;
                    /* get user details */
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_ACCOUNT.USER,
                        [fby_id]
                    );
                    // let isEmpty = helpers.isEmpty(result) && helpers.isEmpty(result[0]);

                    if (result.length > 0) {
                        let user = variables;

                        var { result } = await fbyService.getFBYToken(res, user, cron_name, old_cron_id);
                        if (result.error) {
                            details[order.sku] = {
                                fby_user_id: fby_id,
                                query_action: constants.CUSTOM_MESSAGES.GET_JWT_TOKEN
                            }
                            return
                        }
                        let api_key = result;

                        let response = await fbyService.insertOrder(api_key, order, exist_cron, cron_name, old_cron_id);

                        let alert_response = await fbyService.insertAlert(api_key, response[order.order_no], order.channel, order.owner_code, cron_name, old_cron_id);
                        details[order.sku] = {
                            fby_user_id: fby_id,
                            result: alert_response
                        }
                    } else {
                        details[order.sku] = {
                            fby_user_id: fby_id,
                            query_action: constants.CUSTOM_MESSAGES.GET_USER
                        }
                    }

                }
                /* order loop end */
                msg.message = details;
                // res.send(msg);
                helpers.sendSuccess(
                    res,
                    constants.HTTPSTATUSCODES.OK,
                    constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                    msg,
                );
            } else {
                let message = {
                    case: search_case,
                    query_action: "Get order By Flag",
                };
                helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.NOT_FOUND,
                    constants.ERRORCODES.NOT_FOUND,
                    constants.ERRORMESSAGES.NOT_FOUND,
                    message
                );
            }

            break;
        case "send_Canceled_Orders_Fby":
            var { variables, result } = await db.execute(
                db_constants.DB_CONSTANTS_ORDER.GET_CNCL_ORDER_BY_FLAG,
                [search_case]
            );

            if (result.length > 0) {
                /* order loop start */
                for (const order of result) {
                    let fby_id = order.fby_user_id;
                    let old_cron_id = order.cron_id;
                    let exist_cron = 1;
                    let cron_name = order.cron_name;
                    /* get user details */
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_ACCOUNT.USER,
                        [fby_id]
                    );
                    // let isEmpty = helpers.isEmpty(result) && helpers.isEmpty(result[0]);

                    if (result.length > 0) {
                        let user = variables;

                        var { result } = await fbyService.getFBYToken(res, user, cron_name, old_cron_id);
                        if (result.error) {
                            details[order.sku] = {
                                fby_user_id: fby_id,
                                query_action: constants.CUSTOM_MESSAGES.GET_JWT_TOKEN
                            }
                            return
                        }
                        let api_key = result;

                        let response = await fbyService.insertCanceledOrder(api_key, order, exist_cron, cron_name, old_cron_id);

                        let alert_response = await fbyService.insertAlert(api_key, response[order.sku], order.channel, order.owner_code, cron_name, old_cron_id);
                        details[order.sku] = {
                            fby_user_id: fby_id,
                            result: alert_response
                        }
                    } else {
                        details[order.sku] = {
                            fby_user_id: fby_id,
                            query_action: constants.CUSTOM_MESSAGES.GET_USER
                        }
                    }

                }
                /* order loop end */
                msg.message = details;
                // res.send(msg);
                helpers.sendSuccess(
                    res,
                    constants.HTTPSTATUSCODES.OK,
                    constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                    msg,
                );
            } else {
                let message = {
                    case: search_case,
                    query_action: "Get canceled order By Flag",
                };
                helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.NOT_FOUND,
                    constants.ERRORCODES.NOT_FOUND,
                    constants.ERRORMESSAGES.NOT_FOUND,
                    message
                );
            }

            break;
        case "get_track_number":
            //get cron details from bulk_process_error_log able having count 1 and flag 1
            var { variables, result } = await db.execute(
                db_constants.DB_CONSTANTS_CRON.GET_BULK_CRON_LOG,
                [search_case, dt.format("Y-m-d")]
            );

            if (result.length > 0) {
                let bulk_data = variables;
                let old_cron_id = bulk_data.cron_id;
                let exist_cron = 1;
                let cron_name = bulk_data.cron_name;
                let fby_id = bulk_data.fby_user_id;

                // get user details
                var { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_ACCOUNT.USER,
                    [fby_id]
                );
                // let isEmpty = helpers.isEmpty(result) && helpers.isEmpty(result[0]);

                if (result.length > 0) {
                    let user = variables;
                    /* get JWT token from fby */
                    var { result } = await fbyService.getFBYToken(res, user, cron_name, old_cron_id);
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
                        /* order loop start */
                        //for (const order_details of orders) {
                            const order_details = orders[0];
                            let response = await fbyService.getTrackList(api_key, fby_id, order_details.owner_code, exist_cron, cron_name, old_cron_id);

                            let alert_response = await fbyService.insertAlert(api_key, response[order_details.order_no], channel, order_details.owner_code, cron_name, old_cron_id);
                            msg.message = alert_response;
                        //}
                        /*order loop end */
                        // res.send(msg);
                        helpers.sendSuccess(
                            res,
                            constants.HTTPSTATUSCODES.OK,
                            constants.ACTION.GET + constants.SUCESSSMESSAGES.EXECUTED,
                            msg,
                        );

                    } else {
                        let message = {
                            fby_user_id: req.query.fby_user_id,
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
                        case: search_case,
                        query_action: constants.CUSTOM_MESSAGES.GET_USER,
                    };
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
                    case: search_case,
                    query_action: "Get Bulk Cron Log",
                };
                helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.NOT_FOUND,
                    constants.ERRORCODES.NOT_FOUND,
                    constants.ERRORMESSAGES.NOT_FOUND,
                    message
                );
            }

            break;
        case "push_Track_ebay":
            var { variables, result } = await db.execute(
                db_constants.DB_CONSTANTS_ORDER.GET_CNCL_ORDER_BY_FLAG,
                [search_case]
            );

            if (result.length > 0) {
                /* order loop start */
                for (const order of result) {
                    let fby_id = order.fby_user_id;
                    let old_cron_id = order.cron_id;
                    let cron_name = order.cron_name;
                    // get user details
                    var { variables, result } = await db.execute(
                        db_constants.DB_CONSTANTS_ACCOUNT.USER,
                        [fby_id]
                    );

                    if (result.length > 0) {
                        let user = variables;

                        var { result } = await fbyService.getFBYToken(res, user, cron_name, old_cron_id);
                        if (result.error) {
                            details[order.sku] = {
                                fby_user_id: fby_id,
                                query_action: constants.CUSTOM_MESSAGES.GET_JWT_TOKEN
                            }
                            return
                        }
                        let api_key = result;

                        // get ebay user details
                        var { variables, result } = await db.execute(
                            db_constants.DB_CONSTANTS_ACCOUNT.GET_CHANNEL_USER,
                            [fby_id, channel, order.channel_code]
                        );

                        if (result.length > 0) {
                            /*ebay account loop start */
                            for (const ebayAccount of result) {
                                let response = await ebayService.pushTrackingEbay([order], ebayAccount, fby_id, cron_name, old_cron_id);
                                let alert_response = await fbyService.insertAlert(api_key, response[order.order_no], channel, ebayAccount.owner_code, cron_name, old_cron_id);
                                details[order.sku] = {
                                    fby_user_id: fby_id,
                                    result: alert_response
                                }
                            }
                            /*ebay account loop start */

                        } else {
                            details[order.sku] = {
                                fby_user_id: fby_id,
                                query_action: "Get " + channel + constants.CUSTOM_MESSAGES.GET_CHHANEL_USER
                            }
                        }
                    } else {
                        details[order.sku] = {
                            fby_user_id: fby_id,
                            query_action: constants.CUSTOM_MESSAGES.GET_USER
                        }
                    }

                }
                /* order loop end */
                msg.message = details;
                res.send(msg);
            } else {
                let message = {
                    case: search_case,
                    query_action: "Get tracked order details with flag 1 and count 1",
                };
                helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.NOT_FOUND,
                    constants.ERRORCODES.NOT_FOUND,
                    constants.ERRORMESSAGES.NOT_FOUND,
                    message
                );
            }

            break;
        default:
            msg.message = "The case parameter missing or invalid";
            helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.BAD_REQUEST,
                constants.ERRORCODES.VALIDATION_ERROR,
                constants.ERRORMESSAGES.NOT_FOUND,
                msg
            );
    }
};
