const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");
        const users = await User.find();
        console.log("Total users found:", users.length);
        users.forEach(u => {
            console.log(`U: ${u.email} | P: ${u.password} | S: ${u.status}`);
        });
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

checkUsers();
