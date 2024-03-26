const fbyController = require("../controller/fbyController.js");
const constants = require("../constants/constants.js");
const common = require("../constants/common.js");
const adapter = require("../../services/amazon_SPAPI_Service.js");
const fbyService = require("../../services/fby_service.js");
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
const SellingPartnerAPI = require('amazon-sp-api');

exports.getAmazonOrders = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.GET_ORDER_FROM_CHANNEL;
  let cron_id = uuid();
  let file_and_method_name = 'amazonSPAPIController.js getAmazonOrders';
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
    });
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
                });
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
                      // let log_data = result.success.data;
                      // new_cron_id = log_data.cron_id;
                      // exist_cron = 1;
                    }
                    //internal asynchronous function for geting orders and insert into table
                    adapter.getOrders(shopifyAccount, exist_cron, fby_id, cron_name, new_cron_id)
                      .then((params) => {
                        res.send(params);
                      });
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
            });
          }
        }
      });
    }
    //after finish update cron status as 0
    res.on('finish', function () {
      var dt = dateTime.create();
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
    res.send(error.message);
  }
  finally {
    ccCache.del(cacheKey_Job);
  }
};

exports.pushStockAmazon = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL;
  let file_and_method_name = 'amazonSPAPIController.js pushStockAmazon';
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
                for (const shopifyAccount of result.success.data) {
                  try {
                    /**for each shopifyAccount
                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                    */
                    if (shopifyAccount.stockUpdate == 1) {
                      await common.getProduct(shopifyAccount, "domain", cron_name, cron_id, async function (result) {
                        // if (result.error) {
                        //   // store get product error log
                        //   let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                        //   common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                        //     if (result.error) {
                        //       mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                        //     }
                        //   })
                        //   return false;
                        // } else {
                        //asynchronous function for updating shopify inventory
                        await adapter.pushProductsAmazon(result, shopifyAccount, cron_name, cron_id)
                          .then((params) => {
                            set_response[shopifyAccount.domain] = (params);
                            if (Object.keys(params).length > 0) {
                            }
                          });
                        //}
                      });
                    }
                    else {
                      set_response = { success: constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG };
                      res.send(set_response);
                    }
                  }
                  catch (error) {
                    //console.log(error);
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
      var dt = dateTime.create();
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

exports.pushTrackAmazon = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.PUSH_TRACKING_TO_CHANNEL;
  let cron_id = uuid();
  let file_and_method_name = 'amazonSPAPIController.js pushTrackAmazon';
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
                    common.getOrder(shopifyAccount, "tracking", cron_name, cron_id, function (result) {
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
                        adapter.pushTrackingAmazon(result.success.data, shopifyAccount, cron_name, cron_id, req, res)
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
      var dt = dateTime.create();
      let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
      common.updateCron(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
        }
      })
    });
  } catch (error) {
    //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
  } finally {
    ccCache.del(cacheKey_Job);
  }
}


exports.getAmazonProducts = async (req, res) => {
  let cron_name = constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL;
  let file_and_method_name = 'amazonSPAPIController.js getAmazonProducts';
  let cron_id = uuid();
  let fby_user_id = req.query.userid || req.query.fby_user_id;
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
            try {
              let Amazon_id = user.fby_user_id;
              //get shopify account detail
              common.shopifyUserDetail(Amazon_id, cron_name, cron_id, function (result) {
                if (result.error) {
                  // store shopify account error log
                  let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), Amazon_id];
                  common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                    if (result.error) {
                      mail.cronLogErrMail(cron_name, cron_id, Amazon_id, JSON.stringify(result.error));
                    }
                  });
                  //send response
                  res.send(result.error);
                } else {
                  let shopifyAccount = result.success.data;
                  //if (shopifyAccount[0].stockUpdate == 1)
                  if (true) {
                    let dt = dateTime.create();
                    let new_cron_id = cron_id;
                    let exist_cron = 0;
                    common.getBulkCronLog(Amazon_id, dt.format('Y-m-d'), cron_name, new_cron_id, function (result) {
                      if (result.success) {
                        // let log_data = result.success.data;
                        // new_cron_id = log_data.cron_id;
                        // exist_cron = 1;
                      }
                      //internal asynchronous function for adding products to table and getting response parameters
                      try {

                        common.getReports(user.fby_user_id, async function (reports) {

                          if (reports.success != undefined && reports.success != null && reports.success.data !== undefined && reports.success.data != null) {
                            for (const report of reports.success.data) {
                              adapter.getProducts(shopifyAccount, report.reportID, exist_cron, Amazon_id, cron_name, new_cron_id)
                                .then((params) => {
                                  res.send(params);
                                });
                            }
                          }
                          else {
                            res.send("Download report then re-try this.");

                          }

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
            catch (error) {
              set_response = {};
              set_response[shopifyAccount[0].domain] = constants.CC_STOCK_UPDATE_NOT_ALLOWED_MSG;
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
      var dt = dateTime.create();
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

exports.generateAmazonProductsReport = async (req, res) => {
  let cron_name = "generate_Amazon_Products_Report";
  let file_and_method_name = 'amazonSPAPIController.js generateAmazonProductsReport';
  let cron_id = uuid();
  let fby_user_id = req.query.userid || req.query.fby_user_id;
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
            let Amazon_id = user.fby_user_id;
            //get shopify account detail
            common.shopifyUserDetail(Amazon_id, cron_name, cron_id, function (result) {
              if (result.error) {
                // store shopify account error log
                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), Amazon_id];
                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(cron_name, cron_id, Amazon_id, JSON.stringify(result.error));
                  }
                });
                //send response
                res.send(result.error);
              } else {
                let shopifyAccount = result.success.data;
                let dt = dateTime.create();
                let new_cron_id = cron_id;
                let exist_cron = 0;
                common.getBulkCronLog(Amazon_id, dt.format('Y-m-d'), cron_name, new_cron_id, function (result) {
                  if (result.success) {
                    // let log_data = result.success.data;
                    // new_cron_id = log_data.cron_id;
                    // exist_cron = 1;
                  }
                  //internal asynchronous function for adding products to table and getting response parameters
                  try {
                    adapter.generateProductsReport(shopifyAccount, exist_cron, Amazon_id, cron_name, new_cron_id)
                      .then((params) => {
                        res.send(params);
                      });
                  }
                  catch (err) {
                    //console.log('adapter.generateProductsReport err: ', err);

                  }
                });
              }
            });
          }
        }
      });
    }
    //after finish update cron status as 0
    res.on('finish', function () {
      var dt = dateTime.create();
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

exports.getFbyProductPrices = async (req, res, callback = null) => {
  let set_response = {};
  try {

    let cron_name = constants.CC_OPERATIONS.GET_AUTH_TOKEN_FROM_FBY;
    let fby_user_id = req.query.fby_user_id;
    let cron_id = uuid();
    let file_and_method_name = 'amazonSPAPIController.js getFbyProductPrices';
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
        if (callback != null) {
          callback(set_response);
        }
        else {
          return set_response;
        }
      }
      // when url hits, it insert the cron details and make status 1 as its running
      let inputs = [fby_user_id, cron_name, cron_id, 1];
      common.insertCron(inputs, cron_name, cron_id, function (result) {

      });
      //process url request
      if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
        set_response = constants.EMPTY;
      }
      else {
        //get user
        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
          if (result.error) {

          } else {
            for (const client of result.success.data) {
              // if (client.priceUpdate == 1) {
              let fby_id = client.fby_user_id;

              //get shopify account detail
              await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {

                if (result.error) {
                  set_response = result.error;
                } else {
                  set_response = {};
                  // account loop start 
                  for await (const amazonAccount of result.success.data) {
                    try {

                      //get product details from product table having same 'FBY_id' and 'domain' which were get from amazonAccount channel table
                      await fbyController.getFBYToken(client, cron_name, cron_id, async function (result) {
                        //console.log('445 getFBYToken result: ',  JSON.stringify(result));
                        if (result.error) {

                          set_response[amazonAccount.id] = (result.error);
                        } else {
                          let api_key = result.success.data;

                          if (amazonAccount.stockUpdate == 1) {
                            await fbyService.getStockListForPushDirectly(req, fby_id, true);
                            // await fbyController.getStockList(api_key, amazonAccount, req, fby_id, cron_name, cron_id, async function (result) { });
                          }

                          if (amazonAccount.priceUpdate == 1) {
                            await fbyController.getPrices(api_key, amazonAccount, req, fby_id, cron_name, cron_id, function (result) {

                              if (result.error) {
                                //console.log('result.error: ', result.error);
                                if (result.error) {

                                }
                                // set_response[amazonAccount.id]=(result.error);
                                set_response[amazonAccount.id] = (result);
                              } else {
                                // set_response[amazonAccount.id]=(result.success.data);
                                set_response[amazonAccount.id] = (result);
                              }
                            });
                          }
                        }
                      });
                    }
                    catch (err) {
                      //console.log(`getFbyProductPrices fby_user_id: ${amazonAccount.fby_user_id}`, err.message);

                    }
                  }
                }
              });
              // }
              // else {
              //   set_response = {
              //     message: `Price update is not enabled for Channel ${fby_user_id}`
              //   };
              // }
            }
          }
        });
      }


      //after finish update cron status as 0
      res.on('finish', function () {
        let dt = dateTime.create();
        let inputs = [dt.format('Y-m-d H:M:S'), cron_id];
        common.updateCron(inputs, cron_name, cron_id, function (result) {
        });
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
  if (callback != null) {
    await callback(set_response);
  }
  else {
    return set_response;
  }
};

exports.pushPriceAmazon = async (req, res) => {
  let cron_name = "push_price_Amazon";
  let file_and_method_name = 'amazonSPAPIController.js pushPriceAmazon';
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
                for (const amazonAccount of result.success.data) {
                  try {
                    /**for each amazonAccount
                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                    */
                    await common.getProduct(amazonAccount, "domain", cron_name, cron_id, async function (result) {
                      //asynchronous function for updating amazon inventory
                      await adapter.pushPriceAmazon(result, amazonAccount, cron_name, cron_id)
                        .then((params) => {
                          if (Object.keys(params).length > 0) {
                            set_response[amazonAccount.domain] = (params);
                          }
                        })
                      //}
                    })
                  }
                  catch (error) {
                    //console.log(error);
                  }
                }
                /* Amazon account loop end */
                /**
                * set time out is required to await to get all the responses from 'pushPriceAmazon'
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
      var dt = dateTime.create();
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



