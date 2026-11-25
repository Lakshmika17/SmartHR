import { useEffect, useState } from "react";
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
  Sparkles,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  History,
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
import Reports from "./pages/Reports";
import PromotionPrediction from "./pages/PromotionPrediction";
import AdminDashboard from "./pages/AdminDashboard";
import PromotionManagement from "./pages/PromotionManagement";
import AdminRoute from "./components/AdminRoute";
import StaffRoute from "./components/StaffRoute";
import HRStaffManagement from "./pages/HRStaffManagement";
import AdminLayout from "./layouts/AdminLayout";
import CompanyManagement from "./pages/CompanyManagement";
import AttritionManagement from "./pages/AttritionManagement";
import AttritionHistory from "./pages/AttritionHistory";
import AdminSettings from "./pages/AdminSettings";


/* =========================================================
   DASHBOARD DATA
========================================================= */

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
  { label: "Attrition History", icon: History },
  { label: "HR Analytics", icon: ChartNoAxesCombined },
  { label: "Datasets", icon: Database },
];


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  initialPage = "Overview",
  promotionWorkflow = false,
}) {
  const [activePage, setActivePage] = useState(initialPage);
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

      <aside
        className={`sidebar ${
          mobileMenu ? "sidebar-open" : ""
        }`}
      >

        <div className="brand">
          <div className="brand-logo">S</div>

          <div>
            <h2>SmartHR</h2>
            <span>INTELLIGENCE PLATFORM</span>
          </div>
        </div>

        <div className="nav-heading">
          WORKSPACE
        </div>

        <nav className="navigation">

          {navItems
            .filter(
              (item) =>
                promotionWorkflow ||
                item.label !== "Attrition History"
            )
            .map(({ label, icon: Icon }) => (

              <button
                key={label}
                className={`nav-item ${
                  activePage === label ? "active" : ""
                }`}
                onClick={() => navigate(label)}
              >

                <Icon size={21} />

                <span>{label}</span>

                {activePage === label && (
                  <ChevronRight size={17} />
                )}

              </button>

            ))}

        </nav>

        <div className="sidebar-promo">

          <Sparkles size={23} />

          <h4>
            Smarter people decisions
          </h4>

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

          <div className="profile-avatar">
            HR
          </div>

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

            <strong>
              {activePage}
            </strong>

          </div>


          <div className="topbar-actions">

            <div className="search-box">

              <Search size={19} />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
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


            <div className="user-avatar">
              H
            </div>

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
            <PredictionPage
              type="promotion"
              workflow={promotionWorkflow}
            />
          )}

          {activePage === "Attrition History" &&
            promotionWorkflow && (
              <AttritionHistory />
            )}

          {activePage === "Attrition Prediction" && (
            <PredictionPage
              type="attrition"
              workflow={promotionWorkflow}
            />
          )}

          {activePage === "HR Analytics" && (
            <HRAnalytics />
          )}

          {activePage === "Datasets" && (
            <Datasets />
          )}

          {activePage === "Settings" && (
            <SettingsPage />
          )}

        </div>


        <footer className="footer">

          <span>SmartHR</span>

          <span>
            Employee Promotion & Attrition Prediction System
          </span>

        </footer>

      </main>

    </div>
  );
}


/* =========================================================
   PAGE HEADING
========================================================= */

function PageHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="page-heading">

      <span className="eyebrow">
        {eyebrow}
      </span>

      <h1>{title}</h1>

      <p>{description}</p>

    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

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


/* =========================================================
   OVERVIEW
========================================================= */

function Overview({ navigate }) {
  return (
    <>
      <section className="welcome-section">

        <div>

          <span className="eyebrow">
            YOUR HR WORKSPACE
          </span>

          <h1>
            People intelligence, simplified.
          </h1>

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

            <Sparkles size={15} />

            SMARTER HR DECISIONS

          </span>

          <h2>
            Understand your people.
            <br />
            Plan your next move.
          </h2>

          <p>
            Discover promotion patterns and prepare for
            data-driven workforce insights.
          </p>

          <button
            className="hero-button"
            onClick={() =>
              navigate("Promotion Prediction")
            }
          >

            Explore promotion

            <ChevronRight size={18} />

          </button>

        </div>


        <div className="hero-visual">

          <div className="hero-orbit orbit-one" />

          <div className="hero-orbit orbit-two" />


          <div className="floating-tile tile-one">

            <TrendingUp size={27} />

            <strong>
              People analytics
            </strong>

            <span>
              Patterns & insights
            </span>

          </div>


          <div className="floating-center">

            <Users size={49} />

          </div>


          <div className="floating-tile tile-two">

            <Users size={25} />

            <strong>
              Workforce
            </strong>

            <span>
              Understand your team
            </span>

          </div>

        </div>

      </section>


      <div className="section-title-row">

        <div>

          <h2>
            Promotion snapshot
          </h2>

          <p>
            Summary of the training dataset
          </p>

        </div>


        <span className="dataset-tag">
          DATASET 01
        </span>

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

              <h3>
                Promotion rate by department
              </h3>

              <p>
                Percentage of employees promoted
              </p>

            </div>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

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
                  tick={{
                    fontSize: 10,
                    fill: "#7b82ae",
                  }}
                  angle={-25}
                  textAnchor="end"
                />

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "#7b82ae",
                  }}
                  domain={[0, 12]}
                />

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
            Department rates are based on the configured
            promotion dataset values.
          </p>

        </div>


        <div className="chart-card">

          <div className="chart-heading">

            <div>

              <h3>
                Promotion distribution
              </h3>

              <p>
                Training dataset target breakdown
              </p>

            </div>

          </div>


          <div className="donut-layout">

            <div className="donut-chart">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

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

                <strong>
                  8.52%
                </strong>

                <span>
                  Promoted
                </span>

              </div>

            </div>


            <div className="legend">

              <div>

                <span className="legend-dot purple-dot" />

                <span>
                  Not promoted
                  <strong>
                    50,140
                  </strong>
                </span>

                <b>
                  91.48%
                </b>

              </div>


              <div>

                <span className="legend-dot green-dot" />

                <span>
                  Promoted
                  <strong>
                    4,668
                  </strong>
                </span>

                <b>
                  8.52%
                </b>

              </div>

            </div>

          </div>

        </div>

      </section>

    </>
  );
}


/* =========================================================
   PREDICTION PAGE
========================================================= */

function PredictionPage({
  type,
  workflow = false,
}) {

  const isPromotion = type === "promotion";


  const defaultPromotionDepartments = [
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


  const defaultAttritionDepartments = [
    "Research & Development",
    "Sales",
    "Human Resources",
  ];


  /* -------------------------------------------------------
     PROMOTION FIELDS
  ------------------------------------------------------- */

  const promotionFields = [
    {
      name: "department",
      label: "Department",
      options: defaultPromotionDepartments,
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
        {
          label: "Male",
          value: "m",
        },
        {
          label: "Female",
          value: "f",
        },
      ],
    },

    {
      name: "length_of_service",
      label: "Years of Service",
      type: "number",
      min: 0,
      max: 60,
    },

    {
      name: "avg_training_score",
      label: "Average Training Score",
      type: "number",
      min: 0,
      max: 100,
    },
  ];


  /* -------------------------------------------------------
     ATTRITION FIELDS
  ------------------------------------------------------- */

  const attritionFields = [
    {
      name: "Age",
      label: "Age",
      type: "number",
      min: 18,
      max: 100,
    },

    {
      name: "Department",
      label: "Department",
      options: defaultAttritionDepartments,
    },

    {
      name: "MonthlyIncome",
      label: "Monthly Income",
      type: "number",
      min: 0,
    },

    {
      name: "OverTime",
      label: "OverTime",
      options: ["Yes", "No"],
    },

    {
      name: "YearsAtCompany",
      label: "Years at Company",
      type: "number",
      min: 0,
    },
  ];


  /* -------------------------------------------------------
     PROMOTION DEFAULTS
  ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     ATTRITION DEFAULTS
  ------------------------------------------------------- */

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


  const fields = isPromotion
    ? promotionFields
    : attritionFields;


  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const [form, setForm] = useState(() =>
    isPromotion
      ? promotionDefaults
      : attritionDefaults
  );

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");

  const [employeesLoading, setEmployeesLoading] =
    useState(false);

  const [employeesError, setEmployeesError] =
    useState("");

  const [companyDepartments, setCompanyDepartments] =
    useState([]);

  const [departmentsLoading, setDepartmentsLoading] =
    useState(false);

  const [departmentsError, setDepartmentsError] =
    useState("");


  /* -------------------------------------------------------
     API BASE
  ------------------------------------------------------- */

  const apiBase = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  )
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");


  /* =======================================================
     LOAD EMPLOYEES + COMPANY DEPARTMENTS
  ======================================================= */

  useEffect(() => {

    if (!workflow) {
      return;
    }

    const controller =
      new AbortController();


    const loadEmployees = async () => {

      setEmployeesLoading(true);
      setEmployeesError("");

      try {

        const token =
          localStorage.getItem(
            "smarthr_token"
          );

        if (!token) {
          throw new Error(
            "Please log in to select an employee."
          );
        }


        const response = await fetch(
          `${apiBase}/api/employees`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            signal:
              controller.signal,
          }
        );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
              "Unable to load employees."
          );

        }


        setEmployees(
          Array.isArray(
            data.employees
          )
            ? data.employees
            : []
        );

      } catch (err) {

        if (
          err.name !==
          "AbortError"
        ) {

          setEmployeesError(
            err.message
          );

        }

      } finally {

        if (
          !controller.signal.aborted
        ) {

          setEmployeesLoading(
            false
          );

        }

      }

    };


    const loadDepartments =
      async () => {

        setDepartmentsLoading(
          true
        );

        setDepartmentsError("");

        try {

          const token =
            localStorage.getItem(
              "smarthr_token"
            );

          if (!token) {

            throw new Error(
              "Please log in again."
            );

          }


          const response =
            await fetch(
              `${apiBase}/api/departments`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },

                signal:
                  controller.signal,
              }
            );


          const data =
            await response.json();


          if (!response.ok) {

            throw new Error(
              data.message ||
                "Unable to load departments."
            );

          }


          const activeDepartments =
            Array.isArray(
              data.departments
            )
              ? data.departments.filter(
                  (department) =>
                    department.isActive !== false
                )
              : [];


          setCompanyDepartments(
            activeDepartments
          );

        } catch (err) {

          if (
            err.name !==
            "AbortError"
          ) {

            setDepartmentsError(
              err.message
            );

          }

        } finally {

          if (
            !controller.signal.aborted
          ) {

            setDepartmentsLoading(
              false
            );

          }

        }

      };


    loadEmployees();
    loadDepartments();


    return () =>
      controller.abort();

  }, [apiBase, workflow]);


  /* =======================================================
     UPDATE DEPARTMENT OPTIONS
  ======================================================= */

  const dynamicDepartmentOptions =
    companyDepartments.length > 0
      ? companyDepartments.map(
          (department) =>
            department.name
        )
      : isPromotion
        ? defaultPromotionDepartments
        : defaultAttritionDepartments;


  const dynamicFields =
    isPromotion
      ? [
          {
            name: "department",
            label: "Department",
            options:
              dynamicDepartmentOptions,
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
              {
                label: "Male",
                value: "m",
              },
              {
                label: "Female",
                value: "f",
              },
            ],
          },

          {
            name: "length_of_service",
            label: "Years of Service",
            type: "number",
            min: 0,
            max: 60,
          },

          {
            name: "avg_training_score",
            label: "Average Training Score",
            type: "number",
            min: 0,
            max: 100,
          },
        ]
      : [
          {
            name: "Age",
            label: "Age",
            type: "number",
            min: 18,
            max: 100,
          },

          {
            name: "Department",
            label: "Department",
            options:
              dynamicDepartmentOptions,
          },

          {
            name: "MonthlyIncome",
            label: "Monthly Income",
            type: "number",
            min: 0,
          },

          {
            name: "OverTime",
            label: "OverTime",
            options: [
              "Yes",
              "No",
            ],
          },

          {
            name: "YearsAtCompany",
            label: "Years at Company",
            type: "number",
            min: 0,
          },
        ];


  /* =======================================================
     SELECT EMPLOYEE
  ======================================================= */

  function selectEmployee(id) {

    setEmployeeId(id);
    setResult(null);
    setError("");


    const employee =
      employees.find(
        (item) =>
          String(item._id) ===
          id
      );


    if (!employee) {
      return;
    }


    if (!isPromotion) {

      setForm((previous) => ({
        ...previous,

        Age:
          employee.age != null
            ? Number(employee.age)
            : previous.Age,

        Department:
          employee.department || "",

        MonthlyIncome:
          employee.monthlyIncome != null
            ? Number(
                employee.monthlyIncome
              )
            : previous.MonthlyIncome,

        OverTime:
          employee.overTime ||
          employee.overtime ||
          previous.OverTime,

        YearsAtCompany:
          employee.yearsAtCompany != null
            ? Number(
                employee.yearsAtCompany
              )
            : previous.YearsAtCompany,
      }));

      return;
    }


    const mlDepartments =
      dynamicDepartmentOptions;


    const score =
      Number(employee.training);


    setForm((previous) => ({
      ...previous,

      department:
        mlDepartments.includes(
          employee.department
        )
          ? employee.department
          : previous.department,

      education:
        previous.education,

      gender:
        previous.gender,

      length_of_service:
        employee.experience != null
          ? Number(
              employee.experience
            )
          : previous.length_of_service,

      avg_training_score:
        employee.training != null &&
        Number.isFinite(score) &&
        score >= 0 &&
        score <= 100
          ? score
          : previous.avg_training_score,
    }));

  }


  /* =======================================================
     UPDATE FORM FIELD
  ======================================================= */

  function updateField(e) {

    const {
      name,
      value,
    } = e.target;


    const field =
      dynamicFields.find(
        (item) =>
          item.name === name
      );


    const numericValue =
      field?.type === "number";


    setForm((previous) => ({
      ...previous,

      [name]:
        value === ""
          ? ""
          : numericValue
            ? Number(value)
            : value,
    }));


    setResult(null);
    setError("");

  }


  /* =======================================================
     SUBMIT FORM
  ======================================================= */

  async function submitForm(e) {

    e.preventDefault();

    setLoading(true);
    setResult(null);
    setError("");


    const endpoint =
      workflow
        ? isPromotion
          ? `${apiBase}/api/promotions`
          : `${apiBase}/api/attrition`
        : isPromotion
          ? "http://127.0.0.1:8000/predict/promotion"
          : "http://127.0.0.1:8000/predict/attrition";


    try {

      if (
        workflow &&
        !employeeId
      ) {

        throw new Error(
          "Please select an employee before submitting."
        );

      }


      const token =
        localStorage.getItem(
          "smarthr_token"
        );


      if (
        workflow &&
        !token
      ) {

        throw new Error(
          "Please log in again before submitting."
        );

      }


      const response =
        await fetch(
          endpoint,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              ...(workflow
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },

            body:
              JSON.stringify(
                workflow
                  ? {
                      employeeId,
                      modelInputs:
                        form,
                    }
                  : form
              ),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        const detail =
          data.detail;


        throw new Error(
          data.message ||
            (
              typeof detail ===
              "string"
                ? detail
                : "Please check the entered employee details."
            )
        );

      }


      /* ---------------------------------------------------
         ATTRITION STAFF RESPONSE
      --------------------------------------------------- */

      if (
        workflow &&
        !isPromotion
      ) {

        const assessment =
          data.assessment;


        if (!assessment) {

          throw new Error(
            "The backend did not return a saved assessment."
          );

        }


        const mlPrediction =
          assessment.modelPrediction;


        const predictionLabel =
          mlPrediction &&
          typeof mlPrediction ===
            "object"
            ? (
                mlPrediction.prediction ??
                mlPrediction.attrition_prediction ??
                mlPrediction.attrition ??
                "Assessment submitted"
              )
            : mlPrediction ??
              "Assessment submitted";


        setResult({

          prediction:
            typeof predictionLabel ===
              "object"
              ? JSON.stringify(
                  predictionLabel
                )
              : String(
                  predictionLabel
                ),

          attrition_probability:
            assessment.attritionProbability,

          notice:
            "Assessment submitted for HR Admin review.",

          status:
            assessment.status,

          riskLevel:
            assessment.riskLevel,

        });

      }


      /* ---------------------------------------------------
         PROMOTION STAFF RESPONSE
         IMPORTANT:
         Promotion prediction is now DIRECT.
         No admin approval/request workflow.
      --------------------------------------------------- */

      else if (
        workflow &&
        isPromotion
      ) {

        setResult({

          prediction:
            data.prediction,

          promotion_probability:
            data.promotion_probability,

          model_prediction:
            data.model_prediction,

          notice:
            data.notice ||
            "Prediction generated successfully.",

        });

      }


      /* ---------------------------------------------------
         NORMAL ML RESPONSE
      --------------------------------------------------- */

      else {

        setResult(data);

      }


    } catch (err) {

      console.error(
        "Prediction error:",
        err
      );


      setError(

        err.message ===
          "Failed to fetch"

          ? workflow

            ? "Cannot connect to the SmartHR backend. Make sure Express is running on port 5000."

            : "Cannot connect to the ML service. Make sure FastAPI is running on port 8000."

          : err.message ||
            "Unable to generate the prediction."

      );

    } finally {

      setLoading(false);

    }

  }


  /* =======================================================
     PROBABILITY
  ======================================================= */

  const probability =
    result
      ? isPromotion
        ? result.promotion_probability
        : result.attrition_probability
      : null;


  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <>

      <PageHeading
        eyebrow={
          isPromotion
            ? "EMPLOYEE GROWTH"
            : "WORKFORCE RETENTION"
        }

        title={
          isPromotion
            ? "Promotion Prediction"
            : "Attrition Prediction"
        }

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

            {isPromotion
              ? "Promotion assessment"
              : "Attrition assessment"}

          </h3>


          <p>

            Submit employee details to receive
            a prediction and estimated probability
            from the trained model.

          </p>

        </div>


        <span className="pending-badge">

          {loading
            ? "Predicting..."
            : "ML model connected"}

        </span>

      </div>


      <div className="form-card">

        <h2>
          Employee information
        </h2>


        <p className="form-intro">

          {isPromotion
            ? "Enter the important employee details to generate a promotion prediction."
            : "Complete all fields to generate a prediction."}

        </p>


        <form onSubmit={submitForm}>


          {/* =================================================
              EMPLOYEE SELECTION
          ================================================= */}

          {workflow && (

            <div
              style={{
                marginBottom:
                  "20px",
              }}
            >

              <label
                htmlFor="prediction-employee"
                style={{
                  display:
                    "block",

                  marginBottom:
                    "8px",
                }}
              >
                Select employee from your company
              </label>


              <select
                id="prediction-employee"
                value={employeeId}
                onChange={(event) =>
                  selectEmployee(
                    event.target.value
                  )
                }
                required
                disabled={
                  employeesLoading
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >

                <option value="">

                  {employeesLoading
                    ? "Loading employees..."
                    : "Choose an employee"}

                </option>


                {employees
                  .filter(
                    (employee) =>
                      employee.status !==
                      "Inactive"
                  )
                  .map(
                    (employee) => (

                      <option
                        key={
                          employee._id
                        }
                        value={
                          employee._id
                        }
                      >

                        {employee.name}
                        {" — "}
                        {employee.department}
                        {" ("}
                        {employee.email}
                        {")"}

                      </option>

                    )
                  )}

              </select>


              {employeesError && (

                <p
                  role="alert"
                  style={{
                    color:
                      "#b42318",
                  }}
                >
                  {employeesError}
                </p>

              )}


              {!employeesLoading &&
                !employeesError &&
                employees.length ===
                  0 && (

                  <p>
                    No employees found.
                    Add an employee in
                    Employee Management first.
                  </p>

                )}

            </div>

          )}


          {/* =================================================
              DEPARTMENT LOAD STATUS
          ================================================= */}

          {workflow &&
            departmentsLoading && (

              <p
                style={{
                  marginBottom:
                    "15px",
                  color:
                    "#6c55e8",
                  fontSize:
                    "14px",
                }}
              >
                Loading company departments...
              </p>

            )}


          {workflow &&
            departmentsError && (

              <p
                style={{
                  marginBottom:
                    "15px",
                  color:
                    "#b42318",
                  fontSize:
                    "14px",
                }}
              >
                Unable to load company departments:
                {" "}
                {departmentsError}
              </p>

            )}


          {/* =================================================
              FORM FIELDS
          ================================================= */}

          <div className="form-grid">

            {dynamicFields.map(
              (field) => (

                <label
                  key={field.name}
                >

                  {field.label}


                  {field.options ? (

                    <select
                      name={
                        field.name
                      }

                      value={
                        form[
                          field.name
                        ]
                      }

                      onChange={
                        updateField
                      }

                      required
                    >

                      {workflow && (

                        <option
                          value=""
                        >
                          Select{" "}
                          {field.label}
                        </option>

                      )}


                      {field.options.map(
                        (option) => {

                          const optionValue =
                            typeof option ===
                            "object"
                              ? option.value
                              : option;


                          const optionLabel =
                            typeof option ===
                            "object"
                              ? option.label
                              : option;


                          return (

                            <option
                              key={
                                String(
                                  optionValue
                                )
                              }

                              value={
                                optionValue
                              }
                            >

                              {
                                optionLabel
                              }

                            </option>

                          );

                        }
                      )}

                    </select>

                  ) : (

                    <input
                      name={
                        field.name
                      }

                      type={
                        field.type ||
                        "text"
                      }

                      value={
                        form[
                          field.name
                        ]
                      }

                      onChange={
                        updateField
                      }

                      min={
                        field.min
                      }

                      max={
                        field.max
                      }

                      required
                    />

                  )}

                </label>

              )
            )}

          </div>


          {/* =================================================
              SUBMIT BUTTON
          ================================================= */}

          <button
            className="primary-button"
            type="submit"
            disabled={
              loading ||
              (
                workflow &&
                !employeeId
              )
            }
          >

            {loading
              ? "Generating prediction..."
              : isPromotion
                ? "Predict Promotion"
                : workflow
                  ? "Submit Attrition Assessment"
                  : "Predict Attrition"}


            {!loading && (
              <ChevronRight
                size={17}
              />
            )}

          </button>

        </form>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            className="notice-box"
            role="alert"
          >

            <p>
              {error}
            </p>

          </div>

        )}


        {/* =================================================
            RESULT
        ================================================= */}

        {result && (

          <div
            aria-live="polite"
            style={{
              width: "100%",
              display: "flex",
              justifyContent:
                "center",
              marginTop:
                "28px",
            }}
          >

            <div
              style={{
                width: "100%",
                maxWidth:
                  "650px",
                padding:
                  "28px 35px",
                borderRadius:
                  "18px",
                background:
                  "linear-gradient(135deg, #f0ebff 0%, #f7f4ff 100%)",
                border:
                  "1px solid #e2d9ff",
                textAlign:
                  "center",
                boxShadow:
                  "0 8px 25px rgba(91, 67, 210, 0.08)",
              }}
            >

              <div
                style={{
                  width:
                    "48px",
                  height:
                    "48px",
                  margin:
                    "0 auto 12px",
                  borderRadius:
                    "50%",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  background:
                    "#ffffff",
                }}
              >

                <CheckCircle2
                  size={26}
                  color="#6c55e8"
                />

              </div>


              <h3
                style={{
                  margin:
                    "0 0 12px",
                  fontSize:
                    "24px",
                  color:
                    "#5141a8",
                  fontWeight:
                    "700",
                }}
              >

                {result.prediction}

              </h3>


              {/* ------------------------------------------------
                  ATTRITION STATUS ONLY
                  Promotion no longer shows admin status.
              ------------------------------------------------ */}

              {workflow &&
                !isPromotion && (
                  <p
                    style={{
                      margin:
                        "8px 0",
                      fontSize:
                        "16px",
                      color:
                        "#4f46a5",
                    }}
                  >

                    <strong>

                      Status:
                      {" "}

                      {result.status ||
                        "Pending HR Admin review"}

                    </strong>

                  </p>
                )}


              <p
                style={{
                  margin:
                    "10px 0",
                  fontSize:
                    "17px",
                  color:
                    "#555",
                }}
              >

                Estimated{" "}

                {isPromotion
                  ? "promotion"
                  : "attrition"}

                {" "}probability:

                {" "}

                <strong
                  style={{
                    color:
                      "#5141a8",
                    fontSize:
                      "20px",
                  }}
                >

                  {probability}%

                </strong>

              </p>


              <p
                style={{
                  margin:
                    "12px 0 0",
                  color:
                    "#777",
                  fontSize:
                    "14px",
                }}
              >

                {result.notice}

              </p>

            </div>

          </div>

        )}

      </div>

    </>
  );
}


/* =========================================================
   DATASETS
========================================================= */

function Datasets() {

  const datasets = [

    {
      name:
        "Dataset 1 · Employee Promotion",

      description:
        "Employee promotion eligibility, training, and performance analysis.",

      original:
        "train.csv, test.csv",

      cleaned:
        "promotion_cleaned.csv",

      notebook:
        "promotion_eda.ipynb",

      rows:
        "54,808",

      columns:
        "13",

      target:
        "is_promoted",

      distribution: [
        {
          label:
            "Promoted",
          value:
            "4,668 (8.52%)",
        },

        {
          label:
            "Not promoted",
          value:
            "50,140 (91.48%)",
        },
      ],
    },


    {
      name:
        "Dataset 2 · Employee Attrition",

      description:
        "Employee retention, workplace satisfaction, and attrition analysis.",

      original:
        "WA_Fn-UseC_-HR-Employee-Attrition.csv",

      cleaned:
        "attrition_cleaned.csv",

      notebook:
        "attrition_eda.ipynb",

      rows:
        "1,470",

      columns:
        "32",

      target:
        "Attrition",

      distribution: [
        {
          label:
            "Employees who left",
          value:
            "237 (16.12%)",
        },

        {
          label:
            "Employees who stayed",
          value:
            "1,233 (83.88%)",
        },
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

        {datasets.map(
          (dataset, index) => (

            <div
              className="dataset-card"
              key={dataset.name}
            >

              <div className="dataset-card-header">

                <div>

                  <span className="eyebrow">
                    DATASET 0
                    {index + 1}
                  </span>

                  <h2>
                    {dataset.name}
                  </h2>

                  <p>
                    {dataset.description}
                  </p>

                </div>


                <span className="dataset-status success">

                  <CheckCircle2
                    size={15}
                  />

                  Cleaned

                </span>

              </div>


              <div className="dataset-metrics">

                <div>

                  <span>
                    Records
                  </span>

                  <strong>
                    {dataset.rows}
                  </strong>

                </div>


                <div>

                  <span>
                    Columns
                  </span>

                  <strong>
                    {dataset.columns}
                  </strong>

                </div>


                <div>

                  <span>
                    Target column
                  </span>

                  <strong>
                    {dataset.target}
                  </strong>

                </div>

              </div>


              <div className="dataset-distribution">

                <h3>
                  Target distribution
                </h3>


                {dataset.distribution.map(
                  (item) => (

                    <div
                      className="dataset-distribution-row"
                      key={
                        item.label
                      }
                    >

                      <span>
                        {item.label}
                      </span>

                      <strong>
                        {item.value}
                      </strong>

                    </div>

                  )
                )}

              </div>


              <div className="dataset-files">

                <p>

                  <strong>
                    Original file:
                  </strong>{" "}

                  {dataset.original}

                </p>


                <p>

                  <strong>
                    Cleaned file:
                  </strong>{" "}

                  {dataset.cleaned}

                </p>


                <p>

                  <strong>
                    EDA notebook:
                  </strong>{" "}

                  {dataset.notebook}

                </p>

              </div>

            </div>

          )
        )}

      </div>


      <div className="dataset-note">

        <Database size={20} />

        <div>

          <strong>
            Data integrity
          </strong>

          <p>
            The promotion and attrition datasets
            represent different employee populations
            and must be processed independently.
            Their records should not be merged row by row.
          </p>

        </div>

      </div>

    </>
  );
}


/* =========================================================
   SETTINGS
========================================================= */

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

            <strong>
              SmartHR Intelligence Platform
            </strong>

            <p>
              Employee Promotion & Attrition Prediction System
            </p>

          </div>

        </div>


        <div className="insight-item">

          <span className="insight-icon green">

            <Database size={20} />

          </span>


          <div>

            <strong>
              Dataset status
            </strong>

            <p>
              Both source datasets have been cleaned and saved locally.
            </p>

          </div>

        </div>

      </div>

    </>
  );
}


/* =========================================================
   APP ROUTES
========================================================= */

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* PUBLIC */}

        <Route
          path="/"
          element={
            <LandingPage />
          }
        />

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/register-company"
          element={
            <RegisterCompany />
          }
        />


        {/* EXISTING DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <Dashboard />
          }
        />


        {/* HR ANALYTICS PAGE */}

        <Route
          path="/hr-analytics"
          element={
            <HRAnalytics />
          }
        />


        <Route
          path="/promotion-prediction"
          element={
            <PromotionPrediction />
          }
        />


        {/* =================================================
            HR STAFF
        ================================================= */}

        <Route
          element={
            <StaffRoute />
          }
        >

          <Route
            path="/staff/dashboard"
            element={
              <Dashboard
                promotionWorkflow
              />
            }
          />

        </Route>


        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          element={
            <AdminRoute />
          }
        >

          <Route
            element={
              <AdminLayout />
            }
          >

            <Route
              path="/admin/dashboard"
              element={
                <AdminDashboard />
              }
            />


            <Route
              path="/admin/staff"
              element={
                <HRStaffManagement />
              }
            />


            <Route
              path="/admin/employees"
              element={
                <EmployeeManagement />
              }
            />


            <Route
              path="/admin/employee-profile"
              element={
                <Dashboard
                  initialPage="Employee Profile"
                />
              }
            />


            <Route
              path="/admin/promotion"
              element={
                <PromotionManagement />
              }
            />


            <Route
              path="/admin/attrition"
              element={
                <AttritionManagement />
              }
            />


            <Route
              path="/admin/analytics"
              element={
                <HRAnalytics />
              }
            />


            <Route
              path="/admin/reports"
              element={
                <Reports />
              }
            />


            <Route
              path="/admin/datasets"
              element={
                <Dashboard
                  initialPage="Datasets"
                />
              }
            />


            <Route
              path="/admin/settings"
              element={
                <AdminSettings />
              }
            />


            <Route
              path="/admin/company"
              element={
                <CompanyManagement />
              }
            />

          </Route>

        </Route>


        {/* FALLBACK */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}


export default App;