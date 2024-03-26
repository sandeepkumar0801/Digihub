require('dotenv').config();

exports.check_env = () => {

    const vars = [
        "DB_HOST",
        "DB_USER",
        "DB_PASSWORD",
        "ENV",
        "BASE_URL",
        "JWT_KEY",
        "DECRYPTION_KEY",
        "DB_DATABASE",
        "IP",
        "SMTP_USER", //SMTP_USER
        "MAIL_TO",
        "SMTP_PASSWORD", //SMTP_PASS
        "SMTP_HOST",
        "SMTP_PORT",

        "GET_SHOPIFY_PRODUCTS",
        "GET_SHOPIFY_LOCATION",
        "SEND_PRODUCT_FBY",
        "GET_FBY_STOCK",
        "PUSH_STOCK_SHOPIFY",
        "ERROR_MANAGE",
        "FBY_APIS",
        "GET_SHOPIFY_ORDERS",
        "SEND_CANCELLED_ORDERS",
        "SEND_ORDER_FBY",
        "GET_TRACK_NUMBER",
        "PUSH_TRACK_SHOPIFY",

        "FBY_URL",
        "STOREDEN_URL",

        "DEFAULT_PRODUCT_LOCATION_ID",

        "GET_PRESTA_PRODUCTS",
        "PUSH_STOCK_PRESTA",
        "GET_PRESTA_ORDERS",
        "PUSH_TRACK_PRESTA",

        "IS_SEND_PRODUCT_TO_FBY",
        "IS_LOG_INTO_DB",
        "IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY",

        "GET_WOOCOMMERCE_PRODUCTS",
        "PUSH_STOCK_WOOCOMMERCE",
        "GET_WOOCOMMERCE_ORDERS",
        "PUSH_TRACK_WOOCOMMERCE",

        "GET_EBAY_PRODUCTS",
        "PUSH_STOCK_EBAY",
        "GET_EBAY_ORDERS",
        "PUSH_TRACK_EBAY",

        "GET_MIRAKL_PRODUCTS",
        "GET_MIRAKL_CARRIERS",
        "PUSH_STOCK_MIRAKL",
        "GET_MIRAKL_ORDERS",
        "PUSH_TRACK_MIRAKL",

        "GET_PRODUCTS_FROM_FBY_TIMER",
        "GET_PRODUCTS_PRICE_FROM_FBY_TIMER",
        "PUSH_PRODUCTS_TO_SHOPIFY_TIMER",
        "PUSH_PRODUCTS_IMAGES_TO_SHOPIFY_TIMER",
        "PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER",
        "UPDATE_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER",

        "GET_AMAZON_PRODUCTS",
        "PUSH_STOCK_AMAZON",
        "GET_AMAZON_ORDERS",
        "PUSH_TRACK_AMAZON",

        "IS_MOCK",

        "AZURE_STORAGE_CONNECTION_STRING",
        "AMAZON_ORDERS_CONTAINER",
        "IS_INFO_LOGGING",
        "MONGO_URL"
        
    ];
    vars.forEach(varName => {

        if (!process.env[varName]) {
            console.error(`ENVIRONMENT ERROR: ${varName} is not defined.`);
            if (varName == 'MONGO_URL') {
                process.env[varName] = '';
            }
            else {
                process.exit(1);
            }
        }

    });

    if (process.env.ENV == "PROD")
    {
        process.env.IS_SEND_PRODUCT_TO_FBY = 0;
        console.log('IS_SEND_PRODUCT_TO_FBY: ', process.env.IS_SEND_PRODUCT_TO_FBY);
    }

};
exports.FBY_URL = process.env.FBY_URL;
exports.FBY_URL = process.env.STOREDEN_URL;
exports.BASE_URL = process.env.BASE_URL;
exports.ENV = process.env.ENV;
exports.DB_HOST = process.env.DB_HOST;
exports.DB_USER = process.env.DB_USER;
exports.DB_PASSWORD = process.env.DB_PASSWORD;
exports.DB_DATABASE = process.env.DB_DATABASE;
exports.JWT_KEY = process.env.JWT_KEY;
exports.DECRYPTION_KEY = process.env.DECRYPTION_KEY;
exports.IP = process.env.IP;
exports.PORT = process.env.PORT;
exports.SMTP_USER = process.env.SMTP_USER;
exports.MAIL_TO = process.env.MAIL_TO;
exports.SMTP_PASSWORD = process.env.SMTP_PASSWORD;
exports.SMTP_HOST = process.env.SMTP_HOST;
exports.SMTP_PORT = process.env.SMTP_PORT;

exports.GET_SHOPIFY_PRODUCTS = process.env.GET_SHOPIFY_PRODUCTS;
exports.GET_SHOPIFY_LOCATION = process.env.GET_SHOPIFY_LOCATION;
exports.SEND_PRODUCT_FBY = process.env.SEND_PRODUCT_FBY;
exports.GET_FBY_STOCK = process.env.GET_FBY_STOCK;
exports.PUSH_STOCK_SHOPIFY = process.env.PUSH_STOCK_SHOPIFY;
exports.ERROR_MANAGE = process.env.ERROR_MANAGE;
exports.FBY_APIS = process.env.FBY_APIS;
exports.GET_SHOPIFY_ORDERS = process.env.GET_SHOPIFY_ORDERS;
exports.SEND_CANCELLED_ORDERS = process.env.SEND_CANCELLED_ORDERS;
exports.SEND_ORDER_FBY = process.env.SEND_ORDER_FBY;
exports.GET_TRACK_NUMBER = process.env.GET_TRACK_NUMBER;
exports.PUSH_TRACK_SHOPIFY = process.env.PUSH_TRACK_SHOPIFY;
exports.GET_STOREDEN_ORDERS = process.env.GET_STOREDEN_ORDERS;
exports.GET_STOREDEN_PRODUCTS = process.env.GET_STOREDEN_PRODUCTS;
exports.PUSH_STOCK_STOREDEN = process.env.PUSH_STOCK_STOREDEN;

//#region Default values
exports.DEFAULT_PRODUCT_LOCATION_ID = process.env.DEFAULT_PRODUCT_LOCATION_ID;
exports.IS_SEND_PRODUCT_TO_FBY = process.env.IS_SEND_PRODUCT_TO_FBY;
exports.IS_LOG_INTO_DB = process.env.IS_LOG_INTO_DB;
exports.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY = process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY;

//#endregion



exports.GET_PRESTA_PRODUCTS = process.env.GET_PRESTA_PRODUCTS;
exports.PUSH_STOCK_PRESTA = process.env.PUSH_STOCK_PRESTA;
exports.GET_PRESTA_ORDERS = process.env.GET_PRESTA_ORDERS;
exports.PUSH_TRACK_PRESTA = process.env.PUSH_TRACK_PRESTA;

exports.GET_WOOCOMMERCE_PRODUCTS = process.env.GET_WOOCOMMERCE_PRODUCTS;
exports.PUSH_STOCK_WOOCOMMERCE = process.env.PUSH_STOCK_WOOCOMMERCE;
exports.GET_WOOCOMMERCE_ORDERS = process.env.GET_WOOCOMMERCE_ORDERS;
exports.PUSH_TRACK_WOOCOMMERCE = process.env.PUSH_TRACK_WOOCOMMERCE;

exports.GET_MAGENTO_ORDERS = process.env.GET_MAGENTO_ORDERS;
exports.GET_MAGENTO_PRODUCTS = process.env.GET_MAGENTO_PRODUCTS;
exports.PUSH_STOCK_MAGENTO= process.env.PUSH_STOCK_MAGENTO;
exports.PUSH_TRACK_MAGENTO = process.env.PUSH_TRACK_MAGENTO;

//Ebay
exports.GET_EBAY_PRODUCTS = process.env.GET_EBAY_PRODUCTS;
exports.PUSH_STOCK_EBAY = process.env.PUSH_STOCK_EBAY;
exports.GET_EBAY_ORDERS = process.env.GET_EBAY_ORDERS;
exports.PUSH_TRACK_EBAY = process.env.PUSH_TRACK_EBAY;

//MIRAKL
exports.GET_MIRAKL_PRODUCTS = process.env.GET_MIRAKL_PRODUCTS;
exports.GET_MIRAKL_CARRIERS = process.env.GET_MIRAKL_CARRIERS;
exports.PUSH_STOCK_MIRAKL = process.env.PUSH_STOCK_MIRAKL;
exports.GET_MIRAKL_ORDERS = process.env.GET_MIRAKL_ORDERS;
exports.PUSH_TRACK_MIRAKL = process.env.PUSH_TRACK_MIRAKL;

//Product and price sync from FBY 
exports.GET_PRODUCTS_FROM_FBY_TIMER = process.env.GET_PRODUCTS_FROM_FBY_TIMER;
exports.GET_PRODUCTS_PRICE_FROM_FBY_TIMER = process.env.GET_PRODUCTS_PRICE_FROM_FBY_TIMER;
exports.PUSH_PRODUCTS_TO_SHOPIFY_TIMER = process.env.PUSH_PRODUCTS_TO_SHOPIFY_TIMER;
exports.PUSH_PRODUCTS_IMAGES_TO_SHOPIFY_TIMER = process.env.PUSH_PRODUCTS_IMAGES_TO_SHOPIFY_TIMER;
exports.PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER = process.env.PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER;
exports.UPDATE_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER = process.env.UPDATE_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER;

//AMAZON
exports.GET_AMAZON_PRODUCTS = process.env.GET_AMAZON_PRODUCTS;
exports.PUSH_STOCK_AMAZON = process.env.PUSH_STOCK_AMAZON;
exports.GET_AMAZON_ORDERS = process.env.GET_AMAZON_ORDERS;
exports.PUSH_TRACK_AMAZON = process.env.PUSH_TRACK_AMAZON;

exports.IS_MOCK = process.env.IS_MOCK;

exports.AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
exports.AMAZON_ORDERS_CONTAINER = process.env.AMAZON_ORDERS_CONTAINER;
exports.IS_INFO_LOGGING = process.env.IS_INFO_LOGGING;
exports.MONGO_URL = process.env.MONGO_URL;

