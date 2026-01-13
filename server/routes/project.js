const express = require("express");
const router = express.Router();
const Sheet = require("../models/Sheet");

// GET all projects
router.get("/", async (req, res) => {
    try {
        const projects = await Sheet.find();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new project
router.post("/", async (req, res) => {
    try {
        const newProject = new Sheet(req.body);
        const saved = await newProject.save();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update project by ID
router.put("/:id", async (req, res) => {
    try {
        const updated = await Sheet.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
