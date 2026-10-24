
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");

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
  const companyName = String(req.body.companyName || "").trim();
  const industry = String(req.body.industry || "").trim();
  const adminName = String(req.body.adminName || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const confirmPassword = String(req.body.confirmPassword || "");

  if (
    companyName.length < 2 ||
    companyName.length > 120 ||
    adminName.length < 2 ||
    adminName.length > 100 ||
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({
      message: "Please provide valid company, name, and email details.",
    });
  }

  if (!allowedIndustries.includes(industry)) {
    return res.status(400).json({
      message: "Please select a valid industry.",
    });
  }

  if (password.length < 12 || password.length > 128) {
    return res.status(400).json({
      message: "Password must contain between 12 and 128 characters.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match.",
    });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is unavailable. Please try again shortly.",
    });
  }

  const session = await mongoose.startSession();

  try {
    let createdCompany;
    let createdAdmin;

    await session.withTransaction(async () => {
      const existingUser = await User.findOne({ email })
        .session(session);

      if (existingUser) {
        const error = new Error("An account with this email already exists.");
        error.status = 409;
        throw error;
      }

      const companyCode =
        "SH-" + crypto.randomBytes(6).toString("hex").toUpperCase();

      const passwordHash = await bcrypt.hash(password, 12);

      const companies = await Company.create(
        [
          {
            name: companyName,
            industry,
            companyCode,
            isActive: true,
          },
        ],
        { session }
      );

      createdCompany = companies[0];

      const users = await User.create(
        [
          {
            name: adminName,
            email,
            password: passwordHash,
            role: "HR_ADMIN",
            company: createdCompany._id,
            isActive: true,
          },
        ],
        { session }
      );

      createdAdmin = users[0];
    });

    return res.status(201).json({
      message: "Company registered successfully. You can now sign in.",
      company: {
        id: createdCompany._id.toString(),
        name: createdCompany.name,
        companyCode: createdCompany.companyCode,
      },
      user: {
        id: createdAdmin._id.toString(),
        name: createdAdmin.name,
        email: createdAdmin.email,
        role: createdAdmin.role,
      },
    });
  } catch (error) {
    if (error.status === 409 || error.code === 11000) {
      return res.status(409).json({
        message:
          error.status === 409
            ? error.message
            : "This email or company code is already registered. Please try again.",
      });
    }

    console.error("Company registration failed:", error.message);

    return res.status(500).json({
      message:
        "Unable to register the company. Please try again.",
    });
  } finally {
    await session.endSession();
  }
});

module.exports = router;
