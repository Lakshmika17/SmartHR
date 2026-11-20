const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

departmentSchema.index(
  { company: 1, name: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Department",
  departmentSchema
);