const Joi = require('joi').extend(require('@joi/date'));;
const helpers = require('./helpers');
const RxOP = require('rxjs/operators');
const RxJS = require('rxjs');
exports.idValidation = (req, res) => {

    const joiSchema = Joi.object({
        id: Joi.number().integer().required(),
    });

    const { error } = joiSchema.validate(req.body);

    RxJS.timer(100)
        .subscribe(() => {

            error && helpers.sendError(
                res,
                400,
                "INVALID_PAYLOAD_PARAMS",
                error.details[0].message,
                req.body
            );

        });

    return !error;

};