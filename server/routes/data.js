const express = require("express");
const router = express.Router();
const getColumnModel = require("../models/Column");
const getDataModel = require("../models/Data");
const Audit = require("../models/Audit");

// Get all rows
router.get("/", async (req, res) => {
    try {
        const { collectionName } = req.query;

        const Project = getDataModel(collectionName);
        // console.log("collectionName", collectionName);
        // console.log("Project", Project);
        const projects = await Project.find({ showstatus: { $ne: 'deactivate' } }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new row
router.post("/", async (req, res) => {
    const { collectionName } = req.query;
    const Project = getDataModel(collectionName);
    console.log("➕ ADD ROW REQUEST:", req.body);
    try {
        const { createdByUserId, createdByUserName, ...rowContent } = req.body;
        const project = new Project({
            ...rowContent,
            showstatus: 'activate',
            createdByUserId: createdByUserId || "Unknown",
            createdByUserName: createdByUserName || "Unknown"
        });
        await project.save();
        console.log("✅ Row added successfully:", project);
        res.json(project);
    } catch (err) {
        console.error("❌ Error adding row:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get column access
router.get("/columnAccess/:id", async (req, res) => {
    const { collectionName } = req.query;
    const Project = getDataModel(collectionName);
    try {
        const projects = await Project.findById(req.params.id);
        res.json(projects ? projects.column_access : "");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle column access
router.put("/columnAccess/:id", async (req, res) => {
    const { collectionName } = req.query;
    const Project = getDataModel(collectionName);
    try {
        const { columnName } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: "Record not found" });
        }

        let currentAccess = project.column_access || "";
        let accessArray = currentAccess.split(',').map(item => item.trim()).filter(item => item !== "");

        if (accessArray.includes(columnName)) {
            // Remove access
            accessArray = accessArray.filter(item => item !== columnName);
        } else {
            // Grant access
            accessArray.push(columnName);
        }

        project.column_access = accessArray.join(',');
        await project.save();

        res.json(project.column_access);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update row
router.put("/:id", async (req, res) => {
    console.log("📝 UPDATE ROW REQUEST:", req.params.id, req.body);
    try {
        const { changedByUserId, changedByUserName, ...updateBody } = req.body;

        const { collectionName } = req.query;
        const Project = getDataModel(collectionName);
        // 1) Load the existing document so we can compare old vs new values
        const existing = await Project.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: "Row not found" });
        }
        // 2) Apply update and get the new doc
        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    ...updateBody,
                    lastChangedByUserName: changedByUserName || "Unknown",
                    lastChangedAt: new Date()
                }
            },
            { new: true }
        );

        // 3) For select/default-value columns, write audit entries for any changed fields
        try {
            const baseName = collectionName.endsWith("s")
                ? collectionName.slice(0, -1)
                : collectionName;

            const realColumnCollectionName = `${baseName}_columns`;
            const Column = getColumnModel(realColumnCollectionName);
            const columns = await Column.find({ status: { $ne: "deactive" } });

            const auditOps = [];

            console.log("columns", columns);
            console.log("Column", Column);
            for (const col of columns) {
                const field = col.name;

                // Use .get() for dynamic fields on Mongoose documents
                const oldValue = existing.get ? existing.get(field) : existing[field];
                const newValue = updated.get ? updated.get(field) : updated[field];

                // Skip if value didn't actually change
                if (oldValue === newValue) continue;
                console.log("oldValue", oldValue);
                console.log("newValue", newValue);
                console.log("col", col);
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
            console.log("auditOps", auditOps);
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

// Get audit history for a specific record (all fields)
router.get("/:id/audit", async (req, res) => {
    const { collectionName } = req.query;
    const Project = getDataModel(collectionName);
    const { id } = req.params;
    try {
        const history = await Audit.find({ recordId: id }).sort({ changedAt: -1 });
        res.json(history);
    } catch (err) {
        console.error("❌ Error fetching record audit history:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get audit history for a specific record + column
router.get("/:id/audit/:field", async (req, res) => {
    const { collectionName } = req.query;
    const Project = getDataModel(collectionName);
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

router.patch("/deactivate/:id", async (req, res) => {
    const { collectionName } = req.query;
    const Project = getDataModel(collectionName);
    console.log("🔥 DEACTIVATE API HIT:", req.params.id);

    const updated = await Project.findByIdAndUpdate(
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