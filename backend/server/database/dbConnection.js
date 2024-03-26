require("dotenv/config");
const mysql = require("mysql");
const dateTime = require("node-datetime");
const fs = require("fs");

let basepath = "files/dbfiles/";
var dt = dateTime.create();

//console.log('DB DETAILS', { DB_HOST:process.env.DB_HOST, DB_DATABASE:process.env.DB_DATABASE });
// mysql connection
const con = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 100,
  waitForConnections: true,
  queueLimit: 1000,
  connectTimeout: 100000
});

module.exports = con;


