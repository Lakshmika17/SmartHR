const express = require("express");
const mongoose = require("mongoose");

const Employee = require("../models/Employee");

const {
  requireAuth,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

const ML_API_URL = (
  process.env.ML_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

// --------------------------------------------------
// ALLOWED DEPARTMENTS
// --------------------------------------------------

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

// --------------------------------------------------
// DEPARTMENT MAPPING
// Database/frontend values can be different from
// the category names used by the ML model.
// --------------------------------------------------

const DEPARTMENT_MAPPING = {
  tech: "Technology",
  technology: "Technology",

  analytics: "Analytics",

  "sales & marketing": "Sales & Marketing",
  sales: "Sales & Marketing",

  operations: "Operations",

  procurement: "Procurement",

  finance: "Finance",

  hr: "HR",

  legal: "Legal",

  "r&d": "R&D",
  "r & d": "R&D",
};

// --------------------------------------------------
// ALLOWED EDUCATION
// --------------------------------------------------

const ALLOWED_EDUCATION = [
  "Below Secondary",
  "Bachelor's",
  "Master's & above",
];

// --------------------------------------------------
// ALLOWED GENDER
// --------------------------------------------------

const ALLOWED_GENDER = ["m", "f"];

// --------------------------------------------------
// VALIDATE FRONTEND INPUTS
// Only these 5 fields are required:
//
// 1. department
// 2. education
// 3. gender
// 4. length_of_service
// 5. avg_training_score
// --------------------------------------------------

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

  // ------------------------------------------------
  // DEPARTMENT
  // ------------------------------------------------

  if (
    inputs.department === undefined ||
    inputs.department === null ||
    inputs.department === ""
  ) {
    return {
      valid: false,
      message: "department is required.",
    };
  }

  if (
    typeof inputs.department !== "string" ||
    !inputs.department.trim()
  ) {
    return {
      valid: false,
      message: "department must be valid text.",
    };
  }

  const departmentValue =
    inputs.department.trim();

  const normalizedDepartment =
    DEPARTMENT_MAPPING[
      departmentValue.toLowerCase()
    ];

  if (!normalizedDepartment) {
    return {
      valid: false,
      message: "Invalid department category.",
    };
  }

  cleaned.department =
    normalizedDepartment;

  // ------------------------------------------------
  // EDUCATION
  // ------------------------------------------------

  if (
    inputs.education === undefined ||
    inputs.education === null ||
    inputs.education === ""
  ) {
    return {
      valid: false,
      message: "education is required.",
    };
  }

  if (
    typeof inputs.education !== "string" ||
    !inputs.education.trim()
  ) {
    return {
      valid: false,
      message: "education must be valid text.",
    };
  }

  cleaned.education =
    inputs.education.trim();

  if (
    !ALLOWED_EDUCATION.includes(
      cleaned.education
    )
  ) {
    return {
      valid: false,
      message: "Invalid education category.",
    };
  }

  // ------------------------------------------------
  // GENDER
  // ------------------------------------------------

  if (
    inputs.gender === undefined ||
    inputs.gender === null ||
    inputs.gender === ""
  ) {
    return {
      valid: false,
      message: "gender is required.",
    };
  }

  if (
    typeof inputs.gender !== "string" ||
    !inputs.gender.trim()
  ) {
    return {
      valid: false,
      message: "gender must be valid text.",
    };
  }

  cleaned.gender =
    inputs.gender.trim().toLowerCase();

  if (
    !ALLOWED_GENDER.includes(
      cleaned.gender
    )
  ) {
    return {
      valid: false,
      message: "Invalid gender category.",
    };
  }

  // ------------------------------------------------
  // YEARS OF SERVICE
  // ------------------------------------------------

  if (
    inputs.length_of_service === undefined ||
    inputs.length_of_service === null ||
    inputs.length_of_service === ""
  ) {
    return {
      valid: false,
      message:
        "length_of_service is required.",
    };
  }

  const yearsOfService =
    Number(inputs.length_of_service);

  if (
    !Number.isFinite(yearsOfService)
  ) {
    return {
      valid: false,
      message:
        "length_of_service must be a valid number.",
    };
  }

  if (
    yearsOfService < 0 ||
    yearsOfService > 60
  ) {
    return {
      valid: false,
      message:
        "length_of_service must be between 0 and 60.",
    };
  }

  cleaned.length_of_service =
    yearsOfService;

  // ------------------------------------------------
  // AVERAGE TRAINING SCORE
  // ------------------------------------------------

  if (
    inputs.avg_training_score === undefined ||
    inputs.avg_training_score === null ||
    inputs.avg_training_score === ""
  ) {
    return {
      valid: false,
      message:
        "avg_training_score is required.",
    };
  }

  const trainingScore =
    Number(inputs.avg_training_score);

  if (
    !Number.isFinite(trainingScore)
  ) {
    return {
      valid: false,
      message:
        "avg_training_score must be a valid number.",
    };
  }

  if (
    trainingScore < 0 ||
    trainingScore > 100
  ) {
    return {
      valid: false,
      message:
        "avg_training_score must be between 0 and 100.",
    };
  }

  cleaned.avg_training_score =
    trainingScore;

  // ------------------------------------------------
  // RETURN CLEANED INPUTS
  // ------------------------------------------------

  return {
    valid: true,
    inputs: cleaned,
  };
}

// ==================================================
// POST /api/promotions
// ==================================================
//
// HR Staff directly generates a promotion prediction.
//
// IMPORTANT:
// No PromotionRequest is created.
// No Pending status.
// No Admin approval.
// ==================================================

router.post("/", async (req, res) => {
  try {
    // ------------------------------------------------
    // CHECK USER ROLE
    // ------------------------------------------------

    if (req.user.role !== "HR_STAFF") {
      return res.status(403).json({
        message:
          "Only HR Staff can generate promotion predictions.",
      });
    }

    const {
      employeeId,
      modelInputs,
    } = req.body;

    // ------------------------------------------------
    // VALIDATE EMPLOYEE ID
    // ------------------------------------------------

    if (
      !employeeId ||
      !mongoose.isValidObjectId(employeeId)
    ) {
      return res.status(400).json({
        message: "Invalid employee ID.",
      });
    }

    // ------------------------------------------------
    // FIND EMPLOYEE
    // ------------------------------------------------

    const employee =
      await Employee.findOne({
        _id: employeeId,
        company: req.user.companyId,
      });

    if (!employee) {
      return res.status(404).json({
        message:
          "Employee not found in your company.",
      });
    }

    // ------------------------------------------------
    // CHECK EMPLOYEE STATUS
    // ------------------------------------------------

    if (
      employee.status === "Inactive"
    ) {
      return res.status(400).json({
        message:
          "Cannot generate prediction for an inactive employee.",
      });
    }

    // ------------------------------------------------
    // VALIDATE THE 5 FRONTEND INPUTS
    // ------------------------------------------------

    const validation =
      validateModelInputs(
        modelInputs
      );

    if (!validation.valid) {
      return res.status(400).json({
        message:
          validation.message,
      });
    }

    // ==================================================
    // BUILD INPUT FOR EXISTING ML MODEL
    // ==================================================
    //
    // Frontend gives only 5 fields.
    //
    // Existing trained model expects 11 fields.
    //
    // Therefore the remaining fields receive default
    // values here.
    // ==================================================

    const mlInputs = {
      department:
        validation.inputs.department,

      region: "region_7",

      education:
        validation.inputs.education,

      gender:
        validation.inputs.gender,

      recruitment_channel:
        "sourcing",

      no_of_trainings: 1,

      age: 29,

      previous_year_rating: 4,

      length_of_service:
        validation.inputs.length_of_service,

      awards_won: 0,

      avg_training_score:
        validation.inputs.avg_training_score,
    };

    console.log(
      "Promotion ML input:",
      mlInputs
    );

    // ==================================================
    // CALL FASTAPI ML SERVICE
    // ==================================================

    let mlResponse;

    try {
      mlResponse = await fetch(
        `${ML_API_URL}/predict/promotion`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            mlInputs
          ),

          signal:
            AbortSignal.timeout(15000),
        }
      );
    } catch (error) {
      console.error(
        "ML service connection error:",
        error.message
      );

      return res.status(503).json({
        message:
          "Promotion ML service is unavailable. Please ensure FastAPI is running.",
      });
    }

    // ------------------------------------------------
    // CHECK ML RESPONSE STATUS
    // ------------------------------------------------

    if (!mlResponse.ok) {
      let errorDetails = "";

      try {
        const errorData =
          await mlResponse.json();

        errorDetails =
          errorData.detail || "";
      } catch {
        // Ignore JSON parsing error
      }

      console.error(
        "Promotion ML service returned:",
        mlResponse.status,
        errorDetails
      );

      return res.status(502).json({
        message:
          "The promotion ML service could not process these inputs.",
      });
    }

    // ==================================================
    // READ ML RESPONSE
    // ==================================================

    let predictionData;

    try {
      predictionData =
        await mlResponse.json();
    } catch {
      return res.status(502).json({
        message:
          "Invalid response from the ML service.",
      });
    }

    // ------------------------------------------------
    // GET PROBABILITY
    // ------------------------------------------------

    const probability =
      Number(
        predictionData
          .promotion_probability
      );

    // ------------------------------------------------
    // VALIDATE ML RESULT
    // ------------------------------------------------

    if (
      typeof predictionData.prediction !==
        "string" ||
      !predictionData.prediction.trim() ||
      !Number.isFinite(
        probability
      ) ||
      probability < 0 ||
      probability > 100
    ) {
      console.error(
        "Invalid promotion prediction:",
        predictionData
      );

      return res.status(502).json({
        message:
          "ML service returned an invalid prediction result.",
      });
    }

    // ==================================================
    // DIRECT RESPONSE
    // ==================================================
    //
    // IMPORTANT:
    // We do NOT create PromotionRequest.
    // We do NOT set Pending.
    // We do NOT send anything to HR Admin.
    // ==================================================

    return res.status(200).json({
      prediction:
        predictionData.prediction,

      promotion_probability:
        probability,

      model_prediction:
        predictionData.model_prediction,

      notice:
        "Prediction generated successfully. This is a model estimate, not a guaranteed HR decision.",
    });
  } catch (error) {
    console.error(
      "Promotion prediction error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to generate promotion prediction.",
    });
  }
});

module.exports = router;