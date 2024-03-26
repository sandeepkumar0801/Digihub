
const mysql = require('mysql2/promise');
const env = require("./env");
const logger = require('../misc/logger');
const proxyMysqlDeadlockRetries = require('node-mysql-deadlock-retries');

var retries = 5;      	    // How many times will the query be retried when the ER_LOCK_DEADLOCK error occurs
var minMillis = 1000;    	// The minimum amount of milliseconds that the system sleeps before retrying
var maxMillis = 1000;        // The maximum amount of milliseconds100;  	// The maximum amount of milliseconds that the system sleeps before retrying
var debug = 1;		 	    // Show all the debugs on how the proxy is working
var show_all_errors = 1;    // Show all errors that are outside of the proxy
const MAX_RETRIES = 10;
let isKillRunning = false;

const params = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 40,
    waitForConnections: true,
    queueLimit: 99000,
    connectTimeout: 100000,
    // ssl: {
    //     rejectUnauthorized: false
    // }
};

var pool = mysql.createPool(params);

exports.resetDbPool = async () => {

    try {
        //await pool.end();
        //console.log('\n pool.end: not called');

    }
    catch (error) {
        //console.log("poolCCLogs.end reset successful!");
    }
    try {
        pool = await mysql.createPool(params);
        //let connection = await pool.getConnection();
        //console.log("poolCCLogs reset successful!");
    }
    catch (error) {
        let errorMessage = error.message;
        //console.log(`\n ${errorMessage}`);
        //console.log(error);
    }

};

var sharedConnection = null;

exports.getSharedConnection = async () => {
    try {
        if (pool == null || pool == undefined || pool.getConnection == undefined) {
            pool = await mysql.createPool(params);
        }
        if (sharedConnection == null || sharedConnection == undefined || sharedConnection.execute == undefined) {
            sharedConnection = await pool.getConnection();
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
            await this.resetDbPool();
            sharedConnection = await pool.getConnection();
        }
    }
    return sharedConnection;
};

pool.on('connection', function (connection) {
    proxyMysqlDeadlockRetries(connection, retries, minMillis, maxMillis, debug, show_all_errors);
});


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
                    await this.resetDbPool();
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


exports.bulkInsert = async (table, param_array) => {
    let isError = false;
    let isSucess = false;
    if (param_array == null || !Array.isArray(param_array)) {
        return isSucess;
    }

    let retryCounter = 0;
    let connection = null;
    let sql_string = '';
    let paramsJson = '';
    if (connection == null || connection.query == undefined) {
        connection = await this.getSharedConnection();
    }

    while (retryCounter < MAX_RETRIES) {
        try {
            //paramsJson = JSON.stringify(param_array);
            let keys = Object.keys(param_array[0]);
            let values = param_array.map(obj => keys.map(key => obj[key]));
            // sql_string = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ? ON DUPLICATE KEY UPDATE ';
            sql_string = `INSERT INTO ${table} (${keys.join(',')} ) VALUES ?`;


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
            let errorMessage = error.message.toLowerCase();
            //console.log('\nBulkInsert DB Exception');
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
                await this.resetDbPool();
                connection = await this.getSharedConnection();
            }

            //console.log(`\n${retryCounter} ) DB catch error ${sql_string}\n(${paramsJson});\n`, errorMessage);
        }
        finally {
            retryCounter++;
            if (connection != null) {
                connection.release();
            }
        }
    }
    return isSucess;
};



exports.killSleepingSqlProcess = async (table, param_array) => {
    if (!isKillRunning) {
        let retryCounter = 0;
        let connection = null;
        let errorMessage = '';
        let isError = false;
        let isDeadlock = false;

        let sql_string = '';
        isKillRunning = true;
        try {

            if (connection == null || connection == undefined || connection.execute == undefined) {
                // connection = await pool.getConnection();
                connection = await this.getSharedConnection();
            }

            let user = env.DB_USER.split('@', 1)[0];
            sql_string = `select concat('KILL ',id,';') sqlCmd from information_schema.processlist where Command='Sleep' and USER = '${user}'  and TIME_MS > 120000;`;
            let result = await connection.execute(sql_string, [], null, true);
            if (!Array.isArray(result)) {
                result = [result];
            }
            let counter = 0;
            for await (let item of result[0]) {
                try {
                    sql_string = item.sqlCmd;
                    counter++;
                    //console.log(`\n ${counter}) SLEEPING PROCESS : ${sql_string}`);
                    if (sql_string != undefined
                        && sql_string != null
                        && sql_string != ''
                    ) {
                        let result1 = await connection.execute(sql_string, [], null, true);
                        //console.log(`\n ${counter}) SLEEPING PROCESS : ${sql_string}, Result\n${JSON.stringify(result1)}`);
                    }
                }
                catch (error) {
                    //console.log('\n Kill DB Sleeping Process : ', error.message);
                    //console.log(error);
                }
            }

            isError = false;

            isSucess = true;

        }
        catch (error) {
            isError = true;
            isSucess = false;
            //console.log(error);
            errorMessage = error.message;
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
                await this.resetDbPool();
                connection = await this.getSharedConnection();
                console.log('\nDB ERROR OCCURED : ', errorMessage);
            }
        }
        finally {
            if (connection != null) {
                connection.release();
            }
            isKillRunning = false;
        }
    }
    else {
        //console.log('\n kill Already running');
    }

};