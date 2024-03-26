const constants = require("../constants/constants.js");
const common = require("../constants/common.js");
const logger = require("../../misc/logger");
const request = require("request-promise");
const helpers = require("../../misc/helpers");
const shopifyController = require("./shopifyController.js");
const storedenController = require("./storedenController.js");
const fbyService = require("../../services/fby_service");
const dateTime = require("node-datetime");


const prestashopController = require("../../services/prestashopService/prestashop_service");


const { createProductWoocommerce } = require("./woocommerceController.js");
const { createProductMagento } = require("./magentoController.js");


exports.performCrudOperationForJobs = async (req, res) => {

    let request_type = req.query.request_type;
    try {

        if (request_type === 'get') {
            let fby_user_id = req.body.fby_user_id || '';
            let cc_operation = req.body.cc_operation || '';
            //when url hits, it insert the cron details and make status 1 as its running
            let inputs = [fby_user_id, cc_operation]
            await common.getCronLogs(inputs, function (result) {
                if (result.error) {
                    //console.log('\n ERROR: ', JSON.stringify(result.error));
                    res.send(result.error);
                } else {

                    if (!res.headersSent) {
                        res.send(result);
                    }

                }

            })
        } else if (request_type === 'create') {
            let fby_user_id = req.body.fby_user_id || '';
            let cc_operation = req.body.cc_operation || '';
            let cron_schedule = req.body.cron_schedule || '';
            let url = req.body.url || '';
            //when url hits, it insert the cron details and make status 1 as its running
            let inputs = [fby_user_id, cc_operation, cron_schedule, url]
            await common.addNewCronLogs(inputs, function (result) {
                if (result.error) {
                    //console.log('\n ERROR: ', JSON.stringify(result.error));
                    res.send(result.error);
                } else {

                    if (!res.headersSent) {
                        res.send(result);
                    }

                }
            })

        } else if (request_type === 'update') {

            let fby_user_id = req.body.fby_user_id || '';
            let cc_operation = req.body.cc_operation || '';
            let cron_schedule = req.body.cron_schedule || '';
            let url = req.body.url || '';
            //when url hits, it insert the cron details and make status 1 as its running
            let inputs = [fby_user_id, cc_operation, cron_schedule, url]
            await common.updateCronLogs(inputs, function (result) {
                if (result.error) {
                    //console.log('\n ERROR: ', JSON.stringify(result.error));
                    res.send(result.error);
                } else {

                    if (!res.headersSent) {
                        res.send(result);
                    }

                }
            })

        } else if (request_type === 'delete') {

            let fby_user_id = req.body.fby_user_id || '';
            let cc_operation = req.body.cc_operation || '';
            //when url hits, it insert the cron details and make status 1 as its running
            let inputs = [fby_user_id, cc_operation]
            await common.deleteCronLogs(inputs, function (result) {
                if (result.error) {
                    //console.log('\n ERROR: ', JSON.stringify(result.error));
                    res.send(result.error);
                } else {

                    if (!res.headersSent) {
                        res.send(result);
                    }

                }
            })
        }

    }
    catch (error) {
        //console.log(`\nfby_user_id=${fby_user_id}, ${file_and_method_name} Error: ${error.message}`);
        res.send(error.message);

    }

}



exports.getProduct = async (req, res) => {
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";
    let isCreated = req.query.isCreated;
    try {
        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
            if (result.error) {
                // store user error log
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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        if (req.query.fby_user_id && req.query.sku && !Boolean(isCreated)) {

                                            let productData = await common.getCreateProductBySku(client.fby_user_id, req.query.sku);
                                            res.send(productData);

                                        } else if (req.query.fby_user_id && req.query.sku && Boolean(isCreated)) {
                                            await common.getCreatedProductIDBySku(req.query.sku, async function (result) {
                                                if (result.error) {
                                                    // store get product error log
                                                    //console.log('inputs: ', inputs);
                                                    return false;
                                                } else {
                                                    res.send(result)
                                                }
                                            })
                                        } else {
                                            await common.getCreateProductById(shopifyAccount, async function (result) {
                                                if (result.error) {
                                                    // store get product error log
                                                    //console.log('inputs: ', inputs);
                                                    return false;
                                                } else {
                                                    res.send(result)
                                                }
                                            })
                                        }

                                    } catch (error) {
                                        console.log(error.message);
                                    }

                                }
                                else {
                                    //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                                    set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                                    if (!res.headersSent) {
                                        res.send(set_response);
                                    }
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
                                console.log("Hello");
                            }, 25000);
                        }
                    })
                }
            }
        });
        res.on('finish', function () {
            // let dt = dateTime.create();
            // let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
            // common.updateCron(inputs, cron_name, cron_id, function (result) {
            //   if (result.error) {
            //     mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            //   }
            // })
        });
    }
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }

}

exports.getAllVarient = async (req, res) => {
    let cron_id = "";
    let cron_name = "";

    try {

        let fby_id = req.query.fby_user_id;
        //get shopify account detail
        await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
            if (result.error) {

                //send response
                if (!res.headersSent) {
                    res.send(result.error);
                }
            } else {
                let set_response = {};
                /* Shopify account loop start */
                for (const shopifyAccount of result.success.data) {
                    await common.getCreateProductVariantById(shopifyAccount, async function (result) {
                        if (result.error) {
                            // store get product error log
                            //console.log('inputs: ', inputs);
                            return false;
                        } else {
                            res.send(result)
                        }
                    })
                }
            }
        })
        //asynchronous function for updating shopify inventory



    } catch (error) {
        console.log(error.message);
    }


}

exports.getChannelDetails = async (req, res) => {
    try {
        //asynchronous function for updating shopify inventory
        if (req.query.groupCode) {
            await common.getChannelDetails(req.query.groupCode, async function (result) {
                if (result.error) {
                    // store get product error log
                    //console.log('inputs: ', inputs);
                    return false;
                } else {
                    res.send(result)
                }
            })
        }

    } catch (error) {
        console.log(error.message);
    }
}


exports.updateChannelStatus = async (req, res) => {
    let groupCode = req.body.groupCode;
    let channelId = req.body.channelId;
    let isActive = req.body.isActive;
    try {
        //asynchronous function for updating shopify inventory
        if (groupCode && channelId && isActive != undefined && isActive != null) {
            let inputs = [channelId, groupCode, isActive]
            await common.updateChannelStatus(inputs, async function (result) {
                if (result.error) {
                    // store get product error log
                    //console.log('inputs: ', inputs);
                    return false;
                } else {
                    res.send(result)
                }
            })
        }

    } catch (error) {
        console.log(error.message);
    }
}
exports.getOrderMasterDetails = async (req, res) => {
    let cron_id = "";
    let cron_name = "";

    try {

        let fby_id = req.query.fby_user_id;
        //get shopify account detail
        await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
            if (result.error) {

                //send response
                if (!res.headersSent) {
                    res.send(result.error);
                }
            } else {
                let set_response = {};
                /* Shopify account loop start */
                for (const shopifyAccount of result.success.data) {
                    if (req.body.order_no) {
                        await common.getOrderByOrderNumber(fby_id, req.body.order_no, '', '', async function (result) {
                            if (result.error) {

                                return false;
                            } else {
                                console.log(result);
                                res.send(result)
                            }
                        })
                    } else {
                        await common.getOrderMasterDetails(fby_id, '', '', async function (result) {
                            if (result.error) {

                                return false;
                            } else {
                                console.log(result);
                                res.send(result)
                            }
                        })
                    }
                }
            }
        })

    } catch (error) {
        console.log(error.message);
    }

}

exports.getOrderDetails = async (req, res) => {
    let cron_id = "";
    let cron_name = "";

    try {

        let fby_id = req.query.fby_user_id;
        //get shopify account detail
        await common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
            if (result.error) {

                //send response
                if (!res.headersSent) {
                    res.send(result.error);
                }
            } else {
                let set_response = {};
                /* Shopify account loop start */
                for (const shopifyAccount of result.success.data) {
                    if (req.body.order_no && req.body.order_line_item_id) {
                        await common.getOrderDetailsByLineItem(fby_id, req.body.order_no, req.body.order_line_item_id, '', '', async function (result) {
                            if (result.error) {
                                return false;
                            } else {
                                console.log(result);
                                res.send(result)
                            }
                        })
                    } else if (req.body.order_no) {
                        await common.getOrderDetails(fby_id, req.body.order_no, '', '', async function (result) {
                            if (result.error) {

                                return false;
                            } else {
                                console.log(result);
                                res.send(result)
                            }
                        })
                    } else {
                        await common.getOrderDetailsByFbyID(fby_id, async function (result) {
                            if (result.error) {

                                return false;
                            } else {
                                console.log(result);
                                res.send(result)
                            }
                        })
                    }
                }
            }
        })

    } catch (error) {
        console.log(error.message);
    }


}
exports.getvarient = async (req, res) => {

    try {
        //asynchronous function for updating shopify inventory
        if (req.query.sku) {
            await common.getCreateProductVariantBySkuFamily(req.query.sku, async function (result) {
                if (result.error) {
                    // store get product error log
                    //console.log('inputs: ', inputs);
                    return false;
                } else {
                    res.send(result)
                }
            })
        } else {
            let item_product_id = req.query.item_product_id;
            await common.getCreatedProductVariantBySkuFamily(null, item_product_id, async function (result) {
                if (result.error) {
                    // store get product error log
                    //console.log('inputs: ', inputs);
                    return false;
                } else {
                    res.send(result)
                }
            })
        }


    } catch (error) {
        console.log(error.message);
    }


}

exports.createShopifyProductWithProductVarient = async (req, res) => {
    // for (const product of req.body.rows) {
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
            if (result.error) {
                // store user error log
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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        try {
                                            await createShopifyProductWithVarientFromDigiConnector(req.body, shopifyAccount, fby_id, cron_name, cron_id)
                                                .then((params) => {
                                                    console.log('params: ', params);
                                                    // if (params !== undefined) {
                                                    //   set_response[shopifyAccount.domain] = (params);
                                                    // }
                                                });
                                            common.getCreateProductVariantByDomain(shopifyAccount, "domain", cron_name, cron_id, function (result) {
                                                if (result.error) {
                                                    // store get product error log

                                                    return false;
                                                } else {
                                                    //asynchronous function for updating shopify inventory
                                                    shopifyController.createShopifyProductVariant(result.success.data, req.body, shopifyAccount, cron_name, cron_id)
                                                        .then((params) => {
                                                            if (Object.keys(params).length > 0) {
                                                                set_response[shopifyAccount.domain] = (params);
                                                            }
                                                        })
                                                }
                                            })                      //await shopifyController.pushImagesShopify(req, res);

                                        } catch (error) {
                                            console.log(error.message);
                                        }
                                    } catch (error) {
                                        console.log(error.message);
                                    }

                                }
                                else {
                                    //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                                    set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                                    if (!res.headersSent) {
                                        res.send(set_response);
                                    }
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
                                console.log("Hello");
                            }, 25000);
                        }
                    })
                }
            }
        });
        res.on('finish', function () {
            // let dt = dateTime.create();
            // let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
            // common.updateCron(inputs, cron_name, cron_id, function (result) {
            //   if (result.error) {
            //     mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            //   }
            // })
        });
    }
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}

exports.updateShopifyProductwithVarient = async (req, res) => {
    // for (const product of req.body.rows) {
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
            if (result.error) {
                // store user error log
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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        try {
                                            await createProductShopifyFromDigiConnector(req.body, shopifyAccount, fby_id, cron_name, cron_id)
                                                .then((params) => {
                                                    console.log('params: ', params);
                                                    // if (params !== undefined) {
                                                    //   set_response[shopifyAccount.domain] = (params);
                                                    // }
                                                });
                                            await shopifyController.updateProductsShopifyWithVarient(req, res);
                                            //await shopifyController.pushImagesShopify(req, res);

                                        } catch (error) {
                                            console.log(error.message);
                                        }
                                    } catch (error) {
                                        console.log(error.message);
                                    }

                                }
                                else {
                                    //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                                    set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                                    if (!res.headersSent) {
                                        res.send(set_response);
                                    }
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
                                console.log("Hello");
                            }, 25000);
                        }
                    })
                }
            }
        });
        res.on('finish', function () {
            // let dt = dateTime.create();
            // let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
            // common.updateCron(inputs, cron_name, cron_id, function (result) {
            //   if (result.error) {
            //     mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            //   }
            // })
        });
    }
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}

exports.updatePricing = async (req, res) => {
    // for (const product of req.body.rows) {
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
            if (result.error) {
                // store user error log
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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        try {
                                            await updatePricing(req.body, fby_id)
                                            await shopifyController.updateProductImageswithVarient(shopifyAccount, req.body, cron_name, cron_id);

                                        } catch (error) {
                                            console.log(error.message);
                                        }
                                    } catch (error) {
                                        console.log(error.message);
                                    }

                                }
                                else {
                                    //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                                    set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                                    if (!res.headersSent) {
                                        res.send(set_response);
                                    }
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
                                console.log("Hello");
                            }, 25000);
                        }
                    })
                }
            }
        });
        res.on('finish', function () {
            // let dt = dateTime.create();
            // let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
            // common.updateCron(inputs, cron_name, cron_id, function (result) {
            //   if (result.error) {
            //     mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            //   }
            // })
        });
    }
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}

exports.updateVarient = async (req, res) => {
    // for (const product of req.body.rows) {
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
            if (result.error) {
                // store user error log
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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        try {
                                            await shopifyController.updateProductImageswithVarient(shopifyAccount, req.body, cron_name, cron_id);
                                            return updateShopifyInventory(req.body, shopifyAccount, cron_name, cron_id)

                                        } catch (error) {
                                            console.log(error.message);
                                        }
                                    } catch (error) {
                                        console.log(error.message);
                                    }

                                }
                                else {
                                    //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                                    set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                                    if (!res.headersSent) {
                                        res.send(set_response);
                                    }
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
                                console.log("Hello");
                            }, 25000);
                        }
                    })
                }
            }
        });
        res.on('finish', function () {
            // let dt = dateTime.create();
            // let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
            // common.updateCron(inputs, cron_name, cron_id, function (result) {
            //   if (result.error) {
            //     mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            //   }
            // })
        });
    }
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}


const createShopifyProductWithVarientFromDigiConnector = async (product, shopifyAccount, fby_id, cron_name, cron_id) => {
    try {
        let ownerCode = shopifyAccount.owner_code;
        let groupCode = shopifyAccount.group_code;

        if (product !== undefined && product.length > 0) {
            for await (const item of product) {
                let img = constants.DEFAULT_SHOPIFY_IMAGE;
                if (item.images_src != undefined && item.images_src != null) {
                    img = item.images_src;
                }
                let fby_user_id = fby_id;
                let domain = shopifyAccount.domain;
                let owner_code = ownerCode;
                let channel = groupCode;
                let sku = item.sku;
                let barcode = item.barcode || '';
                let item_id = 0;
                let title = item.title;
                let item_product_id = 0;
                let inventory_item_id = 0;
                let inventory_quantity = item.quantity || 0;
                let image = item.images_src;//img;
                let imageOrder = item.image_position || 0;

                let price = item.compare_at_price || 0;
                let specialPrice = item.price || 0;
                let location_id = 0;
                let skufamily = '';
                if (item?.sku) {
                    skufamily = item?.sku;
                } else {
                    skufamily = item?.sku;
                }
                let description = item.body_html != undefined && item.body_html != null ? item.body_html : '';
                let inputs = [fby_user_id, channel, domain, owner_code, skufamily, barcode, item_id, title, item_product_id, inventory_item_id, -1, inventory_quantity, image, price, cron_name, cron_id, location_id
                    , description
                ];
                //console.log('product---   ',inputs);
                await helpers.sleep();
                await common.addCreateProduct(inputs, fby_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });
                let varient = item.variants;
                for await (const varientItem of varient) {
                    inputs = [
                        fby_user_id, channel, domain, owner_code, varientItem.sku, varientItem.barcode, item_id, title, item_product_id, inventory_item_id,
                        -1, varientItem.quantity, '', varientItem.price, cron_name, cron_id, location_id
                        , description
                    ];
                    await common.addCreateProductVariant(inputs, fby_id, cron_name, cron_id, async function (result) {
                        if (result.error) {
                            //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                        }
                    });
                }

                let insImg = [image, item.sku, item.sku, fby_id, null, imageOrder];
                //console.log('images---   ',insImg);
                await common.addImages(insImg, fby_id, cron_name, cron_id, function (result) {
                    if (result.error) {
                        logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(insImg));
                    }
                });

            }
        }
    }
    catch (error) {
        console.log(error.message);
        //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY}: \n`, error.message);

    }
};

exports.pushShopifyProduct = async (req, res) => {
    // for (const product of req.body.rows) {
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";
    let sku = req.query.sku;
    let isUpdate = req.query.isUpdate || 'no';

    try {

        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
            if (result.error) {
                // store user error log
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

                            //send response
                            if (!res.headersSent) {
                                res.send(result.error);
                            }
                        } else {
                            let set_response = {};
                            if (result.success.data.length > 0) {
                                /* Shopify account loop start */
                                for (const shopifyAccount of result.success.data) {
                                    /**for each shopifyAccount
                                     * get product details from product table having same 'FBY_id' and 'domain' which were get from shopify channel table
                                    */
                                    if (shopifyAccount.productPublish == 1) {

                                        try {
                                            //asynchronous function for updating shopify inventory
                                            try {
                                                await createProductShopifyFromDigiConnector(req.body, shopifyAccount, fby_id, cron_name, cron_id)
                                                await shopifyController.createProduct(shopifyAccount, sku, isUpdate);
                                                //await shopifyController.pushImagesShopify(req, res);

                                            } catch (error) {
                                                console.log(error.message);
                                            }
                                        } catch (error) {
                                            console.log(error.message);
                                        }

                                    }
                                    else {
                                        //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                                        set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                                        if (!res.headersSent) {
                                            res.send(set_response);
                                        }
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
                                }, 25000);
                            } else {
                                await createProductShopifyFromDigiConnector(req.body, shopifyAccount, fby_id, cron_name, cron_id)
                                let set_response = {};
                                res.send(set_response);
                            }
                        }
                    })
                }
            }
        });
        res.on('finish', function () {
            // let dt = dateTime.create();
            // let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
            // common.updateCron(inputs, cron_name, cron_id, function (result) {
            //   if (result.error) {
            //     mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            //   }
            // })
        });
    }
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}

exports.pushShopifyProductInBulk = async (req, res) => {
    // for (const product of req.body.rows) {
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
            if (result.error) {
                // store user error log
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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        try {
                                            await createProductShopifyFromDigiConnector(req.body, shopifyAccount, fby_id, cron_name, cron_id)
                                            await shopifyController.createShopifyProduct(req, res);
                                            //await shopifyController.pushImagesShopify(req, res);

                                        } catch (error) {
                                            console.log(error.message);
                                        }
                                    } catch (error) {
                                        console.log(error.message);
                                    }

                                }
                                else {
                                    //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                                    set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                                    if (!res.headersSent) {
                                        res.send(set_response);
                                    }
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
                                console.log("Hello");
                            }, 25000);
                        }
                    })
                }
            }
        });
        res.on('finish', function () {
            // let dt = dateTime.create();
            // let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
            // common.updateCron(inputs, cron_name, cron_id, function (result) {
            //   if (result.error) {
            //     mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            //   }
            // })
        });
    }
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}


exports.pushTrackingInBulk = async (req, res) => {
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
            if (result.error) {
                // store user error log
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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        try {
                                            await createTrackingFromDigiConnector(req.body, fby_id, cron_name, cron_id)
                                            await shopifyController.pushTrackShopify(req, res);
                                        } catch (error) {
                                            console.log(error.message);
                                        }
                                    } catch (error) {
                                        console.log(error.message);
                                    }

                                }
                                else {
                                    //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                                    set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                                    if (!res.headersSent) {
                                        res.send(set_response);
                                    }
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
                                console.log("Hello");
                            }, 25000);
                        }
                    })
                }
            }
        });
        res.on('finish', function () {
            // let dt = dateTime.create();
            // let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
            // common.updateCron(inputs, cron_name, cron_id, function (result) {
            //   if (result.error) {
            //     mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            //   }
            // })
        });
    }
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}



exports.pushShopifyProductVarientInBulk = async (req, res) => {
    // for (const product of req.body.rows) {
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
            if (result.error) {
                // store user error log
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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        try {
                                            await createShopifyProductVarientFromDigiConnector(req.body, shopifyAccount, fby_id, cron_name, cron_id)
                                            await shopifyController.createShopifyVarientInBulk(req, res);
                                            //await shopifyController.pushImagesShopify(req, res);

                                        } catch (error) {
                                            console.log(error.message);
                                        }
                                    } catch (error) {
                                        console.log(error.message);
                                    }

                                }
                                else {
                                    //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                                    set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                                    if (!res.headersSent) {
                                        res.send(set_response);
                                    }
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
                                console.log("Hello");
                            }, 25000);
                        }
                    })
                }
            }
        });
        res.on('finish', function () {
            // let dt = dateTime.create();
            // let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
            // common.updateCron(inputs, cron_name, cron_id, function (result) {
            //   if (result.error) {
            //     mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            //   }
            // })
        });
    }
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}


const createShopifyProductVarientFromDigiConnector = async (product, shopifyAccount, fby_id, cron_name, cron_id) => {
    try {
        let ownerCode = shopifyAccount.owner_code;
        let groupCode = shopifyAccount.group_code;

        if (product !== undefined && product.length > 0) {
            for await (const item of product) {
                let img = constants.DEFAULT_SHOPIFY_IMAGE;
                if (item.images_src != undefined && item.images_src != null) {
                    img = item.images_src;
                }
                let fby_user_id = fby_id;
                let domain = shopifyAccount.domain;
                let owner_code = ownerCode;
                let channel = groupCode;
                let sku = item.sku;
                let barcode = item.barcode || '';
                let item_id = 0;
                let title = item.title;
                let item_product_id = 0;
                let inventory_item_id = 0;
                let inventory_quantity = item.quantity;
                let image = item.image_link;//img;
                let imageOrder = item.image_position || 0;
                let product_type = item.product_type || 'Test Product';
                let price = item.price || 0;
                let specialPrice = item.price || 0;
                let location_id = 0;
                let skufamiy = '';
                if (item?.skuFamily) {
                    skufamiy = item?.skuFamily;
                } else {
                    skufamiy = item?.sku;
                }
                let description = item.body_html != undefined && item.body_html != null ? item.body_html : '';

                let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, -1, inventory_quantity, image, price, cron_name, cron_id, location_id
                    , description
                ];
                await helpers.sleep();
                await common.addCreateProduct(inputs, fby_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}`, JSON.stringify(inputs));
                    }
                });


                let weight_unit = item.weight_unit || '';
                let weight_value = item.weight || '';
                let dimensions_unit = item.dimensions_units || '';
                let dimensions_width = item.width || '';
                let dimensions_height = item.height || '';
                let dimensions_length = item.length || '';
                let tag = item.tags;
                let category = item.category;
                let asin = item.asin || '';
                let brand = item.brand || '';
                inputs = [fby_user_id, sku, product_type, brand, weight_unit, weight_value, dimensions_unit, dimensions_width, dimensions_height, dimensions_length, tag, category, asin];
                await common.addProductUnits(inputs, fby_id, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductType fby_user_id: ${fby_id}, sku${sku}`, JSON.stringify(inputs));
                    }
                });

                let insImg = [image, sku, skufamiy, fby_user_id, null, 0];
                //console.log('images---   ',insImg);
                await common.addImages(insImg, fby_user_id, cron_name, cron_id, function (result) {
                    if (result.error) {
                        logger.logError(`getProductsFby fby_user_id: ${fby_user_id}, sku${sku}, ${url}`, JSON.stringify(insImg));
                    }
                });
                inputs = [
                    fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_quantity,
                    -1, inventory_quantity, image, price, cron_name, cron_id, location_id
                    , description
                ];
                await common.addCreateProductVariant(inputs, fby_user_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });

                inputs = [fby_user_id, sku, sku];
                await common.addSkuFamily(inputs, fby_user_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });

                inputs = [fby_user_id, sku, item.option_1_name, item.option_1_value, item.option_2_name, item.option_2_value];
                common.addProductOptions(inputs, fby_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductType fby_user_id: ${fby_id}, sku: ${sku}`, JSON.stringify(inputs));
                    }
                });

            }
        }
    }
    catch (error) {
        console.log(error.message);
        //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY}: \n`, error.message);

    }
};


const createShopifyInventaryFromDigiConnector = async (product, shopifyAccount, fby_id, cron_name, cron_id) => {
    try {
        let ownerCode = shopifyAccount.owner_code;
        let groupCode = shopifyAccount.group_code;

        if (product !== undefined && product.length > 0) {
            for await (const item of product) {

                let fby_user_id = fby_id;
                let domain = shopifyAccount.domain;
                let owner_code = ownerCode;
                let channel = groupCode;
                let inventory_quantity = item.inventory_quantity;
                let sku = item?.sku || '';

                //console.log('product---   ',inputs);
                await common.getCreateProductVariantBySku(sku, async function (result) {
                    if (result.error) {

                    } else {
                        let product = result.success.data[0];
                        let inputs = [
                            fby_user_id, channel, domain, owner_code, sku, product.barcode, product.item_id, product.title, product.item_product_id, inventory_quantity,
                            -1, inventory_quantity, product.image, product.price, product.cron_name, product.cron_id, product.location_id
                            , product.description
                        ];
                        await common.addCreateProductVariant(inputs, fby_user_id, cron_name, cron_id, async function (result) {
                            if (result.error) {
                                //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                            }
                        });
                    }
                });

            }
        }
    }
    catch (error) {
        console.log(error.message);
        //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY}: \n`, error.message);

    }
};


const createProductShopifyFromDigiConnector = async (productData, shopifyAccount, fby_id, cron_name, cron_id) => {
    try {
        let ownerCode = shopifyAccount.owner_code;
        let groupCode = shopifyAccount.group_code;

        if (productData !== undefined && productData.length > 0) {
            for await (const item of productData) {
                const productFields = item.newProduct.fields;
                // Extract relevant product fields
                const {
                    title,
                    tags,
                    brand,
                    weight,
                    dimensions,
                    short_description,
                    categories,
                    price,
                    quantity,
                    sku,
                    barcode,
                    asin,
                } = productFields;

                let fby_user_id = fby_id;
                let domain = shopifyAccount.domain;
                let owner_code = ownerCode;
                let channel = groupCode;
                let item_id = 0;
                let item_product_id = 0;
                let inventory_item_id = 0;
                let inventory_quantity = parseInt(quantity) || 0;

                let image = item.newProduct.photos[0] || constants.DEFAULT_SHOPIFY_IMAGE
                let location_id = 0;
                let description = short_description;
                let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, -1, inventory_quantity, image, price, cron_name, cron_id, location_id
                    , description
                ];
                await helpers.sleep();
                await common.addCreateProduct(inputs, fby_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}`, JSON.stringify(inputs));
                    }
                });

                let product_type = item.product_type || 'Test Product';
                let weight_unit = weight.unit || '';
                let weight_value = weight.value || '';
                let dimensions_unit = dimensions.unit || '';
                let dimensions_width = dimensions.width || '';
                let dimensions_height = dimensions.height || '';
                let dimensions_length = dimensions.length || '';
                let tag = tags[0];
                let category = categories[0];
                inputs = [fby_user_id, sku, product_type, brand, weight_unit, weight_value, dimensions_unit, dimensions_width, dimensions_height, dimensions_length, tag, category, asin];
                await common.addProductUnits(inputs, fby_id, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductType fby_user_id: ${fby_id}, sku${sku}`, JSON.stringify(inputs));
                    }
                });

                for await (const photo of item.newProduct.photos) {
                    let insImg = [photo, sku, sku, fby_user_id, null, 0];
                    //console.log('images---   ',insImg);
                    await common.addImages(insImg, fby_user_id, cron_name, cron_id, function (result) {
                        if (result.error) {
                            logger.logError(`getProductsFby fby_user_id: ${fby_user_id}, sku${sku}, ${url}`, JSON.stringify(insImg));
                        }
                    });
                }
                let skuFamily = sku;

                const option1 = item.newProduct.options[0];
                const option2 = item.newProduct.options[1];
                let optionCombination = []
                option1.values.forEach(option1Value => {
                    option2.values.forEach(option2Value => {
                        optionCombination.push([
                            option1.name,
                            option1Value,
                            option2.name,
                            option2Value
                        ])
                    });
                });
                let count = 0;
                for await (const variant of item.newProduct.variants) {
                    const { price, sku, quantity, barcode, title } = variant;
                    inputs = [
                        fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_quantity,
                        -1, quantity, image, price, cron_name, cron_id, location_id
                        , description
                    ];
                    await common.addCreateProductVariant(inputs, fby_user_id, cron_name, cron_id, async function (result) {
                        if (result.error) {
                            //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                        }
                    });
                    inputs = [fby_user_id, sku, skuFamily];
                    await common.addSkuFamily(inputs, fby_user_id, cron_name, cron_id, async function (result) {
                        if (result.error) {
                            //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                        }
                    });
                    inputs = [fby_user_id, sku].concat(optionCombination[count]);
                    count++;
                    common.addProductOptions(inputs, fby_id, cron_name, cron_id, async function (result) {
                        if (result.error) {
                            logger.logError(`getProductType fby_user_id: ${fby_id}, sku: ${sku}`, JSON.stringify(inputs));
                        }
                    });
                }
            }
        }
    }
    catch (error) {
        console.log(error.message);
        //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY}: \n`, error.message);

    }
};


const createTrackingFromDigiConnector = async (items, fby_id, cron_name, cron_id) => {
    try {

        for (let item of items) {
            try {

                let traking = "";
                let shipmentDate = "";
                let carrier = "";
                let ship_url = "";
                let isReturn = "";
                //console.log(`\n${counter} ) getTrackList, fby_user_id:${fby_id}, url: ${constants.FBY_NOTIFY_ORDER_URL}, params: ${paramsJson}\nOrder To Notify : \n`, JSON.stringify(item));


                traking = item.tracking;
                shipmentDate = item.shipmentDate;
                carrier = item.carrier;
                ship_url = item.url;
                isReturn = item.isReturn;

                let updt_time = dateTime.create();

                try {
                    let order_no = item.channelOrderId;
                    let sku = item.skuCode != undefined ? item.skuCode : "";
                    let logMessage = `fby_user_id: ${fby_id}, ${cron_name}`;
                    if (order_no != '') {
                        logMessage = `${logMessage}, order_no: ${order_no}`

                    }
                    if (sku != '') {
                        logMessage = `${logMessage}, sku: ${sku}`

                    }


                    //   await logger.LogForAlert(
                    //     fby_id,
                    //     order_no,
                    //     sku,
                    //     logMessage,
                    //     item,
                    //     constants.LOG_LEVEL.INFO,
                    //     fby_alert_code,
                    //     cron_name,
                    //     cron_id
                    //   );
                } catch (error) {
                    console.log(error);

                }

                let item_arr = [
                    cron_name,
                    cron_id,
                    updt_time.format('Y-m-d H:M:S'),
                    traking,
                    carrier,
                    ship_url,
                    item.channelOrderId,
                    item.channelCode,
                    item.skuEan,
                    item.skuCode != undefined ? item.skuCode : ""
                ];


                // update order Track Number

                await common.updateOrder(item_arr, fby_id, cron_name, cron_id, function (result) {
                    if (result.error) {
                        //console.log(`\n${counter} ) getTrackList, fby_user_id:${fby_id}, url: ${constants.FBY_NOTIFY_ORDER_URL}, params: ${paramsJson}\nOrder To Notify : \n`, JSON.stringify(item));
                        //console.log('\n ERROR: ', JSON.stringify(result.error));
                    }
                })

                let order = {
                    fby_user_id: fby_id,
                    order_no: item.channelOrderId,
                    sku: item.skuCode,
                    barcode: item.skuEan,
                    order_line_item_id: null,
                    original_Channel_OrderId: item.originalChannelOrderId
                }
                //if (order.order_no == '5588716093784' || order.order_no ==5590845161816) {
                await fbyService.changeOrderStatus(null, order, cron_id, cron_name, cron_id);
                //}
            }
            catch (error) {
                //console.log(`\nERROR:${error.message}}\nWHILE ${counter} )getTrackList, fby_user_id:${fby_id}, url: ${constants.FBY_NOTIFY_ORDER_URL}, params: ${paramsJson}\nOrder To Notify : \n`, JSON.stringify(item));

                //console.log('\n ERROR: ',);
            }
        }
    }
    catch (error) {
        console.log(error.message);
        //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY}: \n`, error.message);

    }
};


const updatePricing = async (product, fby_id) => {
    try {

        if (product !== undefined && product.length > 0) {
            for await (const item of product) {

                let fby_user_id = fby_id;
                let sku = item.sku;
                let price = item.price || 0;
                let specialPrice = item.price || 0;

                await helpers.sleep();
                let inputs = [fby_user_id, price, specialPrice, sku];
                await common.updatePrices(inputs, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductPricesFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });

            }
        }
    }
    catch (error) {
        console.log(error.message);
        //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY}: \n`, error.message);

    }
}


exports.updateShopifyInventoryInBulk = async (req, res) => {
    // for (const product of req.body.rows) {
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
            if (result.error) {
                // store user error log
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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        try {
                                            await createShopifyInventaryFromDigiConnector(req.body, shopifyAccount, fby_id, cron_name, cron_id)
                                            await updateShopifyInventory(req.body, shopifyAccount, cron_name, cron_id);

                                        } catch (error) {
                                            console.log(error.message);
                                        }
                                    } catch (error) {
                                        console.log(error.message);
                                    }

                                }
                                else {
                                    //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                                    set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                                    if (!res.headersSent) {
                                        res.send(set_response);
                                    }
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
                                console.log("Hello");
                            }, 25000);
                        }
                    })
                }
            }
        });
        res.on('finish', function () {
            // let dt = dateTime.create();
            // let inputs = [dt.format('Y-m-d H:M:S'), cron_id]
            // common.updateCron(inputs, cron_name, cron_id, function (result) {
            //   if (result.error) {
            //     mail.cronProcessErrMail(cron_name, cron_id, req.query.fby_user_id, JSON.stringify(result.error));
            //   }
            // })
        });
    }
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}

const updateShopifyInventory = async function (productDetails, client, cron_name, cron_id) {
    let fby_user_id = client.fby_user_id;
    const set_response = {};
    try {
        productDetails.forEach(async (item) => {
            await common.getCreatedProductVarientIDBySku(item.sku, async function (product) {
                if (product.error) {

                }
                else {

                    product = product.success.data[0];
                    let url = `${client.domain}admin/api/2023-04/inventory_levels/set.json`;
                    let locationId = product.location_id;
                    let options = {
                        method: "post",
                        uri: url,
                        headers: {
                            "Content-Type": "application/json",
                            'X-Shopify-Access-Token': `${client.token}`
                        },
                        body:
                            { "location_id": locationId, "inventory_item_id": product.inventory_item_id, "available": item.inventory_quantity || item.quantity },

                        json: true,
                    };

                    await request(options)
                        .then(async (parsedBody) => {
                            console.log('post image res parsedBody: ', parsedBody);
                            //insert products got from shopify into products table

                            await common.getCreatedProductVarientIDBySku(item.sku, async function (product) {
                                if (product.error) {

                                } else {
                                    let prod = product.success.data[0];
                                    let inputs = [prod.fby_user_id, prod.channel, prod.domain, prod.owner_code, prod.sku, prod.barcode, prod.item_id, prod.title, prod.item_product_id, prod.inventory_item_id, prod.inventory_quantity, parsedBody.inventory_level.available, prod.image, prod.price, prod.cron_name, prod.cron_id, prod.location_id
                                        , prod.description
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
            });

        })         // //console.log('imageOrder: ', imageOrder);

        return set_response;
    }
    catch (error) {
        console.log('\n ERROR: ', error.message);
    }

}


exports.deleteShopifyProduct = async (req, res) => {
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        common.userDetail(req.query.fby_user_id, cron_name, cron_id, function (result) {
            if (result.error) {
                // store user error log
                //send response
                if (!res.headersSent) {
                    res.send(result.error);
                }
            } else {
                for (const client of result.success.data) {
                    let fby_id = client.fby_user_id;
                    //get shopify account detail
                    common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                        if (result.error) {

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
                                await common.getCreatedProductIDBySku(req.query.sku, async function (product) {
                                    if (product.error) {

                                    } else {
                                        if (product.success.data.length > 0) {
                                            await deleteShopifyProduct(product.success.data[0], shopifyAccount, cron_name, cron_id)
                                                .then((params) => {
                                                    set_response[req.query.sku] = "Successfully deleted sku";
                                                    res.send(set_response);
                                                    console.log();
                                                })
                                        }

                                    }
                                })

                                await common.getCreatedProductVarientIDBySku(req.body.sku, async function (variant) {
                                    if (variant.error) {

                                    } else {
                                        if (variant.success.data.length > 0) {
                                            await deleteShopifyProductVariant(variant.success.data[0], shopifyAccount, cron_name, cron_id)
                                                .then((params) => {
                                                    set_response[req.body.sku] = "Successfully deleted sku";
                                                    res.send(set_response);
                                                    console.log();
                                                })
                                        }
                                    }
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
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}

exports.pushWoocommerceProduct = async (req, res) => {
    // for (const product of req.body.rows) {
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        common.userDetail(req.query.fby_user_id, cron_name, cron_id, function (result) {
            if (result.error) {
                // store user error log
                //send response
                if (!res.headersSent) {
                    res.send(result.error);
                }
            } else {
                for (const client of result.success.data) {
                    let fby_id = client.fby_user_id;
                    //get shopify account detail
                    common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                        if (result.error) {

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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        try {
                                            createProductWoocommerceFromDigiConnector(req.body, shopifyAccount, fby_id, cron_name, cron_id)
                                                .then((params) => {
                                                    // if (Object.keys(params).length > 0) {
                                                    //   set_response[shopifyAccount.domain] = (params);
                                                    // }
                                                })
                                        } catch (error) {
                                            console.log(error.message);
                                        }
                                        await common.getCreateProductByDomain(shopifyAccount, "domain", cron_name, cron_id, async function (result) {
                                            if (result.error) {
                                                // store get product error log
                                                return false;
                                            } else {
                                                //asynchronous function for updating shopify inventory
                                                await createProductWoocommerce(result.success.data, shopifyAccount, cron_name, cron_id)




                                            }
                                        })
                                    } catch (error) {
                                        console.log(error.message);
                                    }

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
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}


const deleteShopifyProduct = async (product, client) => {
    const url = `${client.domain}/admin/api/2023-07/products/${product.item_product_id}.json`;
    const options = {
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
            await common.deleteProducts(
                product.sku,
                client.fby_user_id,
                function (result) {
                    //do nothing
                    logger.logError(`Product Deleted`, JSON.stringify(result));
                });

            //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nResult: \n${JSON.stringify(parsedBody)}`);
        })
        .catch((err) => {
            //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nERROR: ${err.message}`);
            console.log("delete failed", + err.message);
        });
}


const deleteShopifyProductVariant = async (variant, client) => {
    const url = `${client.domain}admin/api/2023-04/products/${variant.item_product_id}/variants/${variant.item_id}.json`
    const options = {
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
            await common.deleteProducts(
                variant.sku,
                client.fby_user_id,
                function (result) {
                    //do nothing
                    logger.logError(`Product Deleted`, JSON.stringify(result));
                });

            //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nResult: \n${JSON.stringify(parsedBody)}`);
        })
        .catch((err) => {
            //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nERROR: ${err.message}`);
            console.log("delete failed", + err.message);
        });
}

const createProductWoocommerceFromDigiConnector = async (product, shopifyAccount, fby_id, cron_name, cron_id, callback) => {
    try {

        let set_response = {};
        let page = 1;
        let total_page = 0;
        let count = 1;

        let ownerCode = shopifyAccount.owner_code;
        let groupCode = shopifyAccount.group_code;
        let item_per_page = constants.FBY_PERPAGE;
        let items = [];

        if (product !== undefined && product.length > 0) {
            product.forEach(async (item) => {
                let img = constants.DEFAULT_SHOPIFY_IMAGE;
                if (item.images_src != undefined && item.images_src != null) {
                    img = item.images_src;
                }
                let fby_user_id = fby_id;
                let domain = shopifyAccount.domain;
                let owner_code = ownerCode;
                let channel = groupCode;
                let sku = item.sku;
                let barcode = item.barcode;
                let item_id = 0;
                let title = item.name;
                let item_product_id = 0;
                let inventory_item_id = 0;
                let inventory_quantity = item.quantity;
                let image = item.images_src;//img;
                let imageOrder = item.image_position;

                let price = item.price;
                let specialPrice = item.specialPrice;
                let location_id = 0;
                let description = item.description != undefined && item.description != null ? item.description : '';
                let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, -1, inventory_quantity, image, specialPrice, cron_name, cron_id, location_id
                    , description
                ];
                //console.log('product---   ',inputs);
                await common.addCreateProduct(inputs, fby_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });

                inputs = [
                    fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id,
                    -1, inventory_quantity, '', price, cron_name, cron_id, location_id
                    , description
                ];
                await common.addCreateProductVariant(inputs, fby_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });
                let insImg = [image, item.sku, item.sku, fby_id, null, imageOrder];
                //console.log('images---   ',insImg);
                await common.addImages(insImg, fby_id, cron_name, cron_id, function (result) {
                    if (result.error) {
                        logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(insImg));
                    }
                });
                inputs = [fby_user_id, price, specialPrice, sku];
                await common.updatePrices(inputs, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductPricesFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });
            });
        }

        return set_response;
    }
    catch (error) {
        console.log(error.message);
        //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY}: \n`, error.message);

    }
};

exports.deleteWocommerceProduct = async (req, res) => {
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        common.userDetail(req.query.fby_user_id, cron_name, cron_id, function (result) {
            if (result.error) {
                // store user error log
                //send response
                if (!res.headersSent) {
                    res.send(result.error);
                }
            } else {
                for (const client of result.success.data) {
                    let fby_id = client.fby_user_id;
                    //get shopify account detail
                    common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                        if (result.error) {

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
                                await common.getCreatedProductIDBySku(req.body.sku, async function (product) {
                                    if (product.error) {

                                    } else {
                                        await deleteWocommerceProduct(product.success.data[0], shopifyAccount, cron_name, cron_id)
                                            .then((params) => {
                                                // if (Object.keys(params).length > 0) {
                                                //   set_response[shopifyAccount.domain] = (params);
                                                // }
                                                console.log();
                                            })
                                    }
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
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}

const deleteWocommerceProduct = async (product, client) => {
    const url = `${client.domain}/wp-json/wc/v3/products/${product.item_product_id}`;
    const options = {
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
            common.deleteProducts(
                product.sku,
                client.fby_user_id,
                function (result) {
                    //do nothing
                    logger.logError(`Product Deleted`, JSON.stringify(result));
                });

            //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nResult: \n${JSON.stringify(parsedBody)}`);
        })
        .catch((err) => {
            //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nERROR: ${err.message}`);
        });
}


exports.pushMagentoProduct = async (req, res) => {
    // for (const product of req.body.rows) {
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        common.userDetail(req.query.fby_user_id, cron_name, cron_id, function (result) {
            if (result.error) {
                // store user error log
                //send response
                if (!res.headersSent) {
                    res.send(result.error);
                }
            } else {
                for (const client of result.success.data) {
                    let fby_id = client.fby_user_id;
                    //get shopify account detail
                    common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                        if (result.error) {

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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        try {
                                            createProductMagentoFromDigiConnector(req.body, shopifyAccount, fby_id, cron_name, cron_id)
                                                .then((params) => {
                                                    // if (Object.keys(params).length > 0) {
                                                    //   set_response[shopifyAccount.domain] = (params);
                                                    // }
                                                })
                                        } catch (error) {
                                            console.log(error.message);
                                        }
                                        await common.getCreateProductByDomain(shopifyAccount, "domain", cron_name, cron_id, async function (result) {
                                            if (result.error) {
                                                // store get product error log
                                                return false;
                                            } else {
                                                //asynchronous function for updating shopify inventory
                                                await createProductMagento(result.success.data, shopifyAccount, cron_name, cron_id)
                                                    .then((params) => {
                                                        // if (Object.keys(params).length > 0) {
                                                        //   set_response[shopifyAccount.domain] = (params);
                                                        // }
                                                    })

                                            }
                                        })
                                    } catch (error) {
                                        console.log(error.message);
                                    }

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
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}


const createProductMagentoFromDigiConnector = async (product, shopifyAccount, fby_id, cron_name, cron_id, callback) => {
    try {

        let set_response = {};
        let page = 1;
        let total_page = 0;
        let count = 1;

        let ownerCode = shopifyAccount.owner_code;
        let groupCode = shopifyAccount.group_code;
        let item_per_page = constants.FBY_PERPAGE;
        let items = [];

        if (product !== undefined && product.length > 0) {
            product.forEach(async (item) => {
                let img = constants.DEFAULT_SHOPIFY_IMAGE;
                if (item.images_src != undefined && item.images_src != null) {
                    img = item.images_src;
                }
                let fby_user_id = fby_id;
                let domain = shopifyAccount.domain;
                let owner_code = ownerCode;
                let channel = groupCode;
                let sku = item.sku;
                let barcode = item.barcode;
                let item_id = 0;
                let title = item.name;
                let item_product_id = 0;
                let inventory_item_id = 0;
                let inventory_quantity = item.quantity;
                let image = item.images_src;//img;
                let imageOrder = item.image_position;

                let price = item.price;
                let specialPrice = item.specialPrice;
                let location_id = 0;
                let description = item.description != undefined && item.description != null ? item.description : '';
                let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, -1, inventory_quantity, image, specialPrice, cron_name, cron_id, location_id
                    , description
                ];
                //console.log('product---   ',inputs);
                await common.addCreateProduct(inputs, fby_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });

                inputs = [
                    fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id,
                    -1, inventory_quantity, '', price, cron_name, cron_id, location_id
                    , description
                ];
                await common.addCreateProductVariant(inputs, fby_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });
                let insImg = [image, item.sku, item.sku, fby_id, null, imageOrder];
                //console.log('images---   ',insImg);
                await common.addImages(insImg, fby_id, cron_name, cron_id, function (result) {
                    if (result.error) {
                        logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(insImg));
                    }
                });
                inputs = [fby_user_id, price, sku];
                await common.updatePrices(inputs, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductPricesFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });
            });
        }

        return set_response;
    }
    catch (error) {
        console.log(error.message);
        //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY}: \n`, error.message);

    }
};



exports.pushPrestashopProduct = async (req, res) => {
    // for (const product of req.body.rows) {
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        common.userDetail(req.query.fby_user_id, cron_name, cron_id, function (result) {
            if (result.error) {
                // store user error log
                //send response
                if (!res.headersSent) {
                    res.send(result.error);
                }
            } else {
                for (const client of result.success.data) {
                    let fby_id = client.fby_user_id;
                    //get shopify account detail
                    common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                        if (result.error) {

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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        try {
                                            createProductPrestashopFromDigiConnector(req.body, shopifyAccount, fby_id, cron_name, cron_id)
                                                .then((params) => {
                                                    // if (Object.keys(params).length > 0) {
                                                    //   set_response[shopifyAccount.domain] = (params);
                                                    // }
                                                })
                                        } catch (error) {
                                            console.log(error.message);
                                        }
                                        await common.getCreateProductByDomain(shopifyAccount, "domain", cron_name, cron_id, async function (result) {
                                            if (result.error) {
                                                // store get product error log
                                                return false;
                                            } else {
                                                //asynchronous function for updating shopify inventory
                                                await prestashopController.createProductPrestashop(result.success.data, shopifyAccount, cron_name, cron_id)
                                                    .then((params) => {
                                                        // if (Object.keys(params).length > 0) {
                                                        //   set_response[shopifyAccount.domain] = (params);
                                                        // }
                                                    })

                                            }
                                        })
                                    } catch (error) {
                                        console.log(error.message);
                                    }

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
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}



const createProductPrestashopFromDigiConnector = async (product, shopifyAccount, fby_id, cron_name, cron_id, callback) => {
    try {

        let set_response = {};
        let page = 1;
        let total_page = 0;
        let count = 1;

        let ownerCode = shopifyAccount.owner_code;
        let groupCode = shopifyAccount.group_code;
        let item_per_page = constants.FBY_PERPAGE;
        let items = [];

        if (product !== undefined && product.length > 0) {
            product.forEach(async (item) => {
                let img = constants.DEFAULT_SHOPIFY_IMAGE;
                if (item.images_src != undefined && item.images_src != null) {
                    img = item.images_src;
                }
                let fby_user_id = fby_id;
                let domain = shopifyAccount.domain;
                let owner_code = ownerCode;
                let channel = groupCode;
                let sku = item.sku;
                let barcode = item.barcode;
                let item_id = 0;
                let title = item.name;
                let item_product_id = 0;
                let inventory_item_id = 0;
                let inventory_quantity = item.quantity;
                let image = item.images_src;//img;
                let imageOrder = item.image_position;

                let price = item.price;
                let specialPrice = item.specialPrice;
                let location_id = 0;
                let description = item.description != undefined && item.description != null ? item.description : '';
                let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, -1, inventory_quantity, image, specialPrice, cron_name, cron_id, location_id
                    , description
                ];
                //console.log('product---   ',inputs);
                await common.addCreateProduct(inputs, fby_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });

                inputs = [
                    fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id,
                    -1, inventory_quantity, '', price, cron_name, cron_id, location_id
                    , description
                ];
                await common.addCreateProductVariant(inputs, fby_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });
                let insImg = [image, item.sku, item.sku, fby_id, null, imageOrder];
                //console.log('images---   ',insImg);
                await common.addImages(insImg, fby_id, cron_name, cron_id, function (result) {
                    if (result.error) {
                        logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(insImg));
                    }
                });
                inputs = [fby_user_id, price, sku];
                await common.updatePrices(inputs, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductPricesFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });
            });
        }

        return set_response;
    }
    catch (error) {
        console.log(error.message);
        //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY}: \n`, error.message);

    }
};


exports.pushStoredenProduct = async (req, res) => {
    // for (const product of req.body.rows) {
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        common.userDetail(req.query.fby_user_id, cron_name, cron_id, function (result) {
            if (result.error) {
                // store user error log
                //send response
                if (!res.headersSent) {
                    res.send(result.error);
                }
            } else {
                for (const client of result.success.data) {
                    let fby_id = client.fby_user_id;
                    //get shopify account detail
                    common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                        if (result.error) {

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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        try {
                                            createProductStoredenFromDigiConnector(req.body, shopifyAccount, fby_id, cron_name, cron_id)
                                                .then((params) => {
                                                    // if (Object.keys(params).length > 0) {
                                                    //   set_response[shopifyAccount.domain] = (params);
                                                    // }
                                                })
                                        } catch (error) {
                                            console.log(error.message);
                                        }
                                        await common.getCreateProductByDomain(shopifyAccount, "domain", cron_name, cron_id, async function (result) {
                                            if (result.error) {
                                                // store get product error log
                                                return false;
                                            } else {
                                                //asynchronous function for updating shopify inventory
                                                await storedenController.sendProductsStoreden(result.success.data, shopifyAccount, cron_name, cron_id)
                                                    .then((params) => {
                                                        // if (Object.keys(params).length > 0) {
                                                        //   set_response[shopifyAccount.domain] = (params);
                                                        // }
                                                    })

                                            }
                                        })
                                    } catch (error) {
                                        console.log(error.message);
                                    }

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
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}



const createProductStoredenFromDigiConnector = async (product, shopifyAccount, fby_id, cron_name, cron_id, callback) => {
    try {

        let set_response = {};
        let page = 1;
        let total_page = 0;
        let count = 1;

        let ownerCode = shopifyAccount.owner_code;
        let groupCode = shopifyAccount.group_code;
        let item_per_page = constants.FBY_PERPAGE;
        let items = [];

        if (product !== undefined && product.length > 0) {
            product.forEach(async (item) => {
                let img = constants.DEFAULT_SHOPIFY_IMAGE;
                if (item.images_src != undefined && item.images_src != null) {
                    img = item.images_src;
                }
                let fby_user_id = fby_id;
                let domain = shopifyAccount.domain;
                let owner_code = ownerCode;
                let channel = groupCode;
                let sku = item.sku;
                let barcode = item.barcode;
                let item_id = 0;
                let title = item.name;
                let item_product_id = 0;
                let inventory_item_id = 0;
                let inventory_quantity = item.quantity;
                let image = item.images_src;//img;
                let imageOrder = item.image_position;

                let price = item.price;
                let specialPrice = item.specialPrice;
                let location_id = 0;
                let description = item.description != undefined && item.description != null ? item.description : '';
                let inputs = [fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id, -1, inventory_quantity, image, specialPrice, cron_name, cron_id, location_id
                    , description
                ];
                //console.log('product---   ',inputs);
                await common.addCreateProduct(inputs, fby_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });

                inputs = [
                    fby_user_id, channel, domain, owner_code, sku, barcode, item_id, title, item_product_id, inventory_item_id,
                    -1, inventory_quantity, '', price, cron_name, cron_id, location_id
                    , description
                ];
                await common.addCreateProductVariant(inputs, fby_id, cron_name, cron_id, async function (result) {
                    if (result.error) {
                        //console.log(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });
                let insImg = [image, item.sku, item.sku, fby_id, null, imageOrder];
                //console.log('images---   ',insImg);
                await common.addImages(insImg, fby_id, cron_name, cron_id, function (result) {
                    if (result.error) {
                        logger.logError(`getProductsFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(insImg));
                    }
                });
                inputs = [fby_user_id, price, sku];
                await common.updatePrices(inputs, async function (result) {
                    if (result.error) {
                        logger.logError(`getProductPricesFby fby_user_id: ${fby_id}, sku${sku}, ${url}`, JSON.stringify(inputs));
                    }
                });
            });
        }

        return set_response;
    }
    catch (error) {
        console.log(error.message);
        //console.log(`\nERROR ${constants.CC_OPERATIONS.GET_PRODUCT_FROM_FBY}: \n`, error.message);

    }
};




exports.deleteStoredenProduct = async (req, res) => {
    let file_and_method_name = 'shopifyController.js createProductsShopify';
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        common.userDetail(req.query.fby_user_id, cron_name, cron_id, function (result) {
            if (result.error) {
                // store user error log
                //send response
                if (!res.headersSent) {
                    res.send(result.error);
                }
            } else {
                for (const client of result.success.data) {
                    let fby_id = client.fby_user_id;
                    //get shopify account detail
                    common.shopifyUserDetail(fby_id, cron_name, cron_id, async function (result) {
                        if (result.error) {

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
                                await common.getCreatedProductIDBySku(req.body.sku, async function (product) {
                                    if (product.error) {

                                    } else {
                                        await deleteStoredenProduct(product.success.data[0], shopifyAccount, cron_name, cron_id)
                                            .then((params) => {
                                                // if (Object.keys(params).length > 0) {
                                                //   set_response[shopifyAccount.domain] = (params);
                                                // }
                                                console.log();
                                            })
                                    }
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
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}

const deleteStoredenProduct = async (product, client) => {
    const url = `${client.domain}/products/product.json`;
    const options = {
        method: "delete",
        uri: url,
        headers: {
            "Content-Type": "application/json",
            'X-Shopify-Access-Token': `${client.token}`
        },
        body:
            { "uid": product.item_product_id },
        json: true,
    };
    await request(options)
        .then(async (parsedBody) => {
            common.deleteProducts(
                product.sku,
                client.fby_user_id,
                function (result) {
                    //do nothing
                    logger.logError(`Product Deleted`, JSON.stringify(result));
                });

            //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nResult: \n${JSON.stringify(parsedBody)}`);
        })
        .catch((err) => {
            //console.log(`\n${logMsg}\n${JSON.stringify(options)}\nERROR: ${err.message}`);
        });
}

exports.assignBinNumber = async (req, res) => {
    console.log("It is working")
    let fby_user_id = req.query.fby_user_id;
    const { barcode, bin_number, order_no, order_line_item_id, status } = req.body;
    const input = [fby_user_id, barcode, bin_number, order_no, order_line_item_id, status];
    await common.assignBin(input, function (result) {
        if (result.error) {
            logger.logError(`assignBinNumber fby_user_id: ${fby_user_id}`, JSON.stringify(input));
        }
    });
    res.status(200).json({ success: true, message: 'Bin assigned successfully' });

}

exports.getBinDetails = async (req, res) => {
    console.log("It is working")
    let fby_user_id = req.query.fby_user_id;
    let order_no = req.query.order_no;
    const input = [fby_user_id, order_no];
    await common.getBin(input, function (result) {
        if (result.error) {
            res.send(result.error);
        } else {

            if (!res.headersSent) {
                res.send(result);
            }
        }
    });

}

exports.markOrderComplete = async (req, res) => {
    console.log("It is also workings")
    const { order_no, status } = req.body;
    let fby_user_id = req.query.fby_user_id;
    const input = [fby_user_id, order_no, status];
    await common.markOrderComplete(input, function (result) {
        if (result.error) {
            logger.logError(`assignBinNumber fby_user_id: ${fby_user_id}`, JSON.stringify(input));
        }
    });
    res.status(200).json({ success: true, message: 'Order marked as complete' });

}

exports.createShopifyOrder = async (req, res) => {
    let cron_id = "";
    let fby_user_id = req.query.fby_user_id;
    let cron_name = "";

    try {

        await common.userDetail(req.query.fby_user_id, cron_name, cron_id, async function (result) {
            if (result.error) {
                // store user error log
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

                                    try {
                                        //asynchronous function for updating shopify inventory
                                        try {
                                            await shopifyController.createShopifyOrder(fby_user_id, req.body);

                                        } catch (error) {
                                            console.log(error.message);
                                        }
                                    } catch (error) {
                                        console.log(error.message);
                                    }

                                }
                                else {
                                    //console.log('\n shopifyController.js--> createProductsShopify--> PRODUCT_PUBLISH_MSG: ', constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG);
                                    set_response[shopifyAccount.domain] = constants.CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG;
                                    if (!res.headersSent) {
                                        res.send(set_response);
                                    }
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
                                console.log("Hello");
                            }, 25000);
                        }
                    })
                }
            }
        });
        res.on('finish', function () {
        });
    }
    catch (error) {
        //console.log('\n ERROR: ', JSON.stringify(error.message));
    }
}
exports.updateShopifyInventory = updateShopifyInventory;