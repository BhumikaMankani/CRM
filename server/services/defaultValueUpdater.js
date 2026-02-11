// const cron = require("node-cron");
// const Column = require("../models/Column");
// const Project = require("../models/Development");
// const Audit = require("../models/Audit");
// const Logs = require("../models/Logs");

// // Save console output to MongoDB
// function saveLog(level, args) {
//   const msg = args
//     .map(a => (typeof a === "object" ? JSON.stringify(a) : a))
//     .join(" ");

//   Logs.create({
//     level,
//     message: msg,
//   }).catch(() => { }); // prevent crash if logging fails
// }

// // Override console functions ONLY in this file
// const originalLog = console.log;
// const originalError = console.error;

// console.log = (...args) => {
//   originalLog(...args);
//   saveLog("log", args);
// };

// console.error = (...args) => {
//   originalError(...args);
//   saveLog("error", args);
// };


// let isRunning = false;

// const updateDefaultValues = async () => {
//   try {
//     const columnsWithDefaults = await Column.find({
//       status: { $ne: "deactive" },
//       column_type: "select",
//       hasDefaultValue: true,
//       defaultValue: { $exists: true, $ne: "" },
//     });
//     console.log("columnsWithDefaults", columnsWithDefaults);
//     if (columnsWithDefaults.length === 0) {
//       console.log("No columns with default values found.");
//       return;
//     }
//     console.log(
//       `Found ${columnsWithDefaults.length} column(s) with default values`
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
//         console.log("projectsNeedingReset", projectsNeedingReset);
//         // const projectsNeedingReset = await Project.updateMany(
//         //   { showstatus: { $ne: "deactivate" } }, // filter: active projects
//         //   { $set: { [column.name]: column.defaultValue } } // update
//         // );
//         if (!projectsNeedingReset.length) {
//           continue;
//         }
//         for (const project of projectsNeedingReset) {
//           const fieldName = column.name;
//           const oldValue = project[fieldName];
//           const newValue = column.defaultValue;
//           console.log("fieldName", fieldName);
//           console.log("newValue", newValue);
//           console.log("oldValue", oldValue);
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
//               changedByUserName: "System Reset",
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
//               `Saved default for project ${project._id} / field "${fieldName}" = "${newValue}"`
//             );
//           } catch (saveErr) {
//             console.error(
//               `Failed to save default for project ${project._id} / field "${fieldName}":`,
//               saveErr.message
//             );
//           }
//         }
//         console.log(
//           `Completed default resets for column "${column.column_heading}".`
//         );
//       } catch (err) {
//         console.error(
//           `Updating column "${column.column_heading}":`,
//           err.message
//         );
//       }
//     }
//     console.log("Default value update cycle completed.");
//   } catch (err) {
//     console.error("Error in default value update cycle:", err.message);
//   }
// };

// /**
//  * Cron: runs every 2 minutes (testing)
//  */
// const startDefaultValueUpdater = () => {
//   console.log("⏰ Default value cron started (every 2 minutes)");

//   cron.schedule("56 17 * * *", async () => {
//     if (isRunning) {
//       console.log("⏳ Previous cycle still running, skipping");
//       return;
//     }

//     isRunning = true;
//     try {
//       await updateDefaultValues();
//     } finally {
//       isRunning = false;
//     }
//   }, {
//     scheduled: true,
//     timezone: "Asia/Kolkata" // timezone set karna important hai
//   });
// };

// module.exports = {
//   startDefaultValueUpdater,
//   updateDefaultValues,
// };

const cron = require("node-cron");
const Column = require("../models/Column");
const Project = require("../models/Development");
const Audit = require("../models/Audit");
const Logs = require("../models/Logs");


// ================= LOCAL LOGGER =================

function log(...args) {
  console.log(...args);

  const msg = args
    .map(a => (typeof a === "object" ? JSON.stringify(a) : a))
    .join(" ");

  Logs.create({
    level: "log",
    message: msg,
    source: "default-value-cron"
  }).catch(() => { });
}

function error(...args) {
  console.error(...args);

  const msg = args
    .map(a => (typeof a === "object" ? JSON.stringify(a) : a))
    .join(" ");

  Logs.create({
    level: "error",
    message: msg,
    source: "default-value-cron"
  }).catch(() => { });
}

// =================================================


let isRunning = false;

const updateDefaultValues = async () => {
  try {

    const columnsWithDefaults = await Column.find({
      status: { $ne: "deactive" },
      column_type: "select",
      hasDefaultValue: true,
      defaultValue: { $exists: true, $ne: "" },
    });

    log("columnsWithDefaults count:", columnsWithDefaults.length);

    if (columnsWithDefaults.length === 0) {
      log("No columns with default values found.");
      return;
    }

    log(`Found ${columnsWithDefaults.length} column(s) with default values`);

    for (const column of columnsWithDefaults) {
      try {

        const projectsNeedingReset = await Project.find({
          showstatus: { $ne: "deactivate" },
          [column.name]: { $ne: column.defaultValue },
        });

        log(
          `Column ${column.column_heading} -> projects needing reset:`,
          projectsNeedingReset.length
        );

        if (!projectsNeedingReset.length) continue;

        for (const project of projectsNeedingReset) {

          const fieldName = column.name;
          const oldValue = project[fieldName];
          const newValue = column.defaultValue;

          log("Updating field:", fieldName);
          log("Old value:", oldValue);
          log("New value:", newValue);

          // ===== AUDIT WRITE =====
          try {
            await Audit.create({
              recordId: project._id,
              columnId: column._id,
              columnName: column.column_heading,
              columnFieldName: fieldName,
              oldValue: oldValue ?? null,
              newValue: newValue ?? null,
              changedByUserId: "system",
              changedByUserName: "System Reset",
            });

          } catch (auditErr) {
            error("Audit write failed:", auditErr.message);
          }

          // ===== SAVE UPDATE =====
          try {
            project.set(fieldName, newValue);
            project.markModified(fieldName);
            await project.save();

            log(
              `Saved default for project ${project._id} field ${fieldName}`
            );

          } catch (saveErr) {
            error(
              `Failed saving project ${project._id}`,
              saveErr.message
            );
          }
        }

        log(`Completed column: ${column.column_heading}`);

      } catch (err) {
        error(`Error processing column ${column.column_heading}`, err.message);
      }
    }

    log("Default value update cycle completed.");

  } catch (err) {
    error("Cycle error:", err.message);
  }
};



/**
 * Cron Job
 */
const startDefaultValueUpdater = () => {

  log("Cron started");

  cron.schedule(
    "30 8 * * *",
    async () => {

      if (isRunning) {
        log("Previous run still executing — skipped");
        return;
      }

      isRunning = true;

      try {
        await updateDefaultValues();
      } finally {
        isRunning = false;
      }

    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
};


module.exports = {
  startDefaultValueUpdater,
  updateDefaultValues,
};
