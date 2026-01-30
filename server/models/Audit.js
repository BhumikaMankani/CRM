const mongoose = require("mongoose");

// Central audit log for changes to dynamic columns (e.g. yes/no select fields)
// Uses explicit collection name "audit" so it matches an existing collection
const AuditSchema = new mongoose.Schema(
  {
    // Which row/record in the main table was changed
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Which column definition was changed
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Helpful metadata for display
    columnName: { type: String }, // e.g. "test"
    columnFieldName: { type: String }, // e.g. "test1769667448522"

    // Value change
    oldValue: { type: String },
    newValue: { type: String },

    // Who changed it
    // Store user email in changedByUserId as requested
    changedByUserId: {
      type: String,
    },
    changedByUserName: {
      type: String,
    },

    // When
    changedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: "audit",
    versionKey: false,
  },
);

module.exports = mongoose.model("Audit", AuditSchema);
