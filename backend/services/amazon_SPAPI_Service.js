const CC_OPERATIONS = require('../server/constants/constants');
const fs = require('fs');
const SellingPartnerAPI = require('amazon-sp-api');
const fbyController = require("../server/controller/fbyController.js");
const constants = require("../server/constants/constants.js");
const common = require("../server/constants/common.js");
const mail = require("../server/constants/email.js");
const request = require("request-promise");
const dateTime = require("node-datetime");
const moment = require("moment");
// import { v4 as uuid } from 'uuid';
const v4 = require("uuid").v4;
const axios = require("axios");
require("dotenv/config");
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const logger = require("../misc/logger");
const helpers = require("../misc/helpers");
const { array } = require("joi");
const CircularJSON = require('circular-json');
const qs = require('qs');
const fetch = require('node-fetch');
const { orderRequest } = require('./amazonMws_service.js');
const fbyService = require('./fby_service');
const NodeCache = require("node-cache");
const ccCache = new NodeCache({ stdTTL: 3000, checkperiod: 300 });
const Entities = require("../entities/Entities");
const dbCCLogs = require('../startup/dbcclogs');
const PATH = require('path');
axios.defaults.timeout = constants.Amazon_API_TIMEOUT;

exports.getOrders = async (result, exist_cron, fby_id, cron_name, cron_id) => {
  let fby_user_id = fby_id;
  let logMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;
  let set_response = {};
  var updated_at = moment();
  updated_at = updated_at.subtract(10, "days");
  updated_at = updated_at.format(MOMENT_DATE_FORMAT);
  var now = moment();
  now = now.format(MOMENT_DATE_FORMAT);
  let isCanSync = false;
  let batchInfoListDB = [];
  let order_no_log = '';
  let sku_log = '';
  try {
    /* Shopify account loop start */
    for (const client of result) {
      //client.token = helpers.getDecryptedData(client.token);
      //console.log('getOrders client.secret: ', client.secret);

      let orderSyncStartDate = client.orderSyncStartDate;
      if (orderSyncStartDate == null || orderSyncStartDate == "") {
        isCanSync = false;
        set_response[client.domain] = {
          cron: cron_name,
          updated_at: updated_at,
          message: "Order import date is not set.",
        };
        logger.logInfo(
          `Amazon getOrders fby_user_id: ${fby_id}, since=${orderSyncStartDate}`,
          set_response
        );
        return set_response;
      } else {
        if (now > orderSyncStartDate) {
          isCanSync = true;
          updated_at = moment('2022-09-02 00:00:00');
          updated_at = updated_at.format(MOMENT_DATE_FORMAT);
        } else {
          isCanSync = false;
          set_response[client.domain] = {
            cron: cron_name,
            since: updated_at,
            message: "Order import date is not set.",
          };
          logger.logInfo(
            `Amazon getOrders orderSyncStartDate is less, fby_id: ${fby_id}, url: ${constants.Amazon_Get_Orders}`,
            set_response
          );
          return set_response;
        }
      }

      var dateobj = new Date(updated_at);
      var DateISOFormat = dateobj.toISOString();
      let urlLogMsg = `Amazon getOrders fby_user_id: ${fby_id}, orderSyncStartDate: ${updated_at}`;

      var SELLING_PARTNER_APP_CLIENT_ID = await helpers.getDecryptedData(client.username); //lwa credentials clinetid
      var SELLING_PARTNER_APP_CLIENT_SECRET = await helpers.getDecryptedData(client.api_password); // lwa credentials clinetid
      var AWS_SELLING_PARTNER_ACCESS_KEY_ID = await helpers.getDecryptedData(client.api_key);
      var AWS_SELLING_PARTNER_SECRET_ACCESS_KEY = await helpers.getDecryptedData(client.secret);
      var REGION = await helpers.getDecryptedData(client.amazon_region);
      var Refresh_Token = await helpers.getDecryptedData(client.token);
      var AWS_SELLING_PARTNER_ROLE = client.amazon_Role;


      let Access_Token = await requestAccessToken(SELLING_PARTNER_APP_CLIENT_ID, Refresh_Token, SELLING_PARTNER_APP_CLIENT_SECRET);


      var page_loop = true;
      var page_no = 1;
      var next_Token = '';
      while (page_loop) {
        let sellingPartner = new SellingPartnerAPI({
          region: REGION,
          refresh_token: Refresh_Token,
          credentials: {
            SELLING_PARTNER_APP_CLIENT_ID: SELLING_PARTNER_APP_CLIENT_ID,
            SELLING_PARTNER_APP_CLIENT_SECRET: SELLING_PARTNER_APP_CLIENT_SECRET,
            AWS_ACCESS_KEY_ID: AWS_SELLING_PARTNER_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY: AWS_SELLING_PARTNER_SECRET_ACCESS_KEY,
            AWS_SELLING_PARTNER_ROLE: AWS_SELLING_PARTNER_ROLE
          },
        });
        await sellingPartner.callAPI({
          operation: 'orders.getOrders',
          query: {
            MarketplaceIds: client.amazon_MarketPlaceID,
            CreatedAfter: DateISOFormat,
            NextToken: next_Token
          },
          options: {
            version: 'v0'
          }
          //endpoint:'sellers'
        })
          .then(async (response) => {
            let order_data = response.Orders;
            if (response.Orders.length == 0) {
              page_loop = false;
              return set_response;
            }

            if (response.NextToken == undefined || response.NextToken == '') {
              page_loop = false;
            }
            else {
              next_Token = response.NextToken;
            }

            logger.logInfo(urlLogMsg, order_data);
            //logger.logInfo("getOrders response", order_data);
            try {
              let msg = {
                success: {
                  message: constants.GET_ORDER_SUCCESS,
                  data: order_data,
                },
              };
              set_response[client.domain] = msg;
              if (order_data.length > 0) {
                /* order loop start*/
                for await (const jsonData of order_data) {
                  try {
                    order_no_log = jsonData.AmazonOrderId || '';
                    let infoItem = new Entities.CCLogs(
                      fby_user_id,
                      order_no_log,
                      '',
                      logMessage,
                      jsonData,
                      constants.LOG_LEVEL.ERROR,
                      constants.FBY_ALERT_CODES.ORDER_SYNC,
                      cron_name,
                      cron_id
                    );
                    batchInfoListDB.push(infoItem);
                  }
                  catch (error) {
                    //console.log();
                    //console.log(error);

                  }
                  let managedByChannel = false;
                  try {

                    if (jsonData.FulfillmentChannel != undefined
                      && jsonData.FulfillmentChannel != null
                      && jsonData.FulfillmentChannel == "AFN"

                    ) {
                      managedByChannel == true;
                    }

                    if (jsonData) {

                      let orderDetails = ''
                      await getorderdetails(client, jsonData.AmazonOrderId, Access_Token, exist_cron, fby_id, cron_name, cron_id,
                        function (orderInfo) {
                          if (!orderInfo.errors) {
                            orderDetails = orderInfo;
                          }
                        }
                      );
                      //console.log(`Amazon getOrders fby_user_id: ${fby_id} order_id `, jsonData.AmazonOrderId);
                      //if (jsonData.id == 10117) {
                      //logger.logInfo("getOrders")//console.log('jsonData.id: ', jsonData.id, jsonData.status, jsonData.payment_method.toLowerCase());
                      // check if order is paid and unfullfiled
                      let isCOD = jsonData.payment_method == "cod";

                      if (
                        (orderDetails != null ||
                          jsonData.OrderStatus.toLowerCase() == "cancelled" ||
                          isCOD) &&
                        jsonData.OrderStatus.toLowerCase() != "failed"
                      ) {

                        let date_created = dateTime
                          .create(jsonData.PurchaseDate)
                          .format("Y-m-d H:M:S");
                        let date_modified = dateTime
                          .create(jsonData.LastUpdateDate)
                          .format("Y-m-d H:M:S");
                        let date_paid =
                          jsonData.PurchaseDate == null
                            ? null
                            : dateTime
                              .create(jsonData.PurchaseDate)
                              .format("Y-m-d H:M:S");

                        let channel = client.channelName;
                        let channel_code = client.channel_code;
                        let owner_code = client.owner_code;
                        let account_id = client.id;
                        let currency_code = jsonData.OrderTotal.CurrencyCode;
                        fby_user_id = fby_id;
                        let order_no = jsonData.AmazonOrderId;
                        let seller_order_id = jsonData.SellerOrderId || '';
                        let channel_currency_code = client.currency;
                        let total_order = jsonData.OrderTotal.Amount;
                        let total_items = orderDetails.OrderItems.length;
                        let total_tax = 0;
                        let total_discount = 0;
                        let total_items_price = jsonData.OrderTotal.Amount;
                        let payment_method = jsonData.PaymentMethod;
                        let sales_record_no = jsonData.SellerOrderId || '';
                        let purchase_date = date_created;
                        let payment_time = date_paid;
                        let payment_status = "";
                        let order_status = jsonData.OrderStatus;
                        let location_id = jsonData.ShippingAddress.PostalCode || 0;
                        let payment_id = jsonData.SellerOrderId || '';
                        let item_total_ship_price = 0;

                        //buyer detail
                        let buyer_email = jsonData.BuyerInfo.BuyerEmail;
                        let buyer_id = '';
                        let buyer_name = '';
                        //shiping address
                        let recipient_name = '';
                        let shiper_company = jsonData.FulfillmentChannel;
                        let shiper_strt1 = jsonData.ShippingAddress.City;
                        let shiper_strt2 = jsonData.ShippingAddress.City;
                        let shiper_city = jsonData.ShippingAddress.city;
                        let shiper_state = jsonData.ShippingAddress.StateOrRegion != undefined ? jsonData.ShippingAddress.StateOrRegion : '';
                        let shiper_state_code = '';
                        let shiper_zip = jsonData.ShippingAddress.PostalCode;
                        let shiper_country = jsonData.ShippingAddress.CountryCode;
                        let shiper_country_iso2 = jsonData.ShippingAddress.CountryCode;
                        let shiper_phone = '';

                        let order_product_data = orderDetails.OrderItems;


                        if (
                          date_paid != null &&
                          jsonData.OrderStatus.toLowerCase() == "shipped"
                        ) {
                          order_status = "completed";
                          payment_status = "paid";
                        }
                        if (
                          date_paid != null &&
                          jsonData.OrderStatus.toLowerCase() == "processing" &&
                          !isCOD
                        ) {
                          order_status = "paid";
                          payment_status = "paid";
                        } else if (
                          date_paid != null &&
                          jsonData.OrderStatus.toLowerCase() == "processing" &&
                          isCOD
                        ) {
                          order_status = "processing";
                          payment_status = "pending";
                        } else if (jsonData.OrderStatus.toLowerCase() == "refunded") {
                          order_status = "refunded";
                          payment_status = "refunded";
                        } else if (
                          date_paid == null &&
                          jsonData.OrderStatus.toLowerCase() == "processing" &&
                          isCOD
                        ) {
                          order_status = "processing";
                          payment_status = "pending";
                        } else if (
                          date_paid == null &&
                          jsonData.OrderStatus.toLowerCase() == "processing"
                        ) {
                          order_status = "processing";
                          payment_status = jsonData.PaymentMethod.toUpperCase();
                        } else {
                          payment_status = jsonData.PaymentMethod.toUpperCase();
                          order_status = jsonData.OrderStatus.toLowerCase();
                        }

                        for (const jsonItemData of order_product_data) {

                          let item_tax = parseFloat(jsonItemData.ItemTax.Amount);
                          total_tax = total_tax + item_tax;
                          let exchange_rate = 0;

                          let sku = jsonItemData.SellerSKU;
                          let order_line_item_id = jsonItemData.ASIN;
                          let order_item_id = jsonItemData.OrderItemId;
                          let barcode = "";

                          let transaction_id = '';
                          let product_name = jsonItemData.Title;
                          let quantity_purchased = jsonItemData.QuantityOrdered;

                          let line_item_price = parseFloat(
                            jsonItemData.ItemPrice.Amount
                          );
                          let line_item_total_tax = parseFloat(
                            jsonItemData.ItemTax.Amount
                          ); //item_tax * quantity_purchased;
                          let item_total_price_extax =
                            line_item_price;// * quantity_purchased;
                          let item_price = line_item_price;// * quantity_purchased;


                          let promotion_discount =
                            parseFloat(jsonItemData.PromotionDiscount.Amount);

                          let item_total_price_intax =
                            parseFloat(item_total_price_extax) +
                            parseFloat(line_item_total_tax) -
                            parseFloat(promotion_discount);

                          let dataArray = [
                            channel,
                            channel_code,
                            owner_code,
                            fby_user_id,
                            account_id,
                            order_no,
                            location_id,
                            seller_order_id,
                            purchase_date,
                            payment_time,
                            order_line_item_id,
                            sku,
                            barcode,
                            order_item_id,
                            transaction_id,
                            product_name,
                            quantity_purchased,
                            currency_code,
                            exchange_rate,
                            parseFloat(item_price),
                            parseFloat(line_item_price),
                            parseFloat(item_tax),
                            parseFloat(line_item_total_tax),
                            parseFloat(promotion_discount),
                            parseFloat(item_total_price_intax),
                            parseFloat(item_total_ship_price),
                            cron_name,
                            cron_id,
                            payment_status,
                            order_status,
                            managedByChannel
                          ];

                          await common.addOrderDetails(
                            dataArray,
                            cron_name,
                            cron_id,
                            function (result) {
                              // set_response[client.domain] = result;
                              if (result.error) {
                                logger.logInfo(
                                  urlLogMsg,
                                  CircularJSON.stringify(result.error)
                                );
                                // store log
                                let inputs = [
                                  cron_name,
                                  cron_id,
                                  constants.CATCH_TYPE,
                                  CircularJSON.stringify(result.error),
                                  fby_id,
                                ];
                                common.cronErrorLog(
                                  inputs,
                                  cron_name,
                                  cron_id,
                                  function (result) {
                                    if (result.error) {
                                      mail.cronLogErrMail(
                                        cron_name,
                                        cron_id,
                                        fby_id,
                                        CircularJSON.stringify(result.error)
                                      );
                                    }
                                  }
                                );
                              }
                              if (result.success) {
                                orderdetail_id = result.success.data;
                              }
                            }
                          );
                        }

                        /* line items loop end*/
                        let order_masters = [
                          channel || '',
                          channel_code || '',
                          owner_code || '',
                          fby_user_id,
                          account_id,
                          order_no,
                          seller_order_id,
                          purchase_date,
                          payment_time,
                          recipient_name || '',
                          shiper_company || '',
                          shiper_strt1 || '',
                          shiper_strt2 || '',
                          shiper_city || '',
                          shiper_state || '',
                          shiper_state_code || '',
                          shiper_zip || '',
                          shiper_country || '',
                          shiper_country_iso2 || '',
                          shiper_phone,
                          total_order,
                          total_items,
                          total_items_price,
                          item_total_ship_price,
                          total_tax,
                          total_discount || 0,
                          payment_id,
                          payment_method,
                          currency_code || '',
                          buyer_id || '',
                          buyer_email || '',
                          buyer_name || '',
                          sales_record_no,
                          payment_status,
                          order_status,
                          cron_name,
                          cron_id,
                          managedByChannel,
                          '',
                          '',
                          '',
                          '',
                          '',
                          '',
                          '',
                          '',
                          '',
                          '',
                          ''
                        ];

                        await common.addOrderMaster(
                          order_masters,
                          cron_name,
                          cron_id,
                          function (result) {
                            // set_response[client.domain] = result;
                            if (result.error) {
                              logger.logError(
                                `${urlLogMsg} , addOrderMaster error:`,
                                CircularJSON.stringify(result.error)
                              );
                              // store log
                              let inputs = [
                                cron_name,
                                cron_id,
                                constants.CATCH_TYPE,
                                CircularJSON.stringify(result.error),
                                fby_id,
                              ];
                              common.cronErrorLog(
                                inputs,
                                cron_name,
                                cron_id,
                                function (result) {
                                  if (result.error) {
                                    mail.cronLogErrMail(
                                      cron_name,
                                      cron_id,
                                      fby_id,
                                      CircularJSON.stringify(result.error)
                                    );
                                  }
                                }
                              );
                            }
                            if (result.success) {
                              orderdetail_id = result.success.data;
                            }
                          }
                        );

                        //}
                        //})
                      }
                    }
                  } catch (error) {
                    //console.log(
                    //   `${urlLogMsg} , addOrder error:`,
                    //   CircularJSON.stringify(error)
                    // );
                  }

                  if (jsonData.status == "cancelled") {
                    // if order is canceled,then update payment and order status
                    let updt_time = dateTime.create();
                    let inputs = [
                      fby_id,
                      jsonData.id,
                      jsonData.status,
                      "Cancelled",
                      cron_name,
                      cron_id,
                      updt_time.format("Y-m-d H:M:S"),
                    ];
                    await common.updateOrderCancelStatus(
                      inputs,
                      fby_id,
                      cron_name,
                      cron_id,
                      function (result) {
                        if (result.error) {
                          //mail
                          mail.updateOrderErrMail(
                            cron_name,
                            cron_id,
                            fby_id,
                            CircularJSON.stringify(result.error)
                          );
                          //store update order status error log
                          let inputs = [
                            cron_name,
                            cron_id,
                            constants.QUERY_TYPE,
                            CircularJSON.stringify(result.data),
                            fby_id,
                          ];
                          common.cronErrorLog(
                            inputs,
                            cron_name,
                            cron_id,
                            function (result) {
                              if (result.error) {
                                mail.cronLogErrMail(
                                  cron_name,
                                  cron_id,
                                  fby_id,
                                  CircularJSON.stringify(result.error)
                                );
                              }
                            }
                          );
                          set_response[jsonData.id] = result.error;
                        }
                      }
                    );
                  }
                }
                /* order loop end*/
              } else {
                set_response[client.domain] = {
                  cron: cron_name,
                  updated_at: updated_at,
                  message: constants.NODATA,
                };
              }
            } catch (error) {
              let resmsg = CircularJSON.stringify(response.data);
              logger.logError(`${urlLogMsg} , catch error:`, resmsg);
              if (exist_cron) {
                let inputs = [
                  cron_name,
                  cron_id,
                  constants.CATCH_TYPE,
                  error.stack,
                  fby_id,
                  exist_cron,
                ];
                common.fbyCronErrorManage(
                  inputs,
                  cron_name,
                  cron_id,
                  function (result) {
                    if (result.error) {
                      mail.cronLogErrMail(
                        cron_name,
                        cron_id,
                        fby_id,
                        CircularJSON.stringify(result.error)
                      );
                    }
                  }
                );
                let msg = {
                  error: {
                    message: constants.GET_ORDER_ERROR,
                    data: error.stack,
                  },
                };
                set_response[client.domain] = msg;
              } else {
                //mail
                mail.shopifyGetOrderMail(cron_name, cron_id, fby_id, error.stack);
                //store update product status error log
                let inputs = [
                  cron_name,
                  cron_id,
                  constants.CATCH_TYPE,
                  error.stack,
                  fby_id,
                  exist_cron,
                ];
                common.fbyCronErrorManage(
                  inputs,
                  cron_name,
                  cron_id,
                  function (result) {
                    if (result.error) {
                      mail.cronLogErrMail(
                        cron_name,
                        cron_id,
                        fby_id,
                        CircularJSON.stringify(result.error)
                      );
                    }
                  }
                );
                let msg = {
                  error: {
                    message: constants.GET_ORDER_ERROR,
                    data: error.stack,
                  },
                };
                set_response[client.domain] = msg;
              }
            }
          })
          .catch(async function (error) {
            // if (page_no > 10) {
            //   page_loop = false;
            // }
            let errorJson = CircularJSON.stringify(error);
            logger.logError(`${urlLogMsg} , api catch error:`, errorJson);
            if (exist_cron) {
              let inputs = [
                cron_name,
                cron_id,
                constants.CATCH_TYPE,
                errorJson,
                fby_id,
                exist_cron,
              ];
              common.fbyCronErrorManage(
                inputs,
                cron_name,
                cron_id,
                function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(
                      cron_name,
                      cron_id,
                      fby_id,
                      CircularJSON.stringify(result.error)
                    );
                  }
                }
              );
              let msg = {
                error: { message: constants.GET_ORDER_ERROR, data: error },
              };
              set_response[client.domain] = msg;
            } else {
              //mail
              mail.shopifyGetOrderMail(
                cron_name,
                cron_id,
                fby_id,
                CircularJSON.stringify(error)
              );
              //store update product status error log
              let inputs = [
                cron_name,
                cron_id,
                constants.CATCH_TYPE,
                CircularJSON.stringify(error),
                fby_id,
                exist_cron,
              ];
              common.fbyCronErrorManage(
                inputs,
                cron_name,
                cron_id,
                function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(
                      cron_name,
                      cron_id,
                      fby_id,
                      CircularJSON.stringify(result.error)
                    );
                  }
                }
              );
              let msg = {
                error: { message: constants.GET_ORDER_ERROR, data: error },
              };
              try {

                let errorMessage = error.message;

                await logger.LogForAlert(
                  fby_user_id,
                  '',
                  '',
                  errorMessage,
                  '',
                  constants.LOG_LEVEL.ERROR,
                  constants.FBY_ALERT_CODES.ORDER_SYNC,
                  constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL,
                  cron_name,
                  cron_id
                );
              }
              catch (error) {
                //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

              }
              set_response[client.domain] = msg;
            }
          });

        page_no = page_no + 1;
      }
    }
  }
  catch (error) {
    //console.log();
    //console.log('error: ', error);
    set_response["Error"] = {
      message: error.message
    };

  }

  try {
    await dbCCLogs.bulkInsert(batchInfoListDB);
  } catch (error) {
    //console.log('\nERROR While bulkInsert: \n', error.message);

  }
  /* Shopify account loop end */
  return set_response;
};

const getorderdetails = async (
  Amazonclient,
  orderID,
  Access_Token,
  exist_cron,
  fby_id,
  cron_name,
  cron_id,
  callback
) => {
  Amazonclient.api_password = helpers.getDecryptedData(
    Amazonclient.secret
  );

  let logTrace = `Amazon_Get_Order_Details ${orderID}`;


  var SELLING_PARTNER_APP_CLIENT_ID = await helpers.getDecryptedData(Amazonclient.username);
  var SELLING_PARTNER_APP_CLIENT_SECRET = await helpers.getDecryptedData(Amazonclient.api_password);
  var AWS_SELLING_PARTNER_ACCESS_KEY_ID = await helpers.getDecryptedData(Amazonclient.api_key);
  var AWS_SELLING_PARTNER_SECRET_ACCESS_KEY = await helpers.getDecryptedData(Amazonclient.secret);
  var Refresh_Token = await helpers.getDecryptedData(Amazonclient.token);
  var AWS_SELLING_PARTNER_ROLE = Amazonclient.amazon_Role;
  var REGION = await helpers.getDecryptedData(Amazonclient.amazon_region);


  let sellingPartner = new SellingPartnerAPI({
    region: REGION,
    refresh_token: Refresh_Token,
    access_token: Access_Token,
    credentials: {
      SELLING_PARTNER_APP_CLIENT_ID: SELLING_PARTNER_APP_CLIENT_ID,
      SELLING_PARTNER_APP_CLIENT_SECRET: SELLING_PARTNER_APP_CLIENT_SECRET,
      AWS_ACCESS_KEY_ID: AWS_SELLING_PARTNER_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: AWS_SELLING_PARTNER_SECRET_ACCESS_KEY,
      AWS_SELLING_PARTNER_ROLE: AWS_SELLING_PARTNER_ROLE
    },
  });
  await sellingPartner.callAPI({
    operation: 'orders.getOrderItems',
    path: {
      orderId: orderID
    },
    options: {
      version: 'v0'
    }
  })
    .then(function (orderDetails) {
      logger.logInfo(logTrace, orderDetails);
      if (orderDetails.errors) {
        logger.logError(`${logTrace} error`, orderDetails.errors);
        if (exist_cron) {
          var errjson = CircularJSON.stringify(orderDetails.errors);
          let inputs = [
            cron_name,
            cron_id,
            constants.CATCH_TYPE,
            errjson,
            fby_id,
            exist_cron,
          ];
          common.fbyCronErrorManage(
            inputs,
            cron_name,
            cron_id,
            function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, fby_id, errjson);
              }
            }
          );
          let msg = {
            error: { message: constants.GET_PRODUCT_ERROR, data: errjson },
          };
          return callback(msg);
        } else {
          //mail
          mail.getProdErrMail(cron_name, cron_id, fby_id, errjson);
          //store update product status error log
          let inputs = [
            cron_name,
            cron_id,
            constants.CATCH_TYPE,
            errjson,
            fby_id,
            exist_cron,
          ];
          common.fbyCronErrorManage(
            inputs,
            cron_name,
            cron_id,
            function (result) {
              if (result.error) {
                mail.cronLogErrMail(
                  cron_name,
                  cron_id,
                  fby_id,
                  CircularJSON.stringify(result.error)
                );
              }
            }
          );
          let msg = {
            error: { message: constants.GET_PRODUCT_ERROR, data: errjson },
          };
          return callback(msg);
        }
      } else {
        return callback(orderDetails);
      }
    })
    .catch(async function (err) {

      try {

        let errorMessage = err.message;

        await logger.LogForAlert(
          fby_id,
          '',
          '',
          errorMessage,
          '',
          constants.LOG_LEVEL.ERROR,
          constants.FBY_ALERT_CODES.ORDER_SYNC,
          constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL,
          cron_name,
          cron_id
        );
      }
      catch (error) {
        //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

      }
      let errorJson = CircularJSON.stringify(err);
      logger.logError("err CATCH_TYPE: ", `${err.stack}`);
      if (exist_cron) {
        let inputs = [
          cron_name,
          cron_id,
          constants.CATCH_TYPE,
          errorJson,
          fby_id,
          exist_cron,
        ];
        common.fbyCronErrorManage(
          inputs,
          cron_name,
          cron_id,
          function (result) {
            if (result.error) {
              mail.cronLogErrMail(
                cron_name,
                cron_id,
                fby_id,
                CircularJSON.stringify(result.error)
              );
            }
          }
        );
        let msg = {
          error: { message: constants.GET_PRODUCT_ERROR, data: errorJson },
        };
        return callback(msg);
      } else {
        //mail
        mail.getProdErrMail(cron_name, cron_id, fby_id, errorJson);
        //store update product status error log
        let inputs = [
          cron_name,
          cron_id,
          constants.CATCH_TYPE,
          CircularJSON.stringify(err),
          fby_id,
          exist_cron,
        ];
        common.fbyCronErrorManage(
          inputs,
          cron_name,
          cron_id,
          function (result) {
            if (result.error) {
              mail.cronLogErrMail(
                cron_name,
                cron_id,
                fby_id,
                CircularJSON.stringify(result.error)
              );
            }
          }
        );
        let msg = {
          error: { message: constants.GET_PRODUCT_ERROR, data: errorJson },
        };
        return callback(msg);
      }
    });
};



const requestAccessToken = async (LWA_CLIENT_IDENTIFIER, AMAZON_REFRESH_TOKEN, LWA_CLIENT_SECRET) => {
  const body = {
    grant_type: 'refresh_token',
    client_id: LWA_CLIENT_IDENTIFIER,
    refresh_token: AMAZON_REFRESH_TOKEN,
    client_secret: LWA_CLIENT_SECRET,
  };
  const acccessToken = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    body: qs.stringify(body),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  });

  //console.log('acccessToken: ', acccessToken);

  let AccessTokenObject = '';
  if (acccessToken.ok) {
    //console.log('acccessToken.json(): ', await acccessToken.json());
    AccessTokenObject = await acccessToken.json();
  } else {
    //console.log('acccessToken.statusText: ', await acccessToken.statusText);
    throw new Error(acccessToken.statusText);
  }

  return AccessTokenObject.access_token;


};


exports.pushProductsAmazon = async (
  product,
  user,
  cron_name,
  new_cron_id
) => {

  cron_name = constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL;
  let file_and_method_name = 'amazon_SPAPI_Service.js pushProductsAmazon';

  let skusToPriortize = 'ZS_CLT_A1SLASH3626_A6_SS23_37,ZS_CLT_A1SLASH3626_A6_SS23_37,TR_TRV_AGV14990_A2682_CG9,BG_OBG_WDL108_A2682_BJ999,BG_OBG_WDL178_A2682_BJ999,BG_OBG_WDL044_B2689_BJ999,BG_OBG_WDL215_A2682_BJ999,BG_OBG_WDL176_N43_BJ999,BN_BRL_MFO035_D16947_F9,BG_OBG_WDL024_B2689_BJ999,BG_OBG_WDL039_C16949_BJ999,CJ_CRJ_MAL13777_J4673_U2,CJ_CRJ_MAL7173_H3840_Q3,BG_OBG_WDL036_D5371_BJ999'
  let set_response = {};
  let cron_id = new_cron_id;
  let fby_id = user.fby_user_id;
  let counter = 0;
  let productBeingProcessed = "";
  let sku = ''
  let req = null;
  let logMessage = '';
  cron_name = 'PUSH_STOCK_TO_CHANNEL';

  var SELLING_PARTNER_APP_CLIENT_ID = await helpers.getDecryptedData(user.username);
  var SELLING_PARTNER_APP_CLIENT_SECRET = await helpers.getDecryptedData(user.api_password);
  var AWS_SELLING_PARTNER_ACCESS_KEY_ID = await helpers.getDecryptedData(user.api_key);
  var AWS_SELLING_PARTNER_SECRET_ACCESS_KEY = await helpers.getDecryptedData(user.secret);
  var Refresh_Token = await helpers.getDecryptedData(user.token);
  var AWS_SELLING_PARTNER_ROLE = user.amazon_Role;

  let SellerID = user.amazon_SellerID;
  let Access_Token = await requestAccessToken(SELLING_PARTNER_APP_CLIENT_ID, Refresh_Token, SELLING_PARTNER_APP_CLIENT_SECRET);

  let cacheKey_Job = `${cron_name},group_code-${user.group_code},owner_code-${user.owner_code}`;
  // `${cron_name}-${fby_id}`;
  let jobRunning = ccCache.get(cacheKey_Job);
  try {
    if (jobRunning == undefined || !jobRunning || jobRunning == null) {
      ccCache.set(cacheKey_Job, true);
    }
    else {
      let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_id}.`;
      set_response = {
        sucess: {
          message: msg
        }
      }
      //console.log(msg);
      return set_response;
    }

    product = await fbyService.getStockListForPushDirectly(req, fby_id);

    /*
    product = [{
      "skuCode": "GC_BVI_J1558_01_1M",
      "quantity": 1,
      "skuId": 75,
      "ean": "7612901663470",
      "priority": 30,
      "marketPlaces": []
    },
    {
      "skuCode": "ZS_CLT_A1SLASH3626_A6_SS23_37",
      "quantity": 4,
      "skuId": 7537,
      "ean": "7612901663437",
      "priority": 30,
      "marketPlaces": []
    }


    ];


    // product = product.filter(p => p.skuCode == 'TR_TRV_AGC15056_A2682_CG9'
    //   || p.skuCode == 'TR_TRV_AGV14990_A2682_CG9'
    //   || p.skuCode == 'BN_BRL_WFT14464_E136_F9'
    //   || p.skuCode == 'ZS_CLT_A1SLASH3626_A6_SS23_37'

    // ); 
    */

    let totalProducts = product.length;
    let chunkedProducts, chunk = totalProducts;// (totalProducts < 40000 ? totalProducts : 40000);
    let slice_i = 0;
    let slice_j = slice_i + chunk;
    let chunkCounter = 0;
    let chunktotal = totalProducts / chunk;

    //##TODO DELETE/COMMENT logs
    /*
    await this.logTofile(`${moment().format('YYYYMMDD HHmmss')} ${moment().millisecond()} _______AMAZON_SPAPI_REQEST________01 SellingPartnerAPI.txt`
      , 'SellingPartnerAPI instance creation'
    );
   */
    let sellingPartner = new SellingPartnerAPI({
      region: user.amazon_region,
      refresh_token: Refresh_Token,
      access_token: Access_Token,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID: SELLING_PARTNER_APP_CLIENT_ID,
        SELLING_PARTNER_APP_CLIENT_SECRET: SELLING_PARTNER_APP_CLIENT_SECRET,
        AWS_ACCESS_KEY_ID: AWS_SELLING_PARTNER_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: AWS_SELLING_PARTNER_SECRET_ACCESS_KEY,
        AWS_SELLING_PARTNER_ROLE: AWS_SELLING_PARTNER_ROLE
      },
    });
    let skuAndQty = '';
    for (slice_i = 0; slice_i < slice_j && slice_j <= totalProducts; slice_i += chunk) {
      chunkCounter++;
      skuAndQty = '';
      try {
        chunkedProducts = product.slice(slice_i, slice_j);

        if (chunkCounter % 100 == 0 || chunkCounter == 1) {
          logMessage = `fby_user_id: ${fby_id}, chunkCounter: ${chunkCounter}, slice_i: ${slice_i}, slice_j: ${slice_j}, chunkTotal:${chunktotal}, ${cron_name}`;
          //console.log(`\n${chunkCounter}) fby_user_id: ${fby_id}, totalProducts: ${totalProducts}, chunkTotal:${chunktotal}`);
          //console.log('slice_i: ', slice_i);
          //console.log('slice_j: ', slice_j);
        }

        if (slice_j + chunk > totalProducts) {
          //chunk = totalProducts - slice_j;
          slice_j = totalProducts;
          //slice_i++;
        }
        else if (slice_j < totalProducts) {
          slice_j = slice_j + chunk;
          //slice_i++;
        }

        let messageNode = `<Message><MessageID>##MessageID##</MessageID>
        <OperationType>PartialUpdate</OperationType>
        <Inventory><SKU>##SKU##</SKU><Quantity>##quantity##</Quantity></Inventory></Message>`;
        let messageNodeNodes = '';

        for await (const itemlist of chunkedProducts) {
          try {
            let messageNodeSKU = messageNode;
            let messageID = `${fby_id}${itemlist.skuId}${moment().format('HHmmss')}`;
            if (skuAndQty != '') {
              skuAndQty = `${skuAndQty},${itemlist.skuCode}:${itemlist.quantity}`;
            }
            else {
              skuAndQty = `${itemlist.skuCode}:${itemlist.quantity}`;
            }
            messageNodeSKU = messageNodeSKU
              .replace('##SKU##', itemlist.skuCode)
              .replace('##quantity##', itemlist.quantity)
              .replace('##MessageID##', messageID);

            messageNodeNodes = messageNodeNodes + messageNodeSKU;

            //patchListingsItem
            sku = itemlist.skuCode;
            let qty = itemlist.quantity;

            if (counter % 100 == 0) {
              //console.log(`\n${counter}) ${logMessage}, sku ${sku}, quantity ${qty}`);
            }

            /*
            try {
              await logger.LogForAlert(
                fby_id,
                '',
                sku,
                `${logMessage}, sku ${sku}, quantity ${qty} `,
                itemlist,
                constants.LOG_LEVEL.INFO,
                constants.FBY_ALERT_CODES.STOCK_SYNC,
                cron_name,
                cron_id
              );
            }
            catch (error) {
              //console.log('');
              //console.log(error);
              //console.log('');

            }
            */
            if (skusToPriortize.includes(sku)) {
              let reposss = await sellingPartner.callAPI({
                operation: 'patchListingsItem',
                endpoint: 'listingsItems',
                path: {
                  sellerId: 'AZOEX4BS7JB75',
                  sku: sku
                },
                query: {
                  marketplaceIds: [user.amazon_MarketPlaceID]
                },
                body:
                {
                  productType: "PRODUCT",
                  operationType: "PATCH",
                  marketplaceIds: [user.amazon_MarketPlaceID],
                  patches: [
                    {
                      op: "replace",
                      operation_type: "PARTIAL_UPDATE",
                      path: "/attributes/fulfillment_availability",
                      value: [
                        {
                          fulfillment_channel_code: "DEFAULT",
                          quantity: qty
                        }
                      ]
                    }
                  ]
                }
              });


              /*
              //console.log(reposss);
              await logger.LogForAlert(
                fby_id,
                '',
                sku,
                `${logMessage}, sku ${sku}, quantity ${qty} `,
                reposss,
                constants.LOG_LEVEL.INFO,
                constants.FBY_ALERT_CODES.STOCK_SYNC,
                cron_name,
                cron_id
              );
              */
              await helpers.sleep(1);
            }
            //*/
          }
          catch (error) {
            //console.log(`\n${logMessage}, sku ${sku}\nAmazon patchListingsItem error ${error.message}\n${JSON.stringify(itemlist)}`);
          }
          counter++;
        }
        /*
        //console.log('------------------------------------------\n');
        //console.log(messageNodeNodes);
        //console.log('------------------------------------------\n');
        */

        counter = 1;

        /* products loop start */
        for await (const itemlist of chunkedProducts) {
          productBeingProcessed = `fby_user_id: ${fby_id}, sku ${itemlist.sku}`;
          //console.log('productBeingProcessed: ', productBeingProcessed);

          try {
            sku = itemlist.skuCode;
            let cron_id = new_cron_id;
            let exist_cron = 0;
            if (itemlist.cron_name == cron_name && itemlist.cron_id) {
              cron_id = itemlist.cron_id;
              exist_cron = 1;
            } else {
              /* Update with new cron id */
              let updt_time = dateTime.create();
              let inputs = [
                sku,
                cron_name,
                cron_id,
                updt_time.format("Y-m-d H:M:S"),
              ];

            }



            let feed = {
              content:
                `<?xml version="1.0" encoding="utf-8"?>
              <AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd">
              <Header>
                  <DocumentVersion>1.02</DocumentVersion>
                  <MerchantIdentifier>${SellerID}</MerchantIdentifier>
              </Header>
              <MessageType>Inventory</MessageType>
              ${messageNodeNodes}
              </AmazonEnvelope>`,
              contentType: 'text/xml; charset=utf-8'
            };

            let feed_upload_details = await sellingPartner.callAPI({
              operation: 'createFeedDocument',
              endpoint: 'feeds',
              body: {
                contentType: feed.contentType
              }
            });

            let feed_res = await sellingPartner.upload(feed_upload_details, feed);

            let fileLog = `${fby_id}${moment().format('HHmmss')}`;
            let datafeed = feed.content;
            let datafeed_res = JSON.stringify(feed_res);

            await this.logTofile(`01_POST_INVENTORY_AVAILABILITY_DATA_feed.xml`, datafeed);
            await this.logTofile(`02_POST_INVENTORY_AVAILABILITY_DATA_feed-POST-RESPONSE.json`, datafeed_res);

            //##TODO DELETE/COMMENT logs
            /*
            await this.logTofile(`${moment().format('YYYYMMDD HHmmss')} ${moment().millisecond()} _______AMAZON_SPAPI_REQEST________02 createFeed POST_INVENTORY_AVAILABILITY_DATA and get feedId.txt`
              , {
                operation: 'createFeed',
                endpoint: 'feeds',
                body: {
                  marketplaceIds: [user.amazon_MarketPlaceID],
                  feedType: 'POST_INVENTORY_AVAILABILITY_DATA',
                  inputFeedDocumentId: feed_upload_details.feedDocumentId // retrieve the feedDocumentId from the "createFeedDocument" operation
                }
              }
            );
            */

            let feedId = '';
            await sellingPartner.callAPI({
              operation: 'createFeed',
              endpoint: 'feeds',
              body: {
                marketplaceIds: [user.amazon_MarketPlaceID],
                feedType: 'POST_INVENTORY_AVAILABILITY_DATA',
                inputFeedDocumentId: feed_upload_details.feedDocumentId // retrieve the feedDocumentId from the "createFeedDocument" operation
              }
            })
              .then(async (response) => {

                if (response.data == undefined && response != undefined) {
                  try {
                    response.data = JSON.parse(JSON.stringify(response));
                    feedId = response.feedId || '';
                    await logger.LogForAlert(
                      fby_id,
                      '',
                      'xml',
                      `${logMessage}, feedId=${feedId}`,
                      { amazonResponse: response.data, inputFeed: skuAndQty },
                      constants.LOG_LEVEL.INFO,
                      constants.FBY_ALERT_CODES.STOCK_SYNC,
                      cron_name,
                      cron_id
                    );
                  }
                  catch (error) {
                    //console.log(`D:\\github\\channel_connector-1\\services\\amazon_SPAPI_Service.js, line 1053`);
                    //console.log(error);

                  }
                }

                let feedDocumentId = '';
                let feed_response = null;
                let StockUpdateResultDoc = null;
                let feedDocumentTryCounter = 0;
                //*

                try {
                  while (feedDocumentId == '' && feedDocumentTryCounter < 500) {
                    feedDocumentTryCounter++;

                    //##TODO DELETE/COMMENT logs
                    /*
                    await this.logTofile(`${moment().format('YYYYMMDD HHmmss')} ${moment().millisecond()} _______AMAZON_SPAPI_REQEST________03 GET feedDocumentId based on feedId.txt`
                      , {
                        operation: 'getFeed',
                        endpoint: 'feeds',
                        path: {
                          feedId: feedId
                        }
                      }
                    );
                    */

                    feed_response = await sellingPartner.callAPI({
                      operation: 'getFeed',
                      endpoint: 'feeds',
                      path: {
                        feedId: feedId //'98879019543'
                      }

                    });

                    if (feed_response.processingStatus !== 'DONE'
                      && (feed_response.processingStatus !== 'ACTION_REQUIRED'
                        || feed_response.processingStatus !== 'FAILED')
                    ) {
                      if (feedDocumentTryCounter % 50 == 0) {
                        //console.log(`${feedDocumentTryCounter}/50)\t${moment().format(MOMENT_DATE_FORMAT)}\t fby_user_id: ${fby_id}, helpers.sleep: ${feed_response.processingStatus}`);
                      }
                      await helpers.sleep(15);
                    }
                    if (feed_response != null && feed_response.resultFeedDocumentId !== undefined) {
                      feedDocumentId = feed_response.resultFeedDocumentId;
                    }
                  }
                }
                catch (error) {
                  //console.log('feedDocumentId error: ', error);

                }

                if (feedDocumentId != '') {
                  //console.log(`${feedDocumentTryCounter}/50)\t${moment().format(MOMENT_DATE_FORMAT)}\t fby_user_id: ${fby_id}, helpers.sleep: ${feed_response.processingStatus}`);

                  //##TODO DELETE/COMMENT logs
                  /*
                  await this.logTofile(`${moment().format('YYYYMMDD HHmmss')} ${moment().millisecond()} _______AMAZON_SPAPI_REQEST________04 getFeedDocument(feed_doc) based on feedDocumentId.txt`
                    , {
                      operation: 'getFeedDocument',
                      endpoint: 'feeds',
                      path: {
                        feedDocumentId: feedDocumentId,
                      }
                    }
                  );
                  */

                  let feed_doc = await sellingPartner.callAPI({
                    operation: 'getFeedDocument',
                    endpoint: 'feeds',
                    path: {
                      feedDocumentId: feedDocumentId,
                    }
                  });

                  //##TODO DELETE/COMMENT logs
                  /*
                  await this.logTofile(`${moment().format('YYYYMMDD HHmmss')} ${moment().millisecond()}  _______AMAZON_SPAPI_REQEST________05 download Result of feed Processig (StockUpdateResultDoc) based on (feed_doc).txt`
                    , {
                      operation: 'StockUpdateResultDoc download feed_doc based on feedDocumentId',
                      endpoint: 'feeds',
                    }
                  );
                  */

                  StockUpdateResultDoc = await sellingPartner.download(feed_doc, {
                    json: true
                  });

                  let logMsgTofile = `\n${chunkCounter}) fby_user_id: ${fby_id}, totalProducts: ${totalProducts}, chunkTotal:${chunktotal}, feedId=${feedId}, feedDocumentId=${feedDocumentId}\n${JSON.stringify(StockUpdateResultDoc)}`;
                  //console.log(logMsgTofile);

                  logMsgTofile = {

                    ccAuditData: {
                      chunkCounter: chunkCounter,
                      chunkTotal: chunktotal,
                      fby_user_id: fby_id,
                      totalProducts: totalProducts,
                    },
                    POST_INVENTORY_AVAILABILITY_DATA_feedProcessingResult: {
                      feedId: feedId,
                      feedDocumentId: feedDocumentId,
                      stockUpdateResult_ProcessingReport: StockUpdateResultDoc
                    }
                  };
                  await this.logTofile("03_POST_INVENTORY_AVAILABILITY_DATA_feed-PROCESSING-RESULT.json", logMsgTofile);
                }

                await logger.LogForAlert(
                  fby_id,
                  'stock-update-result',
                  'xml',
                  `${logMessage}, feedId=${feedId}, feedDocumentId=${feedDocumentId}`,
                  { StockUpdateResult: StockUpdateResultDoc, SkusAndQty: skuAndQty },
                  constants.LOG_LEVEL.INFO,
                  constants.FBY_ALERT_CODES.STOCK_SYNC,
                  cron_name,
                  cron_id
                );

                //feedDocumentId
                //*/

                let is_stock_update_sucess = response != null && response.feedId != undefined && response.feedId != null;

                // if (response.data != undefined && response.data.stock_quantity != undefined && response.data.stock_quantity != null) {
                //   is_stock_update_sucess = itemlist.inventory_quantity == response.data.stock_quantity;
                // }

                let pritnResult = {
                  type: 'RESPONSE',
                  url: 'Amazon',
                  fby_user_id: fby_id,
                  is_stock_update_sucess: is_stock_update_sucess,
                  data_update:
                  {
                    feed_response: JSON.stringify(StockUpdateResultDoc) || ''
                  }
                };

                //set response
                if (pritnResult.url != undefined && pritnResult.url != '') {
                  pritnResult.url = '***';
                }

                let msg = {
                  success: {
                    message: constants.PUSH_STOCK_CHANNEL_SUCCESS,
                    data: pritnResult,
                  },
                };
                set_response = msg;
              })
              .catch((error) => {

                let resmsg = CircularJSON.stringify(error.response.data.message || error.messgae);
                //console.log(`\n${chunkCounter}) fby_user_id: ${fby_id}, totalProducts: ${totalProducts}, chunkTotal:${chunktotal}\n`, error.message);

                if (exist_cron) {
                  /* Update products count=count+1 and update error log */
                  let updt_time = dateTime.create();
                  let inputs = [
                    fby_id,
                    itemlist.sku,
                    exist_cron,
                    cron_name,
                    cron_id,
                    constants.CATCH_TYPE,
                    CircularJSON.stringify(error),
                    updt_time.format("Y-m-d H:M:S"),
                  ];

                  //set response
                  let msg = {
                    error: {
                      message: constants.PUSH_STOCK_CHANNEL_ERROR,
                      data: CircularJSON.stringify(error),
                    },
                  };
                  set_response[itemlist.sku] = msg;
                } else {
                  let updt_time = dateTime.create();
                  let inputs = [
                    fby_id,
                    itemlist.sku,
                    exist_cron,
                    cron_name,
                    cron_id,
                    constants.CATCH_TYPE,
                    CircularJSON.stringify(error),
                    updt_time.format("Y-m-d H:M:S"),
                  ];
                  /* Update products count=count+1 and flag 1 */

                  //set response
                  let msg = {
                    error: {
                      message: constants.PUSH_STOCK_CHANNEL_ERROR,
                      data: CircularJSON.stringify(error),
                    },
                  };
                  set_response[itemlist.sku] = msg;
                }
              });
          }
          catch (err) {
            //console.log('push-Amazon-stock : ERROR \n', err);

          }
          counter++;
          break;
        }
      }
      catch (error) {
        //##TODO Alert ceation required 
        //console.log(`Amazon batch creation error ${error.message}`);
      }

      /* products loop end */


    } //batch end
    return set_response;
  }
  catch (error) {
    //console.log(error);
  }
  finally {
    ccCache.del(cacheKey_Job);
  }

};
exports.pushTrackingAmazon = async (
  order,
  user,
  cron_name,
  cron_id,
  req,
  res
) => {
  let operationId = helpers.getUUID();
  let set_response = {
    details: [],
  };
  let error = false;

  for (const itemlist of order) {
    let fby_user_id = itemlist.fby_user_id;
    let order_number = itemlist.order_no;
    let shippingMethod = itemlist.shipping_method
    let sku = itemlist.sku || '';
    //console.log('\n pushTrackingAmazon order_number: ', order_number);
    let order_status = itemlist.order_status;
    // set_response.order_numbers.push(order_number);

    let line_items = [];
    await common.getOrderDetailsTracking(
      fby_user_id,
      itemlist.order_no,
      cron_name,
      cron_id,
      function (result) {
        if (result.error) {
          let details = {
            order_number: order_number,
            status: "",//constants.PUSH_TRACKNO_CHANNEL_ERROR,
            error: ""
          };
          set_response.request = { operationId: operationId };
          //logger.logInfo("pushTrackingShopify-->getOrderDetailsTracking error", details);
          //set_response.details.push(CircularJSON.stringify(details));
          //console.log('set_response -1: ', set_response);

          // store log
          let inputs = [
            cron_name,
            cron_id,
            constants.CATCH_TYPE,
            CircularJSON.stringify(result.error),
            fby_user_id,
          ];
          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(
                cron_name,
                cron_id,
                fby_user_id,
                CircularJSON.stringify(result.error)
              );
            }
          });
        }
        if (result.success) {
          let order_details = result.success.data;
          //console.log('order_details: ', order_details);
          let tracking_response = {
            order_status: "",
            order_details: {},
          };
          tracking_response.order_details = order_details.map(async (item) => {
            var SELLING_PARTNER_APP_CLIENT_ID = await helpers.getDecryptedData(user.username);
            var SELLING_PARTNER_APP_CLIENT_SECRET = await helpers.getDecryptedData(user.api_password);
            var AWS_SELLING_PARTNER_ACCESS_KEY_ID = await helpers.getDecryptedData(user.api_key);
            var AWS_SELLING_PARTNER_SECRET_ACCESS_KEY = await helpers.getDecryptedData(user.secret);
            var Refresh_Token = await helpers.getDecryptedData(user.token);
            var AWS_SELLING_PARTNER_ROLE = user.amazon_Role;
            var REGION = await helpers.getDecryptedData(user.amazon_region);
            let SellerID = user.amazon_SellerID;

            let Access_Token = await requestAccessToken(SELLING_PARTNER_APP_CLIENT_ID, Refresh_Token, SELLING_PARTNER_APP_CLIENT_SECRET);

            let sellingPartner = new SellingPartnerAPI({
              region: REGION,
              refresh_token: Refresh_Token,
              access_token: Access_Token,
              credentials: {
                SELLING_PARTNER_APP_CLIENT_ID: SELLING_PARTNER_APP_CLIENT_ID,
                SELLING_PARTNER_APP_CLIENT_SECRET: SELLING_PARTNER_APP_CLIENT_SECRET,
                AWS_ACCESS_KEY_ID: AWS_SELLING_PARTNER_ACCESS_KEY_ID,
                AWS_SECRET_ACCESS_KEY: AWS_SELLING_PARTNER_SECRET_ACCESS_KEY,
                AWS_SELLING_PARTNER_ROLE: AWS_SELLING_PARTNER_ROLE
              },
            });

            let fulfillDate = new Date().toISOString();

            var feedContent = `<?xml version="1.0" encoding="utf-8"?>`;
            feedContent += `<AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd">`;
            feedContent += `<Header><DocumentVersion>1.01</DocumentVersion><MerchantIdentifier>${SellerID}</MerchantIdentifier></Header>`;
            feedContent += `<MessageType>OrderFulfillment</MessageType><Message><MessageID>1</MessageID><OrderFulfillment>`;
            feedContent += `<AmazonOrderID>${order_number}</AmazonOrderID><FulfillmentDate>${fulfillDate}</FulfillmentDate><FulfillmentData>`;
            feedContent += `<CarrierCode>${item.tracking_courier}</CarrierCode><ShipperTrackingNumber>${item.tracking_id}</ShipperTrackingNumber></FulfillmentData>`;
            feedContent += `</OrderFulfillment></Message></AmazonEnvelope>`;

            // let feed = {
            //   content: `<?xml version="1.0" encoding="UTF-8"?>
            //   <AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd">
            //   <Header>
            //       <DocumentVersion>1.01</DocumentVersion>
            //       <MerchantIdentifier>${SellerID}</MerchantIdentifier>
            //   </Header>
            //   <MessageType>OrderFulfillment</MessageType>
            //   <Message>
            //       <MessageID>1</MessageID>
            //       <OrderFulfillment>
            //           <AmazonOrderID>${order_number}</AmazonOrderID>
            //           <MerchantFullfillmentID>${item.tracking_id}</MerchantFullfillmentID>
            //           <FulfillmentDate>${fulfillDate}</FulfillmentDate>
            //           <FulfillmentData>
            //               <CarrierCode>${item.tracking_courier}</CarrierCode>
            //               <ShipperTrackingNumber>${item.tracking_id}</ShipperTrackingNumber>
            //           </FulfillmentData>
            //       </OrderFulfillment>
            //   </Message>
            //   </AmazonEnvelope>`,
            //   contentType: 'text/xml; charset=utf-8'
            // };

            let feed = {
              content: feedContent,
              contentType: 'text/xml; charset=utf-8'
            };

            //console.log(feed);
            //console.log(feed.content);
            //console.log(feedContent);

            let feed_upload_details = await sellingPartner.callAPI({
              operation: 'createFeedDocument',
              endpoint: 'feeds',
              body: {
                contentType: feed.contentType
              }
            });

            let feed_res = await sellingPartner.upload(feed_upload_details, feed);

            await sellingPartner.callAPI({
              operation: 'createFeed',
              endpoint: 'feeds',
              body: {
                marketplaceIds: [user.amazon_MarketPlaceID],
                feedType: 'POST_ORDER_FULFILLMENT_DATA',
                inputFeedDocumentId: feed_upload_details.feedDocumentId // retrieve the feedDocumentId from the "createFeedDocument" operation
              }
            })
              .then(async (parsedBody) => {
                let responseBodyjson = CircularJSON.stringify(parsedBody);
                try {
                  infoMessage = `fby_user_id: ${fby_user_id}, sku: ${sku}, ${cron_name}`;
                  await logger.LogForAlert(
                    fby_user_id,
                    '',
                    sku != undefined ? sku : '',
                    `${infoMessage}`,
                    responseBodyjson,
                    constants.LOG_LEVEL.INFO,
                    constants.FBY_ALERT_CODES.TRACK_SYNC,
                    cron_id,
                    false
                  );
                } catch (error) {
                  //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
                  //console.log(error);
                }
                logger.logInfo(
                  `pushTrackingAmazon FeedId ${parsedBody}`,
                  responseBodyjson
                );
                //update status 1 after send
                if (responseBodyjson.error) {
                  let orderJson = CircularJSON.stringify(details);
                  logger.logInfo(
                    `pushTrackingAmazon FeedId error ${parsedBody} : `,
                    responseBodyjson
                  );
                  set_response.details.push(responseBodyjson);
                } else {

                  let feed_response = await sellingPartner.callAPI({
                    operation: 'getFeed',
                    endpoint: 'feeds',
                    path: {
                      feedId: parsedBody.feedId == undefined ? parsedBody : parsedBody.feedId
                    }
                  });

                  let feedDocumentId = feed_response.resultFeedDocumentId;

                  let feed_doc = await sellingPartner.callAPI({
                    operation: 'getFeedDocument',
                    endpoint: 'feeds',
                    path: {
                      feedDocumentId: feedDocumentId
                    }
                  });

                  let OrderTrackingUpdated = await sellingPartner.download(feed_doc, {
                    json: true
                  });


                  let updt_time = dateTime.create();
                  let inputs = [
                    fby_user_id,
                    order_number,
                    cron_name,
                    cron_id,
                    updt_time.format("Y-m-d H:M:S"),
                  ];
                  await common.updateOrderDetailStatus(
                    inputs,
                    fby_user_id,
                    cron_name,
                    cron_id,
                    function (result) {
                      if (result.error) {
                        //mail
                        mail.updateOrderErrMail(
                          cron_name,
                          cron_id,
                          fby_user_id,
                          CircularJSON.stringify(result.error)
                        );
                        //store update product status error log
                        let inputs = [
                          cron_name,
                          cron_id,
                          constants.CATCH_TYPE,
                          CircularJSON.stringify(result.data),
                          fby_user_id,
                        ];
                        common.cronErrorLog(
                          inputs,
                          cron_name,
                          cron_id,
                          function (result) {
                            if (result.error) {
                              mail.cronLogErrMail(
                                cron_name,
                                cron_id,
                                fby_user_id,
                                CircularJSON.stringify(result.error)
                              );
                            }
                          }
                        );
                      }
                    }
                  );

                  await updateOrderStatus(
                    itemlist,
                    user,
                    cron_name,
                    cron_id,
                    function (orderdetails) { }
                  );
                  return (set_response[order_number] =
                    constants.PUSH_TRACKNO_CHANNEL_SUCCESS);
                }
              })
              .catch(async function (err) {
                Promise.resolve(err);
                error = true;
                try {
                  let errorMessage = `${infoMessage}\n, ErrorMessage: ${err.message}`;
                  await logger.LogForAlert(
                    fby_user_id,
                    '',
                    sku,
                    errorMessage,
                    err,
                    constants.LOG_LEVEL.ERROR,
                    constants.FBY_ALERT_CODES.TRACK_SYNC,
                    cron_name,
                    cron_id
                  );

                } catch (error) {
                  //console.log('\n ERROR: pushTrackingAmazon', error.message);
                }

                if (set_response == undefined) {
                  set_response = {
                    details: [],
                  };
                }
                if (set_response.details == undefined) {
                  set_response.details = [];
                }

                let details = {
                  order_status: {
                    order_number: order_number,
                    status: constants.PUSH_TRACKNO_CHANNEL_ERROR,
                    error: err.message,
                  },
                };

                //store log
                let inputs = [
                  cron_name,
                  cron_id,
                  constants.CATCH_TYPE,
                  CircularJSON.stringify(err),
                  fby_user_id,
                ];
                common.cronErrorLog(
                  inputs,
                  cron_name,
                  cron_id,
                  function (result) {
                    if (result.error) {
                      mail.cronLogErrMail(
                        cron_name,
                        cron_id,
                        fby_user_id,
                        CircularJSON.stringify(result.error)
                      );
                    }
                  }
                );

                Promise.resolve(details.order_status).then(function (value) {
                  // set_response = value;
                  set_response.request = { operationId: operationId };
                  let orderJson = CircularJSON.stringify(details);
                  logger.logError(
                    `pushTrackingAmazon error : ${orderJson}`,
                    value
                  );
                  set_response.details.push(CircularJSON.stringify(value));
                });
              });
          });

          setTimeout(() => {
            if (!res.headersSent) {
              if (!error) {
                //console.log('set_response1: ', set_response);
                if (set_response == undefined) {
                  set_response = {
                    details: [],
                  };
                }
                if (set_response.details == undefined) {
                  set_response.details = [];
                }
                set_response.details.push(tracking_response);
              }
            }
          }, 3000);
        }
      }
    );
  }

  setTimeout(() => {
    if (!res.headersSent) {
      Promise.resolve(set_response.details).then(function (value) {
        //console.log('set_response2: ', set_response);
        helpers.sendSuccess(res, 200, "sucess", set_response, req);
      });
    }
  }, 3000);
};


exports.generateProductsReport = async (
  result,
  exist_cron,
  fby_id,
  cron_name,
  cron_id
) => {
  let set_response = {};
  let urlLogMsg = `Amazon getProducts fby_user_id: ${fby_id}`;
  let infoMessage = `fby_user_id: ${fby_id}, ${constants.CC_OPERATIONS.GET_PRODUCT_REPORT_FROM_CHANNEL}`;

  try {
    /* shopify account loop start */
    for (const client of result) {

      var SELLING_PARTNER_APP_CLIENT_ID = await helpers.getDecryptedData(client.username);
      var SELLING_PARTNER_APP_CLIENT_SECRET = await helpers.getDecryptedData(client.api_password);
      var AWS_SELLING_PARTNER_ACCESS_KEY_ID = await helpers.getDecryptedData(client.api_key);
      var AWS_SELLING_PARTNER_SECRET_ACCESS_KEY = await helpers.getDecryptedData(client.secret);
      var Refresh_Token = await helpers.getDecryptedData(client.token);
      var AWS_SELLING_PARTNER_ROLE = client.amazon_Role;
      var REGION = await helpers.getDecryptedData(client.amazon_region);

      let Access_Token = await requestAccessToken(SELLING_PARTNER_APP_CLIENT_ID, Refresh_Token, SELLING_PARTNER_APP_CLIENT_SECRET);

      let sellingPartner = new SellingPartnerAPI({
        region: REGION,
        refresh_token: Refresh_Token,
        access_token: Access_Token,
        credentials: {
          SELLING_PARTNER_APP_CLIENT_ID: SELLING_PARTNER_APP_CLIENT_ID,
          SELLING_PARTNER_APP_CLIENT_SECRET: SELLING_PARTNER_APP_CLIENT_SECRET,
          AWS_ACCESS_KEY_ID: AWS_SELLING_PARTNER_ACCESS_KEY_ID,
          AWS_SECRET_ACCESS_KEY: AWS_SELLING_PARTNER_SECRET_ACCESS_KEY,
          AWS_SELLING_PARTNER_ROLE: AWS_SELLING_PARTNER_ROLE
        },
      });

      helpers.sleep();
      try {
        await sellingPartner.callAPI({
          operation: 'createReport',
          endpoint: 'reports',
          body: {
            reportType: 'GET_FLAT_FILE_OPEN_LISTINGS_DATA',
            marketplaceIds: [client.amazon_MarketPlaceID]
          }
        })
          .then(async function (parsedBody) {
            let resmsg = CircularJSON.stringify(parsedBody.reportId);
            //console.log(`${urlLogMsg}-${resmsg}`);
            try {

              await logger.LogForAlert(
                fby_id,
                '',
                '',
                infoMessage,
                resmsg,
                constants.LOG_LEVEL.INFO,
                constants.FBY_ALERT_CODES.UNKNOWN,
                constants.CC_OPERATIONS.GET_PRODUCT_REPORT_FROM_CHANNEL,
                cron_id
              );
            } catch (error) {
              //console.log('\n ERROR: ', error.message);
            }
            if (parsedBody.reportId.length == 0) {
              return set_response;
            }

            let inputs = [
              parsedBody.reportId,
              fby_id
            ];

            common.addReport(
              inputs,
              fby_id,
              cron_name,
              cron_id,
              function (result) {
                if (result.error) {
                  let errmsg = CircularJSON.stringify(result.error);
                  logger.logError(`Amazon addReport`, errmsg);
                  logger.logError(`${urlLogMsg}, addReport Error`, errmsg);
                  //mail
                  mail.addProductErrMail(
                    cron_name,
                    cron_id,
                    fby_id,
                    CircularJSON.stringify(result.error)
                  );
                  // store log
                  let inputs = [
                    cron_name,
                    cron_id,
                    constants.QUERY_TYPE,
                    CircularJSON.stringify(result.error),
                    fby_id,
                  ];
                  common.cronErrorLog(
                    inputs,
                    cron_name,
                    cron_id,
                    function (result) {
                      if (result.error) {
                        mail.cronLogErrMail(
                          cron_name,
                          cron_id,
                          fby_id,
                          CircularJSON.stringify(result.error)
                        );
                      }
                    }
                  );
                }
              }
            );

            logger.logInfo(`${urlLogMsg}`, resmsg);

            let msg = {
              success: {
                message: constants.GENERATE_PRODUCT_REPORT_SUCCESS,
                data: parsedBody.reportId,
              },
            };
            set_response[client.domain] = msg;
          })
          .catch(async function (err) {
            let errmsg = CircularJSON.stringify(err.message);
            //console.log(`${urlLogMsg}, api catch error`, errmsg);
            try {

              let logData = JSON.stringify(err);
              let errorMessage = `${constants.CC_OPERATIONS.GET_PRODUCT_REPORT_FROM_CHANNEL} fby_user_id: ${fby_id}, error : ${err.message}`;
              //console.log(errorMessage);
              await logger.LogForAlert(
                fby_id,
                '',
                '',
                errorMessage,
                logData,
                constants.LOG_LEVEL.ERROR,
                constants.FBY_ALERT_CODES.UNKNOWN,
                constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL,
                cron_id
              );
            }
            catch (error) {
              //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

            }
            if (exist_cron) {
              let inputs = [
                cron_name,
                cron_id,
                constants.CATCH_TYPE,
                CircularJSON.stringify(err),
                fby_id,
                exist_cron,
              ];
              common.fbyCronErrorManage(
                inputs,
                cron_name,
                cron_id,
                function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(
                      cron_name,
                      cron_id,
                      fby_id,
                      CircularJSON.stringify(result.error)
                    );
                  }
                }
              );
              let msg = {
                error: {
                  message: constants.GET_PRODUCT_ERROR,
                  data: CircularJSON.stringify(err),
                },
              };
              set_response[client.domain] = msg;
            } else {
              //mail
              mail.updateOrderErrMail(
                cron_name,
                cron_id,
                fby_id,
                CircularJSON.stringify(err)
              );
              //store update product status error log
              let inputs = [
                cron_name,
                cron_id,
                constants.CATCH_TYPE,
                CircularJSON.stringify(err),
                fby_id,
                exist_cron,
              ];
              common.fbyCronErrorManage(
                inputs,
                cron_name,
                cron_id,
                function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(
                      cron_name,
                      cron_id,
                      fby_id,
                      CircularJSON.stringify(result.error)
                    );
                  }
                }
              );
              let msg = {
                error: {
                  message: constants.GET_PRODUCT_ERROR,
                  data: CircularJSON.stringify(err),
                },
              };
              set_response[client.domain] = msg;
            }
          });


      }

      catch (err) {
        logger.logError(`${urlLogMsg} controller catch error`, err);
      }

    }
  } catch (err) {
    logger.logError(`${urlLogMsg} controller catch error`, err);
  }
  /* shopify account loop end */
  return set_response;
};

exports.getProducts = async (
  result,
  reportID,
  exist_cron,
  fby_id,
  cron_name,
  cron_id
) => {
  let set_response = {};
  let urlLogMsg = `Amazon getProducts fby_user_id: ${fby_id}`;
  //console.log(`${urlLogMsg}`);
  let infoMessage = `fby_user_id: ${fby_id}, ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL}`;


  try {
    /* shopify account loop start */
    for (const client of result) {

      var SELLING_PARTNER_APP_CLIENT_ID = await helpers.getDecryptedData(client.username);
      var SELLING_PARTNER_APP_CLIENT_SECRET = await helpers.getDecryptedData(client.api_password);
      var AWS_SELLING_PARTNER_ACCESS_KEY_ID = await helpers.getDecryptedData(client.api_key);
      var AWS_SELLING_PARTNER_SECRET_ACCESS_KEY = await helpers.getDecryptedData(client.secret);
      var Refresh_Token = await helpers.getDecryptedData(client.token);
      var AWS_SELLING_PARTNER_ROLE = client.amazon_Role;

      let Access_Token = await requestAccessToken(SELLING_PARTNER_APP_CLIENT_ID, Refresh_Token, SELLING_PARTNER_APP_CLIENT_SECRET);

      let sellingPartner = new SellingPartnerAPI({
        region: client.amazon_region,
        refresh_token: Refresh_Token,
        access_token: Access_Token,
        credentials: {
          SELLING_PARTNER_APP_CLIENT_ID: SELLING_PARTNER_APP_CLIENT_ID,
          SELLING_PARTNER_APP_CLIENT_SECRET: SELLING_PARTNER_APP_CLIENT_SECRET,
          AWS_ACCESS_KEY_ID: AWS_SELLING_PARTNER_ACCESS_KEY_ID,
          AWS_SECRET_ACCESS_KEY: AWS_SELLING_PARTNER_SECRET_ACCESS_KEY,
          AWS_SELLING_PARTNER_ROLE: AWS_SELLING_PARTNER_ROLE
        },
      });

      helpers.sleep();
      try {
        await sellingPartner.callAPI({
          operation: 'getReport',
          endpoint: 'reports',
          path: {
            reportId: reportID
          },
          query: {
            MarketplaceIds: client.amazon_MarketPlaceID,
            reportId: reportID
          },
        })
          .then(async function (parsedBody) {
            let resmsg = CircularJSON.stringify(parsedBody.reportDocumentId);
            //console.log(`${urlLogMsg}, reportDocumentId: ${resmsg}`);
            try {
              await logger.LogForAlert(
                fby_id,
                '',
                '',
                infoMessage,
                resmsg,
                constants.LOG_LEVEL.INFO,
                constants.FBY_ALERT_CODES.UNKNOWN,
                constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL,
                cron_id
              );
            } catch (error) {
              //console.log('\n ERROR: ', error.message);
            }
            if (parsedBody.reportDocumentId.length == 0 || parsedBody.processingStatus != "DONE") {
              return set_response;
            }

            let report_document = await sellingPartner.callAPI({
              operation: 'getReportDocument',
              endpoint: 'reports',
              path: {
                reportDocumentId: parsedBody.reportDocumentId // retrieve the reportDocumentId from a "getReport" operation (when processingStatus of report is "DONE")
              }
            });

            let ProductsList = await sellingPartner.download(report_document, {
              json: true
            });

            logger.logInfo(`${urlLogMsg}`, resmsg);

            let deleteInputs =
              [
                fby_id,
                reportID
              ];
            common.deleteReports(
              deleteInputs,
              fby_id,
              cron_name,
              cron_id,
              function (result) {
                //do nothing
                logger.logError(`Amazon deleteReports`, JSON.stringify(result));
              });

            /* Amazon product loop start */
            var counter = 0;
            for (const productAsin of ProductsList) {
              try {
                let logData = JSON.stringify(productAsin);
                let errorMessage = `${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL} fby_user_id: ${client.fby_user_id}, blank sku: ${productAsin.sku}}`;
                await logger.LogForAlert(
                  fby_id,
                  '',
                  '',
                  errorMessage,
                  logData,
                  constants.LOG_LEVEL.ERROR,
                  constants.FBY_ALERT_CODES.UNKNOWN,
                  constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL,
                  cron_id
                );
              } catch (error) {
                //console.log('\n ERROR: ', error.message);
              }
              try {

                var asin = '';

                if (productAsin.asin != undefined && productAsin.asin != '') {
                  asin = productAsin.asin;
                }
                else if (productAsin.asin1 != undefined && productAsin.asin1 != '') {
                  asin = productAsin.asin1;
                }
                else if (productAsin.asin2 != undefined || productAsin.asin2 != '') {
                  asin = productAsin.asin2;
                }
                else if (productAsin.asin3 != undefined || productAsin.asin3 != '') {
                  asin = productAsin.asin3;
                }

                var product = await sellingPartner.callAPI({
                  operation: 'catalogItems.getCatalogItem',
                  path: {
                    asin: asin
                  },
                  query: {
                    MarketplaceId: client.amazon_MarketPlaceID,
                  },
                  options: {
                    version: 'v0'
                  },
                  endpoint: 'sellers'
                });

                let img = "";
                let flag = 0;
                let barcode = productAsin.asin;
                let title = "";
                if (productAsin.sku == "") {
                  flag = 1;
                  return false;
                }
                if (product.AttributeSets) {
                  for (const detail of product.AttributeSets) {
                    if (detail.SmallImage != undefined && detail.SmallImage.URL)
                      img = detail.SmallImage.URL;
                    if (detail.Title != undefined && detail.Title != "") {
                      title = detail.Title;
                    }
                  }
                }


                let fby_user_id = client.fby_user_id;
                let domain = client.domain;
                let owner_code = client.owner_code;
                let channel = client.channelName;
                let sku = productAsin.sku;
                let item_id = productAsin.asin;
                let item_product_id = productAsin.asin;
                let inventory_item_id = productAsin.asin;
                let inventory_quantity = productAsin.quantity != undefined && productAsin.quantity != '' ? productAsin.quantity : 0;
                let image = img;
                let price = productAsin.price;
                let previous_qty = 0; //#Todo get from db
                let location_id = process.env.DEFAULT_PRODUCT_LOCATION_ID;

                let inputs = [
                  fby_user_id,
                  channel,
                  domain,
                  owner_code,
                  sku,
                  barcode,
                  item_id,
                  title,
                  item_product_id,
                  inventory_item_id,
                  previous_qty,
                  inventory_quantity,
                  image,
                  price,
                  cron_name,
                  cron_id,
                  location_id,
                ];

                counter++;
                //console.log(`\n${counter}) ${urlLogMsg}, sku: ${sku}`, JSON.stringify(inputs));
                //console.log('inputs: ', inputs);
                common.addProduct(
                  inputs,
                  fby_id,
                  cron_name,
                  cron_id,
                  function (result) {
                    if (result.error) {
                      let errmsg = CircularJSON.stringify(result.error);
                      logger.logError(`Amazon getProducts`, errmsg);
                      logger.logError(`${urlLogMsg}, addProduct Error`, errmsg);
                      //mail
                      mail.addProductErrMail(
                        cron_name,
                        cron_id,
                        fby_id,
                        CircularJSON.stringify(result.error)
                      );
                      // store log
                      let inputs = [
                        cron_name,
                        cron_id,
                        constants.QUERY_TYPE,
                        CircularJSON.stringify(result.error),
                        fby_id,
                      ];
                      common.cronErrorLog(
                        inputs,
                        cron_name,
                        cron_id,
                        function (result) {
                          if (result.error) {
                            mail.cronLogErrMail(
                              cron_name,
                              cron_id,
                              fby_id,
                              CircularJSON.stringify(result.error)
                            );
                          }
                        }
                      );
                    }
                  }
                );


              }
              catch (Looperror) {
                let errmsg = CircularJSON.stringify(Looperror);
                //console.log(errmsg);
                //ignore
              }
            }

            /* shopify product loop end */
            let msg = {
              success: {
                message: constants.GET_PRODUCT_SUCCESS,
                data: parsedBody.data,
              },
            };
            set_response[client.domain] = msg;
          })
          .catch(async function (err) {
            let errmsg = CircularJSON.stringify(err);
            //if (errmsg.includes("Request failed with status code 403")) { 
            page_loop = false;
            //}
            logger.logError(`${urlLogMsg}, api catch error`, errmsg);
            try {

              let logData = JSON.stringify(err);
              let errorMessage = `${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL} fby_user_id: ${fby_id}, error : ${err.message}`;
              //console.log(errorMessage);
              await logger.LogForAlert(
                fby_id,
                '',
                '',
                errorMessage,
                logData,
                constants.LOG_LEVEL.ERROR,
                constants.FBY_ALERT_CODES.UNKNOWN,
                constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL,
                cron_id
              );
            }
            catch (error) {
              //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

            }
            if (exist_cron) {
              let inputs = [
                cron_name,
                cron_id,
                constants.CATCH_TYPE,
                CircularJSON.stringify(err),
                fby_id,
                exist_cron,
              ];
              common.fbyCronErrorManage(
                inputs,
                cron_name,
                cron_id,
                function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(
                      cron_name,
                      cron_id,
                      fby_id,
                      CircularJSON.stringify(result.error)
                    );
                  }
                }
              );
              let msg = {
                error: {
                  message: constants.GET_PRODUCT_ERROR,
                  data: CircularJSON.stringify(err),
                },
              };
              set_response[client.domain] = msg;
            } else {
              //mail
              mail.updateOrderErrMail(
                cron_name,
                cron_id,
                fby_id,
                CircularJSON.stringify(err)
              );
              //store update product status error log
              let inputs = [
                cron_name,
                cron_id,
                constants.CATCH_TYPE,
                CircularJSON.stringify(err),
                fby_id,
                exist_cron,
              ];
              common.fbyCronErrorManage(
                inputs,
                cron_name,
                cron_id,
                function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(
                      cron_name,
                      cron_id,
                      fby_id,
                      CircularJSON.stringify(result.error)
                    );
                  }
                }
              );
              let msg = {
                error: {
                  message: constants.GET_PRODUCT_ERROR,
                  data: CircularJSON.stringify(err),
                },
              };
              set_response[client.domain] = msg;
            }
          });


      }

      catch (err) {
        logger.logError(`${urlLogMsg} controller catch error`, err);
      }

    }
  } catch (err) {
    logger.logError(`${urlLogMsg} controller catch error`, err);
  }
  /* shopify account loop end */
  return set_response;
};

exports.pushPriceAmazon = async (
  product,
  user,
  cron_name,
  new_cron_id
) => {
  let skusToPriortize = 'TR_TRV_AGV14990_A2682_CG9,BG_OBG_WDL108_A2682_BJ999,BG_OBG_WDL178_A2682_BJ999,BG_OBG_WDL044_B2689_BJ999,BG_OBG_WDL215_A2682_BJ999,BG_OBG_WDL176_N43_BJ999,BN_BRL_MFO035_D16947_F9,BG_OBG_WDL024_B2689_BJ999,BG_OBG_WDL039_C16949_BJ999,CJ_CRJ_MAL13777_J4673_U2,CJ_CRJ_MAL7173_H3840_Q3,BG_OBG_WDL036_D5371_BJ999'
  let set_response = {};
  let cron_id = new_cron_id;
  let fby_id = user.fby_user_id;
  let counter = 0;
  let productBeingProcessed = "";
  let sku = ''
  let req = null;
  let logMessage = '';
  cron_name = 'PUSH_STOCK_AND_PRICE_CHANNEL';

  var SELLING_PARTNER_APP_CLIENT_ID = await helpers.getDecryptedData(user.username);
  var SELLING_PARTNER_APP_CLIENT_SECRET = await helpers.getDecryptedData(user.api_password);
  var AWS_SELLING_PARTNER_ACCESS_KEY_ID = await helpers.getDecryptedData(user.api_key);
  var AWS_SELLING_PARTNER_SECRET_ACCESS_KEY = await helpers.getDecryptedData(user.secret);
  var Refresh_Token = await helpers.getDecryptedData(user.token);
  var AWS_SELLING_PARTNER_ROLE = user.amazon_Role;

  let SellerID = user.amazon_SellerID;
  let Access_Token = await requestAccessToken(SELLING_PARTNER_APP_CLIENT_ID, Refresh_Token, SELLING_PARTNER_APP_CLIENT_SECRET);

  let cacheKey_Job = `${cron_name},group_code-${user.group_code},owner_code-${user.owner_code}`;
  // `${cron_name}-${fby_id}`;
  let jobRunning = ccCache.get(cacheKey_Job);
  if (jobRunning == undefined || !jobRunning || jobRunning == null) {
    ccCache.set(cacheKey_Job, true);
  }
  else {
    let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_id}.`;
    set_response = {
      sucess: {
        message: msg
      }
    }
    //console.log(msg);
    return set_response;
  }

  let chunkedProducts, chunk = product.length;
  let slice_i = 0;
  let slice_j = slice_i + chunk;
  let chunkCounter = 0;
  let totalProducts = product.length;
  let chunktotal = totalProducts / chunk;

  let sellingPartner = new SellingPartnerAPI({
    region: user.amazon_region,
    refresh_token: Refresh_Token,
    access_token: Access_Token,
    credentials: {
      SELLING_PARTNER_APP_CLIENT_ID: SELLING_PARTNER_APP_CLIENT_ID,
      SELLING_PARTNER_APP_CLIENT_SECRET: SELLING_PARTNER_APP_CLIENT_SECRET,
      AWS_ACCESS_KEY_ID: AWS_SELLING_PARTNER_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: AWS_SELLING_PARTNER_SECRET_ACCESS_KEY,
      AWS_SELLING_PARTNER_ROLE: AWS_SELLING_PARTNER_ROLE
    },
  });

  //#region Update price to amazon 
  /*
  for (slice_i = 0; slice_i < slice_j && slice_j <= totalProducts; slice_i += chunk) {
    chunkCounter++;
    try {
      chunkedProducts = product.slice(slice_i, slice_j);
      logMessage = `fby_user_id: ${fby_id}, chunkCounter: ${chunkCounter}, slice_i: ${slice_i}, slice_j: ${slice_j}, chunkTotal:${chunktotal}, ${cron_name}`;
      //console.log(`\n${chunkCounter}) fby_user_id: ${fby_id}, totalProducts: ${totalProducts}, chunkTotal:${chunktotal}`);
      //console.log('slice_i: ', slice_i);
      //console.log('slice_j: ', slice_j);
      if (slice_j + chunk > totalProducts) {
        //chunk = totalProducts - slice_j;
        slice_j = totalProducts;
        //slice_i++;
      }
      else if (slice_j < totalProducts) {
        slice_j = slice_j + chunk;
        //slice_i++;
      }

      let messageNode = `<Message><MessageID>##MessageID##</MessageID><Inventory><SKU>##SKU##</SKU><Quantity>##quantity##</Quantity></Inventory></Message>`;
      let messageNodeNodes = '';
      let skuAndPrice = '';
      for await (const itemlist of chunkedProducts) {
        try {
          let messageNodeSKU = messageNode;
          let messageID = `${fby_id}${itemlist.skuId}`; //${moment().format('YYYYMMDDHHmmss')}`;
          if (skuAndPrice != '') {
            skuAndPrice = `${skuAndPrice},${itemlist.skuCode}:${itemlist.fullPrice}`;
          }
          else {
            skuAndPrice = `${itemlist.skuCode}:${itemlist.fullPrice}`;
          }
          messageNodeSKU = messageNodeSKU
            .replace('##SKU##', itemlist.skuCode)
            .replace('##price##', itemlist.price)
            .replace('##MessageID##', messageID);

          messageNodeNodes = messageNodeNodes + messageNodeSKU;

          //patchListingsItem
          sku = itemlist.skuCode;
          let price = itemlist.fullPrice
          //console.log(`\n${counter}) ${logMessage}, sku ${sku}, quantity ${qty}`);


          try {
            await logger.LogForAlert(
              fby_id,
              '',
              sku,
              `${logMessage}, sku ${sku}, price ${price} `,
              itemlist,
              constants.LOG_LEVEL.INFO,
              constants.FBY_ALERT_CODES.PRICE_SYNC,
              cron_name,
              cron_id
            );
          }
          catch (error) {
            //console.log('');
            //console.log(error);
            //console.log('');

          }
          if (skusToPriortize.includes(sku)) {
            let reposss = await sellingPartner.callAPI({
              operation: 'patchListingsItem',
              endpoint: 'listingsItems',
              path: {
                sellerId: SellerID,
                sku: sku
              },
              query: {
                marketplaceIds: [user.amazon_MarketPlaceID]
              },
              body:
              {
                productType: "PRODUCT",
                operationType: "PATCH",
                marketplaceIds: [user.amazon_MarketPlaceID],
                patches: [
                  {
                    op: "replace",
                    operation_type: "PARTIAL_UPDATE",
                    path: "/attributes/purchasable_offer",
                    value: [
                      {
                        marketplace_id: 'XXXXXXXXXX',
                        currency: 'USD',
                        our_price: [
                          {
                            schedule: [
                              {
                                value_with_tax: price
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            });

            //console.log(reposss);
            await logger.LogForAlert(
              fby_id,
              '',
              sku,
              `${logMessage}, sku ${sku}, price ${price} `,
              reposss,
              constants.LOG_LEVEL.INFO,
              constants.FBY_ALERT_CODES.STOCK_SYNC,
              cron_name,
              cron_id
            );
          }

        }
        catch (error) {
          //console.log(`\n${logMessage}, sku ${sku}\nAmazon batch creation error ${error.message}\n${JSON.stringify(itemlist)}`);
        }
        counter++;
      }
      counter = 1;

    }
    catch (error) {
      //console.log(`Amazon batch creation error ${error.message}`);
    }
    // products loop end


  }
  //batch end
*/
  //#endregion

  return set_response;
};

exports.requestAccessToken = requestAccessToken;

exports.logTofile = async function (filename, data) {
  try {
    let filePath = (PATH.resolve(__dirname, filename))
      .replace('services', 'files\\amazon-stock-update');

    if (typeof (data) !== 'string') {
      data = JSON.stringify(data);
    }

    await fs.writeFileSync(filePath, data, 'utf8', function (err) {
      if (err) {
        // console.log(err)
      };
    });

  }
  catch (error) {
    //console.log(error);
  }
}