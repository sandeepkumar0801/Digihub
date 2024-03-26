
const moment = require("moment");
const { GET_FBY_STOCK, PUSH_STOCK_SHOPIFY, PUSH_STOCK_STOREDEN, PUSH_STOCK_WOOCOMMERCE } = require("../../../startup/env");
const { PUSH_STOCK_PRESTA, PUSH_STOCK_EBAY, PUSH_STOCK_MIRAKL, PUSH_STOCK_MAGENTO } = require("../../../startup/env");
const { PUSH_STOCK_AMAZON } = require("../../../startup/env");


const { getIds, getNewTime } = require("../config");
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const { CronJobsClass } = require("../CronJobsClass");
const urlencode = require('urlencode');
const { API_TYPES } = require("../../../misc/constants");
const constants = require("../../../server/constants/constants");
const dbCCLogs = require('../../../startup/dbcclogs');

const baseUrl = process.env.BASE_URL;
const timerReset = 30;
const timerDiff = 1;
const defaultTimer = 10;
//Get stcoks for all channel from FBY JOBS
exports.getFBYStock = async () => {

    let data = [];
    let time = '## * * * *'; //GET_FBY_STOCK
    let channelCounter = 0;

    let cc_operation = constants.CC_OPERATIONS.GET_STOCK_FROM_FBY;

    let URL = `shopify/api/get_fby_stock?fby_user_id=`;
    let method = ``;



    var startat = moment('2023-06-08 18:30:00');
    var updated_at = moment();
    var duration = moment.duration(updated_at.diff(startat));
    var hours = duration.asHours();
    // console.log('stock startat: ', startat.format(MOMENT_DATE_FORMAT));
    // console.log('stock updated_at: ', updated_at.format(MOMENT_DATE_FORMAT));
    if (hours > 2) {
        updated_at = updated_at.subtract(2, "hours");
    }
    else {
        updated_at = startat;
    }
    console.log('stock updateafter: ', updated_at.format(MOMENT_DATE_FORMAT));
    updated_at = urlencode(updated_at.format(MOMENT_DATE_FORMAT));

    getIds('all').then(async (ids) => {

        for await (const element of ids) {
            if (element.platformName.toLowerCase().includes('shopify')) {
                continue;
            }
            if (element.platformName.toLowerCase().includes('mirakl')) {
                continue;
            }
            if (element.platformName.toLowerCase().includes('amazon')) {
                continue;
            }
            if (element.platformName.toLowerCase().includes('magento')) {
                continue;
            }

            if (element.stockUpdate == 1) {

                channelCounter = channelCounter + timerDiff;
                let newTime = await getNewTime(channelCounter, defaultTimer, defaultTimer + 30);
                let newTimerCron = time.replace('##', newTime);
                method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${newTimerCron} \t \t \t`;

                let enpointurl = `${baseUrl}${URL}${element.channelId}&updated_after=${updated_at}`;
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

};

exports.pushStockShopify = async () => {
    let data = [];
    let time = '## * * * *'; //PUSH_STOCK_SHOPIFY
    let channelCounter = 0;
    let defaultTimer = 14;

    let cc_operation = 'PUSH_STOCK_SHOPIFY';

    let URL = `shopify/api/push_stock_shopify?fby_user_id=`;
    let method = ``;
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        getIds("shopify").then(async (ids) => {
            for await (const element of ids) {

                if (element.stockUpdate == 1) {

                    channelCounter = channelCounter + timerDiff;
                    let newTime = await getNewTime(channelCounter, defaultTimer + 5, defaultTimer + 35);
                    let newTimerCron = time.replace('##', newTime);

                    if (element.channelId == 39) {
                        newTimerCron = '35 * * * *';
                        channelCounter = channelCounter - timerDiff;
                    }
                    if (element.channelId == 40) {
                        newTimerCron = '37 * * * *';
                        channelCounter = channelCounter - timerDiff;
                    }
                    method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${newTimerCron} \t \t \t`;
                    channelCounter = channelCounter + timerDiff;

                    let enpointurl = `${baseUrl}${URL}${element.channelId}`;
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

exports.pushStockStoreden = async () => {
    let data = [];
    let cc_operation = 'PUSH_STOCK_STOREDEN';
    let time = PUSH_STOCK_STOREDEN;
    let url = `${baseUrl}storeden/api/push_stock_storeden?fby_user_id=`;
    let method = `${API_TYPES.STOREDEN} \t JOB pushStockStoreden \t\tUrl \t `;
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        getIds("storeden").then((ids) => {
            ids.forEach(async element => {
                method = `${element.channelName} \t JOB Push_Stock \t\tUrl \t `;
                if (element.stockUpdate == 1) {
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
    }
};

exports.pushStockMirakl = async () => {
    let data = [];
    let cc_operation = 'PUSH_STOCK_MIRAKL';
    let time = PUSH_STOCK_MIRAKL;
    let url = `${baseUrl}mirakl/api/push_stock_Mirakl?fby_user_id=`;
    let method = `${API_TYPES.MIRAKL} \t\t JOB pushStockMirakl \t\tUrl \t `;
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        getIds("mirakl").then(async (ids) => {

            for await (var element of ids) {
                if (element.channelId == 37) {
                    time = '45 * * * *';
                }
                if (element.channelId == 50) {
                    time = '55 * * * *';
                }
                method = `${element.channelName} \t JOB Push_Stock \t\tUrl \t `;
                if (element.stockUpdate == 1) {
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
            };
        });
    }
};

exports.pushStockWooCommerce = async () => {
    let data = [];
    let cc_operation = 'PUSH_STOCK_WOOCOMMERCE';
    let time = PUSH_STOCK_WOOCOMMERCE;
    let url = `${baseUrl}woocommerce/api/push_stock_woocommerce?fby_user_id=`;
    let method = `${API_TYPES.WOOCOMMERCE} \t JOB pushStockWooCommerce \t Url \t `;
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        getIds("woocommerce").then((ids) => {
            ids.forEach(element => {
                //if (element.channelId != 32) {
                method = `${element.channelName} \t JOB Push_Stock \t\tUrl \t `;
                if (element.stockUpdate == 1) {
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
                //}
            });
        });
    }
};


exports.pushStockPresta = async () => {
    let data = [];
    let cc_operation = 'PUSH_STOCK_PRESTA';
    let time = PUSH_STOCK_PRESTA;
    let url = `${baseUrl}prestashop/api/push_stock_presta?fby_user_id=`;
    let method = `${API_TYPES.PRESTASHOP} \t JOB pushStockPresta \t\tUrl \t `;
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        getIds("presta").then((ids) => {
            ids.forEach(async element => {
                method = `${element.channelName} \t JOB Push_Stock \t\tUrl \t `;
                if (element.stockUpdate == 1) {
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
    }
};


exports.pushStockEbay = async () => {
    let data = [];
    let cc_operation = 'PUSH_STOCK_EBAY';
    let time = PUSH_STOCK_EBAY;
    let url = `${baseUrl}ebay/api/push_stock_ebay?fby_user_id=`;
    let method = `${API_TYPES.EBAY} \t JOB pushStockEbay \t\tUrl \t `;
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        getIds("ebay").then((ids) => {
            ids.forEach(async element => {
                method = `${element.channelName} \t JOB Push_Stock \t\tUrl \t `;
                if (element.stockUpdate == 1) {
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
    }
};


exports.pushStockAmazon = async () => {

    let data = [];
    let time = '## * * * *'; // PUSH_STOCK_AMAZON;
    let channelCounter = 0;
    let defaultTimer = 39;
    let cc_operation = 'PUSH_STOCK_AMAZON';
    let apiType = API_TYPES.AMAZON;
    let URL = `amazon/api/push_stock_Amazon?fby_user_id=`;
    let method = ``;
    var updated_at = moment();
    updated_at = updated_at.subtract(2, "days");
    updated_at = urlencode(updated_at.format(MOMENT_DATE_FORMAT));

    getIds(apiType.toLowerCase()).then((ids) => {
        ids.forEach(async element => {
            method = `${element.channelName} \t JOB Push_Stock \t\tUrl \t `;
            if (element.stockUpdate == 1) {
                let newTime = defaultTimer + channelCounter;
                let newTimerCron = time.replace('##', newTime);
                channelCounter = channelCounter + 2;
                method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${newTimerCron} \t \t \t`;
                if (channelCounter > 59) {
                    newTime = channelCounter = defaultTimer;
                }
                // if (element.channelId == 42) {
                //     time = '10 * * * *';
                // }


                let enpointurl = `${baseUrl}${URL}${element.channelId}`;
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
        });

    });

};

//magento
exports.pushStockMagento = async () => {
    let data = [];
    let cc_operation = "PUSH_STOCK_MAGENTO";
    let time = PUSH_STOCK_MAGENTO;
    let url = `${baseUrl}magento/api/push_stock_magento?fby_user_id=`;
    let method = `${API_TYPES.MAGENTO} \t JOB pushStockMagento \t\t Url \t `;
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        await getIds("magento").then((ids) => {
            ids.forEach(async element => {
                let enpointurl = `${url}${element.channelId}`;
                // console.log(`${method}`, enpointurl);
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
    }
};

