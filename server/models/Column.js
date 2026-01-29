// const mongoose = require("mongoose");

// const ColumnSchema = new mongoose.Schema({
//     column_heading: { type: String, required: true },
//     name: { type: String, required: true },
//     column_type: { type: String, default: "text" }, // text, select, date
//     sorting: { type: Boolean, default: false },
//     multipleValue: { type: [String], default: [] }, // for select
//     status: { type: String, default: "active" }, // active, inactive
// }, { timestamps: true });

// module.exports = mongoose.model("Column", ColumnSchema);

const mongoose = require("mongoose");
const ColumnSchema = new mongoose.Schema({ column_heading: { type: String, required: true }, name: { type: String, required: true },
    column_type: { type: String, default: "text" }, // text, select, date, condition
    sorting: { type: Boolean, default: false },
    multipleValue: { type: [String], default: [] }, // for select
    conditionColumn1: { type: String }, // for condition type
    conditionColumn2: { type: String }, // for condition type
    hasDefaultValue: { type: Boolean, default: false }, // for select dropdown default value
    defaultValue: { type: String }, // default value for select dropdown
    status: { type: String, default: "active" }, // active, inactive
  },
  { timestamps: true },);
module.exports = mongoose.model("Column", ColumnSchema);