const mongoose = require("mongoose");

const LogsSchema = new mongoose.Schema({
    level: String,
    message: String,
    source: String,
    time: Date
}, { timestamps: true });

module.exports = mongoose.model("Logs", LogsSchema);
