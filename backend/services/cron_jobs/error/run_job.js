"use strict";
// getther info
// call jobs

// get the time and url from config file
// create generate data source

const { CronJobsClass } = require("../CronJobsClass");
const { ERROR_MANAGE } = require("../../../startup/env");
const { API_TYPES } = require("../../../misc/constants");
let baseUrl = process.env.BASE_URL;



exports.errorManage = async () => {

    let data = [
        {
            case: "send_Orders_Fby"
        },
        {
            case: "send_Products_Fby"
        }
    ];
    let time = ERROR_MANAGE;
    let url = `${baseUrl}shopify/api/error_manage/?case=`;
    let method = `JOB errorManage \t Url \t`;

    data.forEach(element => {
        let enpointurl = `${url}${element.case}`;
        console.log(`${method}`, enpointurl);
        let cronJobsClass = new CronJobsClass(time, enpointurl, data);
        cronJobsClass.runjob();
    });

};

exports.errorManagePresta = async () => {

    let data = [
        {
            case: "get_presta_products"
        },
        {
            case: "send_Products_Fby"
        },
        {
            case: "get_Fby_Stock"
        },
        {
            case: "push_stock_presta"
        },
        {
            case: "get_presta_orders"
        },
        {
            case: "send_Orders_Fby"
        },
        {
            case: "send_Canceled_Orders_Fby"
        },
        {
            case: "get_track_number"
        },
        {
            case: "push_Track_Presta"
        },
    ];
    let time = ERROR_MANAGE;
    let url = `${baseUrl}prestashop/api/error_manage/?case=`;
    let method = `JOB errorManage(Prestashop) \t Url \t`;

    data.forEach(element => {
        let enpointurl = `${url}${element.case}`;
        console.log(`${method}`, enpointurl);
        let cronJobsClass = new CronJobsClass(time, enpointurl, data);
        cronJobsClass.runjob();
    });

};

exports.errorManageEbay = async () => {

    let data = [
        {
            case: "get_ebay_products"
        },
        {
            case: "send_Products_Fby"
        },
        {
            case: "get_Fby_Stock"
        },
        {
            case: "push_stock_ebay"
        },
        {
            case: "get_ebay_orders"
        },
        {
            case: "send_Orders_Fby"
        },
        {
            case: "send_Canceled_Orders_Fby"
        },
        {
            case: "get_track_number"
        },
        {
            case: "push_Track_ebay"
        },
    ];
    let time = ERROR_MANAGE;
    let url = `${baseUrl}ebay/api/error_manage/?case=`;
    let method = `JOB errorManage(ebay) \t Url \t`;

    data.forEach(element => {
        let enpointurl = `${url}${element.case}`;
        console.log(`${method}`, enpointurl);
        let cronJobsClass = new CronJobsClass(time, enpointurl, data);
        cronJobsClass.runjob();
    });

};
