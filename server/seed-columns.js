const mongoose = require('mongoose');
const Column = require('./models/Column');

const mongoURI = process.env.MONGO_URI;
// const mongoURI = "mongodb://localhost:27017/ProjectTracker";

const seedColumns = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB for seeding...");

        const columns = [
            { column_heading: "Project Name", name: "project_name", column_type: "text", sorting: true },
            { column_heading: "Status", name: "status", column_type: "select", sorting: true, multipleValue: ["Yes", "No"] },
            { column_heading: "Start Date", name: "start_date", column_type: "date", sorting: true },
            { column_heading: "End Date", name: "end_date", column_type: "date", sorting: true },
            { column_heading: "Overdue", name: "overdue", column_type: "text", sorting: false },
            { column_heading: "Team Leader", name: "team_leader", column_type: "select", sorting: true, multipleValue: ["Nikhil Joshi", "Komal Mankani", "Aditya", "Shubham", "Arun", "Vibha", "Sunil"] },
        ];

        for (const col of columns) {
            const existing = await Column.findOne({ column_heading: col.column_heading });

            if (!existing) {
                await new Column({ ...col, status: 'active' }).save();
                console.log(`Added column: ${col.column_heading}`);
                // columns.name.new.date(col.name);
            } else {
                console.log(`Column already exists: ${col.column_heading}`);
                // Update to ensure status is active
                existing.status = 'active';
                await existing.save();
            }
        }

        console.log("Seeding completed!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedColumns();
