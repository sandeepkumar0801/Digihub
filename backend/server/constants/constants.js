

const FBY_URL = `${process.env.FBY_URL}`;
const STOREDEN_URL = `${process.env.STOREDEN_URL}`;
//console.log('FBY_URL ', FBY_URL);
//console.log('STOREDEN_URL ', STOREDEN_URL);
module.exports = {
    /* custom Error Messages */
    API_SUCCESS: { status: 200 },
    API_ERROR: { status: 400 },
    EMPTY: { message: "empty query string" },
    NORECORD: { message: "no record Found" },
    NODATA: { message: "no data to be update" },
    FBY_SKUINSERT_SUCCESS: { status: "Products Sent to FBY Successfully" },
    FBY_SKUINSERT_ERROR: { status: "Can not sent products to FBY" },
    FBY_ORDERINSERT_SUCCESS: { status: "Orders Sent to FBY Successfully" },
    FBY_ORDERINSERT_ERROR: { status: "Can not Sent Orders to FBY" },
    FBY_CANCELED_ORDERINSERT_SUCCESS: { status: "Canceled Orders Sent to FBY Successfully" },
    FBY_CANCELED_ORDERINSERT_ERROR: { status: "Can not Sent Canceled Orders to FBY" },
    FBY_GETSTOCK_SUCCESS: { status: "Get Stock List Successfully" },
    FBY_GETSTOCK_ERROR: { status: "Can not get Stock List" },
    FBY_GETTRACK_SUCCESS: { status: "Get Tracknumber List Successfully" },
    FBY_GETTRACK_ERROR: { status: "Can not get Track List" },

    FBY_GET_PRODUCT_PRICE_SUCCESS: { status: "Products Prices fetched Successfully" },
    FBY_GET_PRODUCT_PRICE_ERROR: { status: "Products Prices Get Failed" },

    GET_PRODUCT_SUCCESS: { status: "Products Get Successfully" },
    GET_PRODUCT_ERROR: { status: "Products Get Failed" },
    GET_ORDER_SUCCESS: { status: "Orders Get Successfully" },
    GET_ORDER_ERROR: { status: "Orders Get Failed" },
    GET_LOCATION_SUCCESS: { status: "Products Location id Get Successfully" },
    GET_LOCATION_ERROR: { status: "Can not get Product Location id" },
    PUSH_STOCK_CHANNEL_SUCCESS: { status: "Products quantity Sent to Channel Successfully" },
    PUSH_STOCK_CHANNEL_ERROR: { status: "Can not Sent Products quantity to Channel" },
    PUSH_PRODUCT_CHANNEL_SUCCESS: { status: "Products Sent to Channel Successfully" },
    PUSH_PRODUCT_CHANNEL_ERROR: { status: "Can not Sent Products  to Channel" },
    PUSH_TRACKNO_CHANNEL_SUCCESS: { status: "Traking number Sent to Channel Successfully" },
    PUSH_TRACKNO_CHANNEL_ERROR: "Can not Sent Tracking Number to Channel",
    PUSH_VARIANTS_CHANNEL_SUCCESS: { status: "Products variants Sent to Channel Successfully" },
    PUSH_VARIANTS_CHANNEL_ERROR: { status: "Can not Sent Products variants to Channel" },
    GENERATE_PRODUCT_REPORT_SUCCESS: { status: "Products Report Generated Successfully" },

    EMPTY: { message: `empty query string` },
    EMPTY_USER_ID: { message: `no user id given` },
    NORECORD: { message: `no record Found` },
    NODATA: { message: `no data found` },
    UPDATE_ERROR: { message: `can not update` },
    DB_ERR: { status: 500, message: `Database not connected` },
    Auth_ERR: { status: 401 },
    TIME_OUT: { message: `Response timeout` },

    /* cron error type */
    CATCH_TYPE: `catch error`,
    QUERY_TYPE: `query error`,
    API_TYPE: `api response error`,

    /* Shopify Constants */
    PAID: `paid`,
    STATUS: `any`,
    REFUNDED: `refunded`,
    PARTIALLY_REFUNDED: `partially_refunded`,
    ORDER_STATUS: `unfulfilled`,
    CASH_ON_DELIVERY: 'COD',
    RES_FRAUD: `fraud`,
    RES_CUSTOMER: `customer`,
    RES_DECLINED: `declined`,
    DEFAULT_PAYMENT_METHOD: `NaN`,

    DEFAULT_cancel_reason: `RACQNOT`,
    DEFAULT_ALERT_CODE: `MISSING CONFIGURATION`,
    /* FBY API URL */
    FBY_TOKEN_URL: `${FBY_URL}/authentication_token`,
    FBY_STOCKLIST_URL: `${FBY_URL}/api/stock/incremental/list`,
    FBY_PRODUCTLIST_URL: `${FBY_URL}/api/sku/incremental/publication/list`,
    FBY_PRODUCT_PRICES: `${FBY_URL}/api/prices/incremental/list`,
    FBY_SKUINSERT_URL: `${FBY_URL}/api/skus/insert`,
    FBY_ORDERINSERT_URL: `${FBY_URL}/api/orders/insert`,
    FBY_NOTIFY_ORDER_URL: `${FBY_URL}/api/orders/notifiable/list`,
    FBY_CANCELED_ORDER_URL: `${FBY_URL}/api/orders/delete`,
    FBY_ALERTINSERT_URL: `${FBY_URL}/api/alerts/insert`,
    FBY_OPERATION_INSERT_URL: `${FBY_URL}/api/operations/insert`,
    FBY_PAYMENTMETHOD_URL: `${FBY_URL}/api/payments/list`,
    FBY_CANCELREASON_URL: `${FBY_URL}/api/causals/request/list`,
    FBY_ALERTCODE_URL: `${FBY_URL}/api/alerts/codes/list`,
    FBY_ALERTDOMAIN_URL: `${FBY_URL}/api/alerts/domains/list`,
    FBY_CHANNELCODE_URL: `${FBY_URL}/api/channels/list`,
    FBY_CURRENCYCODE_URL: `${FBY_URL}/api/currencies/list`,
    FBY_ORDERSTATUSCHANGE: `${FBY_URL}/api/orders/status/change`,

    DEFAULT_SHOPIFY_IMAGE: `https://cdn.shopify.com/s/files/1/0632/0645/7587/products/default_product_image_6cf74bd4-4438-4e10-8690-99c0a0753371.png?v=1656528671`,

    Storeden_Get_Products: `${STOREDEN_URL}/v1.1/products/list.json?nodes=title,ean,mpn,image_id,categoryUID,brandUID`,
    Storeden_Get_ProductDetails: `${STOREDEN_URL}/v1.1/products/product.json?uid=`,
    Storeden_Add_Product: `${STOREDEN_URL}/v1.1/products/product.json`,
    Storeden_Product_Images: `${STOREDEN_URL}/v1.1/products/image.json?uid=`,
    Storeden_Inventory: `${STOREDEN_URL}/v1.1/inventory/list.json`,
    Storeden_Push_Product: `${STOREDEN_URL}/v1.1/inventory/inventory.json`,
    Storeden_Get_Orders: `${STOREDEN_URL}/v1.1/orders/list.json`,
    Storeden_Get_Order_Details: `${STOREDEN_URL}/v1.1/orders/order.json?orderID=`,
    Storeden_Push_Tracking_Details: `${STOREDEN_URL}/v1.1/orders/order.json?orderID=`,

    /* FBY API Parameters */
    FBY_GROUPCODE: `AEU`,
    FBY_PERPAGE: 200,
    ALERT_DOMAIN: `Iupiter`,
    OPERATION_CODE: `Exception`,
    OPERATION_TYPE: `Error`,
    FBY_UPDATE_AFTER: `2021-05-27 12:55:02`,
    GET_PRODUCT_ERROR: { staus: "Products Get Failed" },
    GET_ORDER_ERROR: { staus: "Orders Get Failed" },
    GET_PRODUCT_LOOP_FINISHED: { staus: "Products Processed" },

    PAYMENT_METHOD_CREDIT_CARD: `credit_card`,
    PAYMENT_ERROR_METHOD_NOT_ENABLED: `this payment method is not enabled`,
    PAYMENT_ERROR_PAYMENT_DATE_NULL: `this payment method requires a payment date`,
    FBY_ORDER_ALREADY_EXISTS: `Riga ordine già esistente`,
    FBY_ORDER_PRODUCT_NOT_FOUND: `Product not found`,
    FBY_PROCESSING_SUCCESS: { status: "Orders Processing to FBY Successfully completed." },
    PAYMENT_ERROR_RETRY_AFTER_HOURS: 4,
    AXIOS_CONFIG_WOOCOMMERCE_HEADERS: {
        headers: {
            "X-HTTP-Method-Override": `PUT`,
        },
    },
    WOOCOMMERCE_API_VERSION: "wc/v3",
    WOOCOMMERCE_API_TIMEOUT: 600000, //10Mintues

    CC_STOCK_UPDATE_NOT_ALLOWED_MSG: "Stock Update Not Allowed from CC. Enable this service for the channel in CC if you want to allow this update.",
    CC_PRICE_UPDATE_NOT_ALLOWED_MSG: "Price Update Not Allowed from CC. Enable this service for the channel in CC if you want to allow this update.",
    CC_ORDER_UPDATE_NOT_ALLOWED_MSG: "Order Update Not Allowed from CC. Enable this service for the channel in CC if you want to allow this update.",
    CC_PRODUCT_PUBLISH_UPDATE_NOT_ALLOWED_MSG: "Product Publish Update Not Allowed from CC. Enable this service for the channel in CC if you want to allow this update.",

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
        PRICE_SYNC: "PRICE",
        TRACK_SYNC: "SHIPMENT",
        UNKNOWN: "UNKNOWN",
        UPDATE: "UPDATE",
    },

    FBY_ALERT_DOMAIN: {
        LOGISTICA: "Logistica rifiutata",
        RICONCILIAZIONE: "Riconciliazione resi",
        ORDINI: "Ordini",
        IUPITER: "Iupiter",
        VALIDAZIONI: "Validazioni",
        SATELLITE: "Satellite",
        VALIDAZIONI_RECUPERABILI: "Validazioni recuperabili",
        PRODUCT: "Catalogo",
        GIACENZE: "Giacenze",
        LOGISTICA: "Logistica",
        CUSTOMER_SERVICE: "Customer Service",
        INDIRIZZI: "Indirizzi",
        NOTIFY_MANUAL: "Notifiche manuali",
        NOTIFY_INCOMPLETE: "Notifiche incomplete",
        CONFIGURATION: "Configurazioni",
        EBAY: "Ebay",

    },

    CC_OPERATIONS: {

        GET_PRODUCT_FROM_CHANNEL: "GET_PRODUCT_FROM_CHANNEL",
        GET_PRODUCT_LOCATION_FROM_CHANNEL: "GET_PRODUCT_LOCATION_FROM_CHANNEL",
        GET_ORDER_FROM_CHANNEL: "GET_ORDER_FROM_CHANNEL",
        GET_PRODUCT_REPORT_FROM_CHANNEL: "GET_PRODUCT_REPORT_FROM_CHANNEL",

        GET_PRODUCT_FROM_FBY: "GET_PRODUCT_FROM_FBY",
        GET_STOCK_FROM_FBY: "GET_STOCK_FROM_FBY",
        GET_TRAKING_FROM_FBY: "GET_TRACKING_FROM_FBY",
        GET_PRICES_FROM_FBY: "GET_PRICES_FROM_FBY",

        PUSH_STOCK_TO_CHANNEL: "PUSH_STOCK_TO_CHANNEL",
        PUSH_PRODUCTS_TO_CHANNEL: "PUSH_PRODUCTS_TO_CHANNEL",
        PUSH_TRAKING_TO_CHANNEL: "PUSH_TRACKING_TO_CHANNEL",

        PUSH_PRODUCTS_TO_FBY: "PUSH_PRODUCTS_TO_FBY",
        PUSH_ORDER_TO_FBY: "PUSH_ORDER_TO_FBY",
        PUSH_ORDER_TO_FBY_MISSING_DATA: "PUSH_ORDER_TO_FBY_MISSING_DATA",
        PUSH_CANCELLED_ORDER_TO_FBY: "PUSH_CANCELLED_ORDER_TO_FBY",
        PUSH_TRAKING_NOTIFICATION_TO_FBY: "PUSH_TRAKING_NOTIFICATION_TO_FBY",

        FBY_ALERT_INSERT: "FBY_ALERT_INSERT",
        DELETE_VARIANTS_WITH_BLANK_SKU_CHANNEL: "DELETE_VARIANTS_WITH_BLANK_SKU_CHANNEL",

        GET_AUTH_TOKEN_FROM_FBY: "GET_AUTH_TOKEN_FROM_FBY",
        
        GET_MASTER_DATA_CARRIER_MIRAKL: "GET_MASTER_DATA_CARRIER_MIRAKL",
        GET_ACCEPT_ORDER_MIRAKL: "GET_ACCEPT_ORDER_MIRAKL",
        GET_VALIDATE_SHIPMENT_MIRAKL: "GET_VALIDATE_SHIPMENT_MIRAKL",

    },

    LOG_LEVEL: {
        ERROR: "ERROR",
        INFO: "INFO",
        WARNING: "WARNING",
        URGENT: "URGENT"
    },
};

