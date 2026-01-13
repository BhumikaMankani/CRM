const express = require("express");
const router = express.Router();
const Column = require("../models/Column");

// Get all active columns
router.get("/", async (req, res) => {
    try {
        const columns = await Column.find({ status: { $ne: 'deactive' } }).sort({ order: 1 });
        res.json(columns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new column
router.post("/", async (req, res) => {
    try {
        const { column_heading, column_type, multipleValue, sorting } = req.body;

        if (!column_heading) {
            return res.status(400).json({ error: "Column heading is required" });
        }

        // Generate internal name from heading (lowercase, no spaces)
        const name = column_heading.toLowerCase().replace(/\s+/g, '_') + (new Date()).getTime();

        const column = new Column({
            column_heading,
            name,
            column_type: column_type || 'text',
            sorting: !!sorting,
            multipleValue: multipleValue || [],
            status: 'active'
        });

        await column.save();
        res.json(column);
    } catch (err) {
        console.error("Column save error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Rename column heading
router.put("/:name", async (req, res) => {
    try {
        const { newHeading } = req.body;
        if (!newHeading) {
            return res.status(400).json({ error: "New heading is required" });
        }

        await Column.updateOne(
            { name: req.params.name },
            { column_heading: newHeading }
        );

        res.json({ success: true });
    } catch (err) {
        console.error("Column rename error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Deactivate column (Soft Delete)
router.patch("/deactivate/:name", async (req, res) => {
    try {
        await Column.updateOne(
            { name: req.params.name },
            { status: 'deactive', updatedAt: Date.now() }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
