const mongoose = require("mongoose");

const ErrorLogSchema = new mongoose.Schema(
    {
        level: String,      // "log" | "error"
        context: String,
        message: String,
        stack: String,
        meta: Object,
    },
    { timestamps: true }
);

module.exports = mongoose.model("ErrorLog", ErrorLogSchema);