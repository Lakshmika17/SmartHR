
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const {
  requireAuth,
  requireHRAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Require authentication and HR Admin permissions.
router.use(requireAuth, requireHRAdmin);

// GET /api/staff - List staff in the admin's company.
router.get("/", async (req, res) => {
  try {
    const staff = await User.find({
      company: req.user.companyId,
      role: "HR_STAFF",
    })
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ staff });
  } catch (error) {
    console.error("Fetch staff error:", error.message);
    return res.status(500).json({
      message: "Unable to retrieve staff accounts.",
    });
  }
});

// POST /api/staff - Create an HR Staff account.
router.post("/", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        message: "Name must not exceed 100 characters.",
      });
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 12 || password.length > 128) {
      return res.status(400).json({
        message: "Password must be between 12 and 128 characters.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const staffUser = await User.create({
      name,
      email,
      password: passwordHash,
      role: "HR_STAFF",
      company: req.user.companyId,
      isActive: true,
    });

    return res.status(201).json({
      message: "HR Staff account created successfully.",
      staff: {
        id: staffUser._id.toString(),
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role,
        isActive: staffUser.isActive,
        createdAt: staffUser.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    console.error("Create staff error:", error.message);
    return res.status(500).json({
      message: "Unable to create the staff account.",
    });
  }
});

module.exports = router;
