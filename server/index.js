const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { logError, logInfo } = require("./utils/logError");

// COlumns api
const CronStatus = require('./routes/CronStatus');
const Columns = require('./routes/columns');
const MarketingColumns = require('./routes/marketing-columns');
const Seo_Column = require('./routes/seo-columns');
const Audit = require('./routes/audit');
// project api
const Development = require('./routes/development');
const Marketing = require('./routes/marketing');
const Seo = require('./routes/seo');
const Department = require('./routes/department');
const User = require('./routes/user');
const Filters = require('./routes/filters');
const { updateDefaultValues } = require('./services/defaultValueUpdater');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const CronStatus = require('./models/CronStatus');

// Run lazy cron to check if daily default update missed
async function runLazyCron() {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    console.log("today", today);
    // 1. Fetch the last time it successfully ran
    const status = await CronStatus.findOne({ taskName: "dailyUpdate" });
    console.log("status", status);
    console.log("Last run update", status.lastRunDate);
    // 2. Check if we already ran it today
    if (!status || status.lastRunDate < today) {
        try {
            console.log("Missed run detected or first run of the day. Starting...");
            logInfo("Lazy Cron started", today);

            await updateDefaultValues();

            // 3. Mark as finished for today
            await CronStatus.findOneAndUpdate(
                { taskName: "dailyUpdate" },
                { lastRunDate: today },
                { upsert: true }
            );

            console.log("Lazy Cron completed for today.");
            logInfo("Lazy Cron completed", today);
        } catch (error) {
            console.error("Lazy Cron failed", error.message);
            logError("Lazy Cron failed", error.message);
        }
    } else {
        console.log("Daily task already completed for today.");
    }
}

const connectDB = () => {
    const mongoURI = process.env.MONGO_URI;
    try {
        mongoose.connect(mongoURI).then(() => {
            console.log("✅ Mongo connected successfully");
            // Run lazy cron after successful DB connection
            runLazyCron();
        });
    } catch (err) {
        console.error(`:x: Mongo connection error :`, err.message);
    }
};
connectDB();

// Log all incoming API requests for debugging
app.use("/api", (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.originalUrl}`);
    next();
});

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