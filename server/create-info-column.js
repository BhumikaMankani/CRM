const mongoose = require("mongoose");
const Column = require("./models/Column");
require("dotenv").config();

async function createInfoColumn() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const existing = await Column.findOne({ name: "row_info" });
        if (existing) {
            console.log("Info column already exists.");
            if (existing.status === 'deactive') {
                existing.status = 'active';
                // Move to end if reactivating
                const lastColumn = await Column.findOne().sort({ order: -1 });
                const nextOrder = (lastColumn && lastColumn.order !== undefined) ? lastColumn.order + 1 : 0;
                existing.order = nextOrder;
                await existing.save();
                console.log("Reactivated Info column.");
            }
        } else {
            // Find highest order
            const lastColumn = await Column.findOne().sort({ order: -1 });
            const nextOrder = (lastColumn && lastColumn.order !== undefined) ? lastColumn.order + 1 : 0;

            await Column.create({
                column_heading: "Info",
                name: "row_info",
                column_type: "text", // use text so it doesn't break other math
                order: nextOrder,
                status: "active",
                sticky: false
            });
            console.log("Created Info column.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

createInfoColumn();
