const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Project", ProjectSchema);
