const express = require("express");
const router = express.Router();
const MarketingColumn = require("../models/MarketingColumn");
// Get all active columns
router.get("/", async (req, res) => {
    try {
        const columns = await MarketingColumn.find({ status: { $ne: 'deactive' } }).sort({ order: 1 });
        res.json(columns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Add new column
router.post("/", async (req, res) => {
    try {
        const { column_heading, column_type, multipleValue, sorting, conditionColumn1, conditionColumn2, equalPrefix, morePrefix, lessPrefix, hasDefaultValue, defaultValue, access, sticky } = req.body;
        if (!column_heading) {
            return res.status(400).json({ error: "Column heading is required" });
        }

        // Find highest order to place new column at the end
        const lastColumn = await MarketingColumn.findOne().sort({ order: -1 });
        const nextOrder = (lastColumn && lastColumn.order !== undefined) ? lastColumn.order + 1 : 0;

        // Generate internal name from heading (lowercase, no spaces)
        const name = column_heading.toLowerCase().replace(/\s+/g, '_') + (new Date()).getTime();
        const column = new MarketingColumn({
            column_heading,
            name,
            column_type: column_type || 'text',
            sorting: !!sorting,
            showInfo: !!req.body.showInfo,
            multipleValue: multipleValue || [],
            conditionColumn1: conditionColumn1 || undefined,
            conditionColumn2: conditionColumn2 || undefined,
            equalPrefix: equalPrefix || undefined,
            morePrefix: morePrefix || undefined,
            lessPrefix: lessPrefix || undefined,
            hasDefaultValue: hasDefaultValue || false,
            defaultValue: defaultValue || undefined,
            access: Array.isArray(access) ? access : [],
            sticky: !!sticky,
            status: 'active',
            order: nextOrder
        });
        await column.save();
        res.json(column);
    } catch (err) {
        console.error("Column save error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Update options (labels and colors) for a specific column
router.put("/:name/options", async (req, res) => {
    try {
        const { multipleValue, optionColors, optionTextColors } = req.body;

        const updateData = {};
        if (multipleValue !== undefined) updateData.multipleValue = multipleValue;
        if (optionColors !== undefined) updateData.optionColors = optionColors;
        if (optionTextColors !== undefined) updateData.optionTextColors = optionTextColors;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No update data provided" });
        }

        const result = await MarketingColumn.updateOne(
            { name: req.params.name },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Column not found" });
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Options update error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Update column ordering
router.put("/reorder/update", async (req, res) => {
    try {
        const { columnOrders } = req.body; // Array of { name, order }
        if (!Array.isArray(columnOrders)) {
            return res.status(400).json({ error: "columnOrders must be an array" });
        }

        const updatePromises = columnOrders.map(item =>
            MarketingColumn.updateOne({ name: item.name }, { $set: { order: item.order } })
        );

        await Promise.all(updatePromises);
        res.json({ success: true });
    } catch (err) {
        console.error("Column reorder error:", err);
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
        await MarketingColumn.updateOne(
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
        await MarketingColumn.updateOne(
            { name: req.params.name },
            { status: 'deactive', updatedAt: Date.now() }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update column access and/or heading
router.patch("/:name/access", async (req, res) => {
    try {
        const { access, column_heading, sorting, equalPrefix, morePrefix, lessPrefix, sticky } = req.body;
        const updateData = {};
        if (Array.isArray(access)) updateData.access = access;
        if (column_heading && typeof column_heading === "string" && column_heading.trim()) {
            updateData.column_heading = column_heading.trim();
        }
        if (typeof sorting === "boolean") {
            updateData.sorting = sorting;
        }
        if (typeof sticky === "boolean") {
            updateData.sticky = sticky;
        }
        if (typeof req.body.showInfo === "boolean") {
            updateData.showInfo = req.body.showInfo;
        }
        if (equalPrefix !== undefined) updateData.equalPrefix = equalPrefix;
        if (morePrefix !== undefined) updateData.morePrefix = morePrefix;
        if (lessPrefix !== undefined) updateData.lessPrefix = lessPrefix;
        const updated = await MarketingColumn.findOneAndUpdate(
            { name: req.params.name },
            updateData,
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ error: "Column not found" });
        }
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;