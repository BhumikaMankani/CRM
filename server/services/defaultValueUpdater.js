const Column = require("../models/Column");
const Project = require("../models/Development");

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

    // Update all active rows for each column
    for (const column of columnsWithDefaults) {
      try {
        const updateResult = await Project.updateMany(
          { showstatus: { $ne: "deactivate" } },
          { $set: { [column.name]: column.defaultValue } }
        );

        console.log(
          `✅ Updated ${updateResult.modifiedCount} row(s) for column "${column.column_heading}" to default value "${column.defaultValue}"`
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

  // IMPORTANT: do NOT run immediately.
  // First run will happen after 24 hours, then every 24 hours.
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
