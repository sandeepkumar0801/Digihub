const sendMail = require("../constants/mailer.js").sendMail;

/**
 * 
 *@description list of mail functions that are used for sending mails when error occoured in Fby api work
 */
exports.tokenMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while getting <b>JWT Token</b> from FBY</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b>${error}</b></p>`,
  };
  //sendMail(options);
};

exports.stockListMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while getting <b>Stocks</b> from FBY</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
}

exports.skuInsertMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while inserting skus to FBY</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};
exports.cancelOrderInsertMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while sending canceled order to FBY</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

/**
 * 
 *@description list of mail functions that are used for for sending mails when error occoured in database query
 */
exports.userErrMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while getting <b>User Details</b> from DB</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

exports.shpiUserErrMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while getting <b>ShopifyUser Details</b> from DB</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

exports.getProdErrMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while getting <b>product Details</b> from DB</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

exports.getProdByDomainErrMail = async (cron_name, cron_id, fby_id, domain, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while getting <b>product Details</b> by domain from DB</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>User Domain: <b>${domain}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

exports.updateProductErrMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while updating <b>product Details</b> in DB</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};
exports.updateProdLocationErrMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while updating <b>product location</b> in DB</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

exports.addProductErrMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while adding <b>products</b> in DB</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

exports.addStockErrMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while adding <b>Stocks</b> in DB</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

/**
 * 
 *@description list of mail functions that are used for sending mails when error occoured in shopify channel api work
 */
exports.shopifyGetProdMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while getting products from Shopify</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

exports.shopifyGetOrderMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while getting Orders from Shopify</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  sendMail(options);
};

exports.shopifyPushProdMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while updating Inventry in Shopify</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

exports.shopifyPushTrackMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while updating Tracking Number in Shopify</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

exports.storeDenPushTrackMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while updating Tracking Number in Storeden</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

exports.woocommercePushTrackMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while updating Tracking Number in WooCommerce</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

/**
 * 
 *@description list of mail functions that are used for sending mails when error occoured at Order work
 */

exports.updateOrderErrMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while updating <b>Order_masters</b> status in DB</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

exports.trakListMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while getting <b>Traking Order list</b> from FBY</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

exports.addOrderTrackingErrMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while adding <b>Tracking Order list</b> in 'temp_order_inventory'</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

/**
 * 
 *@description list of mail functions that are used for sending mails when error occoured at Cron work
 */
exports.cronLogErrMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while inserting CRON Error Log</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};

exports.cronProcessErrMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while Inserting or Updating CRON process details</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  //sendMail(options);
};


/**
 * 
 *@description list of mail functions that are used for sending mails when error occoured in channel's api work
 */
 exports.GetProdMail = async (channel, cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while getting products details from ${channel}</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  // sendMail(options);
}

exports.GetOrderMail = async (channel, cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while getting Orders from ${channel}</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  // sendMail(options);
}

exports.PushProdMail = async (channel, cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while updating product quantity in ${channel}</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  // sendMail(options);
}

exports.PushTrackMail = async (channel, cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while updating Tracking Details in ${channel}</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  // sendMail(options);
}

exports.orderInsertMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while sending orders to FBY</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  // sendMail(options);
}

exports.cancelOrderInsertMail = async (cron_name, cron_id, fby_id, error) => {
  let options = {
    subject: "ERROR at " + cron_name,
    body: `<p>You got an error while sending canceled order to FBY</p><p>FBY User ID: <b>${fby_id}</b></p><p>cron ID: <b>${cron_id}</b></p><p>Error: <b><code>${error}</b></code></p>`,
  };
  // sendMail(options);
}