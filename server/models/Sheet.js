const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema(
    {
        project: { type: String, required: true },
        dailyCheck: String,
        tlComments: String,
        group: String,
        category: String,
        teamLead: String,
        status: String,
        discussion: String,
        startDate: String,
        endDate: String,
        projectManager: String,
        client: String,
        salesDiscussion: String,
        monthYear: String,
        ratingStatus: String,
        finalInvoicePending: String,
        ratingRequested: String,
        clientSatisfaction: String,
        priority: String
    },
    {
        collection: "sheet",   // ✅ exact MongoDB collection name
        versionKey: false,
        strict: false
    }
);

module.exports = mongoose.model("Sheet", TableSchema);
