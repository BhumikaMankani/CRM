const Column = require("../models/Column");
const Project = require("../models/Development");
const Audit = require("../models/Audit");

/**
 * Service to update column values to their default values every 24 hours
 */
const updateDefaultValues = async () => {
  try {
    console.log("🔄 Starting default value update cycle...");

    // Get all columns that have default values set
    const columnsWithDefaults = await Column.find({
      status: { $ne: "deactive" },
      column_type: "select",
      hasDefaultValue: true,
      defaultValue: { $exists: true, $ne: "" },
    });

    if (columnsWithDefaults.length === 0) {
      console.log("ℹ️  No columns with default values found.");
      return;
    }

    console.log(
      `📋 Found ${columnsWithDefaults.length} column(s) with default values`
    );

    // Update all active rows for each column,
    // but only if the value has stayed changed for at least 24 hours.
    for (const column of columnsWithDefaults) {
      try {
        // Find all active records where this field is NOT already the default
        const projectsNeedingReset = await Project.find({
          showstatus: { $ne: "deactivate" },
          [column.name]: { $ne: column.defaultValue },
        });

        if (!projectsNeedingReset.length) {
          console.log(
            `ℹ️  No rows needed reset for column "${column.column_heading}".`
          );
          continue;
        }

        console.log(
          `📌 Resetting ${projectsNeedingReset.length} row(s) for column "${column.column_heading}" to default value "${column.defaultValue}"`
        );

        for (const project of projectsNeedingReset) {
          const fieldName = column.name;
          const oldValue = project[fieldName];
          const newValue = column.defaultValue;

          // Check last audit entry for this record/field to enforce 24-hour wait
          try {
            const lastAudit = await Audit.findOne({
              recordId: project._id,
              columnFieldName: fieldName,
            }).sort({ changedAt: -1 });

            if (lastAudit) {
              const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
              const age = Date.now() - new Date(lastAudit.changedAt).getTime();
              // If the last change is less than 24 hours old, skip resetting now
              if (age < TWENTY_FOUR_HOURS_MS) {
                continue;
              }
            }
          } catch (auditLookupErr) {
            console.error(
              `⚠️ Failed to read last audit for project ${project._id} / column "${column.column_heading}":`,
              auditLookupErr.message
            );
          }

          // 1) Write an audit entry so it appears in View change history
          try {
            await Audit.create({
              recordId: project._id,
              columnId: column._id,
              columnName: column.column_heading,
              columnFieldName: fieldName,
              oldValue: oldValue ?? null,
              newValue: newValue ?? null,
              // System-initiated change
              changedByUserId: "system",
              changedByUserName: "System Default Reset",
            });
          } catch (auditErr) {
            console.error(
              `⚠️ Failed to write audit for project ${project._id} / column "${column.column_heading}":`,
              auditErr.message
            );
          }

          // 2) Actually apply the default value to the document.
          // Use set + markModified to ensure Mongoose persists dynamic keys
          // on this very loose schema.
          try {
            project.set(fieldName, newValue);
            project.markModified(fieldName);
            await project.save();
            console.log(
              `💾 Saved default for project ${project._id} / field "${fieldName}" = "${newValue}"`
            );
          } catch (saveErr) {
            console.error(
              `❌ Failed to save default for project ${project._id} / field "${fieldName}":`,
              saveErr.message
            );
          }
        }

        console.log(
          `✅ Completed default resets for column "${column.column_heading}".`
        );
      } catch (err) {
        console.error(
          `❌ Error updating column "${column.column_heading}":`,
          err.message
        );
      }
    }

    console.log("✅ Default value update cycle completed.");
  } catch (err) {
    console.error("❌ Error in default value update cycle:", err.message);
  }
};

/**
 * Start the interval to update default values every 24 hours
 */
const startDefaultValueUpdater = () => {
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  console.log(
    "⏰ Default value updater started. First run in 24 hours, then every 24 hours."
  );

  const firstTimeout = setTimeout(() => {
    updateDefaultValues();

    // After the first run, switch to interval
    setInterval(() => {
      updateDefaultValues();
    }, TWENTY_FOUR_HOURS_MS);
  }, TWENTY_FOUR_HOURS_MS);

  return firstTimeout;
};

module.exports = {
  updateDefaultValues,
  startDefaultValueUpdater,
};
