const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    user_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    status: { type: String, default: "staff" },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);