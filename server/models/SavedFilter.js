const mongoose = require("mongoose");

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
        }
    },
    {
        collection: "saved_filters",
        versionKey: false
    }
);

// Update the updatedAt field before saving - FIX for "next is not a function" error
SavedFilterSchema.pre('save', function() {
    this.updatedAt = new Date();
});

module.exports = mongoose.model("SavedFilter", SavedFilterSchema);
