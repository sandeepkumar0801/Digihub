

class CCLogs {

    constructor(fby_user_id, order_no, sku, message, data, level, fby_alert_code, cc_operation, operation_id) {
        try {
            message = typeof message != 'string' ? JSON.stringify(message) : message;
            data = typeof data != 'string' ? JSON.stringify(data) : data;
        }
        catch (error) {
            console.log(error);

        }
        try {
            this.fby_user_id = fby_user_id != undefined && fby_user_id != null ? fby_user_id : 0,
            this.order_no = order_no != undefined && order_no != null ? order_no : '',
            this.sku = sku != undefined && sku != null ? sku : '',
            this.message = message != undefined && message != null ? JSON.stringify(message) : '',
            this.data = data != undefined && data != null ? JSON.stringify(data) : '',
            this.level = level != undefined && level != null ? level : '',
            this.fby_alert_code = fby_alert_code != undefined && fby_alert_code != null ? fby_alert_code : '',
            this.cc_operation = cc_operation != undefined && cc_operation != null ? cc_operation : '',
            this.operation_id = operation_id != undefined && operation_id != null ? operation_id : ''
        }
        catch (error) {
            this.fby_user_id = 0,
            this.order_no = '',
            this.sku = '',
            this.message = '',
            this.data = '',
            this.level = '',
            this.fby_alert_code = '',
            this.cc_operation = 'INFO',
            this.operation_id = ''

        }
    }
};

exports.CCLogs = CCLogs;