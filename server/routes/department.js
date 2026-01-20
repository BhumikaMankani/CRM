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
    const name = department.department.toLowerCase().replace(/\s+/g, '_') + (new Date()).getTime();
    department.name = name;
    await department.save();
    res.json(department);
});

router.put("/:name", async (req, res) => {
    try {
        const { newName } = req.body;
        if (!newName) {
            return res.status(400).json({ error: "New heading is required" });
        }

        await Department.updateOne(
            { name: req.params.oldname },
            { department: newName }
        );

        // await Department.updateMany({}, { $rename: { [oldName]: newName } });

        res.json({ success: true });
    } catch (err) {
        console.error("Column rename error:", err);
        res.status(500).json({ error: err.message });
    }
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