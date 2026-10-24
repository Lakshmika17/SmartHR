
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Company = require("../models/Company");

async function createHrAdmin() {
  try {
    if (!process.env.HR_EMAIL || !process.env.HR_PASSWORD) {
      throw new Error(
        "Set HR_EMAIL and HR_PASSWORD in backend/.env"
      );
    }

    if (process.env.HR_PASSWORD.length < 12) {
      throw new Error(
        "HR_PASSWORD must be at least 12 characters"
      );
    }

    await connectDB();

    const email = process.env.HR_EMAIL.trim().toLowerCase();

    // Find or create the first company.
    let company = await Company.findOne({
      companyCode: "SMARTHR001",
    });

    if (!company) {
      company = await Company.create({
        name: "SmartHR Demo Company",
        industry: "Information Technology",
        companyCode: "SMARTHR001",
        isActive: true,
      });

      console.log("Initial company created.");
    }

    // Never silently overwrite an existing user's account.
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (
        existingUser.role === "HR_ADMIN" &&
        existingUser.company &&
        existingUser.company.toString() === company._id.toString()
      ) {
        console.log("Initial HR Admin already exists. No changes made.");
        return;
      }

      throw new Error(
        "This email already belongs to an existing user. " +
        "Review and migrate that account separately; no user was changed."
      );
    }

    const passwordHash = await bcrypt.hash(
      process.env.HR_PASSWORD,
      12
    );

    await User.create({
      name: "HR Administrator",
      email,
      password: passwordHash,
      role: "HR_ADMIN",
      company: company._id,
      isActive: true,
    });

    console.log("Initial HR Admin created successfully.");
    console.log("Company:", company.name);
    console.log("Company code:", company.companyCode);
    console.log("Role: HR_ADMIN");
  } catch (error) {
    console.error("HR Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createHrAdmin();
