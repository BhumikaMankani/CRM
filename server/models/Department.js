const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
    department: { type: String, required: true, unique: true },
    name: { type: String },
    status: { type: String, default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model("Department", DepartmentSchema);