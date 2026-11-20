
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Settings,
  Activity,
  FileBarChart2,
  ArrowRight,
} from "lucide-react";

import "./AdminDashboard.css";

const recentActivities = [
  {
    title: "Employee records reviewed",
    description: "Example activity for dashboard preview",
    icon: Users,
  },
  {
    title: "Promotion predictions generated",
    description: "Example activity for dashboard preview",
    icon: TrendingUp,
  },
  {
    title: "Attrition risk report prepared",
    description: "Example activity for dashboard preview",
    icon: Activity,
  },
];

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadOverview = async () => {
      try {
        const token = localStorage.getItem("smarthr_token");

        const response = await fetch(
          "http://localhost:5000/api/dashboard/overview",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load dashboard."
          );
        }

        setOverview(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setOverviewError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setOverviewLoading(false);
        }
      }
    };

    loadOverview();

    return () => controller.abort();
  }, []);

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("smarthr_user") || "null"
    );
  } catch {
    currentUser = null;
  }

  const adminName =
    currentUser?.name || "HR Administrator";

  const stats = [
    {
      title: "Total Employees",
      value: overview?.stats?.totalEmployees ?? "—",
      change: "Company employees",
      icon: Users,
      color: "blue",
    },
    {
      title: "Departments",
      value: overview?.stats?.totalDepartments ?? "—",
      change: "Company departments",
      icon: Building2,
      color: "purple",
    },
    {
      title: "Active HR Staff",
      value: overview?.stats?.activeHRStaff ?? "—",
      change: "Active staff accounts",
      icon: UserPlus,
      color: "green",
    },
    {
      title: "Active Employees",
      value: overview?.stats?.activeEmployees ?? "—",
      change: "Active employees",
      icon: Users,
      color: "orange",
    },
  ];

  const departments = Array.isArray(overview?.departments)
    ? overview.departments
    : [];

  const maxDepartmentEmployees = Math.max(
    1,
    ...departments.map((department) =>
      Number(
        department.employeeCount ??
        department.count ??
        department.totalEmployees ??
        0
      )
    )
  );

  return (
    <div className="admin-dashboard-page">
      {/* LOADING MESSAGE */}
      {overviewLoading && (
        <div
          className="admin-demo-banner"
          role="status"
        >
          <Activity size={18} />
          Loading company statistics...
        </div>
      )}

      {/* ERROR MESSAGE */}
      {overviewError && (
        <div
          className="admin-demo-banner"
          role="alert"
        >
          <AlertTriangle size={18} />
          {overviewError}
        </div>
      )}

      {/* WELCOME SECTION */}
      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">
            SMARTHR ADMIN WORKSPACE
          </span>

          <h2>Welcome back, {adminName}!</h2>

          <p>
            Monitor workforce performance, manage
            employees, and explore machine learning
            insights from your SmartHR dashboard.
          </p>
        </div>

        <Link
          to="/admin/employees"
          className="admin-primary-action"
        >
          <Users size={18} />
          Manage Employees
          <ArrowRight size={17} />
        </Link>
      </section>

      {/* DASHBOARD STATISTICS */}
      <section className="admin-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className="admin-stat-card"
              key={stat.title}
            >
              <div className="admin-stat-header">
                <div
                  className={`admin-stat-icon ${stat.color}`}
                >
                  <Icon size={23} />
                </div>

                <span className="admin-stat-change">
                  {stat.change}
                </span>
              </div>

              <p>{stat.title}</p>

              <h3>{stat.value}</h3>
            </div>
          );
        })}
      </section>

      {/* ANALYTICS SECTION */}
      <section className="admin-analytics-grid">
        {/* DEPARTMENT OVERVIEW */}
        <div className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h3>Department Overview</h3>
              <p>
                Employee distribution across departments
              </p>
            </div>

            <BarChart3 size={21} />
          </div>

          <div className="admin-department-list">
            {departments.length === 0 ? (
              <p>
                {overviewLoading
                  ? "Loading department information..."
                  : "No department data available."}
              </p>
            ) : (
              departments.map((department, index) => {
                const name =
                  department.name ??
                  department.departmentName ??
                  `Department ${index + 1}`;

                const count = Number(
                  department.employeeCount ??
                  department.count ??
                  department.totalEmployees ??
                  0
                );

                const percentage = Math.max(
                  0,
                  Math.min(
                    100,
                    (count / maxDepartmentEmployees) * 100
                  )
                );

                return (
                  <div
                    className="admin-department-item"
                    key={department._id ?? name ?? index}
                  >
                    <div className="admin-department-info">
                      <strong>{name}</strong>
                      <span>{count} employees</span>
                    </div>

                    <div className="admin-progress-track">
                      <div
                        className="admin-progress-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ML PREDICTIONS */}
        <div className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h3>ML Prediction Overview</h3>
              <p>
                Smart workforce insights and predictions
              </p>
            </div>

            <BrainCircuit size={22} />
          </div>

          <div className="admin-prediction-list">
            <div className="admin-prediction-item">
              <div className="admin-prediction-icon green">
                <TrendingUp size={22} />
              </div>

              <div>
                <strong>Promotion Prediction</strong>
                <p>
                  Analyze employee performance and
                  explore promotion recommendations.
                </p>
              </div>
            </div>

            <div className="admin-prediction-item">
              <div className="admin-prediction-icon orange">
                <BrainCircuit size={22} />
              </div>

              <div>
                <strong>Attrition Management</strong>
                <p>
                  Review employee attrition risks
                  and support retention planning.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-prediction-actions">
            <Link to="/admin/promotion">
              Promotion Prediction
            </Link>

            <Link to="/admin/attrition">
              Attrition Management
            </Link>
          </div>
        </div>
      </section>

      {/* BOTTOM SECTION */}
      <section className="admin-bottom-grid">
        {/* QUICK ACTIONS */}
        <div className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h3>Quick Actions</h3>
              <p>
                Access frequently used admin features
              </p>
            </div>

            <LayoutDashboard size={21} />
          </div>

          <div className="admin-quick-actions">
            <Link to="/admin/employees">
              <Users size={19} />
              Employee Management
            </Link>

            <Link to="/admin/staff">
              <UserPlus size={19} />
              HR Staff Management
            </Link>

            <Link to="/admin/reports">
              <FileBarChart2 size={19} />
              Reports
            </Link>

            <Link to="/admin/settings">
              <Settings size={19} />
              Settings
            </Link>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h3>Recent Activities</h3>
              <p>
                Example dashboard activity items
              </p>
            </div>

            <Activity size={21} />
          </div>

          <div className="admin-activity-list">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div
                  className="admin-activity-item"
                  key={activity.title}
                >
                  <div className="admin-activity-icon">
                    <Icon size={19} />
                  </div>

                  <div>
                    <strong>{activity.title}</strong>
                    <p>{activity.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
