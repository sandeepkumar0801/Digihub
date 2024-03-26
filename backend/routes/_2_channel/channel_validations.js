const helpers = require('../../misc/helpers');
const RxJS = require('rxjs');
const Joi = require('joi');
const constants = require("../../misc/constants");

/*
{
   "action":"insert",
   "ownerCode":"TEST",
   "channel":{
      "id":23,
      "name":"Pricy IT",
      "code":"PRICY",
      "isEnabled":true,
      "groupCode":"PREU",
      "currencyCode":"EUR",
      "credentials":{
         "username":"",
         "password":"d3e2c4b2bd21e1db54a3035c5582218dZKiv+xYhNRQZCdj2Ir\/iuw==",
         "secret":"",
         "token":"",
         "domain":"myDomain.com",
         "apiKey":"myApiKey"
      }
   }
}

*/
exports.channelValidationPOST = (req, res) => {

    let joiSchema = new Joi.object();
    let customError = {};
    customError.details = [];
    let isBodyRequired = false;

    try {

        if (req.body.action == 'insert'
            || req.body.action == 'update'
        ) {
            isBodyRequired = true;
        }
        else if (req.body.action == 'get'

            || req.body.action == 'delete') {
            isBodyRequired = false;

        }
        else {
            let detail = {
                message: "\"action\" must be one of [get, insert, update, delete]"
            };
            customError.details.push(detail);
        }

        if (isBodyRequired && req.body.channel === undefined) {

            let detail = {
                message: "Request body missing requestbody.channel object."
            };
            customError.details.push(detail);
        }
        else if (isBodyRequired && req.body.channel.credentials === undefined) {

            let detail = {
                message: "Request body missing requestbody.channel.credentials object."
            };
            customError.details.push(detail);

        }
        else if (isBodyRequired && (req.body.channel.credentials.domain === undefined
            || req.body.channel.credentials.domain == null
            || req.body.channel.credentials.domain == ""
        )) {

            let detail = {
                message: "Request body missing requestbody.channel.credentials.domain object."
            };
            customError.details.push(detail);

        }

        if (customError.details.length == 0) {
            switch (req.body.action) {
                case constants.ACTION.INSERT:
                case constants.ACTION.UPDATE:
                    {
                        //Shopify request body validation 
                        // if (isBodyRequired && req.body.channel.credentials.domain.includes("shopify") == true) {
                        joiSchema = Joi.object({
                            action: Joi.string().valid('get', 'insert', 'update', 'delete').required(),
                            ownerCode: Joi.string().required(),
                            channel: {
                                id: Joi.number().required(),
                                platformName: Joi.string().required(),
                                platformCode: Joi.string().required(),
                                name: Joi.string().required(),
                                code: Joi.string().required(),
                                isEnabled: Joi.boolean().required(),
                                groupCode: Joi.string().required(),
                                currencyCode: Joi.string().required(),
                                orderSyncStartDate: Joi.string().allow(null).allow('').optional(),
                                credentials: {
                                    username: Joi.string().allow(null).allow('').optional(),
                                    password: Joi.string().allow(null).allow('').optional(),
                                    secret: Joi.string().allow(null).allow('').optional(),
                                    token: Joi.string().allow(null).allow('').optional(),
                                    domain: Joi.string().allow(null).required(),
                                    apiKey: Joi.string().allow(null).allow('').optional(),
                                    warehouseLocationId: Joi.string().allow(null).allow('').optional(),
                                    ebay: Joi.object({
                                        compatibilityLevel: Joi.string().allow('').optional(),
                                        devId: Joi.string().allow(null).allow('').optional(),
                                        appId: Joi.string().allow(null).allow('').optional(),
                                        certId: Joi.string().allow(null).allow('').optional(),
                                        siteId: Joi.string().allow(null).allow('').optional(),
                                    }).allow(null).optional(),

                                    amazon_sp_api: Joi.object({
                                        accessKey: Joi.string().allow(null).allow('').optional(),
                                        secretKey: Joi.string().allow(null).allow('').optional(),
                                        roleArn: Joi.string().allow(null).allow('').optional(),
                                        clientId: Joi.string().allow(null).allow('').optional(),
                                        clientSecret: Joi.string().allow(null).allow('').optional(),
                                        refreshToken: Joi.string().allow(null).allow('').optional(),
                                        marketPlaceId: Joi.string().allow(null).allow('').optional(),
                                        sellerId: Joi.string().allow(null).allow('').optional(),
                                        region: Joi.string().allow(null).allow('').optional(),
                                    }).allow(null).optional(),

                                },
                                services: Joi.object({
                                    stockUpdate: Joi.boolean().optional(),
                                    priceUpdate: Joi.boolean().optional(),
                                    orderSync: Joi.boolean().optional(),
                                    productPublish: Joi.boolean().optional(),
                                }).allow(null).optional(),
                            },
                        });
                        // }
                        // else
                        // {
                        //     let detail = {
                        //         message: "Only shopify implemented so far."
                        //     };
                        //     customError.details.push(detail);

                        // }

                        break;
                    }


                default:
                    {
                        joiSchema = Joi.object({
                            action: Joi.string().valid('get', 'insert', 'update', 'delete').required(),
                            ownerCode: Joi.string().allow('').optional(),
                            channel: {
                                id: Joi.number().required(),
                                platformName: Joi.string().allow(null).allow('').optional(),
                                platformCode: Joi.string().allow(null).allow('').optional(),
                                name: Joi.string().allow(null).allow('').optional(),
                                code: Joi.string().allow(null).allow('').optional(),
                                isEnabled: Joi.boolean().allow(null).allow('').optional(),
                                groupCode: Joi.string().allow(null).allow('').optional(),
                                currencyCode: Joi.string().allow(null).allow('').optional(),
                                orderSyncStartDate: Joi.string().allow(null).allow('').optional(),
                                credentials: {
                                    username: Joi.string().allow(null).allow('').optional(),
                                    password: Joi.string().allow(null).allow('').optional(),
                                    secret: Joi.string().allow(null).allow('').optional(),
                                    token: Joi.string().allow(null).allow('').optional(),
                                    domain: Joi.string().allow(null).required(),
                                    apiKey: Joi.string().allow(null).allow('').optional(),
                                    warehouseLocationId: Joi.string().allow(null).allow('').optional(),
                                    ebay: Joi.object({
                                        compatibilityLevel: Joi.string().allow('').optional(),
                                        devId: Joi.string().allow(null).allow('').optional(),
                                        appId: Joi.string().allow(null).allow('').optional(),
                                        certId: Joi.string().allow(null).allow('').optional(),
                                        siteId: Joi.string().allow(null).allow('').optional(),
                                    }).allow(null).optional(),

                                    amazon_sp_api: Joi.object({
                                        accessKey: Joi.string().allow(null).allow('').optional(),
                                        secretKey: Joi.string().allow(null).allow('').optional(),
                                        roleArn: Joi.string().allow(null).allow('').optional(),
                                        clientId: Joi.string().allow(null).allow('').optional(),
                                        clientSecret: Joi.string().allow(null).allow('').optional(),
                                        refreshToken: Joi.string().allow(null).allow('').optional(),
                                        marketPlaceId: Joi.string().allow(null).allow('').optional(),
                                        sellerId: Joi.string().allow(null).allow('').optional(),
                                        region: Joi.string().allow(null).allow('').optional(),
                                    }).allow(null).optional(),

                                },
                                services: Joi.object({
                                    stockUpdate: Joi.boolean().optional(),
                                    priceUpdate: Joi.boolean().optional(),
                                    orderSync: Joi.boolean().optional(),
                                    productPublish: Joi.boolean().optional(),
                                }).allow(null).optional(),
                            },
                        });
                    }
            }
        }


        let { error } = customError.details.length > 0 ?
            {
                error: {
                    details: customError.details
                }
            }

            : joiSchema.validate(req.body);


        RxJS.timer(100)
            .subscribe(() => {

                error && helpers.sendError(
                    res,
                    constants.HTTPSTATUSCODES.BAD_REQUEST,
                    constants.ERRORCODES.VALIDATION_ERROR,
                    error.details[0].message,
                    req.body
                );

            });

        return !error;
    }
    catch (err) {
        console.error(err);
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            err
        );
    }

};