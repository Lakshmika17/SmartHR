
const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

const {
  requireAuth,
  requireHRAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Only HR Admin can manage HR Staff.
router.use(requireAuth, requireHRAdmin);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatStaff = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// ========================================
// GET ALL HR STAFF
// GET /api/staff
// ========================================

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

// ========================================
// CREATE HR STAFF
// POST /api/staff
// ========================================

router.post("/", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const password = req.body?.password;
    const confirmPassword = req.body?.confirmPassword;

    if (
      !name ||
      !email ||
      typeof password !== "string" ||
      !password
    ) {
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
      !emailRegex.test(email)
    ) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (
      password.length < 12 ||
      password.length > 128
    ) {
      return res.status(400).json({
        message: "Password must be between 12 and 128 characters.",
      });
    }

    if (
      typeof confirmPassword !== "string" ||
      password !== confirmPassword
    ) {
      return res.status(400).json({
        message: "Password and confirm password must match.",
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
      staff: formatStaff(staffUser),
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

// ========================================
// EDIT HR STAFF + OPTIONAL PASSWORD CHANGE
// PUT /api/staff/:id
// ========================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid staff ID.",
      });
    }

    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const password = req.body?.password;
    const confirmPassword = req.body?.confirmPassword;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required.",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        message: "Name must not exceed 100 characters.",
      });
    }

    if (
      email.length > 254 ||
      !emailRegex.test(email)
    ) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const staffUser = await User.findOne({
      _id: id,
      company: req.user.companyId,
      role: "HR_STAFF",
    });

    if (!staffUser) {
      return res.status(404).json({
        message: "HR Staff account not found.",
      });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: staffUser._id },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    // Password is optional when editing.
    // Leaving both password fields empty keeps
    // the staff member's current password.
    const changingPassword =
      password !== undefined && password !== "";

    if (changingPassword) {
      if (
        typeof password !== "string" ||
        password.length < 12 ||
        password.length > 128
      ) {
        return res.status(400).json({
          message: "New password must be between 12 and 128 characters.",
        });
      }

      if (
        typeof confirmPassword !== "string" ||
        password !== confirmPassword
      ) {
        return res.status(400).json({
          message: "New password and confirm password must match.",
        });
      }
    } else if (
      confirmPassword !== undefined &&
      confirmPassword !== ""
    ) {
      return res.status(400).json({
        message: "Enter a new password before confirming it.",
      });
    }

    staffUser.name = name;
    staffUser.email = email;

    if (changingPassword) {
      staffUser.password = await bcrypt.hash(password, 12);
    }

    await staffUser.save();

    return res.status(200).json({
      message: changingPassword
        ? "HR Staff details and password updated successfully."
        : "HR Staff details updated successfully.",
      staff: formatStaff(staffUser),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    console.error("Update staff error:", error.message);

    return res.status(500).json({
      message: "Unable to update HR Staff.",
    });
  }
});

// ========================================
// ACTIVATE / DEACTIVATE HR STAFF
// PATCH /api/staff/:id/status
// ========================================

router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid staff ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false.",
      });
    }

    const staffUser = await User.findOne({
      _id: id,
      company: req.user.companyId,
      role: "HR_STAFF",
    });

    if (!staffUser) {
      return res.status(404).json({
        message: "HR Staff account not found.",
      });
    }

    staffUser.isActive = isActive;

    await staffUser.save();

    return res.status(200).json({
      message: isActive
        ? "HR Staff activated successfully."
        : "HR Staff deactivated successfully.",
      staff: formatStaff(staffUser),
    });
  } catch (error) {
    console.error("Update staff status error:", error.message);

    return res.status(500).json({
      message: "Unable to update HR Staff status.",
    });
  }
});

module.exports = router;
