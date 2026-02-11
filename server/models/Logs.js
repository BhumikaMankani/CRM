const mongoose = require("mongoose");

const LogsSchema = new mongoose.Schema({
    level: String,        // log | error | warn | info
    message: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// IMPORTANT: "logs" = your existing collection name
module.exports = mongoose.model("Logs", LogsSchema, "logs");
