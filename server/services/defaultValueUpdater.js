const Column = require("../models/Column");
const Project = require("../models/Development");
const Audit = require("../models/Audit");
const logError = require("../utils/logError");

const updateDefaultValues = async () => {
  try {
    const columnsWithDefaults = await Column.find({
      status: { $ne: "deactive" },
      column_type: "select",
      hasDefaultValue: true,
      defaultValue: { $exists: true, $ne: "" },
    });

    console.log("columnsWithDefaults count:", columnsWithDefaults.length);

    if (!columnsWithDefaults.length) {
      console.log("No columns with default values found.");
      return;
    }

    console.log(`Found ${columnsWithDefaults.length} column(s)`);

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

          console.log("Updating:", fieldName);

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
            await logError("Audit write failed", auditErr, {
              projectId: project._id,
              column: column.column_heading,
            });
          }

          // ===== SAVE UPDATE (ALWAYS RUNS) =====
          try {
            project.set(fieldName, newValue);
            project.markModified(fieldName);
            await project.save();

            console.log(
              `Saved default for project ${project._id}`
            );
          } catch (saveErr) {
            await logError("Project save failed", saveErr, {
              projectId: project._id,
              field: fieldName,
            });
          }
        }

        console.log(`Completed column: ${column.column_heading}`);

      } catch (err) {
        await logError("Column processing failed", err, {
          column: column.column_heading,
        });
      }
    }

    console.log("Default value update cycle completed.");

  } catch (err) {
    await logError("Cycle error", err);
  }
};

module.exports = { updateDefaultValues };