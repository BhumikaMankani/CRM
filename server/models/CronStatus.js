const mongoose = require('mongoose');

const CronStatusSchema = new mongoose.Schema({
    taskName: {
        type: String,
        required: true,
        unique: true
    },
    lastRunDate: {
        type: String, // Storing as YYYY-MM-DD
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('CronStatus', CronStatusSchema);
