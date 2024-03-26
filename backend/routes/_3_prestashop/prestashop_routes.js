const validations = require("./prestashop_validation");
const constants = require("../../misc/constants");
const helpers = require("../../misc/helpers");
const logger = require("../../misc/logger")
const auth = require("../../middleware/auth");
const express = require('express');
const router = express.Router();
const prestashopService = require("../../services/prestashopService/prestashop_service");
const prestashop_error_manage = require("../../services/prestashopService/prestashop_error_manage");

/* product route */
router.get('/api/get_presta_products', auth.checkMultiAuthorization, async (req, res) => {
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

        let valid_check = await validations.prestashopValidationQuery(req, res);
        if (!valid_check) return;


        await prestashopService.getPrestaProducts(req, res, operationId);

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

        let valid_check = await validations.prestashopValidationQuery(req, res);
        if (!valid_check) return;


        await prestashopService.sendProductsFby(req, res, operationId);

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

router.get('/api/push_stock_presta', auth.checkMultiAuthorization, async (req, res) => {
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

        let valid_check = await validations.prestashopValidationQuery(req, res);
        if (!valid_check) return;


        await prestashopService.pushStockPresta(req, res, operationId);

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
router.get('/api/get_presta_orders', auth.checkMultiAuthorization, async (req, res) => {
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

        let valid_check = await validations.prestashopValidationQuery(req, res);
        if (!valid_check) return;


        await prestashopService.getPrestaOrders(req, res, operationId);

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

router.get('/api/push_tracks', auth.checkMultiAuthorization, async (req, res) => {
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

        let valid_check = await validations.prestashopValidationQuery(req, res);
        if (!valid_check) return;


        await prestashopService.pushTrackPresta(req, res, operationId);

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