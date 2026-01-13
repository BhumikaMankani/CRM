const express = require("express");
const router = express.Router();
const Project = require("../models/Development");

// Get all rows
router.get("/", async (req, res) => {
    const projects = await Project.find();
    res.json(projects);
});

// Add new row
router.post("/", async (req, res) => {
    const project = new Project(req.body);
    await project.save();
    res.json(project);
});

// Update row
router.put("/:id", async (req, res) => {
    try {
        const updated = await Project.findByIdAndUpdate(
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
