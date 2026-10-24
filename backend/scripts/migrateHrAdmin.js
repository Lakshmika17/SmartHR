
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Company = require("../models/Company");

async function migrateHrAdmin() {
  try {
    const email = String(process.env.HR_EMAIL || "")
      .trim()
      .toLowerCase();

    if (!email) {
      throw new Error("HR_EMAIL is missing from backend/.env");
    }

    await connectDB();

    const company = await Company.findOne({
      companyCode: "SMARTHR001",
    });

    if (!company) {
      throw new Error("SmartHR company was not found.");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("No existing user was found for HR_EMAIL.");
    }

    if (user.role !== "HR" && user.role !== "HR_ADMIN") {
      throw new Error(
        `Existing role is ${user.role}. Refusing to promote automatically.`
      );
    }

    if (
      user.company &&
      user.company.toString() !== company._id.toString()
    ) {
      throw new Error(
        "User already belongs to another company. No changes made."
      );
    }

    user.role = "HR_ADMIN";
    user.company = company._id;
    user.isActive = true;

    await user.save();

    console.log("Existing HR account migrated successfully.");
    console.log("Role: HR_ADMIN");
    console.log("Company:", company.name);
    console.log("Password unchanged.");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrateHrAdmin();
