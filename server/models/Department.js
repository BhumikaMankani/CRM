const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
    {
        department: { type: String, required: true, unique: true },
        slug: { type: String, required: true },
        name: { type: String },
        dataCollection: { type: String, required: true },
        columnCollection: { type: String, required: true },
        status: { type: String, default: "Active" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Department", DepartmentSchema);