"use strict";
// getther info
// call jobs

// get the time and url from config file
// create generate data source

const { CronJobsClass } = require("../CronJobsClass");
const { FBY_APIS } = require("../../../startup/env");
const { getIds, getNewTime } = require("../config");
const { API_TYPES } = require("../../../misc/constants");
const constants = require("../../../server/constants/constants");
const dbCCLogs = require('../../../startup/dbcclogs');

const timerReset = 30;
const timerDiff = 1;
const defaultTimer = 20;


let baseUrl = process.env.BASE_URL;



exports.FBYApis = async () => {

    let data = [];
    let cc_operation = "FBY_APIS";
    let time = FBY_APIS;
    let cases = ["payment_method_code", "cancel_reason", "alert_codes", "alert_domains", "channel_codes", "currency_codes"];
    let method = `JOB FBYApis MASTER_DATA \t Url \t`;
    getIds().then((ids) => {
        ids.forEach(element => {

            cases.forEach(async caseOption => {

                let enpointurl = `${baseUrl}api/fby_apis?fby_user_id=${element.channelId}&case=${caseOption}`;

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

    });

};

exports.sendALertToFBY = async () => {
    let data = [];
    let time = '## * * * *';
    let channelCounter = 0;
    let URL = `${baseUrl}api/fby_alert/?fby_user_id=`;
    let method = ``;
    let cronname = constants.CC_OPERATIONS.FBY_ALERT_INSERT;
    await getIds("all").then(async (ids) => {
        for await (const element of ids) {

            channelCounter = channelCounter + timerDiff;

            let newTime = await getNewTime(channelCounter, 3, 33);
            let newTimerCron = time.replace('##', newTime);


            method = `${element.channelName} \t ${element.channelId} \t ${cronname} \t \t ${newTimerCron} \t \t \t`;


            let enpointurl = `${URL}${element.channelId}`;
            console.log(`${method}`, enpointurl);
            let croninputs = {
                fby_user_id: element.channelId,
                cc_operation: cronname,
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
};







