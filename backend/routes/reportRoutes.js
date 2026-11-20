
const express = require("express");
const mongoose = require("mongoose");

const Employee = require("../models/Employee");
const AttritionRequest = require("../models/AttritionRequest");

const {
  requireAuth,
  requireHRAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Only authenticated HR Admin users can access reports.
router.use(requireAuth, requireHRAdmin);

const LIMIT = 5000;

// ========================================
// DATE VALIDATION
// ========================================

const validDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

// ========================================
// GET /api/reports
//
// Supported types:
// employees
// promotions
// attrition
//
// Optional filters:
// type, status, from, to
// ========================================

router.get("/", async (req, res) => {
  try {
    // Get company from authenticated user.
    const companyId =
      req.user.companyId || req.user.company;

    if (!mongoose.isValidObjectId(companyId)) {
      return res.status(403).json({
        message: "Company access unavailable.",
      });
    }

    const company = new mongoose.Types.ObjectId(
      String(companyId)
    );

    const type = String(
      req.query.type || "employees"
    );

    const allowedTypes = [
      "employees",
      "promotions",
      "attrition",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid report type.",
      });
    }

    // ====================================
    // DATE FILTERS
    // ====================================

    const from = validDate(req.query.from);
    const to = validDate(req.query.to);

    if (
      (req.query.from && !from) ||
      (req.query.to && !to)
    ) {
      return res.status(400).json({
        message: "Invalid date filter.",
      });
    }

    if (to) {
      to.setUTCHours(23, 59, 59, 999);
    }

    if (from && to && from > to) {
      return res.status(400).json({
        message: "From date must be before To date.",
      });
    }

    // Company isolation is enforced here.
    const filter = { company };

    if (from || to) {
      filter.createdAt = {};

      if (from) {
        filter.createdAt.$gte = from;
      }

      if (to) {
        filter.createdAt.$lte = to;
      }
    }

    // ====================================
    // STATUS FILTER
    // ====================================

    const status = String(
      req.query.status || "All"
    );

    if (status !== "All") {
      const allowedStatuses = {
        employees: ["Active", "Inactive"],
        promotions: [
          "Pending",
          "Approved",
          "Rejected",
        ],
        attrition: [
          "Pending",
          "Under Review",
          "Action Taken",
          "Closed",
        ],
      };

      if (!allowedStatuses[type].includes(status)) {
        return res.status(400).json({
          message: "Invalid report status.",
        });
      }

      filter.status = status;
    }

    // ====================================
    // LOAD REPORT RECORDS
    // ====================================

    let rows;
    let total;

    if (type === "employees") {
      [rows, total] = await Promise.all([
        Employee.find(filter)
          .select(
            "name email department designation status createdAt"
          )
          .sort({ createdAt: -1 })
          .limit(LIMIT)
          .lean(),

        Employee.countDocuments(filter),
      ]);
    } else if (type === "attrition") {
      [rows, total] = await Promise.all([
        AttritionRequest.find(filter)
          .select(
            "employee riskLevel attritionProbability status retentionAction adminRemarks createdAt reviewedAt"
          )
          .populate(
            "employee",
            "name email department"
          )
          .sort({ createdAt: -1 })
          .limit(LIMIT)
          .lean(),

        AttritionRequest.countDocuments(filter),
      ]);
    } else if (type === "promotions") {
      // Match this import to the model already
      // used in backend/routes/promotionRoutes.js.
      const PromotionRequest = require(
        "../models/PromotionRequest"
      );

      [rows, total] = await Promise.all([
        PromotionRequest.find(filter)
          .select(
            "employee status modelPrediction promotionProbability adminRemarks createdAt reviewedAt"
          )
          .populate(
            "employee",
            "name email department"
          )
          .sort({ createdAt: -1 })
          .limit(LIMIT)
          .lean(),

        PromotionRequest.countDocuments(filter),
      ]);
    }

    // ====================================
    // API RESPONSE
    // ====================================

    return res.status(200).json({
      type,
      rows,
      total,
      limit: LIMIT,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Reports error:", error);

    return res.status(500).json({
      message:
        "Unable to load report. Check the backend model names.",
    });
  }
});

module.exports = router;
