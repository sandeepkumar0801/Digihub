
const constants = require("../../misc/constants");
const helpers = require("../../misc/helpers");
const auth = require("../../middleware/auth");
const express = require('express');
const router = express.Router();
const clientService = require("../../services/client_service");
const validations = require("./client_validations");
const logger = require("../../misc/logger");

router.post('/', auth.checkMultiAuthorization, async (req, res) => {
    try {
        if (!validations.clientValidationPOST(req, res)) return;

        let operationId = helpers.getUUID();
        req.body.operationId = operationId;
        let { variables, result } = await clientService.processClientRequest(req, res);

        if (variables !== undefined
            && variables.isErrorAlreadyExists !== undefined
            && variables.isErrorAlreadyExists
        ) {

            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.CONFLICT,
                constants.ERRORCODES.DUPLICATE_RESOURCE,
                `${constants.ERRORMESSAGES.DUPLICATE_RESOURCE} Please check clientId or ownerCode.`,
                req.body
            );

        }
        else if (variables === undefined || !variables.clientId) {

            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                req.body
            );

        }

        helpers.sendSuccess(
            res,
            constants.HTTPSTATUSCODES.OK,
            req.body.action.toUpperCase() + constants.SUCESSSMESSAGES.EXECUTED,
            result,
            req.body
        );
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


router.get('/', auth.checkMultiAuthorization, async (req, res) => {
    try {
        let operationId = helpers.getUUID();
        req.body = {
            operationId: operationId,
            action: 'get',
            client: {
                id: '',
            }
        };
        let { variables, result } = await clientService.processClientRequest(req, res);

        if (variables !== undefined
            && variables.isErrorAlreadyExists !== undefined
            && variables.isErrorAlreadyExists
        ) {

            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.CONFLICT,
                constants.ERRORCODES.DUPLICATE_RESOURCE,
                `${constants.ERRORMESSAGES.DUPLICATE_RESOURCE} Please check clientId or ownerCode.`,
                req.body
            );

        }
        else if (variables === undefined || !variables.clientId) {

            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.NOT_FOUND,
                constants.ERRORCODES.NOT_FOUND,
                constants.ERRORMESSAGES.NOT_FOUND,
                req.body
            );

        }

        helpers.sendSuccess(
            res,
            constants.HTTPSTATUSCODES.OK,
            req.body.action.toUpperCase() + constants.SUCESSSMESSAGES.EXECUTED,
            result,
            req.body
        );
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