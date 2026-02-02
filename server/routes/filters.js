const express = require("express");
const SavedFilter = require("../models/SavedFilter");
const User = require("../models/User");

const router = express.Router();

// Get all saved filters (respecting access control)
router.get("/", async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "userId query parameter is required" });
        }

        const filters = await SavedFilter.find({
            $or: [
                { userId: userId },
                { allowedUsers: userId }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json(filters);
    } catch (err) {
        console.error("Error fetching all filters:", err);
        res.status(500).json({ message: "Error fetching filters", error: err.message });
    }
});

// Create a new saved filter
router.post("/", async (req, res) => {
    try {
        const { userId, filterName, filterData, department, allowedUsers } = req.body;

        if (!userId || !filterName || !filterData) {
            return res.status(400).json({
                message: "Missing required fields: userId, filterName, or filterData"
            });
        }

        const newFilter = new SavedFilter({
            userId,
            filterName,
            filterData,
            department,
            allowedUsers: allowedUsers || []
        });

        const savedFilter = await newFilter.save();

        // If allowedUsers provided, sync with User collection
        if (allowedUsers && allowedUsers.length > 0) {
            await User.updateMany(
                { _id: { $in: allowedUsers } },
                { $addToSet: { sharedFilters: savedFilter._id } }
            );
        }

        res.status(201).json(savedFilter);
    } catch (err) {
        console.error("Error creating filter:", err);
        res.status(500).json({ message: "Error creating filter", error: err.message });
    }
});

// Get all saved filters for a user (respecting access control)
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const filters = await SavedFilter.find({
            $or: [
                { userId: userId },
                { allowedUsers: userId }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json(filters);
    } catch (err) {
        console.error("Error fetching filters:", err);
        res.status(500).json({ message: "Error fetching filters", error: err.message });
    }
});

// Get a specific saved filter
router.get("/:filterId", async (req, res) => {
    try {
        const { filterId } = req.params;

        const filter = await SavedFilter.findById(filterId);

        if (!filter) {
            return res.status(404).json({ message: "Filter not found" });
        }

        res.status(200).json(filter);
    } catch (err) {
        console.error("Error fetching filter:", err);
        res.status(500).json({ message: "Error fetching filter", error: err.message });
    }
});

// Update a saved filter
router.patch("/:filterId", async (req, res) => {
    try {
        const { filterId } = req.params;
        const { filterName, filterData, allowedUsers } = req.body;

        const filter = await SavedFilter.findByIdAndUpdate(
            filterId,
            {
                filterName: filterName || undefined,
                filterData: filterData || undefined,
                allowedUsers: allowedUsers || undefined,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!filter) {
            return res.status(404).json({ message: "Filter not found" });
        }

        // If allowedUsers provided, sync with User collection
        if (allowedUsers) {
            // First remove this filter from all users it was shared with
            await User.updateMany(
                { sharedFilters: filterId },
                { $pull: { sharedFilters: filterId } }
            );

            // Then add it back to the current set of allowed users
            if (allowedUsers.length > 0) {
                await User.updateMany(
                    { _id: { $in: allowedUsers } },
                    { $addToSet: { sharedFilters: filterId } }
                );
            }
        }

        res.status(200).json(filter);
    } catch (err) {
        console.error("Error updating filter:", err);
        res.status(500).json({ message: "Error updating filter", error: err.message });
    }
});

// Delete a saved filter
router.delete("/:filterId", async (req, res) => {
    try {
        const { filterId } = req.params;

        const filter = await SavedFilter.findByIdAndDelete(filterId);

        if (!filter) {
            return res.status(404).json({ message: "Filter not found" });
        }

        // Also remove from User.sharedFilters
        await User.updateMany(
            { sharedFilters: filterId },
            { $pull: { sharedFilters: filterId } }
        );

        res.status(200).json({ message: "Filter deleted successfully" });
    } catch (err) {
        console.error("Error deleting filter:", err);
        res.status(500).json({ message: "Error deleting filter", error: err.message });
    }
});

module.exports = router;
