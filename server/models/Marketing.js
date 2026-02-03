const mongoose = require("mongoose");

const MarketingSchema = new mongoose.Schema({
    showstatus: {
        type: String,
        default: 'activate'
    },

}, { strict: false, timestamps: true });

module.exports = mongoose.model("Marketing", MarketingSchema);
