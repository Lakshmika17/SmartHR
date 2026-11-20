
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

// LOGIN API
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const password = req.body?.password;

    const role = String(req.body?.role || "")
      .trim();

    // 1. Validate inputs
    if (
      !email ||
      typeof password !== "string" ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required.",
      });
    }

    if (!["HR_ADMIN", "HR_STAFF"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid login role.",
      });
    }

    // 2. Find user
    const user = await User.findOne({ email })
      .select("+password")
      .populate("company", "name companyCode isActive");

      console.log("========== LOGIN DEBUG ==========");
console.log("Database:", User.db.name);
console.log("User found:", !!user);
console.log("Stored email:", user?.email || "NOT FOUND");
console.log("Stored role:", user?.role || "NOT FOUND");
console.log("Password exists:", !!user?.password);
    if (!user || !user.password) {
      console.log("LOGIN FAILED: USER_NOT_FOUND");

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. Verify password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );
    console.log("Password correct:", isPasswordCorrect);
console.log("=================================");

    if (!isPasswordCorrect) {
      console.log("LOGIN FAILED: WRONG_PASSWORD");

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 4. Verify role
    if (user.role !== role) {
      console.log("LOGIN FAILED: ROLE_MISMATCH");

      return res.status(403).json({
        success: false,
        message:
          "Please select the correct HR Admin or HR Staff login type.",
      });
    }

    // 5. Check account status
    if (user.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    // 6. Check company status
    if (!user.company || user.company.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "Your company is inactive or unavailable.",
      });
    }

    // 7. Check JWT configuration
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured.",
      });
    }

    // 8. Generate token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        companyId: user.company._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    console.log("LOGIN SUCCESS:", user.role);

    // 9. Send response
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        company: {
          id: user.company._id.toString(),
          name: user.company.name,
          companyCode: user.company.companyCode,
        },
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
});

module.exports = router;
