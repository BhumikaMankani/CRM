const express = require("express");
const router = express.Router();
const { updateDefaultValues } = require("../services/defaultValueUpdater");

router.post("/run-default-updater", async (req, res) => {
    try {
        await updateDefaultValues();

        // Log manual reset execution to trigger 12-hour lock
        try {
            const Logs = require("../models/Logs");
            await Logs.create({
                level: "INFO",
                source: "global_column_reset",
                message: "RESET_EXECUTED",
                time: new Date()
            });
        } catch (logErr) {
            console.error("Failed to log manual reset execution:", logErr);
        }

        res.json({
            success: true,
            message: "Default value updater executed",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

module.exports = router;
