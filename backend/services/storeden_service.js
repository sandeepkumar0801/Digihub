const fbyController = require("../server/controller/fbyController.js");
const constants = require("../server/constants/constants.js");
const common = require("../server/constants/common.js");
const mail = require("../server/constants/email.js");
const request = require("request-promise");
const dateTime = require("node-datetime");
const moment = require("moment");
// import { v4 as uuid } from 'uuid';
const v4 = require('uuid').v4;
const axios = require("axios");
require("dotenv/config");
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const adapter = require("../services/storeden_service.js");
const logger = require("../misc/logger");
const helpers = require("../misc/helpers");
const Entities = require("../entities/Entities");
const dbCCLogs = require('../startup/dbcclogs');


let uuid = v4;

exports.getProducts = async (result, exist_cron, fby_id, cron_name, cron_id) => {
  let set_response = {};
  let apiEndpoint = `${constants.Storeden_Get_Products}`;
  let urlLogMsg = `storeden getProducts fby_user_id: ${fby_id}, url: ${apiEndpoint}`;
  let infoMessage = `fby_user_id: ${fby_id}, ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL}`;
  try {
    /* shopify account loop start */
    for (const client of result) {
      await axios({
        url: apiEndpoint,
        method: "get",
        headers: {
          key: helpers.getDecryptedData(client.api_key),//"5dee7388e6281f7d88008ae0809162381c3cd7cd2350053061fa1ef83ae9e742031971",
          exchange: helpers.getDecryptedData(client.api_password)//"5bb85add137db786f696dffbe90629d5c63a4b6ca7e320a060d5cf31b1def918"
        }
      })
        .then(async function (parsedBody) {
          let resmsg = JSON.stringify(parsedBody.data);
          logger.logInfo(`${urlLogMsg}`, resmsg);

          try {

            infoMessage = `${infoMessage}, ${urlLogMsg}`;
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
          // //console.log('parsedBody: ', parsedBody.data);
          /* storeden product loop start */
          for (const product of parsedBody.data) {

            // //console.log('product.data: ', product.data);
            let img;
            let flag = 0;
            let barcode;
            if (product.code == "") {
              flag = 1;
              return false;
            }
            if (!product.image_id) {
              img = "";
            } else {
              img = product.image_id;
            }

            try {
              let logData = JSON.stringify(product);
              let errorMessage = `${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL} fby_user_id: ${client.fby_user_id}, product code: ${product.code}}`;
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

            if (!product.data.ean13) {
              if (!product.data.ean8) {
                barcode = "";
              }
              else {
                barcode = product.data.ean8;
                //console.log('product.data.ean8: ', product.data.ean8);
              }
            } else {
              barcode = product.data.ean13;
              //console.log('product.ean13: ', product.ean13);
            }

            let fby_user_id = client.fby_user_id;
            let domain = client.domain;
            let owner_code = client.owner_code;
            let channel = client.channelName;
            let sku = product.code;
            let item_id = product.uid;
            let title = product.title;
            let item_product_id = product.uid;
            let inventory_item_id = product.uid;
            let inventory_quantity = 0;
            let image = img;
            let price = product.final_price;
            //need to confirm
            let status = product.status;
            let previous_qty = 0; //#Todo get from db
            let location_id = process.env.DEFAULT_PRODUCT_LOCATION_ID;

            await getproductdetails(client, product.uid, exist_cron, fby_id, cron_name, cron_id, function (prodDetails) {
              if (!prodDetails.error) {
                sku = prodDetails.sku;
                inventory_quantity = prodDetails.stockCount;
              }
              else if (prodDetails.error) {
                let errJson = JSON.stringify(rodDetails.error);
                logger.logError(`${urlLogMsg}, getproductdetails Error`, errJson);
              }
            });

            if (img != "") {
              await getproductImages(client, product.uid, exist_cron, fby_id, cron_name, cron_id, function (imgdetails) {
                if (!imgdetails.error) {
                  for (const imgdetail of imgdetails.images) {
                    if (imgdetail.image_id == img) {
                      image = imgdetail.original;
                    }
                  }
                }
              });
            }

            //insert products variant got from shopify into products table
            let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, previous_qty, inventory_quantity, image, price, cron_name, cron_id, location_id];
            //console.log('inputs: ', inputs);
            common.addProduct(inputs, fby_id, cron_name, cron_id, function (result) {
              if (result.error) {
                let errmsg = JSON.stringify(result.error);
                logger.logError(`storeden getProducts`, errmsg);
                logger.logError(`${urlLogMsg}, addProduct Error`, errmsg);
                //mail
                mail.addProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                // store log
                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                  }
                });
              }
            });

            /* shopify product variants loop end */
          }
          /* shopify product loop end */
          let msg = { success: { message: constants.GET_PRODUCT_SUCCESS, data: parsedBody.products } };
          set_response[client.domain] = msg;
        })
        .catch(async function (err) {
          let errmsg = JSON.stringify(err);
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
            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_id, exist_cron];
            common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              }
            })
            let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: JSON.stringify(err) } };
            set_response[client.domain] = msg;
          } else {
            //mail
            mail.updateOrderErrMail(cron_name, cron_id, fby_id, JSON.stringify(err));
            //store update product status error log
            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_id, exist_cron];
            common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              }
            });
            let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: JSON.stringify(err) } };
            set_response[client.domain] = msg;
          }
        });
    }
  }
  catch (err) {
    logger.logError(`${urlLogMsg} controller catch error`, err);
  }
  /* shopify account loop end */
  return set_response;
};

const getproductdetails = async (storedenclient, uid, exist_cron, fby_id, cron_name, cron_id, callback) => {
  let apiEndpoint = `${constants.Storeden_Get_ProductDetails}${uid}`;
  let urlLogMsg = `storeden getproductdetails fby_user_id: ${fby_id}, url: ${apiEndpoint}`;
  let infoMessage = `fby_user_id: ${fby_id}, ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_CHANNEL}`;
  try {
    await axios({
      url: apiEndpoint,
      method: "get",
      headers: {
        key: helpers.getDecryptedData(storedenclient.api_key),//"5dee7388e6281f7d88008ae0809162381c3cd7cd2350053061fa1ef83ae9e742031971",
        exchange: helpers.getDecryptedData(storedenclient.api_password)//"5bb85add137db786f696dffbe90629d5c63a4b6ca7e320a060d5cf31b1def918"
      }
    })
      .then(async function (productdetails) {
        let resmsg = JSON.stringify(productdetails.data);
        logger.logInfo(`${urlLogMsg}`, resmsg);
        try {

          infoMessage = `${infoMessage}, ${apiEndpoint}`;
          await logger.LogForAlert(
            fby_user_id,
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
        if (productdetails.data.error) {
          if (exist_cron) {
            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(productdetails.data.error), fby_id, exist_cron];
            common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              }
            })
            let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: JSON.stringify(productdetails.data.error) } };
            return callback(msg);
          } else {
            //mail
            mail.getProdErrMail(cron_name, cron_id, fby_id, JSON.stringify(productdetails.data.error));
            //store update product status error log
            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(productdetails.data.error), fby_id, exist_cron];
            common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              }
            })
            let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: JSON.stringify(productdetails.data.error) } };
            return callback(msg);
          }
        }
        else {
          return callback(productdetails.data);
        }
      })
      .catch(async function (err) {
        logger.logError(`${urlLogMsg} api catch error`, err);
        try {

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
        if (exist_cron) {
          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_id, exist_cron];
          common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
            }
          })
          let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: JSON.stringify(err) } };
          return callback(msg);
        } else {
          //mail
          mail.getProdErrMail(cron_name, cron_id, fby_id, JSON.stringify(err));
          //store update product status error log
          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_id, exist_cron];
          common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
            }
          })
          let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: JSON.stringify(err) } };
          return callback(msg);
        }
      });
  }
  catch (err) {
    logger.logError(`${urlLogMsg} controller catch error`, err);
  }
}

const getproductImages = async (storedenclient, uid, exist_cron, fby_id, cron_name, cron_id, callback) => {
  await axios({
    url: `${constants.Storeden_Product_Images}${uid}`,
    method: "get",
    headers: {
      key: storedenclient.api_key,//"5dee7388e6281f7d88008ae0809162381c3cd7cd2350053061fa1ef83ae9e742031971",
      exchange: storedenclient.api_password//"5bb85add137db786f696dffbe90629d5c63a4b6ca7e320a060d5cf31b1def918"
    }
  })
    .then(function (images) {
      if (images.data.error) {
        var errjson = JSON.stringify(images.data.error);
        if (exist_cron) {
          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(images.data.error), fby_id, exist_cron];
          common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
            }
          })
          let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: errjson } };
          return callback(msg);
        } else {
          //mail
          mail.getProdErrMail(cron_name, cron_id, fby_id, errjson);
          //store update product status error log
          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, errjson, fby_id, exist_cron];
          common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
            }
          })
          let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: errjson } };
          return callback(msg);
        }
      }
      else {
        return callback(images.data);
      }
    })
    .catch(function (err) {
      if (exist_cron) {
        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_id, exist_cron];
        common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
          }
        })
        let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: JSON.stringify(err) } };
        return callback(msg);
      } else {
        //mail
        mail.getProdErrMail(cron_name, cron_id, fby_id, JSON.stringify(err));
        //store update product status error log
        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_id, exist_cron];
        common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
          }
        })
        let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: JSON.stringify(err) } };
        return callback(msg);
      }
    });
}


exports.insertSku = async (product, exist_cron, cron_name, cron_id, callback) => {
  //  //console.log('312 insertSku product: ', product);
  let set_response = {};
  let skus = {
    "sku": product.sku,
    //"ean": product.barcode,
    "title": product.title,
    "tax_profile": "-----",
    //"partnerItemId": `${product.item_id}`,
    //"partnerItemCode": `${product.item_product_id}`,
    //"image": product.image,
    //"inventory_item_id": `${product.inventory_item_id}`,
    "stock_count": 1,
    "price": product.price,
    "final_price": product.price,
    "status": product.status,
    "data": {
      "ean13": product.barcode
    }
  };
  let fby_id = product.fby_user_id;
  let sku = product.sku;

  //api for inserting skus
  await axios({
    url: `${constants.Storeden_Add_Product}`,
    method: "put",
    skus,
    headers: {
      key: helpers.getDecryptedData(storedenclient.api_key),//"5dee7388e6281f7d88008ae0809162381c3cd7cd2350053061fa1ef83ae9e742031971",
      exchange: helpers.getDecryptedData(storedenclient.api_password)//"5bb85add137db786f696dffbe90629d5c63a4b6ca7e320a060d5cf31b1def918"
    }
  })
    .then((result) => {
      try {
        logger.logInfo('storeden insertsku response: ', JSON.stringify(result.data));
        if (Object.values(result.data.success) == "Ok") {
          let updt_time = dateTime.create();
          let inputs = [fby_id, sku, cron_name, cron_id, updt_time.format('Y-m-d H:M:S'), "", "", "", ""];
          common.updateProductStatus(inputs, fby_id, cron_name, cron_id, function (result) {
            if (result.error) {
              //mail
              mail.updateProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              //store update product status error log
              let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
              common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                if (result.error) {
                  mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                }
              })
            }
          })
          // set response 
          let msg = { success: { message: constants.FBY_SKUINSERT_SUCCESS, data: JSON.stringify(result.data) } };
          set_response[sku] = (msg);
        } else {
          mail.skuInsertMail(cron_name, cron_id, fby_id, JSON.stringify(result.data));
          //store sku insert response catch log
          inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
            }
          })
          //set response
          let msg = { error: { message: constants.FBY_SKUINSERT_ERROR, data: JSON.stringify(result.data.errors) } };
          set_response[sku] = (msg);
        }
      } catch (error) {
        logger.logError('storeden insertsku error: ', JSON.stringify(error));

        if (result.data.errors) {
          if (exist_cron) {
            /* Update products count=count+1 and update error log */
            let updt_time = dateTime.create();
            let inputs = [fby_id, sku, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data.errors), updt_time.format('Y-m-d H:M:S')];
            common.fbyProductErrorManage(inputs, fby_id, cron_name, cron_id, function (result) {
              if (result.error) {
                //mail
                mail.updateProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                //store update product status error log
                let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                  }
                })
              }
            })
            //set response
            let msg = { error: { message: constants.FBY_SKUINSERT_ERROR, data: JSON.stringify(result.data.errors) } };
            set_response[sku] = (msg);
          } else {
            let updt_time = dateTime.create();
            let inputs = [fby_id, sku, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data.errors), updt_time.format('Y-m-d H:M:S')];
            /* Update products count=count+1 and flag 1 */
            common.fbyProductErrorManage(inputs, fby_id, cron_name, cron_id, function (result) {
              if (result.error) {
                //mail
                mail.updateProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                //store update product status error log
                let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                  }
                })
              }
            })
            //  mail
            mail.skuInsertMail(cron_name, cron_id, fby_id, JSON.stringify(result.data));
            //store sku insert response catch log
            inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              }
            })
            //set response
            let msg = { error: { message: constants.FBY_SKUINSERT_ERROR, data: JSON.stringify(result.data.errors) } };
            set_response[sku] = (msg);
          }
        }
      }
    })
    .catch(async (error) => {
      logger.logError('storeden insertsku erro : ', JSON.stringify(error));
      try {

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
      if (exist_cron) {
        /* Update products count=count+1 and update error log */
        let updt_time = dateTime.create();
        let inputs = [fby_id, sku, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), updt_time.format('Y-m-d H:M:S')];
        common.fbyProductErrorManage(inputs, fby_id, cron_name, cron_id, function (result) {
          if (result.error) {
            //mail
            mail.updateProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
            //store update product status error log
            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              }
            })
          }
        })
        //set response
        let msg = { error: { data: JSON.stringify(error) } };
        set_response[sku] = (msg);
      } else {
        let updt_time = dateTime.create();
        let inputs = [fby_id, sku, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), updt_time.format('Y-m-d H:M:S')];
        /* Update products count=count+1 and flag 1 */
        common.fbyProductErrorManage(inputs, fby_id, cron_name, cron_id, function (result) {
          if (result.error) {
            //mail
            mail.updateProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
            //store update product status error log
            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              }
            })
          }
        })
        //mail
        mail.skuInsertMail(cron_name, cron_id, fby_id, JSON.stringify(error));
        //store sku insert catch log
        inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), fby_id];
        common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
          }
        })
        //set response
        let msg = { error: { data: JSON.stringify(error) } };
        set_response[sku] = msg;
      }

    });

  return callback(set_response);
}

exports.getStockList = async (shopifyAccount, req, exist_cron, fby_id, cron_name, cron_id, callback) => {
  let set_response = {};
  let page = 1;
  var total_page = 0;
  var count = 1;

  let ownerCode = shopifyAccount.owner_code;
  let groupCode = shopifyAccount.group_code;
  let item_per_page = constants.FBY_PERPAGE;

  await axios({
    url: constants.Storeden_Inventory,
    method: "get",
    headers: {
      key: helpers.getDecryptedData(shopifyAccount.api_key),//"5dee7388e6281f7d88008ae0809162381c3cd7cd2350053061fa1ef83ae9e742031971",
      exchange: helpers.getDecryptedData(shopifyAccount.api_password)//"5bb85add137db786f696dffbe90629d5c63a4b6ca7e320a060d5cf31b1def918"
    }
  })
    .then(async function (response) {
      logger.logInfo('storeden getStockList :', JSON.stringify(response.data));
      if (response.data.error) {

        try {
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
        } catch (error) {
          //console.log('\n ERROR: ', error.message);
        }
        //mail
        let errormsg = JSON.stringify(response.data);
        logger.logError(`storeden getStockList url: ${url}`, errormsg);
        mail.stockListMail(cron_name, cron_id, fby_id, errormsg);
        set_response = { error: { "key": fby_id, data: response.data } };
      } else {
        count++;
        // add to products !
        //let items = response.data;
        response.data.forEach(async (item) => {
          let itemEan = "";

          await getproductdetails(item.uid, exist_cron, fby_id, cron_name, cron_id, function (prodDetails) {
            if (!prodDetails.error) {
              itemEan = prodDetails.data.ean13;
              //inventory_quantity = prodDetails.stockCount;
            }
          })

          let item_arr = [item.sku, item.uid, itemEan, item.quantity, 1, cron_id];
          common.addStock(item_arr, fby_id, function (result) {
            if (result.error) {
              //mail
              mail.addStockErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              // store add stock error log
              let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
              common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                if (result.error) {
                  mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                }
              })
            }
          })
        })
      }
    })
    .catch(async function (error) {
      let errormsg = JSON.stringify(error);
      logger.logError(`storeden getStockList`, errormsg);
      try {

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
      if (exist_cron) {
        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), fby_id, exist_cron];
        common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
          }
        })
        let msg = { error: { message: constants.FBY_GETSTOCK_ERROR, data: JSON.stringify(error) } };
        set_response[shopifyAccount.domain] = msg;
      } else {
        //mail
        mail.stockListMail(cron_name, cron_id, fby_id, JSON.stringify(error));
        //store update product status error log
        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), fby_id, exist_cron];
        common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
          }
        })
        let msg = { error: { message: constants.FBY_GETSTOCK_ERROR, data: JSON.stringify(error) } };
        set_response[shopifyAccount.domain] = msg;
      }
    });
  set_response = { success: { data: constants.FBY_GETSTOCK_SUCCESS } };
  // update product Quantity
  let updt_time = dateTime.create();
  let inputs = [cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];
  common.updateProduct(inputs, fby_id, cron_name, cron_id, function (result) {
    if (result.error) {
      //mail or log
      mail.updateProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
      // store update product error log
      let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
      common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
        }
      })
    }
  })

  return callback(set_response);
}

exports.pushProductsStoreden = async (product, user, cron_name, new_cron_id) => {
  let set_response = {};
  let fby_id = user.fby_user_id;
  let fby_user_id = fby_id;
  cron_name = constants.CC_OPERATIONS.PUSH_STOCK_TO_CHANNEL;

  /* products loop start */
  for (const itemlist of product) {
    let cron_id = new_cron_id;
    let exist_cron = 0;
    if (itemlist.cron_name == cron_name && itemlist.cron_id) {
      cron_id = itemlist.cron_id;
      exist_cron = 1;
    } else {
      /* Update with new cron id */
      let updt_time = dateTime.create();
      let inputs = [itemlist.sku, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];

    }

    let url = `${constants.Storeden_Push_Product}?sku=${itemlist.sku}&quantity=${itemlist.inventory_quantity}&is_child=0`;
    //console.log('pushProductsStoreden url: ', url);
    logger.logInfo('storeden stock udpate pushProductsStoreden url: ', url);
    await axios({
      url: url,
      method: "put",
      headers: {
        key: helpers.getDecryptedData(user.api_key),//"5dee7388e6281f7d88008ae0809162381c3cd7cd2350053061fa1ef83ae9e742031971",
        exchange: helpers.getDecryptedData(user.api_password)//"5bb85add137db786f696dffbe90629d5c63a4b6ca7e320a060d5cf31b1def918"
      }
    })
      .then(async (response) => {
        let resmsg = JSON.stringify(response.data);
        logger.logInfo("pushProductsStoreden : ", resmsg);
        let updt_time = dateTime.create();
        let inputs = [fby_id, itemlist.sku, cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];
        common.updateProductAftrSndChanl(inputs, fby_id, cron_name, cron_id, function (result) {
          if (result.error) {
            //mail
            mail.updateProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
            //store update product status error log
            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
            common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              }
            })
          }
        })

        //set response
        let msg = { success: { message: constants.PUSH_STOCK_CHANNEL_SUCCESS, data: JSON.stringify(response.data) } };
        set_response[itemlist.sku] = (msg);

        // await common.updateLastSyncOperationTime(fby_user_id, null, cron_name, function (result) {
        //   if (result != null && result.error) {
        //     //console.log("Failed to update sync time in the database");
        //   }
        // });

      })
      .catch((error) => {
        let resmsg = JSON.stringify(error);
        logger.logError("pushProductsStoreden : ", resmsg);
        if (exist_cron) {
          /* Update products count=count+1 and update error log */
          let updt_time = dateTime.create();
          let inputs = [fby_id, itemlist.sku, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), updt_time.format('Y-m-d H:M:S')];
          common.fbyProductErrorManage(inputs, fby_id, cron_name, cron_id, function (result) {
            if (result.error) {
              //mail
              mail.updateProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              //store update product status error log
              let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
              common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                if (result.error) {
                  mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                }
              })
            }
          })
          //set response
          let msg = { error: { message: constants.PUSH_STOCK_CHANNEL_ERROR, data: JSON.stringify(error) } };
          set_response[itemlist.sku] = (msg);
        } else {
          let updt_time = dateTime.create();
          let inputs = [fby_id, itemlist.sku, exist_cron, cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), updt_time.format('Y-m-d H:M:S')];
          /* Update products count=count+1 and flag 1 */
          common.fbyProductErrorManage(inputs, fby_id, cron_name, cron_id, function (result) {
            if (result.error) {
              //mail
              mail.updateProductErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              //store update product status error log
              let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.data), fby_id];
              common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                if (result.error) {
                  mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                }
              })
            }
          })
          // mail
          mail.shopifyPushProdMail(cron_name, cron_id, fby_id, JSON.stringify(error));
          //store log
          inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), fby_id];
          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
            }
          })
          //set response
          let msg = { error: { message: constants.PUSH_STOCK_CHANNEL_ERROR, data: JSON.stringify(error) } };
          set_response[itemlist.sku] = (msg);
        }
      })

  }
  /* products loop end */
  return set_response;
}

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



  /* Shopify account loop start */
  for (const client of result) {
    //client.token = helpers.getDecryptedData(client.token);
    //console.log('getOrders client.api_password: ', client.api_password);

    //*

    let orderSyncStartDate = client.orderSyncStartDate;
    if (orderSyncStartDate == null || orderSyncStartDate == '' || client.orderSync != 1) {
      isCanSync = false;
      set_response[client.domain] = { "cron": cron_name, "updated_at": updated_at, message: "Order import date is not set." };
      logger.logInfo(`storeden getOrders fby_user_id: ${fby_id}, since=${orderSyncStartDate}`, set_response);
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
        set_response[client.domain] = { "cron": cron_name, "since": updated_at, message: "Order import date is not set." };
        logger.logInfo(`storeden getOrders orderSyncStartDate is less, fby_id: ${fby_id}, url: ${constants.Storeden_Get_Orders}`, set_response);
        return set_response;

      }
    }

    var unixTimestamp = Math.floor(new Date(updated_at).getTime() / 1000);
    let url = `${constants.Storeden_Get_Orders}?since=${unixTimestamp}`;
    let urlLogMsg = `storeden getOrders fby_user_id: ${fby_id}, orderSyncStartDate:${updated_at}, url: ${url}`;

    let key = await helpers.getDecryptedData(client.api_key);
    let exchange = await helpers.getDecryptedData(client.api_password);
    //shopify api call to get all Orders
    await axios({
      url: url,
      method: "get",
      headers: {
        key: key,//"5dee7388e6281f7d88008ae0809162381c3cd7cd2350053061fa1ef83ae9e742031971",
        exchange: exchange//"5bb85add137db786f696dffbe90629d5c63a4b6ca7e320a060d5cf31b1def918"
      }
    })
      .then(async (response) => {
        let order_data = response.data;
        logger.logInfo(urlLogMsg, order_data);
        //logger.logInfo("getOrders response", order_data);
        try {
          let msg = { success: { message: constants.GET_ORDER_SUCCESS, data: order_data } };
          set_response[client.domain] = msg;

          if (order_data.length > 0) {
            /* order loop start*/
            for (const jsonData of order_data) {
              // check if order is paid and unfullfiled
              // if (jsonData.status == 0 || jsonData.status == 1 || jsonData.status == 2 
              // || jsonData.status == 3 || jsonData.status == 4) { 
              if (jsonData.status == 1 || jsonData.status == 7) {

                try {
                  order_no_log = jsonData.orderID;
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

                await getorderdetails(client, jsonData.orderID, exist_cron, fby_id, cron_name, cron_id, function (orderdetails) {

                  if (!(

                    orderdetails.error != undefined
                    && orderdetails.error != null
                    && Array.isArray(orderdetails.error)
                    && orderdetails.error.length > 0
                  )
                  ) {


                    // let dataArray = [];
                    let date_created = dateTime.create(orderdetails.iso.orderDate).format('Y-m-d H:M:S');
                    let date_modified = dateTime.create(orderdetails.iso.orderDate).format('Y-m-d H:M:S');

                    let channel = client.channelName; //'Storeden';
                    let channel_code = client.channel_code;
                    let owner_code = client.owner_code;
                    let account_id = client.id;
                    let currency_code = jsonData.currency;
                    fby_user_id = fby_id;
                    let order_no = jsonData.orderID;
                    let seller_order_id = orderdetails.orderID; // orderdetails.operatorUID;
                    let channel_currency_code = client.currency;
                    let total_order = orderdetails.total;
                    let total_items = (orderdetails.cart.items).length || 0;
                    let total_tax = 0;
                    let total_discount = orderdetails.cart.saleAmount;
                    let total_items_price = jsonData.total;
                    let payment_method = orderdetails.method;
                    let sales_record_no = orderdetails.cart.saleCode;
                    let purchase_date = date_created;
                    let payment_time = date_modified;
                    let payment_status = jsonData.status;
                    let order_status = orderdetails.status;
                    let location_id = orderdetails.delivery._id.$id;
                    let payment_id = orderdetails.billing._id.$id;
                    let item_total_ship_price = orderdetails.cart.shippingAmount || 0;

                    //buyer detail
                    let buyer_email = orderdetails.billing.email;
                    let buyer_id = orderdetails.customer.id;
                    let buyer_name = orderdetails.billing.fullname;
                    //shiping address
                    let recipient_name = orderdetails.delivery.fullname;
                    let shiper_company = orderdetails.delivery.email;
                    let shiper_strt1 = orderdetails.delivery.addr1 || '';
                    let shiper_strt2 = orderdetails.delivery.addr2 || '';
                    let shiper_city = orderdetails.delivery.city;
                    let shiper_state = orderdetails.delivery.stateName;
                    let shiper_state_code = orderdetails.delivery.stateISO;
                    let shiper_zip = orderdetails.delivery.zip;
                    let shiper_country = orderdetails.delivery.nationName;
                    let shiper_country_iso2 = orderdetails.delivery.nationTLD;
                    let shiper_phone = orderdetails.delivery.phone;
                    let shiper_email = orderdetails.delivery.email;

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
                    if (orderdetails.billing != undefined && orderdetails.billing != null) {
                      bill_generator_name = orderdetails.billing.fullname;
                      bill_company = orderdetails.billing.company || '';
                      bill_strt1 = orderdetails.billing.addr1 || '';
                      bill_strt2 = orderdetails.billing.addr2 || '';
                      bill_city = orderdetails.billing.city;
                      bill_state = orderdetails.billing.state || '';
                      bill_state_code = orderdetails.billing.stateISO || '';
                      bill_zip = orderdetails.billing.zip;
                      bill_country = orderdetails.billing.nationName || '';
                      bill_country_iso2 = orderdetails.billing.nationTLD || '';
                      bill_phone = orderdetails.billing.phone || '';
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
                    let order_product_data = orderdetails.cart.items;

                    let orderdetail_id = "";
                    let managedByChannel = false;
                    // //console.log(Object.values(order_product_data));
                    // //console.log('order_product_data: ', order_product_data);

                    for (const [key, value] of Object.entries(order_product_data)) {

                      /* line items loop start*/

                      let jsonItemData = value;

                      let item_tax = jsonItemData.tax_profile_value;
                      total_tax = total_tax + item_tax;
                      let exchange_rate = 0;

                      let sku = jsonItemData.sku;
                      sku_log = sku;
                      let order_line_item_id = "";
                      let order_item_id = key; //products.item_product_id in storeden case of only
                      let barcode = "";

                      let transaction_id = jsonData.orderID;
                      let product_name = jsonItemData.title;
                      let quantity_purchased = jsonItemData.count;

                      //if ((jsonData.tax_lines).length > 0) {
                      //exchange_rate = jsonData.tax_lines[0].rate;
                      //item_tax = parseFloat(jsonItemData.tax_lines[0].price);
                      //}

                      let line_item_price = parseFloat(jsonItemData.price);
                      let line_item_total_tax = 0;//item_tax * quantity_purchased;
                      let item_total_price_extax = line_item_price * quantity_purchased;
                      let item_price = line_item_price * quantity_purchased;

                      let item_ship_price = parseFloat(item_total_ship_price / total_items);

                      let promotion_discount = jsonItemData.listing_discount;

                      let item_total_price_intax = item_total_price_extax + line_item_total_tax - promotion_discount;

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
                        item_total_ship_price,
                        cron_name,
                        cron_id,
                        payment_status,
                        order_status,
                        managedByChannel
                      ];

                      common.addOrderDetails(dataArray, cron_name, cron_id, function (result) {
                        // set_response[client.domain] = result;
                        if (result.error) {
                          logger.logInfo(urlLogMsg, JSON.stringify(result.error));
                          // store log
                          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.error), fby_id];
                          common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                            if (result.error) {
                              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                            }
                          })
                        }
                        if (result.success) {
                          orderdetail_id = result.success.data;
                        }
                      })

                      /////////POSITIVELY DO NOT DELETE THE BELOW SECTION =- COMMNETED fOR FUTURE REFERENCE


                      // common.getLocationId(fby_id, sku, cron_name, cron_id, function (result) {
                      //   // set_response[client.domain] = result;
                      //   if (result.error) {
                      //     // store log
                      //     let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.error), fby_id];
                      //     common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                      //       if (result.error) {
                      //         mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                      //       }
                      //     })
                      //   }
                      //   if (result.success) {
                      //     location_id = result.success.data[0].location_id;
                      //     let barcode = result.success.data[0].barcode;
                      //     let dataArray = [
                      //       channel,
                      //       channel_code,
                      //       owner_code,
                      //       fby_user_id,
                      //       account_id,
                      //       order_no,
                      //       location_id,
                      //       seller_order_id,
                      //       purchase_date,
                      //       payment_time,
                      //       order_line_item_id,
                      //       sku,
                      //       barcode,
                      //       order_item_id,
                      //       transaction_id,
                      //       product_name,
                      //       quantity_purchased,
                      //       currency_code,
                      //       exchange_rate,
                      //       item_price,
                      //       line_item_price,
                      //       item_tax,
                      //       line_item_total_tax,
                      //       promotion_discount,
                      //       item_total_price_intax,
                      //       item_ship_price,
                      //       cron_name,
                      //       cron_id,
                      //       payment_status,
                      //       order_status
                      //     ];

                      //     common.addOrderDetails(dataArray, cron_name, cron_id, function (result) {
                      //       // set_response[client.domain] = result;
                      //       if (result.error) {
                      //         // store log
                      //         let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.error), fby_id];
                      //         common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                      //           if (result.error) {
                      //             mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                      //           }
                      //         })
                      //       }
                      //       if (result.success) {
                      //         orderdetail_id = result.success.data;
                      //       }
                      //     })
                      //   }
                      // })

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

                    common.addOrderMaster(order_masters, cron_name, cron_id, function (result) {
                      // set_response[client.domain] = result;
                      if (result.error) {
                        logger.logError(`${urlLogMsg} , addOrderMaster error:`, JSON.stringify(result.error));
                        // store log
                        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.error), fby_id];
                        common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                          if (result.error) {
                            mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                          }
                        })
                      }
                      if (result.success) {
                        orderdetail_id = result.success.data;
                      }
                    })
                  }
                })
              }
              if (jsonData.status == 7) {
                // if order is canceled,then update payment and order status
                let updt_time = dateTime.create();
                let inputs = [fby_id, jsonData.orderID, jsonData.status, "Cancelled", cron_name, cron_id, updt_time.format('Y-m-d H:M:S')];
                //console.log('7 jsonData.orderID: ', jsonData.orderID);
                common.updateOrderCancelStatus(inputs, fby_id, cron_name, cron_id, function (result) {
                  if (result.error) {
                    //mail
                    mail.updateOrderErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                    //store update order status error log
                    let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.data), fby_id];
                    common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                      if (result.error) {
                        mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                      }
                    })
                    set_response[jsonData.id] = result.error;
                  }
                })
              }

            }
            /* order loop end*/
          } else {
            set_response[client.domain] = { "cron": cron_name, "updated_at": updated_at, message: constants.NODATA }
          }
        } catch (error) {
          let resmsg = JSON.stringify(response.data);
          logger.logError(`${urlLogMsg} , catch error:`, resmsg);
          if (exist_cron) {
            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, error.stack, fby_id, exist_cron];
            common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              }
            })
            let msg = { error: { message: constants.GET_ORDER_ERROR, data: error.stack } };
            set_response[client.domain] = msg;
          } else {
            //mail
            mail.shopifyGetOrderMail(cron_name, cron_id, fby_id, error.stack);
            //store update product status error log
            let inputs = [cron_name, cron_id, constants.CATCH_TYPE, error.stack, fby_id, exist_cron];
            common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
              if (result.error) {
                mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
              }
            })
            let msg = { error: { message: constants.GET_ORDER_ERROR, data: error.stack } };
            set_response[client.domain] = msg;
          }

          try {

            let errorMessage = error.message;
            //console.log(`\n ERROR: ${errorMessage}`);
            //console.log(error);

            let infoItem = new Entities.CCLogs(
              fby_user_id,
              order_no_log,
              sku_log,
              `fby_user_id ${fby_user_id}, sku ${sku_log}, ${cron_name}, ErrorMessage ${error.message}`,
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
        }
      })
      .catch(async function (error) {
        let errorJson = JSON.stringify(error);
        logger.logError(`${urlLogMsg} , api catch error:`, errorJson);
        if (exist_cron) {
          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, errorJson, fby_id, exist_cron];
          common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
            }
          })
          let msg = { error: { message: constants.GET_ORDER_ERROR, data: (error) } };
          set_response[client.domain] = msg;
        } else {
          //mail
          mail.shopifyGetOrderMail(cron_name, cron_id, fby_id, JSON.stringify(error));
          //store update product status error log
          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), fby_id, exist_cron];
          common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
            }
          })
          let msg = { error: { message: constants.GET_ORDER_ERROR, data: (error) } };
          set_response[client.domain] = msg;
        }

        try {
          let errorMessage = error.message;

          await logger.LogForAlert(
            fby_user_id,
            '',
            '',
            errorMessage,
            logMessage,
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
  try {
    await dbCCLogs.bulkInsert(batchInfoListDB);
  } catch (error) {
    //console.log('\nERROR While bulkInsert: \n', error.message);

  }
  /* Shopify account loop end */
  return set_response;
}


exports.getTrackList = async (fby_id, order_no, cron_name, cron_id, callback) => {
  let set_response = {};
  let set_response_data = {};
  let page = 1;
  var total_page = 0;
  var count = 1;
  //do {
  await axios({
    url: `${constants.Storeden_Get_Order_Tracking}${order_no}`,
    method: "get",
    headers: {
      key: helpers.getDecryptedData(storedenclient.api_key),//"5dee7388e6281f7d88008ae0809162381c3cd7cd2350053061fa1ef83ae9e742031971",
      exchange: helpers.getDecryptedData(storedenclient.api_password)//"5bb85add137db786f696dffbe90629d5c63a4b6ca7e320a060d5cf31b1def918"
    }
  })
    .then((response) => {
      "use strict";
      if (Object.keys(response.data) == "error") {
        let errormsg = JSON.stringify(response.data);
        logger.logError("getTrackList error", errormsg);
        //mail
        mail.trakListMail(cron_name, cron_id, fby_id, errormsg);
        set_response = { error: { "key": fby_id, data: response.data } };
      } else {
        let resmsg = JSON.stringify(response.data);
        logger.logError("getTrackList : ", resmsg);
        count++;
        set_response_data = response.data;
        // add to products !
        let items = response.data
        //items.forEach((item) => {
        for (const item of response.data) {
          let tracking = "";
          let shipmentDate = "";
          let carrier = "";
          let ship_url = "";
          let isReturn = "";
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
              updt_time.format('Y-m-d H:M:S'),
              tracking,
              carrier,
              ship_url,
              order_no,
              storedenclient.channelName,
              carrier,
              item.skuCode != undefined ? item.skuCode : ""
            ];
            // update order Track Number
            common.updateOrder(item_arr, fby_id, cron_name, cron_id, function (result) {
              if (result.error) {
                //mail or log
                mail.updateOrderErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                // store update Order error log
                let inputs = [cron_name, cron_id, constants.QUERY_TYPE, JSON.stringify(result.error), fby_id];
                common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                  if (result.error) {
                    mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
                  }
                })
              }
            })
          }

          //})
          //total_page = response.data.notifiableOrders.totalPages;
        }
      }
    })
    .catch(function (error) {
      "use strict";
      //  //console.log(error);
      logger.logError("getTrackLst error : ", JSON.stringify(error));
      //mail
      mail.stockListMail(cron_name, cron_id, fby_id, JSON.stringify(error));
      //store log
      let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(error), fby_id];
      common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
        if (result.error) {
          mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
        }
      })
      //set response
      set_response = { error: { data: error } };
    });
  //} while (page <= total_page)
  //if (count > 1) {
  set_response = { success: { data: set_response_data } };
  //}

  return callback(set_response);
}


const getorderdetails = async (storedenclient, orderID, exist_cron, fby_id, cron_name, cron_id, callback) => {
  "use strict";
  storedenclient.api_password = helpers.getDecryptedData(storedenclient.api_password);
  let url = `${constants.Storeden_Get_Order_Details}${orderID}`;
  let logTrace = `Storeden_Get_Order_Details ${url}`;

  await axios({
    url: `${constants.Storeden_Get_Order_Details}${orderID}`,
    method: "get",
    headers: {
      key: helpers.getDecryptedData(storedenclient.api_key),//"5dee7388e6281f7d88008ae0809162381c3cd7cd2350053061fa1ef83ae9e742031971",
      exchange: helpers.getDecryptedData(storedenclient.api_password)//"5bb85add137db786f696dffbe90629d5c63a4b6ca7e320a060d5cf31b1def918"
    }
  })
    .then(function (orderDetails) {
      "use strict";
      logger.logInfo(logTrace, orderDetails.data);
      if (orderDetails.data.error != undefined
        &&
        (
          Array.isArray(orderDetails.data.error)
          && orderDetails.data.error.length > 0
        )

      ) {
        logger.logError(`${logTrace} error`, orderDetails.data);
        if (exist_cron) {
          var errjson = JSON.stringify(orderDetails.data.error);
          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, errjson, fby_id, exist_cron];
          common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, fby_id, errjson);
            }
          })
          let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: errjson } };
          return callback(msg);
        } else {
          //mail
          mail.getProdErrMail(cron_name, cron_id, fby_id, errjson);
          //store update product status error log
          let inputs = [cron_name, cron_id, constants.CATCH_TYPE, errjson, fby_id, exist_cron];
          common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
            if (result.error) {
              mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
            }
          })
          let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: errjson } };
          return callback(msg);
        }
      }
      else {
        return callback(orderDetails.data);
      }
    })
    .catch(async function (err) {
      "use strict";
      //console.log('err: ', err);

      try {

        let errorMessage = error.message;

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
      let errorJson = JSON.stringify(err);
      logger.logError(`${logTrace} error CATCH_TYPE: `, `${err.stack}`);
      if (exist_cron) {
        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, errorJson, fby_id, exist_cron];
        common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
          }
        })
        let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: errorJson } };
        return callback(msg);
      } else {
        //mail
        mail.getProdErrMail(cron_name, cron_id, fby_id, errorJson);
        //store update product status error log
        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_id, exist_cron];
        common.fbyCronErrorManage(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronLogErrMail(cron_name, cron_id, fby_id, JSON.stringify(result.error));
          }
        })
        let msg = { error: { message: constants.GET_PRODUCT_ERROR, data: errorJson } };
        return callback(msg);
      }
    });
}

exports.pushTrackingStoreden = async (order, user, cron_name, cron_id, req, res) => {
  "use strict";
  let operationId = helpers.getUUID();
  let set_response = {
    details: []
  };
  let infoMessage = '';
  let error = false;
  for (const itemlist of order) {
    let fby_user_id = itemlist.fby_user_id;
    let order_number = itemlist.order_no;
    let order_status = itemlist.order_status;
    let sku = itemlist.sku || '';
    // set_response.order_numbers.push(order_number);

    let line_items = [];
    await common.getOrderDetailsTracking(fby_user_id, order_number, cron_name, cron_id, function (result) {
      "use strict";
      if (result.error) {
        let details = {
          order_number: order_number,
          status: (constants.PUSH_TRACKNO_CHANNEL_ERROR),
          error: result != undefined && result.error != undefined && result && result.error ? result.error : ""


        };
        set_response.request = { operationId: operationId };
        //logger.logInfo("pushTrackingShopify-->getOrderDetailsTracking error", details);
        set_response.details.push(JSON.stringify(details));
        //console.log('set_response -1: ', set_response);

        // store log
        let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(result.error), fby_user_id];
        common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
          if (result.error) {
            mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
          }
        })
      }

      /* 
      
      {
          "opened": {
              "0": "Pending Payment",
              "1": "Order Paid"
          },
          "processing": {
              "2": "Preparation",
              "3": "Sent",
              "4": "Delivered"
          },
          "closed": {
              "5": "Closed",
              "6": "Archived\/Deleted",
              "7": "Aborted"
          },
          "aftersale": {
              "8": "AfterSale"
          }
      }
      */
      if (result.success) {
        let order_details = result.success.data;

        //console.log('order_details: ', order_details);
        let tracking_response = {
          order_status: "", order_details: {

          }
        };
        tracking_response.order_details = order_details.map(async (item) => {

          let url = `${constants.Storeden_Push_Tracking_Details}${order_number}&status=3&tracking=${item.tracking_id}&courier=${item.tracking_courier}&tracking_url=${item.tracking_url}`;
          let options = {
            method: "put",
            uri: url,
            headers: {
              "key": await helpers.getDecryptedData(user.api_key),//"5dee7388e6281f7d88008ae0809162381c3cd7cd2350053061fa1ef83ae9e742031971",
              "exchange": await helpers.getDecryptedData(user.api_password)//"5bb85add137db786f696dffbe90629d5c63a4b6ca7e320a060d5cf31b1def918"
            }
          };
          await request(options)
            .then(async (parsedBody) => {
              "use strict";
              let responseBodyjson = JSON.stringify(parsedBody);
              try {
                infoMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;
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
              logger.logInfo(`pushTrackingStoreden url ${url}`, responseBodyjson);
              //update status 1 after send
              if (responseBodyjson.error) {
                let orderJson = JSON.stringify(details);
                logger.logInfo(`pushTrackingStoreden error ${url} : `, responseBodyjson);
                set_response.details.push(responseBodyjson);
              } else {
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
                return set_response[order_number] = (constants.PUSH_TRACKNO_CHANNEL_SUCCESS);
              }

            })
            .catch(async function (err) {
              "use strict";
              let errorMessage = `${infoMessage}\n, ErrorMessage: ${err.message}`;
              Promise.resolve(err);
              let isAlready = false;
              try {
                let errorMessage = `fby_user_id: ${fby_user_id}, ${cron_name}`;
                await logger.LogForAlert(
                  fby_user_id,
                  '',
                  sku || '',
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

              let details = {

                order_status: {
                  order_number: order_number,
                  status: (err.message || constants.PUSH_TRACKNO_CHANNEL_ERROR),
                  error: isAlready == true ? "" : err.message
                }
              };

              // mail
              mail.storeDenPushTrackMail(cron_name, cron_id, fby_user_id, JSON.stringify(err));
              //store log
              let inputs = [cron_name, cron_id, constants.CATCH_TYPE, JSON.stringify(err), fby_user_id];
              common.cronErrorLog(inputs, cron_name, cron_id, function (result) {
                if (result.error) {
                  mail.cronLogErrMail(cron_name, cron_id, fby_user_id, JSON.stringify(result.error));
                }
              });

              Promise.resolve(details.order_status).then(function (value) {
                "use strict";
                // set_response = value;
                set_response.request = { operationId: operationId };
                let orderJson = JSON.stringify(details);
                if (isAlready) {
                  logger.logInfo(`pushTrackingStoreden info already sent: ${orderJson}`, err.message);

                  if (set_response.details !== undefined && set_response.details.length > 0) {
                    for (let i = 0; i < set_response.details.length; i++) {
                      if (set_response.details[i].includes(order_number)) {
                        set_response.details[i] = JSON.stringify({ order_number: order_number, status: err.message });
                      }
                      else {
                        let od = JSON.stringify({ order_number: order_number, status: err.message });
                        set_response.details.push(od);
                      }
                    }
                  }
                  //set_response.details.push({ order_number: order_number, message: err.message });
                }
                else {
                  logger.logError(`pushTrackingStoreden error : ${orderJson}`, value);
                }
                //console.log('set_response.order_details: ', set_response.details);
              });

            });

        })

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