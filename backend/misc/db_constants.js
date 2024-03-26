const dbname = process.env.DB_DATABASE;
module.exports.DB = {
    DBNAME: dbname,
    TABLES: {
        WINSTON_ERROR_LOGS: `winston_logs`,
        WINSTON_INFO_LOGS: `winston_logs`
    }
};

module.exports.DB_CONSTANTS_CLINET = {
    POST: `call ${dbname}._1_client_Post(?, ?, ?)`,
    PUT: `call ${dbname}._1_client_Put(?, ?, ?)`,
    GET: `call ${dbname}._1_client_Get(?)`,
    DELETE: `call ${dbname}._1_client_Delete(?)`,
};

module.exports.DB_CONSTANTS_CHANNEL = {
    POST: `call ${dbname}._2_channel_Post(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        ,?  
        ,?
        ,?
        ,?
        ,?
        ,?
        ,?
        )`,
    PUT: `call ${dbname}._2_channel_Put(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        ,?  
        ,?
        ,?
        ,?
        ,?
        ,?
        ,?
        )`,
    GET: `call ${dbname}._2_channel_Get(?)`,
    DELETE: `call ${dbname}._2_channel_Delete(?)`,
};

module.exports.DB_CONSTANTS_WINSTON_LOGS = {
    POST: `call ${dbname}._3_winston_logs_Post(?, ?, ?, ?)`,
    GET: `call ${dbname}._3_winston_logs_Get(?, ?)`,
};


module.exports.DB_CONSTANTS_ACCOUNT = {
    USER: `CALL ${dbname}.get_user(?)`,
    // PRESTASHOP_USER: `CALL ${dbname}.getPrestashopUser(?,?)`,
    GET_SHOPIFY_USER: `CALL ${dbname}.getShopifyUser(?)`,
    BULK_CRON_LOG: `CALL ${dbname}.getBulkCronLog(?,?,?)`,
    GET_CHANNEL_USER: `CALL ${dbname}.getChannelUser(?,?,?)`,
};

module.exports.DB_CONSTANTS_CRON = {
    INSERT_CRONPROCESS: `CALL ${dbname}.insertCron(?,?,?,?)`,
    UPDATE_CRONPROCESS: `CALL ${dbname}.updateCron(?,?)`,
    FBY_CRON_MANAGE: `CALL ${dbname}.fbyCronErrorManage(?,?,?,?,?,?)`,
    FBY_PRODUCT_ERR_MANAGE: `CALL ${dbname}.fbyProductErrorManage(?,?,?,?,?,?,?,?)`,
    FBY_ORDER_ERR_MANAGE: `CALL ${dbname}.fbyOrderErrorManage(?,?,?,?,?,?,?,?)`,
    FBY_ORDER_TRACKING_ERR_MANAGE: `CALL ${dbname}.fbyOrderTrackErrorManage(?,?,?,?,?,?,?,?)`,
    FBY_CANCEL_ORDER_ERR_MANAGE: `CALL ${dbname}.fbyCanclOrderErrorManage(?,?,?,?,?,?,?,?,?)`,
    CRON_ERROR_LOG: `CALL ${dbname}.cronErrorLog(?,?,?,?,?)`,
    GET_BULK_CRON_LOG: `CALL ${dbname}.getBlukCronByFlag(?,?)`,
};

module.exports.DB_CONSTANTS_MAP_CODES = {
    GET_ALERT_CODE: `CALL ${dbname}.getAlertCode(?,?)`,
    GET_PAYMENT_METHOD: `CALL ${dbname}.getPaymentMethod(?,?)`,
    GET_CANCEL_REASON: `CALL ${dbname}.getCancelReason(?,?)`,
};

module.exports.DB_CONSTANTS_PRODUCT = {
    INSERT_PRODUCT: `CALL ${dbname}.addProduct(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    UNSEND_PRODUCT: `CALL ${dbname}.getProductByStatus(?)`,
    SEND_NEW_QUANTITY: `CALL ${dbname}.getProductByDomain(?,?)`,
    GET_PRODUCT_BY_FLAG: `CALL ${dbname}.getProductByFlag(?)`,
    GET_PRODUCT_BY_SKU: `CALL ${dbname}.getProductBySku(?,?)`,
    GET_PRODUCT_BARCODE: `CALL ${dbname}.getLocationId(?,?,?)`,
    UPDATE_PRODUCT_CRON: `CALL ${dbname}.updateProductCron(?,?,?,?)`,
    PRODUCT_SEND_FBY: `CALL ${dbname}.updateProductStatus(?,?,?,?,?,?,?,?,?)`,
    SET_NEW_QUANTITY: `CALL ${dbname}.updateProduct(?,?,?,?)`,
    updateProductAftrSndChanl: `CALL ${dbname}.updateProductAftrSndChanl(?,?,?,?,?)`,
};

module.exports.DB_CONSTANTS_ORDER = {
    INSERT_ORDER_LINEITEM: `CALL ${dbname}.addOrderDetails(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    INSERT_ORDER_TOTAL: `CALL ${dbname}.addOrderMaster(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    GET_CANCELED_ORDERS: `CALL ${dbname}.getCanceledOrderDetails(?,?,?,?)`,
    GET_UNTRACKED_ORDERS: `CALL ${dbname}.getUntrackOrders(?,?)`,
    GET_UNSEND_ORDER: `CALL ${dbname}.getOrderByStatus(?)`,
    GET_ORDER_BY_ACCOUNT: `CALL ${dbname}.getOrderByAccount(?,?)`,
    GET_TRACKABLE_LINEITEMS: `CALL ${dbname}.getOrderDetailsTracking(?,?)`,
    GET_UNSEND_ORDER_LINEITEMS: `CALL ${dbname}.getOrderDetails(?,?)`,
    GET_ORDER_BY_FLAG: `CALL ${dbname}.getOrderByFlag(?)`,
    GET_CNCL_ORDER_BY_FLAG: `CALL ${dbname}.getCancelOrderByFlag(?)`,
    GET_EBAY_TRACKABLE_ORDERDETAILS: `CALL ${dbname}.getEbayOrderDetailTracking(?,?,?)`,
    UPDATE_ORDER_CANCEL_STATUS: `CALL ${dbname}.updateOrderCancelStatus(?,?,?,?,?,?,?)`,
    UPDATE_ORDER_CRON: `CALL ${dbname}.updateOrderCron(?,?,?,?)`,
    UPDATE_ORDER_TRACKING_CRON: `CALL ${dbname}.updateOrderTrackingCron(?,?,?,?)`,
    UPDATE_CANCEL_ORDER_CRON: `CALL ${dbname}.updateCancelOrderCron(?,?,?,?)`,
    UPDATE_CANCEL_ORDER_SENT: `CALL ${dbname}.updateOrderCancel(?,?,?,?,?)`,
    UPDATE_ORDER_SEND_FBY: `CALL ${dbname}.updateOrderStatus(?,?,?,?,?,?,?)`,
    UPDATE_ORDER_TRACK_NO: `CALL ${dbname}.updateOrder(?,?,?,?,?,?,?,?,?,?)`,
    UPDATE_TRACK_NO_SENT: `CALL ${dbname}.updateOrderDetailStatus(?,?,?,?,?)`,
    UPDATE_EBAY_TRACK_NO_SENT: `CALL ${dbname}.updateEbayTrackSent(?,?,?,?,?)`,
    IS_ORDER_NOTIFIED: `CALL ${dbname}.isOrderNotified(?,?,?,?)`,
    UPDATE_ORDER_NOTIFIED: `CALL ${dbname}.update_Order_Notified(?,?,?,?)`,
};


module.exports.DB_CONSTANTS_CCLOGS = {
    POST: `call cclogs._1_logs_Post(?,?,?,?,?,?,?,?,?)`,
    GET: `call cclogs._2_logs_Get(?)`,
    UPDATE_SUCESS: `call cclogs._3_logs_Update_Sucess(    ?,    ?)`,
    UPDATE_FAIL: `call cclogs._4_logs_Update_Fail(    ?,    ?, ?)`,

    /*

    
CREATE PROCEDURE cclogs._1_logs_Post(
`in_fby_user_id` INT,
`in_order_no` varchar(128) ,
`in_sku` varchar(128) ,
`in_message` text,
`in_data` text,
`in_level` varchar(128) ,
`in_codes` varchar(128) ,
`in_operation` varchar(256) ,
`in_operation_id` varchar(128) 

)

CREATE PROCEDURE cclogs._2_logs_Get(
`in_fby_user_id` INT
)

CREATE PROCEDURE cclogs._3_logs_Update_Sucess
(
    in_fby_user_id INT,
    logIds text -- Comman saperated logids
)

CREATE PROCEDURE cclogs._4_logs_Update_Fails
(
    in_fby_user_id INT,
    logIds text, -- Comman saperated logids
    in_fbyAlertInsertError text
)

    */
};