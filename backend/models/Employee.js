
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
      max: 50,
    },
    rating: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
    },
    training: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate employee emails within the same company.
employeeSchema.index({ company: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Employee", employeeSchema);
