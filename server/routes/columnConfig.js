const express = require("express");
const router = express.Router();
const ColumnConfig = require("../models/ColumnConfig");

// GET all column configs
router.get("/", async (req, res) => {
    try {
        const configs = await ColumnConfig.find();
        // Convert to a dictionary for easier frontend use: { accessor: label }
        const configMap = {};
        configs.forEach(conf => {
            configMap[conf.accessor] = conf.label;
        });
        res.json(configMap);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST update or insert column config
router.post("/", async (req, res) => {
    const { accessor, label } = req.body;
    if (!accessor || !label) {
        return res.status(400).json({ error: "Accessor and label are required" });
    }

    try {
        const updatedConfig = await ColumnConfig.findOneAndUpdate(
            { accessor },
            { label },
            { new: true, upsert: true }
        );
        res.json(updatedConfig);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
