
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./User");
const Company = require("./Company");

async function createAdmin() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/SmartHR`);

    console.log("MongoDB connected successfully!");

    // 1. Find or create demo company
    let company = await Company.findOne({
      name: "SmartHR Demo Company"
    });

    if (!company) {
      company = await Company.create({
        name: "SmartHR Demo Company",
        companyCode: "SMARTHR001"
      });

      console.log("Demo company created successfully!");
    } else {
      console.log("Demo company already exists.");
    }

    // 2. Check existing admin
    const email = "admin@smarthr.com";
    const password = "Admin@12345";

    let admin = await User.findOne({ email });

    if (admin) {
      console.log("Admin account already exists.");
      await mongoose.disconnect();
      return;
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create HR Admin
    admin = await User.create({
      name: "SmartHR Administrator",
      email,
      password: hashedPassword,
      role: "HR_ADMIN",
      company: company._id,
      isActive: true
    });

    console.log("\nAdmin created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Role:", admin.role);
    console.log("Company:", company.name);

  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

createAdmin();
