const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.MONGO_URI;
const formatCollectionName = (name) => {
    return name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
};

router.post("/", async (req, res) => {
    const { collectionName, department } = req.body;

    if (!collectionName) {
        return res.status(400).json({ message: "Collection name is required" });
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();

        // ✅ format name
        const baseName = formatCollectionName(collectionName);

        const mainCollection = baseName + "s";
        const columnCollection = `${baseName}_columns`;

        // console.log("collectionName", collectionName);
        // console.log("baseName", baseName);
        // console.log("mainCollection", mainCollection);
        // console.log("columnCollection", columnCollection);
        // ✅ check existing collections
        const existing = await db.listCollections().toArray();
        const existingNames = existing.map(col => col.name);

        // ✅ create main collection
        if (!existingNames.includes(mainCollection)) {
            await db.createCollection(mainCollection);
        }

        // ✅ create columns collection
        if (!existingNames.includes(columnCollection)) {
            await db.createCollection(columnCollection);
        }

        res.status(200).json({
            message: `Collections "${mainCollection}" and "${columnCollection}" created successfully`
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            message: "Error creating collections",
            error: error.message,
        });
    } finally {
        await client.close();
    }
});

module.exports = router;