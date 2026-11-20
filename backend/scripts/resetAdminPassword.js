require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

const User = require("../models/User");

async function resetAdminPassword() {
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to:", mongoose.connection.name);

    if (mongoose.connection.name !== "SmartHR") {
      throw new Error("Unexpected database. Reset cancelled.");
    }

    const email = "admin@smarthr.com";

    const user = await User.findOne({
      email,
      role: "HR_ADMIN",
    }).select("+password");

    if (!user) {
      throw new Error("HR Admin account not found.");
    }

    const newPassword = await rl.question(
      "Enter a new admin password (12-72 characters): "
    );

    if (
      newPassword.length < 12 ||
      newPassword.length > 72
    ) {
      throw new Error(
        "Password must contain between 12 and 72 characters."
      );
    }

    user.password = await bcrypt.hash(newPassword, 12);

    await user.save();

    console.log("Admin password reset successfully.");
  } catch (error) {
    console.error("Reset failed:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

resetAdminPassword();