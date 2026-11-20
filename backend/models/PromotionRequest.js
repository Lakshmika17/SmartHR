
const mongoose = require("mongoose");

const promotionRequestSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Input values submitted to the trained ML model.
    modelInputs: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Actual prediction returned by FastAPI.
    modelPrediction: {
      type: String,
      required: true,
      trim: true,
    },

    promotionProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // HR Admin makes the final decision.
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    adminRemarks: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Faster company-specific promotion history queries.
promotionRequestSchema.index({
  company: 1,
  createdAt: -1,
});

// Faster employee-specific promotion history queries.
promotionRequestSchema.index({
  company: 1,
  employee: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "PromotionRequest",
  promotionRequestSchema
);
