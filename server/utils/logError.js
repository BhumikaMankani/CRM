const ErrorLog = require("../models/ErrorLog");

const logError = async (context, error, meta = {}) => {
    console.error(context, error);

    try {
        await ErrorLog.create({
            context,
            message: error.message,
            stack: error.stack,
            meta,
        });
    } catch (dbError) {
        console.error("Error saving error log:", dbError);
    }
};

module.exports = logError;