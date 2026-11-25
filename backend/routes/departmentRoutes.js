const express = require("express");
const mongoose = require("mongoose");

const Department = require("../models/Department");
const Employee = require("../models/Employee");

const {
  requireAuth,
  requireHRAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET /api/departments
// HR Admin + HR Staff can VIEW departments
// =====================================================
router.get("/", requireAuth, async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const departments = await Department.find({
      company: companyId,
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    const counts = await Employee.aggregate([
      {
        $match: {
          company: new mongoose.Types.ObjectId(companyId),
        },
      },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(
      counts.map((item) => [item._id, item.count])
    );

    const result = departments.map((department) => ({
      ...department,
      employeeCount: countMap.get(department.name) || 0,
    }));

    return res.status(200).json({
      departments: result,
    });
  } catch (error) {
    console.error("Fetch departments:", error.message);

    return res.status(500).json({
      message: "Unable to fetch departments.",
    });
  }
});


// =====================================================
// POST /api/departments
// ONLY HR Admin can create department
// =====================================================
router.post("/", requireAuth, requireHRAdmin, async (req, res) => {
  try {
    const name =
      typeof req.body.name === "string"
        ? req.body.name.trim()
        : "";

    if (!name || name.length > 100) {
      return res.status(400).json({
        message: "Department name must be 1–100 characters.",
      });
    }

    const department = await Department.create({
      name,
      company: req.user.companyId,
    });

    return res.status(201).json({
      message: "Department created successfully.",
      department,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Department already exists in your company.",
      });
    }

    console.error("Create department:", error.message);

    return res.status(500).json({
      message: "Unable to create department.",
    });
  }
});


// =====================================================
// PUT /api/departments/:id
// ONLY HR Admin can rename department
// =====================================================
router.put(
  "/:id",
  requireAuth,
  requireHRAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid department ID.",
        });
      }

      const name =
        typeof req.body.name === "string"
          ? req.body.name.trim()
          : "";

      if (!name || name.length > 100) {
        return res.status(400).json({
          message: "Department name must be 1–100 characters.",
        });
      }

      const department = await Department.findOne({
        _id: id,
        company: req.user.companyId,
      });

      if (!department) {
        return res.status(404).json({
          message: "Department not found.",
        });
      }

      if (department.name !== name) {
        const employeeCount = await Employee.countDocuments({
          company: req.user.companyId,
          department: department.name,
        });

        if (employeeCount > 0) {
          return res.status(409).json({
            message:
              "Cannot rename a department with assigned employees. Reassign those employees first.",
          });
        }
      }

      department.name = name;
      await department.save();

      return res.status(200).json({
        message: "Department updated successfully.",
        department,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "Department name already exists.",
        });
      }

      console.error("Update department:", error.message);

      return res.status(500).json({
        message: "Unable to update department.",
      });
    }
  }
);


// =====================================================
// PATCH /api/departments/:id/status
// ONLY HR Admin can activate/deactivate department
// =====================================================
router.patch(
  "/:id/status",
  requireAuth,
  requireHRAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid department ID.",
        });
      }

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          message: "isActive must be true or false.",
        });
      }

      const department = await Department.findOne({
        _id: id,
        company: req.user.companyId,
      });

      if (!department) {
        return res.status(404).json({
          message: "Department not found.",
        });
      }

      if (!isActive) {
        const employeeCount = await Employee.countDocuments({
          company: req.user.companyId,
          department: department.name,
        });

        if (employeeCount > 0) {
          return res.status(409).json({
            message:
              "Cannot deactivate a department with assigned employees. Reassign them first.",
          });
        }
      }

      department.isActive = isActive;
      await department.save();

      return res.status(200).json({
        message: `Department ${
          isActive ? "activated" : "deactivated"
        } successfully.`,
        department,
      });
    } catch (error) {
      console.error("Update department status:", error.message);

      return res.status(500).json({
        message: "Unable to update department status.",
      });
    }
  }
);


module.exports = router;