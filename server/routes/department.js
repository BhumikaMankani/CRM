const express = require("express");
const router = express.Router();
const Department = require("../models/Department");

// Get all rows
router.get("/", async (req, res) => {
    const departments = await Department.find();
    res.json(departments);
});

// Add new row
router.post("/", async (req, res) => {
    const department = new Department(req.body);
    await department.save();
    res.json(department);
});

// Update row
router.put("/:id", async (req, res) => {
    try {
        const updated = await Department.findByIdAndUpdate(
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