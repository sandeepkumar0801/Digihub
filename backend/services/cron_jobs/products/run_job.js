// getther info
// call jobs

// get the time and  \t Url from config file
// create generate data source
"use strict";
const { CronJobsClass } = require("../CronJobsClass");
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

const MINUS_DAYS = 1;

const {
    GET_PRESTA_PRODUCTS, GET_STOREDEN_PRODUCTS, GET_SHOPIFY_PRODUCTS,
    GET_WOOCOMMERCE_PRODUCTS, GET_MIRAKL_PRODUCTS, GET_MIRAKL_CARRIERS, GET_SHOPIFY_LOCATION,
    GET_EBAY_PRODUCTS, SEND_PRODUCT_FBY,

    GET_PRODUCTS_FROM_FBY_TIMER,
    GET_PRODUCTS_PRICE_FROM_FBY_TIMER,
    PUSH_PRODUCTS_TO_SHOPIFY_TIMER,
    PUSH_PRODUCTS_IMAGES_TO_SHOPIFY_TIMER,
    PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER,
    UPDATE_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER,
    GET_MAGENTO_PRODUCTS

} = require("../../../startup/env");
const { getIds, getNewTime } = require("../config");
const { API_TYPES } = require("../../../misc/constants");
const moment = require("moment");
const urlencode = require('urlencode');
const constants = require("../../../server/constants/constants.js");
const dbCCLogs = require('../../../startup/dbcclogs');
// default
let baseUrl = process.env.BASE_URL;



exports.getShopifyProducts = async () => {
    let data = [];
    let cc_operation = constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL;
    let time = '## * * * *'; //GET_SHOPIFY_PRODUCTS;
    let url = `${baseUrl}shopify/api/get_shopify_products/?fby_user_id=`;
    let method = ``;
    let channelCounter = 0;
    getIds("shopify").then(async (ids) => {
        channelCounter = 0;
        for await (const element of ids) {

            channelCounter++;

            let newTime = await getNewTime(channelCounter, 11, 41);
            let newTimerCron = time.replace('##', newTime);

            method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t ${newTimerCron} \t \t \t`;
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

};

exports.getShopifyLocation = async () => {
    let data = [];
    let cc_operation = "GET_SHOPIFY_LOCATION";
    let time = '## * * * *'; // GET_SHOPIFY_LOCATION;
    let url = `${baseUrl}shopify/api/get_shopify_location/?fby_user_id=`;
    let channelCounter = 0;

    getIds("shopify").then(async (ids) => {
        let method = `${API_TYPES.SHOPIFY} \t JOB getShopifyLocation \t Url \t `;
        channelCounter = 0;
        for await (const element of ids) {

            channelCounter++;

            let newTime = await getNewTime(channelCounter, 20, 50);
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

        }

    });
};

exports.getStoreDenProducts = async () => {

    let data = [];
    let cc_operation = 'GET_STOREDEN_PRODUCTS';
    let time = GET_STOREDEN_PRODUCTS;

    let url = `${baseUrl}storeden/api/get_products_list?userid=`;
    getIds("storeden").then((ids) => {
        let method = `${API_TYPES.STOREDEN} \t JOB getStoredenProducts  \t Url  \t `;
        ids.forEach(async element => {
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
        });

    });

};

exports.getWooCommerceProducts = async () => {

    let data = [];
    let cc_operation = 'GET_WOOCOMMERCE_PRODUCTS';
    let time = GET_WOOCOMMERCE_PRODUCTS;

    let url = `${baseUrl}woocommerce/api/get_products_list?userid=`;
    getIds("woocommerce").then((ids) => {
        let method = `${API_TYPES.WOOCOMMERCE} \t JOB getWoocommerceProducts  \t Url  \t `;
        ids.forEach(element => {
            if (element.channelId != 32) {
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

//Send product to fby is not be done in 1st release
exports.sendProductFBY = async () => {
    let data = [];
    let cc_operation = 'SEND_PRODUCT_FBY';
    let time = SEND_PRODUCT_FBY;
    let url = `${baseUrl}shopify/api/send_products_fby/?fby_user_id=`;

    if (process.env.IS_SEND_PRODUCT_TO_FBY == 1) {
        getIds("shopify").then((ids) => {
            let method = `${API_TYPES.SHOPIFY} \t JOB sendProductFBY \t\tUrl \t `;
            ids.forEach(element => {
                setTimeout(async () => {
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
                }, 1000);
            });

        });

        getIds("storeden").then((ids) => {
            let method = `${API_TYPES.STOREDEN} \t JOB sendProductFBY \t Url  \t `;
            ids.forEach(async element => {
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
            });

        });

        getIds("woocommerce").then((ids) => {
            let method = `${API_TYPES.WOOCOMMERCE} \t JOB sendProductFBY \t Url  \t `;
            ids.forEach(element => {
                if (element.channelId != 32) {
                    setTimeout(async () => {
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
                    }, 1000);
                }
            });

        });

        getIds("mirakl").then((ids) => {
            let method = `${API_TYPES.MIRAKL} \t\t JOB sendProductFBY\t Url  \t `;
            ids.forEach(element => {
                if (element.channelId != 32) {
                    setTimeout(async () => {
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
                    }, 1000);
                }
            });

        });
    }

};


//prestashop cron job
exports.getPrestaProducts = async () => {
    let data = [];
    let cc_operation = 'GET_PRESTA_PRODUCTS';
    let time = GET_PRESTA_PRODUCTS;
    let url = `${baseUrl}prestashop/api/get_presta_products?fby_user_id=`;
    let method = `${API_TYPES.PRESTASHOP} \t JOB getPrestaProducts  \t Url \t `;
    getIds("presta").then((ids) => {
        ids.forEach(async element => {
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
        });

    });

};

exports.sendPrestaProductFBY = async () => {
    let data = [];
    let cc_operation = 'SEND_PRODUCT_FBY';
    let time = SEND_PRODUCT_FBY;
    let url = `${baseUrl}prestashop/api/send_products_fby?fby_user_id=`;
    let method = `${API_TYPES.PRESTASHOP} \t JOB sendProductFBY  \t\tUrl \t `;
    if (process.env.IS_SEND_PRODUCT_TO_FBY == 1) {
        getIds("presta").then((ids) => {
            ids.forEach(async element => {
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
            });

        });
    }

};

//ebay cron job
exports.getEbayProducts = async () => {
    let data = [];
    let cc_operation = 'GET_EBAY_PRODUCTS';
    let time = GET_EBAY_PRODUCTS;
    let url = `${baseUrl}ebay/api/get_ebay_products?fby_user_id=`;
    let method = `${API_TYPES.EBAY} \t JOB getEbayProducts  \t Url \t `;
    getIds("ebay").then((ids) => {
        ids.forEach(async element => {
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
        });

    });

};

//Mirakl cron job
exports.getMiraklProducts = async () => {
    let data = [];
    let time = GET_MIRAKL_PRODUCTS;
    let url = `${baseUrl}mirakl/api/get_Products_Mirakl?fby_user_id=`;
    let method = `${API_TYPES.MIRAKL} \t\t JOB getMiraklProducts  \t Url \t `;
    /*
    getIds("mirakl").then((ids) => {
        ids.forEach(element => {
            let enpointurl = `${url}${element.channelId}`;
            console.log(`${method}`, enpointurl);
            let cronJobsClass = new CronJobsClass(time, enpointurl, data);
            cronJobsClass.runjob();
        });
 
    });
*/
};

//Mirakl cron job
exports.getMiraklCarriers = async () => {
    let data = [];
    let cc_operation = 'GET_MIRAKL_CARRIERS';
    let time = GET_MIRAKL_CARRIERS;
    let url = `${baseUrl}mirakl/api/get_carriers_Mirakl?fby_user_id=`;
    let method = `${API_TYPES.MIRAKL} \t\t JOB getMiraklCarriers  \t Url \t `;
    getIds("mirakl").then((ids) => {
        ids.forEach(async element => {
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
        });

    });

};

exports.sendEbayProductFBY = async () => {
    let data = [];
    let cc_operation = 'SEND_PRODUCT_FBY';
    let time = SEND_PRODUCT_FBY;
    let url = `${baseUrl}ebay/api/send_products_fby?fby_user_id=`;
    let method = `${API_TYPES.EBAY} \t JOB sendProductFBY  \t\tUrl \t `;
    getIds("ebay").then((ids) => {
        ids.forEach(async element => {
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
        });

    });

};

/*
1
GET_PRODUCTS_FROM_FBY_TIMER
http://localhost:3000/shopify/api/get_products_fby?fby_user_id=8
 
2
GET_PRODUCTS_PRICE_FROM_FBY_TIMER
http://localhost:3000/shopify/api/get_prices_fby?fby_user_id=8
 
3
PUSH_PRODUCTS_TO_SHOPIFY_TIMER
http://localhost:3000/shopify/api/push_product_shopify?fby_user_id=8
 
4
PUSH_PRODUCTS_IMAGES_TO_SHOPIFY_TIMER
http://localhost:3000/shopify/api/push_product_images?fby_user_id=8
 
5
PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER
http://localhost:3000/shopify/api/push_variants_shopify?fby_user_id=8
*/

/*
1
GET_PRODUCTS_FROM_FBY_TIMER
http://localhost:3000/shopify/api/get_products_fby?fby_user_id=8
*/
exports.getProductsFromFBYforShopify = async () => {
    let data = [];
    let cc_operation = 'GET_PRODUCTS_FROM_FBY_TIMER';
    let time = GET_PRODUCTS_FROM_FBY_TIMER;
    var updated_at = moment();
    updated_at = updated_at.subtract(6, "hours");
    updated_at = urlencode(updated_at.format(MOMENT_DATE_FORMAT));

    let url = `${baseUrl}shopify/api/get_products_fby/?fby_user_id=`;

    getIds("shopify").then((ids) => {
        let method = `${API_TYPES.SHOPIFY} \t JOB getProductsFromFBYforShopify  \t Url  \t `;
        ids.forEach(element => {
            if (element.productPublish == 1) {
                setTimeout(async () => {
                    method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${time} \t \t`;
                    let enpointurl = `${url}${element.channelId}&updated_after=${updated_at}`;
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
            else {

                //console.log(`ProductPublish not enabeld for ${element.channelId}`);
            }


        });

    });
};

/*
2
GET_PRODUCTS_PRICE_FROM_FBY_TIMER
http://localhost:3000/shopify/api/get_prices_fby?fby_user_id=8
*/
exports.getProductsPricesFromFBYforShopify = async () => {
    let data = [];
    let cc_operation = 'GET_PRODUCTS_PRICE_FROM_FBY_TIMER';
    let time = GET_PRODUCTS_PRICE_FROM_FBY_TIMER;
    var updated_at = moment();
    updated_at = updated_at.subtract(MINUS_DAYS, "days");
    updated_at = urlencode(updated_at.format(MOMENT_DATE_FORMAT));

    let url = `${baseUrl}shopify/api/get_prices_fby/?fby_user_id=`;
    getIds("shopify").then((ids) => {
        let method = `${API_TYPES.SHOPIFY} \t JOB getProductsPricesFromFBYforShopify  \t Url  \t `;
        ids.forEach(element => {
            if (element.priceUpdate == 1) {
                setTimeout(async () => {
                    method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${time} \t \t`;
                    let enpointurl = `${url}${element.channelId}&updated_after=${updated_at}`;
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
            else {

                // console.log(`PriceUpdate not enabeld for ${element.channelId}`);
            }
        });

    });
};

/*
3
PUSH_PRODUCTS_TO_SHOPIFY_TIMER
http://localhost:3000/shopify/api/push_product_shopify?fby_user_id=8
*/
exports.pushProductsFromFBYtoShopify = async () => {
    let data = [];
    let cc_operation = 'PUSH_PRODUCTS_TO_SHOPIFY_TIMER';
    let time = PUSH_PRODUCTS_TO_SHOPIFY_TIMER;
    let url = `${baseUrl}shopify/api/push_product_shopify/?fby_user_id=`;
    getIds("shopify").then((ids) => {
        let method = `${API_TYPES.SHOPIFY} \t JOB pushProductsFromFBYtoShopify  \t Url  \t `;
        ids.forEach(element => {
            if (element.productPublish == 1) {
                setTimeout(async () => {
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
                }, 1000);
            }
            else {

                //console.log(`ProductPublish not enabeld for ${element.channelId}`);
            }

        });

    });
};

/*
4
PUSH_PRODUCTS_IMAGES_TO_SHOPIFY_TIMER
http://localhost:3000/shopify/api/push_product_images?fby_user_id=8
*/

exports.pushProductsImagesFromFBYtoShopify = async () => {
    let data = [];
    let cc_operation = 'PUSH_PRODUCTS_IMAGES_TO_SHOPIFY_TIMER';
    let time = PUSH_PRODUCTS_IMAGES_TO_SHOPIFY_TIMER;
    let url = `${baseUrl}shopify/api/push_product_images/?fby_user_id=`;
    getIds("shopify").then((ids) => {
        let method = `${API_TYPES.SHOPIFY} \t JOB pushProductsImagesFromFBYtoShopify  \t Url  \t `;
        ids.forEach(element => {
            if (element.productPublish == 1) {
                setTimeout(async () => {
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
                }, 1000);
            }
            else {

                //console.log(`ProductPublish not enabeld for ${element.channelId}`);
            }

        });

    });
};


/*
5
PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER
http://localhost:3000/shopify/api/push_variants_shopify?fby_user_id=8
*/

exports.pushProductsVariantsFromFBYtoShopify = async () => {
    let data = [];
    let cc_operation = 'PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER';
    let time = PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER;
    let url = `${baseUrl}shopify/api/push_variants_shopify/?fby_user_id=`;
    getIds("shopify").then((ids) => {
        let method = `${API_TYPES.SHOPIFY} \t JOB pushProductsVariantsFromFBYtoShopify  \t Url  \t `;
        ids.forEach(element => {
            if (element.productPublish == 1) {
                setTimeout(async () => {
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
                }, 1000);
            }
            else {

                //console.log(`ProductPublish not enabeld for ${element.channelId}`);
            }

        });

    });
};


/*
6
PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER
http://localhost:3000/shopify/api/update_products_shopify/?fby_user_id=41
*/

exports.update_products_shopify = async () => {
    let data = [];
    let cc_operation = 'UPDATE_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER';
    let time = UPDATE_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER;
    let url = `${baseUrl}shopify/api/update_products_shopify/?fby_user_id=`;
    getIds("shopify").then((ids) => {
        let method = `${API_TYPES.SHOPIFY} \t JOB update_products_shopify  \t Url  \t `;
        ids.forEach(element => {
            if (element.productPublish == 1) {
                setTimeout(async () => {
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
                }, 1000);
            }
            else {

                //console.log(`ProductPublish not enabeld for ${element.channelId}`);
            }

        });

    });
};

/*
1
GET_PRODUCTS_PRICE_FROM_FBY_TIMER
http://localhost:3000/fby/api/get_prices_fby?fby_user_id=8
*/
exports.getProductsPricesFromFBY = async () => {
    let data = [];
    let time = GET_PRODUCTS_PRICE_FROM_FBY_TIMER;
    var updated_at = moment();
    updated_at = updated_at.subtract(MINUS_DAYS, "days");
    updated_at = urlencode(updated_at.format(MOMENT_DATE_FORMAT));
    let cc_operation = constants.CC_OPERATIONS.GET_PRICES_FROM_FBY;
    let url = `${baseUrl}fby/api/get_prices_fby/?fby_user_id=`;
    getIds("all").then(async (ids) => {
        let method = `${API_TYPES.AMAZON} \t JOB getProductsPricesFromFBYforAmazon  \t Url  \t `;

        for await (const element of ids) {
            method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${time} \t \t`;
            if (element.platformName.toLowerCase().includes('mirakl')) {
                continue;
            }
            if (element.priceUpdate == 1) {
                setTimeout(async () => {
                    method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${time} \t \t`;
                    let enpointurl = `${url}${element.channelId}&updated_after=${updated_at}`;
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
            else {

                //console.log(`PriceUpdate not enabeld for ${element.channelId}`);
            }
        };

    });
};

/*
5
PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER
http://localhost:3000/shopify/api/push_variants_shopify?fby_user_id=8
*/

exports.pushPricesFromFBYtoAmazon = async () => {
    let data = [];
    let cc_operation = 'PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER';
    let time = PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER;
    let url = `${baseUrl}amazon/api/push_price/?fby_user_id=`;
    getIds("amazon").then((ids) => {
        let method = `${API_TYPES.AMAZON} \t JOB pushPricesFromFBYtoShopify  \t Url  \t `;
        ids.forEach(element => {
            if (element.priceUpdate == 1) {
                setTimeout(async () => {
                    method = `${element.channelName} \t ${element.channelId} \t ${cc_operation} \t \t ${time} \t \t`;
                    let enpointurl = `${url}${element.channelId}`;
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
                    console.log(`${method}`, enpointurl);
                    let cronJobsClass = new CronJobsClass(time, enpointurl, data);
                    cronJobsClass.runjob();
                }, 1000);
            }
            else {

                //console.log(`ProductPublish not enabeld for ${element.channelId}`);
            }

        });

    });
};

//magento cron job
exports.getMagentoProducts = async () => {
    let data = [];
    let cc_operation = "GET_MAGENTO_PRODUCTS";
    let time = GET_MAGENTO_PRODUCTS;
    let  url = `${baseUrl}magento/api/get_magento_products/?fby_user_id=`;
    let method = `${API_TYPES.MAGENTO} \t JOB getMagentoProducts  \t Url \t `;
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

};