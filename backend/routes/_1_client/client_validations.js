const helpers = require('../../misc/helpers');
const RxJS = require('rxjs');
const Joi = require('joi');
const constants = require("../../misc/constants");

exports.clientValidationPOST = (req, res) => {

    const joiSchema = Joi.object({
        action: Joi.string().valid('get', 'insert', 'update', 'delete').required(),
        client: {
            id: Joi.string().required(),
            name: Joi.string().required(),
            ownerCode: Joi.string().required(),
        },
    });

    const { error } = joiSchema.validate(req.body);

    RxJS.timer(100)
        .subscribe(() => {

            error && helpers.sendError(
                res,
                constants.HTTPSTATUSCODES.BAD_REQUEST,
                constants.ERRORCODES.VALIDATION_ERROR,
                error.details[0].message,
                req.body
            );

        });

    return !error;

};