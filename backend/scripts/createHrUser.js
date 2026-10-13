require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

async function createHrUser() {
  try {
    if (!process.env.HR_EMAIL || !process.env.HR_PASSWORD) {
      throw new Error("Set HR_EMAIL and HR_PASSWORD in backend/.env");
    }

    if (process.env.HR_PASSWORD.length < 12) {
      throw new Error("HR_PASSWORD must be at least 12 characters");
    }

    await connectDB();

    const email = process.env.HR_EMAIL.trim().toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("HR account already exists. No changes made.");
      return;
    }

    const passwordHash = await bcrypt.hash(
      process.env.HR_PASSWORD,
      12
    );

    await User.create({
      name: "HR Administrator",
      email,
      password: passwordHash,
      role: "HR",
    });

    console.log("Initial HR account created successfully.");
  } catch (error) {
    console.error("HR account setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createHrUser();
