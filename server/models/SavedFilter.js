const mongoose = require("mongoose");
const Development = require("./Development");

const SavedFilterSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        filterName: {
            type: String,
            required: true,
            trim: true
        },
        filterData: {
            type: Object,
            required: true,
            default: {}
        },
        department: {
            type: String,
            required: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        department: {
            type: String,
            default: Development
        },
        allowedUsers: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
            default: []
        }
    },
    {
        collection: "saved_filters",
        versionKey: false
    }
);

// Update the updatedAt field before saving - FIX for "next is not a function" error
SavedFilterSchema.pre('save', function () {
    this.updatedAt = new Date();
});

// Default model (used for development / general filters)
const SavedFilter = mongoose.model("SavedFilter", SavedFilterSchema);

module.exports = SavedFilter;
// Also export schema so we can create department‑specific models with separate collections
module.exports.SavedFilterSchema = SavedFilterSchema;
