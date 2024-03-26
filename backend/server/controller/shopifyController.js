const fbyController = require("../controller/fbyController.js");
const shopifyController = require("../controller/shopifyController");
const commonController = require("../controller/commonController.js");

const constants = require("../constants/constants.js");
const common = require("../constants/common.js");
const mail = require("../constants/email.js");
const request = require("request-promise");
const dateTime = require("node-datetime");

// import { v4 as uuid } from 'uuid';
const v4 = require('uuid').v4;
const axios = require("axios");
require("dotenv/config");
const moment = require("moment");
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
//const crypto = require('crypto');
const helpers = require("../../misc/helpers");
const logger = require("../../misc/logger");
const { headers } = require("../../services/cron_jobs/config");
//const Shopify = require('shopify-api-node');
const MAX_RETRIES = 10;
//const fs = require('fs');
axios.defaults.timeout = constants.WOOCOMMERCE_API_TIMEOUT;
//const { constant } = require("lodash");

const fbyService = require("../../services/fby_service");
const NodeCache = require("node-cache");
const ccCache = new NodeCache({ stdTTL: 3000, checkperiod: 300 });
const miscConstants = require("../../misc/constants");
const Entities = require("../../entities/Entities");
const dbCCLogs = require('../../startup/dbcclogs');
const { constant } = require("lodash");
const { cache } = require("joi");
const LIMIT = 250;
let uuid = v4;
const currentfileName = '\\channel_connector-1\\server\\controller\\shopifyController.js';


/**--------------Products------------------**/

/*
* Get Products from Shopify
* this function will check fby_user_id through 'user' and 'shopify' table.
* if all ok, then it will get products from shopify channel and insert into products table.
*/
axios.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  try {

    // To prevent dateTime automatic conversion
    let resJson = JSON.stringify(response.data);
    response.data = JSON.parse(resJson);

  }
  catch (err) {
    //console.log('axios.interceptors error: ', JSON.stringify(err));

  }
  return response;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error);
});


async function getShopifyLocation(req, res) {
  let cron_name = "Get_Shopify_Location";
  let file_and_method_name = 'shopifyController.js getShopifyLocation';
  let cron_id = uuid();
  let fby_user_id = req.query.fby_user_id;
  let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;

  try {
    // `${cron_name}-${fby_id}`;
    let jobRunning = ccCache.get(cacheKey_Job);
    if (jobRunning == undefined || !jobRunning || jobRunning == null) {
      ccCache.set(cacheKey_Job, true);
    }
    else {
      let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
      set_response = {
        sucess: {
          message: msg
        }
      };
      //console.log(msg);
      return set_response;
    }
    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
    await common.insertCron(inputs, cron_name, cron_id, function (result) {
      if (result.error) {
        mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
      }
    });

    //process url request
    if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
      res.send(constants.EMPTY);
    } else {
      //get user
      await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
        if (result.error) {
          // store user error log
          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            }
          });
          //send response
          if (!res.headersSent) {
            res.send(result.error);
          }
        } else {
          for await (const client of result.success.data) {
            let fby_id = client.fby_user_id;
            //get shopify account detail
            await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
              if (result.error) {
                // store shopify account error log
                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                  }
                });
                //send response
                if (!res.headersSent) {
                  res.send(result.error);
                }
              } else {
                let set_response = {};
                for await (const shopifyAccount of result.success.data) {
                  /**for each shopifyAccount
                   * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                   */
                  await helpers.sleep();
                  //if (shopifyAccount.stockUpdate == 1) {
                  if (true) {
                    await common.getProduct(shopifyAccount, "location", cron_name, cron_id, async (result) => {
                      if (result.error) {
                        // store get product error log
                        let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                        common.cronErrorLog(inputs, cron_name, cron_id, (result) => {
                          if (result.error) {
                            mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                          }
                        });
                        return false;
                      } else {
                        //asynchronous function for updating shopify inventory
                        await getLocationShopify(result.success.data, shopifyAccount, cron_name, cron_id)
                          .then((params) => {
                            if (Object.keys(params).length > 0) {
                              set_response[shopifyAccount.domain] = (params);
                            }
                          });
                      }
                    });
                  }
                  else {
                    //console.log('\n shopifyController.js--> getShopifyLocation--> CC_STOCK_UPDATE_NOT_ALLOWED_MSG: ', constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG);
                    set_response[shopifyAccount.domain] = constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG;
                  }
                }
                /**
                * set time out is required to await to get all the responses from 'pushProductsShopify'
                */
                setTimeout(() => {
                  if (!res.headersSent) {
                    res.send(set_response);
                  }
                }, 15000);
              }
            });
          }
        }
      });
    }

  }
  catch (error) {
    //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
  }
  finally {
    ccCache.del(cacheKey_Job);
  }
}

/*
* Get Products from Shopify
* this function will check fby_user_id through 'user' and 'shopify' table.
* if all ok, then it will get products from shopify channel and insert into products table.
*/
exports.getShopifyProducts = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL;
  let file_and_method_name = 'shopifyController.js getShopifyProducts';
  let cron_id = uuid();
  let fby_user_id = req.query.fby_user_id;
  let query_product_id = req.query.product_id != undefined ? req.query.product_id : 0;
  let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;
  try {
    // `${cron_name}-${fby_id}`;
    let jobRunning = ccCache.get(cacheKey_Job);
    if (jobRunning == undefined || !jobRunning || jobRunning == null) {
      ccCache.set(cacheKey_Job, true);
    }
    else {
      let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
      set_response = {
        sucess: {
          message: msg
        }
      };
      //console.log(msg);
      return set_response;
    }
    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [fby_user_id, cron_name, cron_id, 1];
    common.insertCron(inputs, cron_name, cron_id, function (result) {
      if (result.error) {
        mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
      }
    });
    //process url request
    if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
      if (!res.headersSent) {
        res.send(constants.EMPTY);
      }
    } else {
      //get user
      await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
        if (result.error) {
          // store user error log
          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            }
          });
          //send response
          if (!res.headersSent) {
            res.send(result.error);
          }
        } else {
          let fby_id = null;
          for await (const client of result.success.data) {
            fby_id = client.fby_user_id;
            //get shopify account detail
            await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result1) {
              if (result1.error) {
                //console.log(`shopifyUserDetail result.error: in File ${currentfileName} line : 159 `, result.error);
                // store shopify account error log
                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                //console.log('inputs: ', inputs);

                //send response
                if (!res.headersSent) {
                  res.send(result1.error);
                }
              } else {
                let shopifyAccount = null;

                //internal asynchronous function for adding products to table and getting response parameters
                if (result1.success.data != undefined) {
                  shopifyAccount = result1.success.data[0];
                  result1.success.data.query_product_id = req.query.product_id != undefined ? req.query.product_id : '';
                  result1.success.data.query_variant_id = req.query.variant_id != undefined ? req.query.variant_id : '';
                }


                if (true) {
                  await getProducts(result1.success.data, fby_id, cron_name, cron_id)
                    .then((params) => {
                      if (!res.headersSent) {
                        res.send(params);
                      }
                    });
                }
                else {
                  set_response = [];
                  set_response[shopifyAccount.domain] = constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG;
                  //console.log('\n shopifyController.js--> getShopifyProducts--> CC_STOCK_UPDATE_NOT_ALLOWED_MSG: ', constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG);
                  if (!res.headersSent) {
                    res.send(set_response);
                  }
                }
              }
            });
          }
        }
      });
    }
    //after finish update cron status as 0
    res.on('finish', function () {
      //console.log('fby_user_id: ', fby_user_id);
      req.query = {
        fby_user_id: fby_user_id
      };
      //console.log(' req.query: ',  req.query);
      getShopifyLocation(req, res);
      //console.log('getShopifyLocation: location synced');
      let dt = dateTime.create();
      let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
      common.updateCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      });
    });

  }
  catch (error) {
    //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
  }
  finally {
    ccCache.del(cacheKey_Job);
  }
};




/*
* Send Products to Fby
* this function will check fby_user_id through 'user' and 'product' table.
* if all ok, then it will get product details from product table having status '0' and send to fby through fby controler.
*/

exports.sendProductsFby = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_FBY;
  let file_and_method_name = 'shopifyController.js sendProductsFby';
  let cron_id = uuid();
  let fby_user_id = req.query.fby_user_id;
  let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;

  try {
    // `${cron_name}-${fby_id}`;
    let jobRunning = ccCache.get(cacheKey_Job);
    if (jobRunning == undefined || !jobRunning || jobRunning == null) {
      ccCache.set(cacheKey_Job, true);
    }
    else {
      let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
      set_response = {
        sucess: {
          message: msg
        }
      };
      //console.log(msg);
      return set_response;
    }
    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1]
    common.insertCron(inputs, cron_name, cron_id, function (result) {
      if (result.error) {
        mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
      }
    })
    //process url request
    if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
      if (!res.headersSent) {
        res.send(constants.EMPTY);
      }
    } else {
      //get user
      common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
        if (result.error) {
          // store user error log
          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            }
          });
          //send response
          if (!res.headersSent) {
            res.send(result.error);
          }
        } else {
          for await (const client of result.success.data) {
            /**
            * get product details from products table having same 'FBY_id' in 'user' table and status 0.
            * Once successfully send to fby the status will be set to 1.
            */
            if (process.env.IS_SEND_PRODUCT_TO_FBY == 1) {
              try {
                await common.getProduct(client, "status", cron_name, cron_id, async function (result) {
                  //console.log('sendProductsFby getProduct result: ', JSON.stringify(result));
                  logger.logInfo('sendProductsFby getProduct result: ', JSON.stringify(result));

                  if (result.error) {
                    // store get product error log
                    let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), client.fby_user_id];
                    common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                      if (result.error) {
                        mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                      }
                    })
                    //send response
                    if (!res.headersSent) {
                      res.send(result.error);
                    }
                  } else {
                    let set_response = {};
                    /* product loop start */
                    for (const product of result.success.data) {
                      /* Check if 'send_Orders_Fby' cron name and cron Id already exist or not */
                      let new_cron_id = cron_id;
                      let exist_cron = 0;
                      if (product.cron_name == cron_name && product.cron_id) {
                        new_cron_id = product.cron_id;
                        exist_cron = 1;
                      } else {
                        /* Update with new cron id */
                        let updt_time = dateTime.create();
                        let inputs = [product.sku, cron_name, new_cron_id, updt_time.format('Y-m-d H:M:S')];

                      }
                      /* calling fby controller to get 'jwt token' and 'insert skus' */
                      fbyController.getFBYToken(client, cron_name, new_cron_id, function (result) {
                        if (result.error) {
                          set_response[product.id] = result.error;
                        } else {
                          let api_token = result.success.data;
                          fbyController.insertSku(api_token, product, exist_cron, cron_name, new_cron_id, function (result) {
                            set_response[product.id] = result;
                          })
                        }
                      })
                    }
                    /* product loop end */
                    /**
                     * set time out is required to await 'for' to finish and send response in 15 seconds.
                     * otherwise 'set_response' will be blank.
                     */
                    setTimeout(() => {
                      res.send(set_response);
                    }, 15000);
                  }
                });
              }
              catch (error) {
                //console.log(`\nERROR While Pushing Data for AlertLogging: \n`, JSON.stringify(error.message));

              }
            }
            else {
              set_response = {};
              set_response[client[0].domain] = constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG;
              if (!res.headersSent) {
                res.send(set_response);
              }
            }
          }
        }
      });
    }
    //after finish update cron status as 0
    res.on('finish', function () {
      let dt = dateTime.create();
      let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
      common.updateCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })
    });
  }
  catch (error) {
    //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
  }
  finally {
    ccCache.del(cacheKey_Job);
  }
}


exports.createProductsShopify = async (req, res) => {
  try {

    let cron_name = constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL;
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = uuid();
    let fby_user_id = req.query.fby_user_id;
    let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;

    try {
      // `${cron_name}-${fby_id}`;
      let jobRunning = ccCache.get(cacheKey_Job);
      if (jobRunning == undefined || !jobRunning || jobRunning == null) {
        ccCache.set(cacheKey_Job, true);
      }
      else {
        let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
        set_response = {
          sucess: {
            message: msg
          }
        };
        //console.log(msg);
        return set_response;
      }
      //when url hits, it insert the cron details and make status 1 as its running
      let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
      common.insertCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })

      //process url request
      if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
        if (!res.headersSent) {
          res.send(constants.EMPTY);
        }
      } else {
        //get user
        common.userDetail(req.query.fby_user_id, cron_name, cron_id, function (result) {
          if (result.error) {
            // store user error log
            let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
              }
            })
            //send response
            if (!res.headersSent) {
              res.send(result.error);
            }
          } else {
            for (const client of result.success.data) {
              let fby_id = client.fby_user_id;
              //get shopify account detail
              common.shopifyUserDetail(fby_id, cron_name, cron_id, function (result) {
                if (result.error) {
                  // store shopify account error log
                  let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                  common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                    if (result.error) {
                      mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                    }
                  })
                  //send response
                  if (!res.headersSent) {
                    res.send(result.error);
                  }
                } else {
                  let set_response = {};
                  /* Shopify account loop start */
                  for (const shopifyAccount of result.success.data) {
                    /**for each shopifyAccount
                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                    */
                    if (shopifyAccount.productPublish == 1) {

                      common.getCreateProductByDomain(shopifyAccount, "domain", cron_name, cron_id, function (result) {
                        if (result.error) {
                          // store get product error log
                          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                            if (result.error) {
                              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                            }
                          })
                          return false;
                        } else {
                          //asynchronous function for updating shopify inventory
                          createProductShopify(result.success.data, shopifyAccount, cron_name, cron_id)
                            .then((params) => {
                              if (Object.keys(params).length > 0) {
                                set_response[shopifyAccount.domain] = (params);
                              }
                            })
                        }
                      })
                    }
                    else {
                      //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                      set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                    }

                  }
                  /* Shopify account loop end */
                  /**
                  * set time out is required to await to get all the responses from 'pushProductsShopify'
                  */
                  setTimeout(() => {
                    if (!res.headersSent) {
                      res.send(set_response);
                    }
                  }, 15000);
                }
              })
            }
          }
        });
      }

      //after finish update cron status as 0
      res.on('finish', function () {
        let dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        common.updateCron(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
          }
        })
      });
    }
    catch (error) {
      //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
    }
    finally {
      ccCache.del(cacheKey_Job);
    }
  }
  catch (error) {
    //console.log('\n ERROR: ', JSON.stringify(error.message));
  }
}

exports.createShopifyProductWithMultipleVarient = async (req, res, callback = null) => {
  try {

    let cron_name = constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL;
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = uuid();
    let fby_user_id = req.query.fby_user_id;
    let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;

    try {
      // `${cron_name}-${fby_id}`;
      let jobRunning = ccCache.get(cacheKey_Job);
      if (jobRunning == undefined || !jobRunning || jobRunning == null) {
        ccCache.set(cacheKey_Job, true);
      }
      else {
        let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
        set_response = {
          sucess: {
            message: msg
          }
        };
        //console.log(msg);
        return set_response;
      }
      //when url hits, it insert the cron details and make status 1 as its running
      let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
      common.insertCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })

      //process url request
      if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
        if (!res.headersSent) {
          res.send(constants.EMPTY);
        }
      } else {
        //get user
        common.userDetail(req.query.fby_user_id, cron_name, cron_id, function (result) {
          if (result.error) {
            // store user error log
            let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
              }
            })
            //send response
            if (!res.headersSent) {
              res.send(result.error);
            }
          } else {
            for (const client of result.success.data) {
              let fby_id = client.fby_user_id;
              //get shopify account detail
              common.shopifyUserDetail(fby_id, cron_name, cron_id, function (result) {
                if (result.error) {
                  // store shopify account error log
                  let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                  common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                    if (result.error) {
                      mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                    }
                  })
                  //send response
                  if (!res.headersSent) {
                    res.send(result.error);
                  }
                } else {
                  let set_response = {};
                  /* Shopify account loop start */
                  for (const shopifyAccount of result.success.data) {
                    /**for each shopifyAccount
                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                    */
                    if (shopifyAccount.productPublish == 1) {

                      common.getCreateProductByDomain(shopifyAccount, "domain", cron_name, cron_id, function (result) {
                        if (result.error) {
                          // store get product error log
                          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                            if (result.error) {
                              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                            }
                          })
                          return false;
                        } else {
                          //asynchronous function for updating shopify inventory
                          createShopifyProductWithMultipleProductVarient(result.success.data, req.body[0].variants, shopifyAccount, cron_name, cron_id)
                            .then((params) => {
                              if (Object.keys(params).length > 0) {
                                set_response[shopifyAccount.domain] = (params);
                              }
                            })
                        }
                      })
                    }
                    else {
                      //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                      set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                    }

                  }
                  /* Shopify account loop end */
                  /**
                  * set time out is required to await to get all the responses from 'pushProductsShopify'
                  */
                  setTimeout(() => {
                    if (!res.headersSent) {
                      res.send(set_response);
                    }
                  }, 15000);
                }
              })
            }
          }
        });
      }

      //after finish update cron status as 0
      res.on('finish', function () {
        let dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        common.updateCron(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
          }
        })
      });
    }
    catch (error) {
      //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
    }
    finally {
      ccCache.del(cacheKey_Job);
    }
  }
  catch (error) {
    //console.log('\n ERROR: ', JSON.stringify(error.message));
  }
}

exports.createShopifyProduct = async (req, res, callback = null) => {
  try {

    let cron_name = constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL;
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = uuid();
    let fby_user_id = req.query.fby_user_id;
    let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;

    try {
      // `${cron_name}-${fby_id}`;
      let jobRunning = ccCache.get(cacheKey_Job);
      if (jobRunning == undefined || !jobRunning || jobRunning == null) {
        ccCache.set(cacheKey_Job, true);
      }
      else {
        let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
        set_response = {
          sucess: {
            message: msg
          }
        };
        //console.log(msg);
        return set_response;
      }
      //when url hits, it insert the cron details and make status 1 as its running
      let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
      common.insertCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })

      //process url request
      if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
        if (!res.headersSent) {
          res.send(constants.EMPTY);
        }
      } else {
        //get user
        common.userDetail(req.query.fby_user_id, cron_name, cron_id, function (result) {
          if (result.error) {
            // store user error log
            let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
              }
            })
            //send response
            if (!res.headersSent) {
              res.send(result.error);
            }
          } else {
            for (const client of result.success.data) {
              let fby_id = client.fby_user_id;
              //get shopify account detail
              common.shopifyUserDetail(fby_id, cron_name, cron_id, function (result) {
                if (result.error) {
                  // store shopify account error log
                  let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                  common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                    if (result.error) {
                      mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                    }
                  })
                  //send response
                  if (!res.headersSent) {
                    res.send(result.error);
                  }
                } else {
                  let set_response = {};
                  /* Shopify account loop start */
                  for (const shopifyAccount of result.success.data) {
                    /**for each shopifyAccount
                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                    */
                    if (shopifyAccount.productPublish == 1) {

                      common.getCreateProductByDomain(shopifyAccount, "domain", cron_name, cron_id, function (result) {
                        if (result.error) {
                          // store get product error log
                          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                            if (result.error) {
                              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                            }
                          })
                          return false;
                        } else {
                          //asynchronous function for updating shopify inventory
                          createShopifyProduct(result.success.data, shopifyAccount, cron_name, cron_id)
                            .then((params) => {
                              if (Object.keys(params).length > 0) {
                                set_response[shopifyAccount.domain] = (params);
                              }
                            })
                        }
                      })
                    }
                    else {
                      //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                      set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                    }

                  }
                  /* Shopify account loop end */
                  /**
                  * set time out is required to await to get all the responses from 'pushProductsShopify'
                  */
                  setTimeout(() => {
                    if (!res.headersSent) {
                      res.send(set_response);
                    }
                  }, 15000);
                }
              })
            }
          }
        });
      }

      //after finish update cron status as 0
      res.on('finish', function () {
        let dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        common.updateCron(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
          }
        })
      });
    }
    catch (error) {
      //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
    }
    finally {
      ccCache.del(cacheKey_Job);
    }
  }
  catch (error) {
    //console.log('\n ERROR: ', JSON.stringify(error.message));
  }
}




exports.updateProductsShopifyWithVarient = async (req, res, callback = null) => {
  try {

    let cron_name = constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL;
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = uuid();
    let fby_user_id = req.query.fby_user_id;
    let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;

    try {
      // `${cron_name}-${fby_id}`;
      let jobRunning = ccCache.get(cacheKey_Job);
      if (jobRunning == undefined || !jobRunning || jobRunning == null) {
        ccCache.set(cacheKey_Job, true);
      }
      else {
        let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
        set_response = {
          sucess: {
            message: msg
          }
        };
        //console.log(msg);
        return set_response;
      }
      //when url hits, it insert the cron details and make status 1 as its running
      let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
      common.insertCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })

      //process url request
      if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
        if (!res.headersSent) {
          res.send(constants.EMPTY);
        }
      } else {
        //get user
        common.userDetail(req.query.fby_user_id, cron_name, cron_id, function (result) {
          if (result.error) {
            // store user error log
            let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
              }
            })
            //send response
            if (!res.headersSent) {
              res.send(result.error);
            }
          } else {
            for (const client of result.success.data) {
              let fby_id = client.fby_user_id;
              //get shopify account detail
              common.shopifyUserDetail(fby_id, cron_name, cron_id, function (result) {
                if (result.error) {
                  // store shopify account error log
                  let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                  common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                    if (result.error) {
                      mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                    }
                  })
                  //send response
                  if (!res.headersSent) {
                    res.send(result.error);
                  }
                } else {
                  let set_response = {};
                  /* Shopify account loop start */
                  for (const shopifyAccount of result.success.data) {
                    /**for each shopifyAccount
                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                    */
                    if (shopifyAccount.productPublish == 1) {

                      updateProductShopifyWithVarients(req.body, req.body[0].variants, shopifyAccount, cron_name, cron_id)
                        .then((params) => {
                          // if (Object.keys(params).length > 0) {
                          //   set_response[shopifyAccount.domain] = (params);
                          // }
                        })
                    }
                    else {
                      //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                      set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                    }

                  }
                  /* Shopify account loop end */
                  /**
                  * set time out is required to await to get all the responses from 'pushProductsShopify'
                  */
                  setTimeout(() => {
                    if (!res.headersSent) {
                      res.send(set_response);
                    }
                  }, 15000);
                }
              })
            }
          }
        });
      }

      //after finish update cron status as 0
      res.on('finish', function () {
        let dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        common.updateCron(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
          }
        })
      });
    }
    catch (error) {
      //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
    }
    finally {
      ccCache.del(cacheKey_Job);
    }
  }
  catch (error) {
    //console.log('\n ERROR: ', JSON.stringify(error.message));
  }
}


exports.updateProductsShopify = async (req, res, callback = null) => {
  try {

    let cron_name = constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL;
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = uuid();
    let fby_user_id = req.query.fby_user_id;
    let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;

    try {
      // `${cron_name}-${fby_id}`;
      let jobRunning = ccCache.get(cacheKey_Job);
      if (jobRunning == undefined || !jobRunning || jobRunning == null) {
        ccCache.set(cacheKey_Job, true);
      }
      else {
        let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
        set_response = {
          sucess: {
            message: msg
          }
        };
        //console.log(msg);
        return set_response;
      }
      //when url hits, it insert the cron details and make status 1 as its running
      let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
      common.insertCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })

      //process url request
      if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
        if (!res.headersSent) {
          res.send(constants.EMPTY);
        }
      } else {
        //get user
        common.userDetail(req.query.fby_user_id, cron_name, cron_id, function (result) {
          if (result.error) {
            // store user error log
            let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
              }
            })
            //send response
            if (!res.headersSent) {
              res.send(result.error);
            }
          } else {
            for (const client of result.success.data) {
              let fby_id = client.fby_user_id;
              //get shopify account detail
              common.shopifyUserDetail(fby_id, cron_name, cron_id, function (result) {
                if (result.error) {
                  // store shopify account error log
                  let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                  common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                    if (result.error) {
                      mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                    }
                  })
                  //send response
                  if (!res.headersSent) {
                    res.send(result.error);
                  }
                } else {
                  let set_response = {};
                  /* Shopify account loop start */
                  for (const shopifyAccount of result.success.data) {
                    /**for each shopifyAccount
                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                    */
                    if (shopifyAccount.productPublish == 1) {

                      common.getCreateProductByDomain(shopifyAccount, "domain", cron_name, cron_id, function (result) {
                        if (result.error) {
                          // store get product error log
                          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                            if (result.error) {
                              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                            }
                          })
                          return false;
                        } else {
                          //asynchronous function for updating shopify inventory
                          updateProductShopify(result.success.data, req.body[0].variants, shopifyAccount, cron_name, cron_id)
                            .then((params) => {
                              if (Object.keys(params).length > 0) {
                                set_response[shopifyAccount.domain] = (params);
                              }
                            })
                        }
                      })
                    }
                    else {
                      //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                      set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                    }

                  }
                  /* Shopify account loop end */
                  /**
                  * set time out is required to await to get all the responses from 'pushProductsShopify'
                  */
                  setTimeout(() => {
                    if (!res.headersSent) {
                      res.send(set_response);
                    }
                  }, 15000);
                }
              })
            }
          }
        });
      }

      //after finish update cron status as 0
      res.on('finish', function () {
        let dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        common.updateCron(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
          }
        })
      });
    }
    catch (error) {
      //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
    }
    finally {
      ccCache.del(cacheKey_Job);
    }
  }
  catch (error) {
    //console.log('\n ERROR: ', JSON.stringify(error.message));
  }
}

exports.updateProductsOrVariantsShopify = async (req, res) => {
  try {
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "update_ProductsOrVariants_Shopify";
    let file_and_method_name = 'shopifyController.js updateProductsOrVariantsShopify';
    let cron_id = uuid();
    let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;
    try {
      // `${cron_name}-${fby_id}`;
      let jobRunning = ccCache.get(cacheKey_Job);
      if (jobRunning == undefined || !jobRunning || jobRunning == null) {
        ccCache.set(cacheKey_Job, true);
      }
      else {
        let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
        set_response = {
          sucess: {
            message: msg
          }
        };
        //console.log(msg);
        return set_response;
      }
      //when url hits, it insert the cron details and make status 1 as its running
      let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
      await common.insertCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })

      //process url request
      if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
        if (!res.headersSent) {
          res.send(constants.EMPTY);
        }
      } else {
        //get user
        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
          if (result.error) {
            // store user error log
            let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
              }
            })
            //send response
            if (!res.headersSent) {
              res.send(result.error);
            }
          } else {
            for (const client of result.success.data) {
              let fby_id = client.fby_user_id;

              //get shopify account detail
              await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                if (result.error) {
                  // store shopify account error log
                  let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                  common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                    if (result.error) {
                      mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                    }
                  })
                  //send response
                  if (!res.headersSent) {
                    res.send(result.error);
                  }
                } else {
                  let set_response = {};
                  /* Shopify account loop start */
                  for await (const shopifyAccount of result.success.data) {
                    /**for each shopifyAccount
                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                    */
                    if (shopifyAccount.productPublish == 1) {

                      await common.getProductForUpdate(shopifyAccount, "domain", cron_name, cron_id, async function (result) {
                        if (result.error) {
                          // store get product error log
                          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                          //console.log('inputs: ', JSON.stringify(inputs));
                          return false;
                        } else {

                          for await (const updateProduct of result.success.data) {
                            try {
                              let updateProducts = [updateProduct];
                              if (updateProduct.item_id == updateProduct.item_product_id) {

                                await updateProductShopify(updateProducts, shopifyAccount, cron_name, cron_id)
                                  .then((params) => {
                                    if (Object.keys(params).length > 0) {
                                      set_response[shopifyAccount.domain] = (params);
                                    }
                                  })
                              }
                              else {
                                await updateProductVariantShopify(updateProducts, shopifyAccount, cron_name, cron_id)
                                  .then((params) => {
                                    if (Object.keys(params).length > 0) {
                                      set_response[shopifyAccount.domain] = (params);
                                    }
                                  })
                              }

                              await deleteShopifyVariantsWithBlankSKU(fby_user_id, updateProduct.item_product_id);
                            }
                            catch (error) {
                              //console.log(`\nfby_user_id: ${fby_user_id}, product_id: ${updateProduct.item_product_id}\n`, error.message);
                            }

                          }
                        }
                      })
                    }
                    else {
                      //  //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                      set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                    }

                  }
                  /* Shopify account loop end */
                  /**
                  * set time out is required to await to get all the responses from 'pushProductsShopify'
                  */
                  setTimeout(() => {
                    if (!res.headersSent) {
                      res.send(set_response);
                    }
                  }, 15000);
                }
              })
            }
          }
        });
      }

      //after finish update cron status as 0
      res.on('finish', function () {
        let dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        common.updateCron(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
          }
        })
      });
    }
    catch (error) {
      //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
    }
    finally {
      ccCache.del(cacheKey_Job);
    }
  }
  catch (error) {
    //console.log('\n ERROR: ', JSON.stringify(error.message));
  }
}

exports.createShopifyVarientInBulk = async (req, res) => {
  try {

    let cron_name = "push_Images_Shopify";
    let file_and_method_name = 'shopifyController.js pushImagesShopify';
    let cron_id = uuid();
    let fby_user_id = req.query.fby_user_id;
    let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;
    try {
      // `${cron_name}-${fby_id}`;
      let jobRunning = ccCache.get(cacheKey_Job);
      if (jobRunning == undefined || !jobRunning || jobRunning == null) {
        ccCache.set(cacheKey_Job, true);
      }
      else {
        let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
        set_response = {
          sucess: {
            message: msg
          }
        };
        //console.log(msg);
        return set_response;
      }
      //when url hits, it insert the cron details and make status 1 as its running
      let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
      await common.insertCron(inputs, cron_name, cron_id, async function (result) {
        if (result.error) {
          //console.log(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })

      //process url request
      if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
        if (!res.headersSent) {
          res.send(constants.EMPTY);
        }
      } else {
        //get user
        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
          if (result.error) {
            // store user error log
            let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
            //send response
            if (!res.headersSent) {
              res.send(result.error);
            }
          } else {
            for (const client of result.success.data) {
              let fby_id = client.fby_user_id;
              //get shopify account detail
              await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                if (result.error) {
                  // store shopify account error log
                  let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                  common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                    if (result.error) {
                      mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                    }
                  })
                  //send response
                  if (!res.headersSent) {
                    res.send(result.error);
                  }
                } else {
                  let set_response = {};
                  /* Shopify account loop start */
                  for (const shopifyAccount of result.success.data) {
                    /**for each shopifyAccount
                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                    */
                    if (shopifyAccount.productPublish == 1) {

                      await common.getCreateProductVariantById(shopifyAccount, async function (result) {
                        if (result.error) {
                          // store get product error log
                          //console.log('inputs: ', inputs);
                          return false;
                        } else {
                          await createProductVariantInBulk(result.success.data, shopifyAccount, cron_name, cron_id);
                          // return await commonController.updateShopifyInventory(result.success.data, shopifyAccount, cron_name, cron_id)

                        }
                      })
                    }
                    else {
                      //  //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                      set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                    }

                  }
                  /* Shopify account loop end */
                  /**
                  * set time out is required to await to get all the responses from 'pushProductsShopify'
                  */
                  setTimeout(() => {
                    if (!res.headersSent) {
                      res.send(set_response);
                    }
                  }, 15000);
                }
              })
            }
          }
        });
      }

      //after finish update cron status as 0
      res.on('finish', function () {
        let dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        common.updateCron(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
          }
        })
      });
    }
    catch (error) {
      //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
    }
    finally {
      ccCache.del(cacheKey_Job);
    }
  }
  catch (error) {
    //console.log('\n ERROR: ', JSON.stringify(error.message));
  }
}


exports.pushImagesShopify = async (req, res, callback = null) => {
  try {

    let cron_name = "push_Images_Shopify";
    let file_and_method_name = 'shopifyController.js pushImagesShopify';
    let cron_id = uuid();
    let fby_user_id = req.query.fby_user_id;
    let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;
    try {
      // `${cron_name}-${fby_id}`;
      let jobRunning = ccCache.get(cacheKey_Job);
      if (jobRunning == undefined || !jobRunning || jobRunning == null) {
        ccCache.set(cacheKey_Job, true);
      }
      else {
        let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
        set_response = {
          sucess: {
            message: msg
          }
        };
        //console.log(msg);
        return set_response;
      }
      //when url hits, it insert the cron details and make status 1 as its running
      let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
      await common.insertCron(inputs, cron_name, cron_id, async function (result) {
        if (result.error) {
          //console.log(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })

      //process url request
      if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
        if (!res.headersSent) {
          res.send(constants.EMPTY);
        }
      } else {
        //get user
        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
          if (result.error) {
            // store user error log
            let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
            //send response
            if (!res.headersSent) {
              res.send(result.error);
            }
          } else {
            for (const client of result.success.data) {
              let fby_id = client.fby_user_id;
              //get shopify account detail
              await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                if (result.error) {
                  // store shopify account error log
                  let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                  common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                    if (result.error) {
                      mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                    }
                  })
                  //send response
                  if (!res.headersSent) {
                    res.send(result.error);
                  }
                } else {
                  let set_response = {};
                  /* Shopify account loop start */
                  for (const shopifyAccount of result.success.data) {
                    /**for each shopifyAccount
                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                    */
                    if (shopifyAccount.productPublish == 1) {


                      //asynchronous function for updating shopify inventory
                      await updateProductImages(shopifyAccount, req.body[0], cron_name, cron_id)
                        .then((params) => {
                          if (Object.keys(params).length > 0) {
                            set_response[shopifyAccount.domain] = (params);
                          }
                        })
                    }
                    else {
                      //  //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                      set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                    }

                  }
                  /* Shopify account loop end */
                  /**
                  * set time out is required to await to get all the responses from 'pushProductsShopify'
                  */
                  setTimeout(() => {
                    if (!res.headersSent) {
                      res.send(set_response);
                    }
                  }, 15000);
                }
              })
            }
          }
        });
      }

      //after finish update cron status as 0
      res.on('finish', function () {
        let dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        common.updateCron(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
          }
        })
      });
    }
    catch (error) {
      //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
    }
    finally {
      ccCache.del(cacheKey_Job);
    }
  }
  catch (error) {
    //console.log('\n ERROR: ', JSON.stringify(error.message));
  }
}

exports.createProductVariantShopify = async (req, res) => {
  try {

    let cron_name = "create_ProductVariant_Shopify";
    let file_and_method_name = 'shopifyController.js createProductVariantShopify';
    let cron_id = uuid();
    let fby_user_id = req.query.fby_user_id;
    let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;
    try {
      // `${cron_name}-${fby_id}`;
      let jobRunning = ccCache.get(cacheKey_Job);
      if (jobRunning == undefined || !jobRunning || jobRunning == null) {
        ccCache.set(cacheKey_Job, true);
      }
      else {
        let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
        set_response = {
          sucess: {
            message: msg
          }
        };
        //console.log(msg);
        return set_response;
      }
      //when url hits, it insert the cron details and make status 1 as its running
      let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
      common.insertCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })

      //process url request
      if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
        if (!res.headersSent) {
          res.send(constants.EMPTY);
        }
      } else {
        //get user
        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
          if (result.error) {
            // store user error log
            let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
            //console.log('inputs: ', inputs);
            //send response
            if (!res.headersSent) {
              res.send(result.error);
            }
          } else {
            for await (const client of result.success.data) {
              let fby_id = client.fby_user_id;
              //get shopify account detail
              await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                if (result.error) {
                  // store shopify account error log
                  let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                  //console.log('inputs: ', inputs);
                  //send response
                  if (!res.headersSent) {
                    res.send(result.error);
                  }
                } else {
                  let set_response = {};
                  /* Shopify account loop start */
                  for await (const shopifyAccount of result.success.data) {
                    /**for each shopifyAccount
                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                    */
                    if (shopifyAccount.productPublish == 1) {
                      await common.getCreateProductVariantByDomain(shopifyAccount, "domain", cron_name, cron_id, async function (result) {
                        if (result.error) {
                          // store get product error log
                          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                          //console.log('inputs: ', inputs);
                          return false;
                        } else {
                          //asynchronous function for updating shopify inventory
                          await createProductVariantShopify(result.success.data, shopifyAccount, cron_name, cron_id)
                            .then((params) => {
                              if (Object.keys(params).length > 0) {
                                set_response[shopifyAccount.domain] = (params);
                              }
                            })
                        }
                      })
                    }
                    else {
                      //  //console.log('\n shopifyController.js--> createProductVariantShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                      set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                    }
                  }
                  /* Shopify account loop end */
                  /**
                  * set time out is required to await to get all the responses from 'pushProductsShopify'
                  */
                  setTimeout(() => {
                    if (!res.headersSent) {
                      res.send(set_response);
                    }
                  }, 15000);
                }
              })
            }
          }
        });
      }

      //after finish update cron status as 0
      res.on('finish', function () {
        let dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        common.updateCron(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
          }
        })
      });
    }
    catch (error) {
      //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
    }
    finally {
      ccCache.del(cacheKey_Job);
    }
  }
  catch (error) {
    //console.log('\n ERROR: ', JSON.stringify(error.message));
  }
}

/*
* Get Stoks From Fby
* this function will check fby_user_id through 'user' and 'shopify' table.
* if all ok, then it will get user credentials,shopify account groupcode,owner_code and get the stocks from fby through fby controller.
*/
exports.getFbyStock = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.GET_STOCK_FROM_FBY;
  let file_and_method_name = 'shopifyController.js getFbyStock';
  let cron_id = uuid();
  let fby_user_id = req.query.fby_user_id;
  let cacheKey_Job = `${constants.CC_OPERATIONS.GET_STOCK_FROM_FBY}_fby_user_id_${fby_user_id}`;
  try {
    // `${cron_name}-${fby_id}`;
    let jobRunning = ccCache.get(cacheKey_Job);
    if (jobRunning == undefined || !jobRunning || jobRunning == null) {
      ccCache.set(cacheKey_Job, true);
    }
    else {
      let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
      set_response = {
        sucess: {
          message: msg
        }
      };
      //console.log(msg);
      return set_response;
    }
    // when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
    common.insertCron(inputs, cron_name, cron_id, function (result) {
      if (result.error) {
        mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
      }
    })
    //process url request
    if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
      res.send(constants.EMPTY);
    } else if (req.query.updated_after && !(moment(req.query.updated_after, MOMENT_DATE_FORMAT, true).isValid())) {
      let msg = {
        error: "invalid date format",
        message: "required date format " + MOMENT_DATE_FORMAT,
      }
      if (!res.headersSent) {
        res.send(msg)
      }
    } else {
      //get user
      common.userDetail(req.query.fby_user_id, cron_name, cron_id, function (result) {
        if (result.error) {
          logger.logError('userDetail result.error: ', result.error);
          // store user error log
          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            }
          })
          //send response
          if (!res.headersSent) {
            res.send(result.error);
          }
        } else {
          for (const client of result.success.data) {

            let fby_id = client.fby_user_id;

            //get shopify account detail
            common.shopifyUserDetail(fby_id, cron_name, cron_id, function (result) {

              if (result.error) {
                // store shopify account error log
                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                  }
                })
                //send response
                if (!res.headersSent) {
                  res.send(result.error);
                }
              } else {
                let set_response = {};
                /* Shopify account loop start */
                for (const shopifyAccount of result.success.data) {
                  /**for each shopifyAccount
                   * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                  */
                  let dt = dateTime.create();
                  let new_cron_id = cron_id;
                  let exist_cron = 0;
                  common.getBulkCronLog(fby_id, dt.format('Y-m-d'), cron_name, new_cron_id, function (result) {
                    if (result.success) {
                      let log_data = result.success.data;
                      new_cron_id = log_data != undefined && log_data != null && log_data.cron_id != undefined && log_data.cron_id != null ? log_data.cron_id : new_cron_id;
                      exist_cron = 1;
                    }
                    fbyController.getFBYToken(client, cron_name, new_cron_id, async function (result) {
                      //console.log('445 getFBYToken result: ',  JSON.stringify(result));
                      if (result.error) {

                        set_response[shopifyAccount.id] = (result.error);
                      } else {
                        let api_key = result.success.data;

                        //console.log('452 getStockList result.success.data: ', JSON.stringify(result));
                        if (shopifyAccount.stockUpdate == 1) {
                          await fbyService.getStockListForPushDirectly(req, fby_id, true);
                          /*
                          fbyController.getStockList(api_key, shopifyAccount, req, fby_id, cron_name, new_cron_id, function (result) {
                            //console.log('455 fbyController.getStockList result: ', result);
  
                            if (result.error) {
                              //console.log('result.error: ', result.error);
                              if (result.error) {
                                // store add stock error log
                                let inputs = [cron_name, cron_id, constants.API_TYPE, JSON.stringify(result.error), fby_id];
                                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                  if (result.error) {
                                    mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                                  }
                                })
                              }
                              // set_response[shopifyAccount.id]=(result.error);
                              set_response[shopifyAccount.id] = (result);
                            } else {
                              // set_response[shopifyAccount.id]=(result.success.data);
                              set_response[shopifyAccount.id] = (result);
                            }
                          })
                          */
                          // set_response[shopifyAccount.id] = 'Use push stock to shopify API Direclty to Sync data';
                        }
                        else {
                          //  //console.log('\n shopifyController.js--> getFbyStock--> CC_STOCK_UPDATE_NOT_ALLOWED_MSG: ', constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG);
                          set_response[shopifyAccount.domain] = constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG;
                        }
                      }
                    })
                  })
                }
                /* Shopify account loop end */
                /**
                * set time out is required to await to get all the responses from 'pushProductsShopify'
                */
                setTimeout(() => {
                  if (!res.headersSent) {
                    res.send(set_response);
                  }
                }, 15000);
              }
            })
          }
        }
      });
    }
    //after finish update cron status as 0
    res.on('finish', function () {
      let dt = dateTime.create();
      let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
      common.updateCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })
    });
  }
  catch (error) {
    //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
  }
  finally {
    ccCache.del(cacheKey_Job);
  }
}

exports.getFbyProducts = async (req, res) => {
  try {

    let cron_name = constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY;
    let file_and_method_name = 'shopifyController.js getFbyProducts';

    let cron_id = uuid();
    let fby_user_id = req.query.fby_user_id;
    let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;
    try {
      // `${cron_name}-${fby_id}`;
      let jobRunning = ccCache.get(cacheKey_Job);
      if (jobRunning == undefined || !jobRunning || jobRunning == null) {
        ccCache.set(cacheKey_Job, true);
      }
      else {
        let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
        set_response = {
          sucess: {
            message: msg
          }
        };
        //console.log(msg);
        return set_response;
      }
      // when url hits, it insert the cron details and make status 1 as its running
      let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
      common.insertCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })
      //process url request
      if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
        res.send(constants.EMPTY);
      }
      else {
        //get user
        common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
          if (result.error) {
            logger.logError('userDetail result.error: ', result.error);
            // store user error log
            let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
              }
            })
            //send response
            if (!res.headersSent) {
              res.send(result.error);
            }
          } else {
            for await (const client of result.success.data) {

              let fby_id = client.fby_user_id;

              //get shopify account detail
              await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {

                if (result.error) {
                  // store shopify account error log
                  let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                  common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                    if (result.error) {
                      mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                    }
                  })
                  //send response
                  if (!res.headersSent) {
                    res.send(result.error);
                  }
                } else {
                  let set_response = {};
                  /* Shopify account loop start */
                  for await (const shopifyAccount of result.success.data) {
                    /**for each shopifyAccount
                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                    */
                    let dt = dateTime.create();
                    let new_cron_id = cron_id;
                    let exist_cron = 0;

                    await fbyController.getFBYToken(client, cron_name, new_cron_id, async function (result) {
                      //console.log('445 getFBYToken result: ',  JSON.stringify(result));
                      if (result.error) {

                        set_response[shopifyAccount.id] = (result.error);
                      } else {
                        let api_key = result.success.data;

                        //console.log('452 getStockList result.success.data: ', JSON.stringify(result));
                        if (shopifyAccount.productPublish == 1) {
                          await fbyController.getProductsList(api_key, shopifyAccount, req, fby_id, cron_name, new_cron_id, function (result) {
                            //console.log('455 fbyController.getStockList result: ', result);

                            if (result.error) {
                              //console.log('result.error: ', result.error);
                              if (result.error) {
                                // store add stock error log
                                let inputs = [cron_name, cron_id, constants.API_TYPE, JSON.stringify(result.error), fby_id];
                                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                  if (result.error) {
                                    mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                                  }
                                })
                              }
                              // set_response[shopifyAccount.id]=(result.error);
                              set_response[shopifyAccount.id] = (result);
                            } else {
                              // set_response[shopifyAccount.id]=(result.success.data);
                              set_response[shopifyAccount.id] = (result);
                            }
                          })
                        }
                        else {
                          //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                          set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                        }
                      }
                    });
                  }
                  /* Shopify account loop end */
                  /**
                  * set time out is required to await to get all the responses from 'pushProductsShopify'
                  */
                  setTimeout(() => {
                    if (!res.headersSent) {
                      res.send(set_response);
                    }
                  }, 15000);
                }
              })
            }
          }
        });
      }
      //after finish update cron status as 0
      res.on('finish', function () {
        let dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        common.updateCron(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
          }
        })
      });
    }
    catch (error) {
      //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
    }
    finally {
      ccCache.del(cacheKey_Job);
    }
  }
  catch (error) {
    //console.log('\n ERROR: ', JSON.stringify(error.message));
  }
}


exports.getFbyProductPrices = async (req, res) => {
  try {

    let cron_name = "get_Fby_ProductPrices";
    let file_and_method_name = 'shopifyController.js getFbyProductPrices';
    let fby_user_id = req.query.fby_user_id;
    let cron_id = uuid();
    let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;

    try {
      // `${cron_name}-${fby_id}`;
      let jobRunning = ccCache.get(cacheKey_Job);
      if (jobRunning == undefined || !jobRunning || jobRunning == null) {
        ccCache.set(cacheKey_Job, true);
      }
      else {
        let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
        set_response = {
          sucess: {
            message: msg
          }
        };
        //console.log(msg);
        return set_response;
      }
      // when url hits, it insert the cron details and make status 1 as its running
      let inputs = [fby_user_id, cron_name, cron_id, 1];
      common.insertCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })
      //process url request
      if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
        res.send(constants.EMPTY);
      }
      else {
        //get user
        common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
          if (result.error) {
            logger.logError('userDetail result.error: ', result.error);
            // store user error log
            let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
              }
            })
            //send response
            if (!res.headersSent) {
              res.send(result.error);
            }
          } else {
            for (const client of result.success.data) {
              if (client.priceUpdate == 1) {
                let fby_id = client.fby_user_id;

                //get shopify account detail
                await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {

                  if (result.error) {
                    // store shopify account error log
                    let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                    common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                      if (result.error) {
                        mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                      }
                    })
                    //send response
                    if (!res.headersSent) {
                      res.send(result.error);
                    }
                  } else {
                    let set_response = {};
                    /* Shopify account loop start */
                    for await (const shopifyAccount of result.success.data) {
                      try {
                        if (shopifyAccount.priceUpdate) {
                          /**for each shopifyAccount
                           * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                          */
                          let dt = dateTime.create();
                          let new_cron_id = cron_id;
                          let exist_cron = 0;

                          await fbyController.getFBYToken(client, cron_name, new_cron_id, async function (result) {
                            //console.log('445 getFBYToken result: ',  JSON.stringify(result));
                            if (result.error) {

                              set_response[shopifyAccount.id] = (result.error);
                            } else {
                              let api_key = result.success.data;

                              //console.log('452 getStockList result.success.data: ', JSON.stringify(result));

                              await fbyController.getProductPrices(api_key, shopifyAccount, req, fby_id, cron_name, new_cron_id, function (result) {
                                //console.log('455 fbyController.getStockList result: ', result);

                                if (result.error) {
                                  //console.log('result.error: ', result.error);
                                  if (result.error) {
                                    // store add stock error log
                                    let inputs = [cron_name, cron_id, constants.API_TYPE, JSON.stringify(result.error), fby_id];
                                    common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                                      if (result.error) {
                                        mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                                      }
                                    })
                                  }
                                  // set_response[shopifyAccount.id]=(result.error);
                                  set_response[shopifyAccount.id] = (result);
                                } else {
                                  // set_response[shopifyAccount.id]=(result.success.data);
                                  set_response[shopifyAccount.id] = (result);
                                }
                              });
                            }
                          });
                        }
                      }
                      catch (err) {
                        //console.log(`getFbyProductPrices fby_user_id: ${shopifyAccount.fby_user_id}`, err.message);

                      }
                    }
                    /* Shopify account loop end */
                    /**
                    * set time out is required to await to get all the responses from 'pushProductsShopify'
                    */
                    setTimeout(() => {
                      if (!res.headersSent) {
                        res.send(set_response);
                      }
                    }, 15000);
                  }
                })
              }
            }
          }
        });
      }


      //after finish update cron status as 0
      res.on('finish', function () {
        let dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
        common.updateCron(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
          }
        })
      });
    }
    catch (error) {
      //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);

    }
    finally {
      ccCache.del(cacheKey_Job);
    }
  }
  catch (error) {
    //console.log('\n ERROR: ', error.message);
  }
}


/*
* Send Stoks to Shopify
* this function will check fby_user_id through 'user' and 'shopify' table.
* if all ok, then it will get all the user credential from 'shopify table'.
* then it will get products of same 'fby_user_id' and 'domain' from product table and update shopify channel inventory
*/
exports.pushStockShopify = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL;
  let file_and_method_name = 'shopifyController.js pushStockShopify';
  let cron_id = uuid();
  let fby_user_id = req.query.fby_user_id;
  let fby_id = fby_user_id;
  let infoMessage = `fby_user_id=${fby_user_id}, ${cron_name} `;
  let cacheKey_Job = `${constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL}_fby_user_id_${fby_user_id}`;
  try {

    // `${cron_name}-${fby_id}`;
    let jobRunning = ccCache.get(cacheKey_Job);
    if (jobRunning == undefined || !jobRunning || jobRunning == null) {
      ccCache.set(cacheKey_Job, true);
    }
    else {
      let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
      set_response = {
        sucess: {
          message: msg
        }
      };
      //console.log(msg);
      return set_response;
    }
    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
    await common.insertCron(inputs, cron_name, cron_id, async function (result) {
      if (result.error) {
        mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
      }
    });

    //process url request
    if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
      if (!res.headersSent) {
        res.send(constants.EMPTY);
      }
    } else {
      //get user
      await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
        if (result.error) {
          // store user error log
          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            }
          });
          //send response
          if (!res.headersSent) {
            res.send(result.error);
          }
        } else {
          for (const client of result.success.data) {
            let fby_id = client.fby_user_id;
            //get shopify account detail
            await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
              if (result.error) {
                // store shopify account error log
                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                // common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                //   if (result.error) {
                //     mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                //   }
                //})
                //send response
                if (!res.headersSent) {
                  res.send(result.error);
                }
              } else {
                let set_response = {};
                /* Shopify account loop start */
                for await (const shopifyAccount of result.success.data) {
                  /**for each shopifyAccount
                   * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                  */
                  if (shopifyAccount.stockUpdate == 1) {
                    //*
                    if (shopifyAccount.orderSync == 1) {

                      try {
                        //console.log(`shopifyController.getShopifyOrders ${infoMessage}`, moment().format(MOMENT_DATE_FORMAT));
                        await shopifyController.getShopifyOrders(req, res);
                      }
                      catch (err) {
                        //console.log('shopifyController.getShopifyOrders err: ', err.message);

                      }
                      try {
                        //console.log(`shopifyController.sendOrdersFby ${infoMessage}`, moment().format(MOMENT_DATE_FORMAT));
                        await shopifyController.sendOrdersFby(req, res);
                      }

                      catch (err) {
                        //console.log('shopifyController.sendOrdersFby err: ', err.message);

                      }
                      try {
                        //console.log(`shopifyController.sendCanceledOrdersFby ${infoMessage}`, moment().format(MOMENT_DATE_FORMAT));
                        await shopifyController.sendCanceledOrdersFby(req, res);
                      }
                      catch (err) {
                        //console.log('shopifyController.sendCanceledOrdersFby err: ', err.message);

                      }
                    }
                    //*/
                    //console.log(`shopifyController.getStockListForPushDirectly ${infoMessage}`, moment().format(MOMENT_DATE_FORMAT));
                    await fbyService.getStockListForPushDirectly(req, fby_id, true);
                    await common.getProduct(shopifyAccount, "domain", cron_name, cron_id, async function (result) {
                      if (result.error) {
                        // store get product error log
                        let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                        // common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                        //   if (result.error) {
                        //     mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                        //   }
                        // })
                        return false;
                      } else {
                        //asynchronous function for updating shopify inventory
                        try {

                          //console.log(`shopifyController.pushProductsShopify ${infoMessage}`, moment().format(MOMENT_DATE_FORMAT));
                          await pushProductsShopify(result.success.data, shopifyAccount, cron_name, cron_id)
                            .then((params) => {
                              if (Object.keys(params).length > 0) {
                                set_response[shopifyAccount.domain] = (params);
                              }
                              // common.updateLastSyncOperationTime(fby_user_id, null, cron_name, function (result) {
                              //   if (result != null && result.error) {
                              //     //console.log("Failed to update sync time in the database");
                              //   }
                              // });
                            });
                        }
                        catch (error) {
                          //console.log(error);

                        }
                      }
                    })
                  }
                  else {
                    //  //console.log('\n shopifyController.js--> pushStockShopify--> CC_STOCK_UPDATE_NOT_ALLOWED_MSG: ', constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG);
                    set_response[shopifyAccount.domain] = constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG;
                  }
                }
                /* Shopify account loop end */
                /**
                * set time out is required to await to get all the responses from 'pushProductsShopify'
                */
                setTimeout(() => {
                  if (!res.headersSent) {
                    res.send(set_response);
                  }
                }, 15000);
              }
            })
          }
        }
      });
    }

    //after finish update cron status as 0
    res.on('finish', function () {
      let dt = dateTime.create();
      let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
      common.updateCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      });
    });
  }
  catch (error) {
    //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
  }
  finally {
    ccCache.del(cacheKey_Job);
  }
};

/*---------------------------------------- products end ---------------------------------------*/


//default funtions which are called from router
// export default {
//   getShopifyProducts, getShopifyLocation, sendProductsFby, getFbyStock, pushStockShopify, getShopifyOrders, sendOrdersFby, sendCanceledOrdersFby, getFbyTraknumber, pushTrackShopify
// };

/*-----------internal functions for Products Start---------- */
/*  
* function for getting products
*/
const getProducts = async (result, fby_id, cron_name, cron_id) => {
  let set_response = {};
  let fby_user_id = fby_id;
  let query_product_id = result.query_product_id != undefined && result.query_product_id != '' ? result.query_product_id : '';
  let query_variant_id = result.query_variant_id != undefined && result.query_variant_id != '' ? result.query_variant_id : '';
  let globalProductCounter = 0;
  let productCounter = 0;
  cron_name = constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL;
  let infoMessage = `fby_user_id: ${fby_user_id}, ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL}`;
  //console.log('getProducts result: ', result);
  let logData = '';

  let updated_at = moment();
  let updated_at_last10Days = moment();
  updated_at = updated_at.subtract(10, "days");
  updated_at = updated_at.format(MOMENT_DATE_FORMAT);
  updated_at_last10Days = updated_at_last10Days.subtract(10, "days").format(MOMENT_DATE_FORMAT);
  let addedInventoryItemIds = [];

  for await (const client of result) {

    let since_id = '';
    let productsResponse = [];
    client.token = helpers.getDecryptedData(client.token);
    let isLimitExceed = false;
    let url = `${client.domain}admin/api/2023-04/products.json?limit=${LIMIT}`;
    if (query_product_id != '') {
      // url = `${client.domain}admin/api/2023-04/products/${query_product_id}.json`;
      url = `${client.domain}admin/api/2023-04/products.json?ids=${query_product_id}`;
    }

    let c = 0;
    let isNextPage = true;
    let nextPageLink = '';

    let globaleCounter = 0;
    let apiRequest = null;
    let options = null;
    let total = 0;
    let errorCounter = 0;
    do {

      if (nextPageLink != '') {
        //console.log(`\n${++c})\t NextPageLink:\t`, nextPageLink);
      }

      await helpers.sleep();

      let apiRequestBase = {
        url: url,
        method: "get",
        headers: {
          'X-Shopify-Access-Token': `${client.token}`,
        }
      };

      if (query_product_id == 0 || query_product_id == '') {
        if (nextPageLink == '') {
          apiRequestBase.params = {
            "limit": LIMIT,
            "updated_at_min": updated_at_last10Days,
          };
        } else {
          apiRequestBase.params = {
            "limit": LIMIT
          };
        }

      }

      options = apiRequest = apiRequestBase;
      var apiRequestResponse = {
        fby_user_id: fby_user_id,
        request: apiRequest,
        response: {
          data: null
        }
      };

      let productsResponse = [];
      await axios(apiRequest)
        .then(async (parsedBody) => {

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
            options.url = nextPageLink;
            options.params = null;
            apiRequest.url = nextPageLink;
            apiRequest.params = null;

          }
          catch (error) {
            nextPageLink = '';
            isNextPage = false;
          }

          try {

            apiRequestResponse.response.data = parsedBody.data;
            productCounter = 0;
            if (
              parsedBody.data != undefined &&
              parsedBody.data != null &&
              parsedBody.data.products != undefined &&
              parsedBody.data.products != null &&
              parsedBody.data.products.length > 0
            ) {
              productsResponse = parsedBody.data.products;
            }
            else if (
              parsedBody.data != undefined &&
              parsedBody.data != null &&
              parsedBody.data.product != undefined &&
              parsedBody.data.product != null
            ) {
              productsResponse = [parsedBody.data.product];
            }
            else {
              return;
            }

            logData = JSON.stringify(apiRequestResponse);
            infoMessage = `${infoMessage}, ${url}`;
            await logger.LogForAlert(
              fby_user_id,
              '',
              '',
              infoMessage,
              logData,
              constants.LOG_LEVEL.INFO,
              constants.FBY_ALERT_CODES.UNKNOWN,
              constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL,
              cron_id
            );
          }
          catch (error) {
            //console.log('\n ERROR: ', error.message);
          }

          isLimitExceed = false;
          //console.log(`getProducts ${url}`, parsedBody.products);

          parsedBody.products = productsResponse;
          infoMessage = `\n${infoMessage}, ProductResults: ${parsedBody.products.length}`;
          //console.log(`\n${infoMessage}`);
          if (parsedBody.products.length > 0) {
            productsResponse = parsedBody.products;

          }
          else {
            //console.log(`\ngetProducts fby_user_id: ${client.fby_user_id}, ${url}\n`, JSON.stringify(parsedBody));
            productsResponse = [];
          }
          total += parsedBody.products.length;
          for await (const product of parsedBody.products) {
            try {
              total += product.variants.length || 0;
              //for each product skus and barcode
              for await (const data of product.variants) {

                try {
                  logMessage = `fby_user_id = ${fby_user_id}, ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL}  sku = '${data.sku}'`;
                  //console.log(logMessage);
                  productCounter++;
                  globalProductCounter++;


                  if ((query_variant_id == '' || query_variant_id == 0) || query_variant_id == data.id) {
                    let img;
                    let flag = 0;

                    if (data.sku == "") {
                      try {

                        let cacheKey_getProdducts_shopify = `blankSKU_fby_user_id_${fby_user_id}_${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL}_SKU_${data.sku}_id_${data.id}`;
                        let cached_prodduct = ccCache.get(cacheKey_getProdducts_shopify);
                        if (cached_prodduct != null && cached_prodduct.id == data.id) {
                          //console.log('\ncacheKey_getProdducts_shopify: ', cacheKey_getProdducts_shopify);
                          continue;
                        }
                        ccCache.set(cacheKey_getProdducts_shopify, data, ((60 * 60) * 24));
                        let logData = JSON.stringify(product);
                        let errorMessage = `${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL} fby_user_id: ${client.fby_user_id}, blank sku: ${data.sku} or ean/barcode ${data.barcode || ''}`;
                        //console.log(errorMessage);
                        await logger.LogForAlert(
                          fby_user_id,
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
                        //console.log('\n ERROR: ', error.message);
                      }
                    }

                    if (!product.image) {
                      img = "";
                    } else {
                      img = product.image.src;
                    }

                    if (globalProductCounter % 100 == 0 || globalProductCounter == 1 || globalProductCounter == total) {
                      //console.log(`\n${moment().format(MOMENT_DATE_FORMAT)}\t${globalProductCounter}/${total}) ${logMessage}, item_product_id = ${data.product_id}, inventory_item_id = ${data.inventory_item_id}`);
                    }
                    let domain = client.domain;
                    let owner_code = client.owner_code;
                    let channel = client.channelName;
                    let sku = data.sku;
                    let barcode = data.barcode;
                    let item_id = data.id;
                    let title = data.title;
                    let item_product_id = data.product_id;
                    let inventory_item_id = data.inventory_item_id;
                    addedInventoryItemIds.push(data.inventory_item_id);
                    let inventory_quantity = data.inventory_quantity;
                    let image = img;
                    let price = data.price;
                    let location_id = 0;

                    if (fby_user_id == 39) {
                      location_id = '71653097701';
                    }
                    if (fby_user_id == 40) {
                      location_id = '62527701097';
                    }

                    //insert products got from shopify into products table
                    let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id];
                    await common.addProduct(inputs, fby_id, cron_name, cron_id, function (result) {
                      if (result.error) {
                        //console.log(`\ngetProducts fby_user_id: ${client.fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                        //mail
                        //mail.addProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                        // store log
                        inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                        common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                          if (result.error) {
                            mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                          }
                        })
                      }
                    })
                  }
                }
                catch (ex) {

                  //console.log(logMessage);

                  try {

                    let logData = JSON.stringify(ex);
                    let errorMessage = `${logMessage}\nERROR: ${ex.message}`;
                    //console.log(errorMessage);
                    await logger.LogForAlert(
                      fby_user_id,
                      '',
                      data.sku,
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

                }
              }
            }
            catch (error) {
              //console.log();
              //console.log('\nERROR While shopify product loop');
              //console.log(error);
            }

            if (productCounter == parsedBody.products.length - 1) {
              if (query_product_id == 0 || query_product_id == '') {
                since_id = product.id;
              }
            }


          }
          set_response[client.domain] = parsedBody.products;
        })
        .catch(async function (err) {
          let errorJson = JSON.stringify(err);
          try {
            errorCounter++;
            if (errorCounter > 5) {
              nextPageLink = '';
              isNextPage = false;
            }

            let logData = JSON.stringify(err);
            let errorMessage = `${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL} fby_user_id: ${fby_user_id}, error : ${err.message}`;
            //console.log(errorMessage);
            await logger.LogForAlert(
              fby_user_id,
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

          //console.log('`getProducts fby_user_id: ${fby_user_id}, https://${client.domain}/admin/api/2023-04/products.json`, err);

          if (errorJson.includes("Exceeded 2 calls per second for api client") && errorJson != "");
          {
            isLimitExceed = true;
            await helpers.sleep();

          }
          //mail
          mail.shopifyGetProdMail(cron_name, cron_id, fby_id, errorJson);
          //store log
          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, errorJson, fby_id];
          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
            }
          })
          //set response
          set_response[client.domain] = constants.API_ERROR;
        });

      apiRequest.url = options.url = url = nextPageLink;
      options.params = apiRequest.params = null;

      if (query_product_id > 0 || query_product_id != '') {
        break;
      }

    }
    while (isNextPage);

  };
  return set_response;
}
/*  
* function for getting Inventory location
*/
const getLocationShopify = async (product, client, cron_name, cron_id) => {
  let set_response = {};
  let fby_user_id = client.fby_user_id;

  let slice_i, slice_j, temporary, chunk = 10;
  for (slice_i = 0, slice_j = product.length; slice_i < slice_j; slice_i += chunk) {
    await helpers.sleep();

    temporary = product.slice(slice_i, slice_j + chunk);

    let itemlist = temporary.map(function (elem) {
      return elem.inventory_item_id;
    }).join(",");

    let skulist = temporary.map(function (elem) {
      return elem.sku;
    }).join(",");

    if (itemlist != '') {
      client.token = helpers.getDecryptedData(client.token);
      let url = `${client.domain}admin/api/2023-04/inventory_levels.json`;
      let options = {
        method: "get",
        uri: url,
        qs: {
          inventory_item_ids: itemlist
        },
        headers: {
          "Content-Type": "application/json",
          'X-Shopify-Access-Token': `${client.token}`,
        },
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

      await request(options)
        .then(async (parsedBody) => {
          try {
            apiRequestResponse.response.data = JSON.parse(JSON.stringify(parsedBody));
            let logData = JSON.stringify(apiRequestResponse);
            let errorMessage = `skus : ${skulist}`;
            //console.log(errorMessage);
            await logger.LogForAlert(
              fby_user_id,
              '',
              skulist,
              errorMessage,
              logData,
              constants.LOG_LEVEL.INFO,
              constants.FBY_ALERT_CODES.UNKNOWN,
              constants.CC_OPERATIONS.GET_PRODUCT_LOCATION_FROM_CHANNEL,
              cron_id
            );
          }
          catch (error) {
            //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

          }




          if (parsedBody.inventory_levels != undefined && parsedBody.inventory_levels != null && parsedBody.inventory_levels.length > 0) {

            //console.log((`\ngetLocationShopify fby_user_id: ${fby_user_id}, Url : ${url}?inventory_item_ids=${itemlist}: \n LocationResults : ${parsedBody.inventory_levels.length}`))
            // for await (let i = 0; i < parsedBody.inventory_levels.length; i++) {
            for await (let inventory of parsedBody.inventory_levels) {

              try {
                let updt_time = dateTime.create();

                let itemId = inventory.inventory_item_id;
                let locationId = inventory.location_id;

                //console.log(`getLocationShopify processing fby_user_id: ${client.fby_user_id}, inventory_item_id: ${itemId}, location_id: ${locationId}`);
                let inputs = [
                  fby_user_id,
                  itemId,
                  locationId,
                  cron_name,
                  cron_id, updt_time.format('Y-m-d H:M:S')
                ];

                if (locationId > 0) {

                  await helpers.sleep();
                  await common.updateProdLocation(inputs, fby_user_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                      // store log
                      let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), client.fby_user_id];
                      //console.log((`\ngetLocationShopify fby_user_id: ${fby_user_id}, Url : ${url}?inventory_item_ids=${itemlist}: \n ${skulist} LocationResults SUCSESS: ${JSON.stringify(inputs)}`))

                      // response
                      set_response[itemlist.inventory_item_id] = (result.error);
                    }
                    else {
                      let msg = `SUCESSS getLocationShopify processing fby_user_id: ${client.fby_user_id}, inventory_item_id: ${itemId}, location_id: ${locationId}`;
                      //console.log((`\ngetLocationShopify fby_user_id: ${fby_user_id}, Url : ${url}?inventory_item_ids=${itemlist}: \n ${skulist} LocationResults SUCSESS: ${JSON.stringify(locationId)}`))
                      set_response[itemId] = msg;

                    }
                  });
                }
                else {
                  logger.logInfo(`FAILED ${itemId} getLocationShopify ${url}?inventory_item_ids=${itemId}: `, 'location not updated in db for this inventory_item_id');
                }
              }
              catch (err) {
                try {

                  let logData = JSON.stringify(apiRequestResponse);
                  let errorMessage = err.message
                  //console.log('\n ERROR: fby_user_id: ', fby_user_id, error.message);
                  await logger.LogForAlert(
                    fby_user_id,
                    '',
                    '',
                    errorMessage,
                    logData,
                    constants.LOG_LEVEL.INFO,
                    constants.FBY_ALERT_CODES.UNKNOWN,
                    constants.CC_OPERATIONS.GET_PRODUCT_LOCATION_FROM_CHANNEL,
                    cron_id
                  );
                }
                catch (error) {
                  //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                }

              }

            }
          }
          else {
            //console.log((`\ngetLocationShopify fby_user_id: ${fby_user_id}, Url : ${url}?inventory_item_ids=${itemlist}: \n LocationResults : No Locations From ShopifY`))

          }
        })
        .catch(async function (err) {
          let errorJson = err.message;
          //console.log(`\nfby_user_id ${fby_user_id}, getLocationShopify err: \n`, errorJson);

          try {
            apiRequestResponse.response.data = err;
            let logData = JSON.stringify(apiRequestResponse);
            let errorMessage = err.message
            await logger.LogForAlert(
              fby_user_id,
              '',
              '',
              errorMessage,
              logData,
              constants.LOG_LEVEL.ERROR,
              constants.FBY_ALERT_CODES.UNKNOWN,
              constants.CC_OPERATIONS.GET_PRODUCT_LOCATION_FROM_CHANNEL,
              cron_id
            );
          }
          catch (error) {
            //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

          }

          set_response[itemlist.inventory_item_id] = (constants.GET_LOCATION_ERROR);

        });
    }
  }
  return set_response;

}

/*  
* function for update shopify Inventory
*/
const pushProductsShopify = async (product, client, cron_name, cron_id) => {
  let set_response = {};
  let fby_user_id = client.fby_user_id;
  let globalCounter = 0;
  cron_name = constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL;
  let infoMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;
  let sku = '';
  let qty = '';
  let total = product != undefined && product != null ? product.length : 0;
  let batchInfoListDB = [];
  try {
    client.token = await helpers.getDecryptedData(client.token);
    let productsToBeUpdated = await this.GET_SHOPIFY_INVENTORY_TO_BE_UPDATED(fby_user_id, product, cron_name, cron_id);
    globalCounter = 0;
    for await (const itemlist of productsToBeUpdated) {
      await helpers.sleep(1);
      // try {
      //   if (err.message.includes('Exceeded 2 calls per second')) {
      //     let interval = 2 * 1000; // 10 seconds;
      //     let promose = new Promise(resolve => setTimeout(resolve, interval));
      //     await promose;
      //   }
      // }
      // catch (error) { 
      //   //console.log()
      //   //console.log(error)
      // }
      let sku = itemlist.sku;
      let qty = itemlist.inventory_quantity;
      infoMessage = `fby_user_id: ${fby_user_id}, sku: ${itemlist.sku}, qty: ${qty}, inventory_item_id: ${itemlist.inventory_item_id}`;
      try {

        globalCounter++;
        // if (globalCounter >= 5) {
        //   break;
        // }



        let url = `${client.domain}admin/api/2023-04/inventory_levels/set.json`;

        let options = {
          method: "post",
          uri: url,
          headers: {
            "Content-Type": "application/json",
            'X-Shopify-Access-Token': `${client.token}`
          },
          body: {
            "location_id": itemlist.location_id,
            "inventory_item_id": itemlist.inventory_item_id,
            "available": itemlist.inventory_quantity
          },
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
        let retryCounter = 0;
        while (retryCounter < MAX_RETRIES) {

          try {
            await helpers.sleep(2);
            await request(options)
              .then(async (parsedBody) => {

                try {
                  await logger.LogForAlert(
                    fby_user_id,
                    '',
                    sku,
                    `${infoMessage}`,
                    parsedBody,
                    constants.LOG_LEVEL.INFO,
                    constants.FBY_ALERT_CODES.STOCK_SYNC,
                    cron_name,
                    cron_id
                  );
                }
                catch (error) {
                  //console.log('error: ', error.message);

                }


                try {

                  apiRequestResponse.response.data = JSON.parse(JSON.stringify(parsedBody));
                  if (globalCounter % 100 == 0 || globalCounter % 1 || globalCounter == total - 1 || retryCounter > 1) {
                    //console.log(`\n${moment().format(MOMENT_DATE_FORMAT)}\t${globalCounter}/${total}) ${infoMessage} retryCounter ${retryCounter}\n ShopifyResponse : ${JSON.stringify(parsedBody)}`);
                  }
                  retryCounter = MAX_RETRIES;
                  try {
                    if (parsedBody.inventory_level != undefined && parsedBody.inventory_level != null
                      && parsedBody.inventory_level.inventory_item_id != undefined && parsedBody.inventory_level.inventory_item_id != null
                      && parsedBody.inventory_level.available != undefined && parsedBody.inventory_level.available != null
                    ) {
                      if (apiRequestResponse.request != undefined && apiRequestResponse.request != null
                        && apiRequestResponse.request.body != undefined && apiRequestResponse.request.body != null
                        && apiRequestResponse.request.body.inventory_item_id != undefined && apiRequestResponse.request.body.inventory_item_id != null
                        && apiRequestResponse.request.body.available != undefined && apiRequestResponse.request.body.available != null
                      ) {
                        if (parsedBody.inventory_level.available == apiRequestResponse.request.body.available
                          && parsedBody.inventory_level.inventory_item_id == apiRequestResponse.request.body.inventory_item_id
                        ) {
                          let inputs = [fby_user_id, itemlist.sku, cron_name, cron_id, null];
                          await common.updateProductAftrSndChanl(
                            inputs,
                            fby_user_id,
                            cron_name,
                            cron_id,
                            async function (result) {
                              if (result.error) {
                                //console.log(`${infoMessage}\nERROR\n`, JSON.stringify(result.error));
                              }

                            }
                          );
                        }
                      }
                    }


                  }
                  catch (error) {
                    //console.log(`${infoMessage}\nERROR\n`, error.message);
                  }



                }
                catch (error) {
                  //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
                  //console.log(error);

                }

                set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
              })
              .catch(async function (err) {
                try {
                  if (err.message.includes('Exceeded 2 calls per second')) {
                    interval = 10 * 1000; // 10 seconds;
                    let promose = new Promise(resolve => setTimeout(resolve, interval));
                    await promose;
                  }
                }
                catch (error) {
                  //console.log()
                  //console.log(error)
                }
                if (err.message.includes('Not Found')) {

                  try {
                    cron_name = 'Not Found';
                    let inputs = [fby_user_id, itemlist.sku, cron_name, cron_id, null];
                    await common.updateProductAftrSndChanl(
                      inputs,
                      fby_user_id,
                      cron_name,
                      cron_id,
                      async function (result) {
                        if (result.error) {
                          //console.log(`${infoMessage}\nERROR\n`, JSON.stringify(result.error));
                        }

                      }
                    );
                  }
                  catch (error) {
                    //console.log();
                    //console.log(error);
                  }
                }

                apiRequestResponse.response.data = JSON.parse(JSON.stringify(err));
                let errorMessage = `\n${moment().format(MOMENT_DATE_FORMAT)}\t${globalCounter}/${total}) ${infoMessage}\n, ErrorMessage: ${err.message}`;
                //console.log(`\n${errorMessage}\n`);


                batchInfoListDB.push(new Entities.CCLogs(
                  fby_user_id,
                  '',
                  sku,
                  errorMessage,
                  apiRequestResponse,
                  constants.LOG_LEVEL.ERROR,
                  constants.FBY_ALERT_CODES.STOCK_SYNC,
                  constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL,
                  cron_id
                ));

                let errorJson = JSON.stringify(apiRequestResponse);
                //console.log(`\nERROR fby_user_id ${fby_user_id}, sku ${itemlist.sku}, ${constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL}:\n`, errorJson);
                set_response[itemlist.sku] = (errorMessage);

                //store log
                let inputs = [cron_name, cron_id, constants.CATCH_TYPE, errorJson, client.fby_user_id];
                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(cron_name, cron_id, fby_user_id, errorJson);
                  }
                })
              });
          }
          catch (error) {
          }
          retryCounter++;
        }
      }
      catch (error) {
        //console.log(`\nERROR ${constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_CHANNEL}: \n`, error.message);
      }
      await helpers.sleep();
    }
    try {
      //console.log(`\n${moment().format(MOMENT_DATE_FORMAT)}\t${globalCounter}/${total}) ${infoMessage}`);

      await dbCCLogs.bulkInsert(batchInfoListDB);
    }
    catch (error) {
      //console.log('\nERROR While bulkInsert: \n', error.message);

    }
  }
  catch (error) {
    //console.log(`\nERROR ${constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_CHANNEL}: \n`, error.message);
  }
  return set_response;
}

/*  
* function for creating shopify Product
*/
const createProductShopify = async (product, client, cron_name, cron_id) => {
  let fby_user_id = client.fby_user_id;
  try {

    let set_response = {};
    let procesedSKUFamilyArr = []
    for await (const itemlist of product) {

      let seachSku = procesedSKUFamilyArr.filter(function (procesedSKUFamily) {
        if (procesedSKUFamily == itemlist.sku)
          return procesedSKUFamily;
      });
      if (seachSku == null || seachSku.length == 0) {
        //console.log('product sku: ', itemlist.sku);
        procesedSKUFamilyArr.push(itemlist.sku);
        await helpers.sleep();
        setTimeout(async () => {
          client.token = await helpers.getDecryptedData(client.token);
          let url = `${client.domain}admin/api/2023-04/products.json`;
          let options = {
            method: "post",
            uri: url,
            headers: {
              "Content-Type": "application/json",
              'X-Shopify-Access-Token': `${client.token}`
            },
            body: {
              "product":
              {
                "title": itemlist.title,
                "body_html": itemlist.description,
                "product_type": "Testing"
                // "images": [
                //   {
                //     "src": itemlist.image
                //   }
                // ],
                // "variants": [
                //   {
                //     "option1": itemlist.title,
                //     "price": itemlist.price,
                //     "sku": itemlist.sku,
                //     "inventory_quantity": itemlist.inventory_quantity,
                //     "barcode": itemlist.barcode
                //   }
                // ]
              }
            },
            json: true,
          };
          await request(options)
            .then(async (parsedBody) => {



              if (parsedBody.product.length > 0) {
                productsResponse = parsedBody.product;
                //console.log(`\nfby_user_id ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_CHANNEL}\n`);//, JSON.stringify(productsResponse));

              }
              else {
                productsResponse = [];
              }
              let product = parsedBody.product;
              //for each product skus and barcode
              for await (const data of product.variants) {

                try {

                  let img;
                  let flag = 0;
                  // if (data.sku == "" || !data.barcode) {
                  //   flag = 1;
                  //   continue;
                  // }
                  if (!product.image) {
                    img = "";
                  } else {
                    img = product.image.src;
                  }

                  let fby_user_id = client.fby_user_id;
                  let domain = client.domain;
                  let owner_code = client.owner_code;
                  let channel = client.channelName;
                  let sku = itemlist.sku;
                  let barcode = data.barcode;
                  let item_id = data.product_id;
                  let title = product.title;
                  let item_product_id = data.product_id;
                  let inventory_item_id = data.inventory_item_id;
                  let inventory_quantity = data.inventory_quantity;
                  let image = img;
                  let price = data.price;
                  let location_id = 0;
                  let description = data.description != undefined && data.description != null ? data.description : '';

                  //insert products got from shopify into products table
                  let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id
                    , description
                  ];
                  await common.addCreatedProduct(inputs, fby_user_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                      logger.logError(`createProducts fby_user_id: ${fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                  })

                }
                catch (ex) {
                  //console.log('ex: ', ex);

                }
              }

              set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
            })
            .catch(async function (err) {
              //console.log(`fby_user_id ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_CHANNEL}\n`, err.message);
              set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_ERROR);
              // mail
              //store log
              let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_user_id];
              //console.log('inputs: ', inputs);

            });

        }, 1000)
      }
    }
    return set_response;
  }
  catch (err) {
    //console.log(err);
  }
}

exports.createProduct = async (client, sku, isUpdate) => {
  (async () => {
    try {
      // Retrieve product data from local MySQL database
      let productData = '';
      productData = await common.getCreateProductBySku(client.fby_user_id, sku);
      // Create product in Shopify using the retrieved data
      switch (client.channelName) {
        case 'Shopify IT':
          if (productData) {
            if (isUpdate == 'yes') {
              // Update existing product
              updateShopifyProductWithVariant(productData, client, '', '');
            } else {
              // Create new product
              createShopifyProductWithVariant(productData, client, '', '');
            }
            console.log("Product processed successfully in Shopify:");
          }
          break;
        case 'amazon':
          // Execute code block for Amazon
          if (productData) {
            console.log("Product processed successfully in Amazon:");
            await createAmazonProduct(productData, client);
          }
          break;
        case 'woocommerce':
          // Execute code block for WooCommerce
          if (productData) {
            console.log("Product processed successfully in WooCommerce:");
            await createWooCommerceProduct(productData, client);
          }
          break;
        case 'prestashop':
          // Execute code block for PrestaShop
          if (productData) {
            console.log("Product processed successfully in PrestaShop:");
            await createPrestaShopProduct(productData, client);
          }
          break;
        case 'mirakl':
          // Execute code block for Mirakl
          if (productData) {
            console.log("Product processed successfully in Mirakl:");
            await createMiraklProduct(productData, client);
          }
          break;
        case 'storden':
          // Execute code block for Storden
          if (productData) {
            console.log("Product processed successfully in Storden:");
            await createStordenProduct(productData, client);
          }
          break;
        default:
          console.error("Invalid channel name:", client.channelName);
      }

    } catch (error) {
      console.error("Error:", error);
    }
  })();
}

const createShopifyProductWithVariant = async (productData, client, cron_name, cron_id) => {
  const { fields, photos, variants, options } = productData.newProduct;
  const { title, tags, brand, weight_value, dimensions, description, categories, product_type } = fields;
  // Prepare product data for Shopify API
  const shopifyProductData = {
    product: {
      title: title,
      body_html: description,
      product_type: product_type,
      tags: tags,
    }
  };

  // Add images to the product data
  const images = photos.map(image => {
    return { "src": image.image };
  });
  shopifyProductData.product.images = images;

  shopifyProductData.product.options = options;


  // Add variants to the product data
  shopifyProductData.product.variants = variants.map((variant, index) => {
    let { position, price, sku, inventory_quantity, barcode, title, option_1_name, option_1_value, option_2_name, option_2_value } = variant;
    position = position || 0;
    let option1 = '';
    let option2 = '';
    if (option_1_name) {
      option1 = option_1_value;
    }
    if (option_2_name) {
      option2 = option_2_value;
    }
    return {
      position,
      price,
      sku,
      inventory_quantity,
      barcode,
      title,
      option1,
      option2
    };
  });

  setTimeout(async () => {
    client.token = await helpers.getDecryptedData(client.token);
    let url = `${client.domain}admin/api/2023-04/products.json`;
    let options = {
      method: "post",
      uri: url,
      headers: {
        "Content-Type": "application/json",
        'X-Shopify-Access-Token': `${client.token}`
      },
      body: shopifyProductData,
      json: true,
    };
    await request(options)
      .then(async (parsedBody) => {
        let product = parsedBody.product;
        try {
          let img;
          if (!product.image) {
            img = "";
          } else {
            img = product.image.src;
          }

          let fby_user_id = client.fby_user_id;
          let domain = client.domain;
          let owner_code = client.owner_code;
          let channel = client.channelName;
          let sku = productData.newProduct.fields.sku;
          let barcode = product.barcode || '';
          let item_id = product.id;
          let title = product.title;
          let item_product_id = product.id;
          let inventory_item_id = product.id;
          let inventory_quantity = product.inventory_quantity || 0;
          let image = img;
          let price = product.price || 0;
          let location_id = 0;
          let description = product.description != undefined && product.description != null ? data.description : '';

          //insert products got from shopify into products table
          let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id
            , description
          ];
          await common.addCreatedProduct(inputs, fby_user_id, cron_name, cron_id, async function (result) {
            if (result.error) {
              logger.logError(`createProducts fby_user_id: ${fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
            }
          })
          if (productVariants.length <= 0) {
            set_response[sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
            return set_response;
          }
          for (var varients of product.variants) {
            inputs = [fby_user_id, channel, domain, owner_code, varients.sku, varients.barcode, varients.product_id, varients.title, varients.id, varients.inventory_item_id, inventory_quantity, inventory_quantity, image, varients.price, cron_name, cron_id, location_id
              , description
            ];
            await common.addCreatedProductVariant(inputs, fby_user_id, cron_name, cron_id, function (result) {
              if (result.error) {
                //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
              }
            });
          }
        }
        catch (ex) {
          console.log('ex: ', ex);
        }
        set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
      })
      .catch(async function (err) {
        console.log(`${constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_CHANNEL}\n`, err.message);
        set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_ERROR);
      });

  }, 1000)
}

const updateShopifyProductWithVariant = async (productData, client, cron_name, cron_id) => {
  try {
    const { fields, photos, variants, options } = productData.newProduct;
    const { title, tags, brand, weight_value, dimensions, description, categories, product_type } = fields;

    // Prepare product data for Shopify API
    const shopifyProductData = {
      product: {
        title: title,
        body_html: description,
        product_type: product_type,
        tags: tags,
      }
    };

    // Add images to the product data
    const images = photos.map(image => {
      return { "src": image.image };
    });
    shopifyProductData.product.images = images;

    shopifyProductData.product.options = options;

    // Add variants to the product data
    shopifyProductData.product.variants = variants.map((variant, index) => {
      let { position, price, sku, inventory_quantity, barcode, title, option_1_name, option_1_value, option_2_name, option_2_value } = variant;
      position = position || 0;
      let option1 = '';
      let option2 = '';
      if (option_1_name) {
        option1 = option_1_value;
      }
      if (option_2_name) {
        option2 = option_2_value;
      }
      return {
        position,
        price,
        sku,
        inventory_quantity,
        barcode,
        title,
        option1,
        option2
      };
    });

    // Convert client token to decrypted data
    client.token = await helpers.getDecryptedData(client.token);

    // Construct the update request URL
    let url = `${client.domain}admin/api/2023-04/products/${productData.shopifyProductId}.json`;

    // Set request options
    options = {
      method: "put", // Use PUT method for updating
      uri: url,
      headers: {
        "Content-Type": "application/json",
        'X-Shopify-Access-Token': `${client.token}`
      },
      body: shopifyProductData,
      json: true,
    };

    // Send update request
    await request(options)
      .then(async (parsedBody) => {
        console.log("Product updated successfully in Shopify:", parsedBody.product);
        let product = parsedBody.product;
        try {
          let img;
          if (!product.image) {
            img = "";
          } else {
            img = product.image.src;
          }

          let fby_user_id = client.fby_user_id;
          let domain = client.domain;
          let owner_code = client.owner_code;
          let channel = client.channelName;
          let sku = productData.newProduct.fields.sku;
          let barcode = product.barcode || '';
          let item_id = product.id;
          let title = product.title;
          let item_product_id = product.id;
          let inventory_item_id = product.id;
          let inventory_quantity = product.inventory_quantity || 0;
          let image = img;
          let price = product.price || 0;
          let location_id = 0;
          let description = product.description != undefined && product.description != null ? data.description : '';

          //insert products got from shopify into products table
          let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id
            , description
          ];
          await common.addCreatedProduct(inputs, fby_user_id, cron_name, cron_id, async function (result) {
            if (result.error) {
              logger.logError(`createProducts fby_user_id: ${fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
            }
          })
          if (productVariants.length <= 0) {
            set_response[sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
            return set_response;
          }
          for (var varients of product.variants) {
            inputs = [fby_user_id, channel, domain, owner_code, varients.sku, varients.barcode, varients.product_id, varients.title, varients.id, varients.inventory_item_id, inventory_quantity, inventory_quantity, image, varients.price, cron_name, cron_id, location_id
              , description
            ];
            await common.addCreatedProductVariant(inputs, fby_user_id, cron_name, cron_id, function (result) {
              if (result.error) {
                //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
              }
            });
          }
        }
        catch (ex) {
          console.log('ex: ', ex);
        }
        set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
      })
      .catch(async function (err) {
        console.log("Error updating product in Shopify:", err.message);
      });
  } catch (error) {
    console.error("Error updating product:", error);
  }
}

const createAmazonProduct = async (productData, client) => {
  try {
    // Code for creating product in Amazon goes here
    console.log("Creating product in Amazon:", productData);
    // Sample implementation:
    const response = await request.post({
      uri: 'Amazon API endpoint URL for creating products',
      body: productData,
      headers: {
        'Authorization': `Bearer ${client.amazonAccessToken}`,
        'Content-Type': 'application/json'
      },
      json: true
    });
    console.log("Amazon product created:", response);
  } catch (error) {
    console.error("Error creating product in Amazon:", error);
  }
}

const createWooCommerceProduct = async (productData, client) => {
  try {
    // Code for creating product in WooCommerce goes here
    console.log("Creating product in WooCommerce:", productData);
    // Sample implementation:
    const response = await request.post({
      uri: 'WooCommerce API endpoint URL for creating products',
      body: productData,
      auth: {
        'user': client.wooCommerceApiKey,
        'pass': client.wooCommerceApiSecret
      },
      json: true
    });
    console.log("WooCommerce product created:", response);
  } catch (error) {
    console.error("Error creating product in WooCommerce:", error);
  }
}

const createPrestaShopProduct = async (productData, client) => {
  try {
    // Code for creating product in PrestaShop goes here
    console.log("Creating product in PrestaShop:", productData);
    // Sample implementation:
    const response = await request.post({
      uri: 'PrestaShop API endpoint URL for creating products',
      body: productData,
      auth: {
        'user': client.prestaShopApiKey,
        'pass': ''
      },
      json: true
    });
    console.log("PrestaShop product created:", response);
  } catch (error) {
    console.error("Error creating product in PrestaShop:", error);
  }
}

const createStordenProduct = async (productData, client) => {
  try {
    // Code for creating product in Storden goes here
    console.log("Creating product in Storden:", productData);
    // Sample implementation:
    const response = await request.post({
      uri: 'Storden API endpoint URL for creating products',
      body: productData,
      headers: {
        'Authorization': `Bearer ${client.stordenAccessToken}`,
        'Content-Type': 'application/json'
      },
      json: true
    });
    console.log("Storden product created:", response);
  } catch (error) {
    console.error("Error creating product in Storden:", error);
  }
}

const createShopifyProductWithMultipleProductVarient = async (product, productVariants, client, cron_name, cron_id) => {
  let fby_user_id = client.fby_user_id;
  try {

    let set_response = {};
    let procesedSKUFamilyArr = []
    for await (const itemlist of product) {

      let seachSku = procesedSKUFamilyArr.filter(function (procesedSKUFamily) {
        if (procesedSKUFamily == itemlist.sku)
          return procesedSKUFamily;
      });
      if (seachSku == null || seachSku.length == 0) {
        //console.log('product sku: ', itemlist.sku);
        procesedSKUFamilyArr.push(itemlist.sku);
        await helpers.sleep();
        setTimeout(async () => {
          client.token = await helpers.getDecryptedData(client.token);
          let url = `${client.domain}admin/api/2023-04/products.json`;
          let options = {
            method: "post",
            uri: url,
            headers: {
              "Content-Type": "application/json",
              'X-Shopify-Access-Token': `${client.token}`
            },
            body: {
              "product":
              {
                "title": itemlist.title,
                "body_html": itemlist.description,
                "product_type": itemlist.product_type || 'Nod'
                // "images": [
                //   {
                //     "src": itemlist.image
                //   }
                // ],
                // "variants": [
                //   {
                //     "option1": itemlist.title,
                //     "price": itemlist.price,
                //     "sku": itemlist.sku,
                //     "inventory_quantity": itemlist.inventory_quantity,
                //     "barcode": itemlist.barcode
                //   }
                // ]
              }
            },
            json: true,
          };
          await request(options)
            .then(async (parsedBody) => {
              // if (parsedBody.product.length > 0) {
              //   productsResponse = parsedBody.product;
              //   console.log(`\nfby_user_id ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_CHANNEL}\n`);//, JSON.stringify(productsResponse));

              // }
              // else {
              //   productsResponse = [];
              // }
              let product = parsedBody.product;
              //for each product skus and barcode

              try {

                let img;
                let flag = 0;
                // if (data.sku == "" || !data.barcode) {
                //   flag = 1;
                //   continue;
                // }
                if (!product.image) {
                  img = "";
                } else {
                  img = product.image.src;
                }

                let fby_user_id = client.fby_user_id;
                let domain = client.domain;
                let owner_code = client.owner_code;
                let channel = client.channelName;
                let sku = itemlist.sku;
                let barcode = product.barcode || '';
                let item_id = product.id;
                let title = product.title;
                let item_product_id = product.id;
                let inventory_item_id = product.id;
                let inventory_quantity = product.inventory_quantity || 0;
                let image = img;
                let price = product.price || 0;
                let location_id = 0;
                let description = product.description != undefined && product.description != null ? data.description : '';

                //insert products got from shopify into products table
                let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id
                  , description
                ];
                await common.addCreatedProduct(inputs, fby_user_id, cron_name, cron_id, async function (result) {
                  if (result.error) {
                    logger.logError(`createProducts fby_user_id: ${fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                  }
                })
                let base64Obj = {}
                if (productVariants.length <= 0) {
                  set_response[sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
                  return set_response;
                }
                // for (var varients of productVariants) {
                // if(varients.imageB64) {
                //   // try {
                //   //   const result = await cloudinary.uploader.upload(varients.imageB64,{timeout:60000});
                //   //   console.log(result);
                //   //   varients.image =  result.public_id;
                //   // } catch(error) {
                //   //   console.log(error);
                //   // }
                //   base64Obj[varients.sku] = {
                //     imageB64: varients.imageB64,
                //     filename: varients.filename
                //   }
                //   varients.image = varients.image || '';
                // }
                //   inputs = [
                //     fby_user_id, channel, domain, owner_code, varients.sku, varients.barcode, item_id, title, item_product_id, varients.quantity,
                //     -1, varients.quantity, varients.image, varients.price, cron_name, cron_id, location_id
                //     , description
                //   ];
                //   await common.addCreateProductVariant(inputs, fby_user_id, cron_name, cron_id, async function (result) {
                //     if (result.error) {
                //       //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                //     }
                //   });
                //   if (varients.image) {
                //     let insImg = [varients.image, varients.sku, sku, fby_user_id, null, 0];
                //     //console.log('images---   ',insImg);
                //     await common.addImages(insImg, fby_user_id, cron_name, cron_id, function (result) {
                //       if (result.error) {
                //         logger.logError(`getProductsFby fby_user_id: ${fby_user_id}, sku${sku}, ${url}`, JSON.stringify(insImg));
                //       }
                //     });
                //   }
                //   inputs = [fby_user_id, varients.price, varients.specialPrice, varients.sku];
                //   await common.updatePrices(inputs, async function (result) {
                //     if (result.error) {
                //       logger.logError(`getProductPricesFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                //     }
                //   });

                // }
                // await updateProductImages(client, itemlist, cron_name, cron_id);
                await common.getCreateProductVariantByDomain(client, "domain", cron_name, cron_id, async function (result) {
                  if (result.error) {
                    // store get product error log
                    //console.log('inputs: ', inputs);
                    return false;
                  } else {
                    await createProductVariantShopifyInBulk(result.success.data, client, cron_name, cron_id, base64Obj);
                    // return await commonController.updateShopifyInventory(result.success.data, shopifyAccount, cron_name, cron_id)

                  }
                })

              }
              catch (ex) {
                console.log('ex: ', ex);

              }

              set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
            })
            .catch(async function (err) {
              console.log(`fby_user_id ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_CHANNEL}\n`, err.message);
              set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_ERROR);
              // mail
              //store log
              let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_user_id];
              //console.log('inputs: ', inputs);

            });

        }, 1000)
      }
    }
    return await set_response;
  }
  catch (err) {
    console.log(err);
  }
}

const createShopifyProduct = async (product, client, cron_name, cron_id) => {
  let fby_user_id = client.fby_user_id;
  try {

    let set_response = {};
    let procesedSKUFamilyArr = []
    for await (const itemlist of product) {

      let seachSku = procesedSKUFamilyArr.filter(function (procesedSKUFamily) {
        if (procesedSKUFamily == itemlist.sku)
          return procesedSKUFamily;
      });
      if (seachSku == null || seachSku.length == 0) {
        //console.log('product sku: ', itemlist.sku);
        procesedSKUFamilyArr.push(itemlist.sku);
        await helpers.sleep();
        setTimeout(async () => {
          client.token = await helpers.getDecryptedData(client.token);
          let url = `${client.domain}admin/api/2023-04/products.json`;
          let options = {
            method: "post",
            uri: url,
            headers: {
              "Content-Type": "application/json",
              'X-Shopify-Access-Token': `${client.token}`
            },
            body: {
              "product":
              {
                "title": itemlist.title,
                "body_html": itemlist.description,
                "product_type": itemlist.product_type || ''
                // "images": [
                //   {
                //     "src": itemlist.image
                //   }
                // ],
                // "variants": [
                //   {
                //     "option1": itemlist.title,
                //     "price": itemlist.price,
                //     "sku": itemlist.sku,
                //     "inventory_quantity": itemlist.inventory_quantity,
                //     "barcode": itemlist.barcode
                //   }
                // ]
              }
            },
            json: true,
          };
          await request(options)
            .then(async (parsedBody) => {
              // if (parsedBody.product.length > 0) {
              //   productsResponse = parsedBody.product;
              //   console.log(`\nfby_user_id ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_CHANNEL}\n`);//, JSON.stringify(productsResponse));

              // }
              // else {
              //   productsResponse = [];
              // }
              let product = parsedBody.product;
              //for each product skus and barcode

              try {

                let img;
                let flag = 0;
                // if (data.sku == "" || !data.barcode) {
                //   flag = 1;
                //   continue;
                // }
                if (!product.image) {
                  img = "";
                } else {
                  img = product.image.src;
                }

                let fby_user_id = client.fby_user_id;
                let domain = client.domain;
                let owner_code = client.owner_code;
                let channel = client.channelName;
                let sku = itemlist.sku;
                let barcode = product.barcode || '';
                let item_id = product.id;
                let title = product.title;
                let item_product_id = product.id;
                let inventory_item_id = product.id;
                let inventory_quantity = product.inventory_quantity || 0;
                let image = img;
                let price = product.price || 0;
                let location_id = 0;
                let description = product.description != undefined && product.description != null ? data.description : '';

                //insert products got from shopify into products table
                let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id
                  , description
                ];
                await common.addCreatedProduct(inputs, fby_user_id, cron_name, cron_id, async function (result) {
                  if (result.error) {
                    logger.logError(`createProducts fby_user_id: ${fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                  }
                })

              }
              catch (ex) {
                console.log('ex: ', ex);

              }


              set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
            })
            .catch(async function (err) {
              console.log(`fby_user_id ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_CHANNEL}\n`, err.message);
              set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_ERROR);
              // mail
              //store log
              let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_user_id];
              //console.log('inputs: ', inputs);

            });

        }, 1000)
      }
    }
    return await set_response;
  }
  catch (err) {
    console.log(err);
  }
}



const updateProductShopifyWithVarients = async (product, productVariants, client, cron_name, cron_id) => {
  let fby_user_id = client.fby_user_id;
  try {

    let set_response = {};
    let procesedSKUFamilyArr = []
    for await (const itemlist of product) {

      let seachSku = procesedSKUFamilyArr.filter(function (procesedSKUFamily) {
        if (procesedSKUFamily == itemlist.sku)
          return procesedSKUFamily;
      });
      if (seachSku == null || seachSku.length == 0) {
        //console.log('product sku: ', itemlist.sku);
        procesedSKUFamilyArr.push(itemlist.sku);
        await common.getCreatedProductIDBySku(itemlist.sku, async function (result) {
          if (result.error) {

          }
          else {

            let imageOrder = itemlist.imageOrder || 0;
            let product_id = result.success.data[0].item_product_id;
            await helpers.sleep();
            setTimeout(async () => {
              client.token = await helpers.getDecryptedData(client.token);
              let url = `${client.domain}admin/api/2023-04/products/${product_id}`;
              let options = {
                method: "put",
                uri: url,
                headers: {
                  "Content-Type": "application/json",
                  'X-Shopify-Access-Token': `${client.token}`
                },
                body: {
                  "product":
                  {
                    "title": itemlist.title,
                    "body_html": itemlist.description,
                    "product_type": itemlist.product_type || 'Nod'
                    // "images": [
                    //   {
                    //     "src": itemlist.image
                    //   }
                    // ],
                    // "variants": [
                    //   {
                    //     "option1": itemlist.title,
                    //     "price": itemlist.price,
                    //     "sku": itemlist.sku,
                    //     "inventory_quantity": itemlist.inventory_quantity,
                    //     "barcode": itemlist.barcode
                    //   }
                    // ]
                  }
                },
                json: true,
              };
              await request(options)
                .then(async (parsedBody) => {
                  // if (parsedBody.product.length > 0) {
                  //   productsResponse = parsedBody.product;
                  //   console.log(`\nfby_user_id ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_CHANNEL}\n`);//, JSON.stringify(productsResponse));

                  // }
                  // else {
                  //   productsResponse = [];
                  // }
                  let product = parsedBody.product;
                  //for each product skus and barcode

                  try {

                    let img;
                    let flag = 0;
                    // if (data.sku == "" || !data.barcode) {
                    //   flag = 1;
                    //   continue;
                    // }
                    if (!product.image) {
                      img = "";
                    } else {
                      img = product.image.src;
                    }

                    let fby_user_id = client.fby_user_id;
                    let domain = client.domain;
                    let owner_code = client.owner_code;
                    let channel = client.channelName;
                    let sku = itemlist.sku;
                    let barcode = product.barcode || '';
                    let item_id = product.id;
                    let title = product.title;
                    let item_product_id = product.id;
                    let inventory_item_id = product.id;
                    let inventory_quantity = product.inventory_quantity || 0;
                    let image = img;
                    let price = product.price || 0;
                    let location_id = 0;
                    let description = product.description != undefined && product.description != null ? data.description : '';

                    //insert products got from shopify into products table
                    let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id
                      , description
                    ];
                    await common.addCreatedProduct(inputs, fby_user_id, cron_name, cron_id, async function (result) {
                      if (result.error) {
                        logger.logError(`createProducts fby_user_id: ${fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                      }
                    })

                    for (var varients of productVariants) {
                      inputs = [
                        fby_user_id, channel, domain, owner_code, varients.sku, varients.barcode, item_id, title, item_product_id, varients.quantity,
                        -1, varients.quantity, '', varients.price, cron_name, cron_id, location_id
                        , description
                      ];
                      await common.addCreateProductVariant(inputs, fby_user_id, cron_name, cron_id, async function (result) {
                        if (result.error) {
                          //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                        }
                      });
                      let insImg = [image, varients.sku, sku, fby_user_id, null, 0];
                      //console.log('images---   ',insImg);
                      await common.addImages(insImg, fby_user_id, cron_name, cron_id, function (result) {
                        if (result.error) {
                          logger.logError(`getProductsFby fby_user_id: ${fby_user_id}, sku${sku}, ${url}`, JSON.stringify(insImg));
                        }
                      });
                      inputs = [fby_user_id, varients.price, varients.specialPrice, varients.sku];
                      await common.updatePrices(inputs, async function (result) {
                        if (result.error) {
                          logger.logError(`getProductPricesFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                        }
                      });

                    }
                    await updateProductImageswithVarient(client, itemlist.variants, cron_name, cron_id);

                  }
                  catch (ex) {
                    console.log('ex: ', ex);

                  }


                  set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
                })
                .catch(async function (err) {
                  console.log(`fby_user_id ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_CHANNEL}\n`, err.message);
                  set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_ERROR);
                  // mail
                  //store log
                  let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_user_id];
                  //console.log('inputs: ', inputs);

                });

            }, 1000)
          }
        });

      }
    }
    return commonController.updateShopifyInventory(productVariants, client, cron_name, cron_id)
  }
  catch (err) {
    console.log(err);
  }
}

const createProductVariantShopifyInBulk = async (products, client, cron_name, cron_id, base64Obj) => {
  let fby_user_id = client.fby_user_id;
  let set_response = {};
  try {
    for (var product of products) {
      try {
        await helpers.sleep();
        client.token = await helpers.getDecryptedData(client.token);

        let product_id = product.item_product_id;
        //console.log('getCreatedProductIDBySku-->itemlist.skuFamily: ', itemlist.skuFamily);


        let imageOrder = product.imageOrder || 0;
        // //console.log('\n');
        // //console.log('product_id: ', product_id);
        // //console.log('imageOrder: ', imageOrder);
        // var body;
        // if(!product.image) {
        //   body = { "image": { "attachment": base64Obj[product.sku].imageB64, "filename": base64Obj[product.sku].filename,"position": imageOrder } };
        // } else {
        //   body = { "image": { "src": product.image, "position": imageOrder } };

        // }
        let url = `${client.domain}/admin/api/2023-04/products/${product_id}/images.json`;
        let options = {
          method: "post",
          uri: url,
          headers: {
            "Content-Type": "application/json",
            'X-Shopify-Access-Token': `${client.token}`
          },
          body:
            { "image": { "src": product.image, "position": imageOrder } },

          json: true,
        };
        // console.log(options);
        await request(options)
          .then(async (parsedBody) => {
            console.log('post image res parsedBody: ', parsedBody);
            let inputs = [parsedBody.image.id, product.sku, client.fby_user_id]
            await common.updateImages(inputs, function (rsult) {
              if (rsult.error) {

              }
            })
            set_response[product.sku] = (`Product Images Updated.`);
            let product_id = 0;
            await common.getCreateProductVariantBySku(product.sku, async function (result) {
              if (result.error) {

              }
              else {
                product_id = result.success.data[0].item_product_id;
                let url = `${client.domain}admin/api/2023-04/products/${product_id}/variants.json`;
                let options = {
                  method: "post",
                  uri: url,
                  headers: {
                    "Content-Type": "application/json",
                    'X-Shopify-Access-Token': `${client.token}`
                  },
                  body:
                  {
                    "variant":
                    {
                      "image_id": parsedBody.image.id,
                      "option1": product.sku,
                      "price": product.price,
                      "compare_at_price": product.price,
                      "sku": product.sku,
                      "barcode": product.barcode
                    }
                  },
                  json: true,
                };
                await request(options)
                  .then(async (parsedBody) => {
                    if (parsedBody.variant != null
                      && parsedBody.variant != undefined
                      //   && ((Array.isArray(parsedBody.variant)
                      //   && parsedBody.variant.length > 0)
                      // || parsedBody.variant === object


                    ) {
                      if (Array.isArray(parsedBody.variant) && parsedBody.variant.length > 0) {
                        productsResponse = parsedBody.variant;
                      }
                      else {
                        productsResponse = [];
                        productsResponse.push(parsedBody.variant);
                      }


                    }
                    else {
                      productsResponse = [];
                    }
                    let data = parsedBody.variant;
                    //for each product skus and barcode

                    try {

                      let img;
                      let flag = 0;
                      // if (data.sku == "" || !data.barcode) {
                      //   flag = 1;
                      //   continue;
                      // }
                      if (!data.image_id) {
                        img = "";
                      } else {
                        img = data.image_id;
                      }

                      let domain = client.domain;
                      let owner_code = client.owner_code;
                      let channel = client.channelName;
                      let sku = data.sku;
                      let barcode = data.barcode;
                      let item_id = data.id;
                      let title = data.title;
                      let item_product_id = data.product_id;
                      let inventory_item_id = data.inventory_item_id;
                      let inventory_quantity = data.inventory_quantity;
                      let image = img;
                      let price = data.price;
                      let description = data.description != undefined && data.description != null ? data.description : '';

                      let location_id = 0;

                      //insert products got from shopify into products table
                      let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id
                        , description
                      ];
                      await common.addCreatedProductVariant(inputs, fby_user_id, cron_name, cron_id, function (result) {
                        if (result.error) {
                          logger.logError(`createProductVariants fby_user_id: ${client.fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));

                        }
                      })

                      if (product_id > 0) {
                        await deleteShopifyVariantsWithBlankSKU(fby_user_id, product_id);
                      }

                      let locationId = result.success.data[0].location_id;
                      let quantity = result.success.data[0].inventory_quantity;
                      let url = `${client.domain}admin/api/2023-04/inventory_levels/set.json`;
                      let options = {
                        method: "post",
                        uri: url,
                        headers: {
                          "Content-Type": "application/json",
                          'X-Shopify-Access-Token': `${client.token}`
                        },
                        body:
                          { "location_id": locationId, "inventory_item_id": inventory_item_id, "available": quantity },

                        json: true,
                      };

                      await request(options)
                        .then(async (parsedBody) => {
                          console.log('post image res parsedBody: ', parsedBody);
                          //insert products got from shopify into products table

                          await common.getCreatedProductVarientIDBySku(sku, async function (product) {
                            if (product.error) {

                            } else {
                              let prod = product.success.data[0];
                              let inputs = [prod.fby_user_id, prod.channel, prod.domain, prod.owner_code, prod.sku, prod.barcode, prod.item_id, prod.title, prod.item_product_id, prod.inventory_item_id, prod.inventory_quantity, quantity, prod.image, prod.price, prod.cron_name, prod.cron_id, prod.location_id
                                , description
                              ];
                              await common.addCreatedProductVariant(inputs, fby_user_id, cron_name, cron_id, function (result) {
                                if (result.error) {
                                  logger.logError(`createProductVariants fby_user_id: ${client.fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));

                                }
                              })
                            }
                          });
                        })
                        .catch(function (err) {

                          console.log(err);
                          //console.log('\n ERROR: ', JSON.stringify(inputs));
                        });

                    }
                    catch (error) {
                      //console.log('\n ERROR: ', error.message);
                    }



                    set_response[product.sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
                  })
                  .catch(function (error) {

                    set_response[product.sku] = (constants.PUSH_STOCK_CHANNEL_ERROR);
                    //store log
                    let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error.message), fby_user_id];
                    //console.log('\n ERROR: ', JSON.stringify(inputs));
                  });
              }
            });
          })
          .catch(function (err) {
            set_response[product.sku] = (constants.PUSH_STOCK_CHANNEL_ERROR);
            // mail
            //store log
            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err.message), fby_user_id];

            console.log('\n ERROR: ', JSON.stringify(inputs));
          });



      }
      catch (error) {
        console.log('\n ERROR: ', error.message);
      }
    }
    return await set_response;


  }
  catch (err) {
    console.log(err);
  }
}

const createProductVariantInBulk = async (products, client, cron_name, cron_id, base64Obj) => {
  let fby_user_id = client.fby_user_id;
  let set_response = {};
  try {
    for (var product of products) {
      await common.getCreatedProductIDBySku(product.sku, async function (result) {
        if (result.error) {
          // store get product error log
          //console.log('inputs: ', inputs);
          return false;
        } else {
          if (result.success.data.length > 0) {
            await shopifyController.createProduct(client, product.sku, 'yes');

          } else {
            await shopifyController.createProduct(client, product.sku, 'no');

          }

        }
      })
    }
    return set_response;


  }
  catch (err) {
    console.log(err);
  }
}


exports.updateShopifyProductVariant = async (product, realProduct, client, cron_name, cron_id) => {
  let fby_user_id = client.fby_user_id;
  try {
    for (var prod of realProduct) {
      let allSku = [];
      for (var skuProduct of prod.variants) {
        allSku.push(skuProduct.sku);
      }
      let set_response = {};
      let varients = [];
      for await (const itemlist of product) {
        if (allSku.includes(itemlist.sku)) {
          varients.push({
            "option1": itemlist.title,
            "price": itemlist.price,
            "sku": itemlist.sku,
            "inventory_quantity": itemlist.inventory_quantity,
            "barcode": itemlist.barcode
          })
        }
      }
      await helpers.sleep();
      setTimeout(async () => {
        client.token = await helpers.getDecryptedData(client.token);
        let url = `${client.domain}admin/api/2023-04/products.json`;
        let options = {
          method: "post",
          uri: url,
          headers: {
            "Content-Type": "application/json",
            'X-Shopify-Access-Token': `${client.token}`
          },
          body: {
            "product":
            {
              "title": prod.title,
              "body_html": prod.body_html,
              "product_type": prod.product_type,
              "images": [
                {
                  "src": prod.image
                }
              ],
              "variants": varients
            }
          },
          json: true,
        };
        await request(options)
          .then(async (parsedBody) => {
            if (parsedBody.product.length > 0) {
              productsResponse = parsedBody.product;
              console.log(`\nfby_user_id ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_CHANNEL}\n`);//, JSON.stringify(productsResponse));

            }
            else {
              productsResponse = [];
            }
            let product = parsedBody.product;
            //for each product skus and barcode
            for await (const data of product.variants) {

              try {

                let img;
                let flag = 0;
                // if (data.sku == "" || !data.barcode) {
                //   flag = 1;
                //   continue;
                // }
                if (!product.image) {
                  img = "";
                } else {
                  img = product.image.src;
                }

                let fby_user_id = client.fby_user_id;
                let domain = client.domain;
                let owner_code = client.owner_code;
                let channel = client.channelName;
                let sku = itemlist.sku;
                let barcode = data.barcode;
                let item_id = data.product_id;
                let title = product.title;
                let item_product_id = data.product_id;
                let inventory_item_id = data.inventory_item_id;
                let inventory_quantity = data.inventory_quantity;
                let image = img;
                let price = data.price;
                let location_id = 0;
                let description = data.description != undefined && data.description != null ? data.description : '';

                //insert products got from shopify into products table
                let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id
                  , description
                ];
                await common.addCreatedProductVariant(inputs, fby_user_id, cron_name, cron_id, async function (result) {
                  if (result.error) {
                    logger.logError(`createProducts fby_user_id: ${fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                  }
                })

              }
              catch (ex) {
                //console.log('ex: ', ex);

              }
            }

            set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
          })
          .catch(async function (err) {
            console.log(`fby_user_id ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_PRODUCTS_TO_CHANNEL}\n`, err.message);
            set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_ERROR);
            // mail
            //store log
            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_user_id];
            //console.log('inputs: ', inputs);

          });

      }, 1000)
      return await set_response;
    }

  }
  catch (err) {
    console.log(err);
  }
}


// exports.createShopifyProduct = async (client, cron_name, cron_id) => {
//   await common.getCreateProductByDomain(client, "domain", cron_name, cron_id, async function (result) {
//     if (result.error) {
//       // store get product error log
//       return false;
//     } else {
//       return await createProductShopify(result.success.data, client, cron_name, cron_id);
//     }
//   });
// }
const updateProductShopify = async (product, client, cron_name, cron_id) => {
  let fby_user_id = client.fby_user_id;
  try {

    let set_response = {};
    for await (const itemlist of product) {
      await helpers.sleep();
      //setTimeout(async () => {
      client.token = await helpers.getDecryptedData(client.token);
      let url = `${client.domain}admin/api/2023-04/products/${itemlist.item_product_id}.json`;
      let options = {
        method: "put",
        uri: url,
        headers: {
          "Content-Type": "application/json",
          'X-Shopify-Access-Token': `${client.token}`
        },
        body: {
          "product":
          {
            "title": itemlist.title,
            "body_html": itemlist.description,
            "product_type": "Testing"
            // "images": [
            //   {
            //     "src": itemlist.image
            //   }
            // ],
            // "variants": [
            //   {
            //     "option1": itemlist.title,
            //     "price": itemlist.price,
            //     "sku": itemlist.sku,
            //     "inventory_quantity": itemlist.inventory_quantity,
            //     "barcode": itemlist.barcode
            //   }
            // ]
          }
        },
        json: true,
      };
      await request(options)
        .then(async (parsedBody) => {
          if (parsedBody.product.length > 0) {
            productsResponse = parsedBody.product;

          }
          else {
            productsResponse = [];
          }
          let product = parsedBody.product;
          //for each product skus and barcode
          for await (const data of product.variants) {

            try {

              let img;
              let flag = 0;
              // if (data.sku == "" || !data.barcode) {
              //   flag = 1;
              //   continue;
              // }
              if (!product.image) {
                img = "";
              } else {
                img = product.image.src;
              }


              let domain = client.domain;
              let owner_code = client.owner_code;
              let channel = client.channelName;
              let sku = itemlist.sku;
              let barcode = data.barcode;
              let item_id = data.product_id;
              let title = data.title;
              let item_product_id = data.product_id;
              let inventory_item_id = data.inventory_item_id;
              let inventory_quantity = data.inventory_quantity;
              let image = img;
              let price = data.price;
              let location_id = 0;
              let description = data.description != undefined && data.description != null ? data.description : '';

              //insert products got from shopify into products table
              let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id
                , description
              ];
              await common.addCreatedProduct(inputs, fby_user_id, cron_name, cron_id, function (result) {
                if (result.error) {
                  logger.logError(`createProducts fby_user_id: ${fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));

                }
              })

            }
            catch (error) {
              //console.log('\n ERROR: ', error.message);
            }
          }

          set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
        })
        .catch(function (err) {
          set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_ERROR);

          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_user_id];
          //console.log('\n ERROR: ', JSON.stringify(inputs));

        });

      //}, 1000)
    }
    return set_response;
  }
  catch (error) {
    console.log('\n ERROR: ', error.message);
  }

}

const createProductVariantShopify = async (product, image_id, client, cron_name, cron_id) => {
  try {

    let fby_user_id = client.fby_user_id;
    let set_response = {};
    let infoMessage = `fby_user_id: ${fby_user_id}, createProductVariantShopify `;
    for await (const itemlist of product) {
      try {
        await helpers.sleep();
        //console.log(`\n${infoMessage}, SKU, ${itemlist.sku}`);
        client.token = await helpers.getDecryptedData(client.token);
        let product_id = 0;
        await common.getCreateProductVariantBySku(itemlist.sku, async function (result) {
          if (result.error) {

          }
          else {
            product_id = result.success.data[0].item_product_id;

            let url = `${client.domain}admin/api/2023-04/products/${product_id}/variants.json`;
            let options = {
              method: "post",
              uri: url,
              headers: {
                "Content-Type": "application/json",
                'X-Shopify-Access-Token': `${client.token}`
              },
              body:
              {
                "variant":
                {
                  "image_id": image_id,
                  "option1": itemlist.sku,
                  "price": itemlist.specialPrice,
                  "compare_at_price": itemlist.price,
                  "sku": itemlist.sku,
                  "barcode": itemlist.barcode
                }
              },
              json: true,
            };
            await request(options)
              .then(async (parsedBody) => {
                if (parsedBody.variant != null
                  && parsedBody.variant != undefined
                  //   && ((Array.isArray(parsedBody.variant)
                  //   && parsedBody.variant.length > 0)
                  // || parsedBody.variant === object


                ) {
                  if (Array.isArray(parsedBody.variant) && parsedBody.variant.length > 0) {
                    productsResponse = parsedBody.variant;
                  }
                  else {
                    productsResponse = [];
                    productsResponse.push(parsedBody.variant);
                  }


                }
                else {
                  productsResponse = [];
                }
                let data = parsedBody.variant;
                //for each product skus and barcode

                try {

                  let img;
                  let flag = 0;
                  // if (data.sku == "" || !data.barcode) {
                  //   flag = 1;
                  //   continue;
                  // }
                  if (!data.image_id) {
                    img = "";
                  } else {
                    img = data.image_id;
                  }

                  let domain = client.domain;
                  let owner_code = client.owner_code;
                  let channel = client.channelName;
                  let sku = itemlist.sku;
                  let barcode = data.barcode;
                  let item_id = data.id;
                  let title = data.title;
                  let item_product_id = data.product_id;
                  let inventory_item_id = data.inventory_item_id;
                  let inventory_quantity = data.inventory_quantity;
                  let image = img;
                  let price = data.price;
                  let description = data.description != undefined && data.description != null ? data.description : '';

                  let location_id = 0;

                  //insert products got from shopify into products table
                  let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id
                    , description
                  ];
                  await common.addCreatedProductVariant(inputs, fby_user_id, cron_name, cron_id, function (result) {
                    if (result.error) {
                      logger.logError(`createProductVariants fby_user_id: ${client.fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));

                    }
                  })

                  if (product_id > 0) {
                    await deleteShopifyVariantsWithBlankSKU(fby_user_id, product_id);
                  }

                }
                catch (error) {
                  //console.log('\n ERROR: ', error.message);
                }



                set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
              })
              .catch(function (error) {

                set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_ERROR);
                //store log
                let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error.message), fby_user_id];
                //console.log('\n ERROR: ', JSON.stringify(inputs));
              });
          }
        });
      }

      catch (error) {
        //console.log(`\nERROR shopifyController Line  2408 \n`, JSON.stringify(error.message));

      }

    }
    return set_response;
  }
  catch (err) {
    //  //console.log(err);
  }
}


const updateProductVariantShopify = async (product, client, cron_name, cron_id) => {
  let fby_user_id = client.fby_user_id;
  try {

    let set_response = {};
    for await (const itemlist of product) {
      await helpers.sleep();
      client.token = await helpers.getDecryptedData(client.token);

      let url = `${client.domain}admin/api/2023-04/variants/${itemlist.item_id}.json`;
      let options = {
        method: "put",
        uri: url,
        headers: {
          "Content-Type": "application/json",
          'X-Shopify-Access-Token': `${client.token}`
        },
        body:
        {
          "variant":
          {
            "image_id": itemlist.image,
            "option1": itemlist.title,
            "price": itemlist.specialPrice,
            "compare_at_price": itemlist.price,
            "sku": itemlist.sku,
            "barcode": itemlist.barcode
          }
        },
        json: true,
      };
      await request(options)
        .then(async (parsedBody) => {
          if (parsedBody.variant != null
            && parsedBody.variant != undefined
            && parsedBody.variant.length > 0) {
            productsResponse = parsedBody.variant;

          }
          else {
            productsResponse = [];
          }
          let data = parsedBody.variant;
          //for each product skus and barcode

          try {

            let img;
            let flag = 0;
            // if (data.sku == "" || !data.barcode) {
            //   flag = 1;
            //   continue;
            // }
            if (!data.image_id) {
              img = "";
            } else {
              img = data.image_id;
            }


            let domain = client.domain;
            let owner_code = client.owner_code;
            let channel = client.channelName;
            let sku = itemlist.sku;
            let barcode = data.barcode;
            let item_id = data.id;
            let title = data.title;
            let item_product_id = data.product_id;
            let inventory_item_id = data.inventory_item_id;
            let inventory_quantity = data.inventory_quantity;
            let image = img;
            let price = data.price;
            let description = data.description != undefined && data.description != null ? data.description : '';

            let location_id = 0;

            //insert products got from shopify into products table
            let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id
              , description
            ];
            await common.addCreatedProductVariant(inputs, fby_user_id, cron_name, cron_id, function (result) {
              if (result.error) {
                logger.logError(`createProductVariants fby_user_id: ${fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
              }
            })


          }
          catch (error) {
            //console.log('\n ERROR: ', error.message);
          }


          set_response[itemlist.sku] = (constants.PUSH_VARIANTS_CHANNEL_SUCCESS);
        })
        .catch(function (err) {
          //  //console.log('err: ', err);
          set_response[itemlist.sku] = (constants.PUSH_VARIANTS_CHANNEL_ERROR);
          // mail
          mail.shopifyPushProdMail(cron_name, cron_id, fby_user_id, JSON.stringify(err.message));
          //store log
          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err.message), fby_user_id];
          //console.log('\n ERROR: ', JSON.stringify(inputs));
        });
    }
    return set_response;
  }
  catch (error) {
    //console.log('\n ERROR: ', error.message);
  }
}

const updateProductImages = async (client, itemlist, cron_name, cron_id) => {
  let fby_user_id = client.fby_user_id;
  try {

    let set_response = {};


    await helpers.sleep();
    client.token = await helpers.getDecryptedData(client.token);

    let product_id = 0;
    //console.log('getCreatedProductIDBySku-->itemlist.skuFamily: ', itemlist.skuFamily);
    await common.getCreatedProductIDBySku(itemlist.sku, async function (result) {
      if (result.error) {

      }
      else {

        let imageOrder = itemlist.imageOrder || 0;
        product_id = result.success.data[0].item_product_id;;
        // //console.log('\n');
        // //console.log('product_id: ', product_id);
        // //console.log('imageOrder: ', imageOrder);

        let url = `${client.domain}admin/api/2023-04/products/${product_id}/images.json`;
        let options = {
          method: "post",
          uri: url,
          headers: {
            "Content-Type": "application/json",
            'X-Shopify-Access-Token': `${client.token}`
          },
          body:
            { "image": { "src": itemlist.image, "position": imageOrder } },

          json: true,
        };
        console.log(options);
        await request(options)
          .then(async (parsedBody) => {
            console.log('post image res parsedBody: ', parsedBody);
            let inputs = [parsedBody.image.id, itemlist.sku, client.fby_user_id]
            await common.updateImages(inputs, function (rsult) {
              if (rsult.error) {

              }
            })
            set_response[itemlist.sku] = (`Product Images Updated.`);
            await common.getCreateProductVariantByDomain(client, "domain", cron_name, cron_id, async function (result) {
              if (result.error) {
                // store get product error log
                //console.log('inputs: ', inputs);
                return false;
              } else {
                await createProductVariantShopify(result.success.data, parsedBody.image.id, client, cron_name, cron_id);
                return await commonController.updateShopifyInventory(result.success.data, client, cron_name, cron_id)

              }
            })
          })
          .catch(function (err) {
            set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_ERROR);
            // mail
            mail.shopifyPushProdMail(cron_name, cron_id, fby_user_id, JSON.stringify(err.message));
            //store log
            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err.message), fby_user_id];

            console.log('\n ERROR: ', JSON.stringify(inputs));
          });
      }
    });





    return set_response;
  }
  catch (error) {
    console.log('\n ERROR: ', error.message);
  }

}

exports.updateProductImageswithVarient = async (client, itemlist, cron_name, cron_id) => {
  return await updateProductImageswithVarient(client, itemlist, cron_name, cron_id);
}
const updateProductImageswithVarient = async (client, itemlist, cron_name, cron_id) => {
  let fby_user_id = client.fby_user_id;
  try {

    let set_response = {};


    await helpers.sleep();
    client.token = await helpers.getDecryptedData(client.token);

    let product_id = 0;
    //console.log('getCreatedProductIDBySku-->itemlist.skuFamily: ', itemlist.skuFamily);

    for await (const item of itemlist) {
      try {
        await helpers.sleep();
        //console.log(`\n${infoMessage}, SKU, ${itemlist.sku}`);
        client.token = await helpers.getDecryptedData(client.token);
        let item_id = 0;
        let image_id = '';
        await common.getCreatedProductVarientIDBySku(item.sku, async function (result) {
          if (result.error) {

          }
          else {
            item_id = result.success.data[0].item_id;
            image_id = result.success.data[0].image;
            let barcode = item.barcode || result.success.data[0].barcode;
            let url = `${client.domain}admin/api/2023-04/variants/${item_id}.json`;
            let options = {
              method: "put",
              uri: url,
              headers: {
                "Content-Type": "application/json",
                'X-Shopify-Access-Token': `${client.token}`
              },
              body:
              {
                "variant":
                {
                  "image_id": image_id,
                  "option1": item.sku,
                  "price": item.price,
                  "sku": item.sku,
                  "barcode": barcode
                }
              },
              json: true,
            };
            await request(options)
              .then(async (parsedBody) => {
                if (parsedBody.variant != null
                  && parsedBody.variant != undefined
                  //   && ((Array.isArray(parsedBody.variant)
                  //   && parsedBody.variant.length > 0)
                  // || parsedBody.variant === object


                ) {
                  if (Array.isArray(parsedBody.variant) && parsedBody.variant.length > 0) {
                    productsResponse = parsedBody.variant;
                  }
                  else {
                    productsResponse = [];
                    productsResponse.push(parsedBody.variant);
                  }


                }
                else {
                  productsResponse = [];
                }
                let data = parsedBody.variant;
                //for each product skus and barcode
                try {

                  let img;
                  let flag = 0;
                  // if (data.sku == "" || !data.barcode) {
                  //   flag = 1;
                  //   continue;
                  // }
                  if (!data.image_id) {
                    img = "";
                  } else {
                    img = data.image_id;
                  }

                  let domain = client.domain;
                  let owner_code = client.owner_code;
                  let channel = client.channelName;
                  let sku = data.sku;
                  let barcode = data.barcode;
                  let item_id = data.id;
                  let title = data.title;
                  let item_product_id = data.product_id;
                  let inventory_item_id = data.inventory_item_id;
                  let inventory_quantity = data.inventory_quantity;
                  let image = img;
                  let price = data.price;
                  let description = data.description != undefined && data.description != null ? data.description : '';

                  let location_id = 0;

                  //insert products got from shopify into products table
                  let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, inventory_quantity, inventory_quantity, image, price, cron_name, cron_id, location_id
                    , description
                  ];
                  await common.addCreatedProductVariant(inputs, fby_user_id, cron_name, cron_id, function (result) {
                    if (result.error) {
                      logger.logError(`createProductVariants fby_user_id: ${client.fby_user_id}, sku${sku}, ${url}`, JSON.stringify(inputs));

                    }
                  })

                  if (product_id > 0) {
                    await deleteShopifyVariantsWithBlankSKU(fby_user_id, product_id);
                  }

                }
                catch (error) {
                  //console.log('\n ERROR: ', error.message);
                }



                set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_SUCCESS);
              })
              .catch(function (error) {

                set_response[itemlist.sku] = (constants.PUSH_STOCK_CHANNEL_ERROR);
                //store log
                let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error.message), fby_user_id];
                //console.log('\n ERROR: ', JSON.stringify(inputs));
              });
          }
        });
      }

      catch (error) {
        //console.log(`\nERROR shopifyController Line  2408 \n`, JSON.stringify(error.message));

      }

    }







    return set_response;
  }
  catch (error) {
    console.log('\n ERROR: ', error.message);
  }

}


exports.updateShopifyProductImages = async (client, cron_name, cron_id) => {
  return await updateProductImages(client, cron_name, cron_id);
}

/*-----------internal functions for Products End---------- */



/**--------------Orders start------------------**/
/*
* Get Oredrs from Shopify
* this function will check fby_user_id through 'user' and 'shopify' table.
* if all ok, then it will get unshiped orders from shopify channel and insert into Order_details and order_master table.
*/
exports.getShopifyOrders = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL;
  let file_and_method_name = 'shopifyController.js getShopifyOrders';
  let cron_id = uuid();
  let fby_user_id = req.query.fby_user_id;
  let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;
  try {
    // `${cron_name}-${fby_id}`;
    let jobRunning = ccCache.get(cacheKey_Job);
    if (jobRunning == undefined || !jobRunning || jobRunning == null) {
      ccCache.set(cacheKey_Job, true);
    }
    else {
      let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
      set_response = {
        sucess: {
          message: msg
        }
      };
      //console.log(msg);
      return set_response;
    }
    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1]
    await common.insertCron(inputs, cron_name, cron_id, function (result) {
      if (result.error) {
        mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
      }
    })
    //process url request
    if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
      if (!res.headersSent) {
        res.send(constants.EMPTY);
      }
    } else {
      //get user
      await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
        if (result.error) {
          // store user error log
          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
          await common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            }
          })
          //send response
          if (!res.headersSent) {
            res.send(result.error);
          }
        } else {
          for (const client of result.success.data) {
            let fby_id = client.fby_user_id;
            //get shopify account detail
            await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
              if (result.error) {
                // store shopify account error log
                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                //console.log('\n ERROR: ', JSON.stringify(inputs));

                //send response
                //console.log("shopifyUserDetail");
                if (!res.headersSent) {
                  res.send(result.error);
                }
              } else {
                //internal asynchronous function for adding products to table and getting response parameters
                if (result.success.data[0].orderSync == 1) {
                  await getOrders(result.success.data, client, fby_id, cron_name, cron_id)
                    .then((params) => {
                      if (!res.headersSent) {
                        res.send(params);
                      }
                    });
                }
                else {
                  //  //console.log('\n shopifyController.js--> getShopifyOrders--> CC_ORDER_UPDATE_NOT_ALLOWED_MSG: ', constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG);
                  set_response = {};
                  set_response[result.success.data[0].domain] = constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG;
                  if (!res.headersSent) {
                    res.send(set_response);
                  }
                }
              }
            })
          }
        }
      });
    }
    //after finish update cron status as 0
    res.on('finish', function () {
      let dt = dateTime.create();
      let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
      common.updateCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })
    });
  }
  catch (error) {
    //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
  }
  finally {
    ccCache.del(cacheKey_Job);
  }
}

/*
* Send Oredrs to Fby
* this function will check fby_user_id through 'user' and 'order_masters' table.
* if all ok, then it will get order details from order_masters table having status '0' and send to fby through fby controler.
*/
exports.sendOrdersFby = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY;
  let file_and_method_name = 'shopifyController.js sendOrdersFby';
  let cron_id = uuid();
  let fby_user_id = req.query.fby_user_id;
  let infoMessage = `fby_user_id: ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY}`;
  let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;

  try {
    // `${cron_name}-${fby_id}`;
    let jobRunning = ccCache.get(cacheKey_Job);
    if (jobRunning == undefined || !jobRunning || jobRunning == null) {
      ccCache.set(cacheKey_Job, true);
    }
    else {
      let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
      set_response = {
        sucess: {
          message: msg
        }
      };
      //console.log(msg);
      return set_response;
    }
    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1]
    await common.insertCron(inputs, cron_name, cron_id, function (result) {
      if (result.error) {
        mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
      }
    })
    //process url request
    if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
      if (!res.headersSent) {
        res.send(constants.EMPTY);
      }
    } else {
      //get user
      await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
        let fby_id = req.query.fby_user_id;
        if (result.error) {
          // store user error log
          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
          //console.log('inputs: ', inputs);

          //send response
          if (!res.headersSent) {
            res.send(result.error);
          }
        } else {
          let shopifyAccount = null;
          await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (shopifyAccounts) {
            if (shopifyAccounts.error) {

            } else {
              let set_response = {};
              for await (const shopifyAccount of shopifyAccounts.success.data) {

                for await (const client of result.success.data) {
                  /**
                  * get order details from order_masters table having same 'FBY_id' in 'user' table and status 0.
                  * Once successfully send to fby the status be set to 1.
                  */
                  if (shopifyAccount.orderSync == 1) {
                    await common.getOrder(client, "status", cron_name, cron_id, async function (result) {
                      if (result.error) {
                        // store get product error log
                        let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_user_id];
                        //console.log('inputs: ', inputs);

                        //send response
                        if (!res.headersSent) {
                          res.send(result.error);
                        }
                      } else {
                        let set_response = {};
                        if (result.success != undefined
                          && result.success.data != undefined
                          && result.success.data != null
                        ) {
                          let arrayResult = [];

                          if (Array.isArray(result.success.data)) {
                            arrayResult = result.success.data;
                          }
                          else {
                            arrayResult.push(arrayResult);
                          }
                          if (arrayResult.length == 0) {
                            //console.log(`\n${infoMessage}, ${constants.NORECORD.message}`)
                          }

                          let counterOrders = 0;
                          let totalOrders = result.success.data.length != undefined ? result.success.data.length : 0;
                          //console.log(`\n${infoMessage}, Total Orders : ${totalOrders}`);

                          for await (const order of result.success.data) {
                            counterOrders++;
                            //console.log(`\n${counterOrders} of ${totalOrders}) ${infoMessage}, Order_Number : ${order.order_no != undefined ? order.order_no : ''}`);

                            try {
                              //  //console.log('order.order_no: ', order.order_no);
                              /* Check if 'send_Orders_Fby' cron name and cron Id already exist or not */
                              let new_cron_id = cron_id;
                              let exist_cron = 0;
                              if (order.cron_name == cron_name && order.cron_id) {
                                new_cron_id = order.cron_id;
                                exist_cron = 1;
                              } else {
                                /* Update with new cron id */
                                let updt_time = dateTime.create();
                                let inputs = [order.order_no, cron_name, new_cron_id, updt_time.format('Y-m-d H:M:S')];

                                await common.updateOrderCron(inputs, fby_user_id, cron_name, new_cron_id, function (result) {
                                  if (result.error) {
                                    // store update Order error log
                                    let inputs = [cron_name, new_cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_user_id];
                                    //console.log('inputs: ', inputs);

                                  }
                                })
                              }
                              /* calling fby controller to get 'jwt token' and 'insert Orders' */
                              await fbyController.getFBYToken(client, cron_name, new_cron_id, async function (result) {
                                if (result.error) {
                                  set_response.jsonData = result.error;
                                } else {
                                  let api_token = result.success.data;
                                  await fbyController.insertOrder(api_token, order, exist_cron, cron_name, new_cron_id, function (result) {
                                    set_response[order.id] = result;
                                  })
                                }
                              })
                            }
                            catch (err) {
                              let errJson = JSON.stringify(err.message);
                              //console.log(`\n${infoMessage}, Order_Number: ${order.order_no}\n`, errJson);
                            }
                          }
                        }
                        /**
                         * set time out is required to await 'for of' to finish and send response in 15 seconds.
                         * otherwise 'set_response' will be blank.
                         */
                        setTimeout(() => {
                          if (!res.headersSent) {
                            res.send(set_response);
                          }
                        }, 1000);
                      }
                    });
                  }
                  else {
                    //  //console.log('\n shopifyController.js--> sendOrdersFby--> CC_ORDER_UPDATE_NOT_ALLOWED_MSG: ', constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG);
                    set_response[shopifyAccount.domain] = constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG;
                    if (!res.headersSent) {
                      res.send(set_response);
                    }
                  }

                }
              }
            }
          });
        }
      });
    }
    //after finish update cron status as 0
    res.on('finish', function () {
      let dt = dateTime.create();
      let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
      common.updateCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })
    });

  }
  catch (error) {
    //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
  }
  finally {
    ccCache.del(cacheKey_Job);
  }
}
/*
* Send Canceled Oredrs to Fby
* this function will check fby_user_id through 'user' and 'order_masters' table.
* if all ok, then it will get order details from order_masters table having status '0' and send to fby through fby controler.
*/
exports.sendCanceledOrdersFby = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.PUSH_CANCELLED_ORDER_TO_FBY;
  let file_and_method_name = 'shopifyController.js sendCanceledOrdersFby';
  let cron_id = uuid();
  let fby_user_id = req.query.fby_user_id;
  let infoMessage = `fby_user_id: ${fby_user_id}, ${constants.CC_OPERATIONS.PUSH_CANCELLED_ORDER_TO_FBY}`;
  let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;
  try {
    // `${cron_name}-${fby_id}`;
    let jobRunning = ccCache.get(cacheKey_Job);
    if (jobRunning == undefined || !jobRunning || jobRunning == null) {
      ccCache.set(cacheKey_Job, true);
    }
    else {
      let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
      set_response = {
        sucess: {
          message: msg
        }
      };
      //console.log(msg);
      return set_response;
    }
    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [fby_user_id, cron_name, cron_id, 1]
    await common.insertCron(inputs, cron_name, cron_id, function (result) {
      if (result.error) {
        //mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
      }
    })
    //process url request
    if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
      if (!res.headersSent) {
        res.send(constants.EMPTY);
      }
    } else {
      //get user

      await common.userDetail(fby_user_id, cron_name, cron_id, async function (result) {
        if (result.error) {
          // store user error log
          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_user_id];
          //console.log('\n ERROR: ', JSON.stringify(inputs));

          //send response
          if (!res.headersSent) {
            res.send(result.error);
          }
        } else {
          for (const fbyUser of result.success.data) {

            //get shopify account detail
            await common.shopifyUserDetail(fby_user_id, cron_name, cron_id, async function (result) {
              if (result.error) {
                // store shopify account error log
                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_user_id];
                //console.log('\n ERROR: ', JSON.stringify(inputs));

                //send response
                if (!res.headersSent) {
                  res.send(result.error);
                }
              } else {
                let set_response = {};
                for (const client of result.success.data) {
                  if (client.orderSync == 1) {
                    let inputs = [fby_user_id, client.id, client.channel_code, client.channelName]
                    await common.getCanceledOrderDetails(inputs, fby_user_id, cron_name, cron_id, async function (resultOrders) {
                      //console.log('getCanceledOrderDetails result: ', result);
                      if (resultOrders.error) {
                        // store get product error log
                        let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(resultOrders.error), fby_user_id];
                        //console.log('\n ERROR: ', JSON.stringify(inputs));

                        //send response
                        set_response[client.id] = (resultOrders.error);
                      } else {
                        let counterOrders = 0;
                        let totalOrders = resultOrders.success.data.length != undefined ? resultOrders.success.data.length : 0;
                        //console.log(`\n${infoMessage}, Total Orders : ${totalOrders}`);

                        await fbyController.getFBYToken(fbyUser, cron_name, cron_id, async function (tokenResult) {
                          if (tokenResult.error) {
                            //set_response[order.id] = result.error;
                            //console.log('result.error: ', tokenResult.error);
                          } else {
                            let api_token = tokenResult.success.data;
                            for await (const order of resultOrders.success.data) {
                              try {
                                counterOrders++;
                                //console.log(`\n${counterOrders} of ${totalOrders}) ${infoMessage}, Order_Number: ${order.order_no != undefined ? order.order_no : ''}, SKU:${order.sku != undefined ? order.sku : ''}`);
                                /* fby controller for sending canceled order data */
                                await fbyController.insertCanceledOrder(api_token, order, client, fby_user_id, cron_name, cron_id, function (resultInsertCanceledOrder) {
                                  set_response[order.id] = resultInsertCanceledOrder;
                                })
                              }
                              catch (err) {
                                //console.log(`\nERROR While ${infoMessage} : \n${JSON.stringify(order)}\n${JSON.stringify(err.message)})`);
                              }
                            }

                          }
                        })
                      }

                    });
                  }
                  else {
                    //  //console.log('\n shopifyController.js--> sendCanceledOrdersFby--> CC_ORDER_UPDATE_NOT_ALLOWED_MSG: ', constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG);
                    set_response[client.domain] = constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG;
                  }
                }
                /**
                 * set time out is required to await 'for of' to finish and send response in 15 seconds.
                 * otherwise 'set_response' will be blank.
                 */
                if (!res.headersSent) {
                  res.send(set_response);
                }

              }
            })
          }
        }

      });
    }
    //after finish update cron status as 0
    res.on('finish', function () {
      let dt = dateTime.create();
      let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
      common.updateCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })
    });

  }
  catch (error) {
    //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
  }
  finally {
    ccCache.del(cacheKey_Job);
  }
}

/*
* Get Tracking Numer From Fby
* this function will check fby_user_id through 'user' table.
* if all ok, then it will get user credentials and get active notifiable orders/traking orders from fby through fby controller.
*/
exports.getFbyTraknumber = async (req, res) => {
  let cron_name = "get_track_number";
  let file_and_method_name = 'shopifyController.js getFbyTraknumber';
  let cron_id = uuid();
  let fby_user_id = req.query.fby_user_id;
  let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;

  try {
    // `${cron_name}-${fby_id}`;
    let jobRunning = ccCache.get(cacheKey_Job);
    if (jobRunning == undefined || !jobRunning || jobRunning == null) {
      ccCache.set(cacheKey_Job, true);
    }
    else {
      let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
      set_response = {
        sucess: {
          message: msg
        }
      };
      //console.log(msg);
      return set_response;
    }
    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
    common.insertCron(inputs, cron_name, cron_id, function (result) {
      if (result.error) {
        let input = [cron_name, cron_id, fby_user_id, JSON.stringify(result.error)];
        //console.log('input: ', input);
      }
    })
    //process url request
    if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
      if (!res.headersSent) {
        res.send(constants.EMPTY);
      }
    } else {
      //get user
      await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
        if (result.error) {
          // store user error log
          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_user_id];
          //console.log('inputs: ', inputs);

          //send response
          if (!res.headersSent) {
            res.send(result.error);
          }
        } else {
          for (const client of result.success.data) {
            let fby_id = client.fby_user_id;
            let channelName = client.channelName;
            /* fby controller to get 'jwt token' and get fby 'track number' */
            await fbyController.getFBYToken(client, cron_name, cron_id, async function (result) {
              if (result.error) {
                if (!res.headersSent) {
                  res.send(result.error);
                }
              } else {
                let api_key = result.success.data;
                if (client.orderSync == 1) {
                  await common.getUntrackOrders(fby_id, channelName, cron_name, cron_id, async function (result) {
                    if (result.error) {
                      // store user error log
                      let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                      //console.log('inputs: ', inputs);

                      //send response
                      if (!res.headersSent) {
                        res.send(result.error);
                      }
                    } else {
                      let responce_data = {};
                      //for (const order_details of result.success.data) {
                      //console.log('order_details: ', order_details);
                      const order_details = result.success.data[0];
                      if (order_details != null && order_details.order_no != undefined && order_details.order_no != null) {
                        logger.logInfo(`getTrackList, fby_user_id:${fby_id}, params: ${order_details.order_no}`, JSON.stringify(order_details));;
                      }
                      await fbyController.getTrackList(api_key, fby_id, order_details, cron_name, cron_id, async function (result) {
                        if (result.error) {
                          if (result.error.key) {
                            // store add stock error log
                            let inputs = [cron_name, cron_id, constants.API_TYPE, JSON.stringify(result.error), fby_id];
                            //console.log('inputs: ', inputs);

                          }
                          // res.send(result.error);
                        } else {
                          if (order_details != null && order_details.order_no != undefined) {
                            responce_data[order_details.order_no] = result;
                          }
                          // res.send(result);
                        }
                      }, channelName)
                      //
                      setTimeout(() => {
                        if (!res.headersSent) {
                          res.send(responce_data);
                        }
                      }, 1000);
                      // res.send(responce_data);
                    }
                  });
                }
                else {
                  //  //console.log('\n shopifyController.js--> getFbyTraknumber--> CC_ORDER_UPDATE_NOT_ALLOWED_MSG: ', constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG);

                  if (!res.headersSent) {
                    res.send(`{"${client.domain}": "${constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG}"}`);
                  }
                }
              }
            })
          };
        }
      });
    }
    //after finish update cron status as 0
    res.on('finish', function () {
      let dt = dateTime.create();
      let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
      common.updateCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })
    });
  }
  catch (error) {
    //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
  }
  finally {
    ccCache.del(cacheKey_Job);
  }
}


/*
* Send Tracking number to Shopify
* this function will check fby_user_id through 'user' and 'shopify' table.
* if all ok, then it will get all the user credential from 'shopify table'.
* then it will get orders of same 'fby_user_id', 'account_id' and having is_trackable 1 from order_details table and add tracking information in shopify channel
*/
exports.pushTrackShopify = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.PUSH_TRAKING_TO_CHANNEL;
  let file_and_method_name = 'shopifyController.js pushTrackShopify';
  let cron_id = uuid();
  let fby_user_id = req.query.fby_user_id;
  let cacheKey_Job = `${cron_name}_fby_user_id_${fby_user_id}`;
  try {
    // `${cron_name}-${fby_id}`;
    let jobRunning = ccCache.get(cacheKey_Job);
    if (jobRunning == undefined || !jobRunning || jobRunning == null) {
      ccCache.set(cacheKey_Job, true);
    }
    else {
      let msg = `Job ${cron_name} already running ${cacheKey_Job}, fby_user_id: ${fby_user_id}.`;
      set_response = {
        sucess: {
          message: msg
        }
      };
      //console.log(msg);
      return set_response;
    }
    //when url hits, it insert the cron details and make status 1 as its running
    let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
    common.insertCron(inputs, cron_name, cron_id, async function (result) {
      if (result.error) {
        let inputs = [cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error)];
        //console.log('inputs: ', inputs);
      }
    })

    //process url request
    if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
      if (!res.headersSent) {
        res.send(constants.EMPTY);
      }
    } else {
      //get user
      await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
        if (result.error) {
          // store user error log
          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), req.query.fby_user_id];
          //console.log('inputs: ', inputs);

          //send response
          if (!res.headersSent) {
            res.send(result.error);
          }
        } else {
          for await (const client of result.success.data) {
            let fby_id = client.fby_user_id;
            //get shopify account detail
            await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
              if (result.error) {
                // store shopify account error log
                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                //console.log('inputs: ', inputs);

                //send response
                if (!res.headersSent) {
                  res.send(result.error);
                }
              } else {
                let set_response = {};
                for (const shopifyAccount of result.success.data) {
                  /**for each shopifyAccount
                   * get order details from order_masters table
                  */
                  if (shopifyAccount.orderSync == 1) {
                    await common.getOrder(shopifyAccount, "tracking", cron_name, cron_id, async function (result) {
                      if (result.error) {
                        // store get product error log
                        let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                        common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                          if (result.error) {
                            mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                          }
                        })
                        return false;
                      } else {
                        //asynchronous function for updating shopify inventory
                        await pushTrackingShopify(result.success.data, shopifyAccount, cron_name, cron_id, req, res)
                          .then((params) => {
                            //console.log('params: ', params);
                            if (params !== undefined) {
                              set_response[shopifyAccount.domain] = (params);
                            }
                          });
                      }
                    })
                  }
                  else {
                    //  //console.log('\n shopifyController.js--> pushTrackShopify--> CC_ORDER_UPDATE_NOT_ALLOWED_MSG: ', constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG);
                    set_response[shopifyAccount.domain] = constants.CC_ORDER_UPDATE_NOT_ALLOWED_MSG;
                    if (!res.headersSent) {
                      res.send(set_response);
                    }
                  }
                }
                /**
                * set time out is required to await to get all the responses from 'pushProductsShopify'
                */
                setTimeout(() => {
                  if (!res.headersSent) {
                    res.send(set_response);
                  }
                }, 15000);
              }
            })
          }
        }
      });
    }

    //after finish update cron status as 0
    res.on('finish', function () {
      let dt = dateTime.create();
      let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
      common.updateCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })
    });
  }
  catch (error) {
    //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
  }
  finally {
    ccCache.del(cacheKey_Job);
  }
}
/**--------------Orders end------------------**/


/*-----------internal functions for Orders Start---------- */
const getOrders = async (result, client, fby_id, cron_name, cron_id) => {
  let fby_user_id = fby_id;
  cron_name = constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL;
  let logMessage = `fby_user_id = ${fby_user_id}, ${cron_name}`;
  let totalOrders = 0;

  let set_response = {};
  let updated_at = moment();
  let updated_at_last10Days = moment();
  updated_at = updated_at.subtract(10, "days");
  updated_at = updated_at.format(MOMENT_DATE_FORMAT);
  updated_at_last10Days = updated_at_last10Days.subtract(10, "days").format(MOMENT_DATE_FORMAT);

  let now = moment();
  now = now.format(MOMENT_DATE_FORMAT);

  let isCanSync = false;
  let batchInfoListDB = [];
  let order_no_log = '';
  let sku_log = '';
  for await (const client of result) {
    //await helpers.sleep();
    try {

      client.token = await helpers.getDecryptedData(client.token);

      //console.log('getOrders client.api_password: ', client.api_password);

      //*
      let orderSyncStartDate = client.orderSyncStartDate;
      if (orderSyncStartDate == null || orderSyncStartDate == '') {
        isCanSync = false;
        set_response[client.domain] = { "cron": cron_name, "updated_at": updated_at, message: "Order import date is not set." };
        logger.logInfo(`getOrders orderSyncStartDate null ${fby_id}, url -->  https://${client.domain}/admin/api/2023-04/orders.json?status=${constants.PAID}&updated_at_min=${updated_at}`, set_response);
        return set_response;
      }
      else {

        if (now > orderSyncStartDate) {
          isCanSync = true;
          updated_at = moment(orderSyncStartDate);

          updated_at = updated_at.format(MOMENT_DATE_FORMAT);
        }
        else {
          isCanSync = false;
          set_response[client.domain] = { "cron": cron_name, "updated_at": updated_at, message: "Order import date is not set." };
          //console.log('`getOrders orderSyncStartDate is less ${fby_id}, url --> https://${client.domain}/admin/api/2023-04/orders.json`, set_response);
          return set_response;

        }
      }
      let inputParamJson = JSON.stringify([constants.STATUS, updated_at]);
      let apiEndpoint = `${client.domain}admin/api/2023-04/orders.json`;


      //#region #MOCK API Response
      /* USE for #MOCK API Response
      let orderJsonFilePath = `D:\\Yocabe\\shopifyOrderWithCCandCODexample.json`
      let orderJsonData = '';
      await fs.readFile(orderJsonFilePath, 'utf8', function (err, data) {
      //  //console.log('orderJsonFilePath: ', orderJsonFilePath);

        orderJsonData = JSON.parse(data);
        // //console.log(data);
      });
      */
      //#endregion

      //##todo## manual order import
      // let query_order_no = '4894995054817';
      // apiEndpoint = `${client.domain}admin/api/2023-04/orders/${query_order_no}.json`;
      // //console.log('query_order_no: ', apiEndpoint);


      let apiRequestBase = {
        url: apiEndpoint,
        method: "get",
        params: {
          "status": constants.STATUS,
          "updated_at_min": updated_at_last10Days,
          "limit": LIMIT,
        },
        headers: {
          'X-Shopify-Access-Token': `${client.token}`,
        }
      };
      var apiRequestResponse = {
        fby_user_id: fby_user_id,
        request: apiRequestBase,
        response: {
          data: null
        }
      };

      let apiRequests = [];
      apiRequests.push(apiRequestBase);



      let c = 0;
      let isNextPage = true;
      let nextPageLink = '';
      let globaleCounter = 0;

      for await (let apiRequest of apiRequests) {
        while (isNextPage) {
          //console.log(`\n${++c})\t NextPageLink:\t`, nextPageLink);
          await helpers.sleep();
          //console.log(`\n${++c})\n`, apiRequest);
          try {
            //shopify api call to get unshiped Orders

            try {
              await logger.LogForAlert(
                fby_user_id,
                '',
                '',
                `STARTED ${JSON.stringify(apiRequest)}`,
                '',
                constants.LOG_LEVEL.INFO,
                constants.FBY_ALERT_CODES.ORDER_SYNC,
                cron_name,
                cron_id
              );
            }
            catch (error) {
              //console.log();
              //console.log(error.message);

            }

            await axios(apiRequest)
              .then(async (response) => {
                try {
                  if (response.headers.link != undefined && response.headers.link != null) {
                    let split = response.headers.link.split(',');

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

                  apiRequest.url = nextPageLink;
                  apiRequest.params = null;
                }
                catch (error) {
                  nextPageLink = '';
                  isNextPage = false;
                }

                let order_data = response.data.orders || [response.data.order];
                try {
                  totalOrders += order_data != null && order_data != undefined ? order_data.length : 0;
                  apiRequestResponse.response.data = JSON.parse(JSON.stringify(response.data));
                  let logData = JSON.stringify(apiRequestResponse);
                  let infoMessage = `fby_user_id: ${fby_user_id}, ${constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL}`;
                  infoMessage = `\n${infoMessage}, Total Orders Fetched: ${totalOrders}`;

                  try {
                    await logger.LogForAlert(
                      fby_user_id,
                      '',
                      '',
                      `COMPLETED ${JSON.stringify(apiRequest)}`,
                      apiRequestResponse,
                      constants.LOG_LEVEL.INFO,
                      constants.FBY_ALERT_CODES.ORDER_SYNC,
                      cron_name,
                      cron_id
                    );
                  }
                  catch (error) {
                    //console.log();
                    //console.log(error.message);

                  }
                }
                catch (error) {
                  //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                }

                //order_data = orderJsonData.orders //#MOCK read json and udpate from file;
                //console.log(`\ngetOrders for ${fby_id}, url: ${apiEndpoint}\n`, JSON.stringify(order_data));
                //console.log(`\n`);

                try {
                  if (order_data.length > 0) {


                    /* order loop start*/

                    for await (const jsonData of order_data) {

                      try {
                        await this.getfulfillmentOrder(fby_user_id, jsonData.id, async function (fulfillmentOrder) {
                          await helpers.sleep();
                          globaleCounter++;
                          if (!jsonData.gateway && jsonData.payment_gateway_names) {
                            if (Array.isArray(jsonData.payment_gateway_names) && jsonData.payment_gateway_names.length > 0) {
                              if (jsonData.payment_gateway_names.includes("Cash on Delivery (COD)")) {
                                jsonData.gateway = "Cash on Delivery (COD)";
                              } else {
                                jsonData.gateway = jsonData.payment_gateway_names[0];
                              }
                            }
                          }
                          let isCOD = (jsonData.gateway == "Cash on Delivery (COD)");
                          let isCC = (jsonData.payment_details != undefined && jsonData.payment_details.credit_card_number != undefined && jsonData.payment_details.credit_card_number.length > 4);
                          let isAMP = jsonData.gateway != undefined && (jsonData.gateway.includes('amazon'));

                          try {
                            let set_response = {};
                            order_no_log = jsonData.id;

                            if (globaleCounter % 100 == 0 || globaleCounter == 1 || globaleCounter == totalOrders - 1) {
                              //console.log('`${moment().format(MOMENT_DATE_FORMAT)}\t${globaleCounter}/${totalOrders}) ${logMessage}, order_no = '${jsonData.id}'`)// JSON.stringify(jsonData));
                            }
                            if (jsonData.financial_status == constants.PAID
                              || (jsonData.financial_status == "refunded")
                              || (jsonData.financial_status == "partially_refunded")
                              || isCOD
                            ) {
                              //console.log(`\n${logMessage}, orderId ${jsonData.id} should be processed sucessfully`);

                            }
                            else {

                              try {

                                let logData = JSON.stringify(jsonData);
                                let infoMessage = `${logMessage}, orderId ${order_no_log} INVALID financial_status: ${jsonData.financial_status}. Only paid,refunded and partially_refunded orders can be synced`;

                                try {
                                  let infoItem = new Entities.CCLogs(
                                    fby_user_id,
                                    order_no_log,
                                    '',
                                    logMessage,
                                    jsonData,
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

                                set_response[jsonData.id] = infoMessage;
                              }
                              catch (error) {
                                //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);

                              }
                            }
                            if (jsonData.financial_status == constants.PAID
                              || (jsonData.financial_status == "refunded")
                              || (jsonData.financial_status == "partially_refunded")
                              // || (jsonData.financial_status == "pending")
                              || isCOD
                            ) {
                              //console.log(`\n getOrders Order for ${fby_id}, orderId ${jsonData.id} jsonData.financial_status: `, jsonData.financial_status);

                              if (jsonData.fulfillment_status == undefined || jsonData.fulfillment_status == null) {
                                jsonData.fulfillment_status = 'manual';
                              }
                              // let dataArray = [];
                              let date_created = await helpers.GetConvertedDate(jsonData.created_at);
                              let date_modified = await helpers.GetConvertedDate(jsonData.updated_at);

                              let channel = client.channelName;
                              let channel_code = client.channel_code;
                              let owner_code = client.owner_code;
                              let account_id = client.id;
                              let currency_code = client.currency_code;
                              fby_user_id = fby_id;
                              let order_no = JSON.parse(JSON.stringify(jsonData.id));
                              let seller_order_id = jsonData.order_number;
                              let channel_currency_code = jsonData.currency;
                              let total_order = jsonData.total_price;
                              let total_items = (jsonData.line_items).length;
                              let total_tax = parseFloat(jsonData.total_tax);
                              let total_discount = jsonData.total_discounts;
                              let total_items_price = jsonData.total_line_items_price - total_discount;
                              let payment_method = isCC ? constants.PAYMENT_METHOD_CREDIT_CARD : isAMP ? 'AmazonPay' : jsonData.gateway;
                              let sales_record_no = order_no;
                              let purchase_date = date_created;
                              let payment_time = isCOD ? null : date_modified;
                              let payment_status = jsonData.financial_status;
                              let order_status = constants.ORDER_STATUS;
                              let location_id = jsonData.location_id;
                              let payment_id = "";
                              let item_total_ship_price = 0.00;
                              let managedByChannel = false;

                              if (jsonData.payment_terms) {
                                payment_id = jsonData.payment_terms.id;

                                if (jsonData.payment_terms.payment_schedules != undefined
                                  && Array.isArray(jsonData.payment_terms.payment_schedules)
                                  && jsonData.payment_terms.payment_schedules.length > 0) {
                                  payment_time = jsonData.payment_terms.payment_schedules[0].completed_at;

                                }

                              }
                              // if (jsonData.shipping_lines) {
                              //   item_total_ship_price = parseFloat(jsonData.shipping_lines[0].price);
                              // }
                              if (jsonData.total_shipping_price_set) {
                                item_total_ship_price = parseFloat(jsonData.total_shipping_price_set.shop_money.amount);
                              }

                              //buyer detail
                              let buyer_email = jsonData.contact_email || '';

                              let buyer_id = '';
                              let buyer_fname = '';
                              let buyer_lname = '';
                              let buyer_name = '';
                              if (jsonData.customer != undefined) {
                                buyer_id = jsonData.customer.id || '';;
                                buyer_fname = jsonData.customer.first_name || '';
                                buyer_lname = jsonData.customer.last_name || '';
                                buyer_name = buyer_fname + ' ' + buyer_lname;

                              }


                              //shiping address
                              let shiper_fname = '';
                              let shiper_lname = '';
                              let recipient_name = null;
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
                              let shiper_email = '';

                              if (jsonData.shipping_address != undefined && jsonData.shipping_address != null) {
                                shiper_fname = jsonData.shipping_address.first_name || '';
                                shiper_lname = jsonData.shipping_address.last_name || '';
                                recipient_name = shiper_fname + ' ' + shiper_lname;
                                shiper_company = jsonData.shipping_address.company || '';
                                shiper_strt1 = jsonData.shipping_address.address1 || '';
                                shiper_strt2 = jsonData.shipping_address.address2 || '';
                                shiper_city = jsonData.shipping_address.city;
                                shiper_state = jsonData.shipping_address.province || '';
                                shiper_state_code = jsonData.shipping_address.province_code || '';
                                shiper_zip = jsonData.shipping_address.zip;
                                shiper_country = jsonData.shipping_address.country || '';
                                shiper_country_iso2 = jsonData.shipping_address.country_code || '';
                                shiper_phone = jsonData.shipping_address.phone || '';
                                shiper_email = jsonData.shipping_address.contact_email || '';

                              }

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
                              if (jsonData.billing_address != undefined && jsonData.billing_address != null) {
                                bill_generator_name = jsonData.billing_address.name;
                                bill_company = jsonData.billing_address.company || '';
                                bill_address_1 = jsonData.billing_address.address1 || '';
                                bill_address_2 = jsonData.billing_address.address2 || '';
                                bill_city = jsonData.billing_address.city;
                                bill_state = jsonData.billing_address.province || '';
                                bill_state_code = jsonData.billing_address.province_code || '';
                                bill_zip = jsonData.billing_address.zip;
                                bill_country = jsonData.billing_address.country || '';
                                bill_country_iso2 = jsonData.billing_address.country_code || '';
                                bill_phone = jsonData.billing_address.phone || '';

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

                              // line items loop start
                              let counter = 0;

                              for await (const jsonItemData of order_product_data) {
                                if (jsonItemData.sku != null && jsonItemData.product_id != null) {


                                  await helpers.sleep();
                                  order_no_log = order_no = jsonData.id;

                                  try {
                                    if (globaleCounter % 100 == 0 || globaleCounter == 1 || globaleCounter == totalOrders - 1) {
                                      //console.log(`${moment().format(MOMENT_DATE_FORMAT)}\t${globaleCounter}/${totalOrders}) fby_user_id = ${fby_id}, ${constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL}, order_no = '${order_no}', sku = '${jsonItemData.sku || ''}', line_Item_order_id = '${jsonItemData.id}'`);
                                    }
                                    let item_tax = 0;
                                    let exchange_rate = 0;
                                    let order_line_item_id = jsonItemData.id;
                                    let sku = jsonItemData.sku != null && jsonItemData.sku !== undefined && jsonItemData.sku != "" ? jsonItemData.sku : '';
                                    sku_log = sku;
                                    let order_item_id = jsonItemData.variant_id;
                                    let transaction_id = jsonItemData.id;
                                    let product_name = jsonItemData.title;
                                    let quantity_purchased = jsonItemData.quantity;
                                    let fulfillment_orderLineItem = null;
                                    let fulfillment_orderId = fulfillmentOrder?.id || '';
                                    let fulfillment_orderLineItemId = null;
                                    if (location_id == 0 || location_id == null || location_id == '') {
                                      location_id = fulfillmentOrder?.assigned_location_id || '';
                                    }
                                    try {
                                      var fulfillment_orderLineItems = fulfillmentOrder?.line_items.filter((fli) => { return fli.line_item_id == order_line_item_id }) || [];
                                      if (fulfillment_orderLineItems.length > 0) {
                                        fulfillment_orderLineItem = fulfillment_orderLineItems[0];
                                        fulfillment_orderLineItemId = fulfillment_orderLineItem.id

                                      }
                                      if ((jsonData.tax_lines).length > 0) {
                                        exchange_rate = jsonData.tax_lines[0].rate;
                                        if (Array.isArray(jsonItemData.tax_lines) && jsonItemData.tax_lines.length > 0) {
                                          item_tax = parseFloat(jsonItemData.tax_lines[0].price);
                                        } else {
                                          item_tax = 0;
                                        }
                                      }
                                    }
                                    catch (error) {

                                    }
                                    let line_item_price = parseFloat(jsonItemData.price);
                                    let item_ship_price = 0;
                                    let line_item_total_tax = 0;
                                    try {
                                      item_ship_price = jsonData.shipping_lines && jsonData.shipping_lines[counter].price ? parseFloat(jsonData.shipping_lines[counter].price) : 0;
                                      line_item_total_tax = parseFloat(parseFloat(item_tax + parseFloat(jsonData.shipping_lines[counter].tax_lines[0].price)).toFixed(2));           //line item tax + line item shipping tax // no qty mul
                                    }
                                    catch (error) {

                                    }

                                    item_tax = line_item_total_tax ?? 0;
                                    let item_total_price_extax = (line_item_price * quantity_purchased);
                                    let item_price = line_item_price * quantity_purchased;

                                    let promotion_discount = "";
                                    if ((jsonItemData.discount_allocations).length > 0) {
                                      promotion_discount = jsonItemData.discount_allocations[0].amount;
                                    } else {
                                      promotion_discount = 0;
                                    }
                                    let item_total_price_intax = 0;
                                    if (jsonData.taxes_included != undefined && jsonData.taxes_included == true) {
                                      item_total_price_intax = item_total_price_extax - promotion_discount;
                                    }
                                    else {
                                      item_total_price_intax = (item_total_price_extax + line_item_total_tax) - promotion_discount;

                                    }

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

                                    await common.getLocationId(fby_id, sku, cron_name, cron_id, async function (result) {
                                      // set_response[client.domain] = result;
                                      if (result.error) {
                                        //console.log('result: ', result.error);

                                        let baseUrl = process.env.BASE_URL;
                                        let query_product_id = jsonItemData.product_id;
                                        let productGetUrl = `${baseUrl}shopify/api/get_shopify_products/?fby_user_id: ${fby_id}&product_id=${query_product_id}`;

                                        await axios({

                                          url: productGetUrl,
                                          method: "get",
                                          headers: headers
                                        })
                                          .then(response => {
                                            // //console.log('getOrders response: ', response.length);

                                          })
                                          .catch(err => {
                                            //console.log();
                                            //console.log(`getOrders --> getproduct ${fby_id}, orderId ${jsonData.id}, product_id=${query_product_id}`, err.message);
                                            //console.log(err);

                                            try {
                                              let infoItem = new Entities.CCLogs(
                                                fby_user_id,
                                                order_no_log,
                                                sku_log,
                                                `fby_user_id ${fby_user_id}, order_no ${order_no_log}, sku ${sku}, ${cron_name}, ErrorMessage ${err.message}`,
                                                { jsonItemData, err },
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

                                          });

                                      }

                                      //if (result.success) {
                                      let barcode = '';
                                      if (result.success != undefined && result.success.data != undefined) {
                                        if (location_id == 0 || location_id == null || location_id == '') {
                                          location_id = result.success.data.length > 0 ? result.success.data[0].location_id : 0;
                                        }
                                        barcode = result.success.data.length > 0 ? result.success.data[0].barcode : '';
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
                                        item_price,
                                        line_item_price,
                                        item_tax,
                                        line_item_total_tax,
                                        promotion_discount,
                                        item_total_price_intax,
                                        item_ship_price,
                                        cron_name,
                                        cron_id,
                                        payment_status,
                                        order_status,
                                        managedByChannel,
                                        fulfillment_orderId,
                                        fulfillment_orderLineItemId,
                                      ];

                                      await common.addOrderDetailsV1(dataArray, cron_name, cron_id, async function (result) {

                                        set_response[client.domain] = result;
                                        if (result != null && result.error != undefined) {

                                          // store log
                                          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.error), fby_id];
                                          //console.log('\n ERROR: ', JSON.stringify(inputs));

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

                                          //console.log('addOrderDetails result.success: ', result.success);
                                          orderdetail_id = result.success.data;

                                        }
                                      });
                                      //}

                                    }, order_item_id)


                                  }
                                  catch (error) {
                                    //console.log('\n ERROR: ', error.message);
                                  }
                                }
                                counter++;
                              }
                              // line items loop end
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
                                shiper_company || '',
                                shiper_strt1 || '',
                                shiper_strt2 || '',
                                shiper_city,
                                shiper_state || '',
                                shiper_state_code || '',
                                shiper_zip,
                                shiper_country || '',
                                shiper_country_iso2 || '',
                                shiper_phone || '',
                                total_order,
                                total_items,
                                total_items_price,
                                item_total_ship_price,
                                total_tax,
                                total_discount,
                                payment_id,
                                payment_method || '',
                                currency_code || '',
                                buyer_id,
                                buyer_email || '',
                                buyer_name || '',
                                sales_record_no || '',
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

                              await common.addOrderMaster(order_masters, cron_name, cron_id, async function (result) {
                                // set_response[client.domain] = result;
                                if (result.error) {
                                  // store log
                                  let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.error), fby_id];

                                  //console.log('\n ERROR: ', JSON.stringify(inputs));

                                }
                                if (result.success) {
                                  //console.log('addOrderMaster result.success: ', result.success);
                                  orderdetail_id = result.success.data;
                                }
                              }, true, jsonData)
                            } else if ((jsonData.financial_status == "refunded") || (jsonData.financial_status == "partially_refunded")) {
                              /* calling fby controller to get 'jwt token' and 'insert canceled Orders' */
                              let updt_time = dateTime.create();
                              let inputs = [fby_id, jsonData.id, jsonData.financial_status, jsonData.cancel_reason, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];
                              await common.updateOrderCancelStatus(inputs, fby_id, cron_name, cron_id, function (result) {
                                if (result.error) {
                                  set_response[jsonData.id] = result.error;
                                }
                              })
                            }
                          }
                          catch (error) {
                            //console.log('\n ERROR: ', error.message);
                          }
                        }, true);
                      }
                      catch (error) {
                        //console.log();
                        //console.log(error.message);

                      }

                    }

                    /* orders for loop end*/
                  } else {
                    set_response[client.domain] = { "cron": cron_name, "updated_at": updated_at, message: constants.NODATA }
                  }
                }
                catch (err) {

                  try {

                    apiRequestResponse.response.data['errors'] = JSON.stringify(err);
                    let logData = JSON.stringify(apiRequestResponse);
                    let errorMessage = error.message;
                    //console.log(`\n ERROR: ${errorMessage}`);
                    //console.log(err);

                    let infoItem = new Entities.CCLogs(
                      fby_user_id,
                      order_no_log,
                      sku_log,
                      `fby_user_id ${fby_user_id}, sku ${sku_log}, ${cron_name}, ErrorMessage ${err.message}`,
                      jsonItemData,
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
                  set_response[client.domain] = err.message;
                }
              })
              .catch(async function (error) {

                nextPageLink = '';
                isNextPage = false;

                let errorJson = JSON.stringify(error);
                //console.log(`\nERROR fby_user_id: ${fby_user_id}: ${constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL}\n`, JSON.stringify(error));

                set_response[client.domain] = (error.message);

                try {

                  apiRequestResponse.response.data = error;
                  let logData = JSON.stringify(apiRequestResponse);
                  let errorMessage = error.message;

                  await logger.LogForAlert(
                    fby_user_id,
                    '',
                    '',
                    errorMessage,
                    logData,
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
          }
          catch (error) {
            //console.log(`\nERROR ${logMessage}: \n`, error.message);

          }

        }
      }
    }
    catch (error) {
      //console.log(`\nERROR While ${constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL} \n`, error.message);

    }
  }

  try {
    await dbCCLogs.bulkInsert(batchInfoListDB);
  }
  catch (error) {
    //console.log('\nERROR While bulkInsert: \n', error.message);
    bulkInsert

  }

  return set_response;
}

async function pushTrackingShopify(order, client, cron_name, cron_id, req, res) {
  let operationId = helpers.getUUID();
  cron_name = constants.CC_OPERATIONS.PUSH_TRAKING_TO_CHANNEL;
  let exist_cron = false;
  let logMsg = '';
  let set_response = {
    details: []
  };
  let error = false;
  let fby_user_id = client.fby_user_id;
  var counter = 0;
  let infoMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;

  var apiRequestResponse = {
    fby_user_id: fby_user_id,
    request: null,
    response: {
      data: null
    }
  };

  for await (const itemlist of order) {
    try {
      counter++;
      await helpers.sleep();
      let order_number = itemlist.order_no;
      logMsg = `fby_user_id ${fby_user_id}, order_number ${order_number}, ${cron_name} :`;
      let sku = itemlist.sku || '';
      if (counter == 1 || counter == order.length - 1) {
        //console.log(`\n${counter}/${order.length}) ${logMsg}`);
      }
      let details = {
        order_number: order_number,
        status: (constants.PUSH_TRACKNO_CHANNEL_ERROR),
        error: ""
      };
      // set_response.order_numbers.push(order_number);

      let line_items = [];
      await common.getOrderDetailsTracking(fby_user_id, order_number, cron_name, cron_id, async function (result) {
        if (result.error) {

          let detailsJson = JSON.stringify(details);
          set_response.details.push(detailsJson);
          //console.log(`\nERROR in order tracking: fby_user_id ${fby_user_id}, order_number ${order_number}\n`, detailsJson);
          set_response.request = { operationId: operationId };

          //console.log('set_response -1: ', set_response);

          // store log
          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.error), fby_user_id];

        }
        if (result.success) {
          let order_details = result.success.data;
          let detailsJson = JSON.stringify(details);
          //console.log(`\n Success in order tracking: fby_user_id ${fby_user_id}, order_number ${order_number}\n`, detailsJson);

          let tracking_response = {
            order_status: "", order_details: {

            }
          };
          client.token = await helpers.getDecryptedData(client.token);
          tracking_response.order_details = order_details;//.map(async (item) => {
          for (let item of order_details) {
            try {
              sku = item.sku;
              //console.log('getOrderDetailsTracking client.api_password: ', client.api_password);
              let line_items_ids = item.sku.includes(',') ?
                item.order_line_item_id.toString().split(',') :
                [item.order_line_item_id];

              // let line_items_ids_object = [];
              // for (let line_item_id of line_items_ids) {
              //   let line_item = {
              //     "id": line_item_id,
              //     "line_item_id": line_item_id

              //   };
              //   line_items_ids_object.push(line_item);
              // }

              let line_items_ids_objects = [];
              let line_items_ids_object = {
                fulfillment_order_id: item.fulfillment_order_id,
                fulfillment_order_line_items: []
              };

              let index = 0;
              for (let line_item_db of line_items_ids) {

                let fullfilmentline_item = {
                  "id": item.fulfillment_order_line_item_Ids != null && item.fulfillment_order_line_item_Ids != undefined ? item.fulfillment_order_line_item_Ids.split(',')[index] : 0,
                  "quantity": parseInt(item.quantities != null && item.quantities != undefined ? item.quantities.split(',')[index] : 0),

                };
                index++;
                if (fullfilmentline_item.id && fullfilmentline_item != 0 && fullfilmentline_item != '') {
                  line_items_ids_object.fulfillment_order_line_items.push(fullfilmentline_item);
                }
              }
              if (line_items_ids_object.fulfillment_order_line_items && line_items_ids_object.fulfillment_order_line_items.length > 0) {
                line_items_ids_objects.push(line_items_ids_object);


                //let url = `${client.domain}admin/api/2023-04/orders/${order_number}/fulfillments.json`;
                let url = `${client.domain}admin/api/2023-04/fulfillments.json`;
                let options = {
                  method: "post",
                  uri: url,
                  headers: {
                    "Content-Type": "application/json",
                    'X-Shopify-Access-Token': `${client.token}`
                  },
                  // body: {
                  //   "fulfillment": {
                  //     "location_id": item.location_id,
                  //     "tracking_number": item.tracking_id,
                  //     "tracking_company": item.tracking_courier,
                  //     "tracking_url": item.tracking_url,
                  //     "notify_customer": true,
                  //     "line_items": line_items_ids_object
                  //   }
                  // },
                  body: {
                    "fulfillment": {
                      "line_items_by_fulfillment_order": line_items_ids_objects,
                      "tracking_info": {
                        "number": item.tracking_id,
                        "url": item.tracking_url,
                        "company": item.tracking_courier
                      },
                      "notify_customer": true,
                      "origin_address": null,
                      "message": null
                    }
                  }
                  ,
                  json: true,
                };
                apiRequestResponse.request = options;
                await request(options)
                  .then(async (parsedBody) => {
                    apiRequestResponse.response.data = parsedBody;
                    let responseBodyjson = JSON.stringify(apiRequestResponse);
                    console.log(`\npushTrackingShopify order_number ${order_number}, url ${url}\n`, responseBodyjson);
                    //update order status in FBY

                    //update status 1 after send
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
                        })
                      }
                    })

                    try {
                      let fby_api_key = "";
                      await common.userDetail(fby_user_id, cron_name, cron_id, async function (result) {
                        let fbyuser = result.success.data[0];
                        await fbyController.getFBYToken(fbyuser, cron_name, cron_id, async function (result) {
                          if (result.error) {
                            //do nothing
                          } else {
                            fby_api_key = result.success.data;
                            //await fbyService.changeOrderStatus(fby_api_key, item, exist_cron, cron_name, cron_id);
                          }
                        })

                      });
                    }
                    catch (error) {
                      //console.log('\n ERROR: ', error.message);
                    }
                    try {
                      infoMessage = `fby_user_id: ${fby_user_id}, sku: ${sku}, ${cron_name}`;
                      await logger.LogForAlert(
                        fby_user_id,
                        order_number,
                        sku != undefined ? sku : '',
                        `${infoMessage}, line_items ${line_items_ids_object}`,
                        responseBodyjson,
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
                    return set_response[order_number] = (constants.PUSH_TRACKNO_CHANNEL_SUCCESS);
                  })
                  .catch(async function (err) {

                    try {
                      let errorMessage = `${infoMessage}, ErrorMessage: ${err.message}`;
                      apiRequestResponse.error = { errorMessage: err.message, errorData: err.response.data }
                      await logger.LogForAlert(
                        fby_user_id,
                        order_number,
                        sku,
                        errorMessage,
                        apiRequestResponse,
                        constants.LOG_LEVEL.INFO,
                        constants.FBY_ALERT_CODES.TRACK_SYNC,
                        cron_name,
                        cron_id
                      );

                    } catch (error) {
                      //console.log('\n ERROR: pushTrackingShopify', error.message);
                    }

                    try {

                      console.log(`\n ERROR: ${logMsg}\n`, JSON.stringify(err.message));

                      //  //console.log(`Error pushTrackingShopify url ${url}`,  JSON.stringify(err.message));
                      Promise.resolve(err);
                      error = true;

                      if (set_response == undefined) {
                        set_response = {
                          details: []
                        };
                      }
                      if (set_response.details == undefined) {
                        set_response.details = [];
                      }

                      let details = {

                        order_status: {
                          order_number: order_number,
                          status: (constants.PUSH_TRACKNO_CHANNEL_ERROR),
                          error: err.message
                        }
                      };


                      let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err.message), fby_user_id];
                      //console.log('\n ERROR: ', JSON.stringify(inputs));



                      await Promise.resolve(details.order_status).then(async function (value) {
                        // set_response = value;
                        set_response.request = { operationId: operationId };
                        let json = JSON.stringify(value);
                        await shopifyController.getfulfillmentOrder(fby_user_id, order_number, async function (fulfillmentOrder) {
                          if (fulfillmentOrder && fulfillmentOrder.status == "closed") {

                            inputs = [fby_user_id, order_number, cron_name, cron_id, null];

                            await common.updateOrderDetailStatus(
                              inputs,
                              fby_user_id,
                              cron_name,
                              cron_id,
                              async function (result) {
                                //console.log('\n is already fulfilled updateOrderDetailStatus result: ', result);
                                if (result.error) {

                                  //store update product status error log
                                  let inputs = [
                                    cron_name,
                                    cron_id,
                                    constants.CATCH_TYPE,
                                    CircularJSON.stringify(result.data),
                                    fby_user_id,
                                  ];
                                  //console.log('\n ERROR: ', JSON.stringify(inputs));

                                }
                              }
                            );

                            return set_response[order_number] = (constants.PUSH_TRACKNO_CHANNEL_SUCCESS);

                          }
                          else {

                            try {
                              let errorMessage = `${infoMessage}, ErrorMessage: ${err.message}`;
                              apiRequestResponse.error = { errorMessage: err.message, fulfillmentOrder: fulfillmentOrder }
                              await logger.LogForAlert(
                                fby_user_id,
                                order_number,
                                sku,
                                errorMessage,
                                apiRequestResponse,
                                constants.LOG_LEVEL.ERROR,
                                constants.FBY_ALERT_CODES.TRACK_SYNC,
                                cron_name,
                                cron_id
                              );



                            } catch (error) {
                              //console.log('\n ERROR: pushTrackingShopify', error.message);
                            }
                            if (details.status != undefined && !details.status.includes("Can not Sent Tracking Number to Channel"));
                            {
                              let orderJson = JSON.stringify(details);
                              logger.logError(`${logMsg}pushTrackingShopify error : ${orderJson}`, value);
                            }
                            set_response.details.push(JSON.stringify(value));
                          }
                        });
                        /*
                        if (json.includes("is already fulfilled") && json != ''
                          // || json.includes("Invalid fulfillment order line item quantityrequested")
                        ) {
                          inputs = [fby_user_id, order_number, cron_name, cron_id, null];
  
                          await common.updateOrderDetailStatus(
                            inputs,
                            fby_user_id,
                            cron_name,
                            cron_id,
                            async function (result) {
                              //console.log('\n is already fulfilled updateOrderDetailStatus result: ', result);
                              if (result.error) {
  
                                //store update product status error log
                                let inputs = [
                                  cron_name,
                                  cron_id,
                                  constants.CATCH_TYPE,
                                  CircularJSON.stringify(result.data),
                                  fby_user_id,
                                ];
                                //console.log('\n ERROR: ', JSON.stringify(inputs));
  
                              }
                            }
                          );
  
                          return set_response[order_number] = (constants.PUSH_TRACKNO_CHANNEL_SUCCESS);
  
                        }
                        else {
  
                          if (details.status != undefined && !details.status.includes("Can not Sent Tracking Number to Channel"));
                          {
                            let orderJson = JSON.stringify(details);
                            logger.logError(`${logMsg}pushTrackingShopify error : ${orderJson}`, value);
                          }
                          set_response.details.push(JSON.stringify(value));
                        }
                        */
                        //console.log('set_response 0: ', set_response);
                        //console.log('pushTrackingShopify error',  JSON.stringify(err));

                        // helpers.sendError(res, 400, pushTrackingShopify, err.message, value);
                      });
                    }
                    catch (error) {
                      //console.log('\n ERROR: pushTrackingShopify', error.message);
                    }

                  });
              }
              else {
                tracking_response = {
                  order_status: "Error fulfillment_order_line_item_Id not found.", order_details: order_details
                };

              }
            } //individual items catch error of loop and process next item
            catch (error) {
              //console.log();
              //console.log(logMsg);
              //console.log(error);
              //console.log();
            }
          } //For loop

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

        }
      })
    }
    catch (error) {
      //console.log('\n ERROR: ', error.message);
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
}

async function deleteShopifyVariantsWithBlankSKU(fby_user_id, product_id) {
  let logMsg = `deleteShopifyVariantsWithBlankSKU fby_user_id: ${fby_user_id}, product_id: ${product_id}`;
  let cron_id = uuid();
  let cron_name = constants.CC_OPERATIONS.DELETE_VARIANTS_WITH_BLANK_SKU_CHANNEL;
  await common.shopifyUserDetail(fby_user_id, cron_name, cron_id, async function (result) {
    if (result.error) {
      // store user error log
      let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_user_id];
      //console.log(`\n${logMsg}\n`, JSON.stringify(inputs));
    } else {
      for await (const client of result.success.data) {
        if (fby_user_id > 0 && product_id > 0
          && client != null && client.domain != undefined && client.domain != null
          && client.productPublish == 1
        ) {
          try {
            let url = `${client.domain}admin/api/2023-04/products/${product_id}.json`;
            let options = {
              method: "get",
              uri: url,
              headers: {
                "Content-Type": "application/json",
                'X-Shopify-Access-Token': `${client.token}`
              },
              json: true,
            };
            await request(options)
              .then(async (parsedBody) => {
                if (parsedBody == undefined) {
                  parsedBody = {
                    products: []
                  }
                }
                if (parsedBody.products == undefined) {
                  parsedBody.products = [];

                }
                if (parsedBody.product != undefined) {
                  parsedBody.products = [parsedBody.product];
                }
                //console.log(`\n${logMsg}, ${url}\n${JSON.stringify(options)}\n`, JSON.stringify(parsedBody.products));
                if (parsedBody.products.length > 0) {
                  productsResponse = parsedBody.products;
                }
                else {
                  //console.log(`\ngetProducts fby_user_id: ${client.fby_user_id}, ${url}\n`, JSON.stringify(parsedBody));
                  productsResponse = [];
                }
                for await (const product of parsedBody.products) {
                  //for each product skus and barcode
                  for await (const variant of product.variants) {
                    try {
                      if (variant.sku == '') {
                        url = `${client.domain}admin/api/2023-04/products/${product_id}/variants/${variant.id}.json`;
                        options = {
                          method: "delete",
                          uri: url,
                          headers: {
                            "Content-Type": "application/json",
                            'X-Shopify-Access-Token': `${client.token}`
                          },
                          json: true,
                        };
                        await request(options)
                          .then(async (parsedBody) => {
                            //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nResult: \n${JSON.stringify(parsedBody)}`);
                          })
                          .catch((err) => {
                            //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nERROR: ${err.message}`);
                          });
                      }
                      else {
                        //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nVariant delete not needed: \n${JSON.stringify(variant)}`);
                      }
                    }
                    catch (err) {
                      //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nERROR: ${err.message}`);
                    }
                  }
                }
              })
              .catch(function (err) {
                //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nERROR: ${err.message}`);
              });

          }
          catch (err) {
            //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nERROR: ${err.message}`);
          }
        }
        else {
          //console.log(`\n${logMsg} 0 ProductId or fby_user_id`);
        }
      }
    }
  });
}

exports.GET_SHOPIFY_INVENTORY_TO_BE_UPDATED = async (fby_user_id, invetoryList, cron_name, cron_id) => {
  if (helpers.isEmpty(invetoryList)) return null;

  let isAmazonApi = false;
  let channelName = '';

  let totalProducts = total = invetoryList.length;
  let chunkedProducts, chunk = totalProducts > 50 ? 50 : totalProducts;
  let slice_i = 0;
  let slice_j = slice_i + chunk;
  let chunkCounter = 0;
  let chunktotal = totalProducts / chunk;

  let counter = 0;
  let invetoryListDB = [];
  let infoListDB = [];
  let batchInvetoryListDB = [];
  let batchInfoListDB = [];

  let fby_alert_code = constants.FBY_ALERT_CODES.STOCK_SYNC;
  let shopifyAccount = null;
  let globalCounter = 0;
  infoMessage = logMessage = '';

  try {
    await common.shopifyUserDetail(fby_user_id, cron_name, cron_id, function (result) {
      if (!helpers.isEmpty(result.success.data)) {
        shopifyAccount = result.success.data[0];
        channelName = shopifyAccount.channelName;
      }
    });
  }
  catch (error) {
    //console.log('\nERROR While common.shopifyUserDetail: \n', error.message);

  }
  if (helpers.isEmpty(shopifyAccount)) {
    //console.log('\nERROR Cound not get shopifyAccount\n', error.message);
  }
  if (shopifyAccount.channelName.toLowerCase().includes('amazon')
    //&& moment(updated_at) <= moment('2023-02-01 13:00:00')
  ) {
    isAmazonApi = true;
  }

  for (slice_i = 0; slice_i < slice_j && slice_j <= totalProducts; slice_i += chunk) {
    chunkCounter++;

    try {
      chunkedProducts = invetoryList.slice(slice_i, slice_j);
      infoMessage = logMessage = `fby_user_id: ${fby_user_id}, chunkCounter: ${chunkCounter}, slice_i: ${slice_i}, slice_j: ${slice_j}, chunkTotal:${chunktotal}, ${cron_name}`;
      if (chunkCounter == 1 || chunkCounter == chunktotal) {
        //console.log(`\n${chunkCounter}/${chunktotal}) fby_user_id: ${fby_user_id}, ${channelName},${cron_name}, totalProducts: ${totalProducts}`);
        //console.log('Batch Start: ', slice_i + 1);
        //console.log('Batch End  : ', slice_j);
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


      let productsToBeUpdatedIds = chunkedProducts.map(function (elem) {
        return elem.inventory_item_id;
      }).join(",");

      if (productsToBeUpdatedIds.length > 1) {

        let urlGet = `${shopifyAccount.domain}admin/api/2023-04/inventory_levels.json?inventory_item_ids=${productsToBeUpdatedIds}`;

        let optionsGet = {
          method: "GET",
          uri: urlGet,
          headers: {
            "Content-Type": "application/json",
            'X-Shopify-Access-Token': `${shopifyAccount.token}`
          },

          json: true,
        };


        let retryCounter = 0;
        while (retryCounter < MAX_RETRIES) {


          try {
            await helpers.sleep(1);
            await request(optionsGet)
              .then(async (parsedBody) => {
                try {

                  let isValidApiResponse = parsedBody.inventory_levels != undefined && parsedBody.inventory_levels != null && Array.isArray(parsedBody.inventory_levels) && parsedBody.inventory_levels.length > 0
                  if (globalCounter == 1 || globalCounter == total - 1 || retryCounter > 1) {
                    //console.log(`\n${moment().format(MOMENT_DATE_FORMAT)}\t${globalCounter}/${total}) ${infoMessage} retryCounter ${retryCounter}\n ShopifyResponse : ${JSON.stringify(parsedBody)}`);
                  }
                  retryCounter = MAX_RETRIES;
                  try {

                    if (isValidApiResponse
                    ) {


                      for await (let apiProductItem of parsedBody.inventory_levels) {
                        globalCounter++;
                        try {
                          let itemToUpdate = chunkedProducts.find(cp => cp.inventory_item_id == apiProductItem.inventory_item_id);
                          if (itemToUpdate != undefined && itemToUpdate != null && itemToUpdate.inventory_quantity != apiProductItem.available) {
                            batchInfoListDB.push(itemToUpdate);
                          }
                          else //no update
                          {
                            try {
                              await logger.LogForAlert(
                                fby_user_id,
                                '',
                                itemToUpdate.sku,
                                `${itemToUpdate.inventory_quantity} == ${apiProductItem.available} FBY stock qty is same as Shopify qty.`,
                                apiProductItem,
                                constants.LOG_LEVEL.INFO,
                                constants.FBY_ALERT_CODES.STOCK_SYNC,
                                constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL,
                                cron_id
                              );
                            }
                            catch (error) {
                              //console.log('error: ', error.message);

                            }
                          }
                        }
                        catch (error) {
                          //console.log();
                          //console.log(apiProductItem);
                          //console.log();
                          //console.log(error);

                        }
                      }


                    }
                  }
                  catch (error) {
                    //console.log(`${infoMessage}\nERROR\n`, error.message);
                  }



                }
                catch (error) {
                  //console.log('\nERROR While Pushing Data for AlertLogging: \n', error.message);
                  //console.log(error);

                }
              })
              .catch(async function (err) {
                try {
                  if (err.message.includes('Exceeded 2 calls per second')) {
                    interval = 3 * 1000; // 10 seconds;
                    let promose = new Promise(resolve => setTimeout(resolve, interval));
                    await promose;
                  }
                }
                catch (error) {
                  //console.log()
                  //console.log(error)
                }

                apiRequestResponse.response.data = JSON.parse(JSON.stringify(err));
                let errorMessage = `\n${moment().format(MOMENT_DATE_FORMAT)}\t${globalCounter}/${total}) ${infoMessage}\n, ErrorMessage: ${err.message}`;
                //console.log(`\n${errorMessage}\n`);

                let errorJson = JSON.stringify(apiRequestResponse);
                //console.log(`\nERROR fby_user_id ${fby_user_id}, sku ${itemlist.sku}, ${constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL}:\n`, errorJson);
                set_response[itemlist.sku] = (errorMessage);

              });
          }
          catch (error) {
          }
          retryCounter++;
        }


      }

    }
    catch (error) {
      //console.log(`\nBatch creation error ${error.message}`);
      //console.log(error);

    }

    /*
    conn.query(sql, [batchInvetoryListDB], function (err) {
        if (err) throw err;
        conn.end();
    });
    */
  }
  /* batch loop end */
  return batchInfoListDB;
}

module.exports.getShopifyLocation = getShopifyLocation;
module.exports.pushTrackingShopify = pushTrackingShopify;
module.exports.getProducts = getProducts;
module.exports.pushProductsShopify = pushProductsShopify;
module.exports.getOrders = getOrders;
module.exports.getLocationShopify = getLocationShopify;
module.exports.deleteShopifyVariantsWithBlankSKU = deleteShopifyVariantsWithBlankSKU;
/*-----------internal functions for Orders End---------- */

// async function getShopifyInstance(domain, accessToken) {
//   try {
//     domain = domain.replace("https://", "");
//     domain = domain.replace("http://", "");
//     domain = domain.replace(".myshopify.com", "");
//     domain = domain.replace("/", "");
//     let apiVersion = '2021-10';
//     let shopifyInstance = new Shopify({
//       shopName: domain,
//       accessToken: accessToken,
//       apiVersion: apiVersion,
//       maxRetries: 3,
//       // Pass the `beforeRetry` hook down to Got.
//       // hooks: {
//       //     beforeRetry: [(options, error, retryCount) => console.error(error)]
//       // }
//     });

//     return shopifyInstance;
//   }
//   catch (error) {
//     //console.log("\n Shopify Instance Error");
//     //console.log(error.message);
//     //console.log(error);
//     //console.log("\n");

//   }
// }


exports.getfulfillmentOrder = async (fby_user_id, order_no, callback, isfromDB = false) => {
  let cacheKey = `fulfillmentOrder_${fby_user_id}_${order_no}_${isfromDB}`;
  let fulfillmentOrder = ccCache.get(cacheKey);
  if (fulfillmentOrder != null && fulfillmentOrder != undefined) {
    return callback(fulfillmentOrder);
  }
  else {
    isfromDB = false;
    if (isfromDB) {
      await common.GetOrderFulfillmentDetails(fby_user_id, order_no, async function (fulfillmentOrder) {
        if (fulfillmentOrder != null && fulfillmentOrder != undefined) {
          ccCache.set(cacheKey, fulfillmentOrder, 60 * 60);
          return await callback(fulfillmentOrder);
        }
      });
    }

    await common.shopifyUserDetail(fby_user_id, null, null, async function (clientResult) {
      try {
        let domain = clientResult.success.data[0].domain;
        let token = await helpers.getDecryptedData(clientResult.success.data[0].token);
        let url = `${domain}admin/api/2023-04/orders/${order_no}/fulfillment_orders.json`;
        let apiRequest = {
          url: url,
          method: "get",
          headers: {
            'X-Shopify-Access-Token': `${token}`,
          }
        };
        await axios(apiRequest)
          .then(async (apiResponse) => {

            try {
              logger.LogForAlert(
                fby_user_id,
                order_no,
                "",
                `fby_user_id ${fby_user_id}, order_no ${order_no} GET_FULFILLMENT_ORDERS`,
                apiResponse.data,
                constants.LOG_LEVEL.INFO,
                constants.FBY_ALERT_CODES.ORDER_TRAKING,
                'GET_FULFILLMENT_ORDERS',
                order_no
              );

            }
            catch (error) {
              //console.log();
              //console.log(error);

            }
            fulfillmentOrder = apiResponse.data.fulfillment_orders[0];
            if (fulfillmentOrder != null && fulfillmentOrder != undefined) {
              ccCache.set(cacheKey, fulfillmentOrder, 60 * 60);
            }
            return await callback(fulfillmentOrder);
          })
          .catch(async (error) => {
            //console.log('\nfulfillmentOrder error: \n', error.message);
            //console.log(error);
            //console.log();

            try {
              logger.LogForAlert(
                fby_user_id,
                order_no,
                "",
                `fby_user_id ${fby_user_id}, order_no ${order_no} GET_FULFILLMENT_ORDERS, Error ${error.message}`,
                error,
                constants.LOG_LEVEL.ERROR,
                constants.FBY_ALERT_CODES.ORDER_TRAKING,
                'GET_FULFILLMENT_ORDERS',
                order_no
              );

            }
            catch (error) {
              //console.log();
              //console.log(error);

            }
          })
      }
      catch (error) {
        //console.log("\n Shopify GET_FULFILLMENT_ORDERS Error");
        //console.log(error.message);
        //console.log(error);
        //console.log("\n");
      }
    });
  }

}


exports.createShopifyOrder = async (fby_user_id, order) => {
  const { line_items, customer, billing_address, shipping_address, email, transactions, financial_status } = order;

  await common.shopifyUserDetail(fby_user_id, null, null, async function (clientResult) {
    try {
      // Prepare line items data
      const lineItems = line_items.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
      }));

      // Prepare customer data
      const customerData = {
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email
      };

      // Prepare order data
      const orderData = {
        order: {
          line_items: lineItems,
          customer: customerData,
          shipping_address: shipping_address,
          billing_address: shipping_address,
          email: email,
          transactions: transactions,
          financial_status: financial_status,
        }
      };

      let domain = clientResult.success.data[0].domain;
      let token = await helpers.getDecryptedData(clientResult.success.data[0].token);
      let url = `${domain}admin/api/2023-04/orders.json`;
      let options = {
        method: "post",
        uri: url,
        headers: {
          "Content-Type": "application/json",
          'X-Shopify-Access-Token': `${token}`
        },
        body: orderData,
        json: true
      };
      await request(options)
        .then(async (apiResponse) => {

          console.log("successfully created new order");
          return apiResponse;
        })
        .catch(async (error) => {
          console.error("Error creating new order:", error);
          throw error;
        })
    }
    catch (error) {

    }
  })
}