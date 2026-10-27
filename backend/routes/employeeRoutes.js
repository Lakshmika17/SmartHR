
const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Every employee request requires a valid login.
router.use(requireAuth);

// GET /api/employees - List employees for the logged-in user's company.
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find({
      company: req.user.companyId,
    }).sort({ createdAt: -1 });

    res.status(200).json({ employees });
  } catch (error) {
    console.error("Fetch employees:", error.message);
    res.status(500).json({ message: "Unable to fetch employees." });
  }
});

// POST /api/employees - Add an employee.
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      department,
      role,
      experience,
      rating,
      training,
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !department?.trim() ||
      !role?.trim()
    ) {
      return res.status(400).json({
        message: "Name, email, department and role are required.",
      });
    }

    const employee = await Employee.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      role: role.trim(),
      experience: experience ?? 0,
      rating: rating ?? 3,
      training: training ?? 70,
      company: req.user.companyId,
    });

    res.status(201).json({
      message: "Employee created successfully.",
      employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This employee email already exists in your company.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Please check the employee details.",
      });
    }

    console.error("Create employee:", error.message);
    res.status(500).json({ message: "Unable to create employee." });
  }
});

// PUT /api/employees/:id - Update employee details.
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid employee ID." });
    }

    const allowedFields = [
      "name",
      "email",
      "department",
      "role",
      "experience",
      "rating",
      "training",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.name !== undefined) {
      updates.name = String(updates.name).trim();
    }

    if (updates.email !== undefined) {
      updates.email = String(updates.email).trim().toLowerCase();
    }

    const employee = await Employee.findOneAndUpdate(
      {
        _id: req.params.id,
        company: req.user.companyId,
      },
      updates,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    res.status(200).json({
      message: "Employee updated successfully.",
      employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This employee email already exists in your company.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Please check the employee details.",
      });
    }

    console.error("Update employee:", error.message);
    res.status(500).json({ message: "Unable to update employee." });
  }
});

// PATCH /api/employees/:id/status - Activate or deactivate an employee.
router.patch("/:id/status", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid employee ID." });
    }

    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Active or Inactive.",
      });
    }

    const employee = await Employee.findOneAndUpdate(
      {
        _id: req.params.id,
        company: req.user.companyId,
      },
      { status },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    res.status(200).json({
      message: "Employee status updated successfully.",
      employee,
    });
  } catch (error) {
    console.error("Update employee status:", error.message);
    res.status(500).json({
      message: "Unable to update employee status.",
    });
  }
});

module.exports = router;

