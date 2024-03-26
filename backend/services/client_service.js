const db = require('../startup/db');
const constants = require("../misc/constants");
const db_constants = require("../misc/db_constants");

exports.processClientRequest = async (req, res) => {

    let dbResult = {
        result: null,
        variables: null
    };

    switch (req.body.action) {
        case constants.ACTION.INSERT:
            {
                let { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_CLINET.POST,
                    [
                        req.body.client.id,
                        req.body.client.name,
                        req.body.client.ownerCode,
                    ], null, false
                );
                dbResult.variables = variables;
                dbResult.result = result;

                break;
            }
        case constants.ACTION.UPDATE:
            {
                let { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_CLINET.PUT,
                    [
                        req.body.client.id,
                        req.body.client.name,
                        req.body.client.ownerCode,
                    ], null, false
                );
                dbResult.variables = variables;
                dbResult.result = result;

                break;
            }
        case constants.ACTION.DELETE:
            {
                let { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_CLINET.DELETE,
                    [
                        req.body.client.id,
                    ], null, false
                );
                dbResult.variables = variables;
                dbResult.result = result;

                break;
            }
        case constants.ACTION.GET:
            {

                let { variables, result } = await db.execute(
                    db_constants.DB_CONSTANTS_CLINET.GET,
                    [
                        req.body.client.id,
                    ], null, false
                );
                dbResult.variables = variables;
                dbResult.result = result;

                break;
            }
        default:
            {
                console.log('default: no action matched.');
            }
    }

    return {
        result: dbResult.result,
        variables: dbResult.variables
    };

};
