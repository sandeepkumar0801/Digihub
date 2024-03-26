// const fbyController = require("../server/controller/fbyController.js");
// const constants = require("../server/constants/constants.js");
// const common = require("../server/constants/common.js");
// const mail = require("../server/constants/email.js");
// const request = require("request-promise");
// const dateTime = require("node-datetime");
// const moment = require("moment");
// // import { v4 as uuid } from 'uuid';
// const v4 = require("uuid").v4;
// const axios = require("axios");
// require("dotenv/config");
// const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
// const logger = require("../misc/logger");
// const helpers = require("../misc/helpers");
// const { array } = require("joi");
// const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
// const CircularJSON = require('circular-json');
// const { response } = require("express");

// let uuid = v4;

// var accessKey = 'AKIAJ75VHLPJ3OBNNNIA';
// var accessSecret = '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';

// var amazonMws = require('../node_modules/amazon-mws')(accessKey, accessSecret);

// exports.orderRequest = async() => {
// let set_response = {};
// try
// {
//     amazonMws.setHost('mws.amazonservices.it');
//     await amazonMws.orders.search({
//         'Version': '2013-09-01',
//         'Action': 'ListOrders',
//         'SellerId': 'A2ENUTYX0UZGL8',
//         'MWSAuthToken': 'amzn1.sellerapps.app.69675dde-212c-4646-8359-78d66d4d9d69',
//         'MarketplaceId.Id.1': 'APJ6JRA9NG5V4',
//         'LastUpdatedAfter': new Date(13, 12, 2016)
//     }, function (error, response) {
//         if (error) {
//             //console.log('error ', error);
//             return error;
//         }
//         //console.log('response', response);
//         return response;
//     });
// }
// catch(err)
// {
//     //console.log(err);
//     return err;
// }
// return set_response;
// };