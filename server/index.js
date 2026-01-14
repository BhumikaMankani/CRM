require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// Import routes
const Columns = require('./routes/columns');
const Development = require('./routes/development');
const User = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy for production
if (NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Security Middleware
app.use(helmet()); // Sets various HTTP headers for security

// CORS Configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Data Sanitization against NoSQL injection
app.use(mongoSanitize());

// Database Connection
const connectDB = async (retryCount = 5) => {
    const mongoURI = process.env.MONGODB_URI || "mongodb+srv://info_db_user:info_db_user@cluster0.xlzltty.mongodb.net/?appName=Cluster0";
    
    if (!process.env.MONGODB_URI && NODE_ENV === 'production') {
        console.error("⚠️  WARNING: MONGODB_URI not set in environment variables. Using fallback URI.");
    }
    
    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority',
        });
        console.log(`✅ Mongo connected successfully (${NODE_ENV})`);
    } catch (err) {
        console.error(`❌ Mongo connection error (Retries left: ${retryCount}):`, err.message);
        if (retryCount > 0) {
            setTimeout(() => connectDB(retryCount - 1), 5000);
        } else {
            console.error("💀 Max retries reached. Please check your connection or MongoDB server.");
            process.exit(1);
        }
    }
};
connectDB();

// API Routes
app.use("/api/columns", Columns);
app.use("/api/development", Development);
app.use("/api/user", User);

// Health Check Endpoint
app.get('/health', (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        status: 'OK',
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
    };
    res.status(200).json(healthcheck);
});

// Serve static files from the React app build directory
const distPath = path.join(__dirname, '../my-react-app/dist');
app.use(express.static(distPath));

// Catch all handler: send back React's index.html file for client-side routing
app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Error:', err);
    
    const statusCode = err.statusCode || 500;
    const message = NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message;
    
    res.status(statusCode).json({
        error: message,
        ...(NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend running on http://0.0.0.0:${PORT} [${NODE_ENV}]`);
    console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
});