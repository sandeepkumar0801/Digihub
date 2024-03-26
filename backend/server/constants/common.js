require("dotenv/config");
const constants = require("../constants/constants.js");
const miscConstants = require("../../misc/constants");
const mail = require("../constants/email.js");
const db = require("../database/dbConnection.js");
const helpers = require("../../misc/helpers");
const logger = require("../../misc/logger");
const dbpool = require("../../startup/db");
const NodeCache = require("node-cache");
const ccCache = new NodeCache({ stdTTL: 3000, checkperiod: 300 });


//it wil get user details according to fby_user_id
exports.userDetail = async (fby_user_id, cron_name, cron_id, callback) => {
  let cacheKey_FBYUSER = `${miscConstants.CACHE_KEYS.FBYUSER}-${fby_user_id}`;
  let sql = "CALL get_user(?)";
  let inputs = [fby_user_id];
  let user = ccCache.get(cacheKey_FBYUSER);


  if (user != null) {
    let msg = {
      success: {
        data: user,
      },
    };
    //console.log(`\nCACHE CALL get_user(${fby_user_id})\n`, JSON.stringify(user));
    return callback(msg);
  }
  else {
    await dbpool.execute(sql, [fby_user_id], function (err, result, fields) {
      if (err) {

        let inputs = [fby_user_id];
        let inputJson = JSON.stringify(inputs);
        logger.logError(`${sql} ${inputJson}`, err);

        let msg = {
          error: { "fby_user_id": fby_user_id, "data": err }, success: {
            data: null,
          },
        };
        return callback(msg);
      }
      if (result) {
        if (result.length > 0) {

          var isEmpty = (helpers.isEmpty(result)
            && helpers.isEmpty(result[0])
            && helpers.isEmpty(result[0][0])
            && helpers.isEmpty(result[0][0].auth_password));

          if (!isEmpty) {
            result[0][0].auth_password = helpers.getDecryptedData(result[0][0].auth_password);
          }

          let msg = {
            success: {
              data: result[0],
            },
          };
          ccCache.set(cacheKey_FBYUSER, result[0]);
          return callback(msg);
        } else {
          let msg = {
            error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }
            , success: {
              data: null,
            },
          };
          return callback(msg);
        }
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };
        return callback(msg);
      }
    });
  }
};


exports.getAuthUserDetails = async (email, callback) => {
  let sql = "CALL getAuthUser(?)";
  let inputs = [email]
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let msg = { error: { data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getChannelDetails = async (groupCode, callback) => {
  let sql = "CALL getChannelDetails(?)";
  let inputs = [groupCode];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let msg = { error: { data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.addAuthUser = async (users, callback) => {
  try {
    //await helpers.sleep();
    let sql = "CALL addAuthUser(?,?,?,?)";
    await dbpool.execute(sql, users, function (err, result, fields) {
      if (err) {
        let inputJson = JSON.stringify(users);
        //console.log(`\nCALL addStock(${JSON.stringify(item)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);

        logger.logError(`${sql} ${inputJson}`, err);

        let msg = { error: { "data": JSON.stringify(err) }, success: { data: null } };;
        if (callback !== undefined) {
          return callback(msg);
        }
      }
    });
  }
  catch (err) {
    console.error(err);
  }
}

//it wil get shopify account details according to fby_user_id
exports.shopifyUserDetail = async (fby_user_id, cron_name, cron_id, callback) => {
  try {
    let cacheKey_FBYUSER = `${miscConstants.CACHE_KEYS.CHANNEL_USER}-${fby_user_id}`;
    let channelUser = ccCache.get(cacheKey_FBYUSER);
    let sql = "CALL getShopifyUser(?)";

    if (channelUser != null) {
      let msg = {
        success: {
          data: channelUser,
        },
      };
      //console.log(`\nCACHE CALL getShopifyUser(${fby_user_id})\n`, JSON.stringify(channelUser));
      if (callback != null) {
        return callback(msg);
      }
      else {
        return msg;
      }
    }
    else {
      await dbpool.execute(sql, [fby_user_id], async function (err, result, fields) {
        if (err) {

          let inputJson = JSON.stringify([fby_user_id]);
          logger.logError(`${sql} ${inputJson}`, err);

          let msg = { success: { data: null } };;
          if (callback != null) {
            return callback(msg);
          }
          else {
            return msg;
          }
        }
        if (result) {
          if (result.length > 0) {
            var isEmpty = (helpers.isEmpty(result)
              && helpers.isEmpty(result[0])
              && helpers.isEmpty(result[0][0])
            );

            if (!isEmpty) {
              try {
                /*
                result[0][0].api_password = await helpers.getDecryptedData(result[0][0].api_password);
                result[0][0].api_key = await helpers.getDecryptedData(result[0][0].api_key);
                result[0][0].secret = await helpers.getDecryptedData(result[0][0].secret);
                result[0][0].token = await helpers.getDecryptedData(result[0][0].token);
                result[0][0].password = await helpers.getDecryptedData(result[0][0].password);
                result[0][0].domain = await helpers.getWoocommerceDomain(result[0][0].domain);
                //*/

                if (!helpers.isEmpty(result[0][0].username)) {
                  result[0][0].username = await helpers.getDecryptedData(result[0][0].username);
                }
                if (!helpers.isEmpty(result[0][0].api_password)) {
                  result[0][0].api_password = await helpers.getDecryptedData(result[0][0].api_password);
                }
                if (!helpers.isEmpty(result[0][0].api_key)) {
                  result[0][0].api_key = await helpers.getDecryptedData(result[0][0].api_key);
                }

                if (!helpers.isEmpty(result[0][0].secret)) {
                  result[0][0].secret = await helpers.getDecryptedData(result[0][0].secret);
                }

                if (!helpers.isEmpty(result[0][0].token)) {

                  result[0][0].token = await helpers.getDecryptedData(result[0][0].token);
                }
                if (!helpers.isEmpty(result[0][0].password)) {
                  result[0][0].password = await helpers.getDecryptedData(result[0][0].password);
                }

                if (!helpers.isEmpty(result[0][0].domain)) {
                  result[0][0].domain = await helpers.getWoocommerceDomain(result[0][0].domain);
                }

                //*/
              }
              catch (err) {

              }
            }

            let msg = {
              success: {
                data: result[0],
              },
            };
            ccCache.set(cacheKey_FBYUSER, result[0]);
            if (callback != null) {
              return callback(msg);
            }
            else {
              return msg;
            }
          } else {
            let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
            if (callback != null) {
              return callback(msg);
            }
            else {
              return msg;
            }
          }
        } else {
          let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
          if (callback != null) {
            return callback(msg);
          }
          else {
            return msg;
          }
        }
      });
    }
  }
  catch (error) {
    //console.log('error: ', error);

  }
};

/*
* it wil get product details according to fby_user_id and request_type.
* according to request_type it will get details from 'products' table by 'domain' or 'status'.
*/
exports.getProduct = async (user, request_type, cron_name, cron_id, callback) => {
  let fby_user_id = user.fby_user_id;
  if (request_type == "domain") {
    let sql = "CALL getProductByDomain(?,?)";
    let inputs = [user.fby_user_id, user.domain];
    await dbpool.execute(sql, inputs, function (err, result, fields) {
      if (err) {

        let inputJson = JSON.stringify(inputs);
        logger.logError(`${sql} ${inputJson}`, err);

        let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: err } };
        return callback(msg);
      }
      if (result) {
        if (result.length > 0) {
          let msg = {
            success: {
              data: result[0],
            },
          };
          return callback(msg);
        } else {
          let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
          return callback(msg);
        }
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
        return callback(msg);
      }
    });
  } else if (request_type == "location") {
    let sql = "CALL getProductForLocation(?,?)";
    let inputs = [user.fby_user_id, user.domain];
    await dbpool.execute(sql, inputs, function (err, result, fields) {
      if (err) {

        let inputJson = JSON.stringify(inputs);
        logger.logError(`${sql} ${inputJson}`, err);

        let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: err } };
        return callback(msg);
      }
      if (result) {
        if (result.length > 0) {
          let msg = {
            success: {
              data: result[0],
            },
          };
          return callback(msg);
        } else {
          let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
          return callback(msg);
        }
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
        return callback(msg);
      }
    });
  } else if (request_type == "status") {
    let sql = "CALL getProductByStatus(?)";
    let inputs = [user.fby_user_id];
    await dbpool.execute(sql, inputs, function (err, result, fields) {

      if (err) {

        let inputJson = JSON.stringify(inputs);
        logger.logError(`${sql} ${inputJson}`, err);

        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
        return callback(msg);
      }

      if (result) {
        if (result.length > 0) {
          let msg = {
            success: {
              data: result[0],
            },
          };
          return callback(msg);
        } else {
          let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
          return callback(msg);
        }
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
        return callback(msg);
      }
    });
  }
  else if (request_type == "location") {
    //console.log('request_type: ', request_type);
    let sql = "CALL getProductByDomainForLocationSync(?,?)";
    await dbpool.execute(sql, [user.fby_user_id, user.domain], function (err, result, fields) {
      if (err) {

        let inputJson = JSON.stringify([user.fby_user_id, user.domain]);
        logger.logError(`${sql} ${inputJson}`, err);

        let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: err } };
        return callback(msg);
      }
      if (result) {
        if (result.length > 0) {
          let msg = {
            success: {
              data: result[0],
            },
          };
          return callback(msg);
        } else {
          let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
          return callback(msg);
        }
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
        return callback(msg);
      }
    });
  }
};

//get orders from order_details
exports.getProductBySku = async (fby_user_id, sku, cron_name, cron_id, callback) => {
  let sql = "CALL getProductBySku(?,?)";
  await dbpool.execute(sql, [fby_user_id, sku], function (err, result, fields) {
    if (err) {

      let inputs = [fby_user_id, sku];
      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
      return callback(msg);
    }
  });
}


exports.getProductForUpdate = async (user, request_type, cron_name, cron_id, callback) => {
  let sql = "CALL getProductForUpdate(?,?)";
  let fby_user_id = user.fby_user_id;
  let inputs = [user.fby_user_id, user.domain];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
      return callback(msg);
    }
  });
}


//get orders from order_details
exports.getCreateProductByDomain = async (user, request_type, cron_name, cron_id, callback) => {
  let sql = "CALL getCreateProductByDomain(?,?)";
  let fby_user_id = user.fby_user_id;
  let inputs = [user.fby_user_id, user.domain];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getCreatedProductIDBySku = async (sku, callback) => {
  let sql = "CALL getCreatedProductIDBySku(?)";
  let inputs = [sku];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "sku": sku, data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "sku": sku, data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "sku": sku, data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getCreateProductBySku = async (fby_user_id, sku) => {
  try {
    let sql = "CALL getCreateProductBySku(?,?)";
    let inputs = [fby_user_id, sku];
    const rows = await dbpool.execute(sql, inputs, function (err, result, fields) {
      if (err) {

      } else {
        return result;
      }
    });
    let productData = { "newProduct": {} };

    // Check if any rows are returned
    if (rows && rows.length > 0) {
      // Return the first row as the product data
      productData.newProduct.fields = rows[0][0];
    } else {
      throw new Error('Product not found');
    }

    sql = "CALL getImageBySku(?,?)";
    inputs = [fby_user_id, sku]
    const [images] = await dbpool.execute(sql, inputs, function (err, result, fields) {
      if (err) {

      } else {
        return result
      }
    });
    if (images && images.length > 0) {
      // Return the first row as the product data
      productData.newProduct.photos = images;
    } else {
      productData.newProduct.photos = [];
    }

    sql = "CALL getCreateProductVariantBySkuFamily(?)";
    inputs = [sku]
    const [variant] = await dbpool.execute(sql, inputs, function (err, result, fields) {
      if (err) {

      } else {
        return result
      }
    });
    if (variant && variant.length > 0) {
      // Return the first row as the product data
      productData.newProduct.variants = variant;

    } else {
      productData.newProduct.variants = [];
    }
    sql = "CALL getOptions(?,?)";
    inputs = [fby_user_id, sku];
    const [optionResult] = await dbpool.execute(sql, inputs, function (err, result, fields) {
      if (err) {

      } else {
        return result
      }
    });

    const optionsMap = {};

    optionResult.forEach(item => {
      // Extract option names and values
      const option1Name = item.option_1_name;
      const option1Value = item.option_1_value;
      const option2Name = item.option_2_name;
      const option2Value = item.option_2_value;

      // Add option values to the optionsMap
      if (!optionsMap[option1Name]) {
        optionsMap[option1Name] = [];
      }
      if (!optionsMap[option2Name]) {
        optionsMap[option2Name] = [];
      }
      if (!optionsMap[option1Name].includes(option1Value)) {
        optionsMap[option1Name].push(option1Value);
      }
      if (!optionsMap[option2Name].includes(option2Value)) {
        optionsMap[option2Name].push(option2Value);
      }
    });

    const productOptions = Object.entries(optionsMap).map(([name, values]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      values
    }));

    productData.newProduct.options = productOptions;
    return productData;
  } catch (error) {
    // Handle error
    console.error('Error retrieving product:', error);
    throw error;
  }
};

exports.getImages = async (fby_id, callback) => {
  let sql = "CALL getImages(?)";
  let inputs = [fby_id]
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let msg = { error: { data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getReports = async (fby_id, callback) => {
  let sql = "CALL getReports(?)";
  let inputs = [fby_id]
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let msg = { error: { data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getCreateProductVariantBySkuFamily = async (sku, callback) => {
  let sql = "CALL getCreateProductVariantBySkuFamily(?)";
  let inputs = [sku]
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let msg = { error: { data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getOptions = async (fby_id, callback) => {
  let sql = "CALL getOptions(?,?)";
  let inputs = [fby_id]
  inputs = [fby_user_id, sku];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let msg = { error: { data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getCreateProductVariantByDomain = async (user, request_type, cron_name, cron_id, callback) => {
  let sql = "CALL getCreateProductVariantByDomain(?,?)";
  let fby_user_id = user.fby_user_id;
  let inputs = [user.fby_user_id, user.domain];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
      return callback(msg);
    }
  });
}


exports.getCreatedProductById = async (user, callback) => {
  let sql = "CALL getCreatedProductById(?)";
  let fby_user_id = user.fby_user_id;
  let inputs = [user.fby_user_id];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getCreateProductById = async (user, callback) => {
  let sql = "CALL getCreateProductById(?)";
  let fby_user_id = user.fby_user_id;
  let inputs = [user.fby_user_id];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getCreatedProductVariantBySkuFamily = async (sku, item_product_id, callback) => {
  let sql = "CALL getCreatedProductVariantBySkuFamily(?,?)";
  if (!sku) {
    sku = null;
  }
  let inputs = [sku, item_product_id];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getCreateProductVariantBySku = async (sku, callback) => {
  let sql = "CALL getCreateProductVariantBySku(?)";
  let inputs = [sku];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getCreatedProductVarientIDBySku = async (sku, callback) => {
  let sql = "CALL getCreatedProductVariantBySku(?)";
  let inputs = [sku];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { data: constants.NORECORD } };
      return callback(msg);
    }
  });
}


exports.getCreatedProductVariantByDomain = async (user, callback) => {
  let sql = "CALL getCreatedProductVariantByDomain(?,?)";
  let fby_user_id = user.fby_user_id;
  let inputs = [user.fby_user_id, user.domain];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getCreateProductVariantById = async (user, callback) => {
  let sql = "CALL getCreateProductVariantById(?)";
  let fby_user_id = user.fby_user_id;
  let inputs = [user.fby_user_id];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, "domain": user.domain, data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

//Update Product location id.
exports.updateProdLocation = async (inputs, fby_user_id, cron_name, cron_id, callback) => {

  let sql = "CALL updateProdLocation(?,?,?,?,?,?)";
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
};
//get new product quantity from 'temp_master_inventory' and update in 'products' table.
exports.updateProduct = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL updateProduct(?,?,?,?)";
  if (inputs.length == 3) {
    inputs.push(fby_user_id)
    //console.log('CALL updateProduct(?,?,?,?)', inputs);
  }

  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //console.log(`\nCALL updateProduct(${inputs})\n`, result);
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);


      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
};

//update status to 1 in products table
exports.updateProductStatus = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL updateProductStatus(?,?,?,?,?,?,?,?)";
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.updateChannelStatus = async (inputs, callback) => {
  let sql = "CALL updateChannelStatus(?,?,?)";
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: {"data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

//update previous quantity,count=0,flag=0 in products table
exports.updateProductAftrSndChanl = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL updateProductAftrSndChanl(?,?,?,?,?)";
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
      //console.log(`\nCALL updateProductAftrSndChanl(${JSON.stringify(inputs)});\n${JSON.stringify(err)}`);

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.deleteReports = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL deleteReports(?,?)";
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
      //console.log(`\nCALL deleteReports(${JSON.stringify(inputs)});\n${JSON.stringify(err)}`);
      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.deleteProducts = async (sku, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL deleteProduct(?)";
  let inputs = [sku];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

//insert fby stocks to 'temp_master_inventory'.
exports.addStock = async (item, fby_user_id, cron_name, cron_id, callback) => {
  try {
    //await helpers.sleep();
    let sql = "CALL addStock(?,?,?,?,?,?,?)";
    item.push(fby_user_id);
    await dbpool.execute(sql, item, function (err, result, fields) {
      if (err) {
        let inputJson = JSON.stringify(item);
        //console.log(`\nCALL addStock(${JSON.stringify(item)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);

        logger.logError(`${sql} ${inputJson}`, err);

        let msg = { error: { "fby_user_id": fby_user_id, "data": JSON.stringify(err) }, success: { data: null } };;
        if (callback !== undefined) {
          return callback(msg);
        }
      }
    });
  }
  catch (err) {
    console.error(err);
  }
};

//insert channel product details to 'products'.
exports.addProduct = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sku = inputs[4];



  let sql = "CALL addProduct(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  if (sku != '') {
    await dbpool.execute(sql, inputs, function (err, result, fields) {
      //console.log(`\nCALL addProduct(${inputJson})\n`, result);
      if (err) {

        //console.log(`\nCALL addProduct(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);

        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
        return callback(msg);
      }
    });
  }
};

//insert channel product details to 'products'.
exports.addCarrierDetails = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sku = inputs[4];



  let sql = "CALL addCarrierDetails(?,?,?,?)";
  let inputJson = JSON.stringify(inputs);

  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //console.log(`\nCALL addCarriersDetails(${inputJson})\n`, result);
    if (err) {

      //console.log(`\nCALL addCarrierDetails(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
};

//Set parent product count as sum of variants for woocommerce.
exports.addProductPostOpeartion = async (fby_user_id) => {
  let inputs = [fby_user_id];
  let sql = "CALL addProductPostOpeartion(?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //console.log(`\nCALL addProduct(${inputJson})\n`, result);
    if (err) {

      //console.log(`\nCALL addProductPostOpeartion(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.addCreatedProduct = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL addCreatedProduct(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //logger.logInfo(`${sql} ${inputJson}`, result);
    if (err) {
      logger.logError(`${sql} ${inputJson}`, err);
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.addCreatedProductVariant = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL addCreatedProductVariant(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //logger.logInfo(`${sql} ${inputJson}`, result);
    if (err) {
      logger.logError(`${sql} ${inputJson}`, err);
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.addCreateProduct = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL addCreateProduct(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {

    if (err) {
      //console.log(`\nCALL addCreateProduct(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);
      logger.logError(`${sql} ${inputJson}`, err);
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.addProductUnits = async (inputs, fby_user_id, callback) => {
  let sql = "CALL addProductUnit(?,?,?,?,?,?,?,?,?,?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {

    if (err) {
      logger.logError(`${sql} ${inputJson}`, err);
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.addProductOptions = async (inputs, fby_user_id, callback) => {
  let sql = "CALL addOptions(?,?,?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {

    if (err) {
      logger.logError(`${sql} ${inputJson}`, err);
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.addCreateProductVariant = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL addCreateProductVariant(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //logger.logInfo(`${sql} ${inputJson}`, result);
    if (err) {
      logger.logError(`${sql} ${inputJson}`, err);
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.addImages = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL addImages(?,?,?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //logger.logInfo(`${sql} ${inputJson}`, result);
    if (err) {
      logger.logError(`${sql} ${inputJson}`, err);
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.addSkuFamily = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL addSkuFamily(?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //logger.logInfo(`${sql} ${inputJson}`, result);
    if (err) {
      logger.logError(`${sql} ${inputJson}`, err);
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.updateImages = async (inputs, callback) => {
  let sql = "CALL updateImages(?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //logger.logInfo(`${sql} ${inputJson}`, result);
    if (err) {
      logger.logError(`${sql} ${inputJson}`, err);
      let msg = { error: { data: err } };
      return callback(msg);
    }
  });
}

exports.addReport = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL addReport(?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //logger.logInfo(`${sql} ${inputJson}`, result);
    if (err) {
      logger.logError(`${sql} ${inputJson}`, err);
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.updatePrices = async (inputs, callback) => {
  let sql = "CALL updatePrices(?, ?, ?, ?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
      //console.log(`\nCALL updatePrices(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);

      let msg = { error: { data: err } };
      return callback(msg);
    }
  });
};

exports.updatePricesFromFby = async (inputs, callback) => {
  let sql = "CALL addPriceDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
      //console.log(`\nCALL addPriceDetail(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);

      let msg = { error: { data: err } };
      return callback(msg);
    }
  });
};

//update cron details in 'products' table where given sku matches.
exports.updateProductCron = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  /*
  try {
    let sql = "CALL updateProductCron(?,?,?,?)";
    await dbpool.execute(sql, inputs, function (err, result, fields) {
      if (err) {

        //console.log(`\nCALL updateProductCron(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);

        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
        return callback(msg);
      }
    });
  }
  catch (err) {
    //console.log('err: ', err.message);

  }
  */

  let msg = { success: { data: null } };;
  if (callback != null) {
    return callback(msg);
  }
  else {
    return msg;
  }
};

//insert Cron error logs into 'cron_error_log' table.
exports.cronErrorLog = async (inputs, cron_name, cron_id, callback) => {
  try {
    if (inputs[3].includes("no record Found")) {
      let msg = { sucess: { "cron": cron_name, data: "sucess" } };
      return callback(msg);
    }
    else {
      let sql = "CALL cronErrorLog(?,?,?,?,?)";
      // await dbpool.execute(sql, inputs, function (err, result, fields) {
      //   if (err) {

      //     let inputJson = JSON.stringify(inputs);
      //     logger.logError(`${sql} ${inputJson}`, err);

      //     let msg = { error: { "cron": cron_name, data: err } };
      //     return callback(msg);
      //   }
      // });
    }
  }
  catch (err) {
    //console.log('err: ', err.message);

  }
}

//get cron log from cron_error_log table
exports.getBulkCronLog = async (fby_user_id, dt, cron_name, cron_id, callback) => {

  let sql = "CALL getBulkCronLog(?,?,?)";

  await dbpool.execute(sql, [fby_user_id, cron_name, dt], function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify([fby_user_id, cron_name, dt]);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": err }, success: { data: null } };

      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0][0],
          },
        };
        return callback(msg);
      } else {
        let msg = {
          error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }
          , success: {
            data: null,
          },
        };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
      return callback(msg);
    }
  });

}

/**
 * Order Procedures
 */

//add individual line order item details in 'order_details' table
exports.addOrderDetails = async (inputs, cron_name, cron_id, callback) => {
  try {
    let fby_user_id = inputs[3];
    let sql = "CALL addOrderDetails(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    //logger.logInfo(`CALL addOrderDetails(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, inputs);
    await dbpool.execute(sql, inputs, function (err, result, fields) {
      try {
        // let inputJson = JSON.stringify(inputs).replace(/,/g, ",\r\n").replace(/"/g, "'").trim();
        let inputJson = JSON.stringify(inputs).replace(/"/g, "'").trim();
      }
      catch (error) {
        //console.log(`\nCALL addOrderDetails(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(error)}\nRESULT:\n${JSON.stringify(result)}`);
      }
      if (err) {

        //console.log(`\nCALL addOrderDetails(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);
        let msg = { error: { "cron": cron_name, "procedure": "addOrderDetails", data: err } };
        return callback(msg);
      }
      if (result) {
        if (result.length > 0) {
          let msg = {
            success: {
              data: result[0],
            },
          };
          return callback(msg);
        } else {
          let msg = { error: { "fby_user_id": fby_user_id, "procedure": "addOrderDetails", "data": constants.NORECORD } };
          return callback(msg);
        }
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "procedure": "addOrderDetails", "data": constants.NORECORD } };
        return callback(msg);
      }
    });
  }
  catch (err) {
    //console.log('ERROR CALL addOrderDetails: ', JSON.stringify(err));

  }
};

exports.addOrderDetailsV1 = async (inputs, cron_name, cron_id, callback) => {
  try {
    let fby_user_id = inputs[3];
    let sql = "CALL addOrderDetailsV1(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    await dbpool.execute(sql, inputs, function (err, result, fields) {
      try {
        // let inputJson = JSON.stringify(inputs).replace(/,/g, ",\r\n").replace(/"/g, "'").trim();
        let inputJson = JSON.stringify(inputs).replace(/"/g, "'").trim();
      }
      catch (error) {
        //console.log(`\nCALL addOrderDetails(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(error)}\nRESULT:\n${JSON.stringify(result)}`);
      }
      if (err) {

        //console.log(`\nCALL addOrderDetails(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);
        let msg = { error: { "cron": cron_name, "procedure": "addOrderDetails", data: err } };
        return callback(msg);
      }
      if (result) {
        if (result.length > 0) {
          let msg = {
            success: {
              data: result[0],
            },
          };
          return callback(msg);
        } else {
          let msg = { error: { "fby_user_id": fby_user_id, "procedure": "addOrderDetails", "data": constants.NORECORD } };
          return callback(msg);
        }
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "procedure": "addOrderDetails", "data": constants.NORECORD } };
        return callback(msg);
      }
    });
  }
  catch (err) {
    //console.log('ERROR CALL addOrderDetails: ', JSON.stringify(err));

  }
};

//add total order item details in 'order_masters' table
exports.addOrderMaster = async (inputs, cron_name, cron_id, callback, isAlertRequire = true, order = null) => {
  let missingField = "";
  try {
    if (!inputs[1] && inputs[1] != "") {
      missingField = "channelCode"
      inputs[1] = "";
    } else if (!inputs[2] && inputs[2] != "") {
      missingField = "ownerCode";
      inputs[2] = "";
    } else if (!inputs[7] && inputs[7] != "") {
      missingField = "orderDate";
      inputs[7] = "";
    } else if (!inputs[9] && inputs[9] != "") {
      missingField = "fullName";
      inputs[9] = "";
    } else if (!inputs[13] && inputs[13] != "") {
      missingField = "city";
      inputs[13] = "";
    } else if (!inputs[16] && inputs[16] != "") {
      missingField = "postalCode";
      inputs[16] = "";
    } else if (!inputs[37] && inputs[37] != "") {
      missingField = "managedByChannel";
      inputs[37] = "";
    } else if (!inputs[38] && inputs[38] != "") {
      missingField = "fullName";
      inputs[38] = "";
    } else if (!inputs[42] && inputs[42] != "") {
      missingField = "city";
      inputs[42] = "";
    } else if (!inputs[45] && inputs[45] != "") {
      missingField = "postalCode";
      inputs[45] = "";
    }

    if (isAlertRequire) {

      if (missingField != "") {
        await logger.LogForAlert(
          inputs[3],
          inputs[5],
          '',
          `Missing Mandatory field: ${missingField}`,
          (order ? JSON.stringify(order) : JSON.stringify(inputs)),
          constants.LOG_LEVEL.ERROR,
          constants.FBY_ALERT_CODES.ORDER_SYNC,
          constants.CC_OPERATIONS.PUSH_ORDER_TO_FBY_MISSING_DATA,
          ''
        );
      }
    }



  } catch (error) {
    //console.log(error.message);
  }

  let sql = "CALL addOrderMaster(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  await dbpool.execute(sql, inputs, function (err, result, fields) {
    try {
      //let inputJson = JSON.stringify(inputs).replace(/,/g, ",\r\n").replace(/"/g, "'").trim();
      let inputJson = JSON.stringify(inputs).replace(/"/g, "'").trim();
      //console.log(`\nCALL addOrderMaster (${inputJson});\n{${JSON.stringify(result)}}`);
    }
    catch (error) {

    }
    if (err) {

      //console.log(`\nCALL addOrderMaster(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);

      let msg = { error: { "cron": cron_name, "procedure": "addOrderMaster", data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": inputs[3], "procedure": "addOrderMaster", "data": constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": inputs[3], "procedure": "addOrderMaster", "data": constants.NORECORD } };
      return callback(msg);
    }
  });
}

//get orders from order_masters according to request type 
exports.getOrder = async (user, request_type, cron_name, cron_id, callback) => {
  let fby_user_id = user.fby_user_id;
  if (request_type == "status") {
    let sql = "CALL getOrderByStatus(?)";
    await dbpool.execute(sql, [user.fby_user_id], function (err, result, fields) {
      if (err) {

        let inputJson = JSON.stringify([user.fby_user_id]);
        logger.logError(`${sql} ${inputJson}`, err);

        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
        return callback(msg);
      }
      if (result) {
        if (result.length > 0) {
          let msg = {
            success: {
              data: result[0],
            },
          };
          return callback(msg);
        } else {
          let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
          return callback(msg);
        }
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
        return callback(msg);
      }
    });
  } else if (request_type == "account") {
    let sql = "CALL getOrderByAccount(?,?)";
    await dbpool.execute(sql, [user.fby_user_id, user.id], function (err, result, fields) {
      if (err) {

        let inputJson = JSON.stringify([user.fby_user_id, user.id]);
        logger.logError(`${sql} ${inputJson}`, err);

        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
        return callback(msg);
      }
      if (result) {
        if (result.length > 0) {
          let msg = {
            success: {
              data: result[0],
            },
          };
          return callback(msg);
        } else {
          let msg = { error: { "fby_user_id": fby_user_id, "id": user.id, data: constants.NORECORD } };
          return callback(msg);
        }
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "id": user.id, data: constants.NORECORD } };
        return callback(msg);
      }
    });
  }
  if (request_type == "tracking") {
    let sql = "CALL getOrderForTracking(?)";
    await dbpool.execute(sql, [user.fby_user_id], function (err, result, fields) {
      if (err) {

        let inputJson = JSON.stringify([user.fby_user_id]);
        logger.logError(`${sql} ${inputJson}`, err);

        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
        return callback(msg);
      }
      if (result) {
        if (result.length > 0) {
          let msg = {
            success: {
              data: result[0],
            },
          };
          return callback(msg);
        } else {
          let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
          return callback(msg);
        }
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
        return callback(msg);
      }
    });
  }
}

exports.getOrderByOrderNumber = async (fby_user_id, order_number, cron_name, cron_id, callback) => {
  let sql = "CALL getOrderByOrderNumber(?,?)";
  await dbpool.execute(sql, [fby_user_id, order_number], function (err, result, fields) {
    if (err) {
      let inputJson = JSON.stringify([fby_user_id, order_number]);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getOrderMasterDetails = async (fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL getOrderMasterDetails(?)";
  await dbpool.execute(sql, [fby_user_id], function (err, result, fields) {
    if (err) {
      let inputJson = JSON.stringify([fby_user_id, order_number]);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

//get orders from order_details
exports.getOrderDetails = async (fby_user_id, order_number, cron_name, cron_id, callback) => {
  let sql = "CALL getOrderDetails(?,?)";
  await dbpool.execute(sql, [fby_user_id, order_number], function (err, result, fields) {
    if (err) {

      //console.log(`\nCALL getOrderDetails(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);

      let msg = { error: { "fby_user_id": fby_user_id, "data": err, "order_master": null } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0] != undefined ? result[0] : null,
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getOrderDetailsByLineItem = async (fby_user_id, order_number, order_line_item_id, cron_name, cron_id, callback) => {
  let sql = "CALL getOrderByLineItem(?,?,?)";
  await dbpool.execute(sql, [fby_user_id, order_number, order_line_item_id], function (err, result, fields) {
    if (err) {
      let msg = { error: { "fby_user_id": fby_user_id, "data": err, "order_master": null } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0] != undefined ? result[0] : null,
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getOrderDetailsByFbyID = async (fby_user_id, callback) => {
  let sql = "CALL getOrderDetailsV1(?)";
  await dbpool.execute(sql, [fby_user_id], function (err, result, fields) {
    if (err) {


      let msg = { error: { "fby_user_id": fby_user_id, "data": err, "order_master": null } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0] != undefined ? result[0] : null,
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
      return callback(msg);
    }
  });
}

//get location id from products table
exports.getLocationId = async (fby_user_id, sku, cron_name, cron_id, callback, order_item_id = 0) => {
  let sql = "CALL getLocationId(?,?,?)";
  let inputJson = JSON.stringify([fby_user_id, sku, order_item_id]);
  //console.log(`sku ${sku}, ${sql} ${inputJson}`);
  let cacheKey = `getLocationId-${fby_user_id}-${sku}`;
  let cacheData = ccCache.get(cacheKey);
  if (cacheData == undefined || cacheData == null) {
    await dbpool.execute(sql, [fby_user_id, sku, order_item_id], function (err, result, fields) {
      //logger.logInfo(`${sql} ${inputJson}`, result);
      if (err) {
        logger.logError(`${sql} ${inputJson}`, err);

        let msg = { error: { "fby_user_id": fby_user_id, "data": err } };
        return callback(msg);
      }
      if (result) {
        if (result.length > 0) {
          let msg = {
            success: {
              data: result[0],
            },
          };
          cacheData = result[0];
          ccCache.set(cacheKey, cacheData);
          return callback(msg);
        } else {
          let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };

          return callback(msg);
        }
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };

        return callback(msg);
      }
    });
  }

  let msg = {
    success: {
      data: cacheData,
    },
  };
  ccCache.set(cacheKey, cacheData);
  return callback(msg);

}

//get orders from order_details whose is_trackable is 1
exports.getOrderDetailsTracking = async (fby_user_id, order_number, cron_name, cron_id, callback) => {
  let sql = "CALL getOrderDetailsTracking(?,?)";
  let inputJson = JSON.stringify([fby_user_id, order_number]);
  // if (order_number == '4905315860705') {
  //   //console.log(inputJson);
  // }
  await dbpool.execute(sql, [fby_user_id, order_number], function (err, result, fields) {
    //logger.logInfo(`${sql} ${inputJson}`, result);
    if (err) {

      //console.log(`\nCALL getOrderDetailsTracking(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);

      let msg = { error: { "fby_user_id": fby_user_id, "data": err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
      return callback(msg);
    }
  });
}
//get canceled orders from order_details
exports.getCanceledOrderDetails = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL getCanceledOrderDetails(?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  //console.log(`${sql} ${inputJson}`);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
      return callback(msg);
    }
  });
}

//update fby_send_status to 1 in order_masters table. marked as already sent to fby
exports.updateOrderStatus = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL updateOrderStatus(?,?,?,?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //console.log(`${sql} ${inputJson}`, result);
    if (err) {

      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

//update fby_send_status to 1 in order_masters table. marked as already sent to fby
exports.updateOrderStatus_SKU_Level = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL updateOrderStatus_ProductNotFound(?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //console.log(`${sql} ${inputJson}`, result);
    if (err) {

      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}
//update order and payment statuus in order_details table
exports.updateOrderCancelStatus = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL updateOrderCancelStatus(?,?,?,?,?,?,?)";
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}
//update is_canceled_fby to 1 in order_details table
exports.updateOrderCancel = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL updateOrderCancel(?,?,?,?,?)";
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}
//update status to 1 in order_details table. marked as already sent to shopify
exports.updateOrderDetailStatus = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL updateOrderDetailStatus(?,?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  let logMessage = `CALL updateOrderDetailStatus('${inputs[0]}','${inputs[1]}','${inputs[2]}','${inputs[3]}');`;
  try {

    await dbpool.execute(sql, inputs, function (err, result, fields) {
      // //console.log(`\nCALL updateOrderDetailStatus ${inputJson};\nResult\n`, result);
      if (err) {


        //  //console.log(`${sql} ${inputJson}`, err);

        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
        return callback(msg);
      }
    });
  }
  catch (error) {
    //console.log(`${logMessage}\n error: `, error.message);

  }
};

//update status to 1 in order_details table. marked as already sent to shopify
exports.updateOrderShippedStatus = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL updateOrderShippedStatus(?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    // //console.log(`\nCALL updateOrderShippedStatus ${inputJson};\nResult\n`, result);
    if (err) {
      //  //console.log(`${sql} ${inputJson}`, err);
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

//insert fby Tracking orders to 'temp_master_inventory'.
exports.addOrderTracking = async (item, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL addOrderTracking(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  await dbpool.execute(sql, item, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(item);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

//update new tracking_details in order_details table.
exports.updateOrder = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  await helpers.sleep();
  let orderlist = '5137815404773,5137866719461,5137947623653,5137984717029,5138171822309,5138184077541,5138378916069';
  let order_no = inputs[6];
  let sku = inputs[9];
  let sql = "\n CALL updateOrderV1(?,?,?, ?,?,?, ?,?,? ,?,?)";
  inputs.push(fby_user_id);
  let inputJson = JSON.stringify(inputs);

  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (orderlist.includes(order_no))// || (result == undefined || result == null || result.length == 0)) 
    {
      //console.log(`\nfby_user_id ${fby_user_id}, order_no ${order_no}, sku ${sku}\nCALL updateOrderV1 (${inputJson})\n\n result: \n\n`, JSON.stringify(result[0]));
    }
    if (err) {

      //console.log(`${sql} ${inputJson}`, JSON.stringify(err));

      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}


//update cron details in order_masters table where order numer matches.
exports.updateOrderCron = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL updateOrderCron(?,?,?,?)";
  /*
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
 
      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);
 
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
  */
}
//update cron details in order_details table where order numer matches.
exports.updateCancelOrderCron = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL updateCancelOrderCron(?,?,?,?)";
  /*
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
 
      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);
 
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
  */
}

//update cron details in order_details table where order numer matches.
exports.updateOrderTrackingCron = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL updateOrderTrackingCron(?,?,?,?)";
  /*
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
 
      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);
 
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
  */
}

//it wil get Untrack order details according to fby_user_id and channel
exports.getUntrackOrders = async (fby_user_id, channel, cron_name, cron_id, callback) => {
  let sql = "CALL getUntrackOrders(?,?)";
  let inputJson = JSON.stringify([fby_user_id, channel]);
  await dbpool.execute(sql, [fby_user_id, channel], function (err, result, fields) {
    if (err) {

      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, "data": err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
      return callback(msg);
    }
  });
}


/**
 * Cron Procedures
 */
//insert cron detail
exports.insertCron = async (inputs, cron_name, cron_id, callback) => {
  let sql = "CALL insertCron(?,?,?,?)";
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "cron": cron_name, data: err } };
      return callback(msg);
    }
  });
}

//update cron status
exports.updateCron = async (inputs, cron_name, cron_id, callback) => {
  let sql = "CALL updateCron(?,?)";
  /*
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
 
      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);
 
      let msg = { error: { "cron": cron_name, data: err } };
      return callback(msg);
    }
  });
  */
}

//FBY Error Manage for product
exports.fbyProductErrorManage = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL fbyProductErrorManage(?,?,?,?,?,?,?,?)";
  /*
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
 
      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);
 
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
  */
}

//FBY Error Manage for order
exports.fbyOrderErrorManage = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL fbyOrderErrorManage(?,?,?,?,?,?,?,?)";
  /*
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //  //console.log('sql: ', sql);
    if (err) {
 
      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);
 
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
  */

}
//FBY Error Manage for cancel order
exports.fbyCanclOrderErrorManage = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL fbyCanclOrderErrorManage(?,?,?,?,?,?,?,?,?)";
  /*
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
 
      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);
 
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
  */
}
//FBY Error Manage for order
exports.fbyOrderTrackErrorManage = async (inputs, fby_user_id, cron_name, cron_id, callback) => {
  let sql = "CALL fbyOrderTrackErrorManage(?,?,?,?,?,?,?,?)";
  /*
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
 
      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);
 
      let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
  */
}

//insert or update Cron error logs into 'bulk_process_error_log' table.
exports.fbyCronErrorManage = async (inputs, cron_name, cron_id, callback) => {
  let sql = "CALL fbyCronErrorManage(?,?,?,?,?,?)";
  /*
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
 
      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);
 
      let msg = { error: { "cron": cron_name, data: err } };
      return callback(msg);
    }
  });
  */
}
/**
 * Map Table Procedures
 */


exports.getPaymentMethod = async (payment_method, chanel, cron_name, cron_id, callback) => {
  let sql = "CALL getPaymentMethod(?,?)";
  let inputs = [payment_method, chanel];
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "chanel": chanel, "data": err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "chanel": chanel, "data": constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "chanel": chanel, "data": constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.getCancelReason = async (cancel_reason, chanel, cron_name, cron_id, callback) => {
  let sql = "CALL getCancelReason(?,?)";
  await dbpool.execute(sql, [cancel_reason, chanel], function (err, result, fields) {
    if (err) {

      let inputs = [cancel_reason, chanel];
      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "chanel": chanel, "data": err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "chanel": chanel, "data": constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "chanel": chanel, "data": constants.NORECORD } };
      return callback(msg);
    }
  });
}
exports.getAlertCode = async (cron_name, chanel, cron_id, callback) => {
  let sql = "CALL getAlertCode(?,?)";
  await dbpool.execute(sql, [cron_name, chanel], function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify([cron_name, chanel]);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "chanel": chanel, "data": err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "chanel": chanel, "data": constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "chanel": chanel, "data": constants.NORECORD } };
      return callback(msg);
    }
  });
}
//insert or update Cron error logs into 'bulk_process_error_log' table.
exports.fbyCronErrorManage = async (inputs, cron_name, cron_id, callback) => {
  let sql = "CALL fbyCronErrorManage(?,?,?,?,?,?)";
  /*
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
      let msg = { error: { "cron": cron_name, data: err } };
      return callback(msg);
    }
  });
  */
}


//Set parent product count as sum of variants for woocommerce.
exports.deleteStockBeforeAddStocks = async (fby_user_id) => {

  try {
    let inputs = [fby_user_id];
    let sql = "CALL channelconnector.deleteStock(?)";
    let inputJson = JSON.stringify(inputs);

    await dbpool.execute(sql, inputs, function (err, result, fields) {
      //console.log(`\nCALL addProduct(${inputJson})\n`, result);
      if (err) {

        //console.log(`\nCALL channelconnector.deleteStock(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);

        let msg = { success: { data: null } };;
        return callback(msg);
      }
    });
  }
  catch (error) {
    //console.log('deleteStockBeforeAddStocks error: ', error.message);
  }

}

exports.deletePricesBeforeAddStocks = async (fby_user_id) => {
  /*
  let inputs = [fby_user_id];
  let sql = "CALL channelconnector.deletePrice(?)";
  let inputJson = JSON.stringify(inputs);
 
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //console.log(`\nCALL addProduct(${inputJson})\n`, result);
    if (err) {
 
      //console.log(`\nCALL channelconnector.deletePrice(${JSON.stringify(inputs)})\nERROR:\n${JSON.stringify(err)}\nRESULT:\n${JSON.stringify(result)}`);
 
      let msg = { success: { data: null } };;
      return callback(msg);
    }
  });
*/
}

exports.getLastSyncOperationTime = async (fby_user_id, cron_name, callback) => {
  let sql = "CALL getLastSyncOperationTime(?,?)";
  try {
    //Call channelconnector.getLastSyncOperationTime(39,'GET_STOCK_FROM_FBY');
    let inputs = [fby_user_id, cron_name];
    await dbpool.execute(sql, inputs, function (err, result, fields) {
      if (err) {
        let msg = { error: { "fby_user_id": fby_user_id, "data": err } };
        return callback(msg);
      }
      if (result) {
        if (result.length > 0) {
          let msg = {
            success: {
              data: result[0],
            },
          };
          return callback(msg);
        } else {
          let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
          return callback(msg);
        }
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
        return callback(msg);
      }
    });
  } catch (error) {
    //console.log("\nError:", error.message);
    return callback(null);
  }
}

exports.updateLastSyncOperationTime = async (fby_user_id, updated_at, cron_name, cron_id, callback) => {
  let sql = "CALL updateLastSyncOperationTime(?,?,?)";
  try {
    let inputs = [fby_user_id, updated_at, cron_name];
    // call channelconnector.updateLastSyncOperationTime(39,CAST(DATE_ADD(NOW(), INTERVAL - 2 HOUR) AS CHAR),'GET_STOCK_FROM_FBY');
    await dbpool.execute(sql, inputs, function (err, result, fields) {
      if (err) {

        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };;
        return callback(msg);
      }
    });
  } catch (error) {
    //console.log("\nError:", error.message);
    callback(null);
  }
}


exports.GetOrderFulfillmentDetails = async (fby_user_id, order_no, callback) => {
  let sql = "CALL channelconnector.GetOrderFulfillmentDetails(?,?)";

  let line_items = [];
  let fulfillment_order = {
    "id": 6623307759960,
    "order_id": 5589950398808,
    "assigned_location_id": 71653097701,
    "line_items": []
  };
  try {
    //Call channelconnector.getLastSyncOperationTime(39,'GET_STOCK_FROM_FBY');
    let inputs = [fby_user_id, order_no];
    await dbpool.execute(sql, inputs, async function (err, result, fields) {
      if (err) {
        let msg = { error: { "fby_user_id": fby_user_id, "data": err } };
        return callback(isRequired);
      }
      if (result) {
        if (result.length > 0) {
          for await (let item of result[0]) {
            fulfillment_order.id = item.fulfillment_order_id;
            fulfillment_order.order_id = item.order_no;
            fulfillment_order.assigned_location_id = item.location_id;
            let lineItem = {
              "id": item.fulfillment_order_line_item_Id,
              "fulfillment_order_id": item.fulfillment_order_id,
              "quantity": item.quantity,
              "line_item_id": item.line_item_id,
            };
            line_items.push(lineItem);
          }
          fulfillment_order.line_items = line_items;
        }
      }
    });
  } catch (error) {
    //console.log("\nError:", error.message);
  }
  finally {
    return callback(fulfillment_order);
  }
}


exports.deleteInactiveOffers = async (fby_user_id, comma_saperated_skus) => {
  let sql = "CALL deleteInactiveOffers(?,?)";
  let resultDb = [];
  try {
    let inputs = [fby_user_id, comma_saperated_skus];
    // call channelconnector.updateLastSyncOperationTime(39,CAST(DATE_ADD(NOW(), INTERVAL - 2 HOUR) AS CHAR),'GET_STOCK_FROM_FBY');
    await dbpool.execute(sql, inputs, function (err, result, fields) {
      // //console.log('deleteInactiveOffers result: ');
      // //console.log(result[0]);
      // resultDb = result[0];
    });
  } catch (error) {
    //console.log("\nError:", error.message);
  }
  return await resultDb;
}

exports.getCronLogs = async (inputs, callback) => {

  let sql = "CALL channelconnector.getCronLogs(?,?)";
  let fby_user_id = inputs[0] || null;
  let cc_operation = inputs[1] || null;
  try {
    await dbpool.execute(sql, [fby_user_id, cc_operation], function (err, result, fields) {
      if (err) {

        let inputJson = JSON.stringify([fby_user_id, cc_operation]);
        logger.logError(`${sql} ${inputJson}`, err);

        let msg = { error: { "fby_user_id": fby_user_id, "data": err }, success: { data: null } };

        return callback(msg);
      }
      if (result) {
        if (result.length > 0) {
          let msg = {
            success: {
              data: result[0],
            },
          };
          return callback(msg);
        } else {
          let msg = {
            error: { "fby_user_id": fby_user_id, "data": constants.NORECORD }
            , success: {
              data: null,
            },
          };
          return callback(msg);
        }
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, "data": constants.NORECORD } };
        return callback(msg);
      }
    });
  } catch (error) {
    // console.log("error", error.message);
    let msg = { error: { "fby_user_id": fby_user_id, "data": error.message } };
    return callback(msg);
  }

}

exports.addNewCronLogs = async (inputs, callback) => {
  let sql = "CALL createNewCronLogs(?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //logger.logInfo(`${sql} ${inputJson}`, result);
    if (err) {
      logger.logError(`${sql} ${inputJson}`, err);
      let msg = { error: { "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.updateCronLogs = async (inputs, callback) => {
  let sql = "CALL updateCronLogs(?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //logger.logInfo(`${sql} ${inputJson}`, result);
    if (err) {
      logger.logError(`${sql} ${inputJson}`, err);
      let msg = { error: { "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}


exports.deleteCronLogs = async (inputs, callback) => {
  let sql = "CALL deleteCronLogs(?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    //logger.logInfo(`${sql} ${inputJson}`, result);
    if (err) {
      logger.logError(`${sql} ${inputJson}`, err);
      let msg = { error: { "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });
}

exports.getLogsByAlertId = async (inputs, callback) => {

  let sql = "CALL cclogs._6_logs_Get_by_alert_id(?)";
  let alert_id = inputs[0] || null;
  try {
    await dbpool.execute(sql, [alert_id], function (err, result, fields) {
      if (err) {

        let inputJson = JSON.stringify([alert_id]);
        logger.logError(`${sql} ${inputJson}`, err);

        let msg = { error: { "alert-Id": alert_id, "data": err }, success: { data: null } };

        return callback(msg);
      }
      if (result) {
        if (result.length > 0) {
          let msg = {
            success: {
              data: result[0],
            },
          };
          return callback(msg);
        } else {
          let msg = {
            error: { "alert-Id": alert_id, "data": constants.NORECORD }
            , success: {
              data: null,
            },
          };
          return callback(msg);
        }
      } else {
        let msg = { error: { "alert-Id": alert_id, "data": constants.NORECORD } };
        return callback(msg);
      }
    });
  } catch (error) {
    // console.log("error", error.message);
    let msg = { error: { "alert-Id": alert_id, "data": error.message } };
    return callback(msg);
  }

}


//insert channel product details to 'products'.
exports.assignBin = async (inputs, callback) => {
  let sql = "CALL assign_bin(?,?,?,?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
      let msg = { error: { "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });

};

exports.getBin = async (inputs, callback) => {
  let sql = "CALL getBin(?,?)";
  let fby_user_id = inputs[0]

  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {

      let inputJson = JSON.stringify(inputs);
      logger.logError(`${sql} ${inputJson}`, err);

      let msg = { error: { "fby_user_id": fby_user_id, data: err } };
      return callback(msg);
    }
    if (result) {
      if (result.length > 0) {
        let msg = {
          success: {
            data: result[0],
          },
        };
        return callback(msg);
      } else {
        let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
        return callback(msg);
      }
    } else {
      let msg = { error: { "fby_user_id": fby_user_id, data: constants.NORECORD } };
      return callback(msg);
    }
  });
}

exports.markOrderComplete = async (inputs, callback) => {
  let sql = "CALL mark_order_complete(?,?,?)";
  let inputJson = JSON.stringify(inputs);
  await dbpool.execute(sql, inputs, function (err, result, fields) {
    if (err) {
      let msg = { error: { "data": constants.NORECORD }, success: { data: null } };;
      return callback(msg);
    }
  });

};