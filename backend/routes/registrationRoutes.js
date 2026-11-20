
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const Company = require("../models/Company");
const User = require("../models/User");

const router = express.Router();

const allowedIndustries = [
  "Information Technology",
  "Software Development",
  "Consulting",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Other",
];

router.post("/register-company", async (req, res) => {
  let createdCompany = null;

  try {
    const companyName = String(
      req.body.companyName || ""
    ).trim();

    const industry = String(
      req.body.industry || ""
    ).trim();

    const adminName = String(
      req.body.adminName || ""
    ).trim();

    const email = String(
      req.body.email || ""
    ).trim().toLowerCase();

    const password = String(
      req.body.password || ""
    );

    const confirmPassword = String(
      req.body.confirmPassword || ""
    );

    if (
      companyName.length < 2 ||
      adminName.length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter valid registration details.",
      });
    }

    if (!allowedIndustries.includes(industry)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid industry.",
      });
    }

    if (password.length < 12 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain between 12 and 128 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    const companyCode =
      "SH-" +
      crypto.randomBytes(6).toString("hex").toUpperCase();

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    createdCompany = await Company.create({
      name: companyName,
      industry,
      companyCode,
      isActive: true,
    });

    const admin = await User.create({
      name: adminName,
      email,
      password: hashedPassword,
      role: "HR_ADMIN",
      company: createdCompany._id,
      isActive: true,
    });

    console.log("REGISTRATION SUCCESS:", {
      company: createdCompany.companyCode,
      role: admin.role,
    });

    return res.status(201).json({
      success: true,
      message:
        "Company registered successfully. You can now sign in.",
      company: {
        id: createdCompany._id.toString(),
        name: createdCompany.name,
        companyCode: createdCompany.companyCode,
      },
      user: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    if (createdCompany) {
      try {
        await Company.deleteOne({
          _id: createdCompany._id,
        });
      } catch (cleanupError) {
        console.error(
          "Company cleanup failed:",
          cleanupError.message
        );
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or company code already exists.",
      });
    }

    console.error("REGISTRATION ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Company registration failed.",
    });
  }
});

module.exports = router;
