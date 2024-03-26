const mysql = require('mysql2/promise');
const env = require("./env");
const logger = require('../misc/logger');
const proxyMysqlDeadlockRetries = require('node-mysql-deadlock-retries');
const moment = require("moment");
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const Entities = require("../entities/Entities");
// const mongoose = require('mongoose');
const CCLogs = require('../models/CCLogs');
const dbpool = require("./db");

var retries = 5;      	    // How many times will the query be retried when the ER_LOCK_DEADLOCK error occurs
var minMillis = 1000;    	// The minimum amount of milliseconds that the system sleeps before retrying
var maxMillis = 1000;        // The maximum amount of milliseconds100;  	// The maximum amount of milliseconds that the system sleeps before retrying
var debug = 1;		 	    // Show all the debugs on how the proxy is working
var show_all_errors = 1;    // Show all errors that are outside of the proxy
var isExecuting = false;
var requestArray = [];
const MAX_RETRIES = 10;
if (!process.env.MONGO_URL) {
    process.env.MONGO_URL = 'mongodb+srv://Udesh343:Udesh343@cluster0.fzywxm7.mongodb.net/logs'
}

const params = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "cclogs",
    connectionLimit: 40,
    waitForConnections: true,
    queueLimit: 299000,
    connectTimeout: 100000,
    // ssl: {
    //     rejectUnauthorized: false
    // }
};

var poolCCLogs = mysql.createPool(params);
var sharedConnection = null;

exports.getSharedConnection = async () => {
    try {
        if (poolCCLogs == null || poolCCLogs == undefined || poolCCLogs.getConnection == undefined) {
            poolCCLogs = mysql.createPool(params);
        }
        if (sharedConnection == null || sharedConnection == undefined || sharedConnection.execute == undefined) {
            sharedConnection = await poolCCLogs.getConnection();
        }
    }
    catch (error) {
        let errorMessage = error.message;
        if (errorMessage.toLowerCase().includes('add new command when connection is in closed state')
            || errorMessage.toLowerCase().includes('cannot enqueue query after fatal error')
            || errorMessage.toLowerCase().includes('the server closed the connection')
            || errorMessage.toLowerCase().includes('pool is closed')
            || errorMessage.toLowerCase().includes('packets out of order')
            || errorMessage.toLowerCase().includes('read ECONNRESET'.toLowerCase())
        ) {
            await this.resetDbpoolCCLogs();
            sharedConnection = await poolCCLogs.getConnection();
            console.log('\nDB ERROR OCCURED : ', errorMessage);
        }
    }
    return sharedConnection;
};


// exports.getMongoConnection = async () => {
//     try {
//         const connection = await mongoose.connect(process.env.MONGO_URL);
//         //console.log("Successifully connected to the mongodb");
//     }
//     catch (error) {
//         //console.log("Failed to connect to Mongodb");
//     }
// }

// this.getMongoConnection();

exports.resetDbpoolCCLogs = async () => {
    try {
        //await poolCCLogs.end();
        //console.log('\n poolCCLogs.end: not called');
    }
    catch (error) {
        //console.log("poolCCLogs.end reset successful!");
    }
    try {
        poolCCLogs = await mysql.createPool(params);
        //let connection = await poolCCLogs.getConnection();
        //console.log("poolCCLogs reset successful!");
    }
    catch (error) {
        let errorMessage = error.message;
        //console.log(`\n ${errorMessage}`);
        //console.log(error);
    }

};

poolCCLogs.on('connection', function (connection) {
    proxyMysqlDeadlockRetries(connection, retries, minMillis, maxMillis, debug, show_all_errors);
});


exports.executeCCLogs = async (sql_string, param_array, callback, sendRaw = true) => {

    let fby_user_id = 0;
    let isCallback = false;
    let msg = { error: { "fby_user_id": fby_user_id }, success: { data: null } };
    try {
        try {
            isCallback = typeof (callback) == 'function' && callback != undefined && callback != null;
        }
        catch (error) {

        }

        var item = { sql_string, param_array };

        if (/*requestArray.includes(item) == false &&*/
            sql_string != null
            && param_array != null
        ) {
            let loglevel = param_array[5];
            fby_user_id = param_array[0];

            if (fby_user_id == 39) {
                process.env.IS_INFO_LOGGING = 1;
            }

            if (loglevel != "INFO") {
                /*
            if (fby_user_id == 39 || fby_user_id == 40 || fby_user_id == 37 || loglevel != "INFO"
            || fby_user_id == 50
            || fby_user_id == 27
            || fby_user_id == 51
            || fby_user_id == 34
    
            )
            {
            */
                // requestArray.push(item);
                // this.executeCCLogsQueue();
                try {
                    return await dbpool.execute(sql_string, param_array, function (err, result, fields) {

                        msg = { error: null, success: { data: result[0] } };

                        if (err) {
                            msg = { error: { "fby_user_id": fby_user_id, message: err.message }, success: { data: null } };
                        }

                        if (isCallback)
                            return callback(msg);
                        else
                            return msg;
                    });
                } catch (err) {
                    //console.log("Error while storing logs to mysql");
                    msg = { error: { "fby_user_id": fby_user_id, message: err.message }, success: { data: null } };
                    if (isCallback)
                        return callback(null);
                    else
                        return msg;
                }
            }
            // } 
            // #todo ------->>>
            else {
                try {
                    if (fby_user_id > 0) {
                        /*
                        requestArray.push(item);
                        this.executeCCLogsQueue();
                        //this.executeCCLogsQueueV2();
                        */

                        let infoItem = new Entities.CCLogs(
                            item.param_array[0],
                            item.param_array[1],
                            item.param_array[2],
                            item.param_array[3],
                            item.param_array[4],
                            item.param_array[5],
                            item.param_array[6],
                            item.param_array[7],
                            item.param_array[8]
                        );
                        let arrayItems = [];
                        arrayItems.push(infoItem);

                        let retryCounter = 1;
                        let isError = false;
                        let isSucess = false;
                        let table = 'cclogs._logs';
                        let connection = await this.getSharedConnection();
                        while (retryCounter < MAX_RETRIES && infoItem != null
                        ) {
                            try {
                                let keys = Object.keys(infoItem);
                                let values = arrayItems.map(obj => keys.map(key => obj[key]));

                                let sql_string1 = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';


                                await connection.query(sql_string1, [values], function (error, results, fields) {
                                    if (error) {
                                        isSucess = false;
                                        throw error;
                                    }
                                    else {
                                        isSucess = true;
                                    }
                                });
                                isError = false;
                                retryCounter = MAX_RETRIES;
                                isSucess = true;
                            }
                            catch (error) {
                                isError = true;
                                isSucess = false;
                                let errorMessage = error.message;
                                //console.log('\nBulkInsert-executeCCLogs DB Exception');
                                //console.log(errorMessage);

                                let interval = 1 * 1000; // 10 seconds;
                                let promose = new Promise(resolve => setTimeout(resolve, interval));
                                await promose;

                                if (errorMessage.toLowerCase().includes('add new command when connection is in closed state')
                                    || errorMessage.toLowerCase().includes('cannot enqueue query after fatal error')
                                    || errorMessage.toLowerCase().includes('the server closed the connection')
                                    || errorMessage.toLowerCase().includes('pool is closed')
                                    || errorMessage.toLowerCase().includes('packets out of order')
                                    || errorMessage.toLowerCase().includes('read ECONNRESET'.toLowerCase())

                                ) {
                                    await this.resetDbpoolCCLogs();
                                    connection = await this.getSharedConnection();
                                    console.log('\nDB ERROR OCCURED : ', errorMessage);
                                }

                                //console.log(`\n${retryCounter} ) executeCCLogs DB catch error ${sql_string}\n`, errorMessage);
                            }
                            finally {
                                retryCounter++;
                            }
                        }
                    }
                }
                catch (err) {
                    //console.log("\nError while executeCCLogsQueue\n", err.message);
                }

            }
        }

        if (isCallback)
            return callback(null);
        else
            return msg;
    }
    catch (error) {

    }
};

exports.executeCCLogsQueue = async () => {
    // if (requestArray.length < 200) {
    //     return;
    // }
    if (isExecuting) {
        return;
    }
    let sql_string = null;
    let param_array = null;

    try {
        isExecuting = true;
        let batchInfoListDB = [];
        for await (const sqlquery of requestArray) {
            try {
                sql_string = sqlquery.sql_string;
                param_array = sqlquery.param_array;

                if (param_array == undefined || param_array == null) {
                    continue;
                }

                param_array[3] = typeof param_array[3] != 'string' ? JSON.stringify(param_array[3]) : param_array[3];
                param_array[4] = typeof param_array[4] != 'string' ? JSON.stringify(param_array[4]) : param_array[4];

                if (Array.isArray(param_array) && param_array.length == 9) {
                    let infoItem = new Entities.CCLogs(
                        param_array[0],
                        param_array[1],
                        param_array[2],
                        param_array[3],
                        param_array[4],
                        param_array[5],
                        param_array[6],
                        param_array[7],
                        param_array[8]
                    );
                    batchInfoListDB.push(infoItem);
                }
            }
            catch (error) {
                let errorMessage = error.message;
                //console.log('');
                //console.log('error: ', errorMessage);
                //console.log(error);

            }
            finally {
                try {
                    //console.log(`\n${logMessage}\trequestArray.Length: ${requestArray.length}\tRunning dbCCLogs.executeCCLogsQueue`);
                    requestArray.shift();
                }
                catch (error) {
                    //console.log('');
                    //console.log(error.message);
                    //console.log(error);
                }
            }
        } //for loop

        await this.bulkInsert(batchInfoListDB);

    }
    catch (error) {
        //console.log('');
        //console.log(error.message);
        //console.log(error);
    }
    finally {
        isExecuting = false;
    }
};

exports.executeCCLogsQueueV2 = async () => {
    if (requestArray.length < 200) {
        return;
    }
    if (isExecuting) {
        return;
    }
    let param_array = null;

    try {
        isExecuting = true;
        let batchInfoListDB = [];
        for await (const query of requestArray) {
            try {
                param_array = query.param_array;

                if (param_array == undefined || param_array == null) {
                    continue;
                }

                param_array[3] = typeof param_array[3] != 'string' ? JSON.stringify(param_array[3]) : param_array[3];
                param_array[4] = typeof param_array[4] != 'string' ? JSON.stringify(param_array[4]) : param_array[4];

                if (Array.isArray(param_array) && param_array.length == 9) {
                    let infoItem = new Entities.CCLogs(
                        param_array[0],
                        param_array[1],
                        param_array[2],
                        param_array[3],
                        param_array[4],
                        param_array[5],
                        param_array[6],
                        param_array[7],
                        param_array[8]
                    );
                    batchInfoListDB.push(infoItem);
                }
            }
            catch (error) {
                let errorMessage = error.message;
                //console.log('');
                //console.log('error: ', errorMessage);

            }
            finally {
                try {
                    requestArray.shift();
                }
                catch (error) {
                    //console.log('');
                    //console.log(error.message);
                }
            }
        } //for loop

        // await this.bulkInsertV2(batchInfoListDB);

    }
    catch (error) {
        //console.log('');
        //console.log(error.message);
        //console.log(error);
    }
    finally {
        isExecuting = false;
    }
};

exports.bulkInsert = async (param_array) => {
    let isError = false;
    let isSucess = false;
    let table = 'cclogs._logs';
    let chunk = 200;
    let fby_user_id = 0;
    let cron_name = '';
    let paramsJson = '';
    let connection = null;
    try {
        if (connection == null || connection.query == undefined) {
            connection = await this.getSharedConnection();
        }

        paramsJson = JSON.stringify(param_array);

        if (param_array == null || !Array.isArray(param_array)) {
            return isSucess;
        }
        fby_user_id = param_array[0] != null && param_array[0] != undefined
            && param_array[0].fby_user_id != null && param_array[0].fby_user_id != undefined
            ? param_array[0].fby_user_id
            : 0;

        cron_name = param_array[0] != null && param_array[0] != undefined
            && param_array[0].cc_operation != null && param_array[0].cc_operation != undefined
            ? param_array[0].cc_operation
            : '';

        let totalProducts = param_array.length;

        if (cron_name.includes('PUSH') || cron_name.includes('ORDER')) {
            chunk = 50;
        }
        chunk = totalProducts > chunk ? chunk : totalProducts;
        let retryCounter = 0;
        let sql_string = '';
        let chunkedProducts = [];

        let slice_i = 0;
        let slice_j = slice_i + chunk;
        let chunkCounter = 0;
        let chunktotal = totalProducts / chunk;

        for (slice_i = 0; slice_i < slice_j && slice_j <= totalProducts; slice_i += chunk) {
            chunkCounter++;
            let batchInfoListDB = [];

            try {
                chunkedProducts = param_array.slice(slice_i, slice_j);
                /*
                if (chunkCounter == 1 || chunkCounter == chunktotal) {
                    //console.log(`\t${chunkCounter}/${chunktotal}) BatchInfoListDB, fby_user_id: ${fby_user_id}, TOTAL_LOGS: ${totalProducts}, ${cron_name}`);
                    //console.log('\tBatch Start: ', slice_i + 1);
                    //console.log('\tBatch End  : ', slice_j);
                }
                */

                if (slice_j + chunk > totalProducts) {
                    //chunk = totalProducts - slice_j;
                    slice_j = totalProducts;
                    //slice_i++;
                }
                else if (slice_j < totalProducts) {
                    slice_j = slice_j + chunk;
                    //slice_i++;
                }

                for await (const infoItem of chunkedProducts) {
                    try {
                        paramsJson = JSON.stringify(infoItem);
                        let keys = Object.keys(infoItem).length;

                        //#todo
                        if (keys == 9 && infoItem['level'] != undefined
                            //&& infoItem['level'] != 'INFO'
                        ) {
                            batchInfoListDB.push(infoItem);
                        }
                        else {
                            if (keys != 9) {
                                //console.log('\n Column count does not matching');
                                //console.log(infoItem);
                                //console.log('\n')
                            }
                        }
                    }
                    catch (error) {
                        //console.log('');
                        //console.log(error.message);
                        ////console.log(error);
                    }
                }


                while (retryCounter < MAX_RETRIES && batchInfoListDB != null
                    && batchInfoListDB.length > 0
                    && Array.isArray(batchInfoListDB)
                ) {
                    try {
                        let keys = Object.keys(batchInfoListDB[0]);
                        let values = param_array.map(obj => keys.map(key => obj[key]));
                        sql_string = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';


                        await connection.query(sql_string, [values], function (error, results, fields) {
                            if (error) {
                                isSucess = false;
                                throw error;
                            }
                            else {
                                isSucess = true;
                            }
                        });
                        isError = false;
                        retryCounter = MAX_RETRIES;
                        isSucess = true;
                    }
                    catch (error) {
                        isError = true;
                        isSucess = false;
                        let errorMessage = error.message;
                        //console.log('\nBulkInsert DB Exception');
                        //console.log(errorMessage);
                        //console.log(error);

                        let interval = 1 * 1000; // 10 seconds;
                        let promose = new Promise(resolve => setTimeout(resolve, interval));
                        await promose;

                        if (errorMessage.toLowerCase().includes('add new command when connection is in closed state')
                            || errorMessage.toLowerCase().includes('cannot enqueue query after fatal error')
                            || errorMessage.toLowerCase().includes('the server closed the connection')
                            || errorMessage.toLowerCase().includes('pool is closed')
                            || errorMessage.toLowerCase().includes('packets out of order')
                            || errorMessage.toLowerCase().includes('read ECONNRESET'.toLowerCase())

                        ) {
                            await this.resetDbpoolCCLogs();
                            connection = await this.getSharedConnection();
                            console.log('\nDB ERROR OCCURED : ', errorMessage);
                        }

                        //console.log(`\n${retryCounter} ) DB catch error ${sql_string}\n`, errorMessage);
                    }
                    finally {
                        retryCounter++;
                    }
                }
            }
            catch (error) {
                //console.log(`\nBatch creation error ${error.message}`);
                //console.log(error);
                //console.log(paramsJson);
            }
        }
    }
    catch (error) {
        //console.log('\n');
        //console.log(error.Message);


    }
    finally {
        if (connection != null) {
            connection.release();
        }
    }
    return isSucess;
};

// exports.bulkInsertV2 = async (param_array) => {
//     let isError = false;
//     let isSucess = false;
//     let chunk = 200;
//     let fby_user_id = 0;
//     let cron_name = '';
//     let paramsJson = '';
//     try {
//         paramsJson = JSON.stringify(param_array);

//         if (param_array == null || !Array.isArray(param_array)) {
//             return isSucess;
//         }
//         fby_user_id = param_array[0] != null && param_array[0] != undefined
//             && param_array[0].fby_user_id != null && param_array[0].fby_user_id != undefined
//             ? param_array[0].fby_user_id
//             : 0;

//         cron_name = param_array[0] != null && param_array[0] != undefined
//             && param_array[0].cc_operation != null && param_array[0].cc_operation != undefined
//             ? param_array[0].cc_operation
//             : '';

//         let totalProducts = param_array.length;

//         if (cron_name.includes('PUSH') || cron_name.includes('ORDER')) {
//             chunk = 50;
//         }
//         chunk = totalProducts > chunk ? chunk : totalProducts;
//         let retryCounter = 0;
//         let chunkedProducts = [];

//         let slice_i = 0;
//         let slice_j = slice_i + chunk;
//         let chunkCounter = 0;

//         for (slice_i = 0; slice_i < slice_j && slice_j <= totalProducts; slice_i += chunk) {
//             chunkCounter++;
//             let batchInfoListDB = [];

//             try {
//                 chunkedProducts = param_array.slice(slice_i, slice_j);

//                 if (slice_j + chunk > totalProducts) {
//                     slice_j = totalProducts;
//                 }
//                 else if (slice_j < totalProducts) {
//                     slice_j = slice_j + chunk;
//                 }

//                 for await (const infoItem of chunkedProducts) {
//                     try {
//                         paramsJson = JSON.stringify(infoItem);
//                         let keys = Object.keys(infoItem).length;
//                         if (keys == 9 && infoItem['level'] != undefined
//                             && infoItem['level'] == 'INFO'
//                         ) {
//                             batchInfoListDB.push(infoItem);
//                         }
//                         else {
//                             if (keys != 9) {
//                                 //console.log('\n Column count does not matching');
//                                 //console.log(infoItem);
//                                 //console.log('\n')
//                             }
//                         }
//                     }
//                     catch (error) {
//                         //console.log('');
//                         //console.log(error.message);
//                     }
//                 }


//                 while (retryCounter < MAX_RETRIES && batchInfoListDB != null
//                     && batchInfoListDB.length > 0
//                     && Array.isArray(batchInfoListDB)
//                 ) {
//                     try {
//                         if (mongoose.connection.readyState != 1) {
//                             await this.getMongoConnection();
//                         }
//                         const response = await CCLogs.insertMany(batchInfoListDB[0]);
//                         //console.log("Successfully inserted Data: ", JSON.stringify(response, '', '\t'));

//                         isError = false;
//                         retryCounter = MAX_RETRIES;
//                         isSucess = true;
//                     }
//                     catch (error) {
//                         isError = true;
//                         isSucess = false;
//                         let errorMessage = error.message;
//                         //console.log('\nBulkInsert DB Exception');
//                         //console.log(errorMessage);
//                         //console.log(error);

//                         let interval = 1 * 1000; // 10 seconds;
//                         let promose = new Promise(resolve => setTimeout(resolve, interval));
//                         await promose;


//                         //console.log(`\n${retryCounter} ) DB catch error`, errorMessage);
//                     }
//                     finally {
//                         retryCounter++;
//                     }
//                 }
//             }
//             catch (error) {
//                 //console.log(`\nBatch creation error ${error.message}`);
//                 //console.log(error);
//                 //console.log(paramsJson);
//             }
//         }
//     }
//     catch (error) {
//         //console.log('\n');
//         //console.log(error.Message);

//     }
//     finally {
//         mongoose.connection.close()
//     }
//     return isSucess;
// }

exports.InsertIntoTable = async (tableName, param_array) => {
    let isError = false;
    let isSucess = false;
    let table = tableName;
    let paramsJson = '';
    let connection = null;
    try {
        if (connection == null || connection.query == undefined) {
            connection = await poolCCLogs.getConnection();
        }

        paramsJson = JSON.stringify(param_array);

        if (param_array == null) {
            return isSucess;
        }

        let retryCounter = 0;
        let sql_string = '';

        try {
            while (retryCounter < MAX_RETRIES) {
                try {
                    let keys = Object.keys(param_array[0]);
                    let values = param_array.map(obj => keys.map(key => obj[key]));
                    sql_string = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';


                    await connection.query(sql_string, [values], function (error, results, fields) {
                        if (error) {
                            isSucess = false;
                            throw error;
                        }
                        else {
                            isSucess = true;
                        }
                    });
                    isError = false;
                    retryCounter = MAX_RETRIES;
                    isSucess = true;
                }
                catch (error) {
                    isError = true;
                    isSucess = false;
                    let errorMessage = error.message;
                    //console.log('\nBulkInsert DB Exception');
                    //console.log(errorMessage);
                    //console.log(error);

                    let interval = 1 * 1000; // 10 seconds;
                    let promose = new Promise(resolve => setTimeout(resolve, interval));
                    await promose;

                    if (errorMessage.toLowerCase().includes('add new command when connection is in closed state')
                        || errorMessage.toLowerCase().includes('cannot enqueue query after fatal error')
                        || errorMessage.toLowerCase().includes('the server closed the connection')
                        || errorMessage.toLowerCase().includes('pool is closed')
                        || errorMessage.toLowerCase().includes('packets out of order')
                        || errorMessage.toLowerCase().includes('read ECONNRESET'.toLowerCase())

                    ) {
                        await this.resetDbpoolCCLogs();
                        connection = await this.getSharedConnection();
                        console.log('\nDB ERROR OCCURED : ', errorMessage);
                    }

                    //console.log(`\n${retryCounter} ) DB catch error ${sql_string}\n`, errorMessage);
                }
                finally {
                    retryCounter++;
                }
            }
        }
        catch (error) {
            //console.log(`\nBatch creation error ${error.message}`);
            //console.log(error);
            //console.log(paramsJson);
        }

    }
    catch (error) {
        //console.log('\n');
        //console.log(error.Message);


    }
    finally {
        if (connection != null) {
            connection.release();
        }
    }
    return isSucess;
};

exports.execute = async (sql_string, param_array, callback, sendRaw = true) => {

    // pool = mysql.createPool(params);
    let retryCounter = 0;
    let isError = false;
    let isMulti = false;
    let isDeadlock = false;
    let connection = null;
    let paramsJson = '';
    let errorMessage = '';
    try {

        //await this.killSleepingSqlProcess();

        if (connection == null || connection == undefined || connection.execute == undefined) {
            connection = await this.getSharedConnection();
        }

        while (retryCounter < MAX_RETRIES) {
            try {
                paramsJson = JSON.stringify(param_array);
                const [result] = await connection.execute(sql_string, param_array);
                let isResult = result != undefined && result.length > 0;

                if (isResult) {
                    try {
                        isMulti = result[0] != undefined && Array.isArray(result[0]) && result[0].length > 0;
                    }
                    catch (err) {

                    }
                }
                isDeadlock = false;
                retryCounter = MAX_RETRIES;
                if (isError) {
                    console.log(`\n${retryCounter} ) DB ERROR RESOVLED ${sql_string}\n(${paramsJson});\n`, errorMessage);
                    isError = false;
                }
                if (sendRaw) {
                    if (callback != undefined) {
                        return callback(null, result);
                    }
                    else {
                        return {
                            result: isResult ? result[0] : result,
                            variables: isResult && isMulti ? result[0][0] : result
                        };
                    }
                }

                if ((result && result[0] && result[0][0])) {

                    if (callback != undefined) {
                        return callback(null, result[0], result[0][0]);
                    }
                    else {
                        if ((result && result[0] && result[0][0])) {

                            return {
                                result: result[0],
                                variables: result[0][0]
                            };

                        } else {

                            return {
                                result: [],
                                variables: null
                            };

                        }

                    }

                } else {

                    if (callback != undefined) {

                        return callback(null, result && result[0] ? result[0] : []);
                    }
                    else {

                        return {
                            result: result && result[0] ? result[0] : [],
                            variables: result && result[0] ? result[0][0] : null
                        };
                    }

                }

            }
            catch (error) {
                isError = true;
                errorMessage = error.message;
                //console.log('\nDB ERROR OCCURED : ', errorMessage);
                //console.log(error);
                let interval = 1 * 1000; // 10 seconds;
                let promose = new Promise(resolve => setTimeout(resolve, interval));
                await promose;
                if (error.code == 'ER_LOCK_DEADLOCK') {
                    isDeadlock = true;
                }
                if (errorMessage.toLowerCase().includes('add new command when connection is in closed state')
                    || errorMessage.toLowerCase().includes('cannot enqueue query after fatal error')
                    || errorMessage.toLowerCase().includes('the server closed the connection')
                    || errorMessage.toLowerCase().includes('pool is closed')
                    || errorMessage.toLowerCase().includes('packets out of order')
                    || errorMessage.toLowerCase().includes('read ECONNRESET'.toLowerCase())
                ) {
                    await this.resetDbpoolCCLogs();
                    connection = await this.getSharedConnection();
                    console.log('\nDB ERROR OCCURED : ', errorMessage);
                }
                //console.log(`\n${retryCounter} ) DB catch error ${sql_string}\n(${paramsJson});\n`, errorMessage);
            }
            finally {
                retryCounter++;
            }
        }
    }
    catch (error) {
        let errorMessage = error.message;
        //console.log('\n', errorMessage);
    }
    finally {
        if (connection != null) {
            connection.release();
        }
    }

};