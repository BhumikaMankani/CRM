const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
    department: { type: String, required: true, unique: true },
    name: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Department", DepartmentSchema);