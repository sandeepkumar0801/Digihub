
const dbCCLogs = require('../../startup/dbcclogs');
const cron = require("node-cron");
// import product jobs
const productJobs = require("./products/run_job");

// 
const stockJobs = require("./stocks/run_job");

// Orders Job
const orderJobs = require("./orders/run_job");

// Tracking Job
const trackingJobs = require("./tracking/run_job");

// Error jobs
const errorJobs = require("./error/run_job");

// Master Data Job
const masterDataJobs = require("./masterData/run_job");


async function init_GET_ProductJobs() {
    //console.log('\ninit_GET_ProductJobs');
    await productJobs.getShopifyProducts();
    await productJobs.getShopifyLocation();
    await productJobs.getStoreDenProducts();
    await productJobs.getWooCommerceProducts();
    await productJobs.getPrestaProducts();
    await productJobs.getEbayProducts();
    await productJobs.getMiraklProducts();
    await productJobs.getMagentoProducts();
}

async function init_GET_MasterData() {
    //console.log('\init_GET_MasterData');
    await productJobs.getMiraklCarriers();
}

async function init_PUSH_ProductJobs() {
    if (process.env.IS_SEND_PRODUCT_TO_FBY == 1) {
        //console.log('\ninit_PUSH_ProductJobs');
        //Shopify Storeden, Woocommerce and Mirakl
        await productJobs.sendProductFBY();
        await productJobs.sendPrestaProductFBY();
        await productJobs.sendEbayProductFBY();
    }

}


async function init_GET_StockJobs() {
    //console.log('\ninit_GET_StockJobs');
    await stockJobs.getFBYStock();
}

async function init_PUSH_StockJobs() {
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        //console.log('\ninit_PUSH_StockJobs');
        await stockJobs.pushStockShopify();

        await stockJobs.pushStockStoreden();

        await stockJobs.pushStockWooCommerce();

        await stockJobs.pushStockPresta();

        await stockJobs.pushStockEbay();

        await stockJobs.pushStockMirakl();

        await stockJobs.pushStockAmazon();

        await stockJobs.pushStockMagento();
    }

}

async function init_GET_OrderJobs() {
    //console.log('\ninit_GET_OrderJobs');
    await orderJobs.getShopifyOrders();
    await orderJobs.getStoreDenOrders();
    await orderJobs.getWooCommerceOrders();
    await orderJobs.getPrestaOrders();
    await orderJobs.getEbayOrders();
    await orderJobs.getMiraklOrders();
    await orderJobs.getMagentoOrders();

}


async function init_PUSH_OrderJobs() {
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        //console.log('\ninit_PUSH_OrderJobs');

        //Shopify , Storeden, Mirakl, Presta and WooCommerce
        await orderJobs.sendOrderFBY();

        //Shopify , Storeden, Mirakl , Presta and WooCommerce
        await orderJobs.sendCancelledOrders();

    }

}

async function init_GET_TrakingJobs() {
    //console.log('\ninit_GET_TrakingJobs');
    await trackingJobs.getTrackNumber();

}

async function init_PUSH_TrakingJobs() {
    if (process.env.IS_SEND_OTHER_DATA_TO_CHANNEL_AND_FBY == 1) {
        //console.log('\ninit_PUSH_TrakingJobs');

        await trackingJobs.pushTrackShopify();

        await trackingJobs.pushTrackStoreden();

        await trackingJobs.pushTrackPresta();

        await trackingJobs.pushTrackEbay();

        await trackingJobs.pushTrackMirakl();

        await trackingJobs.pushTrackWoocommerce();

        await trackingJobs.pushTrackMagento();
    }

}

async function initOtherJobs() {

    //console.log('\ninitOtherJobs');
    // await errorJobs.errorManage();
    // await errorJobs.errorManagePresta();
    // await errorJobs.errorManageEbay();
    // await masterDataJobs.FBYApis();
    await masterDataJobs.sendALertToFBY();

}

async function init_ProductAndPriceSyncFromFBYtoShopify() {
    try {
        await productJobs.getProductsFromFBYforShopify();
        await productJobs.getProductsPricesFromFBYforShopify();
        await productJobs.pushProductsFromFBYtoShopify();
        await productJobs.pushProductsImagesFromFBYtoShopify();
        await productJobs.pushProductsVariantsFromFBYtoShopify();
        await productJobs.update_products_shopify();

        await productJobs.getProductsPricesFromFBY();
        //await productJobs.pushPricesFromFBYtoAmazon();
    } catch (error) {
        console.log('job initialization error whilte ProductAndPriceSyncFromFBYtoShopify: ', error);

    }

}


async function promise_dbCCLogs_executeCCLogs() {
    cron.schedule('*/30 * * * * *', async () => {
        try {
            if (process.env.ENV === 'PROD' || process.env.ENV === 'LOCAL') {
                await dbCCLogs.executeCCLogsQueue();
            }
        }
        catch (error) {
            console.error(error.message);
        }
    });
}


exports.initialize_Jobs = async () => {
    try {


        try {

            await dbCCLogs.execute('Truncate table channelconnector._cron;');

        }
        catch (error) {
            console.error(error.message);
        }


        await init_GET_ProductJobs();
        await init_GET_StockJobs();
        await init_GET_OrderJobs();
        await init_GET_TrakingJobs();

        await init_PUSH_ProductJobs();
        await init_PUSH_StockJobs();
        await init_PUSH_OrderJobs();
        await init_PUSH_TrakingJobs();
        await initOtherJobs();
        await init_ProductAndPriceSyncFromFBYtoShopify();
        await promise_dbCCLogs_executeCCLogs();

        await init_GET_MasterData();


    } catch (error) {
        console.log('job initialization error: ', error);

    }
};

