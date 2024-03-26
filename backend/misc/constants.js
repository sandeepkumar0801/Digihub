const path = require('path');

module.exports.ACTION = {
    INSERT: "insert",
    UPDATE: "update",
    DELETE: "delete",
    GET: "get"
};

module.exports.HTTPSTATUSCODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    UNAUTHORIZED : 401, 
};

module.exports.ERRORCODES = {
    NOT_FOUND: `NOT_FOUND`,
    DUPLICATE_RESOURCE: `DUPLICATE_RESOURCE`,
    INTERNAL_SERVER_ERROR: `SERVICE_NOT_AVAILABLE`,
    VALIDATION_ERROR: `INVALID_PAYLOAD_PARAMS`,
};

module.exports.SUCESSSMESSAGES = {
    INSERT: `Requested data has been created successfully.`,
    UPDATE: `Requested data has been updated successfully.`,
    DELETE: `Requested data has been deleted successfully.`,
    GET: `Requested data has been fetched successfully.`,
    EXECUTED: ` action processed successfully.`,
};

module.exports.ERRORMESSAGES = {
    NOT_FOUND: `Requested data not found!. Please check request data.`,
    DUPLICATE_RESOURCE: `Resource already exists!`,
    INTERNAL_SERVER_ERROR: `Something went wrong! Please try again later.`,

};

module.exports.CUSTOM_MESSAGES = {
    GET_UNSEND_PRODUCT:"Get unsend products",
    GET_UNSEND_ORDER:"Get unsend orders",
    GET_UNTRACKED_ORDER:"Get untracked orders",
    GET_TRACKABLE_LISTITEM:"Get tracked order details",
    GET_ORDER_DETAIL:"Get order details by order number",
    GET_USER:"Get user detail from users by fby_user_id",
    GET_PRESTASHOP_USER:"Get prestashop user detail from prestashop_accoount by fby_user_id",
    GET_PRODUCT_BY_DOMAIN:"Get product details by domain from products to update quantity",
    GET_CANCELED_ORDERS:"Get Canceled Orders from order_details",
    GET_JWT_TOKEN:"Get JWT Token",
    BLANK:"",
    CURRENT_STATE:"4",
    GET_CHHANEL_USER: " user detail from _2_channel by channelid",
};

module.exports.API_TYPES = {
    FBY: "FBY",
    SHOPIFY: "SHOPIFY",
    STOREDEN: "STOREDEN",
    PRESTASHOP: "PRESTASHOP",
    WOOCOMMERCE: "WOOCOMMERCE",
    EBAY: "EBAY",
    MIRAKL: "MIRAKL",
    AMAZON: "AMAZON",
    MAGENTO: "MAGENTO"
};

module.exports.EBAY_KEYS = {
    ALL_ITEM: 'GetMyeBaySelling',
    SINGLE_ITEM: 'GetItem',
    GET_ORDERS: 'GetOrders',
    UPDATE_QUANTITY: "ReviseInventoryStatus",
    UPDATE_TRACKING: "CompleteSale",
};


module.exports.CACHE_KEYS = {
    FBYUSER: 'GET_USERS',
    CHANNEL_USER: 'GET_CHANNEL_USER',
   
};