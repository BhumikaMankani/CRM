// const cron = require("node-cron");
// const Column = require("../models/Column");
// const Project = require("../models/Development");
// const Audit = require("../models/Audit");
// const Logs = require("../models/Logs");


// // ================= LOCAL LOGGER =================

// function log(...args) {
//   console.log(...args);

//   const msg = args
//     .map(a => (typeof a === "object" ? JSON.stringify(a) : a))
//     .join(" ");

//   Logs.create({
//     level: "log",
//     message: msg,
//     source: "default-value-cron"
//   }).catch(() => { });
// }

// function error(...args) {
//   console.error(...args);

//   const msg = args
//     .map(a => (typeof a === "object" ? JSON.stringify(a) : a))
//     .join(" ");

//   Logs.create({
//     level: "error",
//     message: msg,
//     source: "default-value-cron"
//   }).catch(() => { });
// }

// // =================================================


// let isRunning = false;

// const updateDefaultValues = async () => {
//   try {

//     const columnsWithDefaults = await Column.find({
//       status: { $ne: "deactive" },
//       column_type: "select",
//       hasDefaultValue: true,
//       defaultValue: { $exists: true, $ne: "" },
//     });

//     log("columnsWithDefaults count:", columnsWithDefaults.length);

//     if (columnsWithDefaults.length === 0) {
//       log("No columns with default values found.");
//       return;
//     }

//     log(`Found ${columnsWithDefaults.length} column(s) with default values`);

//     for (const column of columnsWithDefaults) {
//       try {

//         const projectsNeedingReset = await Project.find({
//           showstatus: { $ne: "deactivate" },
//           [column.name]: { $ne: column.defaultValue },
//         });

//         log(
//           `Column ${column.column_heading} -> projects needing reset:`,
//           projectsNeedingReset.length
//         );

//         if (!projectsNeedingReset.length) continue;

//         for (const project of projectsNeedingReset) {

//           const fieldName = column.name;
//           const oldValue = project[fieldName];
//           const newValue = column.defaultValue;

//           log("Updating field:", fieldName);
//           log("Old value:", oldValue);
//           log("New value:", newValue);

//           // ===== AUDIT WRITE =====
//           try {
//             await Audit.create({
//               recordId: project._id,
//               columnId: column._id,
//               columnName: column.column_heading,
//               columnFieldName: fieldName,
//               oldValue: oldValue ?? null,
//               newValue: newValue ?? null,
//               changedByUserId: "system",
//               changedByUserName: "System Reset",
//             });

//           } catch (auditErr) {
//             error("Audit write failed:", auditErr.message);
//           }

//           // ===== SAVE UPDATE =====
//           try {
//             project.set(fieldName, newValue);
//             project.markModified(fieldName);
//             await project.save();

//             log(
//               `Saved default for project ${project._id} field ${fieldName}`
//             );

//           } catch (saveErr) {
//             error(
//               `Failed saving project ${project._id}`,
//               saveErr.message
//             );
//           }
//         }

//         log(`Completed column: ${column.column_heading}`);

//       } catch (err) {
//         error(`Error processing column ${column.column_heading}`, err.message);
//       }
//     }

//     log("Default value update cycle completed.");

//   } catch (err) {
//     error("Cycle error:", err.message);
//   }
// };

// /**
//  * Cron Job schedual (8:30 AM)
//  */
// const startDefaultValueUpdater = () => {

//   log("Cron started");

//   cron.schedule(
//     "54 9 * * *",
//     async () => {

//       if (isRunning) {
//         log("Previous run still executing — skipped");
//         return;
//       }

//       isRunning = true;

//       try {
//         await updateDefaultValues();
//       } finally {
//         isRunning = false;
//       }

//     },
//     {
//       scheduled: true,
//       timezone: "Asia/Kolkata",
//     }
//   );
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


// ================= CONSOLE OVERRIDE LOGGER =================

// Save original console
const originalLog = console.log;
const originalError = console.error;

// Safe serializer (prevents circular crash)
function serialize(args) {
  return args.map(a => {

    if (a instanceof Error) {
      return `${a.message}\n${a.stack}`;
    }

    if (typeof a === "object") {
      try {
        return JSON.stringify(a);
      } catch {
        return "[Circular Object]";
      }
    }

    return a;

  }).join(" ");
}

// Override console.log
console.log = (...args) => {

  originalLog(...args);

  Logs.create({
    level: "log",
    message: serialize(args),
    source: "default-value-cron",
    pid: process.pid
  }).catch(() => { });
};

// Override console.error
console.error = (...args) => {

  originalError(...args);

  Logs.create({
    level: "error",
    message: serialize(args),
    source: "default-value-cron",
    pid: process.pid
  }).catch(() => { });
};

// ============================================================


let isRunning = false;

const updateDefaultValues = async () => {
  try {

    const columnsWithDefaults = await Column.find({
      status: { $ne: "deactive" },
      column_type: "select",
      hasDefaultValue: true,
      defaultValue: { $exists: true, $ne: "" },
    });

    console.log("columnsWithDefaults count:", columnsWithDefaults.length);

    if (columnsWithDefaults.length === 0) {
      console.log("No columns with default values found.");
      return;
    }

    console.log(`Found ${columnsWithDefaults.length} column(s) with default values`);

    for (const column of columnsWithDefaults) {
      try {

        const projectsNeedingReset = await Project.find({
          showstatus: { $ne: "deactivate" },
          [column.name]: { $ne: column.defaultValue },
        });

        console.log(
          `Column ${column.column_heading} -> projects needing reset:`,
          projectsNeedingReset.length
        );

        if (!projectsNeedingReset.length) continue;

        for (const project of projectsNeedingReset) {

          const fieldName = column.name;
          const oldValue = project[fieldName];
          const newValue = column.defaultValue;

          console.log("Updating field:", fieldName);
          console.log("Old value:", oldValue);
          console.log("New value:", newValue);

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

            console.error("Audit write failed:", auditErr);

          }

          // ===== SAVE UPDATE =====
          try {

            project.set(fieldName, newValue);
            project.markModified(fieldName);
            await project.save();

            console.log(
              `Saved default for project ${project._id} field ${fieldName}`
            );

          } catch (saveErr) {

            console.error(
              `Failed saving project ${project._id}`,
              saveErr
            );

          }
        }

        console.log(`Completed column: ${column.column_heading}`);

      } catch (err) {

        console.error(`Error processing column ${column.column_heading}`, err);

      }
    }

    console.log("Default value update cycle completed.");

  } catch (err) {

    console.error("Cycle error:", err);

  }
};


/**
 * Cron Job schedule (9:54 AM IST)
 */
const startDefaultValueUpdater = () => {

  console.log("Cron started");

  cron.schedule(
    "30 8 * * *",
    async () => {

      try {

        if (isRunning) {
          console.log("Previous run still executing — skipped");
          return;
        }

        isRunning = true;

        await updateDefaultValues();

      } catch (err) {

        console.error("CRON EXECUTION FAILED:", err);

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
