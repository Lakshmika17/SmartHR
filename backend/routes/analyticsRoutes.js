
const express = require("express");
const mongoose = require("mongoose");

const Employee = require("../models/Employee");
const AttritionRequest = require("../models/AttritionRequest");

const {
  requireAuth,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All analytics requests require login.
router.use(requireAuth);

// ========================================
// GET /api/analytics
// Company-specific HR analytics
// ========================================

router.get("/", async (req, res) => {
  try {
    // Never accept a company ID from the frontend.
    // Always use the authenticated user's company.
    const companyId =
      req.user.companyId || req.user.company;

    if (
      !companyId ||
      !mongoose.isValidObjectId(companyId)
    ) {
      return res.status(403).json({
        message: "Company access is unavailable.",
      });
    }

    const company = new mongoose.Types.ObjectId(
      String(companyId)
    );

    // ====================================
    // FETCH COMPANY STATISTICS
    // ====================================

    const [
      totalEmployees,
      departmentRows,
      attritionRows,
      collections,
    ] = await Promise.all([
      // Total company employees
      Employee.countDocuments({ company }),

      // Employee distribution by department
      Employee.aggregate([
        {
          $match: { company },
        },
        {
          $group: {
            _id: {
              $ifNull: ["$department", "Unassigned"],
            },
            employees: { $sum: 1 },
          },
        },
        {
          $sort: {
            employees: -1,
            _id: 1,
          },
        },
      ]),

      // Attrition assessment statistics
      AttritionRequest.aggregate([
        {
          $match: { company },
        },
        {
          $group: {
            _id: null,

            total: { $sum: 1 },

            high: {
              $sum: {
                $cond: [
                  { $eq: ["$riskLevel", "High"] },
                  1,
                  0,
                ],
              },
            },

            medium: {
              $sum: {
                $cond: [
                  { $eq: ["$riskLevel", "Medium"] },
                  1,
                  0,
                ],
              },
            },

            low: {
              $sum: {
                $cond: [
                  { $eq: ["$riskLevel", "Low"] },
                  1,
                  0,
                ],
              },
            },

            pending: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "Pending"] },
                  1,
                  0,
                ],
              },
            },

            underReview: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "Under Review"] },
                  1,
                  0,
                ],
              },
            },

            actionTaken: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "Action Taken"] },
                  1,
                  0,
                ],
              },
            },

            closed: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "Closed"] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      // Discover existing promotion collection
      mongoose.connection.db
        .listCollections({}, { nameOnly: true })
        .toArray(),
    ]);

    // ====================================
    // PROMOTION REQUEST STATISTICS
    // ====================================

    // These names are based on possible
    // MongoDB collection names.
    // Update if your actual collection
    // uses a different name.
    const promotionCollection = collections.find(
      (item) =>
        [
          "promotionrequests",
          "promotions",
        ].includes(item.name.toLowerCase())
    );

    const promotionRequests = promotionCollection
      ? await mongoose.connection.db
          .collection(promotionCollection.name)
          .countDocuments({ company })
      : null;

    // ====================================
    // FORMAT DEPARTMENT DATA
    // ====================================

    const departments = departmentRows.map(
      (row) => ({
        name: String(
          row._id || "Unassigned"
        ),
        employees: row.employees,
      })
    );

    // ====================================
    // FORMAT ATTRITION DATA
    // ====================================

    const attrition = attritionRows[0] || {};

    const attritionStats = {
      total: attrition.total || 0,
      high: attrition.high || 0,
      medium: attrition.medium || 0,
      low: attrition.low || 0,
      pending: attrition.pending || 0,
      underReview: attrition.underReview || 0,
      actionTaken: attrition.actionTaken || 0,
      closed: attrition.closed || 0,
    };

    // ====================================
    // SEND ANALYTICS RESPONSE
    // ====================================

    return res.status(200).json({
      totalEmployees,

      promotionRequests,

      departments,

      attrition: attritionStats,

      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "Analytics error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load company analytics.",
    });
  }
});

module.exports = router;
