
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

  const [form, setForm] = useState({
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
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    const { name, value } = e.target;

    const numericFields = [
      "no_of_trainings",
      "age",
      "previous_year_rating",
      "length_of_service",
      "awards_won",
      "avg_training_score",
    ];

    setForm((previous) => ({
      ...previous,
      [name]: numericFields.includes(name)
        ? Number(value)
        : value,
    }));

    setResult(null);
    setError("");
  }

  async function submitForm(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/predict/promotion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Please check the employee details."
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Promotion prediction error:", err);

      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the ML service. Check that FastAPI is running on port 8000 and CORS is configured."
          : err.message || "Unable to generate the prediction."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isPromotion) {
    return (
      <>
        <PageHeading
          eyebrow="WORKFORCE RETENTION"
          title="Attrition Prediction"
          description="Employee attrition prediction will be connected after its separate ML model and API are ready."
        />

        <div className="form-card">
          <h2>Attrition model integration pending</h2>
          <p>
            Your promotion model is connected separately. The
            attrition feature needs its own trained model and
            prediction endpoint.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeading
        eyebrow="EMPLOYEE GROWTH"
        title="Promotion Prediction"
        description="Enter employee details to estimate promotion likelihood using your trained machine learning model."
      />

      <div className="prediction-banner">
        <div className="prediction-banner-icon">
          <TrendingUp size={27} />
        </div>

        <div>
          <h3>Promotion assessment</h3>
          <p>
            Submit employee details to receive a model prediction
            and estimated promotion probability.
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
            <label>
              Department
              <select
                name="department"
                value={form.department}
                onChange={updateField}
                required
              >
                {[
                  "Technology",
                  "Analytics",
                  "Sales & Marketing",
                  "Operations",
                  "Procurement",
                  "Finance",
                  "HR",
                  "Legal",
                  "R&D",
                ].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Region
              <input
                name="region"
                value={form.region}
                onChange={updateField}
                placeholder="e.g. region_7"
                required
              />
            </label>

            <label>
              Education
              <select
                name="education"
                value={form.education}
                onChange={updateField}
                required
              >
                <option value="Below Secondary">
                  Below Secondary
                </option>
                <option value="Bachelor's">Bachelor's</option>
                <option value="Master's & above">
                  Master's &amp; above
                </option>
              </select>
            </label>

            <label>
              Gender
              <select
                name="gender"
                value={form.gender}
                onChange={updateField}
                required
              >
                <option value="m">Male</option>
                <option value="f">Female</option>
              </select>
            </label>

            <label>
              Recruitment channel
              <select
                name="recruitment_channel"
                value={form.recruitment_channel}
                onChange={updateField}
                required
              >
                <option value="sourcing">Sourcing</option>
                <option value="referred">Referred</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              Age
              <input
                name="age"
                type="number"
                min="18"
                max="100"
                value={form.age}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Number of trainings
              <input
                name="no_of_trainings"
                type="number"
                min="0"
                max="100"
                value={form.no_of_trainings}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Previous year rating (1–5)
              <select
                name="previous_year_rating"
                value={form.previous_year_rating}
                onChange={updateField}
                required
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Years of service
              <input
                name="length_of_service"
                type="number"
                min="0"
                max="60"
                value={form.length_of_service}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Awards won
              <select
                name="awards_won"
                value={form.awards_won}
                onChange={updateField}
                required
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </label>

            <label>
              Average training score
              <input
                name="avg_training_score"
                type="number"
                min="0"
                max="100"
                value={form.avg_training_score}
                onChange={updateField}
                required
              />
            </label>
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Generating prediction..."
              : "Predict Promotion"}
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
                Estimated promotion probability:{" "}
                <strong>
                  {result.promotion_probability}%
                </strong>
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
        <div className="chart-card">
          <div className="chart-heading">
            <div>
              <h3>Promotion by department</h3>
              <p>Department-level promotion rates</p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="rate"
                  fill="#7161f6"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card insight-card">
          <div className="chart-heading">
            <div>
              <h3>Attrition insights</h3>
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
              <p>
                Average years at company for employees who left
              </p>
            </div>
          </div>

          <div className="insight-item">
            <span className="insight-icon green">
              <Users size={19} />
            </span>
            <div>
              <strong>4,787.09</strong>
              <p>Average monthly income for attrition = Yes</p>
            </div>
          </div>

          <p className="chart-note">
            Descriptive associations do not establish causation.
            Figures are based on the current EDA output.
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
        "Promotion eligibility and employee training analysis",
      original: "train.csv, test.csv",
      cleaned: "promotion_cleaned.csv",
      notebook: "promotion_eda.ipynb",
      rows: "54,808",
      columns: "13",
    },
    {
      name: "Dataset 2 · Employee Attrition",
      description: "Employee retention and attrition analysis",
      original: "WA_Fn-UseC_-HR-Employee-Attrition.csv",
      cleaned: "attrition_cleaned.csv",
      notebook: "attrition_eda.ipynb",
      rows: "1,470",
      columns: "32",
    },
  ];

  return (
    <>
      <PageHeading
        eyebrow="DATA MANAGEMENT"
        title="Datasets"
        description="Review the data preparation and exploratory analysis progress."
      />

      <section className="stats-grid">
        <StatCard
          icon={Database}
          label="Promotion records"
          value="54,808"
          subtitle="Dataset 1"
        />

        <StatCard
          icon={TrendingUp}
          label="Promoted employees"
          value="4,668"
          subtitle="8.52% of dataset"
          color="green"
        />

        <StatCard
          icon={Users}
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
            Promotion and attrition datasets are cleaned and analyzed
            independently. They must not be merged row by row.
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
