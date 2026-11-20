

const express = require("express");
const mongoose = require("mongoose");

const AttritionRequest = require("../models/AttritionRequest");
const Employee = require("../models/Employee");

const {
  requireAuth,
  requireHRAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Authentication required for all attrition routes
router.use(requireAuth);

const ML_API_URL =
  process.env.ML_API_URL || "http://127.0.0.1:8000";

function getProbability(result) {
  const raw =
    result.attrition_probability ??
    result.probability ??
    result.attritionProbability;

  if (raw === undefined || raw === null) return null;

  const value = Number(raw);
  if (!Number.isFinite(value)) return null;

  // Assumes probability is returned as a percentage (0-100).
  // Adjust if your FastAPI endpoint returns a fraction (0-1).
  return Math.max(0, Math.min(100, value));
}

function getRiskLevel(probability) {
  if (probability === null) return "Unknown";
  if (probability >= 70) return "High";
  if (probability >= 40) return "Medium";
  return "Low";
}

// HR Staff: submit attrition assessment
router.post("/", async (req, res) => {
  try {
    if (req.user.role !== "HR_STAFF") {
      return res.status(403).json({
        message: "Only HR Staff can submit assessments.",
      });
    }

    const { employeeId, modelInputs } = req.body;

    if (!mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({
        message: "Valid employeeId is required.",
      });
    }

    if (
      !modelInputs ||
      typeof modelInputs !== "object" ||
      Array.isArray(modelInputs) ||
      Object.keys(modelInputs).length === 0
    ) {
      return res.status(400).json({
        message: "Valid modelInputs are required.",
      });
    }

    const employee = await Employee.findOne({
      _id: employeeId,
      company: req.user.companyId,
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found in your company.",
      });
    }

    let prediction;

    try {
      const response = await fetch(
        `${ML_API_URL}/predict/attrition`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modelInputs),
          signal: AbortSignal.timeout(20000),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();

        return res.status(502).json({
          message: "Attrition ML prediction failed.",
          details: errorBody.slice(0, 500),
        });
      }

      prediction = await response.json();
    } catch (error) {
      console.error("Attrition ML error:", error.message);

      return res.status(503).json({
        message: "Attrition ML service is unavailable.",
      });
    }

    const probability = getProbability(prediction);

    const assessment = await AttritionRequest.create({
      company: req.user.companyId,
      employee: employee._id,
      requestedBy: req.user.id,
      modelInputs,
      modelPrediction: prediction,
      attritionProbability: probability,
      riskLevel: getRiskLevel(probability),
    });

    return res.status(201).json({
      message: "Attrition assessment submitted successfully.",
      assessment,
    });
  } catch (error) {
    console.error("Create attrition assessment:", error);

    return res.status(500).json({
      message: "Failed to create attrition assessment.",
    });
  }
});

// HR Staff: own assessments
// HR Admin: all company assessments
router.get("/", async (req, res) => {
  try {
    const filter = { company: req.user.companyId };

    if (req.user.role === "HR_STAFF") {
      filter.requestedBy = req.user.id;
    }

    const assessments = await AttritionRequest.find(filter)
      .populate("employee", "name employeeId department designation")
      .populate("requestedBy", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res.json(assessments);
  } catch (error) {
    console.error("Get attrition assessments:", error);

    return res.status(500).json({
      message: "Failed to load attrition assessments.",
    });
  }
});

// HR Admin: summary statistics
router.get("/stats", requireHRAdmin, async (req, res) => {
  try {
    const company = req.user.companyId;

    const [
      total,
      highRisk,
      mediumRisk,
      lowRisk,
      pending,
      actionTaken,
    ] = await Promise.all([
      AttritionRequest.countDocuments({ company }),
      AttritionRequest.countDocuments({
        company,
        riskLevel: "High",
      }),
      AttritionRequest.countDocuments({
        company,
        riskLevel: "Medium",
      }),
      AttritionRequest.countDocuments({
        company,
        riskLevel: "Low",
      }),
      AttritionRequest.countDocuments({
        company,
        status: "Pending",
      }),
      AttritionRequest.countDocuments({
        company,
        status: "Action Taken",
      }),
    ]);

    return res.json({
      total,
      highRisk,
      mediumRisk,
      lowRisk,
      pending,
      actionTaken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load attrition statistics.",
    });
  }
});

// HR Admin: update retention review
router.patch("/:id/review", requireHRAdmin, async (req, res) => {
  try {
    const { status, retentionAction, adminRemarks } = req.body;

    const validStatuses = [
      "Under Review",
      "Action Taken",
      "Closed",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid review status.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid assessment ID.",
      });
    }

    const assessment = await AttritionRequest.findOne({
      _id: req.params.id,
      company: req.user.companyId,
    });

    if (!assessment) {
      return res.status(404).json({
        message: "Assessment not found.",
      });
    }

    assessment.status = status;
    assessment.retentionAction =
      typeof retentionAction === "string"
        ? retentionAction.slice(0, 2000)
        : assessment.retentionAction;

    assessment.adminRemarks =
      typeof adminRemarks === "string"
        ? adminRemarks.slice(0, 2000)
        : assessment.adminRemarks;

    assessment.reviewedBy = req.user.id;
    assessment.reviewedAt = new Date();

    await assessment.save();

    return res.json({
      message: "Retention review updated successfully.",
      assessment,
    });
  } catch (error) {
    console.error("Review attrition assessment:", error);

    return res.status(500).json({
      message: "Failed to update retention review.",
    });
  }
});

module.exports = router;
