const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const ColumnSchema = new mongoose.Schema({
    name: String,
    column_heading: String,
    status: String
}, { strict: false });

const Column = mongoose.model("Column", ColumnSchema);

async function checkDuplicates() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const columns = await Column.find({ status: { $ne: "deactive" } });
        console.log(`Found ${columns.length} active columns.`);

        const nameCounts = {};
        columns.forEach(col => {
            if (nameCounts[col.name]) {
                nameCounts[col.name].push(col);
            } else {
                nameCounts[col.name] = [col];
            }
        });

        let duplicatesFound = false;
        for (const name in nameCounts) {
            if (nameCounts[name].length > 1) {
                duplicatesFound = true;
                console.log(`Duplicate column name found: "${name}" - Count: ${nameCounts[name].length}`);
                nameCounts[name].forEach(c => console.log(` - ID: ${c._id}, Heading: ${c.column_heading}`));
            }
        }

        if (!duplicatesFound) {
            console.log("No duplicate active column names found.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

checkDuplicates();
