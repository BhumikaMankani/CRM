const mongoose = require("mongoose");

const MainProjectSchema = new mongoose.Schema({
    mainProject: {
        type: String,
        required: true,
        unique: true,
        immutable: true // 🔒 cannot be changed after creation
    },
    mainProjectName: {
        type: String,
        required: true
    },
    tasks: [
        {
            taskName: String,
            taskNameLabel: String,
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
