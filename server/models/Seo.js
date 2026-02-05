const mongoose = require("mongoose");

const SeoSchema = new mongoose.Schema({
    showstatus: {
        type: String,
        default: 'activate'
    },
    createdByUserId: { type: String },
    createdByUserName: { type: String },
}, { strict: false, timestamps: true });

module.exports = mongoose.model("Seo", SeoSchema);
