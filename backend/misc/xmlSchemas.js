exports.getStockavAilableSchema = (stock_availables, item) => {
    const stock_available_xml_schema = '<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">' +
        '<stock_available><id><![CDATA[' + stock_availables.id + ']]></id>' +
        '<id_product><![CDATA[' + stock_availables.id_product + ']]></id_product>' +
        '<id_product_attribute><![CDATA[' + stock_availables.id_product_attribute + ']]></id_product_attribute>' +
        '<id_shop><![CDATA[' + stock_availables.id_shop + ']]></id_shop>' +
        '<id_shop_group><![CDATA[]]></id_shop_group>' +
        '<quantity><![CDATA[' + item.inventory_quantity + ']]></quantity>' +
        '<depends_on_stock><![CDATA[' + stock_availables.depends_on_stock + ']]></depends_on_stock>' +
        '<out_of_stock><![CDATA[' + stock_availables.out_of_stock + ']]></out_of_stock>' +
        '<location><![CDATA[]]></location>' +
        '</stock_available>' +
        '</prestashop>';
    return stock_available_xml_schema;
};

exports.getOrderSchema = (order) => {
    const order_xml_schema = `<?xml version="1.0" encoding="UTF-8"?>
    <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
    <order>
        <id><![CDATA[${order.id}]]></id>
        <id_address_delivery xlink:href="http://prestashop.yocabe.com/api/addresses/${order.id_address_delivery}"><![CDATA[${order.id_address_delivery}]]></id_address_delivery>
        <id_address_invoice xlink:href="http://prestashop.yocabe.com/api/addresses/${order.id_address_invoice}"><![CDATA[${order.id_address_invoice}]]></id_address_invoice>
        <id_cart xlink:href="http://prestashop.yocabe.com/api/carts/${order.id_cart}"><![CDATA[${order.id_cart}]]></id_cart>
        <id_currency xlink:href="http://prestashop.yocabe.com/api/currencies/${order.id_currency}"><![CDATA[${order.id_currency}]]></id_currency>
        <id_lang xlink:href="http://prestashop.yocabe.com/api/languages/${order.id_lang}"><![CDATA[${order.id_lang}]]></id_lang>
        <id_customer xlink:href="http://prestashop.yocabe.com/api/customers/${order.id_customer}"><![CDATA[${order.id_customer}]]></id_customer>
        <id_carrier xlink:href="http://prestashop.yocabe.com/api/carriers/${order.id_carrier}"><![CDATA[${order.id_carrier}]]></id_carrier>
        <current_state><![CDATA[4]]></current_state>
        <module><![CDATA[${order.module}]]></module>
        <invoice_number><![CDATA[${order.invoice_number}]]></invoice_number>
        <invoice_date><![CDATA[${order.invoice_date}]]></invoice_date>
        <delivery_number><![CDATA[${order.delivery_number}]]></delivery_number>
        <delivery_date><![CDATA[${order.delivery_date}]]></delivery_date>
        <valid><![CDATA[${order.valid}]]></valid>
        <date_add><![CDATA[${order.date_add}]]></date_add>
        <date_upd><![CDATA[${order.date_upd}]]></date_upd>
        <shipping_number notFilterable="true"><![CDATA[${order.shipping_number}]]></shipping_number>
        <note><![CDATA[${order.note}]]></note>
        <id_shop_group><![CDATA[${order.id_shop_group}]]></id_shop_group>
        <id_shop><![CDATA[${order.id_shop}]]></id_shop>
        <secure_key><![CDATA[${order.secure_key}]]></secure_key>
        <payment><![CDATA[${order.payment}]]></payment>
        <recyclable><![CDATA[${order.recyclable}]]></recyclable>
        <gift><![CDATA[${order.gift}]]></gift>
        <gift_message><![CDATA[${order.gift_message}]]></gift_message>
        <mobile_theme><![CDATA[${order.mobile_theme}]]></mobile_theme>
        <total_discounts><![CDATA[${order.total_discounts}]]></total_discounts>
        <total_discounts_tax_incl><![CDATA[${order.total_discounts_tax_incl}]]></total_discounts_tax_incl>
        <total_discounts_tax_excl><![CDATA[${order.total_discounts_tax_excl}]]></total_discounts_tax_excl>
        <total_paid><![CDATA[${order.total_paid}]]></total_paid>
        <total_paid_tax_incl><![CDATA[${order.total_paid_tax_incl}]]></total_paid_tax_incl>
        <total_paid_tax_excl><![CDATA[${order.total_paid_tax_excl}]]></total_paid_tax_excl>
        <total_paid_real><![CDATA[${order.total_paid_real}]]></total_paid_real>
        <total_products><![CDATA[${order.total_products}]]></total_products>
        <total_products_wt><![CDATA[${order.total_products_wt}]]></total_products_wt>
        <total_shipping><![CDATA[${order.total_shipping}]]></total_shipping>
        <total_shipping_tax_incl><![CDATA[${order.total_shipping_tax_incl}]]></total_shipping_tax_incl>
        <total_shipping_tax_excl><![CDATA[${order.total_shipping_tax_excl}]]></total_shipping_tax_excl>
        <carrier_tax_rate><![CDATA[${order.carrier_tax_rate}]]></carrier_tax_rate>
        <total_wrapping><![CDATA[${order.total_wrapping}]]></total_wrapping>
        <total_wrapping_tax_incl><![CDATA[${order.total_wrapping_tax_incl}]]></total_wrapping_tax_incl>
        <total_wrapping_tax_excl><![CDATA[${order.total_wrapping_tax_excl}]]></total_wrapping_tax_excl>
        <round_mode><![CDATA[${order.round_mode}]]></round_mode>
        <round_type><![CDATA[${order.round_type}]]></round_type>
        <conversion_rate><![CDATA[${order.conversion_rate}]]></conversion_rate>
        <reference><![CDATA[${order.reference}]]></reference>
    </order>
    </prestashop>`;
    return order_xml_schema;
};

exports.getOrderCarierSchema = (order_carriers, item, domain) => {
    const order_carrier_xml_schema = `<?xml version="1.0" encoding="UTF-8"?>
    <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
    <order_carrier>
        <id><![CDATA[${order_carriers.id}]]></id>
        <id_order xlink:href="${domain}/api/orders/5"><![CDATA[${order_carriers.id_order}]]></id_order>
        <id_carrier xlink:href="${domain}/api/carriers/2"><![CDATA[${order_carriers.id_carrier}]]></id_carrier>
        <id_order_invoice><![CDATA[${order_carriers.id_order_invoice}]]></id_order_invoice>
        <weight><![CDATA[${order_carriers.weight}]]></weight>
        <shipping_cost_tax_excl><![CDATA[${order_carriers.shipping_cost_tax_excl}]]></shipping_cost_tax_excl>
        <shipping_cost_tax_incl><![CDATA[${order_carriers.shipping_cost_tax_incl}]]></shipping_cost_tax_incl>
        <tracking_number><![CDATA[${item.tracking_id}]]></tracking_number>
        <date_add><![CDATA[${order_carriers.date_add}]]></date_add>
    </order_carrier>
    </prestashop>`;
    return order_carrier_xml_schema;
};

/* Ebay XML Schemas */
exports.GetMyeBaySellingSchema = (ebayAuthToken, perPage, currentPage) => {
    const GetMyeBaySelling_schema = `<?xml version="1.0" encoding="utf-8"?>
    <GetMyeBaySellingRequest xmlns="urn:ebay:apis:eBLBaseComponents">
        <RequesterCredentials>
            <eBayAuthToken>${ebayAuthToken}</eBayAuthToken>
        </RequesterCredentials>
        <ActiveList>
            <Pagination>
                <EntriesPerPage>${perPage}</EntriesPerPage>
                <PageNumber>${currentPage}</PageNumber>
            </Pagination>
            <DetailLevel>ReturnAll</DetailLevel>
        </ActiveList>
    </GetMyeBaySellingRequest>`;
    return GetMyeBaySelling_schema;
};

exports.GetItemSchema = (ebayAuthToken, itemId) => {
    const GetItem_schema = `<?xml version="1.0" encoding="utf-8"?>
    <GetItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
        <RequesterCredentials>
            <eBayAuthToken>${ebayAuthToken}</eBayAuthToken>
        </RequesterCredentials>
        <ItemID>${itemId}</ItemID>
        <IncludeItemSpecifics>true</IncludeItemSpecifics>  
    </GetItemRequest>`;
    return GetItem_schema;
};

exports.GetItemVariationSchema = (ebayAuthToken, itemId, variationSku) => {
    const GetItem_schema = `<?xml version="1.0" encoding="utf-8"?>
    <GetItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
        <RequesterCredentials>
            <eBayAuthToken>${ebayAuthToken}</eBayAuthToken>
        </RequesterCredentials>
        <ItemID>${itemId}</ItemID>
        <VariationSKU>${variationSku}</VariationSKU>
        <ActiveList>
            <DetailLevel>ReturnAll</DetailLevel>
        </ActiveList>
        <IncludeItemSpecifics>true</IncludeItemSpecifics>  
    </GetItemRequest>`;
    return GetItem_schema;
};

exports.GetOrdersSchema = (ebayAuthToken, modTimeFrom, modTimeTo, perPage, currentPage) => {
    const GetOrders_schema = `<?xml version="1.0" encoding="utf-8"?>
    <GetOrdersRequest xmlns="urn:ebay:apis:eBLBaseComponents">
        <RequesterCredentials>
            <eBayAuthToken>${ebayAuthToken}</eBayAuthToken>
        </RequesterCredentials>
        <ModTimeFrom>${modTimeFrom}</ModTimeFrom>
        <ModTimeTo>${modTimeTo}</ModTimeTo>
        <OrderStatus>All</OrderStatus>
        <DetailLevel>ReturnAll</DetailLevel>
        <Pagination>
            <EntriesPerPage>${perPage}</EntriesPerPage>
            <PageNumber>${currentPage}</PageNumber>
        </Pagination>
    </GetOrdersRequest>`;
    return GetOrders_schema;
};

exports.ReviseInventoryStatusSchema = (ebayAuthToken, item_id, quantity, sku) => {
    const ReviseInventoryStatus_schema = `<?xml version="1.0" encoding="utf-8"?>
    <ReviseInventoryStatusRequest xmlns="urn:ebay:apis:eBLBaseComponents">
      <RequesterCredentials>
        <eBayAuthToken>${ebayAuthToken}</eBayAuthToken>
      </RequesterCredentials>
      <InventoryStatus>
        <ItemID>${item_id}</ItemID>
        <Quantity>${quantity}</Quantity>
        <SKU>${sku}</SKU>
      </InventoryStatus>
    </ReviseInventoryStatusRequest>`;
    return ReviseInventoryStatus_schema;
};

exports.CompleteSaleSchema = (ebayAuthToken, order_id, TrackingNumber, TrackingCarrier) => {
    const CompleteSale_schema = `<?xml version="1.0" encoding="utf-8"?>
    <CompleteSaleRequest xmlns="urn:ebay:apis:eBLBaseComponents">
      <RequesterCredentials>
        <eBayAuthToken>${ebayAuthToken}</eBayAuthToken>
      </RequesterCredentials>
      <OrderID>${order_id}</OrderID>
      <Shipped>true</Shipped>
      <Shipment>
        <ShipmentTrackingDetails>
          <ShipmentTrackingNumber>${TrackingNumber}</ShipmentTrackingNumber>
          <ShippingCarrierUsed>${TrackingCarrier}</ShippingCarrierUsed>
        </ShipmentTrackingDetails>
      </Shipment>
    </CompleteSaleRequest>`;
    return CompleteSale_schema;
};

/* Magento Schemas */

exports.Stock_Item_Schema = (item_id, quantity, status) => {
    const Stock_Item_schema = `{
        "stock_item": {
           "item_id": ${item_id},
           "qty": ${quantity},
           "is_in_stock": ${status} 
        }
    }`;
    return Stock_Item_schema;
};


exports.Shipment_Track_Schema = (order_id, parent_id, TrackingNumber, TrackingCarrier) => {
    const Shipment_Track_schema = `{
        "entity": {
            "order_id": ${order_id},
            "parent_id": ${parent_id},
            "track_number": ${TrackingNumber},
            "carrier_code": "${TrackingCarrier}"
        }
    }`;
    return Shipment_Track_schema;
};

exports.Shipment_Create_Schema = (TrackingNumber, TrackingCarrier, TrackingTitle) => {
    const Shipment_Create_schema = `{
        "tracks": [
          {
            "track_number": "${TrackingNumber}",
            "title": "${TrackingTitle}",
            "carrier_code": "${TrackingCarrier}"
          }
        ]
      }`;
    return Shipment_Create_schema;
};