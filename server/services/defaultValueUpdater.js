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

module.exports = {
  updateDefaultValues
};