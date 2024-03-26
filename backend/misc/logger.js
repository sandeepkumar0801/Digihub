"use strict";

const winston = require('winston');
const { createLogger, format, transports, config } = require('winston');
const { SqlTransport } = require('winston-sql-transport');
const db_constants = require("./db_constants");
const server_constants = require("../server/constants/constants");
const db = require('../startup/db');
const dbCCLogs = require('../startup/dbcclogs');
const { v4: uuidv4 } = require('uuid');
const uuid = uuidv4;
const moment = require("moment");
const MOMENT_DATE_FORMAT_DAY = "YYYY-MM-DD";
const MAX_LOG_FILE_SIZE = 100 * 1024 * 1024;
const MAX_LOG_FILE_COUNTS = 50;
const CircularJSON = require('circular-json');

//https://www.npmjs.com/package/winston-sql-transport
//https://www.datadoghq.com/blog/node-logging-best-practices/#incorporate-the-right-levels-for-your-logs



/*//Create table on start if it does not exists
(async () => {
    const transport = new SqlTransport(transportConfig);
    await transport.init();
})();
*/
exports.logInfo = async (message, data = {}) => {

    // let operationId = uuid();
    // let IS_LOG_INTO_DB = process.env.IS_LOG_INTO_DB == 1 || process.env.IS_LOG_INTO_DB == "1";
    // let dataJson = "";
    // try {

    //     if (typeof data === 'object') {


    //         dataJson = CircularJSON.stringify(data);
    //     }
    //     else {
    //         dataJson = data;
    //     }
    //     //console.log('dataJson: ', dataJson);


    //     if (IS_LOG_INTO_DB) {

    //         if (dataJson.length > 65500) {
    //             //console.log('logInfo data length > 65500: ', dataJson);
    //         }
    //         else {
    //             setTimeout(() => {
    //                 db.execute(
    //                     db_constants.DB_CONSTANTS_WINSTON_LOGS.POST,
    //                     [
    //                         'info',
    //                         message,
    //                         dataJson,
    //                         data.request !== undefined && data.request.operationId !== undefined ? data.request.operationId : operationId
    //                     ]
    //                 );
    //             }, 3000);
    //         }

    //     }


    //     /*baseUrl
    //     const transportConfig = {
    //         client: 'mysql',
    //         connection: {
    //             user: process.env.DB_USER,
    //             password: process.env.DB_PASSWORD,
    //             server: process.env.DB_HOST,
    //             database: db_constants.DB.DBNAME,
    //         },
    //         tableName: db_constants.DB.TABLES.WINSTON_INFO_LOGS,
    //         //fields: {operationId: 'operationId', level: 'mylevel', meta: 'metadata', message: 'source', timestamp: 'addDate'}
    //     };
    //     */
    //     var now_date = moment();
    //     now_date = now_date.format(MOMENT_DATE_FORMAT_DAY);

    //     const transportsOptions = [
    //         //new SqlTransport(transportConfig),
    //         //new transports.Console(),
    //         new winston.transports.File({
    //             filename: `logs/info_${now_date}.log`,
    //             level: 'info',
    //             maxsize: MAX_LOG_FILE_SIZE,
    //             maxFiles: MAX_LOG_FILE_COUNTS
    //         }).on('error', function (err) {
    //             console.error(err.stack);
    //         })

    //     ];

    //     const logger = winston.createLogger({
    //         format: winston.format.prettyPrint(),
    //         transports: transportsOptions,
    //         exitOnError: false
    //     });



    //     logger.log({
    //         level: 'info',
    //         message: message,
    //         operationId: data.request !== undefined && data.request.operationId !== undefined ? data.request.operationId : operationId,
    //         ...dataJson,
    //     });

    //     //*/

    // } catch (error) {
    //     //console.log('logInfo catch error: ', error);

    // }

};

exports.logError = async (errorMessage, data = null, level = "INFO") => {

    let operationId = uuid();
    var now_date = moment();
    now_date = now_date.format(MOMENT_DATE_FORMAT_DAY);
    let IS_LOG_INTO_DB = process.env.IS_LOG_INTO_DB == 1 || process.env.IS_LOG_INTO_DB == "1";
    let dataJson = "";
    try {
        if (typeof data === 'object') {

            dataJson = CircularJSON.stringify(data);
        }
        else {
            dataJson = data;
        }
        //console.log("\n");
        //console.log('Message: ', errorMessage);
        //console.log('DataJson: ', dataJson);

        // dataJson = "";

        /*
        const transportConfig = {
            client: 'mysql',
            connection: {
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                server: process.env.DB_HOST,
                database: db_constants.DB.DBNAME,
            },
            tableName: db_constants.DB.TABLES.WINSTON_INFO_LOGS,
        };

        const transportsOptions = [
            //new SqlTransport(transportConfig),
            //new transports.Console(),
            new winston.transports.File({
                filename: `logs/errors_${now_date}.log`,
                level: 'error',
                maxsize: MAX_LOG_FILE_SIZE,
                maxFiles: MAX_LOG_FILE_COUNTS
            }).on('error', function (err) {
                console.error(err.stack);
            })
        ];

        const logger = winston.createLogger({
            format: winston.format.json(),
            transports: transportsOptions,
            exitOnError: false
        });
        //*/

        // if (IS_LOG_INTO_DB && errorMessage.includes("getProducts fby_user_id")) {

        // if (errorMessage.includes("NOT Status Noftified") || errorMessage.includes("ETIMEDOUT")) {
        //     if (dataJson.length > 65500) {
        //         // //console.log('logError data length > 65500: ', dataJson);
        //     }
        //     else {
        //         setTimeout(() => {
        //             let msgData = "";

        //             try {
        //                 msgData = data != null && data.request !== undefined && data.request.operationId !== undefined ? data.request.operationId : operationId || "";
        //             }
        //             catch (err) {
        //                 //console.log('looger.logInfo : ', JSON.stringify(err.message));

        //             }

        //             //if ((dataJson.includes("fby_user_id") || dataJson.includes("fby_id")) && dataJson.includes("27")) {
        //             db.execute(
        //                 db_constants.DB_CONSTANTS_WINSTON_LOGS.POST,
        //                 [
        //                     level,
        //                     errorMessage || "",
        //                     dataJson || "",
        //                     msgData
        //                 ]
        //             );
        //             // }
        //             // else {
        //             //     //console.log('\nError: \n Not for 27 so not logging into DB');

        //             // }
        //         }, 3000);
        //     }
        // }


        // logger.error({
        //     level: 'error',
        //     message: errorMessage,
        //     operationId: data.request !== undefined && data.request.operationId !== undefined ? data.request.operationId : operationId,
        //     ...dataJson,
        // });


    } catch (error) {
        //console.log('logError catch error: ', error);

    }

};



exports.LogForAlert = async (
    in_fby_user_id,
    in_order_no,
    in_sku,
    in_message,      //ErrorMessage
    in_data,         //DataJson 
    in_level,        //ERROR
    in_codes,        //FBY_ALERT_CODES
    in_operation,    //CC operations
    in_operation_id,  //Operation-GUID
    is_create_alert_on_fby = true

) => {

    this.LogForAlertAsync(
        in_fby_user_id,
        in_order_no,
        in_sku,
        in_message,      //ErrorMessage
        in_data,         //DataJson 
        in_level,        //ERROR
        in_codes,        //FBY_ALERT_CODES
        in_operation,    //CC operations
        in_operation_id,  //Operation-GUID
        is_create_alert_on_fby
    );
};


exports.LogForAlertAsync = async (
    in_fby_user_id,
    in_order_no,
    in_sku,
    in_message,      //ErrorMessage
    in_data,         //DataJson 
    in_level,        //ERROR
    in_codes,        //FBY_ALERT_CODES
    in_operation,    //CC operations
    in_operation_id,  //Operation-GUID
    is_create_alert_on_fby = true

) => {
    try {


        // Only in_level = 'ERROR' will be considered to create alert on FBY yocabe system
        // do not create alert on FBY for CC internal errors

        //if (!is_create_alert_on_fby) {
        //in_level = server_constants.LOG_LEVEL.INFO;
        //}

        /* call example
        await logger.LogForAlert(
            1002,
            "Order-12345",
            "SKU-123456",
            "Order Sync Failed-Message",
            "Order Sync Failed-data",
            "ERROR",
            "ORDER",
            "PUSH_ORDER_TO_FBY",
            "operationId-12345"
        );
    
        await fbyService.insertAlertCCLogs(1002);
        //------------------------------------------------------------
    
        FBY_ALERT_CODES: {
            ADDRESS: "ADDRESS",
            BATCH: "BATCH",
            CONFIGURATION: "CONFIGURATION",
            EXPORT: "EXPORT",
            IUPITER: "IUPITER",
            IMPORT: "IMPORT",
            MISSING: "MISSING",
            MISSING_CONFIGURATION: "MISSING_CONFIGURATION",
            NOTIFY: "NOTIFY",
            ORDER_CANCEL: "RETURNED",
            ORDER_DOCUMENTS: "ORDER DOCUMENTS",
            ORDER_REFUND: "REFUND",
            ORDER_SYNC: "ORDER",
            ORDER_TRAKING: "SHIPMENT",
            STOCK_SYNC: "STOCK",
            UNKNOWN: "UNKNOWN",
            UPDATE: "UPDATE",
        },
    
        FBY_ALERT_DOMAIN: {
            
            IUPITER: "Iupiter"
            
        },
    
        CC_OPERATIONS: {
            GET_PRODUCT_FROM_CHANNEL: "GET_PRODUCT_FROM_CHANNEL",
            GET_PRODUCT_LOCATION_FROM_CHANNEL: "GET_PRODUCT_LOCATION_FROM_CHANNEL",
            GET_STOCK_FROM_FBY: "GET_STOCK_FROM_FBY",
            PUSH_STOCK_TO_CHANNEL: "PUSH_STOCK_TO_CHANNEL",
            PUSH_PRODUCTS_TO_FBY: "PUSH_PRODUCTS_TO_FBY",
    
            GET_ORDER_FROM_CHANNEL: "GET_ORDER_FROM_CHANNEL",
            PUSH_ORDER_TO_FBY: "PUSH_ORDER_TO_FBY",
            PUSH_CANCELLED_ORDER_TO_FBY: "PUSH_CANCELLED_ORDER_TO_FBY",
            GET_TRAKING_FROM_FBY: "GET_TRAKING_FROM_FBY",
            PUSH_TRAKING_TO_CHANNEL: "PUSH_TRAKING_TO_CHANNEL",
            PUSH_TRAKING_NOTIFICATION_TO_FBY: "PUSH_TRAKING_NOTIFICATION_TO_FBY",
            FBY_ALERT_INSERT: "FBY_ALERT_INSERT",
    
    
        }
        */
        let operationId = uuid();
        var now_date = moment();
        now_date = now_date.format(MOMENT_DATE_FORMAT_DAY);
        let dataJson = "";


        if (typeof in_data === 'object') {

            dataJson = CircularJSON.stringify(in_data);
            if (in_data.request != undefined && in_data.request.operationId != undefined && in_data.request.operationId != "" && in_data.request.operationId != null) {
                operationId = in_data.request.operationId;
            }
        }
        else {
            dataJson = in_data;
        }

        if (dataJson && dataJson != "") {
            dataJson = dataJson.replace(/\r?\n|\r/g, "");
            dataJson = dataJson.trim();
        }


        if (dataJson.length > 65500) {
            dataJson = dataJson.substring(0, 10000);
        }
        if (in_operation_id == undefined || in_operation_id == null || in_operation_id == "") {
            in_operation_id = operationId;
        }

        try {
            if (in_fby_user_id > 0
                && in_codes != "" && in_codes != null
            ) {

                try {
                    let jsonMessgae = JSON.stringify(in_message).toLowerCase();
                    if (

                        jsonMessgae.includes('exceeded 2 calls') ||
                        (jsonMessgae.includes('404') && jsonMessgae.includes('not found'))
                    ) {
                        in_level = server_constants.LOG_LEVEL.INFO;
                    }
                    if (jsonMessgae.includes("this payment method requires a payment date.")
                        || dataJson.toLowerCase().includes("this payment method requires a payment date.")
                    ) {
                        in_level = server_constants.LOG_LEVEL.ERROR;
                    }

                }
                catch (err) {
                    //console.log('\nlogger.ccLogs : \n', JSON.stringify(err.message), '\n', in_message);
                }

                if (in_level == server_constants.LOG_LEVEL.ERROR) {
                    //console.log(`\nLogForAlert: ${in_message}\n${dataJson}`);
                }

                let inputs = [
                    in_fby_user_id || 0,
                    in_order_no == '0' ? '' : (in_order_no || ''),
                    in_sku || '',
                    (typeof in_message === 'object') ? JSON.stringify(in_message) : (in_message || ''),
                    (typeof dataJson === 'object') ? JSON.stringify(dataJson) : (dataJson || ''),
                    in_level || '',
                    in_codes || '',
                    in_operation || '',
                    in_operation_id || ''
                ];

                try {
                    inputs[4] = JSON.parse(inputs[4]);      //DataJson 
                    inputs[3] = JSON.parse(inputs[3]);      //ErrorMessage
                }
                catch (error) {
                }

                await dbCCLogs.executeCCLogs(
                    db_constants.DB_CONSTANTS_CCLOGS.POST,
                    inputs
                );
            }
        }
        catch (error) {
            //console.log(`\nERROR While LogForAlert ${error.message}: \n`);

        }

    } catch (error) {
        //console.log(`\nERROR While LogForAlert ${error.message}: \n`);

    }

};
