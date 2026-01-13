const mongoose = require("mongoose");

const ColumnConfigSchema = new mongoose.Schema(
    {
        label: { type: String }                  // The visual label
    },
    {
        collection: "column_configs",
        versionKey: false
    }
);

module.exports = mongoose.model("ColumnConfig", ColumnConfigSchema);
