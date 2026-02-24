const ErrorLog = require("../models/ErrorLog");

const logInfo = async (context, message, meta = {}) => {
    console.log(context, message);

    try {
        await ErrorLog.create({
            level: "log",
            context,
            message,
            meta,
        });
    } catch (err) {
        console.error("Log write failed:", err);
    }
};

const logError = async (context, error, meta = {}) => {
    console.error(context, error);

    try {
        await ErrorLog.create({
            level: "error",
            context,
            message: error.message,
            stack: error.stack,
            meta,
        });
    } catch (err) {
        console.error("Error log write failed:", err);
    }
};

module.exports = { logInfo, logError };