const express = require("express");
const router = express.Router();
const Department = require("../models/Department");
const User = require("../models/User");

const makeSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")      // spaces -> underscore
        .replace(/[^a-z0-9_]/g, ""); // remove special chars
};

const escapeRegex = (text) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Get all rows
router.get("/", async (req, res) => {
    const departments = await Department.find();
    res.json(departments);
});

// Add new row
router.post("/", async (req, res) => {
    try {
        const department = new Department(req.body);

        const cleanDepartmentName = department.department.trim();
        const name = cleanDepartmentName.toLowerCase().replace(/\s+/g, "_");

        department.name = name;
        department.slug = makeSlug(cleanDepartmentName);
        department.dataCollection = makeSlug(cleanDepartmentName);
        department.columnCollection = makeSlug(cleanDepartmentName) + "_columns";

        await department.save();

        // Add new department to all users
        console.log("User data", User);
        console.log("Admin users", User.status);
        await User.updateMany(
            { status: "admin" },
            { $addToSet: { department: cleanDepartmentName } }
        );

        console.log("User", User);

        res.json(department);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const existingDepartment = await Department.findById(req.params.id);
        if (!existingDepartment) {
            return res.status(404).json({ error: "Department not found" });
        }

        const updated = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (req.body.status && req.body.status.toLowerCase() === "archived") {
            const departmentToRemove = existingDepartment.department?.trim();
            if (departmentToRemove) {
                const regex = new RegExp(`^${escapeRegex(departmentToRemove)}$`, "i");
                await User.updateMany(
                    { department: { $in: [regex] } },
                    { $pull: { department: regex } }
                );
            }
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;