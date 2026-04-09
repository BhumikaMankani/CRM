// const mongoose = require("mongoose");
// const User = require("../models/User");
// const Department = require("../models/Department");

// const dotenv = require('dotenv');
// dotenv.config();

// const MONGO_URI = process.env.MONGO_URI;

// async function addDepartmentsToAdmins() {
//     try {
//         await mongoose.connect(MONGO_URI);
//         console.log("✅ Connected to MongoDB");

//         // 1. Get all departments
//         const departments = await Department.find({}, { department: 1, _id: 0 });

//         if (!departments.length) {
//             console.log("⚠️ No departments found");
//             return;
//         }

//         // 2. Extract department names
//         const departmentNames = departments
//             .map(dep => dep.department?.trim())
//             .filter(Boolean);

//         console.log("📂 Departments found:", departmentNames);

//         // 3. Update all admin users
//         const result = await User.updateMany(
//             { status: "admin" },
//             { $addToSet: { department: { $each: departmentNames } } }
//         );

//         console.log("✅ Admin users updated");
//         console.log("Matched:", result.matchedCount);
//         console.log("Modified:", result.modifiedCount);

//         // 4. Optional: verify
//         const admins = await User.find(
//             { status: "admin" },
//             { user_name: 1, status: 1, department: 1 }
//         );

//         console.log("🧾 Updated Admin Users:");
//         console.log(JSON.stringify(admins, null, 2));

//     } catch (error) {
//         console.error("❌ Error:", error);
//     } finally {
//         await mongoose.disconnect();
//         console.log("🔌 Disconnected from MongoDB");
//     }
// }

// addDepartmentsToAdmins();