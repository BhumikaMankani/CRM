const cron = require("node-cron");
const Column = require("../models/Column");
const Project = require("../models/Development");
const Audit = require("../models/Audit");

let isRunning = false;

// FOR TESTING: 2 minutes instead of 24 hours
const RESET_AFTER_MS = 2 * 60 * 1000;
// const RESET_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * Update column values to default IF unchanged for 24 hours
 */
const updateDefaultValues = async () => {
  console.log("🔄 Starting default value update cycle...");

  try {
    const columnsWithDefaults = await Column.find({
      status: { $ne: "deactive" },
      column_type: "select",
      hasDefaultValue: true,
      defaultValue: { $exists: true, $ne: "" },
    });

    if (!columnsWithDefaults.length) {
      console.log("ℹ️ No columns with default values found.");
      return;
    }

    for (const column of columnsWithDefaults) {
      const fieldName = column.name;

      const projects = await Project.find({
        showstatus: { $ne: "deactivate" },
        [fieldName]: { $ne: column.defaultValue },
      });

      if (!projects.length) continue;

      for (const project of projects) {
        // 🔍 Find last change for this field
        const lastAudit = await Audit.findOne({
          recordId: project._id,
          columnId: column._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        // If never changed → skip (or reset immediately if you want)
        if (!lastAudit) {
          console.log(
            `⏭️ No audit found for project ${project._id}, skipping`
          );
          continue;
        }

        const timeSinceChange = Date.now() - new Date(lastAudit.createdAt).getTime();

        // ⏳ Not old enough → skip
        if (timeSinceChange < RESET_AFTER_MS) {
          console.log(
            `⏳ Project ${project._id} skipped (changed recently)`
          );
          continue;
        }

        // ✅ Reset to default
        const oldValue = project[fieldName];
        const newValue = column.defaultValue;

        try {
          await Audit.create({
            recordId: project._id,
            columnId: column._id,
            columnName: column.column_heading,
            columnFieldName: fieldName,
            oldValue: oldValue ?? null,
            newValue: newValue ?? null,
            changedByUserId: "system",
            changedByUserName: "System Default Reset",
          });

          project.set(fieldName, newValue);
          project.markModified(fieldName);
          await project.save();

          console.log(
            `✅ Reset project ${project._id} field "${fieldName}" to default`
          );
        } catch (err) {
          console.error(
            `❌ Failed resetting project ${project._id}:`,
            err.message
          );
        }
      }
    }

    console.log("✅ Default value update cycle completed.");
  } catch (err) {
    console.error("❌ Error in default value update cycle:", err.message);
  }
};

/**
 * Cron: runs every 2 minutes (testing)
 */
const startDefaultValueUpdater = () => {
  console.log("⏰ Default value cron started (every 2 minutes)");

  cron.schedule("*/2 * * * *", async () => {
    if (isRunning) {
      console.log("⏳ Previous cycle still running, skipping");
      return;
    }

    isRunning = true;
    try {
      await updateDefaultValues();
    } finally {
      isRunning = false;
    }
  });
};

module.exports = {
  startDefaultValueUpdater,
  updateDefaultValues,
};
