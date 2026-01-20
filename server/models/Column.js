const mongoose = require("mongoose");

const ColumnSchema = new mongoose.Schema({
    column_heading: { type: String, required: true },
    name: { type: String, required: true },
    column_type: { type: String, default: "text" }, // text, select, date
    sorting: { type: Boolean, default: false },
    multipleValue: { type: [String], default: [] }, // for select
    status: { type: String, default: "active" }, // active, inactive
}, { timestamps: true });

module.exports = mongoose.model("Column", ColumnSchema);