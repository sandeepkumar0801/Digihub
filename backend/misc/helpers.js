const formidable = require('formidable');
const db = require('../startup/db');
const crypto = require('crypto');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const logger = require('./logger');
const { v4: uuidv4 } = require('uuid');
const uuid = uuidv4;
const CircularJSON = require('circular-json');
const moment = require("moment");
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

function isEmpty(data) {
    try {
        if (typeof (data) == "undefined"
            || typeof (data) == ""
            || typeof (data) == "{}"
            || typeof (data) == "[]"
            || typeof (data) == "0"
            || typeof (data) == 0
            || typeof (data) == null
        ) {
            return true;
        }
        else {
            return false;
        }
    }

    catch (error) {
        return true;
    }

}
exports.isEmpty = isEmpty;

exports.sendError = async (res, statusCode, errorType, errorMessage, reqestBody = {}) => {

    const response = {
        error: {
            code: statusCode,
            error_type: errorType,
            error_message: errorMessage,
            data: reqestBody
        }
    };

    try {
        await logger.logError(`${statusCode}`, { url: res.req.baseUrl, method: res.req.method, request: reqestBody, response: response.error })
            .then(
                res.status(statusCode).send(response)
            );
    } catch (error) {
        //console.log('helper sendError catch: ', error);
        res.status(statusCode).send(response);
    }
};

exports.sendSuccess = async (res, statusCode, message, data, reqestBody = {}) => {

    let operationId = !isEmpty(reqestBody) && !isEmpty(reqestBody.operationId) ? reqestBody.operationId : '';
    const response = {
        response: {
            operationId: operationId,
            code: statusCode,
            message: message,
            data: data,
        }
    };

    try {
        let jsonLog = CircularJSON.stringify({ url: res.req.baseUrl, method: res.req.method, request: reqestBody, ...response });
        await logger.logInfo(`${statusCode}`, jsonLog)
            .then(
                res.status(statusCode).send(response)
            );
    } catch (error) {
        //console.log('helper sendSuccess catch: ', error);
        res.status(statusCode).send(response);
    }

};

exports.getDecryptedData = (data) => {
    let result = data;
    try {
        // var data = "5d19a9bb43a3f99b96ceead80d4a6ff93oVOCmO/1nirivqzhMgqlQE125G+ZrX3zn3xjLSdLhI=";
        var key = process.env.DECRYPTION_KEY;

        var iv = new Buffer.from(data.substring(0, 32), 'hex');
        var dec = crypto.createDecipheriv('aes-256-cbc', key, iv);

        var decrypted = Buffer.concat([dec.update(new Buffer.from(data.substring(32), 'base64')), dec.final()]);
        result = decrypted.toString();

    }
    catch (error) {
        //console.log('Decryption not requied for given data ', data);
        //console.log('error while getDecryptedData: error', error);
        result = data;
    }
    return result;
};


exports.getUUID = () => {
    const operationId = uuid();
    return operationId;
};


exports.hourDiff = (dt2, dt1) => {
    var updated_at = moment();
    updated_at = updated_at.subtract(1, "hours");
    updated_at = updated_at.format(MOMENT_DATE_FORMAT);
    let result = updated_at;
    try {
        let now = new Date();
        var diff = (new Date(dt2).getTime() - new Date(dt1).getTime()) / 1000;

        diff /= (60 * 60);
        let diffHours = Math.round(diff);
        if (diffHours > 1) {
            diffHours = 1;
        }
        let newDate = now.setHours(now.getHours() - diffHours);
        //console.log('dt2: ', dt2);
        //console.log('dt1: ', dt1);
        //console.log('diffHours: ', diffHours);

        updated_at = moment(newDate);
        updated_at = updated_at.format(MOMENT_DATE_FORMAT);
        result = updated_at;
        //console.log('result: ', result);

    }
    catch (error) {
        //console.log('hourDiff error: ', error);

        result = updated_at;
    }
    return result;
};

exports.GetConvertedDate = (dt) => {
    try {
        var Operator = dt.substr(dt.length - 6, 1);
        var timeZoneHourDiff = parseInt(dt.substr(dt.length - 5, 2));
        var timeZoneHourDiffMinutes = parseInt(dt.substr(dt.length - 2, 2));
        var now = moment.utc(dt);

        if (Operator == "+" && (timeZoneHourDiff > 0 || timeZoneHourDiffMinutes > 0)) {
            //console.log("+,- timezone", Operator);
            //console.log("timeZoneHourDiffHours", timeZoneHourDiff);
            //console.log("timeZoneHourDiffMinutes", timeZoneHourDiffMinutes);

            //console.log("before ", now.format(MOMENT_DATE_FORMAT));
            now = now.add(timeZoneHourDiff, "hours");
            now = now.add(timeZoneHourDiffMinutes, "minutes");
            //console.log("After ", now.format(MOMENT_DATE_FORMAT));
        }

        if (Operator == "-" && (timeZoneHourDiff > 0 || timeZoneHourDiffMinutes > 0)) {

            //console.log(Operator);
            //console.log(timeZoneHourDiff);
            now = now.subtract(timeZoneHourDiff, "hours");
            //console.log("before ", now.format(MOMENT_DATE_FORMAT));
            now = now.subtract(timeZoneHourDiffMinutes, "minutes");
            //console.log("After ", now.format(MOMENT_DATE_FORMAT));
        }
        dt = now.format(MOMENT_DATE_FORMAT);
    }
    catch (err) {
        //console.log(err);
    }
    return dt;
};

function getOrderStatus(data) {
    switch (data) {
        case "2":
            return "paid";
        case "3":
            return "cod";
        case "6":
            return "canceled";
        case "7":
            return "refunded";
        case "18":
            return "partially_refunded";
        default:
            return "shiped";
    }
}
exports.getOrderStatus = getOrderStatus;
exports.sleep = async (sleecpTimeInSeconds = 0.5) => {

    /*
    var sleep = require('sleep');
    sleep.sleep(sleecpTimeInSeconds);
    */
    var interval = sleecpTimeInSeconds * 1000; // 10 seconds;

    return new Promise(resolve => setTimeout(resolve, interval));

};

exports.getWoocommerceDomain = async (domain) => {

    try {
        if (!domain.includes("https://")) {
            domain = `https://${domain}`;
        }

        if (domain.charAt(domain.length - 1) != "/") {
            domain = `${domain}/`;
        }
    }
    catch (error) {
        //ignore 
    }

    return domain;
};

function inVariationExist(data) {
    let search_data = ["EAN", "UPC"];
    return search_data.includes(data);
}

function inItemspecExist(data) {
    let search_data = ["MPN", "Manufacturer Part Number"];
    return search_data.includes(data);
}

exports.inVariationExist = inVariationExist;
exports.inItemspecExist = inItemspecExist;

function isExist(data) {
    switch (data) {
        case "DoesNotApply":
        case "Does Not Apply":
        case "Does not apply":
        case "does not apply":
        case "doesnotapply":
            return true;
        default:
            return false;
    }
}
exports.isExist = isExist;

let EBAY_HEADERS = (compatibilityLevel, devid, appid, certid, call_name, siteId) => {
    let headers = {
        'Content-Type': 'text/plain',
        'X-EBAY-API-COMPATIBILITY-LEVEL': compatibilityLevel,
        //set the keys
        'X-EBAY-API-DEV-NAME': devid,
        'X-EBAY-API-APP-NAME': appid,
        'X-EBAY-API-CERT-NAME': certid,
        //the name of the call we are requesting
        'X-EBAY-API-CALL-NAME': call_name,
        //SiteID must also be set in the Request's XML
        //SiteID = 0  (US) - UK = 3, Canada = 2, Australia = 15, ....
        //SiteID Indicates the eBay site to associate the call with
        'X-EBAY-API-SITEID': siteId
    }
    return headers;
}
exports.EBAY_HEADERS = EBAY_HEADERS;


exports.searchStringInArray = async (str, strArray) => {

    for (var j = 0; j < strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}

exports.getTitle = (data) => {
    switch (data) {
        case "dhl":
            return "DHL";
        case "fedex":
            return "Federal Express";
        case "ups":
            return "United Parcel Service";
        case "usps":
            return "United States Postal Service";
        default:
            return "United Parcel Service";
    }
}