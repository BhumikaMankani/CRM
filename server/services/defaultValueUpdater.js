const cron = require("node-cron");
const Column = require("../models/Column");
const Project = require("../models/Development");
const Audit = require("../models/Audit");

let isRunning = false;

const updateDefaultValues = async () => {
  try {
    const columnsWithDefaults = await Column.find({
      status: { $ne: "deactive" },
      column_type: "select",
      hasDefaultValue: true,
      defaultValue: { $exists: true, $ne: "" },
    });
    console.log("columnsWithDefaults", columnsWithDefaults);
    if (columnsWithDefaults.length === 0) {
      console.log(":information_source:  No columns with default values found.");
      return;
    }
    console.log(
      `:clipboard: Found ${columnsWithDefaults.length} column(s) with default values`
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
        console.log("projectsNeedingReset", projectsNeedingReset);
        // const projectsNeedingReset = await Project.updateMany(
        //   { showstatus: { $ne: "deactivate" } }, // filter: active projects
        //   { $set: { [column.name]: column.defaultValue } } // update
        // );
        if (!projectsNeedingReset.length) {
          continue;
        }
        for (const project of projectsNeedingReset) {
          const fieldName = column.name;
          const oldValue = project[fieldName];
          const newValue = column.defaultValue;
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
              changedByUserName: "System Reset",
            });
          } catch (auditErr) {
            console.error(
              `:warning: Failed to write audit for project ${project._id} / column "${column.column_heading}":`,
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
              `:floppy_disk: Saved default for project ${project._id} / field "${fieldName}" = "${newValue}"`
            );
          } catch (saveErr) {
            console.error(
              `:x: Failed to save default for project ${project._id} / field "${fieldName}":`,
              saveErr.message
            );
          }
        }
        console.log(
          `:white_check_mark: Completed default resets for column "${column.column_heading}".`
        );
      } catch (err) {
        console.error(
          `:x: Error updating column "${column.column_heading}":`,
          err.message
        );
      }
    }
    console.log(":white_check_mark: Default value update cycle completed.");
  } catch (err) {
    console.error(":x: Error in default value update cycle:", err.message);
  }
};

/**
 * Cron: runs every 2 minutes (testing)
 */
const startDefaultValueUpdater = () => {
  console.log("⏰ Default value cron started (every 2 minutes)");

  cron.schedule("0 23 * * *", async () => {
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
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // timezone set karna important hai
  });
};

module.exports = {
  startDefaultValueUpdater,
  updateDefaultValues,
};
