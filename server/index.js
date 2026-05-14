const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// COlumns api
const CreateCollection = require('./routes/CreateCollection');
const Audit = require('./routes/audit');
const Department = require('./routes/department');
const User = require('./routes/user');
const Filters = require('./routes/filters');
const MainProject = require('./routes/mainProject');
const { updateDefaultValues, resetAllDepartments } = require('./services/defaultValueUpdater');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const connectDB = () => {
    const mongoURI = process.env.MONGO_URI;
    try {
        mongoose.connect(mongoURI).then(() => {
            console.log("✅ Mongo connected successfully");;
        });
    } catch (err) {
        console.error(`:x: Mongo connection error :`, err.message);
    }
};
connectDB();

app.use("/api", (req, res, next) => {
    // console.log(`[API Request] ${req.method} ${req.originalUrl}`);
    next();
});
app.use("/api/create-collection", CreateCollection);
app.use("/api/user", User);

// ✅ Data route
const dataRoutes = require("./routes/data");
app.use("/api/data", dataRoutes);

// ✅ Column route
const columnRoutes = require("./routes/columns");
const CronStatus = require('./routes/CronStatus');
app.use("/api/columns", columnRoutes);
app.use("/api/cronStatus", CronStatus);
app.use("/api/audit", Audit);

app.post("/api/run-default-updater", async (req, res) => {
    try {
        await updateDefaultValues(true, req.body.collectionName);
        // console.log("Data collection", req.body.collectionName);
        res.json({ success: true, message: "Default values updated successfully" });
    } catch (err) {
        console.error("Manual updater error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/api/reset-all-departments", async (req, res) => {
    try {
        const result = await resetAllDepartments(true);
        res.json(result);
    } catch (err) {
        console.error("Reset all error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.use("/api/department", Department);
app.use("/api/filters", Filters);
app.use("/api/mainProject", MainProject);

// Diagnostic route
app.get("/api/ping", (req, res) => res.json({ message: "pong" }));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../my-react-app/dist')));

// Catch all handler: send back React's index.html file for client-side routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../my-react-app/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend is working on ${PORT}`);
});