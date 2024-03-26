require("./startup/env").check_env();
require("dotenv/config");
const moment = require("moment");
const express = require("express");
const swaggerUI = require("swagger-ui-express");
const path = require('path');
const cors = require('cors');
const app = express();
const env = require("./startup/env");
const swaggerAutogen = require('swagger-autogen')();
const logger = require('./misc/logger');
const helpers = require('./misc/helpers');
const YAML = require('yamljs');
const fs = require('fs');
const common = require('./server/constants/common');

const fbyService = require('./services/fby_service');
const tests = require('./startup/test');
const corsOpts = {
    origin: '*',

    methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
    ],

    allowedHeaders: [
        'Content-Type', 'Authorization'
    ],
};
app.use(cors(corsOpts));
app.use(express.json());
//const parquet = require("parquetjs-lite");
var http = require('http');



/**
 * This is required to handle api routes from router.js
 * All routers are imported as 'route' from router.js
 */
app.use("/", require("./server/routes/router.js"));
app.use("/client", require("./routes/_1_client/client_routes"));
app.use("/channel", require("./routes/_2_channel/channel_routes"));
app.use("/prestashop", require("./routes/_3_prestashop/prestashop_routes"));
app.use("/ebay", require("./routes/_4_ebay/ebay_routes"));

const BASE_URL = process.env.BASE_URL;
const ENV = process.env.ENV;
const PORT = process.env.PORT;
global.APP_ROOT = path.resolve(__dirname) + "\\";

var swagger_path = "";
if (ENV == "PROD") {
    swagger_path = path.resolve(__dirname, './swagger-prod.yaml');
}
else {
    swagger_path = path.resolve(__dirname, './swagger.yaml');
}

fs.readFile(swagger_path, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    let urls = [
        'http://localhost:3000/',
        'http://localhost:5000/'
       
    ];

    var result = data;
    urls.forEach(element => {

        element = element.trim();
        if (result.includes(element) == true);
        {
            result = result.replace(element, BASE_URL);
            console.log('Swagger server dropdown set to : ', BASE_URL);

        }
    });


    fs.writeFile(swagger_path, result, 'utf8', function (err) {
        if (err) return console.log(err);
    });

});


setTimeout(async () => {
    console.clear();

    //console.log("swagger_path", swagger_path);
    const swaggerDocument = YAML.load(swagger_path);
    app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
    app.listen(PORT);
    console.log(`listening at Port ${PORT}, And swagger url = ${BASE_URL}swagger`);
    await tests.init();
    if (process.env.ENV == "PROD") {
        console.log("Sheduling Jobs : false , FOR environment : ", ENV);
        const runner = require("./services/cron_jobs/indexDispatcher");
        await runner.initialize_Jobs();
    }
    else {
        //console.log("Sheduling Jobs : false , FOR environment: ", ENV);
    }


}, 2000);

/*
process.on('uncaughtException', function (err) {
    //console.log(err);
    process.exit(0);
});
*/

const qs = require('qs');
const fetch = require('node-fetch');

process.on('uncaughtException', err => {
    console.error(err && err.stack);
});
