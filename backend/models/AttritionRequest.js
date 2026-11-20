
const mongoose = require("mongoose");

const attritionRequestSchema = new mongoose.Schema(
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

    modelInputs: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    modelPrediction: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    attritionProbability: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Unknown"],
      default: "Unknown",
    },

    status: {
      type: String,
      enum: ["Pending", "Under Review", "Action Taken", "Closed"],
      default: "Pending",
    },

    retentionAction: {
      type: String,
      default: "",
      trim: true,
    },

    adminRemarks: {
      type: String,
      default: "",
      trim: true,
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
  },
  { timestamps: true }
);

attritionRequestSchema.index({ company: 1, createdAt: -1 });

module.exports = mongoose.model(
  "AttritionRequest",
  attritionRequestSchema
);
