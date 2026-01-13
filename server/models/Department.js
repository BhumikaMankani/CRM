const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Department", DepartmentSchema);
