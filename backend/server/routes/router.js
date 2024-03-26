const express = require("express");
const homeRoutes = require("../services/render.js").homeRoutes;
const shopifyController = require("../controller/shopifyController.js");
const router = express.Router();
const auth = require("../../middleware/auth");
const commonApiController = require("../controller/commonApiController");
const errorManageController = require("../controller/errorManageController");
const storedenController = require("../controller/storedenController.js");
const woocommerceController = require("../controller/woocommerceController.js");
const amazonMwsController = require("../controller/amazonMwsController");
const amazonSPApiController = require("../controller/amazonSPAPIController");
const miraklController = require("../controller/miraklControler");
const fbyController = require("../controller/fbyController");
const magentoController = require("../controller/magentoController.js");
const common = require("../constants/common.js");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const commonController = require("../controller/commonController.js");


/**
 *@description Root Route when the server starts
 *
 */
router.get("/", homeRoutes);

router.post('/register', async (req, res) => {
    const { name, email, password, groupCode } = req.body;

    try {
        // Check if the user already exists
        common.getAuthUserDetails(email, async function (users) {
            if (users.error) {
                return false;
            } else {
                if (users.success.data.length > 0) {
                    return res.status(400).json({ error: 'User already exists' });
                }
                const hashedPassword = await bcrypt.hash(password, 10);

                let authUsers = [name, email, hashedPassword, groupCode]
                await common.addAuthUser(authUsers, async function (result) {
                    if (result.error) {
                        res.status(500).json({ error: 'Internal Server Error' });

                    }
                });
                return res.json({ message: 'Registration successful' });
            }
        })

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        common.getAuthUserDetails(email, async function (users) {
            if (users.error) {
                return false;
            } else {
                if (users.success.data.length === 0) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
                const user = users.success.data[0];
                // Compare the provided password with the hashed password in the database
                const passwordMatch = await bcrypt.compare(password, user.password);

                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Generate a JWT token
                const token = jwt.sign({ name: user.name, email: user.email }, process.env.JWT_KEY, { expiresIn: '1h' });
                const groupCode = user.groupCode;
                res.json({ token, user: { name: user.name, email: user.email }, groupCode });

            }
        })

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get("/shopify/api/get_shopify_products", auth.checkMultiAuthorization, shopifyController.getShopifyProducts);

router.get("/shopify/api/get_shopify_location", auth.checkMultiAuthorization, shopifyController.getShopifyLocation);

router.get("/shopify/api/send_products_fby", auth.checkMultiAuthorization, shopifyController.sendProductsFby);

router.get("/shopify/api/get_fby_stock", auth.checkMultiAuthorization, shopifyController.getFbyStock);

router.get("/shopify/api/push_stock_shopify", auth.checkMultiAuthorization, shopifyController.pushStockShopify);

router.get("/shopify/api/get_shopify_orders", auth.checkMultiAuthorization, shopifyController.getShopifyOrders);

router.get("/shopify/api/send_orders_fby", auth.checkMultiAuthorization, shopifyController.sendOrdersFby);

router.get("/shopify/api/send_cancelled_orders_fby", auth.checkMultiAuthorization, shopifyController.sendCanceledOrdersFby);

router.get("/shopify/api/get_track_number", auth.checkMultiAuthorization, shopifyController.getFbyTraknumber);

router.get("/shopify/api/push_tracks_shopify", auth.checkMultiAuthorization, shopifyController.pushTrackShopify);

router.get("/shopify/api/error_manage", auth.checkMultiAuthorization, errorManageController.errorManager);

router.get("/api/fby_apis", auth.checkMultiAuthorization, commonApiController.fbyCommonApis);

router.get("/api/fby_alert", auth.checkMultiAuthorization, fbyController.sendAlertToFBY);

router.get("/api/get_cron_schedule", fbyController.getCronSchedule);

router.get("/api/get_logs_by_alert_id", fbyController.getLogsByAlertId);

//storeden starts
//http://localhost:3000/storeden/api/get_products_list?userid=1000
router.get("/storeden/api/get_products_list", auth.checkMultiAuthorization, storedenController.getStoredenProducts);

//Not used in current flow
router.get("/storeden/api/add_product_storeden", auth.checkMultiAuthorization, storedenController.sendProductsStoreden);

//Not used in current flow
router.get("/storeden/api/get_stock",auth.checkMultiAuthorization,  storedenController.getStoredenStock);

//http://localhost:3000/storeden/api/push_stock_storeden?fby_user_id=1000
router.get("/storeden/api/push_stock_storeden", auth.checkMultiAuthorization, storedenController.pushStockStoreden);

//http://localhost:3000/storeden/api/get_storeden_orders?fby_user_id=1000
router.get("/storeden/api/get_storeden_orders",auth.checkMultiAuthorization,  storedenController.getStoredenOrders);

//Not used in current flow
router.get("/storeden/api/get_track_number", auth.checkMultiAuthorization, storedenController.getStoredenTrackNumber);

//http://localhost:3000/storeden/api/push_track?fby_user_id=1000
router.get("/storeden/api/push_track", auth.checkMultiAuthorization, storedenController.pushTrackStoreden);
//storeden ends

//WooCommerce starts
//http://localhost:3000/woocommerce/api/get_products_list?userid=1006
router.get("/woocommerce/api/get_products_list", auth.checkMultiAuthorization, woocommerceController.getWooCommerceProducts);

//http://localhost:3000/woocommerce/api/push_stock_woocommerce?fby_user_id=1006
router.get("/woocommerce/api/push_stock_woocommerce", auth.checkMultiAuthorization, woocommerceController.pushStockWoocommerce);

//http://localhost:3000/woocommerce/api/get_woocommerce_orders?fby_user_id=1006
router.get("/woocommerce/api/get_woocommerce_orders", auth.checkMultiAuthorization, woocommerceController.getWoocommerceOrders);

//http://localhost:3000/woocommerce/api/push_track?fby_user_id=1000
router.get("/woocommerce/api/push_track", auth.checkMultiAuthorization, woocommerceController.pushTrackWoocommerce);
//woocommerce ends


//amazonMws starts
//http://localhost:3000/amazonMws/api/getOrders
//router.get("/amazonMws/api/getOrders", amazonMwsController.getWooCommerceProducts);
//amazonMws ends

//#region Product and price sync from FBY to Shopify
/*
1
GET_PRODUCTS_FROM_FBY_TIMER
http://localhost:3000/shopify/api/get_products_fby?fby_user_id=8
*/
router.get("/shopify/api/get_products_fby",auth.checkMultiAuthorization, shopifyController.getFbyProducts);

/*
2
GET_PRODUCTS_PRICE_FROM_FBY_TIMER
http://localhost:3000/shopify/api/get_prices_fby?fby_user_id=8
*/
router.get("/shopify/api/get_prices_fby", auth.checkMultiAuthorization, shopifyController.getFbyProductPrices);

/*
3
PUSH_PRODUCTS_TO_SHOPIFY_TIMER
http://localhost:3000/shopify/api/push_product_shopify?fby_user_id=8
*/
router.get("/shopify/api/push_product_shopify", auth.checkMultiAuthorization, shopifyController.createProductsShopify);

/*
4
PUSH_PRODUCTS_IMAGES_TO_SHOPIFY_TIMER
http://localhost:3000/shopify/api/push_product_images?fby_user_id=8
*/
router.get("/shopify/api/push_product_images", auth.checkMultiAuthorization,shopifyController.pushImagesShopify);

/*
5
PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER
http://localhost:3000/shopify/api/push_variants_shopify?fby_user_id=8
*/
router.get("/shopify/api/push_variants_shopify", auth.checkMultiAuthorization, shopifyController.createProductVariantShopify);


/*
6
PUSH_PRODUCTS_VARIANTS_TO_SHOPIFY_TIMER
http://localhost:3000/shopify/api/push_variants_shopify?fby_user_id=8
*/
router.get("/shopify/api/update_products_shopify",auth.checkMultiAuthorization, shopifyController.updateProductsOrVariantsShopify);
//#endregion

//Amazon step 1
router.get("/amazon/api/generate_Products_Report_Amazon",auth.checkMultiAuthorization ,amazonSPApiController.generateAmazonProductsReport);

//Amazon step 2
router.get("/amazon/api/get_Products_Amazon",auth.checkMultiAuthorization, amazonSPApiController.getAmazonProducts);

//Amazon step 3
router.get("/amazon/api/get_Orders_Amazon",auth.checkMultiAuthorization, amazonSPApiController.getAmazonOrders);

router.get("/amazon/api/push_stock_Amazon", amazonSPApiController.pushStockAmazon);

router.get("/amazon/api/push_Tracking_Amazon", amazonSPApiController.pushTrackAmazon);


//http://localhost:3000/amazon/api/push_track?fby_user_id=1011
router.get("/amazon/api/push_track", amazonSPApiController.pushTrackAmazon);
//amazon ends


//Mirakl Begins
router.get("/mirakl/api/get_Products_Mirakl", auth.checkMultiAuthorization ,miraklController.getmiraklProducts);

router.get("/mirakl/api/get_carriers_Mirakl", auth.checkMultiAuthorization ,miraklController.getmiraklCarriers);

router.get("/mirakl/api/push_stock_Mirakl", auth.checkMultiAuthorization, miraklController.pushStockmirakl);

router.get("/mirakl/api/get_Orders_Mirakl", auth.checkMultiAuthorization ,miraklController.getmiraklOrders);

router.get("/mirakl/api/push_Tracking_Mirakl", auth.checkMultiAuthorization ,miraklController.pushTrackmirakl);

/*
1
GET_PRODUCTS_PRICE_FROM_FBY_TIMER
http://localhost:3000/fby/api/get_prices_fby?fby_user_id=8
*/
router.get("/fby/api/get_prices_fby", auth.checkMultiAuthorization, amazonSPApiController.getFbyProductPrices);


/*
2
PUSH_PRICE_DETAILS_TO_AMAZON_TIMER
http://localhost:3000/amazon/api/push_price?fby_user_id=8
*/
router.get("/amazon/api/push_price", auth.checkMultiAuthorization, amazonSPApiController.pushPriceAmazon);

router.get('/magento/api/get_magento_products', auth.checkMultiAuthorization, magentoController.getMagentoProducts);

router.get('/magento/api/push_stock_magento', auth.checkMultiAuthorization, magentoController.pushStockMagento);

/* order route */
router.get('/magento/api/get_magento_orders', auth.checkMultiAuthorization, magentoController.getMagentoOrders);

router.get('/magento/api/push_traks_magento', auth.checkMultiAuthorization, magentoController.pushTrackMagento);

router.get('/magento/api/push_traks_magento', auth.checkMultiAuthorization, magentoController.pushTrackMagento);


// ChannelConnectorAPIs
router.post('/api/job', auth.checkMultiAuthorization, commonController.performCrudOperationForJobs);

router.post('/api/assign-bin', auth.checkMultiAuthorization, commonController.assignBinNumber);
router.get('/api/get_bin', auth.checkMultiAuthorization, commonController.getBinDetails);


// API endpoint to mark an order as complete
router.post('/api/mark-order-complete', auth.checkMultiAuthorization, commonController.markOrderComplete);
router.post('/api/channel_details', auth.checkMultiAuthorization, commonController.getChannelDetails);
router.post('/api/update_channel_status', auth.checkMultiAuthorization, commonController.updateChannelStatus);

router.post('/common/api/get_product', auth.checkMultiAuthorization, commonController.getProduct)
router.post('/common/api/get_product_varient', auth.checkMultiAuthorization, commonController.getvarient)
router.post('/common/api/get_all_product_varient', auth.checkMultiAuthorization, commonController.getAllVarient)
router.post('/common/api/get_order_master', auth.checkMultiAuthorization, commonController.getOrderMasterDetails)
router.post('/common/api/get_order_detail', auth.checkMultiAuthorization, commonController.getOrderDetails)

router.post('/common/api/create_shopify_order', auth.checkMultiAuthorization, commonController.createShopifyOrder)

router.post('/common/api/push_shopify_product_in_bulk', auth.checkMultiAuthorization, commonController.pushShopifyProductInBulk)
router.post('/common/api/push_shopify_product_varient_in_bulk', auth.checkMultiAuthorization, commonController.pushShopifyProductVarientInBulk)
router.post('/common/api/push_shopify_product', auth.checkMultiAuthorization, commonController.pushShopifyProduct)

router.post('/common/api/update_shopify_product_with_varient', auth.checkMultiAuthorization, commonController.updateShopifyProductwithVarient)
router.post('/common/api/update_shopify_varient', auth.checkMultiAuthorization, commonController.updateVarient)

router.post('/common/api/delete_shopify_product', auth.checkMultiAuthorization, commonController.deleteShopifyProduct)

router.post('/common/api/update_pricing', auth.checkMultiAuthorization, commonController.updatePricing)
router.post('/common/api/update_inventary', auth.checkMultiAuthorization, commonController.updateShopifyInventoryInBulk)


router.post('/common/api/push_tracking', auth.checkMultiAuthorization, commonController.pushTrackingInBulk)



module.exports = router;