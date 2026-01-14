const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const projectRoutes = require('./routes/project');
// const FormRoutes = require('./routes/formData');
// const ColumnConfigRoutes = require('./routes/columnConfig');
const Columns = require('./routes/columns');
const Development = require('./routes/development');
// const Department = require('./routes/department');
const User = require('./routes/user');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const connectDB = async (retryCount = 5) => {
    const mongoURI = "mongodb://localhost:27017/ProjectTracker"; // specify DB name
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

// app.use('/api/projects', projectRoutes);
// app.use('/api/submit', FormRoutes)
app.use("/api/columns", Columns);
app.use("/api/development", Development);
// app.use("/api/Department", Department);
app.use("/api/user", User);

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Backend is working on http://127.0.0.1:${PORT}`);
});