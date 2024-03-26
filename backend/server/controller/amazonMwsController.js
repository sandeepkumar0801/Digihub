// const fbyController = require("../controller/fbyController.js");
// const constants = require("../constants/constants.js");
// const common = require("../constants/common.js");
// const adapter = require("../../services/amazonMws_service");
// const mail = require("../constants/email.js");
// const request = require("request-promise");
// const dateTime = require("node-datetime");
// const moment = require("moment");
// // import { v4 as uuid } from 'uuid';
// const v4 = require('uuid').v4;
// const axios = require("axios");
// require("dotenv/config");
// const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

// let uuid = v4;

// exports.getWooCommerceProducts = async (req, res) => {
//     let cron_name = "get_WooCommerce_Products";
//     let cron_id = uuid();
//     let fby_user_id = req.query.userid || req.query.fby_user_id;
//     //when url hits, it insert the cron details and make status 1 as its running
//     let inputs = [fby_user_id, cron_name, cron_id, 1];
//     common.insertCron(inputs, cron_name, cron_id, function (result) {
//       if (result.error) {
//         mail.cronProcessErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
//       }
//     });
//     //process url request
//     if (!Object.keys(req.query).length || fby_user_id == "") {
//       res.send(constants.EMPTY);
//     } else {
//       //get user
//       common.userDetail(fby_user_id, cron_name, cron_id, function (result) {
//         if (result.error) {
//           // store user error log
//           let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_user_id];
//           common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
//             if (result.error) {
//               mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
//             }
//           });
//           //send response
//           res.send(result.error);
//         } else {
//           for (const user of result.success.data) {
//             let woocommerce_id = user.fby_user_id;
//             //get shopify account detail
//             common.shopifyUserDetail(woocommerce_id, cron_name, cron_id, function (result) {
//               if (result.error) {
//                 // store shopify account error log
//                 let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), woocommerce_id];
//                 common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
//                   if (result.error) {
//                     mail.cronLogErrMail(cron_name, cron_id, woocommerce_id, JSON.stringify(result.error));
//                   }
//                 });
//                 //send response
//                 res.send(result.error);
//               } else {
//                 let shopifyAccount = result.success.data;
//                 let dt = dateTime.create();
//                 let new_cron_id = cron_id;
//                 let exist_cron = 0;
//                 common.getBulkCronLog(woocommerce_id, dt.format('Y-m-d'), cron_name, new_cron_id, function (result) {
//                   if (result.success) {
//                     let log_data = result.success.data;
//                     new_cron_id = log_data.cron_id;
//                     exist_cron = 1;
//                   }
//                   //internal asynchronous function for adding products to table and getting response parameters
//                   adapter.orderRequest()
//                     .then((params) => {
//                       res.send(params);
//                     });
//                 });
//               }
//             });
//           }
//         }
//       });
//     }
//     //after finish update cron status as 0
//     res.on('finish', function () {
//       var dt = dateTime.create();
//       let inputs = [dt.format('Y-m-d H:M:S'), cron_id];
//       common.updateCron(inputs, cron_name, cron_id, function (result) {
//         if (result.error) {
//           mail.cronProcessErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
//         }
//       });
//     });
//   };