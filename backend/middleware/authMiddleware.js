
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token is required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Authentication is not configured.",
      });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .select("name email role company isActive")
      .populate("company", "isActive");

    if (
      !user ||
      !user.isActive ||
      !user.company ||
      !user.company.isActive
    ) {
      return res.status(401).json({
        message: "Account is inactive or unavailable.",
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      companyId: user.company._id.toString(),
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token. Please sign in again.",
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(500).json({
      message: "Unable to authenticate this request.",
    });
  }
}

function requireHRAdmin(req, res, next) {
  if (!req.user || req.user.role !== "HR_ADMIN") {
    return res.status(403).json({
      message: "Only HR Admins can perform this action.",
    });
  }

  next();
}

module.exports = { requireAuth, requireHRAdmin };
