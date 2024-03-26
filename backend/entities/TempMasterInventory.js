class TempMasterInventory {
    // table_name = 'channelconnector.temp_master_inventory';
    constructor(sku_id, skucode, barcode, quantity, priority, cron_id, fby_user_id) {
      this.sku_id = sku_id,
        this.skucode = skucode,
        this.barcode = barcode,
        this.quantity = quantity,
        this.priority = priority,
        this.cron_id = cron_id,
        this.fby_user_id = fby_user_id
    }
}
exports.TempMasterInventory = TempMasterInventory;