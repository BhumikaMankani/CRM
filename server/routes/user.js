const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Check if user exists (for login)
router.post("/", async (req, res) => {
    try {
        const { email, password } = req.body || {};
        console.log("Login attempt for email:", email);
        console.log("Received password hash:", password);

        if (!email || !password) {
            console.warn("Missing email or password in request body");
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Searching with lowercase keys to match the actual User model fields
        const user = await User.findOne({ email: email.toLowerCase() });
        console.log("User found in DB:", user ? "Yes" : "No");

        if (user) {
            console.log("DB password hash:", user.password);
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

router.put("/columnAccess", async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.column_access = access;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user department
router.patch("/:id", async (req, res) => {
    console.log(`Patching user ${req.params.id} with department:`, req.body.department);
    try {
        const { department } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { department },
            { new: true }
        );
        if (!updatedUser) {
            console.warn(`User ${req.params.id} not found for update`);
            return res.status(404).json({ error: "User not found" });
        }
        console.log(`Successfully updated user ${req.params.id}`);
        res.json(updatedUser);
    } catch (err) {
        console.error(`Error updating user ${req.params.id}:`, err.message);
        res.status(400).json({ error: err.message });
    }
});

// router.patch("/column-access", async (req, res) => {
//     const { columnName } = req.body;

//     if (!columnName) {
//         return res.status(400).json({ error: "columnName is required" });
//     }

//     try {
//         const users = await User.find();

//         const bulkOps = users.map(user => {
//             let existing = user.column_access
//                 ? user.column_access.split(',').map(c => c.trim())
//                 : [];

//             if (!existing.includes(columnName)) {
//                 existing.push(columnName);
//             }

//             return {
//                 updateOne: {
//                     filter: { _id: user._id },
//                     update: { column_access: existing.join(',') }
//                 }
//             };
//         });

//         if (bulkOps.length > 0) {
//             await User.bulkWrite(bulkOps);
//         }

//         res.json({ message: "Column access updated for all staff" });

//     } catch (err) {
//         console.error("Error updating column access:", err.message);
//         res.status(500).json({ error: err.message });
//     }
// });


module.exports = router;
