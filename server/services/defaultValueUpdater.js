const Column = require("../models/Column");
const Project = require("../models/Development");
const Audit = require("../models/Audit");

/**
 * Service to update column values to their default values every night at 11:00 PM
 */
const updateDefaultValues = async () => {
  try {
    const now = new Date();
    const nowIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    console.log(`🔄 Starting default value update cycle at ${nowIST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })} IST`);

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
  // We want to run at 11:00 PM IST (Indian Standard Time).
  // IST is UTC + 5 hours 30 minutes.
  // 23:00 IST = 17:30 UTC.
  // Since Fly.io servers run on UTC, we target 17:30 UTC.

  console.log("⏰ Scheduling default value updater for 11:00 PM IST (17:30 UTC) daily...");

  const now = new Date();
  const target = new Date(now);

  // Set target to 17:30:00.000 UTC (which is 23:00 IST)
  target.setUTCHours(17, 30, 0, 0);

  // Calculate current IST time for logging
  const nowIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));

  console.log(`📅 Current Server Time (UTC): ${now.toUTCString()}`);
  console.log(`📅 Current IST Time: ${nowIST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}`);

  // If it's already past 17:30 UTC for 'today', schedule for tomorrow
  if (now > target) {
    console.log(`⏭️  Already past 11 PM IST today, scheduling for tomorrow`);
    target.setUTCDate(target.getUTCDate() + 1);
  } else {
    console.log(`✅ Scheduling for today at 11 PM IST`);
  }

  const msUntilTarget = target.getTime() - now.getTime();
  const hoursUntil = Math.floor(msUntilTarget / 1000 / 60 / 60);
  const minutesUntil = Math.floor((msUntilTarget / 1000 / 60) % 60);

  // Calculate formatted string for logging
  // We show both UTC and the implied IST time for clarity
  const targetIST = new Date(target.getTime() + (5.5 * 60 * 60 * 1000));

  console.log(
    `⏳ Next update scheduled in ${hoursUntil}h ${minutesUntil}m`
  );
  console.log(`🎯 Target Time (UTC): ${target.toUTCString()}`);
  console.log(`🎯 Target Time (IST): ${targetIST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}`);

  // Schedule the first run
  const timeoutId = setTimeout(() => {
    updateDefaultValues();

    // Then run every 24 hours thereafter
    setInterval(() => {
      updateDefaultValues();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  }, msUntilTarget);

  return timeoutId;
};

module.exports = {
  updateDefaultValues,
  startDefaultValueUpdater,
};
