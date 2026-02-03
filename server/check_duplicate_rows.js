const mongoose = require("mongoose");
const Project = require("./models/Development");
require("dotenv").config();

async function checkDuplicateRows() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/crm_db");
        console.log("Connected to MongoDB via checkDuplicateRows");

        const rows = await Project.find({ showstatus: { $ne: 'deactivate' } }).sort({ createdAt: -1 });
        console.log(`Total active rows found: ${rows.length}`);

        // Simple duplicate check by stringifying content (excluding _id, createdAt, updatedAt, showstatus)
        const rowMap = new Map();
        const duplicates = [];

        rows.forEach(row => {
            const temp = row.toObject();
            delete temp._id;
            delete temp.createdAt;
            delete temp.updatedAt;
            delete temp.__v;
            // distinct ID might be different, but content same?
            // If the user says "double value", they probably mean the visible columns are same.

            // Let's create a signature based on visible content.
            // We don't know exactly which columns are visible, but let's use all keys except system ones.
            const keys = Object.keys(temp).sort();
            const signature = keys.map(k => `${k}:${temp[k]}`).join('|');

            if (rowMap.has(signature)) {
                duplicates.push({ original: rowMap.get(signature), duplicate: row });
            } else {
                rowMap.set(signature, row);
            }
        });

        if (duplicates.length > 0) {
            console.log(`Found ${duplicates.length} sets of duplicate rows (same content):`);
            duplicates.forEach((d, i) => {
                console.log(`\nDuplicate Set ${i + 1}:`);
                console.log(`Original ID: ${d.original._id}`);
                console.log(`Duplicate ID: ${d.duplicate._id}`);
                console.log(`Content Sample: ${JSON.stringify(d.duplicate).substring(0, 100)}...`);
            });
        } else {
            console.log("No exact duplicate rows found (based on content).");
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkDuplicateRows();
