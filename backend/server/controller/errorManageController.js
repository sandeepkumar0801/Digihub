const fbyController = require("../controller/fbyController.js");
const shopifyController = require("../controller/shopifyController.js");
const constants = require("../constants/constants.js");
const db = require("../database/dbConnection.js");
const common = require("../constants/common.js");
const mail = require("../constants/email.js");
const dateTime = require("node-datetime");
const moment = require("moment");
const axios = require("axios");
const dbpool = require("../../startup/db");
require('dotenv/config');
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

exports.errorManager = async (req, res) => {
    let sql = '';
    let msg = {};
    let search_case = req.query.case;
    try {
        if (!Object.keys(req.query).length || req.query.case == "") {
            res.send(constants.EMPTY);
        } else if (req.query.updated_after && !(moment(req.query.updated_after, MOMENT_DATE_FORMAT, true).isValid())) {
            msg = {
                error: "invalid date format",
                message: "required date format " + MOMENT_DATE_FORMAT,
            };
            if (!res.headersSent) {
                res.send(msg);
            }
        } else {

            let usersql = "CALL channelconnector.get_user(?)";
            let getProductByFlagSql = "CALL channelconnector.getProductByFlag(?)";
            let getBlukCronByFlaSql = "CALL channelconnector.getBlukCronByFlag(?,?)";
            let msg = {};
            let dt = dateTime.create();
            switch (search_case) {
                case "send_Orders_Fby":
                    sql = "CALL channelconnector.getCancelOrderByFlag(?)";
                    dbpool.execute(sql, ['send_Orders_Fby'], function (err, result, fields) {

                        if (err) {

                            msg = { error: { data: err } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                        if (result) {

                            if (result[0].length > 0) {
                                /* call insertOrder method from fby controller */

                                /* order loop start */
                                for (const order of result[0]) {
                                    let old_cron_id = order.cron_id;
                                    let exist_cron = 1;
                                    let cron_name = order.cron_name;
                                    dbpool.execute(usersql, [order.fby_user_id], function (err, result, fields) {
                                        if (err) {
                                            msg = { error: { "data": JSON.stringify(err) } };
                                        }
                                        if (result) {
                                            if (result[0].length > 0) {
                                                for (const user of result[0]) {
                                                    /* calling fby controller to get 'jwt token' and 'insert Orders' */
                                                    fbyController.getFBYToken(user, cron_name, old_cron_id, function (result) {

                                                        if (result.error) {

                                                            msg[order.id] = JSON.stringify(result.error);
                                                        } else {
                                                            let api_token = result.success.data;

                                                            fbyController.insertOrder(api_token, order, exist_cron, cron_name, old_cron_id, function (result) {
                                                                setTimeout(() => {
                                                                    fbyController.insertAlert(api_token, result[order.order_no], order.channel, order.owner_code, cron_name, old_cron_id, function (result) {
                                                                        msg[order.id] = JSON.stringify(result);
                                                                    });
                                                                }, 10000);

                                                            });
                                                        }
                                                    });
                                                }
                                            } else {
                                                msg = { error: { "data": constants.NORECORD } };
                                            }
                                        } else {
                                            msg = { error: { "data": constants.NORECORD } };
                                        }
                                    });

                                }
                                /* order loop end */
                                setTimeout(() => {
                                    if (!res.headersSent) {
                                        res.send(msg);
                                    }
                                }, 15000);

                            } else {
                                msg = { error: { data: constants.NORECORD } };
                                if (!res.headersSent) {
                                    res.send(msg);
                                }
                            }
                        } else {
                            msg = { error: { data: constants.NORECORD } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                    });
                    break;
                case "send_Products_Fby":
                    // res.send("send_products_fby");
                    sql = "CALL channelconnector.getProductByFlag(?)";
                    dbpool.execute(sql, ['send_Products_Fby'], function (err, result, fields) {
                        if (err) {
                            msg = { error: { data: JSON.stringify(err) } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                        if (result) {
                            if (result[0].length > 0) {
                                /* call insertSku method from fby controler */

                                /* product loop start */
                                for (const product of result[0]) {
                                    let old_cron_id = product.cron_id;
                                    let exist_cron = 1;
                                    let cron_name = product.cron_name;
                                    dbpool.execute(usersql, [product.fby_user_id], function (err, result, fields) {
                                        if (err) {
                                            msg = { error: { "data": JSON.stringify(err) } };
                                        }
                                        if (result) {
                                            if (result[0].length > 0) {
                                                for (const user of result[0]) {
                                                    /* calling fby controller to get 'jwt token' */
                                                    fbyController.getFBYToken(user, cron_name, old_cron_id, function (result) {
                                                        if (result.error) {
                                                            msg[product.id] = JSON.stringify(result.error);
                                                        } else {

                                                            //product.owner_code = user.owner_code;
                                                            let api_token = result.success.data;
                                                            fbyController.insertSku(api_token, product, exist_cron, cron_name, old_cron_id, function (result) {
                                                                setTimeout(() => {
                                                                    fbyController.insertAlert(api_token, result[product.sku], product.channel, product.owner_code, cron_name, old_cron_id, function (result) {
                                                                        msg[product.id] = JSON.stringify(result);
                                                                    });
                                                                }, 10000);

                                                            });
                                                        }
                                                    });
                                                }
                                            } else {
                                                msg = { error: { "data": constants.NORECORD } };
                                            }
                                        } else {
                                            msg = { error: { "data": constants.NORECORD } };
                                        }
                                    });

                                }
                                /* product loop end */
                                setTimeout(() => {
                                    if (!res.headersSent) {
                                        res.send(msg);
                                    }
                                }, 15000);

                            } else {
                                msg = { error: { data: constants.NORECORD } };
                                if (!res.headersSent) {
                                    res.send(msg);
                                }
                            }
                        } else {
                            msg = { error: { data: constants.NORECORD } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                    });
                    break;
                case "push_Stock_Shopify":
                    dbpool.execute(getProductByFlagSql, ['push_Stock_Shopify'], function (err, result, fields) {
                        if (err) {
                            msg = { error: { data: JSON.stringify(err) } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                        if (result) {
                            if (result[0].length > 0) {
                                /* call insertSku method from fby controler */

                                /* product loop start */
                                for (const product of result[0]) {
                                    let old_cron_id = product.cron_id;
                                    let exist_cron = 1;
                                    let cron_name = product.cron_name;
                                    let shopifysql = "CALL channelconnector.getShopifyUser(?)";
                                    dbpool.execute(shopifysql, [product.fby_user_id], function (err, result, fields) {
                                        if (err) {
                                            msg = { error: { "data": JSON.stringify(err) } };
                                        }
                                        if (result) {
                                            if (result[0].length > 0) {
                                                /* shopify account loop start */
                                                for (const shopifyAccount of result[0]) {
                                                    dbpool.execute(usersql, [shopifyAccount.fby_user_id], function (err, result, fields) {
                                                        if (err) {
                                                            msg = { error: { "data": JSON.stringify(err) } };
                                                        }
                                                        if (result) {
                                                            if (result[0].length > 0) {
                                                                for (const user of result[0]) {
                                                                    /* calling fby controller to get 'jwt token' */
                                                                    fbyController.getFBYToken(user, cron_name, old_cron_id, function (result) {
                                                                        if (result.error) {
                                                                            msg[product.id] = JSON.stringify(result.error);
                                                                        } else {
                                                                            let api_token = result.success.data;
                                                                            shopifyController.pushProductsShopify([product], shopifyAccount, cron_name, old_cron_id)
                                                                                .then((params) => {
                                                                                    setTimeout(() => {
                                                                                        fbyController.insertAlert(api_token, params[product.sku], product.channel, product.owner_code, cron_name, old_cron_id, function (result) {
                                                                                            msg[shopifyAccount.domain] = JSON.stringify(result);
                                                                                        })
                                                                                    }, 10000);
                                                                                })
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                msg = { error: { "data": constants.NORECORD } };
                                                            }
                                                        } else {
                                                            msg = { error: { "data": constants.NORECORD } };
                                                        }
                                                    });
                                                }
                                                /* shopify account loop end */
                                            } else {
                                                msg = { error: { "data": constants.NORECORD } };
                                            }
                                        } else {
                                            msg = { error: { "data": constants.NORECORD } };
                                        }
                                    });

                                }
                                /* product loop end */
                                setTimeout(() => {
                                    if (!res.headersSent) {
                                        res.send(msg);
                                    }
                                }, 15000);

                            } else {
                                msg = { error: { data: constants.NORECORD } };
                                if (!res.headersSent) {
                                    res.send(msg);
                                }
                            }
                        } else {
                            msg = { error: { data: constants.NORECORD } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                    });
                    break;
                case "get_Shopify_Products":
                    dbpool.execute(getBlukCronByFlaSql, ['get_Shopify_Products', dt.format('Y-m-d')], function (err, result, fields) {
                        if (err) {
                            msg = { error: { data: err } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                        if (result) {
                            if (result[0].length > 0) {

                                /* bulk_process_error_log loop start */
                                for (const bulk_data of result[0]) {
                                    let old_cron_id = bulk_data.cron_id;
                                    let exist_cron = 1;
                                    let cron_name = bulk_data.cron_name;
                                    let shopifysql = "CALL channelconnector.getShopifyUser(?)";
                                    dbpool.execute(shopifysql, [bulk_data.fby_user_id], function (err, result, fields) {
                                        if (err) {
                                            msg = { error: { "data": JSON.stringify(err) } };
                                        }
                                        if (result) {
                                            if (result[0].length > 0) {
                                                /* shopify account loop start */
                                                for (const shopifyAccount of result[0]) {
                                                    dbpool.execute(usersql, [shopifyAccount.fby_user_id], function (err, result, fields) {
                                                        if (err) {
                                                            msg = { error: { "data": JSON.stringify(err) } };
                                                        }
                                                        if (result) {
                                                            if (result[0].length > 0) {
                                                                for (const user of result[0]) {
                                                                    /* calling fby controller to get 'jwt token' */
                                                                    fbyController.getFBYToken(user, cron_name, old_cron_id, function (result) {
                                                                        if (result.error) {
                                                                            msg[product.id] = JSON.stringify(result.error);
                                                                        } else {
                                                                            let api_token = result.success.data;
                                                                            shopifyController.getProducts([shopifyAccount], exist_cron, shopifyAccount.fby_user_id, cron_name, old_cron_id)
                                                                                .then((params) => {
                                                                                    setTimeout(() => {
                                                                                        fbyController.insertAlert(api_token, params[shopifyAccount.domain], user.channelName, shopifyAccount.owner_code, cron_name, old_cron_id, function (result) {
                                                                                            msg[shopifyAccount.domain] = JSON.stringify(result);
                                                                                        })
                                                                                    }, 10000);
                                                                                })
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                msg = { error: { "data": constants.NORECORD } };
                                                            }
                                                        } else {
                                                            msg = { error: { "data": constants.NORECORD } };
                                                        }
                                                    });
                                                }
                                                /* shopify account loop end */
                                            } else {
                                                msg = { error: { "data": constants.NORECORD } };
                                            }
                                        } else {
                                            msg = { error: { "data": constants.NORECORD } };
                                        }
                                    });
                                }
                                /* bulk_process_error_log loop end */
                                setTimeout(() => {
                                    if (!res.headersSent) {
                                        res.send(msg);
                                    }
                                }, 15000);

                            } else {
                                msg = { error: { data: constants.NORECORD } };
                                if (!res.headersSent) {
                                    res.send(msg);
                                }
                            }
                        } else {
                            msg = { error: { data: constants.NORECORD } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                    });
                    break;
                case "get_Shopify_Orders":
                    dbpool.execute(getBlukCronByFlaSql, ['get_Shopify_Orders', dt.format('Y-m-d')], function (err, result, fields) {
                        if (err) {
                            msg = { error: { data: JSON.stringify(err) } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                        if (result) {
                            if (result[0].length > 0) {

                                /* bulk_process_error_log loop start */
                                for (const bulk_data of result[0]) {
                                    let old_cron_id = bulk_data.cron_id;
                                    let exist_cron = 1;
                                    let cron_name = bulk_data.cron_name;
                                    let shopifysql = "CALL channelconnector.getShopifyUser(?)";
                                    dbpool.execute(shopifysql, [bulk_data.fby_user_id], function (err, result, fields) {
                                        if (err) {
                                            msg = { error: { "data": JSON.stringify(err) } };
                                        }
                                        if (result) {
                                            if (result[0].length > 0) {
                                                /* shopify account loop start */
                                                for (const shopifyAccount of result[0]) {
                                                    dbpool.execute(usersql, [shopifyAccount.fby_user_id], function (err, result, fields) {
                                                        if (err) {
                                                            msg = { error: { "data": JSON.stringify(err) } };
                                                        }
                                                        if (result) {
                                                            if (result[0].length > 0) {
                                                                for (const user of result[0]) {
                                                                    /* calling fby controller to get 'jwt token' */
                                                                    fbyController.getFBYToken(user, cron_name, old_cron_id, function (result) {
                                                                        if (result.error) {
                                                                            msg[product.id] = JSON.stringify(result.error);
                                                                        } else {
                                                                            let api_token = result.success.data;
                                                                            shopifyController.getOrders([shopifyAccount], exist_cron, shopifyAccount.fby_user_id, cron_name, old_cron_id)
                                                                                .then((params) => {
                                                                                    setTimeout(() => {
                                                                                        fbyController.insertAlert(api_token, params[shopifyAccount.domain], user.channelName, shopifyAccount.owner_code, cron_name, old_cron_id, function (result) {
                                                                                            msg[shopifyAccount.domain] = JSON.stringify(result);
                                                                                        })
                                                                                    }, 10000);
                                                                                })
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                msg = { error: { "data": constants.NORECORD } };
                                                            }
                                                        } else {
                                                            msg = { error: { "data": constants.NORECORD } };
                                                        }
                                                    });
                                                }
                                                /* shopify account loop end */
                                            } else {
                                                msg = { error: { "data": constants.NORECORD } };
                                            }
                                        } else {
                                            msg = { error: { "data": constants.NORECORD } };
                                        }
                                    });
                                }
                                /* bulk_process_error_log loop end */
                                setTimeout(() => {
                                    if (!res.headersSent) {
                                        res.send(msg);
                                    }
                                }, 15000);

                            } else {
                                msg = { error: { data: constants.NORECORD } };
                                if (!res.headersSent) {
                                    res.send(msg);
                                }
                            }
                        } else {
                            msg = { error: { data: constants.NORECORD } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                    });
                    break;
                case "send_Canceled_Orders_Fby":
                    sql = "CALL channelconnector.getCancelOrderByFlag(?)";
                    dbpool.execute(sql, ['send_Canceled_Orders_Fby'], function (err, result, fields) {
                        if (err) {
                            msg = { error: { data: err } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                        if (result) {
                            if (result[0].length > 0) {
                                /* call insertOrder method from fby controller */
                                // msg=result[0];
                                /* order loop start */
                                for (const order of result[0]) {
                                    let old_cron_id = order.cron_id;
                                    let exist_cron = 1;
                                    let cron_name = order.cron_name;
                                    dbpool.execute(usersql, [order.fby_user_id], function (err, result, fields) {
                                        if (err) {
                                            msg = { error: { "data": JSON.stringify(err) } };
                                        }
                                        if (result) {
                                            if (result[0].length > 0) {
                                                for (const user of result[0]) {
                                                    /* calling fby controller to get 'jwt token' and 'insert Orders' */
                                                    fbyController.getFBYToken(user, cron_name, old_cron_id, function (result) {
                                                        if (result.error) {
                                                            msg[order.id] = JSON.stringify(result.error);
                                                        } else {
                                                            let api_token = result.success.data;
                                                            fbyController.insertCanceledOrder(api_token, order, exist_cron, order.fby_user_id, cron_name, old_cron_id, function (result) {
                                                                setTimeout(() => {
                                                                    fbyController.insertAlert(api_token, result[order.sku], order.channel, order.owner_code, cron_name, old_cron_id, function (result) {
                                                                        msg[order.id] = JSON.stringify(result);
                                                                    })
                                                                }, 10000);

                                                            })
                                                        }
                                                    })
                                                }
                                            } else {
                                                msg = { error: { "data": constants.NORECORD } };
                                            }
                                        } else {
                                            msg = { error: { "data": constants.NORECORD } };
                                        }
                                    });

                                }
                                /* order loop end */
                                setTimeout(() => {
                                    if (!res.headersSent) {
                                        res.send(msg);
                                    }
                                }, 15000);

                            } else {
                                msg = { error: { data: constants.NORECORD } };
                                if (!res.headersSent) {
                                    res.send(msg);
                                }
                            }
                        } else {
                            msg = { error: { data: constants.NORECORD } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                    });
                    break;
                case "Get_Shopify_Location":
                    dbpool.execute(getProductByFlagSql, ['Get_Shopify_Location'], function (err, result, fields) {
                        if (err) {
                            msg = { error: { data: JSON.stringify(err) } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                        if (result) {
                            if (result[0].length > 0) {
                                /* call insertSku method from fby controler */

                                /* product loop start */
                                for (const product of result[0]) {
                                    let old_cron_id = product.cron_id;
                                    let cron_name = product.cron_name;
                                    let shopifysql = "CALL channelconnector.getShopifyUser(?)";
                                    dbpool.execute(shopifysql, [product.fby_user_id], function (err, result, fields) {
                                        if (err) {
                                            msg = { error: { "data": JSON.stringify(err) } };
                                        }
                                        if (result) {
                                            if (result[0].length > 0) {
                                                /* shopify account loop start */
                                                for (const shopifyAccount of result[0]) {
                                                    dbpool.execute(usersql, [shopifyAccount.fby_user_id], function (err, result, fields) {
                                                        if (err) {
                                                            msg = { error: { "data": JSON.stringify(err) } };
                                                        }
                                                        if (result) {
                                                            if (result[0].length > 0) {
                                                                for (const user of result[0]) {
                                                                    /* calling fby controller to get 'jwt token' */
                                                                    fbyController.getFBYToken(user, cron_name, old_cron_id, function (result) {
                                                                        if (result.error) {
                                                                            msg[product.id] = result.error;
                                                                        } else {
                                                                            let api_token = result.success.data;
                                                                            shopifyController.getLocationShopify([product], shopifyAccount, cron_name, old_cron_id)
                                                                                .then((params) => {
                                                                                    setTimeout(() => {
                                                                                        fbyController.insertAlert(api_token, params[product.sku], product.channel, shopifyAccount.owner_code, cron_name, old_cron_id, function (result) {
                                                                                            msg[shopifyAccount.domain] = JSON.stringify(result);
                                                                                        })
                                                                                    }, 10000);
                                                                                })
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                msg = { error: { "data": constants.NORECORD } };
                                                            }
                                                        } else {
                                                            msg = { error: { "data": constants.NORECORD } };
                                                        }
                                                    });
                                                }
                                                /* shopify account loop end */
                                            } else {
                                                msg = { error: { "data": constants.NORECORD } };
                                            }
                                        } else {
                                            msg = { error: { "data": constants.NORECORD } };
                                        }
                                    });

                                }
                                /* product loop end */
                                setTimeout(() => {
                                    if (!res.headersSent) {
                                        res.send(msg);
                                    }
                                }, 15000);

                            } else {
                                msg = { error: { data: constants.NORECORD } };
                                if (!res.headersSent) {
                                    res.send(msg);
                                }
                            }
                        } else {
                            msg = { error: { data: constants.NORECORD } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                    });
                    break;
                case "get_Fby_Stock":
                    dbpool.execute(getBlukCronByFlaSql, ['get_Fby_Stock', dt.format('Y-m-d')], function (err, result, fields) {
                        if (err) {
                            msg = { error: { data: err } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                        if (result) {
                            if (result[0].length > 0) {

                                /* bulk_process_error_log loop start */
                                for (const bulk_data of result[0]) {
                                    let old_cron_id = bulk_data.cron_id;
                                    let exist_cron = 1;
                                    let cron_name = bulk_data.cron_name;
                                    let shopifysql = "CALL channelconnector.getShopifyUser(?)";
                                    dbpool.execute(shopifysql, [bulk_data.fby_user_id], function (err, result, fields) {
                                        if (err) {
                                            msg = { error: { "data": JSON.stringify(err) } };
                                        }
                                        if (result) {
                                            if (result[0].length > 0) {
                                                /* shopify account loop start */
                                                for (const shopifyAccount of result[0]) {
                                                    dbpool.execute(usersql, [shopifyAccount.fby_user_id], function (err, result, fields) {
                                                        if (err) {
                                                            msg = { error: { "data": JSON.stringify(err) } };
                                                        }
                                                        if (result) {
                                                            if (result[0].length > 0) {
                                                                for (const user of result[0]) {
                                                                    /* calling fby controller to get 'jwt token' */
                                                                    fbyController.getFBYToken(user, cron_name, old_cron_id, function (result) {
                                                                        if (result.error) {
                                                                            msg[shopifyAccount.domain] = JSON.stringify(result.error);
                                                                        } else {
                                                                            let api_token = result.success.data;
                                                                            if (shopifyAccount.stockUpdate == 1) {
                                                                                fbyController.getStockList(api_token, shopifyAccount, req, exist_cron, shopifyAccount.fby_user_id, cron_name, old_cron_id, function (result) {
                                                                                    setTimeout(() => {
                                                                                        fbyController.insertAlert(api_token, result[shopifyAccount.domain], user.channelName, shopifyAccount.owner_code, cron_name, old_cron_id, function (result) {
                                                                                            msg[shopifyAccount.domain] = JSON.stringify(result);
                                                                                        })
                                                                                    }, 10000);
                                                                                })
                                                                            }
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                msg = { error: { "data": constants.NORECORD } };
                                                            }
                                                        } else {
                                                            msg = { error: { "data": constants.NORECORD } };
                                                        }
                                                    });
                                                }
                                                /* shopify account loop end */
                                            } else {
                                                msg = { error: { "data": constants.NORECORD } };
                                            }
                                        } else {
                                            msg = { error: { "data": constants.NORECORD } };
                                        }
                                    });
                                }
                                /* bulk_process_error_log loop end */
                                setTimeout(() => {
                                    if (!res.headersSent) {
                                        res.send(msg);
                                    }
                                }, 15000);

                            } else {
                                msg = { error: { data: constants.NORECORD } };
                                if (!res.headersSent) {
                                    res.send(msg);
                                }
                            }
                        } else {
                            msg = { error: { data: constants.NORECORD } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                    });
                    break;
                case "push_Track_Shopify":
                    sql = "CALL channelconnector.getCancelOrderByFlag(?)";
                    dbpool.execute(sql, ['push_Track_Shopify'], function (err, result, fields) {
                        if (err) {
                            msg = { error: { data: err } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                        if (result) {
                            if (result[0].length > 0) {
                                /* order_detail loop start */
                                for (const order of result[0]) {
                                    let old_cron_id = order.cron_id;
                                    let cron_name = order.cron_name;
                                    let shopifysql = "CALL channelconnector.getShopifyUser(?)";
                                    dbpool.execute(shopifysql, [order.fby_user_id], function (err, result, fields) {
                                        if (err) {
                                            msg = { error: { "data": JSON.stringify(err) } };
                                        }
                                        if (result) {
                                            if (result[0].length > 0) {
                                                /* shopify account loop start */
                                                for (const shopifyAccount of result[0]) {
                                                    dbpool.execute(usersql, [shopifyAccount.fby_user_id], function (err, result, fields) {
                                                        if (err) {
                                                            msg = { error: { "data": JSON.stringify(err) } };
                                                        }
                                                        if (result) {
                                                            if (result[0].length > 0) {
                                                                for (const user of result[0]) {
                                                                    /* calling fby controller to get 'jwt token' */
                                                                    fbyController.getFBYToken(user, cron_name, old_cron_id, function (result) {
                                                                        if (result.error) {
                                                                            msg[order.id] = JSON.stringify(result.error);
                                                                        } else {
                                                                            let api_token = result.success.data;
                                                                            shopifyController.pushTrackingShopify([order], shopifyAccount, cron_name, old_cron_id)
                                                                                .then((params) => {
                                                                                    setTimeout(() => {
                                                                                        fbyController.insertAlert(api_token, params[order.order_no], order.channel, order.owner_code, cron_name, old_cron_id, function (result) {
                                                                                            msg[shopifyAccount.domain] = JSON.stringify(result);
                                                                                        })
                                                                                    }, 10000);
                                                                                })
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                msg = { error: { "data": constants.NORECORD } };
                                                            }
                                                        } else {
                                                            msg = { error: { "data": constants.NORECORD } };
                                                        }
                                                    });
                                                }
                                                /* shopify account loop end */
                                            } else {
                                                msg = { error: { "data": constants.NORECORD } };
                                            }
                                        } else {
                                            msg = { error: { "data": constants.NORECORD } };
                                        }
                                    });

                                }
                                /* order_detail loop end */
                                setTimeout(() => {
                                    if (!res.headersSent) {
                                        res.send(msg);
                                    }
                                }, 1000);

                            } else {
                                msg = { error: { data: constants.NORECORD } };
                                if (!res.headersSent) {
                                    res.send(msg);
                                }
                            }
                        } else {
                            msg = { error: { data: constants.NORECORD } };
                            if (!res.headersSent) {
                                res.send(msg);
                            }
                        }
                    });
                    break;
                default:
                    res.send("not found");
            }
        }
    }
    catch (err) {
        //  //console.log('errorManager catch error: ', err);
        helpers.sendError(
            res,
            constants.CATCH_TYPE,
            constants.ERRORCODES.VALIDATION_ERROR,
            error.details[0].message,
            req.body
        );
    }
};

// export default {
//     errorManager
// };
