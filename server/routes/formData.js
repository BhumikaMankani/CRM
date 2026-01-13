const express = require("express");
const router = express.Router();
const form = require("../models/Form");
const Sheet = require("../models/Sheet");

// GET all projects
router.get("/", async (req, res) => {
    try {
        const projects = await form.find();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new project
router.post("/", async (req, res) => {
    try {
        const newProject = new form(req.body);
        const saved = await newProject.save();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT rename a column
router.put("/:oldName", async (req, res) => {
    try {
        const oldName = req.params.oldName.trim();
        const newName = req.body.newName ? req.body.newName.trim() : "";

        if (!newName) {
            return res.status(400).json({ error: "New name is required" });
        }

        // 1. Update the name in the Form collection
        const updatedForm = await form.findOneAndUpdate(
            { name: oldName },
            { name: newName },
            { new: true }
        );

        if (!updatedForm) {
            return res.status(404).json({ error: "Column not found" });
        }

        // 2. Rename the field in all documents in the Sheet collection
        await Sheet.updateMany({}, { $rename: { [oldName]: newName } });

        res.json(updatedForm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a column by name
router.delete("/:name", async (req, res) => {
    try {
        const name = req.params.name.trim();

        // 1. Remove from Form collection
        await form.deleteOne({ name });

        // 2. Remove the field from all documents in Sheet collection
        await Sheet.updateMany({}, { $unset: { [name]: "" } });

        res.json({ message: `Column '${name}' deleted successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
