const express = require("express");
const router = express.Router();
const mainProject = require("../models/mainProject");

// Get all rows
router.get("/", async (req, res) => {
    try {
        const projects = await mainProject.find({ showstatus: { $ne: 'deactivate' } }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single project by name
router.get("/names", async (req, res) => {
    try {
        const projects = await mainProject.find(
            { showstatus: { $ne: "deactivate" } }, // filter
            { mainProjectName: 1, _id: 0 } // ✅ return only name
        );

        res.json({
            mainProjectNames: projects.map(p => p.mainProjectName)
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const dataArr = Array.isArray(req.body) ? req.body : [req.body];
        const results = [];

        for (const item of dataArr) {
            const { projectId, projectName, taskName } = item;

            if (!projectName) continue;

            // 1️⃣ Try to find project by name
            let project = await mainProject.findOne({ mainProjectName: projectName });

            if (project) {
                // ✅ Existing project → DO NOT change mainProject

                const existingTaskIndex = project.tasks.findIndex(
                    t => t.rowId === String(projectId)
                );

                if (existingTaskIndex > -1) {
                    if (taskName) {
                        project.tasks[existingTaskIndex].taskName = taskName;
                    }
                } else {
                    project.tasks.push({
                        rowId: String(projectId),
                        taskName: taskName || "Untitled Task"
                    });
                }

                await mainProject.updateMany(
                    { mainProjectName: { $ne: projectName }, "tasks.rowId": String(projectId) },
                    { $pull: { tasks: { rowId: String(projectId) } } }
                );

                await project.save();
                results.push(project);

            } else {
                // 🆕 Create new project

                // 🔥 Generate UNIQUE permanent key
                const generatedMainProject = projectName
                    .toLowerCase()
                    .replace(/\s+/g, "_") + "_" + Date.now();

                await mainProject.updateMany(
                    { "tasks.rowId": String(projectId) },
                    { $pull: { tasks: { rowId: String(projectId) } } }
                );

                const newProject = new mainProject({
                    mainProject: generatedMainProject, // 🔒 permanent
                    mainProjectName: projectName, // ✏️ editable
                    tasks: [{
                        rowId: String(projectId),
                        taskName: taskName || "Untitled Task"
                    }]
                });

                await newProject.save();
                results.push(newProject);
            }
        }

        res.status(200).json({
            message: "Sync successful",
            count: results.length,
            data: results
        });

    } catch (error) {
        console.error("SYNC ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});


router.patch("/update-by-row/:rowId", async (req, res) => {
    try {
        const { rowId } = req.params;
        const { projectName, taskName } = req.body;

        // 1. Find project containing this rowId
        const project = await mainProject.findOne({
            "tasks.rowId": String(rowId)
        });

        if (!project) {
            return res.status(404).json({ error: "Project not found for this row" });
        }

        // 2. Update project name
        if (projectName) {
            project.mainProjectName = projectName;
        }

        // 3. Update task name inside it
        const task = project.tasks.find(t => t.rowId === String(rowId));
        if (task && taskName) {
            task.taskName = taskName;
        }

        await project.save();

        res.json({
            message: "Project updated successfully",
            project
        });

    } catch (err) {
        console.error("PATCH ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;