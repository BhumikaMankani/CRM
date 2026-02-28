const Column = require("../models/Column");
const Project = require("../models/Development");
const Audit = require("../models/Audit");
const { logError, logInfo } = require("../utils/logError");

const updateDefaultValues = async () => {
  await logInfo("TEST", "Cron reached updateDefaultValues");
  console.log("Cron reached updateDefaultValues");
  try {
    const columnsWithDefaults = await Column.find({
      status: { $ne: "deactive" },
      column_type: "select",
      hasDefaultValue: true,
      defaultValue: { $exists: true, $ne: "" },
    });

    await logInfo(
      "Default Value Job",
      `columnsWithDefaults count: ${columnsWithDefaults.length}`
    );
    console.log("columnsWithDefaults count:", columnsWithDefaults.length);

    if (!columnsWithDefaults.length) {
      console.log("No columns with default values found.");
      return;
    }

    console.log(`Found ${columnsWithDefaults.length} column(s)`);
    await logInfo(
      "Default Value Job",
      `Found ${columnsWithDefaults.length} column(s)`
    );

    for (const column of columnsWithDefaults) {
      try {
        const projectsNeedingReset = await Project.find({
          showstatus: { $ne: "deactivate" },
          [column.name]: { $ne: column.defaultValue },
        });

        await logInfo(
          "Default Value Job",
          `projectsNeedingReset count: ${projectsNeedingReset.length}`
        );

        console.log(
          `Column ${column.column_heading} -> projects needing reset:`,
          projectsNeedingReset.length
        );

        if (!projectsNeedingReset.length) continue;

        for (const project of projectsNeedingReset) {
          const fieldName = column.name;
          const oldValue = project[fieldName];
          const newValue = column.defaultValue;

          await logInfo(
            "Project Reset",
            `Updating field ${fieldName}`,
            { projectId: project._id }
          );
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

            await logInfo(
              "Project Reset",
              `Saved default for project ${project._id}`,
              { projectId: project._id }
            );
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

        await logInfo(
          "Column Reset",
          `Completed column: ${column.column_heading}`,
          { column: column.column_heading }
        );

        console.log(`Completed column: ${column.column_heading}`);

      } catch (err) {
        await logError("Column processing failed", err, {
          column: column.column_heading,
        });
      }
    }

    await logInfo(
      "Default Value Job",
      "Default value update cycle completed."
    );
    console.log("Default value update cycle completed.");

  } catch (err) {
    await logError("Cycle error", err);
  }
};

module.exports = { updateDefaultValues };