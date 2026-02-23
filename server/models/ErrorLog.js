const mongoose = require("mongoose");

const ErrorLogSchema = new mongoose.Schema(
    {
        context: String,
        message: String,
        stack: String,
        meta: Object,
    },
    { timestamps: true }
);

module.exports = mongoose.model("ErrorLog", ErrorLogSchema);