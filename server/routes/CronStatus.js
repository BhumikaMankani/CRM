const express = require('express');
const router = express.Router();
const CronStatus = require('../models/CronStatus');

router.get('/', async (req, res) => {
    try {
        const status = await CronStatus.findOne({ taskName: "dailyUpdate" });
        res.json(status);
    } catch (error) {
        res.status(500).json({ message: "Error fetching cron status" });
    }
});

module.exports = router;