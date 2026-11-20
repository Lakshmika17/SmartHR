
const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/User");

const {
  requireAuth,
  requireHRAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireHRAdmin);

function getUserId(req) {
  return req.user?.userId || req.user?.id || req.user?._id;
}

function getCompanyId(req) {
  return req.user?.companyId || req.user?.company;
}

async function findAdmin(req, includePassword = false) {
  const userId = getUserId(req);
  const companyId = getCompanyId(req);

  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(companyId)
  ) {
    return null;
  }

  let query = User.findOne({
    _id: userId,
    company: companyId,
    role: "HR_ADMIN",
    isActive: true,
  });

  if (includePassword) {
    query = query.select("+password");
  }

  return query;
}

// ========================================
// GET ADMIN PROFILE
// GET /api/settings/profile
// ========================================

router.get("/profile", async (req, res) => {
  try {
    const admin = await findAdmin(req);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    await admin.populate(
      "company",
      "name companyCode isActive"
    );

    return res.json({
      success: true,
      user: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        company: {
          id: admin.company?._id?.toString(),
          name: admin.company?.name,
          companyCode: admin.company?.companyCode,
        },
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("GET ADMIN PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load admin profile.",
    });
  }
});

// ========================================
// UPDATE ADMIN PROFILE
// PUT /api/settings/profile
// ========================================

router.put("/profile", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must contain 2 to 100 characters.",
      });
    }

    const admin = await findAdmin(req);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    admin.name = name;
    await admin.save();

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("UPDATE ADMIN PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
});

// ========================================
// CHANGE PASSWORD
// PUT /api/settings/password
// ========================================

router.put("/password", async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body || {};

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match.",
      });
    }

    if (
      newPassword.length < 8 ||
      newPassword.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain 8 to 128 characters.",
      });
    }

    const admin = await findAdmin(req, true);

    if (!admin || !admin.password) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    const isCorrect = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!isCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must differ from current password.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    // Store the hash. User.js does not define
    // password hashing middleware.
    admin.password = hashedPassword;

    await admin.save();

    return res.json({
      success: true,
      message:
        "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password.",
    });
  }
});

module.exports = router;
