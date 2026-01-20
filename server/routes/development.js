const express = require("express");
const router = express.Router();
const Project = require("../models/Development");

// Get all rows
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find({ showstatus: { $ne: 'deactivate' } });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new row
router.post("/", async (req, res) => {
    console.log("➕ ADD ROW REQUEST:", req.body);
    try {
        const project = new Project({ ...req.body, showstatus: 'activate' });
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
    try {
        const projects = await Project.findById(req.params.id);
        res.json(projects ? projects.column_access : "");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle column access
router.put("/columnAccess/:id", async (req, res) => {
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
        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        console.log("✅ Row updated successfully:", updated);
        res.json(updated);
    } catch (err) {
        console.error("❌ Error updating row:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// router.patch("/deactivate/:id", async (req, res) => {
//     try {
//         const updated = await Project.findByIdAndUpdate(
//             req.params.id,
//             { $set: { showstatus: "deactivate" } },
//             { new: true, runValidators: true }
//         );
//         if (!updated) {
//             console.warn("Row not found for deactivation:", req.params.id);
//             return res.status(404).json({ error: "Row not found" });
//         }
//         console.log("✅ Row deactivated successfully:", req.params.id);
//         res.json(updated);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

router.patch("/deactivate/:id", async (req, res) => {
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
