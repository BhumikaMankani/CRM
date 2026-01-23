const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// const projectRoutes = require('./routes/project');
const Columns = require('./routes/columns');
const Development = require('./routes/development');
const Department = require('./routes/department');
const User = require('./routes/user');
const Filters = require('./routes/filters');
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

// User.syncIndexes();

// Log all incoming API requests for debugging
app.use("/api", (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.originalUrl}`);
    next();
});

// app.use('/api/projects', projectRoutes);
app.use("/api/columns", Columns);
app.use("/api/development", Development);
app.use("/api/user", User);
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
