const helpers = require('../../misc/helpers');
const constants = require("../../misc/constants");
const moment = require("moment");
const MOMENT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

exports.ebayValidationQuery = async (req, res) => {
    try {
        if (!Object.keys(req.query).length || req.query.fby_user_id == "") {
            let msg = {
                message: "fby_user_id missing or invalid",
            }
            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.BAD_REQUEST,
                constants.ERRORCODES.VALIDATION_ERROR,
                constants.ERRORMESSAGES.NOT_FOUND,
                msg
            );
        } else if (req.query.updated_after && !(moment(req.query.updated_after, MOMENT_DATE_FORMAT, true).isValid())) {
            let msg = {
                error: "invalid date format",
                message: "required date format " + MOMENT_DATE_FORMAT,
            }
            // res.send(msg)
            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.BAD_REQUEST,
                constants.ERRORCODES.VALIDATION_ERROR,
                constants.ERRORMESSAGES.NOT_FOUND,
                msg
            );
        } else {
            return true
        }

    } catch (error) {
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
}

exports.ebayValidationCase =async (req, res) => {
    try {
        if (!Object.keys(req.query).length || req.query.case == "") {
            let msg = {
                message: "The case parameter missing or invalid",
            }
            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.BAD_REQUEST,
                constants.ERRORCODES.VALIDATION_ERROR,
                constants.ERRORMESSAGES.NOT_FOUND,
                msg
            );
        } else if (req.query.updated_after && !(moment(req.query.updated_after, MOMENT_DATE_FORMAT, true).isValid())) {
            let msg = {
                error: "invalid date format",
                message: "required date format " + MOMENT_DATE_FORMAT,
            }
            return helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.BAD_REQUEST,
                constants.ERRORCODES.VALIDATION_ERROR,
                constants.ERRORMESSAGES.NOT_FOUND,
                msg
            );
        } else {
            return true;
        }

    } catch (error) {
        return helpers.sendError(
            res,
            constants.HTTPSTATUSCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORCODES.INTERNAL_SERVER_ERROR,
            constants.ERRORMESSAGES.INTERNAL_SERVER_ERROR,
            error
        );
    }
}

