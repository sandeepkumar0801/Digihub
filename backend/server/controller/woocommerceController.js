const fbyController = require("../controller/fbyController.js");
const constants = require("../constants/constants.js");
const common = require("../constants/common.js");
const adapter = require("../../services/woocommerce_service");
const mail = require("../constants/email.js");
const request = require("request-promise");
const dateTime = require("node-datetime");
const NodeCache = require("node-cache");
const ccCache = new NodeCache({ stdTTL: 3000, checkperiod: 300 });
const moment = require("moment");
// import { v4 as uuid } from 'uuid';
const v4 = require('uuid').v4;
const axios = require("axios");
require("dotenv/config");
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

let uuid = v4;

exports.getWooCommerceProducts = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL;
  let file_and_method_name = 'woocommerceController.js getWooCommerceProducts';
  let cron_id = uuid();
  let fby_user_id = req.query.userid || req.query.fby_user_id || req.query.user_id;
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
        mail.cronProcessErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
      }
    });
    //process url request
    if (!Object.keys(req.query).length || fby_user_id == "") {
      res.send(constants.EMPTY);
    } else {
      //get user
      common.userDetail(fby_user_id, cron_name, cron_id, function (result) {
        if (result.error) {
          // store user error log
          let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_user_id];
          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
            }
          });
          //send response
          res.send(result.error);
        } else {
          for (const user of result.success.data) {
            let woocommerce_id = user.fby_user_id;
            //get shopify account detail
            common.shopifyUserDetail(woocommerce_id, cron_name, cron_id, function (result) {
              if (result.error) {
                // store shopify account error log
                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), woocommerce_id];
                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(cron_name, cron_id, woocommerce_id, JSON.stringify(result.error));
                  }
                });
                //send response
                res.send(result.error);
              } else {
                let shopifyAccount = result.success.data;
                if (true) {
                  let dt = dateTime.create();
                  let new_cron_id = cron_id;
                  let exist_cron = 0;
                  common.getBulkCronLog(woocommerce_id, dt.format('Y-m-d'), cron_name, new_cron_id, function (result) {
                    if (result.success) {
                      let log_data = result.success.data;
                      new_cron_id = log_data != undefined && log_data != null && log_data.cron_id != undefined && log_data.cron_id != null ? log_data.cron_id : new_cron_id;
                      exist_cron = 1;
                    }
                    //internal asynchronous function for adding products to table and getting response parameters
                    try {
                      adapter.getProducts(shopifyAccount, exist_cron, woocommerce_id, cron_name, new_cron_id)
                        .then((params) => {
                          res.send(params);
                        });
                    }
                    catch (err) {
                      //console.log('adapter.getProducts err: ', err);

                    }
                  });
                }
                else {
                  set_response = {};
                  set_response[shopifyAccount[0].domain] = constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG;
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
      let dt = dateTime.create();
      let inputs = [dt.format('Y-m-d H:M:S'), cron_id];
      common.updateCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
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


exports.sendProductsWoocommerce = async (req, res) => {
  let cron_name = "send_Products_Woocommerce";
  let cron_id = uuid();

  //when url hits, it insert the cron details and make status 1 as its running
  let inputs = [req.query.fby_user_id, cron_name, cron_id, 1]
  common.insertCron(inputs, cron_name, cron_id, function (result) {
    if (result.error) {
      mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
    }
  })
  //process url request
  if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
    res.send(constants.EMPTY);
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
        res.send(result.error);
      } else {
        for (const user of result.success.data) {
          /**
          * get product details from products table having same 'FBY_id' in 'user' table and status 0.
          * Once successfully send to fby the status will be set to 1.
          */
          common.getProduct(user, "status", cron_name, cron_id, async function (result) {
            if (result.error) {
              // store get product error log
              let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), user.fby_user_id];
              common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                if (result.error) {
                  mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                }
              })
              //send response
              res.send(result.error);
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
                //fbyController.getFBYToken(user, cron_name, new_cron_id, function (result) {
                // if (result.error) {
                //   set_response[product.id] = result.error;
                // } else {
                //console.log("user:",user);
                //  //console.log("product:", product);
                //product.owner_code = user.owner_code;
                let api_token = result.success.data;
                adapter.insertSku(product, exist_cron, cron_name, new_cron_id, function (result) {
                  set_response[product.id] = result;
                })
                //}
                //})
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

exports.getWoocommerceStock = async (req, res) => {
  let cron_name = "get_Woocommerce_Stock";
  let cron_id = uuid();

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
        res.send(result.error);
      } else {
        for (const user of result.success.data) {
          let fby_id = user.fby_user_id;
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
              res.send(result.error);
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
                  //  fbyController.getFBYToken(user, cron_name, new_cron_id, function (result) {
                  //   if (result.error) {
                  //     set_response[shopifyAccount.id] = (result.error);
                  //   } else {
                  //     let api_key = result.success.data;
                  adapter.getStockList(shopifyAccount, req, exist_cron, fby_id, cron_name, new_cron_id, function (result) {
                    if (result.error) {
                      if (result.error.key) {
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
                      set_response[shopifyAccount.id] = (result);
                    }
                  })
                  //     }
                  //   })
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

exports.pushStockWoocommerce = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL;
  let file_and_method_name = 'woocommerceController.js pushStockWoocommerce';
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
          })
          //send response
          res.send(result.error);
        } else {
          for await (const user of result.success.data) {
            let fby_id = user.fby_user_id;
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
                res.send(result.error);
              } else {
                let set_response = {};
                /* Shopify account loop start */
                for await (const shopifyAccount of result.success.data) {
                  /**for each shopifyAccount
                   * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                  */
                  if (shopifyAccount.stockUpdate == 1) {
                    await common.getProduct(shopifyAccount, "domain", cron_name, cron_id, function (result) {
                      if (result.error) {
                        // store get product error log
                        let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                        common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                          if (result.error) {
                            mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                          }
                        });
                        return false;
                      } else {
                        //asynchronous function for updating shopify inventory
                        adapter.pushProductsWoocommerce(result.success.data, shopifyAccount, cron_name, cron_id)
                          .then((params) => {
                            if (Object.keys(params).length > 0) {
                              set_response[shopifyAccount.domain] = (params);
                            }
                          });
                      }
                    });
                  }
                  else {
                    set_response = { success: constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG };
                    res.send(set_response);
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

exports.getWoocommerceOrders = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL;
  let file_and_method_name = 'woocommerceController.js getWoocommerceOrders';
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
      res.send(constants.EMPTY);
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
          res.send(result.error);
        } else {
          for (const user of result.success.data) {
            let fby_id = user.fby_user_id;
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
                res.send(result.error);
              } else {
                let shopifyAccount = result.success.data;
                if (shopifyAccount[0].orderSync == 1) {
                  let dt = dateTime.create();
                  let new_cron_id = cron_id;
                  let exist_cron = 0;
                  common.getBulkCronLog(fby_id, dt.format('Y-m-d'), cron_name, new_cron_id, function (result) {
                    if (result.success) {
                      let log_data = result.success.data;
                      new_cron_id = log_data != undefined && log_data != null && log_data.cron_id != undefined && log_data.cron_id != null ? log_data.cron_id : new_cron_id;
                      exist_cron = 1;
                    }
                    //internal asynchronous function for geting orders and insert into table
                    adapter.getOrders(shopifyAccount, exist_cron, fby_id, cron_name, new_cron_id)
                      .then((params) => {
                        res.send(params);
                      })
                  })
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


exports.getWoocommerceTrackNumber = async (req, res) => {
  let cron_name = "get_track_number_Woocommerce";
  let cron_id = uuid();

  //when url hits, it insert the cron details and make status 1 as its running
  let inputs = [req.query.fby_user_id, cron_name, cron_id, 1];
  common.insertCron(inputs, cron_name, cron_id, function (result) {
    if (result.error) {
      mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
    }
  })
  //process url request
  if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
    res.send(constants.EMPTY);
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
        res.send(result.error);
      } else {
        for (const user of result.success.data) {
          let fby_id = user.fby_user_id;
          /* fby controller to get 'jwt token' and get fby 'track number' */
          // fbyController.getFBYToken(user, cron_name, cron_id, function (result) {
          //if (result.error) {
          //  res.send(result.error);
          //} else {
          //let api_key = result.success.data;
          common.getUntrackOrders(fby_id, "Woocommerce", cron_name, cron_id, function (result) {
            if (result.error) {
              // store user error log
              let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
              common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                if (result.error) {
                  mail.cronLogErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
                }
              })
              //send response
              res.send(result.error);
            } else {
              let responce_data = {};
              //for (const order_details of result.success.data) {
              const order_details = result.success.data[0];
              fbyController.getTrackList(fby_id, order_details, cron_name, cron_id, function (result) {
                if (result.error) {
                  if (result.error.key) {
                    // store add stock error log
                    let inputs = [cron_name, cron_id, constants.API_TYPE, JSON.stringify(result.error), fby_id];
                    common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                      if (result.error) {
                        mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                      }
                    })
                  }
                  // res.send(result.error);
                } else {
                  responce_data[order_details.order_no] = result;
                  // res.send(result);
                }
              })
              //}
              setTimeout(() => {
                if (!res.headersSent) {
                  res.send(responce_data);
                }
              }, 15000);
              // res.send(responce_data);
            }
          })
          //}
          //})
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


exports.pushTrackWoocommerce = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.PUSH_TRAKING_TO_CHANNEL;
  let file_and_method_name = 'woocommerceController.js pushTrackWoocommerce';
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
      common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
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
          for await (const user of result.success.data) {
            let fby_id = user.fby_user_id;
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
                for await (const shopifyAccount of result.success.data) {
                  /**for each shopifyAccount
                   * get order details from order_masters table
                  */
                  if (shopifyAccount.orderSync == 1) {
                    try {
                      common.getOrder(shopifyAccount, "tracking", cron_name, cron_id, async function (result) {
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
                          await adapter.pushTrackingWoocommerce(result.success.data, shopifyAccount, cron_name, cron_id, req, res)
                            .then((params) => {
                              //console.log('params: ', params);
                              if (params !== undefined) {
                                set_response[shopifyAccount.domain] = (params);
                              }
                            });
                        }
                      });
                    }
                    catch (error) {
                      //console.log('\n ERROR: ', error.message);
                    }
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