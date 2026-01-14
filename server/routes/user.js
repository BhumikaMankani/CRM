const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Check if user exists (for login)
router.post("/", async (req, res) => {
    try {
        const { email, password } = req.body || {};
        console.log("Login attempt for email:", email);

        if (!email || !password) {
            console.warn("Missing email or password in request body");
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Searching with lowercase keys to match the actual User model fields
        const user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // NOTE: In a real app, use bcrypt to compare hashed passwords.
            // Client side MD5 is used here as per existing logic.
            if (user.password === password) {
                console.log("✅ Login successful for:", email);
                res.json({ exists: true, user });
            } else {
                console.warn("❌ Invalid password for:", email);
                res.status(401).json({ exists: false, error: "Invalid email or password" });
            }
        } else {
            console.warn("❌ User not found:", email);
            res.status(401).json({ exists: false, error: "Invalid email or password" });
        }
    } catch (error) {
        console.error("🔥 Login route error:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
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
