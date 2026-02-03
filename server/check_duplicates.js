const mongoose = require("mongoose");
const Column = require("./models/Column");
require("dotenv").config();

async function checkDuplicates() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/crm_db");
        console.log("Connected to MongoDB");

        const columns = await Column.find({});
        console.log(`Total columns found: ${columns.length}`);

        const nameMap = {};
        const duplicates = [];

        columns.forEach(col => {
            if (nameMap[col.name]) {
                duplicates.push(col);
            } else {
                nameMap[col.name] = true;
            }
        });

        if (duplicates.length > 0) {
            console.log("Found duplicate columns:");
            duplicates.forEach(d => {
                console.log(`- ID: ${d._id}, Name: ${d.name}, Heading: ${d.column_heading}`);
            });
        } else {
            console.log("No duplicate columns found.");
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkDuplicates();
