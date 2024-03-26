"use strict";
const db = require("../../startup/db");
const dbcc = require("../../startup/dbcclogs");

exports.headers = {
    'authorization': `Bearer ${process.env.JWT_KEY}`
};

exports.getIds = async (channelname = "shopify") => {

    try {
        const { result } = await db.execute(`CALL ${process.env.DB_DATABASE}._2_getIDforChannelByChannelName(?)`, [channelname]);
        return result;
    } catch (error) {
        //console.log("error getting data from db", error);
    }
};

exports.truncateLogs = async () => {

    try {

        const { result } = await db.execute(`truncate table ${process.env.DB_DATABASE}.winston_logs;`, []);
        return result;
    } catch (error) {
        //console.log("error getting data from db", error);
    }
};



exports.getNewTime = async (incementer = 1) => {
    let defaultBase1 = 3, defaultBase2 = 33;
    let base1 = 3, base2 = 33;
    let result = `${base1},${base2}`;
    try {
        let newbase1 = base1 + incementer;
        if (newbase1 > 28) {
            base1 = defaultBase1;
            newbase1 = base1 + incementer;
        }

        let newbase2 = base2 + incementer;
        if (newbase2 > 58) {
            base2 = defaultBase2;
            newbase2 = base2 + incementer;
        }
        result = `${newbase1},${newbase2}`;

    } catch (error) {
        //console.log("error getting data from db", error);
    }
};



exports.getNewTime = async (incementer = 1, base1 = 3, base2 = 33) => {

    let defaultBase1 = base1, defaultBase2 = base2;

    if (incementer > 25) {
        incementer = 2;

    }
    if (base1 == null || base1 == undefined || base1 == 0 || base1 + incementer > 28) {
        defaultBase1 = base1 = 3;
    }

    if (base1 == null || base1 == undefined || base1 == 0 || base2 + incementer > 58) {
        defaultBase2 = base2 = 33;
    }


    let result = `${base1},${base2}`;
    try {
        let newbase1 = base1 + incementer;
        if (newbase1 > 28) {
            base1 = defaultBase1;
            newbase1 = base1 + incementer;
        }

        let newbase2 = base2 + incementer;
        if (newbase2 > 58) {
            base2 = defaultBase2;
            newbase2 = base2 + incementer;
        }
        result = `${newbase1},${newbase2}`;

    } catch (error) {
        //console.log("error getting data from db", error);
    }
    return result;
};


exports.InsertIntoTable = async (tableName, param_array) => {

    try {
        dbcc.InsertIntoTable()
        return true;
    } catch (error)
    {
        return false;
        //console.log("error getting data from db", error);
    }
};