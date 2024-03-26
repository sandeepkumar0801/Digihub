const common = require('../server/constants/common');
const fby_service = require('../services/fby_service');
const amazon_service = require('../services/amazon_SPAPI_Service');
const helpers = require('../misc/helpers');
const moment = require('moment');
const { forEach } = require('lodash');
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const axios = require('axios');
const qs = require('qs');
const fetch = require('node-fetch');

// Set the API endpointAmazonOauth
const endpointAmazonOauth = 'https://api.amazon.com/auth/o2/token';

//const azureBlob = require("./startup/azure_blob");
//let listBlobs = await azureBlob.listContainerBlobs();
//console.log('listBlobs: ', listBlobs);
/*
var schema = new parquet.ParquetSchema({
    ob_seller_id: {
        type: 'UTF8',
        typeLength: null,
        optional: true,
        repeated: false,
        encoding: 'PLAIN',
        compression: 'UNCOMPRESSED'
    }
});
let reader = await parquet.ParquetReader.openFile("order.parquet");

// create a new cursor
let cursor = reader.getCursor([
    "ob_seller_id",
    "ob_marketplace_id",
    "amazon_order_id",
    "seller_order_id",
    "purchase_date",
    "order_channel",
    "buyer_info_buyer_email",
    "latest_ship_date",
    "latest_delivery_date",
    "fulfillment_channel",
    "earliest_delivery_date",
    "earliest_ship_date",
    "shipping_address_address_line1",
    "shipping_address_address_line2",
    "shipping_address_address_line3",
    "shipping_address_address_type",
    "shipping_address_city",
    "shipping_address_country_code",
    "shipping_address_county",
    "shipping_address_district",
    "shipping_address_municipality",
    "shipping_address_name",
    "shipping_address_phone",
    "shipping_address_postal_code",
    "shipping_address_state_or_region",
    "shipment_service_level_category",
    "ship_service_level",
    "AddressLine1",
    "BuyerName",
    "buyer_info_buyer_name",
    "address_line1",
    "buyer_name",

]);

// read all records from the file and print them
let record = null;
let i = 1;
while (record = await cursor.next()) {
    //console.log(`${i}`);
    //console.log(record);
    //console.log(`\n`);
    i++;
}
*/






exports.test_GetFBYToken = async () => {
    let clientIds = [];

    if (process.env.ENV == "QA") {
        clientIds = [
            1112, 1113, 1114, 1115, 1116, 1117, 1118, 1119, 1120,
            1121, 1122, 1123, 1124, 1125, 1126, 1127, 1128, 1129
        ];

    }
    if (process.env.ENV == "PROD") {
        clientIds = [
            42,
            50,
            51,
            52,
            53,
            54,
        ];
    }
    for await (const clientid of clientIds) {
        try {


            await common.shopifyUserDetail(clientid, 'test', 'test', async function (result) {
                let client = result.success.data[0];
                var SELLING_PARTNER_APP_CLIENT_ID = await helpers.getDecryptedData(client.username);
                var SELLING_PARTNER_APP_CLIENT_SECRET = await helpers.getDecryptedData(client.api_password);
                var AWS_SELLING_PARTNER_ACCESS_KEY_ID = await helpers.getDecryptedData(client.api_key);
                var AWS_SELLING_PARTNER_SECRET_ACCESS_KEY = await helpers.getDecryptedData(client.secret);
                var Refresh_Token = await helpers.getDecryptedData(client.token);
                var AWS_SELLING_PARTNER_ROLE = client.amazon_Role;
                var REGION = await helpers.getDecryptedData(client.amazon_region);

                let Access_Token = await amazon_service.requestAccessToken(SELLING_PARTNER_APP_CLIENT_ID, Refresh_Token, SELLING_PARTNER_APP_CLIENT_SECRET);

                if (helpers.isEmpty(Access_Token)) {
                    console.log(`\nfby_user_id: ${clientid} ${REGION}\tcommon.shopifyUserDetail RESULT:\n${JSON.stringify(result)}\nTOKEN:\n${Access_Token}`);
                }

            });
        }
        catch (err) {
            console.log(`\n fby_user_id: ${clientid})\tcommon.shopifyUserDetail ERROR:\n${JSON.stringify(err.message)}`);
        }
    }
};

exports.test_INSERT_FBY_INVENTORY = async () => {
    let datetimeNow = moment().format(MOMENT_DATE_FORMAT);
    let invetoryList = [
        {
            "skuCode": `BN_BRL_WFQ14479_S398_F9_${datetimeNow}`,
            "quantity": 1,
            "skuId": 1,
            "ean": "7612901672311",
            "priority": 30,
            "marketPlaces": []
        },
        {
            "skuCode": `BN_BRL_WFS14421_S398_F9_${datetimeNow}`,
            "quantity": 1,
            "skuId": 2,
            "ean": "7612901677255",
            "priority": 30,
            "marketPlaces": []
        },
        {
            "skuCode": `BN_BRL_WFR14426_I1005_CF0_${datetimeNow}`,
            "quantity": 0,
            "skuId": 3,
            "ean": "7612901669519",
            "priority": 30,
            "marketPlaces": []
        },
        {
            "skuCode": `BN_BRL_WFR14426_I1005_CF1_${datetimeNow}`,
            "quantity": 0,
            "skuId": 4,
            "ean": "7612901669526",
            "priority": 30,
            "marketPlaces": []
        }

    ];
    // await fby_service.INSERT_FBY_INVENTORY(40, invetoryList, "GET_STOCK_FROM_FBY","8a55aa2d-1de1-40d6-b98a-b2db82cc2777");
    //await fby_service.getStockListForPushDirectly(null, 40, invetoryList);
};

exports.requestAccessToken = async (isLifeStyle = false) => {

    const SellingPartnerAPI = require('amazon-sp-api');
    let yls_token = 'refrresh_token1';
    let yf_token = 'refrresh_token2'

    process.env.LWA_CLIENT_IDENTIFIER = 'LWA_CLIENT_IDENTIFIER';
    process.env.LWA_CLIENT_SECRET = 'LWA_CLIENT_SECRET';
    process.env.AMAZON_REFRESH_TOKEN = yf_token;

    if (isLifeStyle) {
        process.env.AMAZON_REFRESH_TOKEN = yls_token;
    }

    const body = {
        grant_type: 'refresh_token',
        client_id: process.env.LWA_CLIENT_IDENTIFIER,
        refresh_token: process.env.AMAZON_REFRESH_TOKEN,
        client_secret: process.env.LWA_CLIENT_SECRET,
    };

    const acccessToken = await fetch(endpointAmazonOauth, {
        method: 'POST',
        body: qs.stringify(body),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    });

    //console.log('acccessToken: ', acccessToken);
    if (acccessToken.ok) {
        console.log(`\n acccessToken.json(): isLifeStyle ${isLifeStyle} `, await acccessToken.json());
    } else {
        //console.log('acccessToken.statusText: ', await acccessToken.statusText);
        throw new Error(acccessToken.statusText);
    }


    // Set the request payload
    const payload = {
        grant_type: 'refresh_token',
        client_id: process.env.LWA_CLIENT_IDENTIFIER,
        refresh_token: process.env.AMAZON_REFRESH_TOKEN,
        client_secret: process.env.LWA_CLIENT_SECRET,
    };
    /*
        // Send the token request
        axios.post(endpointAmazonOauth, null, { params: payload })
            .then(response => {
                const accessToken = response.data.access_token;
                const sellersendpointAmazonOauth = 'https://sellingpartnerapi-eu.amazon.com/catalog/v0/items';
    
                // Set the request headers
                const headers = {
                    Authorization: `Bearer ${accessToken}`
                };
    
                // Send the request to fetch catalog items
                axios.get(sellersendpointAmazonOauth, { headers })
                    .then(response => {
                        const sellerId = response.data.sellers[0].sellerId;
                        // The sellerId is your MerchantIdentifier
                        console.log(`MerchantIdentifier (sellerId): ${sellerId}`);
                    })
                    .catch(error => {
                        console.log('Error fetching catalog items:', error.message);
                    });
            })
            .catch(error => {
                console.log('Error fetching access token:', error.message);
            });
        */

};

exports.Order_Notitifcation_Test = async () => {

    // Notification test
    var orders = [{
        fby_user_id: 40,
        order_no: '5110552395881',
        sku: 'HD740',
        order_line_item_id: '12717831159913',
        original_Channel_OrderId: 'R-5110552395881'
    },
    {
        fby_user_id: 40,
        order_no: '5110552395881',
        sku: 'HD741',
        order_line_item_id: '12717831159913',
        original_Channel_OrderId: 'R-5110552395881'
    }

    ];
    for (var order of orders) {
        await fby_service.changeOrderStatus(
            null,
            order,
            '222f83e6-8891-41bd-92fe-4ecfaa0de912',
            'changeOrderStatus',
            'changeOrderStatus');
    }
    let interval = 1 * 1000; // 10 seconds;

    let promose = new Promise(resolve => setTimeout(resolve, interval));
    await promose;

};

exports.test_amazon_feed_log_to_Files = async () => {

    let datetimeNow = moment().format(MOMENT_DATE_FORMAT);
    // await this.Order_Notitifcation_Test();
    // await this.test_GetFBYToken();
    // await common.deleteStockBeforeAddStocks(51);
    // await this.test_INSERT_FBY_INVENTORY();
    await amazon_service.logTofile('test.txt',datetimeNow);
    //await this.requestAccessToken(true);


};


exports.test_fby_alert_insert = async (fby_user_id) => {
    let alert_response = await fby_service.insertAlertCCLogs(fby_user_id,true);
};

exports.init = async () => {

    let datetimeNow = moment().format(MOMENT_DATE_FORMAT);
    //await this.test_amazon_feed_log_to_Files();
    // await this.Order_Notitifcation_Test();
    // await this.test_GetFBYToken();
    // await common.deleteStockBeforeAddStocks(51);
    // await this.test_INSERT_FBY_INVENTORY();
    // await this.requestAccessToken(false);
    //await this.test_fby_alert_insert(39);
    //await this.requestAccessToken(true);


};

