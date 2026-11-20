
const express = require("express");
const mongoose = require("mongoose");

const Employee = require("../models/Employee");
const User = require("../models/User");

const {
  requireAuth,
  requireHRAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Only authenticated HR Admins can access these APIs.
router.use(requireAuth, requireHRAdmin);

// ========================================
// GET ADMIN DASHBOARD OVERVIEW
// GET /api/dashboard/overview
// ========================================

router.get("/overview", async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (
      !companyId ||
      !mongoose.isValidObjectId(companyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID.",
      });
    }

    const companyObjectId =
      new mongoose.Types.ObjectId(companyId);

    // Fetch company-specific statistics.
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalHRStaff,
      activeHRStaff,
      departments,
    ] = await Promise.all([
      // Total employees
      Employee.countDocuments({
        company: companyObjectId,
      }),

      // Active employees
      Employee.countDocuments({
        company: companyObjectId,
        status: "Active",
      }),

      // Inactive employees
      Employee.countDocuments({
        company: companyObjectId,
        status: "Inactive",
      }),

      // Total HR Staff
      User.countDocuments({
        company: companyObjectId,
        role: "HR_STAFF",
      }),

      // Active HR Staff
      User.countDocuments({
        company: companyObjectId,
        role: "HR_STAFF",
        isActive: true,
      }),

      // Department-wise employee distribution
      Employee.aggregate([
        {
          $match: {
            company: companyObjectId,
          },
        },
        {
          $group: {
            _id: "$department",
            employees: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            employees: -1,
            _id: 1,
          },
        },
      ]),
    ]);

    // Format department results.
    const departmentData = departments.map(
      (department) => ({
        name: department._id,
        employees: department.employees,
      })
    );

    return res.status(200).json({
      success: true,

      message:
        "Admin dashboard statistics fetched successfully.",

      stats: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        totalHRStaff,
        activeHRStaff,
        totalDepartments: departmentData.length,
      },

      departments: departmentData,
    });
  } catch (error) {
    console.error(
      "Admin Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch admin dashboard statistics.",
    });
  }
});

module.exports = router;
