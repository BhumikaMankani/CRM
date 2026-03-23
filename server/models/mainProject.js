const mongoose = require("mongoose");

const MainProjectSchema = new mongoose.Schema({
    mainProjectName: { type: String },
    tasks: [
        {
            taskName: String,
            rowId: String,
        }
    ],
    showstatus: {
        type: String,
        default: 'activate'
    },
    createdByUserId: { type: String },
    createdByUserName: { type: String },
}, { strict: false, timestamps: true });

module.exports = mongoose.model("MainProject", MainProjectSchema);
