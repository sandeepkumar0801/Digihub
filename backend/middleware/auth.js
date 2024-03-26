const helpers = require("../misc/helpers");
const jwt = require("jsonwebtoken");
const db = require('../startup/db');
const env = require('../startup/env');
const CONSTANTS = require("../misc/constants");

exports.checkMultiAuthorization = async (req, res, next) => {

    if (!req.headers.authorization) {

        return helpers.sendError(
            res,
            CONSTANTS.HTTPSTATUSCODES.BAD_REQUEST,
            "Invalid credentials",
            "Authorization token is not provided. Please try again.",
            req.body
        );

    }

    const [type, token] = req.headers.authorization.split(" ");

    if (token != env.JWT_KEY) {

        return helpers.sendError(
            res,
            CONSTANTS.HTTPSTATUSCODES.UNAUTHORIZED,
            "Authorization failed",
            "Authorization token is invalid. Please provide valid token.",
            {
                authorization: req.headers.authorization
            }
        );

    }
    next();

};