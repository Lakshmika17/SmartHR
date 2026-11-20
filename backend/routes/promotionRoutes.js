
const express = require("express");
const mongoose = require("mongoose");

const Employee = require("../models/Employee");
const PromotionRequest = require("../models/PromotionRequest");

const {
  requireAuth,
  requireHRAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

const ML_API_URL = (
  process.env.ML_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

const PROMOTION_FIELDS = [
  "department",
  "region",
  "education",
  "gender",
  "recruitment_channel",
  "no_of_trainings",
  "age",
  "previous_year_rating",
  "length_of_service",
  "awards_won",
  "avg_training_score",
];

const NUMBER_FIELDS = [
  "no_of_trainings",
  "age",
  "previous_year_rating",
  "length_of_service",
  "awards_won",
  "avg_training_score",
];

const ALLOWED_DEPARTMENTS = [
  "Technology",
  "Analytics",
  "Sales & Marketing",
  "Operations",
  "Procurement",
  "Finance",
  "HR",
  "Legal",
  "R&D",
];

const ALLOWED_EDUCATION = [
  "Below Secondary",
  "Bachelor's",
  "Master's & above",
];

const ALLOWED_GENDER = ["m", "f"];

const ALLOWED_RECRUITMENT = [
  "sourcing",
  "referred",
  "other",
];

function validateModelInputs(inputs) {
  if (
    !inputs ||
    typeof inputs !== "object" ||
    Array.isArray(inputs)
  ) {
    return {
      valid: false,
      message: "Prediction inputs are required.",
    };
  }

  const cleaned = {};

  for (const field of PROMOTION_FIELDS) {
    if (
      inputs[field] === undefined ||
      inputs[field] === null ||
      inputs[field] === ""
    ) {
      return {
        valid: false,
        message: `${field} is required.`,
      };
    }

    if (NUMBER_FIELDS.includes(field)) {
      if (
        typeof inputs[field] !== "number" ||
        !Number.isFinite(inputs[field])
      ) {
        return {
          valid: false,
          message: `${field} must be a valid number.`,
        };
      }

      cleaned[field] = inputs[field];
    } else {
      if (
        typeof inputs[field] !== "string" ||
        !inputs[field].trim()
      ) {
        return {
          valid: false,
          message: `${field} must be valid text.`,
        };
      }

      cleaned[field] = inputs[field].trim();
    }
  }

  if (!ALLOWED_DEPARTMENTS.includes(cleaned.department)) {
    return {
      valid: false,
      message: "Invalid ML department category.",
    };
  }

  if (!ALLOWED_EDUCATION.includes(cleaned.education)) {
    return {
      valid: false,
      message: "Invalid education category.",
    };
  }

  if (!ALLOWED_GENDER.includes(cleaned.gender)) {
    return {
      valid: false,
      message: "Invalid gender category.",
    };
  }

  if (
    !ALLOWED_RECRUITMENT.includes(
      cleaned.recruitment_channel
    )
  ) {
    return {
      valid: false,
      message: "Invalid recruitment channel.",
    };
  }

  if (
    !/^region_\d+$/.test(cleaned.region)
  ) {
    return {
      valid: false,
      message: "Invalid region format.",
    };
  }

  const ranges = {
    age: [18, 100],
    no_of_trainings: [0, 100],
    previous_year_rating: [1, 5],
    length_of_service: [0, 60],
    avg_training_score: [0, 100],
  };

  for (const [field, [min, max]] of Object.entries(ranges)) {
    if (cleaned[field] < min || cleaned[field] > max) {
      return {
        valid: false,
        message: `${field} must be between ${min} and ${max}.`,
      };
    }
  }

  if (![0, 1].includes(cleaned.awards_won)) {
    return {
      valid: false,
      message: "awards_won must be 0 or 1.",
    };
  }

  return {
    valid: true,
    inputs: cleaned,
  };
}

function canViewRequest(req, request) {
  return (
    req.user.role === "HR_ADMIN" ||
    request.requestedBy.toString() === req.user.id
  );
}

// POST /api/promotions
// HR Staff runs ML prediction and submits request.
router.post("/", async (req, res) => {
  try {
    if (req.user.role !== "HR_STAFF") {
      return res.status(403).json({
        message: "Only HR Staff can submit promotion requests.",
      });
    }

    const { employeeId, modelInputs } = req.body;

    if (!mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({
        message: "Invalid employee ID.",
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

    if (employee.status === "Inactive") {
      return res.status(400).json({
        message: "Cannot submit a request for an inactive employee.",
      });
    }

    const validation = validateModelInputs(modelInputs);

    if (!validation.valid) {
      return res.status(400).json({
        message: validation.message,
      });
    }

    // Only one pending request per employee.
    const existingPending = await PromotionRequest.findOne({
      company: req.user.companyId,
      employee: employee._id,
      status: "Pending",
    });

    if (existingPending) {
      return res.status(409).json({
        message:
          "This employee already has a pending promotion request.",
      });
    }

    // Call the existing FastAPI promotion model.
    let mlResponse;

    try {
      mlResponse = await fetch(
        `${ML_API_URL}/predict/promotion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validation.inputs),
          signal: AbortSignal.timeout(15000),
        }
      );
    } catch (error) {
      console.error("ML service connection:", error.message);

      return res.status(503).json({
        message:
          "Promotion ML service is unavailable. Please ensure FastAPI is running.",
      });
    }

    if (!mlResponse.ok) {
      console.error(
        "Promotion ML service returned:",
        mlResponse.status
      );

      return res.status(502).json({
        message:
          "The promotion ML service could not process these inputs.",
      });
    }

    let predictionData;

    try {
      predictionData = await mlResponse.json();
    } catch {
      return res.status(502).json({
        message: "Invalid response from the ML service.",
      });
    }

    const probability = Number(
      predictionData.promotion_probability
    );

    if (
      typeof predictionData.prediction !== "string" ||
      !predictionData.prediction.trim() ||
      !Number.isFinite(probability) ||
      probability < 0 ||
      probability > 100
    ) {
      return res.status(502).json({
        message:
          "ML service returned an invalid prediction result.",
      });
    }

    const request = await PromotionRequest.create({
      company: req.user.companyId,
      employee: employee._id,
      requestedBy: req.user.id,
      modelInputs: validation.inputs,
      modelPrediction: predictionData.prediction,
      promotionProbability: probability,
      status: "Pending",
    });

    res.status(201).json({
      message: "Promotion request submitted successfully.",
      request,
    });
  } catch (error) {
    console.error("Create promotion request:", error.message);

    res.status(500).json({
      message: "Unable to submit promotion request.",
    });
  }
});

// GET /api/promotions
// Admin sees company requests.
// Staff sees only requests submitted by them.
router.get("/", async (req, res) => {
  try {
    const filter = {
      company: req.user.companyId,
    };

    if (req.user.role === "HR_STAFF") {
      filter.requestedBy = req.user.id;
    }

    if (
      req.query.status &&
      ["Pending", "Approved", "Rejected"].includes(
        req.query.status
      )
    ) {
      filter.status = req.query.status;
    }

    const requests = await PromotionRequest.find(filter)
      .populate("employee", "name email department role")
      .populate("requestedBy", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("Fetch promotion requests:", error.message);

    res.status(500).json({
      message: "Unable to fetch promotion requests.",
    });
  }
});

// GET /api/promotions/stats
// Admin dashboard promotion statistics.
router.get("/stats", requireHRAdmin, async (req, res) => {
  try {
    const company = req.user.companyId;

    const [total, pending, approved, rejected] =
      await Promise.all([
        PromotionRequest.countDocuments({ company }),
        PromotionRequest.countDocuments({
          company,
          status: "Pending",
        }),
        PromotionRequest.countDocuments({
          company,
          status: "Approved",
        }),
        PromotionRequest.countDocuments({
          company,
          status: "Rejected",
        }),
      ]);

    res.status(200).json({
      total,
      pending,
      approved,
      rejected,
    });
  } catch (error) {
    console.error("Promotion statistics:", error.message);

    res.status(500).json({
      message: "Unable to fetch promotion statistics.",
    });
  }
});

// GET /api/promotions/:id
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid promotion request ID.",
      });
    }

    const request = await PromotionRequest.findOne({
      _id: req.params.id,
      company: req.user.companyId,
    });

    if (!request) {
      return res.status(404).json({
        message: "Promotion request not found.",
      });
    }

    if (!canViewRequest(req, request)) {
      return res.status(403).json({
        message: "You cannot view this promotion request.",
      });
    }

    await request.populate([
      { path: "employee", select: "name email department role" },
      { path: "requestedBy", select: "name email" },
      { path: "reviewedBy", select: "name email" },
    ]);

    res.status(200).json({ request });
  } catch (error) {
    console.error("Fetch promotion request:", error.message);

    res.status(500).json({
      message: "Unable to fetch promotion request.",
    });
  }
});

// PATCH /api/promotions/:id/review
// Only HR Admin can approve or reject.
router.patch("/:id/review", requireHRAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid promotion request ID.",
      });
    }

    const { status, adminRemarks = "" } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected.",
      });
    }

    if (
      typeof adminRemarks !== "string" ||
      adminRemarks.length > 1000
    ) {
      return res.status(400).json({
        message: "Admin remarks must be under 1000 characters.",
      });
    }

    const request = await PromotionRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        company: req.user.companyId,
        status: "Pending",
      },
      {
        $set: {
          status,
          adminRemarks: adminRemarks.trim(),
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!request) {
      return res.status(404).json({
        message:
          "Pending promotion request not found or already reviewed.",
      });
    }

    res.status(200).json({
      message: `Promotion request ${status.toLowerCase()} successfully.`,
      request,
    });
  } catch (error) {
    console.error("Review promotion request:", error.message);

    res.status(500).json({
      message: "Unable to review promotion request.",
    });
  }
});

module.exports = router;
