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
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const CircularJSON = require('circular-json');
axios.defaults.timeout = constants.WOOCOMMERCE_API_TIMEOUT;
const fbyService = require("./fby_service");
const NodeCache = require("node-cache");
const ccCache = new NodeCache({ stdTTL: 3000, checkperiod: 300 });
const Entities = require("../entities/Entities");
const dbCCLogs = require('../startup/dbcclogs');
const urlencode = require('urlencode');

// const WooCommerce = new WooCommerceRestApi({
//   url: 'https://shop170.altervista.org/', // Your store URL
//   consumerKey: 'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
//   consumerSecret: 'cs_b01afbdc2a825c11d716eba2de0f4c2672ccf1af', // Your consumer secret
//   version: 'wc/v3' // WooCommerce WP REST API version
// });

let uuid = v4;

exports.getProducts = async (
  result,
  exist_cron,
  fby_id,
  cron_name,
  cron_id
) => {
  let set_response = {};
  let urlLogMsg = `woocommerce getProducts fby_user_id: ${fby_id}`;
  cron_name = constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL;
  let infoMessage = `fby_user_id: ${fby_id}, ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL}`;

  try {
    /* shopify account loop start */
    for await (const client of result) {
      let Key = await helpers.getDecryptedData(client.api_key); //'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
      let Secret = await helpers.getDecryptedData(client.secret); // Your consumer secret
      let Domain = await helpers.getWoocommerceDomain(client.domain);


      const WooCommerce = new WooCommerceRestApi({
        url: Domain, //'https://shop170.altervista.org/', // Your store URL
        consumerKey: Key, //'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
        consumerSecret: Secret, // Your consumer secret
        version: constants.WOOCOMMERCE_API_VERSION, // WooCommerce WP REST API version
        timeout: constants.WOOCOMMERCE_API_TIMEOUT
      });

      let page_loop = true;
      let page_no = 1;
      let count = 0;
      let isNextPage = true;
      let nextPageLink = '';

      while (page_loop) {
        //helpers.sleep();
        let enpointurl = `products/?page=${page_no}&per_page=100&consumer_key=${Key}&consumer_secret=${Secret}`;

        // Single product url
        //let enpointurl = `product/24225?consumer_key=${Key}&consumer_secret=${Secret}`;

        if (fby_id == 27) {
          let productSyncDateTime = moment();
          productSyncDateTime = moment('2020-01-01');
          productSyncDateTime = productSyncDateTime.format(MOMENT_DATE_FORMAT);
          enpointurl = `${enpointurl}&after=${productSyncDateTime}`;
        }
        console.log(`\n${moment().format(MOMENT_DATE_FORMAT)}\t${urlLogMsg}, page: `, page_no);
        try {
          await WooCommerce.get(
            enpointurl
          )
            .then(async function (parsedBody) {
              let resmsg = CircularJSON.stringify(parsedBody.data);

              try {
                try {
                  if (parsedBody && parsedBody.headers && parsedBody.headers.link && parsedBody.headers.link != undefined && parsedBody.headers.link != null) {
                    let split = parsedBody.headers.link.split(',');

                    nextPageLink = '';
                    isNextPage = false;

                    for (let link of split) {
                      if (link && link.includes("next")) {
                        nextPageLink = link.replace('<', '').replace('>;', '').replace('rel=\"next\"', '').trim();
                        isNextPage = true;

                      }

                    }

                  }
                  else {
                    nextPageLink = '';
                    isNextPage = false;

                  }
                  enpointurl = nextPageLink;

                }
                catch (error) {
                  nextPageLink = '';
                  isNextPage = false;
                }


                infoMessage = `${infoMessage}, ${enpointurl}`;
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
              }
              catch (error) {
                //console.log('\n ERROR: ', error.message);
              }
              if (!resmsg.includes('<!DOCTYPE html>')) {
                // //console.log('parsedBody: ', resmsg);
                //console.log('\n parsedBody.data.length: ', parsedBody.data.length);

                if (parsedBody && parsedBody.data && parsedBody.data.length == 0) {
                  page_loop = false;
                  return set_response;
                }

                page_no = page_no + 1;
                logger.logInfo(`${urlLogMsg}`, resmsg);

                //process individual products
                //let arr = [];
                //arr.push(parsedBody.data);

                // //console.log('parsedBody: ', parsedBody.data);
                /* Woocommerce product loop start */
                for await (const product of parsedBody.data) {
                  try {
                    let logData = JSON.stringify(product);
                    let errorMessage = `${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL} fby_user_id: ${client.fby_user_id}, blank sku: ${product.sku}}`;
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
                    if (count == 1 || count == parsedBody.data.length - 1) {
                      //console.log(`\n${count++}/ ${parsedBody.data.length}) ${urlLogMsg}, product.sku: ${product.sku}`);
                    }
                    let img = "";
                    let flag = 0;
                    let barcode;
                    if (product.id == "") {
                      flag = 1;
                      return false;
                    }
                    if (product.images) {
                      for (const imgdetail of product.images) {
                        img = imgdetail.src;
                      }
                    }

                    if (!product.ean_code) {
                      barcode = "";
                    } else {
                      barcode = product.ean_code;
                      //console.log('product.ean13: ', product.ean13);
                    }

                    if (product.meta_data != undefined
                      && product.meta_data != null
                      && Array.isArray(product.meta_data)
                    ) {
                      for (const metadetail of product.meta_data) {
                        if (metadetail != null
                          && metadetail.key != undefined
                          && metadetail.key != null
                          && metadetail.key.includes("ean")

                        ) {
                          barcode = metadetail.value;
                          break;
                        }
                      }

                    }

                    let fby_user_id = client.fby_user_id;
                    let domain = client.domain;
                    let owner_code = client.owner_code;
                    let channel = client.channelName;
                    let sku = product.sku;
                    let item_id = product.id;
                    let title = product.name;
                    let item_product_id = product.id;
                    let inventory_item_id = product.id;
                    let inventory_quantity = product.stock_quantity;
                    let image = img;
                    let price = product.price;
                    //need to confirm
                    let status = product.status;
                    let previous_qty = 0; //#Todo get from db
                    let location_id = process.env.DEFAULT_PRODUCT_LOCATION_ID;

                    let inputs = [
                      fby_user_id,
                      channel,
                      domain,
                      owner_code,
                      sku || '',
                      barcode || '',
                      item_id,
                      title,
                      item_product_id,
                      inventory_item_id,
                      previous_qty || 0,
                      inventory_quantity || 0,
                      image,
                      price,
                      cron_name,
                      cron_id,
                      location_id,
                    ];


                    //console.log('inputs: ', inputs);
                    await common.addProduct(
                      inputs,
                      fby_id,
                      cron_name,
                      cron_id,
                      function (result) {
                        if (result.error) {
                          let errmsg = CircularJSON.stringify(result.error);
                          logger.logError(`Woocommerce getProducts`, errmsg);
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

                    if (
                      product.variations != "" &&
                      product.variations != undefined &&
                      product.variations.length > 0
                    ) {
                      let productid = product.id;
                      await getproductvariations(
                        client,
                        productid,
                        exist_cron,
                        fby_id,
                        cron_name,
                        cron_id,
                        async function (prodDetails) {
                          if (!prodDetails.error) {
                            for await (const variationdetail of prodDetails) {
                              let sku_variant = variationdetail.sku;
                              // //console.log(`${fby_id} variation sku: `, sku);
                              if (
                                variationdetail.image != "" &&
                                variationdetail.image != undefined &&
                                variationdetail.image.src != "" &&
                                variationdetail.image.src != undefined
                              ) {
                                image = variationdetail.image.src;
                              }
                              price =
                                variationdetail.price != ""
                                  ? parseFloat(variationdetail.price)
                                  : 0;
                              status = variationdetail.status;
                              item_id = variationdetail.id;
                              item_product_id = productid;
                              inventory_item_id = variationdetail.id;
                              inventory_quantity = variationdetail.stock_quantity;

                              if (variationdetail.meta_data != undefined
                                && variationdetail.meta_data != null
                                && Array.isArray(variationdetail.meta_data)
                              ) {
                                for (const metadetail of variationdetail.meta_data) {
                                  if (metadetail != null
                                    && metadetail.key != undefined
                                    && metadetail.key != null
                                    && metadetail.key.includes("ean")

                                  ) {
                                    barcode = metadetail.value;
                                    break;
                                  }
                                }

                              }

                              //insert products variant got from shopify into products table
                              let inputs = [
                                fby_user_id,
                                channel,
                                domain,
                                owner_code,
                                sku_variant,
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

                              //console.log`\n ${fby_id} variation sku: ${sku}`, CircularJSON.stringify(inputs));

                              common.addProduct(
                                inputs,
                                fby_id,
                                cron_name,
                                cron_id,
                                function (result) {
                                  if (result.error) {
                                    let errmsg = CircularJSON.stringify(result.error);
                                    logger.logError(
                                      `Woocommerce getProducts`,
                                      errmsg
                                    );
                                    logger.logError(
                                      `${urlLogMsg}, addProduct Error`,
                                      errmsg
                                    );
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
                          } else if (prodDetails.error) {
                            let errJson = CircularJSON.stringify(prodDetails.error);
                            logger.logInfo(
                              `${urlLogMsg}, getproductvariations Info`,
                              errJson
                            );
                          }
                        }
                      );
                    }

                    // else {
                    //   let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, previous_qty, inventory_quantity, image, price, cron_name, cron_id, location_id];
                    //   //console.log('inputs: ', inputs);
                    //   common.addProduct(inputs, fby_id, cron_name, cron_id, function (result) {
                    //     if (result.error) {
                    //       let errmsg = CircularJSON.stringify(result.error);
                    //       logger.logError(`Woocommerce getProducts`, errmsg);
                    //       logger.logError(`${urlLogMsg}, addProduct Error`, errmsg);
                    //       //mail
                    //       mail.addProductErrMail(cron_name, cron_id, fby_id, CircularJSON.stringify(result.error));
                    //       // store log
                    //       let inputs = [cron_name, cron_id, constants.QUERY_TYPE, CircularJSON.stringify(result.error), fby_id];
                    //       common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                    //         if (result.error) {
                    //           mail.cronLogErrMail(cron_name, cron_id, fby_id, CircularJSON.stringify(result.error));
                    //         }
                    //       });
                    //     }
                    //   });
                    // }
                  }
                  catch (err) {
                    let errmsg = CircularJSON.stringify(err);
                    //console.log(`${urlLogMsg}, api catch error`, errmsg);
                  }
                }
                /* shopify product loop end */
                let msg = {
                  success: {
                    message: constants.GET_PRODUCT_SUCCESS,
                    data: fby_id,
                  },
                };
                set_response[client.domain] = msg;

              } else {
                page_loop = false;
              }

            })
            .catch(async function (err) {
              let errmsg = CircularJSON.stringify(err);
              //if (errmsg.includes("Request failed with status code 403")) { 
              page_loop = false;
              //}
              //console.log(`${urlLogMsg}, api catch error`, errmsg);
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

                let msg = {
                  error: {
                    message: constants.GET_PRODUCT_ERROR,
                    data: CircularJSON.stringify(err.message),
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

                let msg = {
                  error: {
                    message: constants.GET_PRODUCT_ERROR,
                    data: err.message,
                  },
                };
                set_response[client.domain] = msg;
              }
            });


        }

        catch (err) {
          //console.log(`${urlLogMsg} controller catch error`, err.message);
        }
      }
    }

    await common.addProductPostOpeartion(fby_id);
  } catch (err) {
    //console.log(`${urlLogMsg} controller catch error`, err.message);
  }
  /* shopify account loop end */
  return set_response;
};

const getproductdetails = async (
  Woocommerceclient,
  uid,
  exist_cron,
  fby_id,
  cron_name,
  cron_id,
  callback
) => {
  //let apiEndpoint = `${constants.Woocommerce_Get_ProductDetails}${uid}`;
  let urlLogMsg = `Woocommerce getproductdetails fby_user_id: ${fby_id}`;
  try {
    let Key = await helpers.getDecryptedData(Woocommerceclient.api_key);
    let Secret = await helpers.getDecryptedData(Woocommerceclient.secret);
    let Domain = await helpers.getWoocommerceDomain(Woocommerceclient.domain);
    const WooCommerce = new WooCommerceRestApi({
      url: Domain, //'https://shop170.altervista.org/', // Your store URL
      consumerKey: Key, //'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
      consumerSecret: Secret, // Your consumer secret
      version: "wc/v3", // WooCommerce WP REST API version
      timeout: constants.WOOCOMMERCE_API_TIMEOUT,
    });
    await WooCommerce.get(
      `products/${uid}?consumer_key=${Key}&consumer_secret=${Secret}`
    )
      .then(function (productdetails) {
        let resmsg = CircularJSON.stringify(productdetails.data);
        logger.logInfo(`${urlLogMsg}`, resmsg);
        if (productdetails.data.error) {
          if (exist_cron) {
            let inputs = [
              cron_name,
              cron_id,
              constants.CATCH_TYPE,
              CircularJSON.stringify(productdetails.data.error),
              fby_id,
              exist_cron,
            ];

            let msg = {
              error: {
                message: constants.GET_PRODUCT_ERROR,
                data: CircularJSON.stringify(productdetails.data.error),
              },
            };
            return callback(msg);
          } else {
            //mail
            mail.getProdErrMail(
              cron_name,
              cron_id,
              fby_id,
              CircularJSON.stringify(productdetails.data.error)
            );
            //store update product status error log
            let inputs = [
              cron_name,
              cron_id,
              constants.CATCH_TYPE,
              CircularJSON.stringify(productdetails.data.error),
              fby_id,
              exist_cron,
            ];

            let msg = {
              error: {
                message: constants.GET_PRODUCT_ERROR,
                data: CircularJSON.stringify(productdetails.data.error),
              },
            };
            return callback(msg);
          }
        } else {
          return callback(productdetails.data);
        }
      })
      .catch(function (err) {
        logger.logError(`${urlLogMsg} api catch error`, err);
        if (exist_cron) {
          let inputs = [
            cron_name,
            cron_id,
            constants.CATCH_TYPE,
            CircularJSON.stringify(err),
            fby_id,
            exist_cron,
          ];

          let msg = {
            error: {
              message: constants.GET_PRODUCT_ERROR,
              data: err.message,
            },
          };
          return callback(msg);
        } else {
          //mail
          mail.getProdErrMail(cron_name, cron_id, fby_id, CircularJSON.stringify(err));
          //store update product status error log
          let inputs = [
            cron_name,
            cron_id,
            constants.CATCH_TYPE,
            CircularJSON.stringify(err),
            fby_id,
            exist_cron,
          ];

          let msg = {
            error: {
              message: constants.GET_PRODUCT_ERROR,
              data: err.message,
            },
          };
          return callback(msg);
        }
      });
  } catch (err) {
    //console.log(`${urlLogMsg} controller catch error`, err.message);
  }
};

const getproductvariations = async (
  Woocommerceclient,
  uid,
  exist_cron,
  fby_id,
  cron_name,
  cron_id,
  callback
) => {
  let urlLogMsg = `Woocommerce getproductvariations fby_user_id: ${fby_id}`;
  //console.log('\nSTARTED : ', urlLogMsg);
  try {
    let Key = await helpers.getDecryptedData(Woocommerceclient.api_key); //'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
    let Secret = await helpers.getDecryptedData(Woocommerceclient.secret); // Your consumer secret
    let Domain = await helpers.getWoocommerceDomain(Woocommerceclient.domain);
    const WooCommerce = new WooCommerceRestApi({
      url: Domain, //'https://shop170.altervista.org/', // Your store URL
      consumerKey: Key, //'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
      consumerSecret: Secret, // Your consumer secret
      version: "wc/v3", // WooCommerce WP REST API version
      timeout: constants.WOOCOMMERCE_API_TIMEOUT,
    });

    let variationsArr = [];
    let page_loop = true;
    let page_no = 1;
    let variationsUtl = "";
    while (page_loop) {
      variationsUtl = `products/${uid}/variations?page=${page_no}&consumer_key=${Key}&consumer_secret=${Secret}`;
      //console.log(`\n ${uid} \t Page ${page_no} \t variations`);
      try {
        helpers.sleep();
        await WooCommerce.get(
          variationsUtl
        )
          .then(function (productdetails) {
            let resmsg = CircularJSON.stringify(productdetails.data);

            //console.log(`\nVariation response for ${variationsUtl}\n`, resmsg);

            if (productdetails.data != undefined
              && productdetails.data.length != undefined
              && Array.isArray(productdetails.data)
              && productdetails.data.length == 0) {
              //console.log(`\n ${urlLogMsg}, ${variationsUtl} \nproductdetails.data.length ${productdetails.data.length}`);
              page_loop = false;
              let msg = {
                error: {
                  message: constants.GET_PRODUCT_LOOP_FINISHED,
                  data: CircularJSON.stringify(productdetails.data.error),
                },
              };
              return callback(msg);
            }

            //page_no = page_no + 1;
            logger.logInfo(`${urlLogMsg}`, resmsg);
            if (productdetails.data.error) {
              //console.log(`${urlLogMsg} productdetails.data.error: \n`, JSON.stringify(productdetails.data.error));
              if (exist_cron) {
                let inputs = [
                  cron_name,
                  cron_id,
                  constants.CATCH_TYPE,
                  CircularJSON.stringify(productdetails.data.error),
                  fby_id,
                  exist_cron,
                ];

                let msg = {
                  error: {
                    message: constants.GET_PRODUCT_ERROR,
                    data: CircularJSON.stringify(productdetails.data.error),
                  },
                };
                return callback(msg);
              } else {
                //mail
                mail.getProdErrMail(
                  cron_name,
                  cron_id,
                  fby_id,
                  CircularJSON.stringify(productdetails.data.error)
                );
                //store update product status error log
                let inputs = [
                  cron_name,
                  cron_id,
                  constants.CATCH_TYPE,
                  CircularJSON.stringify(productdetails.data.error),
                  fby_id,
                  exist_cron,
                ];

                let msg = {
                  error: {
                    message: constants.GET_PRODUCT_ERROR,
                    data: CircularJSON.stringify(productdetails.data.error),
                  },
                };
                return callback(msg);
              }
            } else {
              variationsArr = variationsArr.concat(productdetails.data);
              //console.log'\n variations data for product : \n');
              //console.logproductdetails.data);
            }
          })
          .catch(function (err) {
            //console.log(`${urlLogMsg} api catch error`, CircularJSON.stringify(err));
            if (exist_cron) {
              let inputs = [
                cron_name,
                cron_id,
                constants.CATCH_TYPE,
                CircularJSON.stringify(err),
                fby_id,
                exist_cron,
              ];

              let msg = {
                error: {
                  message: constants.GET_PRODUCT_ERROR,
                  data: CircularJSON.stringify(err),
                },
              };
              return callback(msg);
            } else {
              //mail
              mail.getProdErrMail(
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

              let msg = {
                error: {
                  message: constants.GET_PRODUCT_ERROR,
                  data: CircularJSON.stringify(err),
                },
              };
              return callback(msg);
            }
          });
      } catch (err) {
        //console.log(`\n${urlLogMsg} catch error\n`);
        //console.log(err);
        if (page_no > 3) {
          page_loop = false;
        }
      }
      page_no = page_no + 1;
    }
    //console.log`\n${urlLogMsg} variationsArr \n`, CircularJSON.stringify(variationsArr));
    return await callback(variationsArr);

  } catch (err) {
    //console.log(`\n${urlLogMsg} controller catch error`, err);
  }
};

// const getproductImages = async (Woocommerceclient, uid, exist_cron, fby_id, cron_name, cron_id, callback) => {
//   await axios({
//     url: `${constants.Woocommerce_Product_Images}${uid}`,
//     method: "get",
//     headers: {
//       key: Woocommerceclient.api_key,//"5dee7388e6281f7d88008ae0809162381c3cd7cd2350053061fa1ef83ae9e742031971",
//       exchange: Woocommerceclient.secret//"5bb85add137db786f696dffbe90629d5c63a4b6ca7e320a060d5cf31b1def918"
//     }
//   })
//     .then(function (images) {
//       if (images.data.error) {
//         let errjson = CircularJSON.stringify(images.data.error);
//         if (exist_cron) {
//           let inputs = [cron_name, cron_id, constants.CATCH_TYPE, CircularJSON.stringify(images.data.error), fby_id, exist_cron];
//           common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
//             if (result.error) {
//               mail.cronLogErrMail(cron_name, cron_id, fby_id, CircularJSON.stringify(result.error));
//             }
//           })
//           let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: errjson } };
//           return callback(msg);
//         } else {
//           //mail
//           mail.getProdErrMail(cron_name, cron_id, fby_id, errjson);
//           //store update product status error log
//           let inputs = [cron_name, cron_id, constants.CATCH_TYPE, errjson, fby_id, exist_cron];
//           common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
//             if (result.error) {
//               mail.cronLogErrMail(cron_name, cron_id, fby_id, CircularJSON.stringify(result.error));
//             }
//           })
//           let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: errjson } };
//           return callback(msg);
//         }
//       }
//       else {
//         return callback(images.data);
//       }
//     })
//     .catch(function (err) {
//       if (exist_cron) {
//         let inputs = [cron_name, cron_id, constants.CATCH_TYPE, CircularJSON.stringify(err), fby_id, exist_cron];
//         common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
//           if (result.error) {
//             mail.cronLogErrMail(cron_name, cron_id, fby_id, CircularJSON.stringify(result.error));
//           }
//         })
//         let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: CircularJSON.stringify(err) } };
//         return callback(msg);
//       } else {
//         //mail
//         mail.getProdErrMail(cron_name, cron_id, fby_id, CircularJSON.stringify(err));
//         //store update product status error log
//         let inputs = [cron_name, cron_id, constants.CATCH_TYPE, CircularJSON.stringify(err), fby_id, exist_cron];
//         common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
//           if (result.error) {
//             mail.cronLogErrMail(cron_name, cron_id, fby_id, CircularJSON.stringify(result.error));
//           }
//         })
//         let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: CircularJSON.stringify(err) } };
//         return callback(msg);
//       }
//     });
// }

//NOT USED
exports.insertSku = async (
  product,
  exist_cron,
  cron_name,
  cron_id,
  callback
) => {
  //  //console.log("312 insertSku product: ", product);
  let set_response = {};
  let skus = {
    sku: product.sku,
    //"ean": product.barcode,
    title: product.title,
    tax_profile: "-----",
    //"partnerItemId": `${product.item_id}`,
    //"partnerItemCode": `${product.item_product_id}`,
    //"image": product.image,
    //"inventory_item_id": `${product.inventory_item_id}`,
    stock_count: 1,
    price: product.price,
    final_price: product.price,
    status: product.status,
    data: {
      ean13: 1234567892,
    },
  };
  let fby_id = product.fby_user_id;
  let sku = product.sku;

  //api for inserting skus
  await axios({
    url: `${constants.Woocommerce_Add_Product}`,
    method: "put",
    skus,
    headers: {
      key: helpers.getDecryptedData(Woocommerceclient.api_key), //"5dee7388e6281f7d88008ae0809162381c3cd7cd2350053061fa1ef83ae9e742031971",
      exchange: helpers.getDecryptedData(Woocommerceclient.secret), //"5bb85add137db786f696dffbe90629d5c63a4b6ca7e320a060d5cf31b1def918"
    },
  })
    .then((result) => {
      try {
        logger.logInfo(
          "Woocommerce insertsku response: ",
          CircularJSON.stringify(result.data)
        );
        if (Object.values(result.data.success) == "Ok") {
          let updt_time = dateTime.create();
          let inputs = [
            fby_id,
            sku,
            cron_name,
            cron_id,
            updt_time.format("Y-m-d H:M:S"),
            "",
            "",
            "",
            "",
          ];
          common.updateProductStatus(
            inputs,
            fby_id,
            cron_name,
            cron_id,
            function (result) {
              if (result.error) {
                //mail
                mail.updateProductErrMail(
                  cron_name,
                  cron_id,
                  fby_id,
                  CircularJSON.stringify(result.error)
                );
                //store update product status error log
                let inputs = [
                  cron_name,
                  cron_id,
                  constants.CATCH_TYPE,
                  CircularJSON.stringify(result.data),
                  fby_id,
                ];

              }
            }
          );
          // set response
          let msg = {
            success: {
              message: constants.FBY_SKUINSERT_SUCCESS,
              data: CircularJSON.stringify(result.data),
            },
          };
          set_response[sku] = msg;
        } else {
          mail.skuInsertMail(
            cron_name,
            cron_id,
            fby_id,
            CircularJSON.stringify(result.data)
          );
          //store sku insert response catch log
          inputs = [
            cron_name,
            cron_id,
            constants.CATCH_TYPE,
            CircularJSON.stringify(result.data),
            fby_id,
          ];

          //set response
          let msg = {
            error: {
              message: constants.FBY_SKUINSERT_ERROR,
              data: CircularJSON.stringify(result.data.errors),
            },
          };
          set_response[sku] = msg;
        }
      } catch (error) {
        logger.logError("Woocommerce insertsku error: ", CircularJSON.stringify(error));

        if (result.data.errors) {
          if (exist_cron) {
            /* Update products count=count+1 and update error log */
            let updt_time = dateTime.create();
            let inputs = [
              fby_id,
              sku,
              exist_cron,
              cron_name,
              cron_id,
              constants.CATCH_TYPE,
              CircularJSON.stringify(result.data.errors),
              updt_time.format("Y-m-d H:M:S"),
            ];

            //set response
            let msg = {
              error: {
                message: constants.FBY_SKUINSERT_ERROR,
                data: CircularJSON.stringify(result.data.errors),
              },
            };
            set_response[sku] = msg;
          } else {
            let updt_time = dateTime.create();
            let inputs = [
              fby_id,
              sku,
              exist_cron,
              cron_name,
              cron_id,
              constants.CATCH_TYPE,
              CircularJSON.stringify(result.data.errors),
              updt_time.format("Y-m-d H:M:S"),
            ];
            /* Update products count=count+1 and flag 1 */

            //store sku insert response catch log
            inputs = [
              cron_name,
              cron_id,
              constants.CATCH_TYPE,
              CircularJSON.stringify(result.data),
              fby_id,
            ];

            //set response
            let msg = {
              error: {
                message: constants.FBY_SKUINSERT_ERROR,
                data: CircularJSON.stringify(result.data.errors),
              },
            };
            set_response[sku] = msg;
          }
        }
      }
    })
    .catch((error) => {
      logger.logError("Woocommerce insertsku erro : ", CircularJSON.stringify(error));
      if (exist_cron) {
        /* Update products count=count+1 and update error log */
        let updt_time = dateTime.create();
        let inputs = [
          fby_id,
          sku,
          exist_cron,
          cron_name,
          cron_id,
          constants.CATCH_TYPE,
          CircularJSON.stringify(error),
          updt_time.format("Y-m-d H:M:S"),
        ];

        //set response
        let msg = { error: { data: error.message } };
        set_response[sku] = msg;
      } else {
        let updt_time = dateTime.create();
        let inputs = [
          fby_id,
          sku,
          exist_cron,
          cron_name,
          cron_id,
          constants.CATCH_TYPE,
          CircularJSON.stringify(error),
          updt_time.format("Y-m-d H:M:S"),
        ];
        /* Update products count=count+1 and flag 1 */

        //set response
        let msg = { error: { data: error.message } };
        set_response[sku] = msg;
      }
    });

  return callback(set_response);
};

//NOT USED
exports.getStockList = async (
  shopifyAccount,
  req,
  exist_cron,
  fby_id,
  cron_name,
  cron_id,
  callback
) => {
  let set_response = {};
  let page = 1;
  let total_page = 0;
  let count = 1;

  let ownerCode = shopifyAccount.owner_code;
  let groupCode = shopifyAccount.group_code;
  let item_per_page = constants.FBY_PERPAGE;

  await WooCommerce.get(
    `products/${uid}?consumer_key=${Key}&consumer_secret=${Secret}`
  )
    .then(async function (response) {
      logger.logInfo(
        "Woocommerce getStockList :",
        CircularJSON.stringify(response.data)
      );
      if (response.data.error) {
        //mail
        let errormsg = CircularJSON.stringify(response.data);
        //console.log(`Woocommerce getStockList url: ${url}`, errormsg);

        set_response = { error: { key: fby_id, data: response.data } };
      } else {
        count++;
        // add to products !
        //let items = response.data;
        // response.data.forEach(async (item) => {
        for await (let item of response.data) {
          counter++;
          let itemEan = "";
          try {
            await getproductdetails(
              item.uid,
              exist_cron,
              fby_id,
              cron_name,
              cron_id,
              function (prodDetails) {
                if (!prodDetails.error) {
                  itemEan = prodDetails.data.ean13;
                  //inventory_quantity = prodDetails.stockCount;
                }
              }
            );

            let item_arr = [
              item.sku,
              item.uid,
              itemEan,
              item.quantity,
              1,
              cron_id,
            ];
            await helpers.sleep();
            await common.addStock(item_arr, fby_id, function (result) {
              if (result.error) {

                // store add stock error log
                let inputs = [
                  cron_name,
                  cron_id,
                  constants.QUERY_TYPE,
                  CircularJSON.stringify(result.error),
                  fby_id,
                ];

              }
            });
          }
          catch (error) {
            //console.log('\nERROR While common.addStock: \n', error.message);

          }
        };
      }
    })
    .catch(function (error) {
      let errormsg = error.message;
      //console.log(`\nWoocommerce getStockList\n`, errormsg);
      let msg = {
        error: {
          message: constants.FBY_GETSTOCK_ERROR,
          data: errormsg,
        },
      };
      set_response[shopifyAccount.domain] = msg;

    });
  set_response = { success: { data: constants.FBY_GETSTOCK_SUCCESS } };
  // update product Quantity
  let updt_time = dateTime.create();
  let inputs = [cron_name, cron_id, updt_time.format("Y-m-d H:M:S")];
  common.updateProduct(inputs, fby_id, cron_name, cron_id, function (result) {
    if (result.error) {
      //mail or log
      mail.updateProductErrMail(
        cron_name,
        cron_id,
        fby_id,
        CircularJSON.stringify(result.error)
      );
      // store update product error log
      let inputs = [
        cron_name,
        cron_id,
        constants.QUERY_TYPE,
        CircularJSON.stringify(result.error),
        fby_id,
      ];
      common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronLogErrMail(
            cron_name,
            cron_id,
            fby_id,
            CircularJSON.stringify(result.error)
          );
        }
      });
    }
  });

  return callback(set_response);
};

exports.pushProductsWoocommerce = async (
  product,
  user,
  cron_name,
  new_cron_id
) => {
  let set_response = {};
  cron_name = constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL;
  let fby_id = user.fby_user_id;
  let counter = 1;
  let productBeingProcessed = "";
  let sku = '';
  let fby_user_id = fby_id;
  let logMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;

  let cacheKey_Job = `${constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL},group_code-${user.group_code},owner_code-${user.owner_code}`;
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

  try {
    //console.log('woocommerce stock udpate pushProductsWoocommerce stockdata: \n', CircularJSON.stringify(stockdata));
    let Key = await helpers.getDecryptedData(user.api_key); //'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
    let Secret = await helpers.getDecryptedData(user.secret); // Your consumer secret
    let Domain = await helpers.getWoocommerceDomain(user.domain);

    const WooCommerce = new WooCommerceRestApi({
      url: Domain, //'https://shop170.altervista.org/', // Your store URL
      consumerKey: Key, //'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
      consumerSecret: Secret, // Your consumer secret
      version: constants.WOOCOMMERCE_API_VERSION, // WooCommerce WP REST API 
      axiosConfig: constants.AXIOS_CONFIG_WOOCOMMERCE_HEADERS, //Override Methods headers
      timeout: constants.WOOCOMMERCE_API_TIMEOUT,
    });


    /* products loop start */
    for await (const itemlist of product) {
      try {
        sku = itemlist.sku;
        logMessage = `fby_user_id: ${fby_user_id}, sku: ${sku}, ${cron_name}`;

        productBeingProcessed = `${counter}/${product.length}) ${logMessage}`;

        if (counter % 50 == 0 || counter == 1 || counter == product.length) {
          //console.log(`\n${productBeingProcessed}`);
        }

        let cron_id = new_cron_id;
        let exist_cron = 0;
        if (itemlist.cron_name == cron_name && itemlist.cron_id) {
          cron_id = itemlist.cron_id;
          exist_cron = 1;
        }



        //console.log('itemlist.sku : ', itemlist.sku);

        // instock, outofstock
        let stockStatus = "outofstock";
        if (itemlist.inventory_quantity > 0) {
          stockStatus = "instock";
        }

        let stockdata = {
          stock_quantity: itemlist.inventory_quantity,
          stock_status: stockStatus,
          manage_stock: true,
        };

        let updateRequestUrl = `products/${itemlist.item_id}?consumer_key=${Key}&consumer_secret=${Secret}&stock_quantity=${itemlist.inventory_quantity}&stock_status=${stockStatus}&manage_stock=${true}`;

        if (itemlist.item_id != itemlist.item_product_id
          && itemlist.item_product_id > 0
          && itemlist.item_id > 0
        ) {
          updateRequestUrl = `products/${itemlist.item_product_id}/variations/${itemlist.item_id}?consumer_key=${Key}&consumer_secret=${Secret}&stock_quantity=${itemlist.inventory_quantity}&stock_status=${stockStatus}&manage_stock=${true}`;
        }

        // url for logs only and try on postman
        let urlWithDomain = `${Domain}wp-json/wc/v3/${updateRequestUrl}`;

        let requestProductDetails =
        {
          seq: counter,
          type: 'REQUEST',
          url: urlWithDomain,
          product_id: itemlist.item_id,
          sku: itemlist.sku,
          item_product_id: itemlist.item_product_id,
          is_product: itemlist.item_id == itemlist.item_product_id,
          data_update: stockdata,
        }
        let apiRequest = requestProductDetails;
        var apiRequestResponse = {
          fby_user_id: fby_user_id,
          request: apiRequest,
          response: {
            data: null
          }
        };

        //logger.logInfo(`push-WooCommerce-stock REQUEST ${updateRequestUrl}\n`, requestProductDetails);
        //console.log(`\n push-WooCommerce-stock REQUEST ${updateRequestUrl}\n`, requestProductDetails);

        let options = {
          method: "put",
          uri: urlWithDomain,
          headers: {
            "Content-Type": "application/json",
            'X-HTTP-Method-Override': `PUT`,
          },
          json: true,
        };
        await request(options)

          // await WooCommerce.put(
          //   updateRequestUrl,
          //   stockdata
          // )
          .then(async (response) => {

            if (response.data == undefined && response != undefined) {
              response.data = response;
            }

            let resmsg = CircularJSON.stringify(response.data);

            let is_stock_update_sucess = false;

            try {

              apiRequestResponse.response.data = response.data;
              let logData = resmsg;

              let infoMessage = logMessage;

              await logger.LogForAlert(
                fby_user_id,
                '',
                sku != undefined ? sku : '',
                infoMessage,
                logData,
                constants.LOG_LEVEL.INFO,
                constants.FBY_ALERT_CODES.STOCK_SYNC,
                cron_name,
                cron_id,
                false
              );

            }
            catch (error) {
              //console.log(`\nERROR While ${logMessage}: \n`, JSON.stringify(error));

            }

            if (response.data != undefined && response.data.stock_quantity != undefined && response.data.stock_quantity != null) {
              is_stock_update_sucess = itemlist.inventory_quantity == response.data.stock_quantity;
            }

            let pritnResult = {
              seq: counter,
              type: 'RESPONSE',
              url: urlWithDomain,
              product_id: response.data.id,
              sku: response.data.sku,
              item_product_id: itemlist.item_product_id,
              is_product: itemlist.item_id == itemlist.item_product_id,
              is_stock_update_sucess: is_stock_update_sucess,
              data_update:
              {
                stock_quantity: response.data.stock_quantity,
                stock_status: response.data.stock_status,
                manage_stock: response.data.manage_stock,
              }
            }

            logger.logInfo(`push-WooCommerce-stock RESPONSE ${updateRequestUrl}\n`, pritnResult);
            //console.log(`\n push-WooCommerce-stock RESPONSE ${updateRequestUrl}\n`, pritnResult);

            let updt_time = dateTime.create();
            let inputs = [
              fby_id,
              itemlist.sku,
              cron_name,
              cron_id,
              updt_time.format("Y-m-d H:M:S"),
            ];
            common.updateProductAftrSndChanl(
              inputs,
              fby_id,
              cron_name,
              cron_id,
              function (result) {
                if (result.error) {

                  let inputs = [
                    cron_name,
                    cron_id,
                    constants.CATCH_TYPE,
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
                }
              }
            );

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
            set_response[itemlist.sku] = msg;
          })
          .catch(async (error) => {
            let resmsg = error.message;
            let msg = {
              error: {
                message: constants.PUSH_STOCK_CHANNEL_ERROR,
                data: CircularJSON.stringify(error),
              },
            };
            set_response[itemlist.sku] = msg;

            try {

              await logger.LogForAlert(
                fby_user_id,
                '',
                sku,
                error.message,
                error,
                constants.LOG_LEVEL.WARNING,
                constants.FBY_ALERT_CODES.STOCK_SYNC,
                cron_name,
                cron_id
              );
            }
            catch (error) {
              //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

            }

          });
      }
      catch (error) {
        await logger.LogForAlert(
          fby_user_id,
          '',
          sku,
          error.message,
          error,
          constants.LOG_LEVEL.INFO,
          constants.FBY_ALERT_CODES.STOCK_SYNC,
          cron_name,
          cron_id
        );

      }
      counter++;
      //break;
    }

    // await common.updateLastSyncOperationTime(fby_user_id, null, cron_name, function (result) {
    //   if (result != null && result.error) {
    //     //console.log("Failed to update sync time in the database");
    //   }
    // });
    /* products loop end */
  }
  catch (error) {
    //console.log();
    //console.log(logMessage);
    //console.log(error);
    //console.log();
  }
  finally {
    ccCache.del(cacheKey_Job);
  }
  return set_response;
};

exports.getOrders = async (result, exist_cron, fby_id, cron_name, cron_id) => {
  let set_response = {};
  let updated_at = moment();
  updated_at = updated_at.subtract(10, "days");
  updated_at = updated_at.format(MOMENT_DATE_FORMAT);
  let now = moment();
  now = now.format(MOMENT_DATE_FORMAT);
  let isCanSync = false;

  cron_name = constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL;
  let fby_alert_code = constants.FBY_ALERT_CODES.ORDER_SYNC;
  let fby_user_id = fby_id;
  let sku = '';
  let order_number = ''

  let order_no_log = '';
  let sku_log = '';
  let batchInfoListDB = [];

  let logMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;

  /* Shopify account loop start */
  for (const client of result) {
    //client.token = helpers.getDecryptedData(client.token);
    //console.log('getOrders client.secret: ', client.secret);

    //*

    let orderSyncStartDate = client.orderSyncStartDate;
    if (orderSyncStartDate == null || orderSyncStartDate == "") {
      isCanSync = false;
      set_response[client.domain] = {
        cron: cron_name,
        updated_at: updated_at,
        message: "Order import date is not set.",
      };
      logger.logInfo(
        `Woocommerce getOrders fby_user_id: ${fby_id}, since=${orderSyncStartDate}`,
        set_response
      );
      return set_response;
    } else {
      if (now > orderSyncStartDate) {
        isCanSync = true;
        updated_at = moment(orderSyncStartDate);
        if (fby_id == 30) {
          updated_at = moment('2022-07-11');
          //console.log('Woocommerce  FAD fby_id == 30 updated_at: ', updated_at);
        }
        updated_at = updated_at.format(MOMENT_DATE_FORMAT);
      } else {
        isCanSync = false;
        set_response[client.domain] = {
          cron: cron_name,
          since: updated_at,
          message: "Order import date is not set.",
        };
        logger.logInfo(
          `Woocommerce getOrders orderSyncStartDate is less, fby_id: ${fby_id}, url: ${constants.Woocommerce_Get_Orders}`,
          set_response
        );
        return set_response;
      }
    }

    let dateobj = new Date(updated_at);
    let DateISOFormat = dateobj.toISOString();
    //let url = `${constants.Woocommerce_Get_Orders}?since=${unixTimestamp}`;
    let urlLogMsg = `${logMessage}, orderSyncStartDate: ${updated_at}`;
    //console.log(`\n${urlLogMsg}`);

    let Key = await helpers.getDecryptedData(client.api_key); //'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
    let Secret = await helpers.getDecryptedData(client.secret); // Your consumer secret

    let Domain = await helpers.getWoocommerceDomain(client.domain);

    const WooCommerce = new WooCommerceRestApi({
      url: Domain, //'https://shop170.altervista.org/', // Your store URL
      consumerKey: Key, //'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
      consumerSecret: Secret, // Your consumer secret
      version: "wc/v3", // WooCommerce WP REST API version
      timeout: constants.WOOCOMMERCE_API_TIMEOUT,
    });


    let page_loop = true;
    let page_no = 1;
    //Single order
    // `orders/{orderid}?consumer_key=${Key}&consumer_secret=${Secret}`
    // example https://dolcebellezza.it/wp-json/wc/v3/orders/35641?consumer_key=ck_f676d40ba6b4ff89b2b64fd88183138e92f05b50&consumer_secret=cs_42048c5d6897d891df00802aa15cace5f914d281
    //console.log(`\norders?page=${page_no}&per_page=10&after=${DateISOFormat}&consumer_key=${Key}&consumer_secret=${Secret}`);
    while (page_loop) {
      await WooCommerce.get(
        `orders/?page=${page_no}&per_page=10&after=${DateISOFormat}&consumer_key=${Key}&consumer_secret=${Secret}`
      )
        .then(async (response) => {
          if (page_no > 0) {
            //console.log(`\norders?page=${page_no}&per_page=10&after=${DateISOFormat}&consumer_key=${Key}&consumer_secret=${Secret}`);
          }
          let order_data = response.data;
          if (!order_data.includes('<!DOCTYPE html>')) {

            if (response.data.length == 0) {
              page_loop = false;
              return set_response;
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
                //console.log(`Woocommerce getOrders fby_user_id: ${fby_id} Total Orders:`, order_data.length);
                /* order loop start*/
                for await (const jsonData of order_data) {

                  try {
                    order_no_log = jsonData.order_key;
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

                  try {

                    if (jsonData.id == 35641) {
                      //console.log('jsonData.id: ', jsonData.id, jsonData.status, jsonData.payment_method.toLowerCase());
                    }
                    // check if order is paid and unfullfiled
                    let isCOD = jsonData.payment_method.toLowerCase() == "cod";

                    if (
                      (jsonData.date_paid != null ||
                        jsonData.status.toLowerCase() == "cancelled" ||
                        isCOD) &&
                      jsonData.status.toLowerCase() != "failed"
                    ) {
                      // if (isCOD) {
                      // //  //console.log('jsonData: ', CircularJSON.stringify(jsonData));
                      // }

                      let date_created = dateTime
                        .create(jsonData.date_created)
                        .format("Y-m-d H:M:S");
                      let date_modified = dateTime
                        .create(jsonData.date_modified)
                        .format("Y-m-d H:M:S");
                      let date_paid =
                        jsonData.date_paid == null
                          ? null
                          : dateTime
                            .create(jsonData.date_paid)
                            .format("Y-m-d H:M:S");

                      let channel = client.channelName;
                      let channel_code = client.channel_code;
                      let owner_code = client.owner_code;
                      let account_id = client.id;
                      let currency_code = jsonData.currency;
                      let fby_user_id = fby_id;
                      let order_no = jsonData.order_key;
                      let seller_order_id = jsonData.id;
                      let channel_currency_code = client.currency;
                      let total_order = jsonData.total;
                      let total_items = jsonData.line_items.length;
                      let total_tax = jsonData.total_tax;
                      let total_discount = jsonData.discount_total;
                      let total_items_price = jsonData.total;
                      let payment_method = jsonData.payment_method;
                      let sales_record_no = jsonData.transaction_id;
                      let purchase_date = date_created;
                      let payment_time = date_paid;
                      let payment_status = "";
                      let order_status = jsonData.status;
                      let location_id = jsonData.shipping_lines.id || 0;
                      let payment_id = jsonData.transaction_id;
                      let item_total_ship_price =
                        parseFloat(jsonData.shipping_lines.total) || 0;

                      //buyer detail
                      let buyer_email = jsonData.billing.email;
                      let buyer_id = jsonData.customer_id;
                      let buyer_name = `${jsonData.billing.first_name} ${jsonData.billing.last_name}`;
                      //shiping address
                      let recipient_name = `${jsonData.shipping.first_name} ${jsonData.shipping.last_name}`;
                      let shiper_company = jsonData.shipping.company;
                      let shiper_strt1 = jsonData.shipping.address_1;
                      let shiper_strt2 = jsonData.shipping.address_2;
                      let shiper_city = jsonData.shipping.city;
                      let shiper_state = jsonData.shipping.state;
                      let shiper_state_code = jsonData.shipping.state;
                      let shiper_zip = jsonData.shipping.postcode;
                      let shiper_country = jsonData.shipping.country;
                      let shiper_country_iso2 = jsonData.shipping.country;
                      let shiper_phone = jsonData.shipping.phone;
                      let shiper_email = jsonData.shipping.company;

                      //billing address
                      let bill_generator_name = null;
                      let bill_company = '';
                      let bill_address_1 = '';
                      let bill_address_2 = '';
                      let bill_city = null;
                      let bill_state = '';
                      let bill_state_code = '';
                      let bill_zip = null;
                      let bill_country = '';
                      let bill_country_iso2 = '';
                      let bill_phone = '';
                      if (jsonData.billing != undefined && jsonData.billing != null) {
                        bill_generator_name = `${jsonData.billing.first_name} ${jsonData.billing.last_name}`;
                        bill_company = jsonData.billing.company || '';
                        bill_address_1 = jsonData.billing.address_1 || '';
                        bill_address_2 = jsonData.billing.address_2 || '';
                        bill_city = jsonData.billing.city;
                        bill_state = jsonData.billing.state || '';
                        bill_state_code = jsonData.billing.state || '';
                        bill_zip = jsonData.billing.postcode;
                        bill_country = jsonData.billing.country || '';
                        bill_country_iso2 = jsonData.billing.country || '';
                        bill_phone = jsonData.billing.phone || '';

                      }
                      if (bill_generator_name == undefined || bill_generator_name == null) {
                        bill_generator_name = recipient_name;
                      }
                      if (bill_city == undefined || bill_city == null ||
                        bill_zip == undefined || bill_zip == null) {
                        bill_company = shiper_company;
                        bill_address_1 = shiper_strt1;
                        bill_address_2 = shiper_strt2;
                        bill_city = shiper_city;
                        bill_state = shiper_state;
                        bill_state_code = shiper_state_code;
                        bill_zip = shiper_zip;
                        bill_country = shiper_country;
                        bill_country_iso2 = shiper_country_iso2;
                        bill_phone = shiper_phone;

                      }
                      let order_product_data = jsonData.line_items;

                      let managedByChannel = false;

                      if (shiper_phone == null || shiper_phone == '') {
                        if (jsonData.shipping != undefined
                          && jsonData.shipping != null
                          && jsonData.shipping.phone != undefined
                          && jsonData.shipping.phone != '') {
                          shiper_phone = jsonData.billing.phone;
                        }
                      }
                      if (
                        date_paid != null &&
                        jsonData.status.toLowerCase() == "completed"
                      ) {
                        order_status = "completed";
                        payment_status = "paid";
                      }
                      if (
                        date_paid != null &&
                        jsonData.status.toLowerCase() == "processing" &&
                        !isCOD
                      ) {
                        order_status = "paid";
                        payment_status = "paid";
                      } else if (
                        date_paid != null &&
                        jsonData.status.toLowerCase() == "processing" &&
                        isCOD
                      ) {
                        order_status = "processing";
                        payment_status = "pending";
                      } else if (jsonData.status.toLowerCase() == "refunded") {
                        order_status = "refunded";
                        payment_status = "refunded";
                      } else if (
                        date_paid == null &&
                        jsonData.status.toLowerCase() == "processing" &&
                        isCOD
                      ) {
                        order_status = "processing";
                        payment_status = "pending";
                      } else if (
                        date_paid == null &&
                        jsonData.status.toLowerCase() == "processing"
                      ) {
                        order_status = "processing";
                        payment_status = jsonData.payment_method.toUpperCase();
                      } else {
                        payment_status = jsonData.payment_method.toUpperCase();
                        order_status = jsonData.status.toLowerCase();
                      }

                      let orderdetail_id = "";
                      // //console.log(Object.values(order_product_data));
                      // //console.log('order_product_data: ', order_product_data);

                      for (const jsonItemData of order_product_data) {
                        /* line items loop start*/

                        //let jsonItemData = item;

                        let item_tax = parseFloat(jsonItemData.total_tax);
                        //total_tax = total_tax + item_tax;
                        let exchange_rate = 0;


                        let sku = jsonItemData.sku;

                        if (order_no != '') {
                          order_number = order_no;
                          logMessage = `${logMessage}, order_no: ${order_number}`

                        }
                        if (sku != '') {
                          logMessage = `${logMessage}, sku: ${sku}`

                        }
                        try {


                          let logData = JSON.stringify(jsonItemData);

                          await logger.LogForAlert(
                            fby_user_id,
                            order_number != undefined ? order_number : '',
                            sku != undefined ? sku : '',
                            logMessage,
                            logData,
                            constants.LOG_LEVEL.INFO,
                            fby_alert_code,
                            cron_name,
                            cron_id,
                            false
                          );

                        }
                        catch (error) {
                          //console.log(`\nERROR While ${logMessage}: \n`, JSON.stringify(error));

                        }

                        let order_line_item_id = jsonItemData.id;
                        let order_item_id = jsonItemData.product_id;
                        let barcode = "";

                        let transaction_id = jsonData.id;
                        let product_name = jsonItemData.name;
                        let quantity_purchased = jsonItemData.quantity;

                        let line_item_price = parseFloat(
                          jsonItemData.total
                        );
                        let line_item_total_tax = parseFloat(
                          jsonItemData.total_tax
                        ); //item_tax * quantity_purchased;
                        let item_total_price_extax =
                          line_item_price;// * quantity_purchased;
                        let item_price = line_item_price;// * quantity_purchased;

                        let item_ship_price = parseFloat(
                          item_total_ship_price / total_items
                        );

                        let promotion_discount =
                          parseFloat(jsonItemData.price) -
                          parseFloat(jsonItemData.total);

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
                              //console.log(
                              //   urlLogMsg,
                              //   CircularJSON.stringify(result.error)
                              // );
                              // store log
                              let inputs = [
                                cron_name,
                                cron_id,
                                constants.CATCH_TYPE,
                                CircularJSON.stringify(result.error),
                                fby_id,
                              ];

                            }
                            if (result.success) {
                              orderdetail_id = result.success.data;
                            }
                          }
                        );
                      }

                      /* line items loop end*/
                      let order_masters = [
                        channel,
                        channel_code,
                        owner_code,
                        fby_user_id,
                        account_id,
                        order_no,
                        seller_order_id,
                        purchase_date,
                        payment_time,
                        recipient_name,
                        shiper_company,
                        shiper_strt1,
                        shiper_strt2,
                        shiper_city,
                        shiper_state,
                        shiper_state_code,
                        shiper_zip,
                        shiper_country,
                        shiper_country_iso2,
                        shiper_phone,
                        total_order,
                        total_items,
                        total_items_price,
                        item_total_ship_price,
                        total_tax,
                        total_discount,
                        payment_id,
                        payment_method,
                        currency_code,
                        buyer_id,
                        buyer_email,
                        buyer_name,
                        sales_record_no,
                        payment_status,
                        order_status,
                        cron_name,
                        cron_id,
                        managedByChannel,
                        bill_generator_name,
                        bill_company,
                        bill_address_1,
                        bill_address_2,
                        bill_city,
                        bill_state,
                        bill_state_code,
                        bill_zip,
                        bill_country,
                        bill_country_iso2,
                        bill_phone
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

                          }
                          if (result.success) {
                            orderdetail_id = result.success.data;
                          }
                        }
                      );

                      //}
                      //})
                    }
                  } catch (error) {
                    //console.log(`${urlLogMsg} , addOrder error:`, error.message);
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
                    common.updateOrderCancelStatus(
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
              //console.log(`${urlLogMsg} , catch error:`, resmsg, error.message);
              if (exist_cron) {
                let inputs = [
                  cron_name,
                  cron_id,
                  constants.CATCH_TYPE,
                  error.stack,
                  fby_id,
                  exist_cron,
                ];

                let msg = {
                  error: {
                    message: constants.GET_ORDER_ERROR,
                    data: error.stack,
                  },
                };
                set_response[client.domain] = msg;
              } else {
                //mail
                //store update product status error log
                let inputs = [
                  cron_name,
                  cron_id,
                  constants.CATCH_TYPE,
                  error.stack,
                  fby_id,
                  exist_cron,
                ];

                let msg = {
                  error: {
                    message: constants.GET_ORDER_ERROR,
                    data: error.stack,
                  },
                };
                set_response[client.domain] = msg;
              }
            }
          }
          else {
            page_loop = false;
          }
        })
        .catch(async function (error) {
          if (page_no > 10) {
            page_loop = false;
          }
          let errorJson = CircularJSON.stringify(error);
          //console.log(`${urlLogMsg} , api catch error:`, errorJson);
          if (exist_cron) {
            let inputs = [
              cron_name,
              cron_id,
              constants.CATCH_TYPE,
              errorJson,
              fby_id,
              exist_cron,
            ];

            let msg = {
              error: { message: constants.GET_ORDER_ERROR, data: error },
            };
            set_response[client.domain] = msg;
          } else {

            //store update product status error log
            let inputs = [
              cron_name,
              cron_id,
              constants.CATCH_TYPE,
              CircularJSON.stringify(error),
              fby_id,
              exist_cron,
            ];

            let msg = {
              error: { message: constants.GET_ORDER_ERROR, data: error },
            };
            set_response[client.domain] = msg;
          }


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
        });

      page_no = page_no + 1;
    }
  }

  try {
    await dbCCLogs.bulkInsert(batchInfoListDB);
  } catch (error) {
    //console.log('\nERROR While bulkInsert: \n', error.message);

  }
  /* Shopify account loop end */
  return set_response;
};

exports.getTrackList = async (
  fby_id,
  order_no,
  cron_name,
  cron_id,
  callback
) => {
  //console.log(`getTrackList fby_id: ${fby_id}, order_no ${order_no}`);
  let set_response = {};
  let set_response_data = {};
  let page = 1;
  let total_page = 0;
  let count = 1;
  //do {
  await axios({
    url: `${constants.Woocommerce_Get_Order_Tracking}${order_no}`,
    method: "get",
    headers: {
      key: helpers.getDecryptedData(Woocommerceclient.api_key), //"5dee7388e6281f7d88008ae0809162381c3cd7cd2350053061fa1ef83ae9e742031971",
      exchange: helpers.getDecryptedData(Woocommerceclient.secret), //"5bb85add137db786f696dffbe90629d5c63a4b6ca7e320a060d5cf31b1def918"
    },
  })
    .then((response) => {
      if (Object.keys(response.data) == "error") {
        let errormsg = CircularJSON.stringify(response.data);
        logger.logError("getTrackList error", errormsg);
        //mail
        mail.trakListMail(cron_name, cron_id, fby_id, errormsg);
        set_response = { error: { key: fby_id, data: response.data } };
      } else {
        let resmsg = CircularJSON.stringify(response.data);
        logger.logError("getTrackList : ", resmsg);
        count++;
        set_response_data = response.data;
        // add to products !
        let items = response.data;
        //items.forEach((item) => {
        for (const item of response.data) {
          let tracking = "";
          let shipmentDate = "";
          let carrier = "";
          let ship_url = "";
          let isReturn = "";
          //console.log('order_no: ', order_no);
          if (item.tracking) {
            tracking = item.tracking;
            shipmentDate = item.pickup_date;
            carrier = item.courier;
            ship_url = item.url;
            //isReturn = item.shippings[0].isReturn;

            let updt_time = dateTime.create();
            // //console.log(item);
            let item_arr = [
              cron_name,
              cron_id,
              updt_time.format("Y-m-d H:M:S"),
              tracking,
              carrier,
              ship_url,
              order_no,
              "Woocommerce",
              carrier,
              item.skuCode != undefined ? item.skuCode : ""
            ];
            // update order Track Number
            common.updateOrder(
              item_arr,
              fby_id,
              cron_name,
              cron_id,
              function (result) {
                if (result.error) {
                  //mail or log
                  mail.updateOrderErrMail(
                    cron_name,
                    cron_id,
                    fby_id,
                    CircularJSON.stringify(result.error)
                  );
                  // store update Order error log
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

          //})
          //total_page = response.data.notifiableOrders.totalPages;
        }
      }
    })
    .catch(function (error) {
      //  //console.log(error);
      //console.log("getTrackLst error : ", CircularJSON.stringify(error.message));
      //mail
      mail.stockListMail(cron_name, cron_id, fby_id, CircularJSON.stringify(error));
      //store log
      let inputs = [
        cron_name,
        cron_id,
        constants.CATCH_TYPE,
        CircularJSON.stringify(error),
        fby_id,
      ];

      //set response
      set_response = { error: { data: error } };
    });
  //} while (page <= total_page)
  //if (count > 1) {
  set_response = { success: { data: set_response_data } };
  //}

  return callback(set_response);
};

const getorderdetails = async (
  Woocommerceclient,
  orderID,
  exist_cron,
  fby_id,
  cron_name,
  cron_id,
  callback
) => {
  Woocommerceclient.api_password = helpers.getDecryptedData(
    Woocommerceclient.secret
  );
  let Key = await helpers.getDecryptedData(Woocommerceclient.api_key); //'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
  let Secret = await helpers.getDecryptedData(Woocommerceclient.secret); // Your consumer secret
  let Domain = await helpers.getWoocommerceDomain(Woocommerceclient.domain);
  let url = `${constants.Woocommerce_Get_Order_Details}${orderID}`;
  let logTrace = `Woocommerce_Get_Order_Details ${url}`;

  await WooCommerce.get(
    `orders/${orderID}?consumer_key=${Key}&consumer_secret=${Secret}`
  )
    .then(function (orderDetails) {
      logger.logInfo(logTrace, orderDetails.data);
      if (orderDetails.data.error) {
        logger.logError(`${logTrace} error`, orderDetails.data);
        if (exist_cron) {
          let errjson = CircularJSON.stringify(orderDetails.data.error);
          let inputs = [
            cron_name,
            cron_id,
            constants.CATCH_TYPE,
            errjson,
            fby_id,
            exist_cron,
          ];

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

          let msg = {
            error: { message: constants.GET_PRODUCT_ERROR, data: errjson },
          };
          return callback(msg);
        }
      } else {
        return callback(orderDetails.data);
      }
    })
    .catch(function (err) {
      let errorJson = CircularJSON.stringify(err);
      //console.log("err CATCH_TYPE: ", `${err.stack}`);
      if (exist_cron) {
        let inputs = [
          cron_name,
          cron_id,
          constants.CATCH_TYPE,
          errorJson,
          fby_id,
          exist_cron,
        ];

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

        let msg = {
          error: { message: constants.GET_PRODUCT_ERROR, data: errorJson },
        };
        return callback(msg);
      }
    });
};

exports.pushTrackingWoocommerce = async (
  order,
  user,
  cron_name,
  cron_id,
  req,
  res
) => {
  cron_name = constants.CC_OPERATIONS.PUSH_TRAKING_TO_CHANNEL;
  let operationId = helpers.getUUID();
  let set_response = {
    details: [],
  };
  let error = false;
  let fby_user_id = user.fby_user_id;
  let Key = await helpers.getDecryptedData(user.api_key); //'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
  let Secret = await helpers.getDecryptedData(user.secret); // Your consumer secret
  let Domain = await helpers.getWoocommerceDomain(user.domain);
  let processedOrdersForGetAndDelete = [];
  let infoMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;

  let order_no_forLogs = '';
  let seller_order_id = '';
  let counter = 0;
  let total = order.length || 0;

  for await (const itemlist of order) {
    //helpers.sleep(5);
    fby_user_id = itemlist.fby_user_id;
    let order_number = itemlist.seller_order_id;
    seller_order_id = order_number;
    //console.log('\n pushTrackingWoocommerce order_number: ', order_number);
    let order_status = itemlist.order_status;
    let sku = itemlist.sku || '';
    order_no_forLogs = itemlist.order_no;
    try {

      // set_response.order_numbers.push(order_number);

      let line_items = [];
      await common.getOrderDetailsTracking(
        fby_user_id,
        itemlist.order_no,
        cron_name,
        cron_id,
        async function (result) {
          if (result.error) {
            let details = {
              order_number: order_number,
              status: constants.PUSH_TRACKNO_CHANNEL_ERROR,
              error: result != undefined && result.error != undefined && result && result.error ? result.error : ""
            };
            //console.log(`ERROR fby_user_id--> ${fby_user_id}, getOrderDetailsTracking details: `, details);
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

          }
          if (result.success) {
            let order_details = result.success.data;
            //console.log('order_details: ', order_details);
            let tracking_response = {
              order_status: "",
              order_details: {},
            };
            // await tracking_response.order_details = order_details.map(async (item) =>
            for await (var item of order_details) {
              counter++;
              infoMessage = `${counter}/${total}) fby_user_id = ${fby_user_id}, order_no = '${item.order_no}, seller_order_id = '${item.seller_order_id}, ${cron_name}'`;
              //let url = `${Domain}${order_number}&status=${order_status}&tracking=${item.tracking_id}&courier=${item.tracking_courier}&tracking_url=${item.tracking_url}`;
              let url = `${Domain}wp-json/wc-shipment-tracking/v3/orders/${order_number}/shipment-trackings?consumer_key=${Key}&consumer_secret=${Secret}&tracking_provider=${item.tracking_courier || 'Default'}&custom_tracking_provider=${item.tracking_courier || 'Default'}&tracking_number=${item.tracking_id || 'Default'}&custom_tracking_link=${urlencode(item.tracking_url) || 'Default'}`;
              //console.log('\n', infoMessage);
              //console.log('\n', url);
              //console.log('\n');

              let options = {
                method: "post",
                uri: url,
              };

              let getOptions = {
                method: "get",
                uri: `${Domain}wp-json/wc-shipment-tracking/v3/orders/${order_number}/shipment-trackings?consumer_key=${Key}&consumer_secret=${Secret}`,
              };
              let isAlreadyProcessed = await helpers.searchStringInArray(order_number, processedOrdersForGetAndDelete);
              if (processedOrdersForGetAndDelete.length == 0 || isAlreadyProcessed < 0) {

                await request(getOptions).then(async (getResult) => {
                  //console.log('\ngetResult: \n', getResult);
                  let res = JSON.parse(getResult);
                  try {
                    await logger.LogForAlert(
                      fby_user_id,
                      order_no_forLogs,
                      sku != undefined ? sku : '',
                      { operation: 'GET WOOCOMMERCE TRACKING', request: getOptions },
                      getResult,
                      constants.LOG_LEVEL.INFO,
                      constants.FBY_ALERT_CODES.TRACK_SYNC,
                      cron_name,
                      cron_id,
                      false
                    );
                  } catch (error) {
                    //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
                    //console.log(error);
                  }
                  let resultArr = [];
                  if (Array.isArray(res) && res != null) {
                    resultArr = res;
                  }
                  else {
                    if (res != null && res.tracking_id != undefined) {
                      resultArr.push(res);
                    }
                  }

                  if (resultArr.length > 0)
                    for await (const trackingDetails of resultArr) {
                      helpers.sleep();
                      try {
                        let u = `${trackingDetails._links.self[0].href}?consumer_key=${Key}&consumer_secret=${Secret}`;//`${Domain}wp-json/wc-shipment-tracking/v3/orders/${order_number}/shipment-trackings/${trackingDetails.tracking_id}?consumer_key=${Key}&consumer_secret=${Secret}`;
                        //  //console.log('delete uri: ', u);
                        let deleteOptions = {
                          method: "delete",
                          uri: u,
                        };
                        await request(deleteOptions).then(async (deleteResult) => {
                          try {
                            await logger.LogForAlert(
                              fby_user_id,
                              order_no_forLogs,
                              sku != undefined ? sku : '',
                              { operation: 'DELETE WOOCOMMERCE TRACKING', request: JSON.parse(JSON.stringify(deleteOptions)) },
                              deleteResult,
                              constants.LOG_LEVEL.INFO,
                              constants.FBY_ALERT_CODES.TRACK_SYNC,
                              cron_name,
                              cron_id,
                              false
                            );
                          } catch (error) {
                            //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
                            //console.log(error);
                          }
                          //console.log('\n deleteResult: ', deleteResult);
                        })
                          .catch(async function (err) {

                            if (err.message.includes("connect ETIMEDOUT")) {
                              //console.log(`\n ${order_number} delete tracking err connect ETIMEDOUT: sleep(5)`);
                              await helpers.sleep(5);
                            }
                            else {
                              //console.log(`\n ${order_number} delete tracking err : \n`, CircularJSON.stringify(err));

                            }

                          });
                      }
                      catch (err) {

                        if (err.message.includes("connect ETIMEDOUT")) {
                          //console.log(`\n${order_number} delete tracking err connect ETIMEDOUT: sleep(5)`);
                          await helpers.sleep(5);
                        }
                        else {
                          //console.log(`\n ${order_number} delete tracking err : \n`, CircularJSON.stringify(err));

                        }
                      }
                    }

                }).catch(async function (err) {
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
                    //console.log('\n ERROR: pushTrackingShopify', error.message);
                  }
                  if (err.message.includes("connect ETIMEDOUT")) {
                    //console.log(`\n ${order_number} get tracking err connect ETIMEDOUT: sleep(5)`);
                    await helpers.sleep(5);
                  }
                  else {
                    //console.log(`\n ${order_number} get tracking err : \n`, CircularJSON.stringify(err));

                  }
                });
                processedOrdersForGetAndDelete.push(order_number);
              }
              //helpers.sleep();
              await request(options)
                .then(async (parsedBody) => {
                  let responseBodyjson = CircularJSON.stringify(parsedBody);
                  try {
                    await logger.LogForAlert(
                      fby_user_id,
                      order_no_forLogs,
                      sku != undefined ? sku : '',
                      { operation: 'POST WOOCOMMERCE TRACKING', request: options },
                      parsedBody,
                      constants.LOG_LEVEL.INFO,
                      constants.FBY_ALERT_CODES.TRACK_SYNC,
                      cron_name,
                      cron_id,
                      false
                    );
                  } catch (error) {
                    //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
                    //console.log(error);
                  }
                  //update status 1 after send
                  if (responseBodyjson.error) {
                    let orderJson = CircularJSON.stringify(details);
                    set_response.details.push(responseBodyjson);
                  } else {

                    let updt_time = dateTime.create();
                    let inputs = [
                      fby_user_id,
                      itemlist.order_no,
                      cron_name,
                      cron_id,
                      updt_time.format("Y-m-d H:M:S"),
                    ];
                    //console.log(`\n fby_user_id ${fby_user_id}, order_number ${order_number} updateOrderDetailStatus`);
                    await common.updateOrderDetailStatus(
                      inputs,
                      fby_user_id,
                      cron_name,
                      cron_id,
                      function (result) {
                        if (result.error) {

                          //store update product status error log
                          let inputs = [
                            cron_name,
                            cron_id,
                            constants.CATCH_TYPE,
                            CircularJSON.stringify(result.data),
                            fby_user_id,
                          ];

                        }
                      }
                    );

                    try {
                      //helpers.sleep();
                      await updateOrderStatus(
                        itemlist,
                        user,
                        cron_name,
                        cron_id,
                        function (orderdetails) { }
                      );
                    }
                    catch (err) {
                      //console.log(`\nERROR fby_user_id ${fby_user_id}, updateOrderStatus: -----`, err);

                    }
                    return (set_response[order_number] =
                      constants.PUSH_TRACKNO_CHANNEL_SUCCESS);
                  }
                })
                .catch(async function (err) {

                  let errorMessage = `${infoMessage}\n, ErrorMessage: ${err.message}`;
                  Promise.resolve(err);
                  if (err.message.includes("connect ETIMEDOUT")) {
                    let errorJson = CircularJSON.stringify(err);
                    //console.log(`\nfby_user_id ${fby_user_id}, order_number ${order_number}, tracking err connect ETIMEDOUT: sleep(5)\n`, errorJson);

                    await helpers.sleep(5);
                  }
                  error = true;

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


                  Promise.resolve(details.order_status).then(async function (value) {
                    // set_response = value;
                    set_response.request = { operationId: operationId };
                    let orderJson = CircularJSON.stringify(details);
                    //console.log(`pushTrackingWoocommerce error : ${orderJson}`,);
                    if (value.error.includes("connect ETIMEDOUT")) {
                      await helpers.sleep(5);
                    }
                    set_response.details.push(CircularJSON.stringify(value));
                  });
                });

            }


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
    catch (err) {
      //console.log(`\nfby_user_id ${fby_user_id}, updateOrderStatus: -----\n`, CircularJSON.stringify(err));

    }
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

const updateOrderStatus = async (order, user, cron_name, new_cron_id) => {
  try {
    let set_response = {};
    let fby_id = user.fby_user_id;

    let cron_id = new_cron_id;
    let exist_cron = 0;

    const orderdata = {
      status: `completed`,
    };

    // logger.logInfo("woocommerce updateOrderStatus Requestdata: ", orderdata);
    let Key = await helpers.getDecryptedData(user.api_key); //'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
    let Secret = await helpers.getDecryptedData(user.secret); // Your consumer secret
    let Domain = await helpers.getWoocommerceDomain(user.domain);
    const WooCommerce = new WooCommerceRestApi({
      url: Domain, //'https://shop170.altervista.org/', // Your store URL
      consumerKey: Key, //'ck_c8147aa5d500c288b547e889d0aca7553db43d9e', // Your consumer key
      consumerSecret: Secret, // Your consumer secret
      version: constants.WOOCOMMERCE_API_VERSION, // WooCommerce WP REST API 
      axiosConfig: constants.AXIOS_CONFIG_WOOCOMMERCE_HEADERS, //Override Methods headers
      timeout: constants.WOOCOMMERCE_API_TIMEOUT,
    });

    let updateRequestUrl = `orders/${order.seller_order_id}?consumer_key=${Key}&consumer_secret=${Secret}&status=${orderdata.status}`;
    let urlWithDomain = `${Domain}wp-json/${constants.WOOCOMMERCE_API_VERSION}/${updateRequestUrl}`;
    //console.log('\nwoocommerce updateOrderStatus urlWithDomain: \n', urlWithDomain);

    let options = {
      method: "put",
      uri: urlWithDomain,
      headers: {
        "Content-Type": "application/json",
        'X-HTTP-Method-Override': `PUT`,
      },
      json: true,
    };


    await request(options)
      // await WooCommerce.put(
      //   `orders/${order.order_no}?consumer_key=${Key}&consumer_secret=${Secret}`,
      //   orderdata
      // )
      .then(async (response) => {
        if (response.data == undefined && response != undefined) {
          response.data = response;
        }

        try {
          let fby_api_key = "";
          let fbyuser = null;
          await common.userDetail(user.fby_user_id, cron_name, cron_id, async function (result) {
            fbyuser = result.success.data[0];
            await fbyController.getFBYToken(fbyuser, cron_name, cron_id, async function (result) {
              if (result.error) {
                //do nothing
              } else {
                fby_api_key = result.success.data;
                //await fbyService.changeOrderStatus(fby_api_key, order, exist_cron, cron_name, cron_id);

              }
            })

          });

        }
        catch (error) {
          //console.log('\n ERROR: ', error.message);
        }
        let resmsg = CircularJSON.stringify(response.data);
        //console.log("\nwoocommerce updateOrderStatus Response: \n", resmsg);
        let updt_time = dateTime.create();
      })
      .catch((error) => {
        let resmsg = CircularJSON.stringify(error);
        //console.log("\n Error woocommerce updateOrderStatus Response: \n", resmsg);
        //logger.logError("\n Error woocommerce updateOrderStatus Response: \n", resmsg);
      });
  }
  catch (err) {
    //console.log("\n Error woocommerce updateOrderStatus Response: \n", CircularJSON.stringify(err));

  }
};
