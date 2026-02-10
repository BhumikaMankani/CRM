const express = require("express");
const router = express.Router();
const { updateDefaultValues } = require("../services/defaultValueUpdater");

router.post("/run-default-updater", async (req, res) => {
    try {
        await updateDefaultValues();
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
