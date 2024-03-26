"use strict";
const { CronJobsClass } = require("../CronJobsClass");
const { GET_PRESTA_ORDERS, GET_STOREDEN_ORDERS, GET_WOOCOMMERCE_ORDERS, GET_SHOPIFY_ORDERS, SEND_ORDER_FBY, SEND_CANCELLED_ORDERS } = require("../../../startup/env");
const { GET_EBAY_ORDERS, GET_MIRAKL_ORDERS, GET_MAGENTO_ORDERS } = require("../../../startup/env");
const { getIds } = require("../config");
const { getNewTime } = require("../config");
const dbCCLogs = require('../../../startup/dbcclogs');

const { API_TYPES } = require("../../../misc/constants");

const constants = require("../../../server/constants/constants.js");
// default 
const baseUrl = process.env.BASE_URL;
const timerReset = 30;
const timerDiff = 1;
const defaultTimer = 10;
// exports.sendOrderFBY = async () => {
//     let data = [];
//     let time = SEND_ORDER_FBY;
//     let url = `${baseUrl}shopify/api/send_orders_fby?fby_user_id=`;
//     if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
//         await getIds("all").then((ids) => {
//             let method = `${API_TYPES.SHOPIFY} \t JOB Send_Order_FBY \t\tUrl \t `;
//             ids.forEach(element => {
//                 method = `${element.channelName} \tJOB Send_Order_FBY \t\tUrl \t`;
//                 if (element.orderSync == 1) {
//                     setTimeout(() => {
//                         let enpointurl = `${url}${element.channelId}`;
//                         console.log(`${method}`, enpointurl);
//                         let cronJobsClass = new CronJobsClass(time, enpointurl, data);
//                         cronJobsClass.runjob();
//                     }, 1000);
//                 }
//             });

//         });

//     }

// };


exports.sendOrderFBY = async () => {
    let data = [];
    let time = '## * * * *'; //PUSH_STOCK_SHOPIFY
    let channelCounter = 0;
    let cc_operation = constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY;
    let URL = `${baseUrl}shopify/api/send_orders_fby?fby_user_id=`;
    let method = ``;
    console.log("\n");
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        await getIds("all").then(async (ids) => {
            for await (const element of ids) {


                if (element.orderSync == 1) {
                    channelCounter = channelCounter + timerDiff;

                    let newTime = await getNewTime(channelCounter, 3, 33);;
                    let newTimerCron = time.replace('##', newTime);

                    if (element.channelId == 39) {
                        newTimerCron = '1,31 * * * *';
                        channelCounter = channelCounter - timerDiff;
                    }
                    if (element.channelId == 40) {
                        newTimerCron = '2,33 * * * *';
                        channelCounter = channelCounter - timerDiff;
                    }

                    method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${newTimerCron} \t \t \t`;
                    channelCounter = channelCounter + timerDiff;

                    let enpointurl = `${URL}${element.channelId}`;
                    console.log(`${method}`, enpointurl);
                    let croninputs = {
                        fby_user_id: element.channelId,
                        cc_operation: cc_operation,
                        cron_schedule: newTimerCron,
                        url: enpointurl.replace(baseUrl, "")
                    }
                    await dbCCLogs.InsertIntoTable(
                        "channelconnector._cron",
                        [croninputs]
                    );

                    let cronJobsClass = new CronJobsClass(newTimerCron, enpointurl, data);
                    cronJobsClass.runjob();
                }
            }
        });
    }
};


exports.sendCancelledOrders = async () => {
    let data = [];
    let time = '## * * * *';
    let channelCounter = 0;
    let cc_operation = constants.CC_OPERATIONS.PUSH_CANCELLED_ORDER_TO_FBY;
    let URL = `${baseUrl}shopify/api/send_cancelled_orders_fby?fby_user_id=`;
    let method = ``;
    console.log("\n");
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        await getIds("all").then(async (ids) => {
            for await (const element of ids) {
                channelCounter = channelCounter + timerDiff;
                if (element.orderSync == 1) {

                    channelCounter = channelCounter + timerDiff;

                    let newTime = await getNewTime(channelCounter, 25, 45);
                    let newTimerCron = time.replace('##', newTime);

                    if (element.channelId == 39) {
                        newTimerCron = '2,32 * * * *';
                        channelCounter = channelCounter - timerDiff;
                    }
                    if (element.channelId == 40) {
                        newTimerCron = '4,44 * * * *';
                        channelCounter = channelCounter - timerDiff;
                    }
                    method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t ${newTimerCron} \t \t \t`;

                    let enpointurl = `${URL}${element.channelId}`;
                    console.log(`${method}`, enpointurl);
                    let croninputs = {
                        fby_user_id: element.channelId,
                        cc_operation: cc_operation,
                        cron_schedule: newTimerCron,
                        url: enpointurl.replace(baseUrl, "")
                    }
                    await dbCCLogs.InsertIntoTable(
                        "channelconnector._cron",
                        [croninputs]
                    );
                    let cronJobsClass = new CronJobsClass(newTimerCron, enpointurl, data);
                    cronJobsClass.runjob();
                }
            }
        });
    }
};

exports.getShopifyOrders = async () => {

    let data = [];
    let time = '## * * * *';  //GET_SHOPIFY_ORDERS;
    let cc_operation = constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL;
    let url = `${baseUrl}shopify/api/get_shopify_orders?fby_user_id=`;
    let method = ``;
    let channelCounter = 0;

    await getIds("shopify").then(async (ids) => {

        for await (const element of ids) {
            method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t ${time} \t \t`;
            if (element.orderSync == 1) {

                channelCounter++;

                let newTime = await getNewTime(channelCounter, 17, 47);
                let newTimerCron = time.replace('##', newTime);

                method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t ${newTimerCron} \t \t`;

                let enpointurl = `${url}${element.channelId}`;
                console.log(`${method}\t`, enpointurl);
                let croninputs = {
                    fby_user_id: element.channelId,
                    cc_operation: cc_operation,
                    cron_schedule: newTimerCron,
                    url: enpointurl.replace(baseUrl, "")
                }
                await dbCCLogs.InsertIntoTable(
                    "channelconnector._cron",
                    [croninputs]
                );
                let cronJobsClass = new CronJobsClass(newTimerCron, enpointurl, data);
                cronJobsClass.runjob();

            }
        };

    });

};


exports.getStoreDenOrders = async () => {

    let data = [];
    let cc_operation = "GET_STOREDEN_ORDERS";
    let time = GET_STOREDEN_ORDERS;
    let url = `${baseUrl}storeden/api/get_storeden_orders?fby_user_id=`;
    let method = `${API_TYPES.STOREDEN} \t JOB getStoredenOrders \t\tUrl \t `;
    await getIds("storeden").then((ids) => {
        ids.forEach(async element => {
            method = `${element.channelName} \tJOB Get_Orders_STOREDEN \t\tUrl \t`;
            if (element.orderSync == 1) {

                method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${time} \t \t`;
                let enpointurl = `${url}${element.channelId}`;
                console.log(`${method}`, enpointurl);
                let croninputs = {
                    fby_user_id: element.channelId,
                    cc_operation: cc_operation,
                    cron_schedule: time,
                    url: enpointurl.replace(baseUrl, "")
                }
                await dbCCLogs.InsertIntoTable(
                    "channelconnector._cron",
                    [croninputs]
                );
                let cronJobsClass = new CronJobsClass(time, enpointurl, data);
                cronJobsClass.runjob();
            }
        });

    });

};

exports.getWooCommerceOrders = async () => {

    let data = [];
    let cc_operation = "GET_WOOCOMMERCE_ORDERS";
    let time = GET_WOOCOMMERCE_ORDERS;
    let url = `${baseUrl}woocommerce/api/get_woocommerce_orders?fby_user_id=`;
    let method = `${API_TYPES.WOOCOMMERCE} \t JOB getWoocommerceOrders \t Url \t `;
    await getIds("woocommerce").then((ids) => {
        ids.forEach(element => {
            method = `${element.channelName} \tJOB Get_Orders_WOOCOMMERCE \t\tUrl \t`;
            if (element.orderSync == 1 && element.channelId != 32) {
                setTimeout(async () => {
                    method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t ${time} \t \t \t`;
                    let enpointurl = `${url}${element.channelId}`;
                    console.log(`${method}`, enpointurl);
                    let croninputs = {
                        fby_user_id: element.channelId,
                        cc_operation: cc_operation,
                        cron_schedule: time,
                        url: enpointurl.replace(baseUrl, "")
                    }
                    await dbCCLogs.InsertIntoTable(
                        "channelconnector._cron",
                        [croninputs]
                    );
                    let cronJobsClass = new CronJobsClass(time, enpointurl, data);
                    cronJobsClass.runjob();
                }, 1000);
            }
        });

    });

};


exports.getPrestaOrders = async () => {
    let data = [];
    let cc_operation = "GET_PRESTA_ORDERS";
    let time = GET_PRESTA_ORDERS;
    let url = `${baseUrl}prestashop/api/get_presta_orders?fby_user_id=`;
    let method = `${API_TYPES.PRESTASHOP} \t JOB getPrestaOrders \t\tUrl \t `;
    await getIds("presta").then((ids) => {
        ids.forEach(async element => {
            method = `${element.channelName} \tJOB Get_Orders_PRESTASHOP \t\tUrl \t`;
            if (element.orderSync == 1) {
                method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${time} \t \t \t`;
                let enpointurl = `${url}${element.channelId}`;
                console.log(`${method}`, enpointurl);
                let croninputs = {
                    fby_user_id: element.channelId,
                    cc_operation: cc_operation,
                    cron_schedule: time,
                    url: enpointurl.replace(baseUrl, "")
                }
                await dbCCLogs.InsertIntoTable(
                    "channelconnector._cron",
                    [croninputs]
                );
                let cronJobsClass = new CronJobsClass(time, enpointurl, data);
                cronJobsClass.runjob();
            }
        });
    });
};

// Ebay
exports.getEbayOrders = async () => {
    let data = [];
    let cc_operation = "GET_EBAY_ORDERS";
    let time = GET_EBAY_ORDERS;
    let url = `${baseUrl}ebay/api/get_ebay_orders?fby_user_id=`;
    let method = `${API_TYPES.EBAY} \t JOB getEbayOrders \t Url \t `;
    await getIds("ebay").then((ids) => {
        ids.forEach(async element => {
            method = `${element.channelName} \tJOB Get_Orders_EBAY \t\tUrl \t`;
            if (element.orderSync == 1) {
                method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${time} \t \t`;
                let enpointurl = `${url}${element.channelId}`;
                console.log(`${method}`, enpointurl);
                let croninputs = {
                    fby_user_id: element.channelId,
                    cc_operation: cc_operation,
                    cron_schedule: time,
                    url: enpointurl.replace(baseUrl, "")
                }
                await dbCCLogs.InsertIntoTable(
                    "channelconnector._cron",
                    [croninputs]
                );
                let cronJobsClass = new CronJobsClass(time, enpointurl, data);
                cronJobsClass.runjob();
            }
        });
    });
};

//
exports.getMiraklOrders = async () => {
    let data = [];
    let cc_operation = "GET_MIRAKL_ORDERS";
    let time = GET_MIRAKL_ORDERS;
    let url = `${baseUrl}mirakl/api/get_Orders_Mirakl?fby_user_id=`;
    let method = `${API_TYPES.MIRAKL} \t\t JOB getMiraklOrders \t\t Url \t `;
    await getIds("mirakl").then((ids) => {
        ids.forEach(async element => {
            method = `${element.platformName} \t${time} \tJOB Get_Orders_MIRAKL \t\tUrl \t`;
            if (element.orderSync == 1) {
                method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${time} \t \t \t`;
                let enpointurl = `${url}${element.channelId}`;
                console.log(`${method}`, enpointurl);
                let croninputs = {
                    fby_user_id: element.channelId,
                    cc_operation: cc_operation,
                    cron_schedule: time,
                    url: enpointurl.replace(baseUrl, "")
                }
                await dbCCLogs.InsertIntoTable(
                    "channelconnector._cron",
                    [croninputs]
                );
                let cronJobsClass = new CronJobsClass(time, enpointurl, data);
                cronJobsClass.runjob();
            }
        });
    });
};

// Magento
exports.getMagentoOrders = async () => {
    let data = [];
    let cc_operation = "GET_MAGENTO_ORDERS";
    let time = GET_MAGENTO_ORDERS;
    let url = `${baseUrl}magento/api/get_magento_orders?fby_user_id=`;
    let method = `${API_TYPES.MAGENTO} \t JOB getMagentoOrders \t Url \t `;
    await getIds("magento").then((ids) => {
        ids.forEach(async element => {
            let enpointurl = `${url}${element.channelId}`;
            console.log(`${method}`, enpointurl);
            let croninputs = {
                fby_user_id: element.channelId,
                cc_operation: cc_operation,
                cron_schedule: time,
                url: enpointurl.replace(baseUrl, "")
            }
            await dbCCLogs.InsertIntoTable(
                "channelconnector._cron",
                [croninputs]
            );
            let cronJobsClass = new CronJobsClass(time, enpointurl, data);
            cronJobsClass.runjob();
        });
    });
};