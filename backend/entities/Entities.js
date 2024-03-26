const { TempMasterInventory } = require('./TempMasterInventory');
const { CCLogs } = require('./CCLogs');

exports.TempMasterInventory = TempMasterInventory;
exports.CCLogs = CCLogs;

module.exports.TABLE_NAME = {
  TempMasterInventory:`channelconnector.temp_master_inventory`,
  CCLogs:`cclogs._logs`,
};