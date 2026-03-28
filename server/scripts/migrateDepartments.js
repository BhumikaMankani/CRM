require("dotenv").config();
const mongoose = require("mongoose");
const Department = require("../models/Department");

// helper: make clean slug
const makeSlug = (text = "") => {
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
};

async function migrateDepartments() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");

        const departments = await Department.find();
        let updatedCount = 0;

        for (const dept of departments) {
            const base = makeSlug(dept.department || dept.name || "");
            if (!base) continue;

            const updateData = {};

            if (!dept.slug) updateData.slug = base;
            if (!dept.dataCollection) updateData.dataCollection = base;
            if (!dept.columnCollection) updateData.columnCollection = `${base}_columns`;

            // Optional: fix old timestamp names
            if (!dept.name || /\d{10,}$/.test(dept.name)) {
                updateData.name = base;
            }

            if (Object.keys(updateData).length > 0) {
                await Department.updateOne({ _id: dept._id }, { $set: updateData });
                console.log(`✔ Updated: ${dept.department}`);
                updatedCount++;
            }
        }

        console.log(`🎉 Migration complete. Updated ${updatedCount} department(s).`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

migrateDepartments();