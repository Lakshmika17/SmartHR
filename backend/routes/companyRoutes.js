
const express = require("express");
const Company = require("../models/Company");

const {
  requireAuth,
  requireHRAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Only HR Admin can access Company Management.
router.use(requireAuth, requireHRAdmin);

// ========================================
// GET COMPANY DETAILS
// GET /api/company
// ========================================

router.get("/", async (req, res) => {
  try {
    const company = await Company.findById(
      req.user.companyId
    );

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
      });
    }

    return res.status(200).json({
      company: {
        id: company._id,
        name: company.name,
        industry: company.industry,
        companyCode: company.companyCode,
        isActive: company.isActive,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get company error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch company details.",
    });
  }
});

// ========================================
// UPDATE COMPANY DETAILS
// PUT /api/company
// ========================================

router.put("/", async (req, res) => {
  try {
    const { name, industry } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof industry !== "string"
    ) {
      return res.status(400).json({
        message: "Company name and industry are required.",
      });
    }

    const cleanName = name.trim();
    const cleanIndustry = industry.trim();

    if (!cleanName || !cleanIndustry) {
      return res.status(400).json({
        message: "Company name and industry cannot be empty.",
      });
    }

    if (
      cleanName.length > 150 ||
      cleanIndustry.length > 100
    ) {
      return res.status(400).json({
        message: "Company name or industry is too long.",
      });
    }

    const company = await Company.findById(
      req.user.companyId
    );

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
      });
    }

    company.name = cleanName;
    company.industry = cleanIndustry;

    await company.save();

    return res.status(200).json({
      message: "Company updated successfully.",
      company: {
        id: company._id,
        name: company.name,
        industry: company.industry,
        companyCode: company.companyCode,
        isActive: company.isActive,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update company error:", error.message);

    return res.status(500).json({
      message: "Unable to update company details.",
    });
  }
});

module.exports = router;
