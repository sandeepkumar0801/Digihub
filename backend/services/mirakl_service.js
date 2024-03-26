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
axios.defaults.timeout = constants.mirakl_API_TIMEOUT;
const fbyService = require("./fby_service");
const Entities = require("../entities/Entities");
const dbCCLogs = require('../startup/dbcclogs');

exports.getProducts = async (
  result,
  exist_cron,
  fby_id,
  cron_name,
  cron_id
) => {
  let set_response = {};
  let urlLogMsg = `mirakl getProducts fby_user_id: ${fby_id}`;

  try {
    /* shopify account loop start */
    for (const client of result) {
      let Key = await helpers.getDecryptedData(client.api_key);
      let Domain = await helpers.getWoocommerceDomain(client.domain);

      //CM11
      let apiEndpoint = `${Domain}api/mcm/products/sources/status/export`;

      helpers.sleep();
      try {
        await axios({
          url: apiEndpoint,
          method: "get",
          headers: {
            Authorization: Key,
            Accept: 'application/json'
          }
        })
          .then(async function (parsedBody) {
            let resmsg = CircularJSON.stringify(parsedBody.data);
            // //console.log('parsedBody: ', resmsg);
            if (parsedBody.data.length == 0) {
              page_loop = false;
              return set_response;
            }

            logger.logInfo(`${urlLogMsg}`, resmsg);

            /* mirakl product loop start */
            let counter = 0;
            for (const product of parsedBody.data) {

              try {
                var ean = product.unique_identifiers[0].value;
                var unique_identifiers_code = product.unique_identifiers[0].code;
                //console.log(`\n ${++counter}/${parsedBody.data.length}) fby_user_id: ${fby_id}, code: ${unique_identifiers_code}, value: ${ean} \n`, JSON.stringify(product));

                let productDetails = ''
                await getproductdetails(client, unique_identifiers_code, ean, exist_cron, fby_id, cron_name, cron_id,
                  function (productinfo) {
                    if (!productinfo.errors) {
                      productDetails = productinfo;
                      //console.log(`\n ${++counter}/${parsedBody.data.length}) fby_user_id: ${fby_id}, code: ${unique_identifiers_code}, value: ${ean} \n`, JSON.stringify(productinfo));

                    }
                  }
                );

                let img = "";
                let flag = 0;
                let barcode = ean;

                let fby_user_id = client.fby_user_id;
                let domain = client.domain;
                let owner_code = client.owner_code;
                let channel = client.channelName;
                let sku = productDetails.products[0].product_sku;
                let item_id = productDetails.products[0].product_id;
                let title = productDetails.products[0].product_title;
                let item_product_id = productDetails.products[0].product_id;
                let inventory_item_id = productDetails.products[0].product_id;
                let inventory_quantity = 0;
                let image = img;
                let price = 0;
                //need to confirm
                let status = product.status;
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

                //console.log('inputs: ', inputs);
                common.addProduct(
                  inputs,
                  fby_id,
                  cron_name,
                  cron_id,
                  function (result) {
                    if (result.error) {
                      let errmsg = CircularJSON.stringify(result.error);
                      logger.logError(`mirakl getProducts`, errmsg);
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
              catch (error) {
                //console.log(`\n${++counter}) fby_user_id: ${fby_id},\n`, JSON.stringify(product));
                //console.log();
                //console.log(error.message);
                //console.log(error);

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
          .catch(function (err) {
            let errmsg = CircularJSON.stringify(err);
            logger.logError(`${urlLogMsg}, api catch error`, errmsg);
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

//OF21
exports.getProductOffers = async (
  result,
  exist_cron,
  fby_id,
  cron_name,
  cron_id
) => {
  let set_response = {};
  cron_name = constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL;
  let infoMessage = `${moment().format(MOMENT_DATE_FORMAT)} fby_user_id: ${fby_id}, ${cron_name}`;
  let urlLogMsg = infoMessage;
  let fby_user_id = fby_id;
  let counter = 0;

  let offset = 1;
  let isNextPage = true;
  let nextPageLink = '';


  try {
    /* loop start */
    for await (const client of result) {
      let Key = await helpers.getDecryptedData(client.api_key);
      let Domain = await helpers.getWoocommerceDomain(client.domain);

      let page_loop = true;
      let page_no = 0;
      let total_count = 0;
      let activeOffers = [];
      let apiEndpoint = `${Domain}api/offers/?max=100&offset=0`;
      while (isNextPage) {

        if (nextPageLink != '') {
          //console.log(`\n${offset})\t NextPageLink:\t`, nextPageLink);
        }

        //console.log(`\tapiEndpoint: `, apiEndpoint);

        await helpers.sleep(2);
        try {
          await axios({
            url: apiEndpoint,
            method: "get",
            headers: {
              Authorization: Key,
              Accept: 'application/json'
            }
          })
            .then(async function (parsedBody) {
              let resmsg = CircularJSON.stringify(parsedBody.data);

              try {
                if (parsedBody.headers.link != undefined && parsedBody.headers.link != null) {
                  let split = parsedBody.headers.link.split(',');

                  nextPageLink = '';
                  isNextPage = false;

                  for (let link of split) {
                    if (link && link.includes("next")) {

                      nextPageLink = link
                        .replace('<', '').replace('>;', '')
                        .replace('rel=\"next\"', '')
                        .trim();

                      isNextPage = true;

                    }

                  }

                }
                else {
                  nextPageLink = '';
                  isNextPage = false;

                }
                apiEndpoint = nextPageLink;

              }
              catch (error) {
                nextPageLink = '';
                isNextPage = false;
              }

              if (parsedBody.data.offers.length == 0) {
                page_loop = false;
                set_response = resmsg;
                //console.log(`FINISHED -----> ${counter}) ${urlLogMsg}  page_no ${page_no} `);
                //console.log(`\n----------------------------------------------------------------`);
                return set_response;
              }

              //console.log(`\n${urlLogMsg} total items :`, parsedBody.data.offers.length);


              /* mirakl product loop start */
              let islog = true
              for await (const product of parsedBody.data.offers) {
                if (activeOffers && activeOffers.indexOf(product.shop_sku) === -1) {

                  if (islog) {
                    try {

                      total_count = parsedBody.data.total_count || 0;
                      infoMessage = `${urlLogMsg}, ${apiEndpoint}`;

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
                    islog = false;
                  }
                  //console.log('product.data: ', product.data);
                  counter++;

                  // if (product.active == true) {
                  if (activeOffers && activeOffers.indexOf(product.shop_sku) === -1) {
                    activeOffers.push(product.shop_sku);
                  }
                  // }
                  // else if (product.active != true) {
                  //   continue;
                  // }

                  if (counter % 100 == 0 || counter == 1) {
                    //console.log(`\n\t${counter}) ${urlLogMsg} Active ${product.active}\n\tproduct: ${product.shop_sku}, page_no ${page_no}`);
                  }

                  var ean = "";

                  try {
                    let logData = JSON.stringify(product);
                    let message = `fby_user_id: ${client.fby_user_id}, sku: ${product.shop_sku}, ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL} `;
                    await logger.LogForAlert(
                      fby_id,
                      '',
                      product.shop_sku,
                      message,
                      product,
                      constants.LOG_LEVEL.INFO,
                      constants.FBY_ALERT_CODES.STOCK_SYNC,
                      constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL,
                      cron_id
                    );
                  } catch (error) {
                    //console.log('\n ERROR: ', error.message);
                  }

                  if (product.product_references != undefined && product.product_references != null
                    && product.product_references[0] != null) {
                    ean = product.product_references[0].reference;
                  }

                  // let productDetails = ''
                  //     await getproductdetails(client, ean, exist_cron, fby_id, cron_name, cron_id,
                  //       function (productinfo) {
                  //         if (!productinfo.errors) {
                  //             productDetails = productinfo;
                  //         }
                  //       }
                  //     );

                  let img = "";
                  let flag = 0;
                  let barcode = ean;

                  fby_user_id = client.fby_user_id;
                  let domain = client.domain;
                  let owner_code = client.owner_code;
                  let channel = client.channelName;
                  let sku = product.shop_sku;
                  let item_id = product.product_sku;
                  let title = product.product_title;
                  let item_product_id = ean || product.product_sku;
                  let inventory_item_id = product.offer_id;
                  let inventory_quantity = product.quantity;
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

                  //console.log('inputs: ', inputs);
                  await common.addProduct(
                    inputs,
                    fby_id,
                    cron_name,
                    cron_id,
                    function (result) {
                      if (result.error) {
                        let errmsg = CircularJSON.stringify(result.error);
                        logger.logError(`mirakl getProducts`, errmsg);
                        //console.log(`${urlLogMsg}, addProduct Error`, errmsg);

                      }
                    }
                  );
                }

              }
              //product loop end

              let msg = {
                success: {
                  message: constants.GET_PRODUCT_SUCCESS,
                  data: parsedBody.data,
                },
              };
              set_response[client.domain] = msg;
              offset++;
            })
            .catch(async function (err) {
              let errmsg = CircularJSON.stringify(err.message);
              if (err.message.includes('Request failed with status code 429')) {
                //console.log(`\n${infoMessage}\n${errmsg}`);
                await helpers.sleep(5);
              }
              else {
                isNextPage = false;
              }
              //console.log(`${urlLogMsg}, api catch error`, errmsg),
              try {

                let logData = JSON.stringify(err.response.data);
                let errorMessage = `${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL} fby_user_id: ${fby_id}, error : ${err.response.data.message}`;
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
                    data: CircularJSON.stringify(err),
                  },
                };
                set_response[client.domain] = msg;
              } else {
                //mail

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
        page_no++;

      }

      // if (activeOffers.length > 0) {
      let activeOffersCommaSaperated = activeOffers.join(',') || '';
      await common.deleteInactiveOffers(fby_user_id, activeOffersCommaSaperated);
      await helpers.sleep(1);
      // }
    }
  } catch (err) {
    logger.logError(`${urlLogMsg} controller catch error`, err);
  }

  /* shopify account loop end */
  return await set_response;
};


exports.getCarriers = async (
  result,
  exist_cron,
  fby_id,
  cron_name,
  cron_id
) => {
  let set_response = {};
  let infoMessage = `fby_user_id: ${fby_id}, cron_name:${cron_name}`;
  let urlLogMsg = infoMessage;

  try {
    /* shopify account loop start */
    for (const client of result) {
      let Key = await helpers.getDecryptedData(client.api_key);
      let Domain = await helpers.getWoocommerceDomain(client.domain);

      let page_loop = true;
      let page_no = 0;

      // while (page_loop) {
      let apiEndpoint = `${Domain}api/shipping/carriers`; //?max=100&offset=${page_no++}`;
      await helpers.sleep();
      try {
        await axios({
          url: apiEndpoint,
          method: "get",
          headers: {
            Authorization: Key,
            Accept: 'application/json'
          }
        })
          .then(async function (parsedBody) {
            let resmsg = CircularJSON.stringify(parsedBody.data);
            try {

              infoMessage = `${infoMessage}, ${apiEndpoint}`;
              await logger.LogForAlert(
                fby_id,
                '',
                '',
                infoMessage,
                resmsg,
                constants.LOG_LEVEL.INFO,
                constants.FBY_ALERT_CODES.UNKNOWN,
                cron_name,
                cron_id
              );
            }
            catch (error) {
              //console.log('\n ERROR: ', error.message);
            }
            // //console.log('parsedBody: ', resmsg);
            // if (parsedBody.data.carriers.length == 0) {
            //   page_loop = false;
            //   set_response = resmsg;
            //   return set_response;
            // }
            set_response = resmsg;
            //console.log(`\n${urlLogMsg} total items : ${parsedBody.data.carriers.length}`);
            let counter = 0;
            /* mirakl product loop start */
            for await (const carrier of parsedBody.data.carriers) {
              // //console.log('product.data: ', product.data);
              counter++;
              //console.log(`\n${counter}) ${urlLogMsg} product:\n`, JSON.stringify(product));

              var ean = "";
              let fby_user_id = client.fby_user_id;

              let label = carrier.label || ''
              let mirakl_carrier_code = carrier.code;
              let tracking_url = carrier.tracking_url || ' ';

              let inputs = [
                fby_user_id,
                mirakl_carrier_code,
                label,
                tracking_url

              ];

              //console.log('inputs: ', inputs);
              await common.addCarrierDetails(
                inputs,
                fby_id,
                cron_name,
                cron_id,
                function (result) {
                  if (result.error) {
                    let errmsg = CircularJSON.stringify(result.error);
                    logger.logError(`mirakl getCarrierDetails`, errmsg);
                    //console.log(`${urlLogMsg}, addCarriers Error`, errmsg);
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
                          //console.log('\n ERROR: ', JSON.stringify(result.error));
                        }
                      }
                    );
                  }
                }
              );
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
            let errmsg = CircularJSON.stringify(err.message);
            //console.log(`${urlLogMsg}, api catch error`, errmsg),
            logger.logError(`${urlLogMsg}, api catch error`, errmsg);
            try {
              await logger.LogForAlert(
                fby_id,
                '',
                '',
                infoMessage,
                errmsg,
                constants.LOG_LEVEL.ERROR,
                constants.FBY_ALERT_CODES.UNKNOWN,
                cron_name,
                cron_id
              );
            }
            catch (error) {
              //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
            }

          });


      }
      catch (err) {
        //console.log(`${urlLogMsg} controller catch error`, err.meesage);
      }
      //page_no = page_no++;
      // }
    }
  } catch (err) {
    logger.logError(`${urlLogMsg} controller catch error`, err);
  }
  /* shopify account loop end */
  return set_response;
};

const getproductdetails = async (
  miraklclient,
  unique_identifiers_code,
  ean,
  exist_cron,
  fby_id,
  cron_name,
  cron_id,
  callback
) => {
  //let apiEndpoint = `${constants.mirakl_Get_ProductDetails}${uid}`;
  let urlLogMsg = `mirakl getproductdetails fby_user_id: ${fby_id}`;
  try {
    let Key = await helpers.getDecryptedData(miraklclient.api_key);
    let Domain = await helpers.getWoocommerceDomain(miraklclient.domain);

    //P31
    let apiEndpoint = `${Domain}api/products?product_references=${unique_identifiers_code}|${ean}`;

    await axios({
      url: apiEndpoint,
      method: "get",
      headers: {
        Authorization: Key,
        Accept: 'application/json'
      }
    })
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
          return callback(msg);
        }
      });
  } catch (err) {
    logger.logError(`${urlLogMsg} controller catch error`, err);
  }
};

//OF24 push price and stock quantity to Mirakl
exports.pushProductsmirakl = async (
  product,
  user,
  cron_name,
  new_cron_id
) => {
  cron_name = constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL;
  let file_and_method_name = 'mirakl_service.js pushProductsmirakl';
  let cron_id = new_cron_id;
  let set_response = {};
  let fby_id = user.fby_user_id;
  let fby_user_id = user.fby_user_id;
  let sku = '';
  let counter = 1;
  let isStockUpdateSuccessfull = false;
  let stockBody = {
    offers: []
  };
  let infoMessage = `fby_user_id=${fby_user_id} ${cron_name} `;
  let logMessage = infoMessage;
  //console.log(`\n${file_and_method_name}, ${logMessage}`);

  if (product.length == 0 || product == null) {
    logMessage = `${logMessage}, ${constants.NORECORD.message}`;
    let msg = {
      success: {
        message: logMessage,
        data: null,
      },
    };
    set_response = msg;
    return set_response;

  }
  //console.log(`\nfby_user_id: ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL}, Total Stocks to update ${product.length}`)

  /* products loop start */
  try {
    for await (const itemlist of product) {
      exist_cron = 0;
      sku = itemlist.sku;
      productBeingProcessed = `\n${counter}) ${logMessage}, sku ${sku}, product\n ${JSON.stringify(itemlist)}`;
      //console.log(productBeingProcessed);

      try {

        if (itemlist != undefined && itemlist != null && itemlist.cron_name == cron_name && itemlist.cron_id) {
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
        let stockdata = {};
        if (itemlist.fullPrice > 0 && itemlist.fullPrice != itemlist.price) {
          stockdata = {
            price: itemlist.fullPrice,
            discount: {
              price: itemlist.price
            },
            quantity: itemlist.inventory_quantity,
            shop_sku: sku,
            state_code: "11",
            update_delete: "update",
          };
        }
        else {
          stockdata = {
            price: itemlist.price,
            quantity: itemlist.inventory_quantity,
            shop_sku: sku,
            state_code: "11",
            update_delete: "update",
          };
        }

        stockBody.offers.push(stockdata);

        let requestProductDetails =
        {
          seq: counter,
          type: 'REQUEST',
          product_id: itemlist.item_id,
          sku: itemlist.sku,
          item_product_id: itemlist.item_product_id,
          is_product: itemlist.item_id == itemlist.item_product_id,
          data_update: stockdata,
        }

        logger.logInfo(`push-mirakl-stock REQUEST\n`, requestProductDetails);

      }
      catch (err) {
        //console.log('push-mirakl-stock : ERROR \n', err);

      }
      counter++;
    }

    let Key = await helpers.getDecryptedData(user.api_key);
    let Domain = await helpers.getWoocommerceDomain(user.domain);

    let updateRequestUrl = `api/offers`;
    let urlWithDomain = `${Domain}${updateRequestUrl}`;

    let options = {
      method: "post",
      uri: urlWithDomain,
      headers: {
        "Content-Type": "application/json",
        'Accept': `application/json`,
        'Authorization': Key
      },
      body: stockBody,
      json: true,
    };


    let apiRequest = options;
    var apiRequestResponse = {
      fby_user_id: fby_user_id,
      request: apiRequest,
      response: {
        data: null
      }
    };
    try {
      await request(options)
        .then(async (response) => {

          let infoMessage = logMessage;
          let import_id = '';
          try {
            if (response) {
              if (response.data != undefined && response) {

                apiRequestResponse.response.data = JSON.parse(JSON.stringify(response.data));
              }
              else {
                apiRequestResponse.response.data = JSON.parse(JSON.stringify(response));
              }
            }
            // let logData = JSON.stringify(apiRequestResponse);
            // await logger.LogForAlert(
            //   fby_user_id,
            //   '',
            //   sku != undefined ? sku : '',
            //   infoMessage,
            //   logData,
            //   constants.LOG_LEVEL.INFO,
            //   constants.FBY_ALERT_CODES.STOCK_SYNC,
            //   constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL,
            //   cron_id,
            //   false
            // );
            // //console.log(`\n${infoMessage}\n${logData}`);
          }
          catch (error) {
            //console.log(`\nERROR While ${logMessage}: \n`, JSON.stringify(error.message));

          }

          if (
            response != undefined
            && response.data != undefined
            && response.data != null
            && response.data.import_id != undefined
            && response.data.import_id != null
          ) {
            import_id = response.data.import_id;
            isStockUpdateSuccessfull = true;
            //console.log(`\n SUCESS Mirakl Stock Update ${productBeingProcessed} ${JSON.stringify(response.data)}`);

          }
          else if (
            response != undefined
            && response != null
            && response.import_id != undefined
            && response.import_id != null
          ) {
            import_id = response.import_id;
            isStockUpdateSuccessfull = true;

          }
          else {
            import_id = '';
            isStockUpdateSuccessfull = false;
          }

          // if (response.data != undefined && response.data.import_id != undefined && response.data.import_id != null) {
          //   isStockUpdateSuccessfull = true;
          // }

          let pritnResult = {
            product_count: counter - 1,
            type: 'RESPONSE',
            url: urlWithDomain,
            import_id: import_id,
            is_stock_update_sucess: isStockUpdateSuccessfull
          };

          try {
            apiRequestResponse['update_summary'] = pritnResult;
            let logData = JSON.stringify(apiRequestResponse);
            await logger.LogForAlert(
              fby_user_id,
              '',
              '',
              "update_summary",
              logData,
              constants.LOG_LEVEL.INFO,
              constants.FBY_ALERT_CODES.STOCK_SYNC,
              constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL,
              cron_id
            );

            //console.log(`\n push-mirakl-stock RESPONSE ${updateRequestUrl}\n`, pritnResult);
          }
          catch (error) { }


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

          if (isStockUpdateSuccessfull) {
            let counter = 0;
            for await (const itemlist of product) {
              try {

                let updt_time = dateTime.create();
                let sku = itemlist.sku == undefined ? product[counter].sku : itemlist.sku;
                counter++;

                productBeingProcessed = `\n${counter}) ${logMessage} updateProductAftrSndChanl, sku ${sku}, product\n ${JSON.stringify(itemlist)}`;
                //console.log(productBeingProcessed);

                let inputs = [
                  fby_id,
                  sku,
                  cron_name,
                  cron_id,
                  updt_time.format("Y-m-d H:M:S"),
                ];
                await common.updateProductAftrSndChanl(
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
                      //console.log(`\nERROR While ${logMessage}: \n`, JSON.stringify(inputs));
                    }
                  }
                );
              }
              catch (error) {
                //console.log(`\nERROR While ${logMessage} : \n updateProductAftrSndChanl \n`, JSON.stringify(error.message));

              }
            }
          }
          // await common.updateLastSyncOperationTime(fby_user_id, null, cron_name, function (result) {
          //   if (result != null && result.error) {
          //     //console.log("Failed to update sync time in the database");
          //   }
          // });
        })
        .catch(async (error) => {

          try {
            apiRequestResponse.response.data = JSON.parse(JSON.stringify(error.message));
            //console.log('error.message: ', error.message);
            let logData = JSON.stringify(apiRequestResponse);
            logMessage = `${logMessage} ${error.message}`;
            await logger.LogForAlert(
              fby_user_id,
              '',
              sku != undefined ? sku : '',
              logMessage,
              logData,
              constants.LOG_LEVEL.ERROR,
              constants.FBY_ALERT_CODES.STOCK_SYNC,
              constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL,
              cron_id
            );
            //console.log(`\n${logMessage}\n${logData}`);
          }
          catch (error) {
            //console.log(`\nERROR While ${logMessage}: \n`, JSON.stringify(error.message));

          }
          set_response[itemlist.sku] = logMessage;

        });
    }
    catch (error) {
      logMessage = `${logMessage} ${error.message}`;
      set_response = logMessage;
      //console.log(`\nERROR While ${logMessage}: \n`, JSON.stringify(error.message));

    }

  }
  catch (error) {
    logMessage = `${logMessage} ${error.message}`;
    set_response = logMessage;
    //console.log(`\nERROR While ${logMessage}: \n`, JSON.stringify(error.message));

  }
  /* products loop end */
  return set_response;
};

/*
OR11, 

Accept orders(OR21) is to be implemented PUT `/api/orders/{order_id}/accept` 
Note: order status is one of: 
  STAGING, 
  WAITING_ACCEPTANCE, 
  WAITING_DEBIT, 
  WAITING_DEBIT_PAYMENT, 
  SHIPPING, 
  SHIPPED, 
  TO_COLLECT, 
  RECEIVED, 
  CLOSED, 
  REFUSED, 
  CANCELED  

Every {time} CC should get from Mirakl all orders in WAITING_ACCEPTANCE status, accept each order line and push them to FBY.
*/
exports.getOrders = async (result, exist_cron, fby_id, cron_name, cron_id) => {
  let fby_user_id = fby_id;
  cron_name = constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL;

  let logMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;
  let set_response = {};
  let updated_at = moment();
  updated_at = updated_at.subtract(10, "days");
  updated_at = updated_at.format(MOMENT_DATE_FORMAT);
  let now = moment();
  now = now.format(MOMENT_DATE_FORMAT);
  let isCanSync = false;
  let batchInfoListDB = [];
  let order_no_log = '';
  let sku_log = '';
  let isNextPage = true;
  let nextPageLink = '';
  /* Shopify account loop start */
  for await (const client of result) {
    if (client.orderSync == 1) {

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
          `mirakl getOrders fby_user_id: ${fby_id}, since=${orderSyncStartDate}`,
          set_response
        );
        return set_response;
      } else {
        if (now > orderSyncStartDate) {
          isCanSync = true;
          updated_at = moment(orderSyncStartDate);
          updated_at = updated_at.format(MOMENT_DATE_FORMAT);
        } else {
          isCanSync = false;
          set_response[client.domain] = {
            cron: cron_name,
            since: updated_at,
            message: "Order import date is not set.",
          };
          logger.logInfo(
            `mirakl getOrders orderSyncStartDate is less, fby_id: ${fby_id}, url: ${constants.mirakl_Get_Orders}`,
            set_response
          );
          return set_response;
        }
      }

      let dateobj = new Date(updated_at);
      let DateISOFormat = dateobj.toISOString();
      //let url = `${constants.mirakl_Get_Orders}?since=${unixTimestamp}`;
      let urlLogMsg = `mirakl getOrders fby_user_id: ${fby_id}, orderSyncStartDate: ${updated_at}`;
      //console.log(`\n${urlLogMsg}`);

      let Key = await helpers.getDecryptedData(client.api_key);
      let Domain = await helpers.getWoocommerceDomain(client.domain);
      let params = '';
      // let page_loop = true;
      let page_no = 0;

      let apiEndpoint = `${Domain}api/orders?max=100&offset=0`;
      while (isNextPage) {
        if (nextPageLink != '') {
          //console.log(`\n\t NextPageLink:\t`, nextPageLink);
        }

        //console.log(`\tapiEndpoint: `, apiEndpoint);
        await helpers.sleep(2);
        params = {
          request:
          {
            url: apiEndpoint,
            method: "get",
            headers: {
              Authorization: Key,
              Accept: 'application/json'
            }
          }
        };


        await axios({
          url: apiEndpoint,
          method: "get",
          headers: {
            Authorization: Key,
            Accept: 'application/json'
          }
        })
          .then(async (response) => {
            try {
              if (response.headers.link != undefined && response.headers.link != null) {
                let split = response.headers.link.split(',');

                nextPageLink = '';
                isNextPage = false;

                for (let link of split) {
                  if (link && link.includes("next")) {

                    nextPageLink = link
                      .replace('<', '').replace('>;', '')
                      .replace('rel=\"next\"', '')
                      .trim();

                    isNextPage = true;

                  }

                }

              }
              else {
                nextPageLink = '';
                isNextPage = false;

              }
              apiEndpoint = nextPageLink;

            }
            catch (error) {
              nextPageLink = '';
              isNextPage = false;
            }
            try {

              let infoItem = new Entities.CCLogs(
                fby_user_id,
                order_no_log,
                sku_log,
                params,
                response.data,
                constants.LOG_LEVEL.INFO,
                constants.FBY_ALERT_CODES.ORDER_SYNC,
                cron_name,
                cron_id
              );
              batchInfoListDB.push(infoItem);
            }
            catch (error) {
              //console.log();
              //console.log(error.message);

            }

            // if (response.data.length == 0 || response.data.orders.length == 0) {
            //   page_loop = false;
            //   return set_response;
            // }
            let order_data = response.data.orders;


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
                    let orderAccespt_orderLines = [];
                    let isAlertRequire = false;
                    try {
                      order_no_log = jsonData.order_id;
                      //console.log(`mirakl getOrders fby_user_id: ${fby_id} order_id `, jsonData.order_id);
                      //if (jsonData.id == 10117) {
                      //logger.logInfo("getOrders")//console.log('jsonData.id: ', jsonData.id, jsonData.status, jsonData.payment_method.toLowerCase());
                      // check if order is paid and unfullfiled
                      let isCOD = jsonData.payment_workflow.toLowerCase() == "pay_on_shipment";

                      if (
                        jsonData.order_state.toLowerCase() != "failed"
                      ) {
                        // if (isCOD) {
                        // //  //console.log('jsonData: ', CircularJSON.stringify(jsonData));
                        // }


                        let date_created = dateTime
                          .create(jsonData.created_date)
                          .format("Y-m-d H:M:S");
                        let date_paid =
                          jsonData.customer_debited_date == null
                            ? null
                            : dateTime
                              .create(jsonData.customer_debited_date)
                              .format("Y-m-d H:M:S");

                        let channel = client.channelName;
                        let channel_code = client.channel_code;
                        let owner_code = client.owner_code;
                        let account_id = client.id;
                        let currency_code = jsonData.currency_iso_code;
                        fby_user_id = fby_id;
                        let order_no = jsonData.order_id;
                        let seller_order_id = jsonData.commercial_id;
                        let channel_currency_code = client.currency;
                        let total_order = jsonData.total_price;
                        let total_items = jsonData.order_lines.length;
                        let total_tax = jsonData.total_tax || 0;
                        let total_discount = jsonData.promotions.total_deduced_amount;
                        let total_items_price = jsonData.total_price;
                        let payment_method = jsonData.payment_type;
                        let sales_record_no = jsonData.commercial_id;
                        let purchase_date = date_created;
                        let payment_time = date_paid;
                        let payment_status = "";
                        let order_status = jsonData.order_state;
                        let location_id = 0;
                        let payment_id = jsonData.commercial_id;
                        let item_total_ship_price =
                          jsonData.shipping_price || 0;

                        //buyer detail
                        let buyer_email = jsonData.customer_notification_email;
                        let buyer_id = jsonData.customer.customer_id;
                        let buyer_name = `${jsonData.customer.firstname} ${jsonData.customer.lastname}`;
                        //shiping address

                        let recipient_name = `${jsonData.customer.firstname} ${jsonData.customer.lastname}`;
                        let shiper_company = '';
                        let shiper_strt1 = '';
                        let shiper_strt2 = '';
                        let shiper_city = null;
                        let shiper_state = '';
                        let shiper_state_code = '';
                        let shiper_zip = null;
                        let shiper_country = '';
                        let shiper_country_iso2 = '';
                        let shiper_phone = '';

                        let managedByChannel = false;

                        if (jsonData.customer.shipping_address != undefined && jsonData.customer.shipping_address != null) {
                          recipient_name = `${jsonData.customer.shipping_address.firstname} ${jsonData.customer.shipping_address.lastname}`;
                          shiper_company = jsonData.shipping_company;
                          shiper_strt1 = jsonData.customer.shipping_address.street_1;
                          shiper_strt2 = jsonData.customer.shipping_address.street_2;
                          shiper_city = jsonData.customer.shipping_address.city;
                          shiper_state = jsonData.customer.shipping_address.state;
                          shiper_state_code = jsonData.customer.shipping_address.state;
                          shiper_zip = jsonData.customer.shipping_address.zip_code;
                          shiper_country = jsonData.customer.shipping_address.country;
                          shiper_country_iso2 = jsonData.customer.shipping_address.country_iso_code;
                          shiper_phone = jsonData.customer.shipping_address.phone;
                        }
                        let bill_generator_name = null;
                        let bill_company = '';
                        let bill_strt1 = '';
                        let bill_strt2 = '';
                        let bill_city = null;
                        let bill_state = '';
                        let bill_state_code = '';
                        let bill_zip = null;
                        let bill_country = '';
                        let bill_country_iso2 = '';
                        let bill_phone = '';
                        if (jsonData.customer != undefined &&
                          jsonData.customer != null &&
                          jsonData.customer.billing_address != undefined &&
                          jsonData.customer.billing_address != null
                        ) {
                          bill_generator_name = `${jsonData.customer.billing_address.firstname} ${jsonData.customer.billing_address.lastname}`;
                          bill_company = jsonData.customer.billing_address.company || '';
                          bill_strt1 = jsonData.customer.billing_address.street_1 || '';
                          bill_strt2 = jsonData.customer.billing_address.street_2 || '';
                          bill_city = jsonData.customer.billing_address.city;
                          bill_state = jsonData.customer.billing_address.state || '';
                          bill_state_code = jsonData.customer.billing_address.state || '';
                          bill_zip = jsonData.customer.billing_address.zip_code;
                          bill_country = jsonData.customer.billing_address.country || '';
                          bill_country_iso2 = jsonData.customer.billing_address.country_iso_code || '';
                          bill_phone = jsonData.customer.billing_address.phone || '';
                        }
                        if (bill_generator_name == undefined || bill_generator_name == null) {
                          bill_generator_name = recipient_name;
                        }
                        if (bill_city == undefined || bill_city == null ||
                          bill_zip == undefined || bill_zip == null) {
                          bill_company = shiper_company;
                          bill_strt1 = shiper_strt1;
                          bill_strt2 = shiper_strt2;
                          bill_city = shiper_city;
                          bill_state = shiper_state;
                          bill_state_code = shiper_state_code;
                          bill_zip = shiper_zip;
                          bill_country = shiper_country;
                          bill_country_iso2 = shiper_country_iso2;
                          bill_phone = shiper_phone;

                        }
                        let order_product_data = jsonData.order_lines;

                        if (shiper_phone == null || shiper_phone == '') {
                          if (jsonData.customer.billing_address != undefined
                            && jsonData.customer.billing_address != null
                            && jsonData.customer.billing_address.phone != undefined
                            && jsonData.customer.billing_address.phone != '') {
                            shiper_phone = jsonData.customer.billing_address.phone;
                          }
                        }
                        if (
                          date_paid != null &&
                          jsonData.order_state.toLowerCase() == "closed"
                        ) {
                          order_status = "closed";
                          payment_status = "paid";
                        }
                        if (
                          date_paid != null &&
                          jsonData.order_state.toLowerCase() == "processing" &&
                          !isCOD
                        ) {
                          order_status = "paid";
                          payment_status = "paid";
                        } else if (
                          date_paid != null &&
                          jsonData.order_state.toLowerCase() == "processing" &&
                          isCOD
                        ) {
                          order_status = "processing";
                          payment_status = "pending";
                        } else if (jsonData.order_state.toLowerCase() == "refunded") {
                          order_status = "refunded";
                          payment_status = "refunded";
                        } else if (
                          date_paid == null &&
                          jsonData.order_state.toLowerCase() == "processing" &&
                          isCOD
                        ) {
                          order_status = "processing";
                          payment_status = "pending";
                        } else if (
                          date_paid == null &&
                          jsonData.order_state.toLowerCase() == "processing"
                        ) {
                          order_status = "processing";
                          payment_status = jsonData.payment_workflow.toUpperCase();
                        } else {
                          payment_status = jsonData.payment_workflow.toUpperCase();
                          order_status = jsonData.order_state.toLowerCase();
                        }
                        let order_status_for_alert = jsonData.order_state.toLowerCase();
                        if (order_status_for_alert == "shipping") {
                          isAlertRequire = true;
                        }
                        for (const jsonItemData of order_product_data) {
                          /* line items loop start*/

                          //#region OrderLineItem Array prepare
                          try {
                            let order_line_item_states = jsonItemData.order_line_state.toLowerCase();
                            if (order_line_item_states == "shipping") {
                              isAlertRequire = true;
                            }
                            if (jsonItemData.order_line_state != undefined
                              && jsonItemData.order_line_state != null
                              && jsonItemData.order_line_state.toLowerCase() == 'waiting_acceptance') {
                              let orderAccespt_orderLine = {
                                "accepted": true,
                                "id": jsonItemData.order_line_id
                              };

                              orderAccespt_orderLines.push(orderAccespt_orderLine);
                              //Accept orders (OR21)  ##TODO implement using axios
                              /*
                              PUT {{URL}}/api/orders/:order_no_log/accept    order_no_log == order_id
                              {
                                "order_lines": [
                                  {
                                    "accepted": true,
                                    "id": "Order_00012-B-1" // order_lines[0].order_line_id
                                  }
                                ]
                              }
                              */
                              // let result = await acceptOrder(order_no, [jsonData.order_id]);
                              // if (result.error) {
                              //   set_response[jsonData.id] = result.error;
                              // }
                            }
                          }
                          catch (error) {
                            //console.log();
                            //console.log(error.message);

                          }
                          //#endregion

                          let total_itme_tax = 0;
                          for (var tax_item in jsonItemData.taxes) {
                            total_itme_tax = total_itme_tax + tax_item;
                          }

                          let item_tax = parseFloat(total_itme_tax);
                          //total_tax = total_tax + item_tax;
                          let exchange_rate = 0;

                          let sku = jsonItemData.offer_sku;
                          let order_line_item_id = jsonItemData.order_line_id;
                          let order_item_id = jsonItemData.order_line_id;
                          let barcode = "";

                          let transaction_id = jsonData.commercial_id;
                          let product_name = jsonItemData.product_title;
                          let quantity_purchased = jsonItemData.quantity;

                          let line_item_price = parseFloat(
                            jsonItemData.price
                          );
                          let line_item_total_tax = parseFloat(
                            total_itme_tax
                          ); //item_tax * quantity_purchased;
                          let item_total_price_extax =
                            line_item_price;// * quantity_purchased;
                          let item_price = line_item_price;// * quantity_purchased;

                          let promotion_discount = 0;
                          if (jsonItemData.promotions != undefined && jsonItemData.promotions.length > 0) {
                            promotion_discount = jsonItemData.promotions.total_deduced_amount;
                          }

                          let item_total_price_intax =
                            parseFloat(item_total_price_extax) +
                            parseFloat(line_item_total_tax) -
                            parseFloat(promotion_discount);

                          try {
                            let infoItem = new Entities.CCLogs(
                              fby_user_id,
                              order_no_log,
                              sku_log,
                              `fby_user_id ${fby_user_id}, order_no ${order_no_log}, sku ${sku}, ${cron_name}`,
                              jsonItemData,
                              constants.LOG_LEVEL.INFO,
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

                              try {
                                let infoItem = new Entities.CCLogs(
                                  fby_user_id,
                                  order_no_log,
                                  sku_log,
                                  `fby_user_id ${fby_user_id}, order_no ${order_no_log}, sku ${sku}, ${cron_name}`,
                                  { orderDetails: dataArray, error: result.error },
                                  constants.LOG_LEVEL.INFO,
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
                          bill_strt1,
                          bill_strt2,
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
                              try {
                                let infoItem = new Entities.CCLogs(
                                  fby_user_id,
                                  order_no_log,
                                  sku_log,
                                  `fby_user_id ${fby_user_id}, order_no ${order_no_log}, sku ${sku}, ${cron_name}`,
                                  { orderDetails: dataArray, error: result.error },
                                  constants.LOG_LEVEL.INFO,
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
                            }
                            if (result.success) {
                              orderdetail_id = result.success.data;
                            }
                          },
                          isAlertRequire
                          , jsonData
                        );

                        //#region OrderLineItem Array prepare
                        try {
                          if (orderAccespt_orderLines.length > 0) {

                            //Accept orders (OR21)  ##TODO implement using axios
                            /*
                            PUT {{URL}}/api/orders/:order_no_log/accept    order_no_log == order_id
                            {
                              "order_lines": [
                                {
                                  "accepted": true,
                                  "id": "Order_00012-B-1" // order_lines[0].order_line_id
                                }
                              ]
                            }
                            */
                            // let result = await acceptOrder(order_no, orderAccespt_orderLines);
                            // if (result.error) {
                            //   set_response[jsonData.id] = result.error;
                            // }
                            let apiEndpointOR21 = `${Domain}api/orders/${order_no_log}/accept`;

                            let axiosConfig = {
                              headers: {
                                "Content-Type": "application/json",
                                'Authorization': Key
                              }
                            };

                            //Accept orders (OR21) 
                            await axios({
                              url: apiEndpointOR21,
                              method: "put",
                              headers: {
                                Authorization: Key,
                                Accept: 'application/json',
                                "Content-Type": 'application/json'
                              },
                              data: {
                                "order_lines": orderAccespt_orderLines,
                              }
                            }).then(async (response) => {
                              if (response != undefined && response.status != undefined
                                && result.status > 200
                                && result.status < 210
                              ) {
                                let infoItem = new Entities.CCLogs(
                                  fby_user_id,
                                  order_no_log,
                                  sku_log,
                                  `fby_user_id ${fby_user_id}, order_no ${order_no_log}`,
                                  response.data,
                                  constants.LOG_LEVEL.INFO,
                                  constants.FBY_ALERT_CODES.ORDER_SYNC,
                                  constants.CC_OPERATIONS.GET_ACCEPT_ORDER_MIRAKL,
                                  cron_id
                                );
                                batchInfoListDB.push(infoItem);
                              }
                            })
                              .catch(async function (error) {
                                try {

                                  let errorMessage = error.response.data.message;
                                  await logger.LogForAlert(
                                    fby_user_id,
                                    order_no_log,
                                    sku_log,
                                    `fby_user_id ${fby_user_id}, order_no ${order_no_log}`,
                                    errorMessage,
                                    constants.LOG_LEVEL.ERROR,
                                    constants.FBY_ALERT_CODES.ORDER_SYNC,
                                    constants.CC_OPERATIONS.GET_ACCEPT_ORDER_MIRAKL,
                                    cron_id
                                  );
                                  set_response[jsonData.id] = result.error;

                                }
                                catch (error) {
                                  //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                                }
                              })
                          } else {
                            let infoItem = new Entities.CCLogs(
                              fby_user_id,
                              order_no_log,
                              sku_log,
                              `fby_user_id ${fby_user_id}, order_no ${order_no_log}`,
                              response.data,
                              constants.LOG_LEVEL.INFO,
                              constants.FBY_ALERT_CODES.ORDER_SYNC,
                              constants.CC_OPERATIONS.GET_ACCEPT_ORDER_MIRAKL,
                              cron_id
                            );
                            batchInfoListDB.push(infoItem);
                          }
                        }
                        catch (error) {
                          //console.log();
                          //console.log(error.message);

                        }
                        //#endregion
                      }
                    } catch (error) {
                      logger.logError(
                        `${urlLogMsg} , addOrder error:`,
                        CircularJSON.stringify(error.message)
                      );
                    }

                    if (jsonData.order_state == "cancelled") {
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

                            try {
                              let infoItem = new Entities.CCLogs(
                                fby_user_id,
                                order_no_log,
                                sku_log,
                                `fby_user_id ${fby_user_id}, order_no ${order_no_log}, sku ${sku}, ${cron_name}`,
                                { orderDetails: dataArray, error: result.error },
                                constants.LOG_LEVEL.INFO,
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
                            set_response[jsonData.id] = result.error;
                          }
                        }
                      );
                    }
                  }
                  catch (error) {
                    //console.log();
                    //console.log(error.message);

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
              //console.log(`${urlLogMsg} , catch error:`, resmsg);
              try {

                let errorMessage = error.message;
                //console.log(`\n ERROR: ${errorMessage}`);
                //console.log(err);

                let infoItem = new Entities.CCLogs(
                  fby_user_id,
                  order_no_log,
                  sku_log,
                  `fby_user_id ${fby_user_id}, sku ${sku_log}, ${cron_name}, ErrorMessage ${errorMessage}`,
                  '',
                  constants.LOG_LEVEL.INFO,
                  constants.FBY_ALERT_CODES.ORDER_SYNC,
                  cron_name,
                  cron_id
                );
                batchInfoListDB.push(infoItem);
              }
              catch (error) {
                //console.log(`\nERROR ${logMessage}\n`, JSON.stringify(error));

              }
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
            // if (page_no > 1000) {
            //   page_loop = false;
            // }
            isNextPage = false;
            let errorJson = CircularJSON.stringify(error.message);
            //console.log(`${urlLogMsg} , api catch error:`, errorJson);
            try {

              let errorMessage = error.message;
              await logger.LogForAlert(
                fby_user_id,
                '',
                '',
                errorMessage,
                params,
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
                CircularJSON.stringify(error.message)
              );
              //store update product status error log
              let inputs = [
                cron_name,
                cron_id,
                constants.CATCH_TYPE,
                CircularJSON.stringify(error.message),
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
            }
          });

        page_no = page_no + 100;
      }
    }
    else {
      set_response = constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG;
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

exports.pushTrackingMirakl = async (order, user, cron_name, cron_id, req, res) => {
  "use strict";
  let operationId = helpers.getUUID();
  let set_response = {
    details: []
  };
  let error = false;
  for await (const itemlist of order) {
    let fby_user_id = itemlist.fby_user_id;
    let order_number = itemlist.order_no;
    let Key = await helpers.getDecryptedData(user.api_key);
    let Domain = await helpers.getWoocommerceDomain(user.domain);
    let logMessage = `fby_user_id: ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_TRAKING_TO_CHANNEL}`;

    await common.getOrderDetailsTracking(fby_user_id, order_number, cron_name, cron_id, function (result) {

      if (result.error) {
        let details = {
          order_number: order_number,
          status: (constants.PUSH_TRACKNO_CHANNEL_ERROR),
          error: result != undefined && result.error != undefined && result && result.error ? result.error : ""

        };
        set_response.request = { operationId: operationId };
        //logger.logInfo("pushTrackingShopify-->getOrderDetailsTracking error", details);
        //set_response.details.push(JSON.stringify(details));
        //console.log('set_response -1: ', set_response);

        // store log
        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.error), fby_user_id];
        //console.log('inputs: ', JSON.stringify(inputs));
      }

      if (result.success) {
        let order_details = result.success.data;

        //console.log('order_details: ', order_details);
        let tracking_response = {
          order_status: "", order_details: {

          }
        };
        tracking_response.order_details = order_details.map(async (item) => {
          let updateBody = {
            "carrier_code": item.tracking_courier,
            "carrier_name": item.tracking_courier,
            "carrier_url": item.tracking_url,
            "tracking_number": item.tracking_id
          };

          if (item.isTrackingMapped == 0) {
            updateBody = {
              "carrier_name": item.tracking_courier,
              "carrier_url": item.tracking_url,
            };
          }
          try {
            //OR23
            let url = `${Domain}api/orders/${order_number}/tracking`;
            let options = {
              method: "put",
              uri: url,
              headers: {
                "Content-Type": "application/json",
                'Authorization': Key
              },
              body: updateBody,
              json: true,
            };
            let apiRequest = options;
            var apiRequestResponse = {
              fby_user_id: fby_user_id,
              request: apiRequest,
              response: {
                data: null
              }
            };


            let axiosConfig = {
              headers: {
                "Content-Type": "application/json",
                'Authorization': Key
              }
            };

            //api for inserting skus
            await axios
              .put(
                url,
                updateBody,
                axiosConfig
              )
              .then(async (result) => {

                apiRequestResponse.response.data = result.data;
                apiRequestResponse.response["status"] = result.status;
                //console.log('\nMirakl apiRequestResponse: \n', JSON.stringify(apiRequestResponse));
                if (result != undefined && result.status != undefined
                  && result.status > 200
                  && result.status < 210
                ) {
                  try {
                    await logger.LogForAlert(
                      fby_user_id,
                      order_number,
                      '',
                      '',
                      CircularJSON.stringify(result),
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
                  set_response.details.push(apiRequestResponse);
                  let updt_time = dateTime.create();
                  let inputs = [fby_user_id, order_number, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];
                  await common.updateOrderDetailStatus(inputs, fby_user_id, cron_name, cron_id, function (result) {
                    if (result.error) {
                      //mail
                      mail.updateOrderErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                      //store update product status error log
                      let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_user_id];
                      common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                        if (result.error) {
                          mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                        }
                      });
                    }
                  });

                  try {
                    //OR24 update using axios
                    let urlOR24 = `${Domain}api/orders/${order_number}/ship`;


                    await axios({
                      url: urlOR24,
                      method: "put",
                      headers: {
                        Authorization: Key,
                        Accept: 'application/json',
                        "Content-Type": 'application/json'
                      },
                      data: null,
                    })
                      .then(async (result) => {
                        if (result != undefined && result.status != undefined
                          && result.status > 200
                          && result.status < 210
                        ) {
                          try {
                            let responseBodyjson = CircularJSON.stringify(result);
                            await logger.LogForAlert(
                              fby_user_id,
                              order_number,
                              '',
                              '',
                              responseBodyjson,
                              constants.LOG_LEVEL.INFO,
                              constants.FBY_ALERT_CODES.TRACK_SYNC,
                              constants.CC_OPERATIONS.GET_VALIDATE_SHIPMENT_MIRAKL,
                              cron_id,
                              false
                            );
                          } catch (error) {
                            //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
                            //console.log(error);
                          }
                          let inputForShipped = [fby_user_id, order_number, updt_time.format('Y-m-d H:M:S')]
                          await common.updateOrderShippedStatus(inputForShipped, fby_user_id, cron_name, cron_id, function (result) {
                            if (result.error) {
                              //console.log('\n ERROR ', JSON.stringify(result.error));
                              //store update product status error log
                              let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_user_id];
                              common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                if (result.error) {
                                  //console.log('\n ERROR ', JSON.stringify(result.error));
                                }
                              });
                            }
                          });
                        }
                      })
                      .catch(async function (err) {
                        errormessage = err.response.data.message;
                        //console.log('urlOR24 errormessage: ', errormessage);
                        Promise.resolve(err);
                        try {
                          let errorMessage = `ErrorMessage: ${err.message}`;
                          //console.log('errorMessage: ', errorMessage);
                          await logger.LogForAlert(
                            fby_user_id,
                            order_number,
                            '',
                            errorMessage,
                            err.response.data,
                            constants.LOG_LEVEL.ERROR,
                            constants.FBY_ALERT_CODES.TRACK_SYNC,
                            constants.CC_OPERATIONS.GET_VALIDATE_SHIPMENT_MIRAKL,
                            cron_id
                          );

                        } catch (error) {
                          //console.log('\n ERROR: validateTheShipmentOfMirakl', error.message);
                        }
                      });

                  } catch (error) {
                    //console.log("Failed to validate ShipmentOrder due to " + error.message);
                  }


                  return set_response[order_number] = (constants.PUSH_TRACKNO_CHANNEL_SUCCESS);
                }
              })
              .catch(async function (err) {
                let errormessage = err.response.data.message;
                //console.log(errormessage);



                "use strict";
                Promise.resolve(err);
                try {
                  errormessage = `ErrorMessage: ${errormessage}`;
                  await logger.LogForAlert(
                    fby_user_id,
                    order_number,
                    '',
                    errormessage,
                    err,
                    constants.LOG_LEVEL.ERROR,
                    constants.FBY_ALERT_CODES.TRACK_SYNC,
                    cron_name,
                    cron_id
                  );

                } catch (error) {
                  //console.log('\n ERROR: validateTheShipmentOfMirakl', error.message);
                }
                let isAlready = false;
                if (err.message != undefined
                  && err.message.includes("Order is already in this state = fulfiled")
                ) {
                  err.message = "Order is already in this state = fulfiled";
                  isAlready = true;
                  error = false;
                }
                else {
                  error = true;
                }

                if (set_response == undefined) {
                  set_response = {
                    details: []
                  };
                }
                if (set_response.details == undefined) {
                  set_response.details = [];
                }

                //store log
                let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_user_id];

              })
              ;
          }
          catch (error) {
            //console.log('services\\mirakl_service.js 1089 error: ', error.message);

          }

        });
        setTimeout(() => {
          "use strict";
          if (!res.headersSent) {
            if (!error) {
              //console.log('set_response1: ', set_response);
              if (set_response == undefined) {
                set_response = {
                  details: []
                };
              }
              if (set_response.details == undefined) {
                set_response.details = [];
              }
              set_response.details.push(tracking_response);
            }
          }
        }, 5000);

      }
    })
  }

  setTimeout(() => {
    "use strict";
    if (!res.headersSent) {

      Promise.resolve(set_response.details).then(function (value) {
        //console.log('set_response2: ', set_response);
        helpers.sendSuccess(res, 200, "sucess", set_response, req);
      });


    }

  }, 3000);

}
