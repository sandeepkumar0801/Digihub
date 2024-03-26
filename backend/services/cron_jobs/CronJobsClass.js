
class CronJobsClass {

    constructor(time, url, data) {
        this.time = time;
        this.url = url;
        this.data = data;
        this.headers1 = null;
    }
    // run jobs
    runjob() {
        const cron = require("node-cron");
        const axios = require("axios");
        const { logInfo, logError } = require("../../misc/logger");
        const { headers } = require("./config");
        const moment = require("moment");
        const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
        this.headers1 = headers;
        try {
            cron.schedule(this.time, () => {
                try {
                    var updated_at = moment();
                    updated_at = updated_at.subtract(1, "days");
                    updated_at = updated_at.format(MOMENT_DATE_FORMAT);
                    //updated_at = urlencode(updated_at.format(MOMENT_DATE_FORMAT));

                    if (this.url.includes("&updated_after=")) {
                        let arr = this.url.split('&');
                        let newUrl = '';

                        for (let i = 0; i < arr.length - 1; i++) {
                            if (!arr[i].includes("updated")) {
                                newUrl += arr[i];
                            }
                        }
                        this.url = `${newUrl}&updated_after=${updated_at}`;
                        //console.log('newUrl: ', this.url);
                    }
                } catch (error) {
                    console.log("error in updating job time", error);
                }

                axios.get(
                    this.url,
                    {
                        headers: this.headers1,
                    }
                )
                    .then(response => {
                        "use strict";
                        console.log(` `);
                        console.log(`cron jobs ${moment().format(MOMENT_DATE_FORMAT)} ${this.url}`);
                        // console.log(`cron jobs ${this.url}`, response.data);
                        response = null;
                    })
                    .catch(err => {
                        console.log(` `);
                        console.log(`cron jobs ERROR ${this.url}`, err);
                        logError(`cron jobs ERROR ${this.url}`, err);
                        err = null;
                    });

            });
        } catch (error) {
            console.log("error in running job", error);
        }
    }

};

module.exports = { CronJobsClass: CronJobsClass };









