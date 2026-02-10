const express = require('express');
const router = express.Router();
const Audit = require('../models/Audit');

// Get all audits, sorted by most recent first
router.get('/', async (req, res) => {
    try {
        const { limit } = req.query;
        const query = Audit.find().sort({ changedAt: -1 });

        if (limit) {
            query.limit(parseInt(limit));
        }

        const audits = await query.exec();
        res.status(200).json(audits);
    } catch (err) {
        console.error("Error fetching audits:", err);
        res.status(500).json({ message: "Error fetching audits", error: err.message });
    }
});

// Get audits for a specific user
router.get('/user/:userName', async (req, res) => {
    try {
        const { userName } = req.params;
        const audits = await Audit.find({ changedByUserName: userName }).sort({ changedAt: -1 });
        res.status(200).json(audits);
    } catch (err) {
        console.error("Error fetching user audits:", err);
        res.status(500).json({ message: "Error fetching user audits", error: err.message });
    }
});

module.exports = router;
