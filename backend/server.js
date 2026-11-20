
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

// ========================================
// IMPORT ROUTES
// ========================================

// Authentication
const authRoutes = require("./routes/authRoutes");
const registrationRoutes = require("./routes/registrationRoutes");

// Management
const staffRoutes = require("./routes/staffRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const companyRoutes = require("./routes/companyRoutes");
const departmentRoutes = require("./routes/departmentRoutes");

// Machine Learning Workflows
const promotionRoutes = require("./routes/promotionRoutes");
const attritionRoutes = require("./routes/attritionRoutes");

// Analytics
const analyticsRoutes = require("./routes/analyticsRoutes");

// Reports
const reportRoutes = require("./routes/reportRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
// ========================================
// CREATE EXPRESS APP
// ========================================

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173",
  })
);

app.use(express.json({ limit: "10kb" }));

// ========================================
// HEALTH CHECK
// ========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    service: "SmartHR API",
  });
});

// ========================================
// REGISTER API ROUTES
// ========================================

// Authentication
app.use("/api/auth", authRoutes);
app.use("/api/auth", registrationRoutes);

// HR Staff
app.use("/api/staff", staffRoutes);

// Employees
app.use("/api/employees", employeeRoutes);

// Dashboard
app.use("/api/dashboard", dashboardRoutes);

// Company
app.use("/api/company", companyRoutes);

// Departments
app.use("/api/departments", departmentRoutes);

// Promotion Prediction & Management
app.use("/api/promotions", promotionRoutes);

// Attrition Prediction & Management
app.use("/api/attrition", attritionRoutes);

// Dynamic HR Analytics
app.use("/api/analytics", analyticsRoutes);

// Reports Management
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);
// ========================================
// UNKNOWN API ROUTES
// ========================================

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// ========================================
// SERVER CONFIGURATION
// ========================================

const PORT = process.env.PORT || 5000;

// ========================================
// START SERVER
// ========================================

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `SmartHR API running at http://localhost:${PORT}`
      );

      console.log(
        `Reports API: http://localhost:${PORT}/api/reports`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
