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
const ColumnSchema = new mongoose.Schema({
  column_heading: { type: String, required: true }, name: { type: String, required: true },
  column_type: { type: String, default: "text" }, // text, select, date, condition
  sorting: { type: Boolean, default: false },
  order: { type: Number, default: 0 }, // For column ordering/drag-drop
  multipleValue: { type: [String], default: [] }, // for select
  optionColors: { type: Map, of: String, default: new Map() }, // background colors for options
  optionTextColors: { type: Map, of: String, default: new Map() }, // text colors for options
  conditionColumn1: { type: String }, // for condition type
  conditionColumn2: { type: String }, // for condition type
  equalPrefix: { type: String }, // label if days == 0
  morePrefix: { type: String }, // label if days > 0
  lessPrefix: { type: String }, // label if days < 0
  hasDefaultValue: { type: Boolean, default: false }, // for select dropdown default value
  defaultValue: { type: String }, // default value for select dropdown
  access: { type: [String], default: [] }, // user IDs who can edit/delete this column
  viewAccess: { type: [String], default: [] }, // user IDs who CANNOT see this column
  showInfo: { type: Boolean, default: false }, // whether to show change history info icon
  sticky: { type: Boolean, default: false }, // whether the column should be sticky
  showYear: { type: Boolean, default: false }, // whether to show year with month selection
  status: { type: String, default: "active" }, // active, inactive
  rowpopup_column: { type: Boolean, default: false },
  showInMainProject: { type: Boolean, default: false },
},
  { timestamps: true },);
module.exports = mongoose.model("Column", ColumnSchema);