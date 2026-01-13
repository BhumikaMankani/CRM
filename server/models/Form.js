const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        type: { type: String, required: true },
        options: { type: [String], default: [] }
    },
    {
        collection: "form",
        versionKey: false
    }
);

module.exports = mongoose.model("Form", FormSchema);