const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Check if user exists (for login)
router.post("/", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Searching with lowercase keys to match the actual User model fields
        const user = await User.findOne({ email, password });

        if (user) {
            res.json({ exists: true, user });
        } else {
            res.status(401).json({ exists: false, error: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login route error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET all users (development only)
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
