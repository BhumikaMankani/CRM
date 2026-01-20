const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    showstatus: {
        type: String,
        default: 'activate'
    },

}, { strict: false });

module.exports = mongoose.model("Project", ProjectSchema);
