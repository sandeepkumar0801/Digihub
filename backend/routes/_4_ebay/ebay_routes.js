const validations = require("./ebay_validation");
const constants = require("../../misc/constants");
const helpers = require("../../misc/helpers");
const logger = require("../../misc/logger")
const auth = require("../../middleware/auth");
const express = require('express');
const router = express.Router();
const ebayService = require("../../services/ebayService/ebay_service");
const ebay_error_manage = require("../../services/ebayService/ebay_error_manage");

/* product route */
router.get('/api/get_ebay_products', auth.checkMultiAuthorization, async (req, res) => {
    try {
        let operationId = helpers.getUUID();
        req.body = {
            operationId: operationId,
            action: 'get',
            ownerCode: '',
            channel: {
                name: ''
            }
        };

        let valid_check = await validations.ebayValidationQuery(req, res);
        if (!valid_check) return;


        await ebayService.getEbayProducts(req, res, operationId);

    } catch (error) {
        console.error(error);
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
});

router.get('/api/send_products_fby', auth.checkMultiAuthorization, async (req, res) => {
    try {
        let operationId = helpers.getUUID();
        req.body = {
            operationId: operationId,
            action: 'get',
            ownerCode: '',
            channel: {
                name: ''
            }
        };

        let valid_check = await validations.ebayValidationQuery(req, res);
        if (!valid_check) return;


        await ebayService.sendProductsFby(req, res, operationId);

    } catch (error) {
        console.error(error);
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
});

router.get('/api/get_fby_stock', auth.checkMultiAuthorization, async (req, res) => {
    try {
        let operationId = helpers.getUUID();
        req.body = {
            operationId: operationId,
            action: 'get',
            ownerCode: '',
            channel: {
                name: ''
            }
        };

        let valid_check = await validations.ebayValidationQuery(req, res);
        if (!valid_check) return;


        await ebayService.getFbyStock(req, res, operationId);

    } catch (error) {
        console.error(error);
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
})

router.get('/api/push_stock_ebay', auth.checkMultiAuthorization, async (req, res) => {
    try {
        let operationId = helpers.getUUID();
        req.body = {
            operationId: operationId,
            action: 'get',
            ownerCode: '',
            channel: {
                name: ''
            }
        };

        let valid_check = await validations.ebayValidationQuery(req, res);
        if (!valid_check) return;


        await ebayService.pushStockEbay(req, res, operationId);

    } catch (error) {
        console.error(error);
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
});

/* order route */
router.get('/api/get_ebay_orders', auth.checkMultiAuthorization, async (req, res) => {
    try {
        let operationId = helpers.getUUID();
        req.body = {
            operationId: operationId,
            action: 'get',
            ownerCode: '',
            channel: {
                name: ''
            }
        };

        let valid_check = await validations.ebayValidationQuery(req, res);
        if (!valid_check) return;


        await ebayService.getEbayOrders(req, res, operationId);

    } catch (error) {
        console.error(error);
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
});

router.get('/api/send_orders_fby', auth.checkMultiAuthorization, async (req, res) => {
    try {
        let operationId = helpers.getUUID();
        req.body = {
            operationId: operationId,
            action: 'get',
            ownerCode: '',
            channel: {
                name: ''
            }
        };

        let valid_check = await validations.ebayValidationQuery(req, res);
        if (!valid_check) return;


        await ebayService.sendOrdersFby(req, res, operationId);

    } catch (error) {
        console.error(error);
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
});

router.get('/api/send_canceled_orders_fby', auth.checkMultiAuthorization, async (req, res) => {
    try {
        let operationId = helpers.getUUID();
        req.body = {
            operationId: operationId,
            action: 'get',
            ownerCode: '',
            channel: {
                name: ''
            }
        };

        let valid_check = await validations.ebayValidationQuery(req, res);
        if (!valid_check) return;


        await ebayService.sendCanceledOrdersFby(req, res, operationId);

    } catch (error) {
        console.error(error);
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
});

router.get('/api/get_track_number', auth.checkMultiAuthorization, async (req, res) => {
    try {
        let operationId = helpers.getUUID();
        req.body = {
            operationId: operationId,
            action: 'get',
            ownerCode: '',
            channel: {
                name: ''
            }
        };

        let valid_check = await validations.ebayValidationQuery(req, res);
        if (!valid_check) return;


        await ebayService.getFbyTraknumber(req, res, operationId);

    } catch (error) {
        console.error(error);
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
});

router.get('/api/push_traks_ebay', auth.checkMultiAuthorization, async (req, res) => {
    try {
        let operationId = helpers.getUUID();
        req.body = {
            operationId: operationId,
            action: 'get',
            ownerCode: '',
            channel: {
                name: ''
            }
        };

        let valid_check = await validations.ebayValidationQuery(req, res);
        if (!valid_check) return;


        await ebayService.pushTrackEbay(req, res, operationId);

    } catch (error) {
        console.error(error);
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
});

/* Error Management route */
router.get('/api/error_manage', auth.checkMultiAuthorization, async (req, res) => {
    try {
        let operationId = helpers.getUUID();
        req.body = {
            operationId: operationId,
            action: 'get',
            ownerCode: '',
            channel: {
                name: ''
            }
        };

        let valid_check = await validations.ebayValidationCase(req, res);
        if (!valid_check) return;

        await ebay_error_manage.errorManager(req, res, operationId);

    } catch (error) {
        console.error(error);
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
});



module.exports = router;