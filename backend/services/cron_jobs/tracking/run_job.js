// getther info
// call jobs

// get the time and url from config file
// create generate data source

const { GET_TRACK_NUMBER, PUSH_TRACK_SHOPIFY, PUSH_TRACK_PRESTA, PUSH_TRACK_EBAY, PUSH_TRACK_MIRAKL, PUSH_TRACK_WOOCOMMERCE, PUSH_TRACK_MAGENTO } = require("../../../startup/env");
const { getIds, getNewTime } = require("../config");
const { API_TYPES } = require("../../../misc/constants");
const { CronJobsClass } = require("../CronJobsClass");
const dbCCLogs = require('../../../startup/dbcclogs');


//  DEFAULT
let baseUrl = process.env.BASE_URL;
const timerReset = 30;
const timerDiff = 1;
const defaultTimer = 3;

exports.getTrackNumber = async () => {

    let data = [];
    let time = '## * * * *'; //GET_TRAKING_FROM_FBY
    let channelCounter = 0;
    let cc_operation = 'GET_TRAKING_FROM_FBY';
    let url = `shopify/api/get_track_number?fby_user_id=`;
    let method = ''; //`${API_TYPES.SHOPIFY} \tJOB getTrackNumber \t\tUrl \t`;

    getIds("all").then(async (ids) => {
        "use strict";
        for await (const element of ids) {
            try {
                method = `${element.channelName} \tJOB getTrackNumber \t\tUrl \t`;


                channelCounter = channelCounter + timerDiff;
                let newTime = await getNewTime(channelCounter, defaultTimer + 5, defaultTimer + 35);
                let newTimerCron = time.replace('##', newTime);

                method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${newTimerCron} \t \t \t`;

                let enpointurl = `${baseUrl}${url}${element.channelId}`;
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
            catch (error) {
                console.log('error: ', error.message);

            }
        };
    });
};

exports.pushTrackShopify = async () => {
    "use strict";
    let data = [];
    let cc_operation = 'PUSH_TRACK_SHOPIFY';
    //let time = PUSH_TRACK_SHOPIFY;
    let time = '## * * * *';  //GET_SHOPIFY_ORDERS;
    let channelCounter = 0;
    let url = `${baseUrl}shopify/api/push_tracks_shopify?fby_user_id=`;
    let method = ``;
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        getIds("shopify").then(async (ids) => {
            channelCounter = 0;
            for await (const element of ids) {


                channelCounter++;
                let newTime = await getNewTime(channelCounter, 19, 39);
                let newTimerCron = time.replace('##', newTime);

                method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${newTimerCron} \t \t \t`;
                let enpointurl = `${url}${element.channelId}`;
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


            };
        });
    }
};


exports.pushTrackStoreden = async () => {
    let data = [];
    let cc_operation = 'PUSH_TRACK_SHOPIFY';
    let time = PUSH_TRACK_SHOPIFY;
    let url = `${baseUrl}storeden/api/push_track?fby_user_id=`;
    let method = `${API_TYPES.STOREDEN} \t JOB pushTrackStoreden \t\tUrl \t`;
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        getIds("storeden").then((ids) => {
            ids.forEach(async element => {
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
    }
};


exports.pushTrackPresta = async () => {
    let data = [];
    let cc_operation = 'PUSH_TRACK_PRESTA';
    let time = PUSH_TRACK_PRESTA;
    let url = `${baseUrl}prestashop/api/push_tracks?fby_user_id=`;
    let method = `${API_TYPES.PRESTASHOP} \t JOB pushTrackPresta \t\tUrl \t`;
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        getIds("presta").then((ids) => {
            ids.forEach(async element => {
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
    }
};

exports.pushTrackEbay = async () => {
    let data = [];
    let cc_operation = 'PUSH_TRACK_EBAY';
    let time = PUSH_TRACK_EBAY;
    let url = `${baseUrl}ebay/api/push_traks_ebay?fby_user_id=`;
    let method = `${API_TYPES.EBAY} \t JOB pushTrackEbay \t\tUrl \t`;
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        getIds("ebay").then((ids) => {
            ids.forEach(async element => {
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
    }
};

exports.pushTrackMirakl = async () => {
    let data = [];
    let cc_operation = 'PUSH_TRACK_MIRAKL';
    let time = PUSH_TRACK_MIRAKL;
    let url = `${baseUrl}mirakl/api/push_Tracking_Mirakl?fby_user_id=`;
    let method = `${API_TYPES.MIRAKL} \t\t JOB pushTrackMirakl \t\tUrl \t`;
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        getIds("mirakl").then((ids) => {
            ids.forEach(async element => {
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
    }
};

//http://localhost:3000/woocommerce/api/push_track?fby_user_id=1000

exports.pushTrackWoocommerce = async () => {

    let data = [];
    let time = '*/## * * * *'; //GET_FBY_STOCK
    let channelCounter = 0;

    let cc_operation = 'PUSH_TRACK_Woocommerce';

    let URL = `${baseUrl}woocommerce/api/push_track?fby_user_id=`;
    let method = ``;

    getIds('woocommerce').then(async (ids) => {

        for await (const element of ids) {
            if (!element.platformName.toLowerCase().includes('woocommerce')) {
                continue;
            }

            if (element.orderSync == 1) {

                let newTime = defaultTimer + channelCounter;
                let newTimerCron = time.replace('##', newTime);
                method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t ${newTimerCron} \t \t \t`;
                channelCounter = channelCounter + timerDiff;
                if (channelCounter > timerReset || channelCounter > 59) {
                    newTime = newTimerCron = channelCounter = defaultTimer;
                }
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

};

//Magento

exports.pushTrackMagento = async () => {
    let data = [];
    let cc_operation = "PUSH_TRACK_MAGENTO";
    let time = PUSH_TRACK_MAGENTO;
    let url = `${baseUrl}magento/api/push_traks_magento?fby_user_id=`;
    let method = `${API_TYPES.MAGENTO} \t JOB pushTrackMagento \t\t Url \t`;
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
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
    }
};