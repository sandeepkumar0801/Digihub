// const mongoose = require("mongoose");

// const LogsSchema = new mongoose.Schema({
//     fby_user_id: {
//         type: Number,
//         require: true,
//     },
//     order_no: {
//         type: String,
//         default: ""
//     },
//     sku: {
//         type: String,
//         default: ""
//     },
//     message: {
//         type: String,
//         default: ""
//     },
//     data: {
//         type: String,
//         default: ""
//     },
//     counter: {
//         type: Number,
//         default: 0
//     },
//     level: {
//         type: String,
//         default: "INFO"
//     },
//     fby_alert_code: {
//         type: String
//     },
//     cc_operation: {
//         type: String
//     },
//     operation_id: {
//         type: String,
//         default: ""
//     },
//     createdOn: {
//         type:Date,
//         default: Date.now
//     },
//     updatedOn: {
//         type:Date,
//         default: ""
//     },
//     isAlertSentToFBY: {
//         type: Number,
//         default: 0,
//     },
//     alertSentOn: {
//         type: Date, 
//         default: ""
//     }, 
//     fbyAlertRetryCounter: {
//         type: Number,
//         default: 0
//     },
//     fbyAlertInsertError: {
//         type: String
//     },
//     partition_key: {
//         type:Date,
//         required: true,
//         default: Date.now
//     },
//     checksum: {
//         type: String,
//         default: ""
//     },
// },
// {timestamps: true}
// );

// module.exports = mongoose.model("CCLogs", LogsSchema);