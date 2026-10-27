
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Target,
  Activity,
  ChartNoAxesCombined,
  Database,
  Settings,
  Search,
  Bell,
  Users,
  UserRound,
  TrendingUp,
  GraduationCap,
  BriefcaseBusiness,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import "./App.css";

import LandingPage from "./LandingPage";
import Login from "./pages/Login";
import EmployeeManagement from "./pages/EmployeeManagement";
import EmployeeProfile from "./pages/EmployeeProfile";
import RegisterCompany from "./pages/RegisterCompany";
import HRAnalytics from "./pages/HRAnalytics";
import PromotionPrediction from "./pages/PromotionPrediction";

const promotionData = [
  { name: "Not promoted", value: 50140 },
  { name: "Promoted", value: 4668 },
];

const departments = [
  { name: "Technology", rate: 10.8 },
  { name: "Procurement", rate: 9.7 },
  { name: "Analytics", rate: 9.6 },
  { name: "Operations", rate: 9.0 },
  { name: "Finance", rate: 8.1 },
  { name: "Sales", rate: 7.2 },
  { name: "R&D", rate: 6.9 },
  { name: "HR", rate: 5.6 },
  { name: "Legal", rate: 5.1 },
];

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Employee Management", icon: Users },
  { label: "Employee Profile", icon: UserRound },
  { label: "Promotion Prediction", icon: Target },
  { label: "Attrition Prediction", icon: Activity },
  { label: "HR Analytics", icon: ChartNoAxesCombined },
  { label: "Datasets", icon: Database },
];

function Dashboard() {
  const [activePage, setActivePage] = useState("Overview");
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  function navigate(page) {
    setActivePage(page);
    setMobileMenu(false);
  }

  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="mobile-overlay"
          aria-label="Close menu"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-logo">S</div>
          <div>
            <h2>SmartHR</h2>
            <span>INTELLIGENCE PLATFORM</span>
          </div>
        </div>

        <div className="nav-heading">WORKSPACE</div>

        <nav className="navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${
                activePage === label ? "active" : ""
              }`}
              onClick={() => navigate(label)}
            >
              <Icon size={21} />
              <span>{label}</span>
              {activePage === label && <ChevronRight size={17} />}
            </button>
          ))}
        </nav>

        <div className="sidebar-promo">
          <Sparkles size={23} />
          <h4>Smarter people decisions</h4>
          <p>
            Explore workforce patterns with data-driven HR analytics.
          </p>
        </div>

        <button
          className="nav-item settings-item"
          onClick={() => navigate("Settings")}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>

        <div className="sidebar-profile">
          <div className="profile-avatar">HR</div>
          <div>
            <strong>HR Administrator</strong>
            <span>Workspace account</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={19} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search SmartHR..."
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              className="icon-button"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="notification-dot" />
            </button>

            <div className="user-avatar">H</div>
          </div>
        </header>

        <div className="page-area">
          {activePage === "Overview" && (
            <Overview navigate={navigate} />
          )}

          {activePage === "Employee Management" && (
            <EmployeeManagement />
          )}

          {activePage === "Employee Profile" && (
            <EmployeeProfile />
          )}

          {activePage === "Promotion Prediction" && (
            <PredictionPage type="promotion" />
          )}

          {activePage === "Attrition Prediction" && (
            <PredictionPage type="attrition" />
          )}

          {activePage === "HR Analytics" && <Analytics />}

          {activePage === "Datasets" && <Datasets />}

          {activePage === "Settings" && <SettingsPage />}
        </div>

        <footer className="footer">
          <span>SmartHR</span>
          <span>
            Employee Promotion &amp; Attrition Prediction System
          </span>
        </footer>
      </main>
    </div>
  );
}

function PageHeading({ eyebrow, title, description }) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color = "purple",
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className={`stat-icon ${color}`}>
          <Icon size={21} />
        </div>
      </div>
      <h2>{value}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function Overview({ navigate }) {
  return (
    <>
      <section className="welcome-section">
        <div>
          <span className="eyebrow">YOUR HR WORKSPACE</span>
          <h1>People intelligence, simplified.</h1>
          <p>
            Explore workforce data and make informed HR decisions.
          </p>
        </div>

        <div className="dataset-loaded">
          <span className="status-dot" />
          Promotion dataset loaded
        </div>
      </section>

      <section className="hero-banner">
        <div className="hero-copy">
          <span className="hero-label">
            <Sparkles size={15} /> SMARTER HR DECISIONS
          </span>

          <h2>
            Understand your people.
            <br />
            Plan your next move.
          </h2>

          <p>
            Discover promotion patterns and prepare for data-driven
            workforce insights.
          </p>

          <button
            className="hero-button"
            onClick={() => navigate("Promotion Prediction")}
          >
            Explore promotion <ChevronRight size={18} />
          </button>
        </div>

        <div className="hero-visual">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />

          <div className="floating-tile tile-one">
            <TrendingUp size={27} />
            <strong>People analytics</strong>
            <span>Patterns &amp; insights</span>
          </div>

          <div className="floating-center">
            <Users size={49} />
          </div>

          <div className="floating-tile tile-two">
            <Users size={25} />
            <strong>Workforce</strong>
            <span>Understand your team</span>
          </div>
        </div>
      </section>

      <div className="section-title-row">
        <div>
          <h2>Promotion snapshot</h2>
          <p>Summary of the training dataset</p>
        </div>
        <span className="dataset-tag">DATASET 01</span>
      </div>

      <section className="stats-grid">
        <StatCard
          icon={Users}
          label="Training records"
          value="54,808"
          subtitle="Employee records available"
        />

        <StatCard
          icon={TrendingUp}
          label="Promoted employees"
          value="4,668"
          subtitle="8.52% of the dataset"
          color="green"
        />

        <StatCard
          icon={Target}
          label="Not promoted"
          value="50,140"
          subtitle="91.48% of the dataset"
          color="orange"
        />

        <StatCard
          icon={GraduationCap}
          label="Promoted avg. score"
          value="71.33"
          subtitle="Compared with 62.65 not promoted"
          color="blue"
        />
      </section>

      <section className="chart-grid">
        <div className="chart-card">
          <div className="chart-heading">
            <div>
              <h3>Promotion rate by department</h3>
              <p>Percentage of employees promoted</p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departments}
                margin={{
                  top: 15,
                  right: 5,
                  left: -18,
                  bottom: 30,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ecebfa"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#7b82ae" }}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: "#7b82ae" }} />
                <Tooltip />
                <Bar
                  dataKey="rate"
                  name="Promotion rate (%)"
                  fill="#7161f6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="chart-note">
            Department rates are illustrative; verify against the
            cleaned data before final submission.
          </p>
        </div>

        <div className="chart-card">
          <div className="chart-heading">
            <div>
              <h3>Promotion distribution</h3>
              <p>Training dataset target breakdown</p>
            </div>
          </div>

          <div className="donut-layout">
            <div className="donut-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={promotionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={3}
                  >
                    <Cell fill="#7060f6" />
                    <Cell fill="#20c7a4" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="donut-center">
                <strong>8.52%</strong>
                <span>Promoted</span>
              </div>
            </div>

            <div className="legend">
              <div>
                <span className="legend-dot purple-dot" />
                <span>
                  Not promoted
                  <strong>50,140</strong>
                </span>
                <b>91.48%</b>
              </div>

              <div>
                <span className="legend-dot green-dot" />
                <span>
                  Promoted
                  <strong>4,668</strong>
                </span>
                <b>8.52%</b>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


function PredictionPage({ type }) {
  const isPromotion = type === "promotion";

  const promotionFields = [
    {
      name: "department",
      label: "Department",
      options: [
        "Technology",
        "Analytics",
        "Sales & Marketing",
        "Operations",
        "Procurement",
        "Finance",
        "HR",
        "Legal",
        "R&D",
      ],
    },
    {
      name: "region",
      label: "Region",
      type: "text",
    },
    {
      name: "education",
      label: "Education",
      options: [
        "Below Secondary",
        "Bachelor's",
        "Master's & above",
      ],
    },
    {
      name: "gender",
      label: "Gender",
      options: [
        { label: "Male", value: "m" },
        { label: "Female", value: "f" },
      ],
    },
    {
      name: "recruitment_channel",
      label: "Recruitment channel",
      options: ["sourcing", "referred", "other"],
    },
    {
      name: "age",
      label: "Age",
      type: "number",
      min: 18,
      max: 100,
    },
    {
      name: "no_of_trainings",
      label: "Number of trainings",
      type: "number",
      min: 0,
      max: 100,
    },
    {
      name: "previous_year_rating",
      label: "Previous year rating",
      type: "number",
      min: 1,
      max: 5,
    },
    {
      name: "length_of_service",
      label: "Years of service",
      type: "number",
      min: 0,
      max: 60,
    },
    {
      name: "awards_won",
      label: "Awards won",
      options: [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
      ],
    },
    {
      name: "avg_training_score",
      label: "Average training score",
      type: "number",
      min: 0,
      max: 100,
    },
  ];

  const attritionFields = [
    { name: "Age", label: "Age", type: "number", min: 18, max: 100 },
    {
      name: "BusinessTravel",
      label: "Business travel",
      options: ["Travel_Rarely", "Travel_Frequently", "Non-Travel"],
    },
    { name: "DailyRate", label: "Daily rate", type: "number", min: 0 },
    {
      name: "Department",
      label: "Department",
      options: [
        "Research & Development",
        "Sales",
        "Human Resources",
      ],
    },
    {
      name: "DistanceFromHome",
      label: "Distance from home",
      type: "number",
      min: 0,
    },
    {
      name: "Education",
      label: "Education level",
      options: [
        { label: "1 - Below College", value: 1 },
        { label: "2 - College", value: 2 },
        { label: "3 - Bachelor", value: 3 },
        { label: "4 - Master", value: 4 },
        { label: "5 - Doctor", value: 5 },
      ],
    },
    {
      name: "EducationField",
      label: "Education field",
      options: [
        "Life Sciences",
        "Medical",
        "Marketing",
        "Technical Degree",
        "Other",
        "Human Resources",
      ],
    },
    {
      name: "EnvironmentSatisfaction",
      label: "Environment satisfaction",
      options: [
        { label: "1 - Low", value: 1 },
        { label: "2 - Medium", value: 2 },
        { label: "3 - High", value: 3 },
        { label: "4 - Very High", value: 4 },
      ],
    },
    {
      name: "Gender",
      label: "Gender",
      options: ["Male", "Female"],
    },
    {
      name: "HourlyRate",
      label: "Hourly rate",
      type: "number",
      min: 0,
      max: 100,
    },
    {
      name: "JobInvolvement",
      label: "Job involvement",
      options: [
        { label: "1 - Low", value: 1 },
        { label: "2 - Medium", value: 2 },
        { label: "3 - High", value: 3 },
        { label: "4 - Very High", value: 4 },
      ],
    },
    {
      name: "JobLevel",
      label: "Job level",
      options: [
        { label: "Level 1", value: 1 },
        { label: "Level 2", value: 2 },
        { label: "Level 3", value: 3 },
        { label: "Level 4", value: 4 },
        { label: "Level 5", value: 5 },
      ],
    },
    {
      name: "JobRole",
      label: "Job role",
      options: [
        "Healthcare Representative",
        "Human Resources",
        "Laboratory Technician",
        "Manager",
        "Manufacturing Director",
        "Research Director",
        "Research Scientist",
        "Sales Executive",
        "Sales Representative",
      ],
    },
    {
      name: "JobSatisfaction",
      label: "Job satisfaction",
      options: [
        { label: "1 - Low", value: 1 },
        { label: "2 - Medium", value: 2 },
        { label: "3 - High", value: 3 },
        { label: "4 - Very High", value: 4 },
      ],
    },
    {
      name: "MaritalStatus",
      label: "Marital status",
      options: ["Single", "Married", "Divorced"],
    },
    {
      name: "MonthlyIncome",
      label: "Monthly income",
      type: "number",
      min: 0,
    },
    {
      name: "MonthlyRate",
      label: "Monthly rate",
      type: "number",
      min: 0,
    },
    {
      name: "NumCompaniesWorked",
      label: "Previous companies worked",
      type: "number",
      min: 0,
    },
    {
      name: "OverTime",
      label: "Works overtime",
      options: ["Yes", "No"],
    },
    {
      name: "PercentSalaryHike",
      label: "Salary hike (%)",
      type: "number",
      min: 0,
      max: 100,
    },
    {
      name: "PerformanceRating",
      label: "Performance rating",
      options: [
        { label: "3 - Excellent", value: 3 },
        { label: "4 - Outstanding", value: 4 },
      ],
    },
    {
      name: "RelationshipSatisfaction",
      label: "Relationship satisfaction",
      options: [
        { label: "1 - Low", value: 1 },
        { label: "2 - Medium", value: 2 },
        { label: "3 - High", value: 3 },
        { label: "4 - Very High", value: 4 },
      ],
    },
    {
      name: "StockOptionLevel",
      label: "Stock option level",
      options: [
        { label: "0", value: 0 },
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
      ],
    },
    {
      name: "TotalWorkingYears",
      label: "Total working years",
      type: "number",
      min: 0,
    },
    {
      name: "TrainingTimesLastYear",
      label: "Training sessions last year",
      type: "number",
      min: 0,
    },
    {
      name: "WorkLifeBalance",
      label: "Work-life balance",
      options: [
        { label: "1 - Bad", value: 1 },
        { label: "2 - Good", value: 2 },
        { label: "3 - Better", value: 3 },
        { label: "4 - Best", value: 4 },
      ],
    },
    {
      name: "YearsAtCompany",
      label: "Years at company",
      type: "number",
      min: 0,
    },
    {
      name: "YearsInCurrentRole",
      label: "Years in current role",
      type: "number",
      min: 0,
    },
    {
      name: "YearsSinceLastPromotion",
      label: "Years since last promotion",
      type: "number",
      min: 0,
    },
    {
      name: "YearsWithCurrManager",
      label: "Years with current manager",
      type: "number",
      min: 0,
    },
  ];

  const promotionDefaults = {
    department: "Technology",
    region: "region_7",
    education: "Bachelor's",
    gender: "m",
    recruitment_channel: "sourcing",
    no_of_trainings: 1,
    age: 29,
    previous_year_rating: 4,
    length_of_service: 4,
    awards_won: 0,
    avg_training_score: 82,
  };

  const attritionDefaults = {
    Age: 29,
    BusinessTravel: "Travel_Rarely",
    DailyRate: 1100,
    Department: "Research & Development",
    DistanceFromHome: 5,
    Education: 3,
    EducationField: "Life Sciences",
    EnvironmentSatisfaction: 3,
    Gender: "Male",
    HourlyRate: 65,
    JobInvolvement: 3,
    JobLevel: 2,
    JobRole: "Research Scientist",
    JobSatisfaction: 3,
    MaritalStatus: "Single",
    MonthlyIncome: 4500,
    MonthlyRate: 15000,
    NumCompaniesWorked: 2,
    OverTime: "No",
    PercentSalaryHike: 13,
    PerformanceRating: 3,
    RelationshipSatisfaction: 3,
    StockOptionLevel: 0,
    TotalWorkingYears: 6,
    TrainingTimesLastYear: 3,
    WorkLifeBalance: 3,
    YearsAtCompany: 3,
    YearsInCurrentRole: 2,
    YearsSinceLastPromotion: 1,
    YearsWithCurrManager: 2,
  };

  const fields = isPromotion ? promotionFields : attritionFields;

  const [form, setForm] = useState(() =>
    isPromotion ? promotionDefaults : attritionDefaults
  );
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    const { name, value } = e.target;
    const field = fields.find((item) => item.name === name);
    const numericValue =
      field?.type === "number" || field?.options?.some(
        (option) => typeof option === "object" &&
          option.value === Number(value)
      );

    setForm((previous) => ({
      ...previous,
      [name]: numericValue ? Number(value) : value,
    }));

    setResult(null);
    setError("");
  }

  async function submitForm(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");

    const endpoint = isPromotion
      ? "http://127.0.0.1:8000/predict/promotion"
      : "http://127.0.0.1:8000/predict/attrition";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        const detail = data.detail;
        throw new Error(
          typeof detail === "string"
            ? detail
            : "Please check the entered employee details."
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Prediction error:", err);

      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the ML service. Make sure FastAPI is running on port 8000."
          : err.message || "Unable to generate the prediction."
      );
    } finally {
      setLoading(false);
    }
  }

  const probability = result
    ? isPromotion
      ? result.promotion_probability
      : result.attrition_probability
    : null;

  return (
    <>
      <PageHeading
        eyebrow={isPromotion ? "EMPLOYEE GROWTH" : "WORKFORCE RETENTION"}
        title={isPromotion ? "Promotion Prediction" : "Attrition Prediction"}
        description={
          isPromotion
            ? "Enter employee details to estimate promotion likelihood using your trained machine learning model."
            : "Enter employee details to estimate attrition likelihood using your trained machine learning model."
        }
      />

      <div className="prediction-banner">
        <div className="prediction-banner-icon">
          {isPromotion ? (
            <TrendingUp size={27} />
          ) : (
            <Activity size={27} />
          )}
        </div>

        <div>
          <h3>
            {isPromotion ? "Promotion assessment" : "Attrition assessment"}
          </h3>
          <p>
            Submit employee details to receive a prediction and estimated
            probability from the trained model.
          </p>
        </div>

        <span className="pending-badge">
          {loading ? "Predicting..." : "ML model connected"}
        </span>
      </div>

      <div className="form-card">
        <h2>Employee information</h2>
        <p className="form-intro">
          Complete all fields to generate a prediction.
        </p>

        <form onSubmit={submitForm}>
          <div className="form-grid">
            {fields.map((field) => (
              <label key={field.name}>
                {field.label}

                {field.options ? (
                  <select
                    name={field.name}
                    value={form[field.name]}
                    onChange={updateField}
                    required
                  >
                    {field.options.map((option) => {
                      const optionValue =
                        typeof option === "object" ? option.value : option;
                      const optionLabel =
                        typeof option === "object" ? option.label : option;

                      return (
                        <option key={String(optionValue)} value={optionValue}>
                          {optionLabel}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    name={field.name}
                    type={field.type || "text"}
                    value={form[field.name]}
                    onChange={updateField}
                    min={field.min}
                    max={field.max}
                    required
                  />
                )}
              </label>
            ))}
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Generating prediction..."
              : isPromotion
                ? "Predict Promotion"
                : "Predict Attrition"}
            {!loading && <ChevronRight size={17} />}
          </button>
        </form>

        {error && (
          <div className="notice-box" role="alert">
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="notice-box" aria-live="polite">
            <CheckCircle2 size={20} />
            <div>
              <h3>{result.prediction}</h3>
              <p>
                Estimated {isPromotion ? "promotion" : "attrition"} probability:{" "}
                <strong>{probability}%</strong>
              </p>
              <p>{result.notice}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}



function Analytics() {
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const filteredDepartments =
    selectedDepartment === "All"
      ? departments
      : departments.filter(
          (department) => department.name === selectedDepartment
        );

  const attritionBreakdown = [
    { name: "Stayed", value: 1233 },
    { name: "Left", value: 237 },
  ];

  return (
    <>
      <PageHeading
        eyebrow="WORKFORCE INSIGHTS"
        title="HR Analytics"
        description="Explore descriptive insights from the available datasets."
      />

      <section className="stats-grid">
        <StatCard
          icon={Users}
          label="Promotion records"
          value="54,808"
          subtitle="Dataset 1"
        />

        <StatCard
          icon={TrendingUp}
          label="Promotion rate"
          value="8.52%"
          subtitle="Employees promoted"
          color="green"
        />

        <StatCard
          icon={BriefcaseBusiness}
          label="Attrition records"
          value="1,470"
          subtitle="Dataset 2"
          color="blue"
        />

        <StatCard
          icon={Activity}
          label="Attrition rate"
          value="16.12%"
          subtitle="Employees marked Yes"
          color="orange"
        />
      </section>

      <section className="chart-grid">
        {/* Promotion chart with department filter */}
        <div className="chart-card">
          <div className="chart-heading">
            <div>
              <h3>Promotion by Department</h3>
              <p>Department-level promotion rates (%)</p>
            </div>

            <select
              value={selectedDepartment}
              onChange={(event) =>
                setSelectedDepartment(event.target.value)
              }
              aria-label="Filter promotion chart by department"
            >
              <option value="All">All Departments</option>
              {departments.map((department) => (
                <option
                  key={department.name}
                  value={department.name}
                >
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredDepartments}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  domain={[0, "auto"]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Promotion rate"]}
                />
                <Bar
                  dataKey="rate"
                  name="Promotion rate"
                  fill="#7161f6"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="chart-note">
            Department values use the existing department data configured
            in this application.
          </p>
        </div>

        {/* Attrition breakdown doughnut chart */}
        <div className="chart-card">
          <div className="chart-heading">
            <div>
              <h3>Employee Attrition Breakdown</h3>
              <p>Employee outcomes in the IBM HR dataset</p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attritionBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  <Cell fill="#7161f6" />
                  <Cell fill="#ff9852" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <span>
              <span style={{ color: "#7161f6" }}>●</span>{" "}
              Stayed: <strong>1,233 (83.88%)</strong>
            </span>
            <span>
              <span style={{ color: "#ff9852" }}>●</span>{" "}
              Left: <strong>237 (16.12%)</strong>
            </span>
          </div>
        </div>

        {/* Attrition insights */}
        <div className="chart-card insight-card">
          <div className="chart-heading">
            <div>
              <h3>Attrition Insights</h3>
              <p>Patterns observed in the IBM HR dataset</p>
            </div>
          </div>

          <div className="insight-item">
            <span className="insight-icon orange">
              <Activity size={19} />
            </span>
            <div>
              <strong>30.53% attrition</strong>
              <p>Among employees who work overtime</p>
            </div>
          </div>

          <div className="insight-item">
            <span className="insight-icon purple">
              <BriefcaseBusiness size={19} />
            </span>
            <div>
              <strong>5.13 years</strong>
              <p>Average years at company for employees who left</p>
            </div>
          </div>

          <div className="insight-item">
            <span className="insight-icon green">
              <Users size={19} />
            </span>
            <div>
              <strong>4,787.09</strong>
              <p>Average monthly income for employees who left</p>
            </div>
          </div>

          <p className="chart-note">
            These are descriptive statistics, not proof of causation.
            Review predictions alongside relevant employee context.
          </p>
        </div>
      </section>
    </>
  );
}



function Datasets() {
  const datasets = [
    {
      name: "Dataset 1 · Employee Promotion",
      description:
        "Employee promotion eligibility, training, and performance analysis.",
      original: "train.csv, test.csv",
      cleaned: "promotion_cleaned.csv",
      notebook: "promotion_eda.ipynb",
      rows: "54,808",
      columns: "13",
      target: "is_promoted",
      distribution: [
        { label: "Promoted", value: "4,668 (8.52%)" },
        { label: "Not promoted", value: "50,140 (91.48%)" },
      ],
    },
    {
      name: "Dataset 2 · Employee Attrition",
      description:
        "Employee retention, workplace satisfaction, and attrition analysis.",
      original: "WA_Fn-UseC_-HR-Employee-Attrition.csv",
      cleaned: "attrition_cleaned.csv",
      notebook: "attrition_eda.ipynb",
      rows: "1,470",
      columns: "32",
      target: "Attrition",
      distribution: [
        { label: "Employees who left", value: "237 (16.12%)" },
        { label: "Employees who stayed", value: "1,233 (83.88%)" },
      ],
    },
  ];

  return (
    <>
      <PageHeading
        eyebrow="DATA MANAGEMENT"
        title="Datasets"
        description="Explore dataset preparation, target distributions, and exploratory analysis."
      />

      <section className="stats-grid">
        <StatCard
          icon={Database}
          label="Promotion records"
          value="54,808"
          subtitle="13 columns"
        />

        <StatCard
          icon={TrendingUp}
          label="Promoted employees"
          value="4,668"
          subtitle="8.52% of promotion dataset"
          color="green"
        />

        <StatCard
          icon={Users}
          label="Attrition records"
          value="1,470"
          subtitle="32 columns"
          color="blue"
        />

        <StatCard
          icon={Activity}
          label="Attrition rate"
          value="16.12%"
          subtitle="237 employees left"
          color="orange"
        />
      </section>

      <div className="dataset-list">
        {datasets.map((dataset, index) => (
          <div className="dataset-card" key={dataset.name}>
            <div className="dataset-card-header">
              <div>
                <span className="eyebrow">
                  DATASET 0{index + 1}
                </span>
                <h2>{dataset.name}</h2>
                <p>{dataset.description}</p>
              </div>

              <span className="dataset-status success">
                <CheckCircle2 size={15} /> Cleaned
              </span>
            </div>

            <div className="dataset-metrics">
              <div>
                <span>Records</span>
                <strong>{dataset.rows}</strong>
              </div>
              <div>
                <span>Columns</span>
                <strong>{dataset.columns}</strong>
              </div>
              <div>
                <span>Target column</span>
                <strong>{dataset.target}</strong>
              </div>
            </div>

            <div className="dataset-distribution">
              <h3>Target distribution</h3>
              {dataset.distribution.map((item) => (
                <div
                  className="dataset-distribution-row"
                  key={item.label}
                >
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="dataset-files">
              <p>
                <strong>Original file:</strong> {dataset.original}
              </p>
              <p>
                <strong>Cleaned file:</strong> {dataset.cleaned}
              </p>
              <p>
                <strong>EDA notebook:</strong> {dataset.notebook}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="dataset-note">
        <Database size={20} />
        <div>
          <strong>Data integrity</strong>
          <p>
            The promotion and attrition datasets represent different
            employee populations and must be processed independently.
            Their records should not be merged row by row.
          </p>
        </div>
      </div>
    </>
  );
}


function SettingsPage() {
  return (
    <>
      <PageHeading
        eyebrow="WORKSPACE"
        title="Settings"
        description="SmartHR workspace information."
      />

      <div className="form-card">
        <div className="insight-item">
          <span className="insight-icon purple">
            <Settings size={20} />
          </span>
          <div>
            <strong>SmartHR Intelligence Platform</strong>
            <p>
              Employee Promotion &amp; Attrition Prediction System
            </p>
          </div>
        </div>

        <div className="insight-item">
          <span className="insight-icon green">
            <Database size={20} />
          </span>
          <div>
            <strong>Dataset status</strong>
            <p>
              Both source datasets have been cleaned and saved locally.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hr-analytics" element={<HRAnalytics />} />
<Route path="/promotion-prediction" element={<PromotionPrediction />} />
        <Route
          path="/register-company"
          element={<RegisterCompany />}
        />
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
