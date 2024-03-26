const fbyController = require("../controller/fbyController.js");
//const shopifyController = require("../controller/shopifyController.js");
const constants = require("../constants/constants.js");
const db = require("../database/dbConnection.js");
//const common = require("../constants/common.js");
//const mail = require("../constants/email.js");
//const dateTime = require("node-datetime");
//const moment = require("moment");
const axios = require("axios");
const dbpool = require("../../startup/db");
require('dotenv/config');
//const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";


exports.fbyCommonApis = async (req, res) => {
    let sql = '';
    let msg = {};
    if (!Object.keys(req.query).length || req.query.case == "") {
        if (!res.headersSent) res.send(constants.EMPTY);
    } else {
        if (!(req.query.fby_user_id) || req.query.fby_user_id == "") {
            if (!res.headersSent) res.send(constants.EMPTY_USER_ID);
        } else {
            let search_case = req.query.case;
            let fby_user_id = req.query.fby_user_id;
            let cron_name = "payment_method_call";
            let cron_id = Math.floor(Math.random() * 16);
            let msg = {};
            let usersql = "CALL get_user(?)";
            switch (search_case) {
                case "payment_method_code":

                    sql = "CALL get_user(?)";
                    dbpool.execute(sql, [fby_user_id], function (err, result, fields) {
                        if (err) {
                            msg = { error: { "data": err } };
                        }
                        if (result) {
                            if (result[0].length > 0) {
                                for (const user of result[0]) {
                                    /* calling fby controller to get 'jwt token' */
                                    fbyController.getFBYToken(user, cron_name, cron_id, function (result) {
                                        if (result.error) {
                                            msg[user.id] = result;
                                        } else {
                                            let api_token = result.success.data;
                                            let axiosConfig = {
                                                headers: {
                                                    Authorization: `Bearer ${api_token}`,
                                                },
                                            };
                                            axios
                                                .get(
                                                    constants.FBY_PAYMENTMETHOD_URL,
                                                    axiosConfig
                                                )
                                                .then((response) => {
                                                    if (response.data != undefined && response.data ) {
                                                        msg[user.id] = response.data;
                                                        if (response.data.paymentsType.items) {
                                                            for (const payment_method of response.data.paymentsType.items) {
                                                                let method_code = payment_method.paymentMethodCode;
                                                                let method_name = payment_method.paymentMethodName;

                                                                sql = "CALL addPaymentMethod(?,?)";
                                                                dbpool.execute(sql, [method_name, method_code], function (err, result, fields) {
                                                                    if (err) {
                                                                        msg = { error: { "data": err } };
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }
                                                })
                                                .catch((error) => {
                                                    msg[user.id] = error;
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
                    setTimeout(() => {
                        if (!res.headersSent) res.send(msg);
                    }, 10000);

                    break;
                case "cancel_reason":
                    sql = "CALL get_user(?)";
                    dbpool.execute(sql, [fby_user_id], function (err, result, fields) {
                        if (err) {
                            msg = { error: { "data": err } };
                        }
                        if (result) {
                            msg = {};
                            if (result[0].length > 0) {
                                for (const user of result[0]) {
                                    /* calling fby controller to get 'jwt token' */
                                    fbyController.getFBYToken(user, cron_name, cron_id, function (result) {
                                        if (result.error) {
                                            msg[user.id] = result;
                                        } else {
                                            let api_token = result.success.data;
                                            let axiosConfig = {
                                                headers: {
                                                    Authorization: `Bearer ${api_token}`,
                                                },
                                            };
                                            axios
                                                .get(
                                                    constants.FBY_CANCELREASON_URL,
                                                    axiosConfig
                                                )
                                                .then((response) => {
                                                    msg[user.id] = response.data;
                                                    if (response.data.requestCausals) {
                                                        for (const requestCausal of response.data.requestCausals) {
                                                            let method_code = requestCausal.code;
                                                            let method_name = requestCausal.name;


                                                            sql = "CALL addCancelReason(?,?)";
                                                            dbpool.execute(sql, [method_name, method_code], function (err, result, fields) {
                                                                if (err) {
                                                                    msg = { error: { "data": err } };
                                                                }
                                                            });
                                                        }
                                                    }
                                                })
                                                .catch((error) => {
                                                    msg[user.id] = error;
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
                    setTimeout(() => {
                        if (!res.headersSent) res.send(msg);
                    }, 15000);
                    break;
                case "alert_codes":
                    sql = "CALL get_user(?)";
                    dbpool.execute(sql, [fby_user_id], function (err, result, fields) {
                        if (err) {
                            msg = { error: { "data": err } };
                        }
                        if (result) {
                            msg = {};
                            if (result[0].length > 0) {
                                for (const user of result[0]) {
                                    /* calling fby controller to get 'jwt token' */
                                    fbyController.getFBYToken(user, cron_name, cron_id, function (result) {
                                        if (result.error) {
                                            msg[user.id] = result.error;
                                        } else {
                                            let api_token = result.success.data;
                                            let axiosConfig = {
                                                headers: {
                                                    Authorization: `Bearer ${api_token}`,
                                                },
                                            };
                                            axios
                                                .get(
                                                    constants.FBY_ALERTCODE_URL,
                                                    axiosConfig
                                                )
                                                .then((response) => {
                                                    msg[user.id] = response.data;
                                                    if (response.data.alertCodes) {
                                                        for (const alertCode of response.data.alertCodes) {
                                                            let method_code = alertCode.code;
                                                            let method_name = alertCode.name;


                                                            sql = "CALL addAlertCodes(?,?)";
                                                            dbpool.execute(sql, [method_name, method_code], function (err, result, fields) {
                                                                if (err) {
                                                                    msg = { error: { "data": err } };
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                                .catch((error) => {
                                                    msg[user.id] = error;
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
                    setTimeout(() => {
                        if (!res.headersSent) res.send(msg);
                    }, 10000);
                    break;
                case "alert_domains":
                    sql = "CALL get_user(?)";
                    dbpool.execute(sql, [fby_user_id], function (err, result, fields) {
                        if (err) {
                            msg = { error: { "data": err } };
                        }
                        if (result) {
                            msg = {};
                            if (result[0].length > 0) {
                                for (const user of result[0]) {
                                    /* calling fby controller to get 'jwt token' */
                                    fbyController.getFBYToken(user, cron_name, cron_id, function (result) {
                                        if (result.error) {
                                            msg[user.id] = result.error;
                                        } else {
                                            let api_token = result.success.data;
                                            let axiosConfig = {
                                                headers: {
                                                    Authorization: `Bearer ${api_token}`,
                                                },
                                            };
                                            axios
                                                .get(
                                                    constants.FBY_ALERTDOMAIN_URL,
                                                    axiosConfig
                                                )
                                                .then((response) => {
                                                    msg[user.id] = response.data;
                                                    if (response.data.alertDomains) {
                                                        for (const alertDomain of response.data.alertDomains) {
                                                            let method_code = alertDomain.code;
                                                            let method_name = alertDomain.name;


                                                            sql = "CALL addAlertDomains(?,?)";
                                                            dbpool.execute(sql, [method_name, method_code], function (err, result, fields) {
                                                                if (err) {
                                                                    msg = { error: { "data": err } };
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                                .catch((error) => {
                                                    msg[user.id] = error;
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
                    setTimeout(() => {
                        if (!res.headersSent) res.send(msg);
                    }, 10000);
                    break;
                case "channel_codes":
                    sql = "CALL get_user(?)";
                    dbpool.execute(sql, [fby_user_id], function (err, result, fields) {
                        if (err) {
                            msg = { error: { "data": err } };
                        }
                        if (result) {
                            msg = {};
                            if (result[0].length > 0) {
                                for (const user of result[0]) {
                                    /* calling fby controller to get 'jwt token' */
                                    fbyController.getFBYToken(user, cron_name, cron_id, function (result) {
                                        if (result.error) {
                                            msg[user.id] = result.error;
                                        } else {
                                            let api_token = result.success.data;
                                            let axiosConfig = {
                                                headers: {
                                                    Authorization: `Bearer ${api_token}`,
                                                },
                                            };
                                            axios
                                                .get(
                                                    constants.FBY_CHANNELCODE_URL,
                                                    axiosConfig
                                                )
                                                .then((response) => {
                                                    msg[user.id] = response.data;
                                                    if (response.data.channels) {
                                                        for (const channel of response.data.channels) {
                                                            let method_code = channel.code;
                                                            let method_name = channel.name;

                                                            sql = "CALL addChannelCodes(?,?)";
                                                            dbpool.execute(sql, [method_name, method_code], function (err, result, fields) {
                                                                if (err) {
                                                                    msg = { error: { "data": err } };
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                                .catch((error) => {
                                                    msg[user.id] = error;
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
                    setTimeout(() => {
                        if (!res.headersSent) res.send(msg);
                    }, 10000);
                    break;
                case "currency_codes":
                    sql = "CALL get_user(?)";
                    dbpool.execute(sql, [fby_user_id], function (err, result, fields) {
                        if (err) {
                            msg = { error: { "data": err } };
                        }
                        if (result) {
                            msg = {};
                            if (result[0].length > 0) {
                                for (const user of result[0]) {
                                    /* calling fby controller to get 'jwt token' */
                                    fbyController.getFBYToken(user, cron_name, cron_id, function (result) {
                                        if (result.error) {
                                            msg[user.id] = result.error;
                                        } else {
                                            let api_token = result.success.data;
                                            let axiosConfig = {
                                                headers: {
                                                    Authorization: `Bearer ${api_token}`,
                                                },
                                            };
                                            axios
                                                .get(
                                                    constants.FBY_CURRENCYCODE_URL,
                                                    axiosConfig
                                                )
                                                .then((response) => {
                                                    msg[user.id] = response.data;
                                                    if (response.data.currencies) {
                                                        for (const currency of response.data.currencies) {
                                                            let method_code = currency.code;
                                                            let method_name = currency.name;

                                                            sql = "CALL addCurrencyCodes(?,?)";
                                                            dbpool.execute(sql, [method_name, method_code], function (err, result, fields) {
                                                                if (err) {
                                                                    msg = { error: { "data": err } };
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                                .catch((error) => {
                                                    msg[user.id] = error;
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
                    setTimeout(() => {
                        if (!res.headersSent) res.send(msg);
                    }, 10000);
                    break;
                default:
                    if (!res.headersSent) res.send("not found");
            }
        }

    }
}

// export default {
//     fbyCommonApis
// };