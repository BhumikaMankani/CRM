const express = require("express");
const router = express.Router();
const Seo = require("../models/Seo");
const Audit = require("../models/Audit");

// Get all rows
router.get("/", async (req, res) => {
    try {
        const records = await Seo.find({ showstatus: { $ne: 'deactivate' } }).sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new row
router.post("/", async (req, res) => {
    console.log("➕ ADD ROW REQUEST (SEO):", req.body);
    try {
        const record = new Seo({ ...req.body, showstatus: 'activate' });
        await record.save();
        console.log("✅ Row added successfully:", record);
        res.json(record);
    } catch (err) {
        console.error("❌ Error adding row:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get column access
router.get("/columnAccess/:id", async (req, res) => {
    try {
        const record = await Seo.findById(req.params.id);
        res.json(record ? record.column_access : "");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle column access
router.put("/columnAccess/:id", async (req, res) => {
    try {
        const { columnName } = req.body;
        const record = await Seo.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ error: "Record not found" });
        }

        let currentAccess = record.column_access || "";
        let accessArray = currentAccess.split(',').map(item => item.trim()).filter(item => item !== "");

        if (accessArray.includes(columnName)) {
            // Remove access
            accessArray = accessArray.filter(item => item !== columnName);
        } else {
            // Grant access
            accessArray.push(columnName);
        }

        record.column_access = accessArray.join(',');
        await record.save();

        res.json(record.column_access);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update row
router.put("/:id", async (req, res) => {
    console.log("📝 UPDATE ROW REQUEST (SEO):", req.params.id, req.body);
    try {
        const { changedByUserId, changedByUserName, ...updateBody } = req.body;

        // 1) Load the existing document so we can compare old vs new values
        const existing = await Seo.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: "Row not found" });
        }

        // 2) Apply update and get the new doc
        const updated = await Seo.findByIdAndUpdate(
            req.params.id,
            { $set: updateBody },
            { new: true }
        );

        // 3) For select/default-value columns, write audit entries for any changed fields
        try {
            // Load column definitions so we know metadata (hasDefaultValue, etc.)
            const Column = require("../models/Column");
            const columns = await Column.find({ status: { $ne: "deactive" } });

            const auditOps = [];

            for (const col of columns) {
                // Track audit if showInfo is enabled OR it's a select column with default value tracking
                const isSpecialSelect = col.column_type === "select" && col.hasDefaultValue;
                if (!col.showInfo && !isSpecialSelect) continue;

                const field = col.name;

                // Use .get() for dynamic fields on Mongoose documents
                const oldValue = existing.get ? existing.get(field) : existing[field];
                const newValue = updated.get ? updated.get(field) : updated[field];

                // Skip if value didn't actually change
                if (oldValue === newValue) continue;

                auditOps.push(
                    Audit.create({
                        recordId: existing._id,
                        columnId: col._id,
                        columnName: col.column_heading,
                        columnFieldName: field,
                        oldValue: (oldValue === undefined || oldValue === null) ? "" : String(oldValue),
                        newValue: (newValue === undefined || newValue === null) ? "" : String(newValue),
                        changedByUserId: changedByUserId || "Unknown",
                        changedByUserName: changedByUserName || "Unknown",
                    })
                );
            }

            if (auditOps.length) {
                await Promise.all(auditOps);
                console.log(`🧾 Audit entries written: ${auditOps.length}`);
            }
        } catch (auditErr) {
            console.error("⚠️ Failed to write audit log:", auditErr.message);
            // Do not fail the main update if audit logging fails
        }

        console.log("✅ Row updated successfully:", updated);
        res.json(updated);
    } catch (err) {
        console.error("❌ Error updating row:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get audit history for a specific record + column
router.get("/:id/audit/:field", async (req, res) => {
    const { id, field } = req.params;
    try {
        // Find all audit entries that belong to this record + column field key
        const history = await Audit.find({
            recordId: id,
            columnFieldName: field,
        }).sort({ changedAt: -1 });

        // Always return JSON (even if empty array) so frontend .json() succeeds
        res.json(history);
    } catch (err) {
        console.error("❌ Error fetching audit history:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Deactivate row
router.patch("/deactivate/:id", async (req, res) => {
    console.log("🔥 DEACTIVATE API HIT (SEO):", req.params.id);

    const updated = await Seo.findByIdAndUpdate(
        req.params.id,
        { $set: { showstatus: "deactivate" } },
        { new: true }
    );

    if (!updated) {
        return res.status(404).json({ error: "Row not found" });
    }

    res.json(updated);
});

module.exports = router;
