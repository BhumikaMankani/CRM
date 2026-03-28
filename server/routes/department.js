const express = require("express");
const router = express.Router();
const Department = require("../models/Department");

const makeSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")      // spaces -> underscore
        .replace(/[^a-z0-9_]/g, ""); // remove special chars
};


// Get all rows
router.get("/", async (req, res) => {
    const departments = await Department.find();
    res.json(departments);
});

// Add new row
router.post("/", async (req, res) => {
    const department = new Department(req.body);
    const name = department.department.toLowerCase().replace(/\s+/g, '_');
    department.name = name;
    department.slug = makeSlug(department.department);
    department.dataCollection = makeSlug(department.department);
    department.columnCollection = makeSlug(department.department) + "_columns";
    await department.save();
    res.json(department);
});

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