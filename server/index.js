const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require("node-cron");
const { logError, logInfo } = require("../utils/logError");

// COlumns api
const Columns = require('./routes/columns');
const MarketingColumns = require('./routes/marketing-columns');
const Seo_Column = require('./routes/seo-columns');
const defaultUpdaterRoute = require("./routes/defaultValue");

const Audit = require('./routes/audit');
// project api
const Development = require('./routes/development');
const Marketing = require('./routes/marketing');
const Seo = require('./routes/seo');
const Department = require('./routes/department');
const User = require('./routes/user');
const Filters = require('./routes/filters');
const { updateDefaultValues } = require('./services/defaultValueUpdater');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const connectDB = async (retryCount = 5) => {
    const mongoURI = process.env.MONGO_URI;
    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ Mongo connected successfully");
    } catch (err) {
        console.error(`❌ Mongo connection error (Retries left: ${retryCount}):`, err.message);
        if (retryCount > 0) {
            setTimeout(() => connectDB(retryCount - 1), 5000);
        } else {
            console.error("💀 Max retries reached. Please check your connection or MongoDB server.");
        }
    }
};
connectDB();

// cron.schedule("3 11 * * *", updateDefaultValues, {
//     timezone: "Asia/Kolkata",
// });

cron.schedule("35 11 * * *", () => {
    logError("Audit write failed", auditErr, {
        projectId: project._id,
        column: column.column_heading,
    });
    logInfo("Cron is running:", new Date().toISOString());
}, {
    timezone: "Asia/Kolkata",
});

// Log all incoming API requests for debugging
app.use("/api", (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.originalUrl}`);
    next();
});

// default value updater route
app.use("/api", defaultUpdaterRoute);

// app.use('/api/projects', projectRoutes);
app.use("/api/columns", Columns);
app.use("/api/development", Development);
app.use("/api/user", User);

// Marketing & SEO routes (JSON APIs used by frontend)
app.use("/api/marketing", Marketing);
app.use("/api/seo", Seo);

// Column routes
app.use("/api/marketing-columns", MarketingColumns);
app.use("/api/seo-columns", Seo_Column);

// Audit routes
app.use("/api/audit", Audit);

// Backwards‑compat: keep old path if anything else still calls it
app.use("/api/marketingcolumns", MarketingColumns);

app.use("/api/department", Department);
app.use("/api/filters", Filters);

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