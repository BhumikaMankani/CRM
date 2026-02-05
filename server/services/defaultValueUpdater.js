// const Column = require("../models/Column");
// const Project = require("../models/Development");
// const Audit = require("../models/Audit");
// /**
//  * Service to update column values to their default values every night at 11:00 PM
//  */
// const updateDefaultValues = async () => {
//   try {
//     console.log(":arrows_counterclockwise: Starting default value update cycle...");
//     // Get all columns that have default values set
//     const columnsWithDefaults = await Column.find({
//       status: { $ne: "deactive" },
//       column_type: "select",
//       hasDefaultValue: true,
//       defaultValue: { $exists: true, $ne: "" },
//     });
//     if (columnsWithDefaults.length === 0) {
//       console.log(":information_source:  No columns with default values found.");
//       return;
//     }
//     console.log(
//       `:clipboard: Found ${columnsWithDefaults.length} column(s) with default values`
//     );
//     // Update all active rows for each column,
//     // but only if the value has stayed changed for at least 24 hours.
//     for (const column of columnsWithDefaults) {
//       try {
//         // Find all active records where this field is NOT already the default
//         const projectsNeedingReset = await Project.find({
//           showstatus: { $ne: "deactivate" },
//           [column.name]: { $ne: column.defaultValue },
//         });
//         if (!projectsNeedingReset.length) {
//           console.log(
//             `:information_source:  No rows needed reset for column "${column.column_heading}".`
//           );
//           continue;
//         }
//         console.log(
//           `:pushpin: Resetting ${projectsNeedingReset.length} row(s) for column "${column.column_heading}" to default value "${column.defaultValue}"`
//         );
//         for (const project of projectsNeedingReset) {
//           const fieldName = column.name;
//           const oldValue = project[fieldName];
//           const newValue = column.defaultValue;
//           // 1) Write an audit entry so it appears in View change history
//           try {
//             await Audit.create({
//               recordId: project._id,
//               columnId: column._id,
//               columnName: column.column_heading,
//               columnFieldName: fieldName,
//               oldValue: oldValue ?? null,
//               newValue: newValue ?? null,
//               // System-initiated change
//               changedByUserId: "system",
//               changedByUserName: "System Default Reset",
//             });
//           } catch (auditErr) {
//             console.error(
//               `:warning: Failed to write audit for project ${project._id} / column "${column.column_heading}":`,
//               auditErr.message
//             );
//           }
//           // 2) Actually apply the default value to the document.
//           // Use set + markModified to ensure Mongoose persists dynamic keys
//           // on this very loose schema.
//           try {
//             project.set(fieldName, newValue);
//             project.markModified(fieldName);
//             await project.save();
//             console.log(
//               `:floppy_disk: Saved default for project ${project._id} / field "${fieldName}" = "${newValue}"`
//             );
//           } catch (saveErr) {
//             console.error(
//               `:x: Failed to save default for project ${project._id} / field "${fieldName}":`,
//               saveErr.message
//             );
//           }
//         }
//         console.log(
//           `:white_check_mark: Completed default resets for column "${column.column_heading}".`
//         );
//       } catch (err) {
//         console.error(
//           `:x: Error updating column "${column.column_heading}":`,
//           err.message
//         );
//       }
//     }
//     console.log(":white_check_mark: Default value update cycle completed.");
//   } catch (err) {
//     console.error(":x: Error in default value update cycle:", err.message);
//   }
// };
// /**
//  * Start the interval to update default values every 24 hours
//  */
// const startDefaultValueUpdater = () => {
//   console.log(":alarm_clock: Scheduling default value updater for 11:00 PM (23:00) daily...");
//   const now = new Date();
//   const target = new Date();
//   // Set target to 23:00:00.000 today
//   target.setHours(23, 0, 0, 0);
//   // If it's already past 23:00 for today, schedule for tomorrow
//   if (now > target) {
//     target.setDate(target.getDate() + 1);
//   }
//   const msUntilTarget = target.getTime() - now.getTime();
//   console.log(
//     `:hourglass_flowing_sand: Next update scheduled in ${Math.floor(msUntilTarget / 1000 / 60)} minutes (at ${target.toLocaleString()})`
//   );
//   // Schedule the first run
//   const timeoutId = setTimeout(() => {
//     updateDefaultValues();
//     // Then run every 24 hours thereafter
//     setInterval(() => {
//       updateDefaultValues();
//     }, 24* 60 * 60 * 1000);
//   }, msUntilTarget);
//   return timeoutId;
// };
// // const startDefaultValueUpdater = () => {
// //   console.log("⏰ Starting default value updater (runs every 5 minutes)");

// //   // Run once immediately (optional but recommended)
// //   updateDefaultValues();

// //   // Run every 5 minutes
// //   const intervalId = setInterval(() => {
// //     updateDefaultValues();
// //   }, 2 * 60 * 1000); // 5 minutes

// //   return intervalId;
// // };
// module.exports = {
//   updateDefaultValues,
//   startDefaultValueUpdater,
// };

const cron = require("node-cron");
const Column = require("../models/Column");
const Project = require("../models/Development");
const Audit = require("../models/Audit");

let isRunning = false;

// FOR TESTING: 2 minutes instead of 24 hours
// const RESET_AFTER_MS = 2 * 60 * 1000;
const RESET_AFTER_MS = 24 * 60 * 60 * 1000;

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

  cron.schedule("11 05 * * *", async () => {
  // cron.schedule("0 23 * * *", async () => {
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

