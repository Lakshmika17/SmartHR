
import { useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  Users,
  UserRoundCog,
  TrendingUp,
  BrainCircuit,
  ChartNoAxesCombined,
  FileBarChart2,
  Settings,
  X,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Menu,
} from "lucide-react";

import "./AdminLayout.css";

const menuItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Company overview and ML insights",
  },
  {
    label: "Company Management",
    path: "/admin/company",
    icon: Building2,
    description: "Company details and departments",
  },
  {
    label: "Employee Management",
    path: "/admin/employees",
    icon: Users,
    description: "Employee records and status",
  },
  {
    label: "HR Staff Management",
    path: "/admin/staff",
    icon: UserRoundCog,
    description: "Accounts and permissions",
  },
  {
    label: "Promotion Prediction",
    path: "/admin/promotion",
    icon: TrendingUp,
    description: "ML promotion recommendations",
  },
  {
    label: "Attrition Management",
    path: "/admin/attrition",
    icon: BrainCircuit,
    description: "Review risks and retention actions",
  },
  {
    label: "HR Analytics",
    path: "/admin/analytics",
    icon: ChartNoAxesCombined,
    description: "Workforce metrics and trends",
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: FileBarChart2,
    description: "Exports and prediction summaries",
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
    description: "Admin profile and account",
  },
];

function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("smarthr_user") || "null"
    );
  } catch {
    return null;
  }
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const user = getStoredUser();

  const adminName = user?.name || "HR Administrator";

  const companyName =
    user?.company?.name ||
    user?.companyName ||
    "SmartHR Company";

  const currentPage =
    menuItems.find(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/")
    )?.label || "Admin Workspace";

  const initials =
    adminName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase() || "HR";

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("smarthr_token");
    localStorage.removeItem("smarthr_user");

    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-layout">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          className="admin-overlay"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">
            <BrainCircuit size={25} />
          </div>

          <div className="admin-brand-text">
            <h2>SmartHR Admin</h2>
            <span>Admin Workspace</span>
          </div>

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        {/* COMPANY DETAILS */}
        <div className="admin-company-box">
          <Building2 size={21} />

          <div>
            <strong title={companyName}>
              {companyName}
            </strong>
            <span>Company workspace</span>
          </div>
        </div>

        <div className="admin-nav-heading">
          MAIN MENU
        </div>

        {/* SIDEBAR LINKS */}
        <nav
          className="admin-sidebar-nav"
          aria-label="Admin sidebar navigation"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `admin-nav-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon
                  size={21}
                  className="admin-menu-icon"
                />

                <div className="admin-menu-text">
                  <span className="admin-menu-label">
                    {item.label}
                  </span>

                  <span className="admin-menu-description">
                    {item.description}
                  </span>
                </div>

                <ChevronRight
                  size={17}
                  className="admin-nav-arrow"
                />
              </NavLink>
            );
          })}
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="admin-sidebar-bottom">
          <div className="admin-security">
            <ShieldCheck size={18} />
            <span>HR Admin Workspace</span>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={logout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="admin-main">
        {/* BLUE NAVBAR */}
        <header className="smarthr-admin-navbar">
          <div className="smarthr-navbar-left">
            <button
              type="button"
              className="smarthr-navbar-menu"
              onClick={() =>
                setSidebarOpen((open) => !open)
              }
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
            >
              <Menu size={23} />
            </button>

            <div className="smarthr-navbar-heading">
              <span>SMARTHR / ADMIN</span>
              <h1>{currentPage}</h1>
            </div>
          </div>

          {/* NAVBAR QUICK LINKS */}
          <nav
            className="smarthr-navbar-links"
            aria-label="Admin quick navigation"
          >
            <NavLink to="/admin/dashboard">
              Dashboard
            </NavLink>

            <NavLink to="/admin/employees">
              Employees
            </NavLink>

            <NavLink to="/admin/analytics">
              Analytics
            </NavLink>

            <NavLink to="/admin/reports">
              Reports
            </NavLink>
          </nav>

          {/* ADMIN PROFILE */}
          <div className="smarthr-navbar-right">
            <NavLink
              to="/admin/settings"
              className="smarthr-navbar-icon"
              aria-label="Account settings"
              title="Account settings"
            >
              <Settings size={19} />
            </NavLink>

            <div className="smarthr-navbar-user">
              <div className="smarthr-navbar-avatar">
                {initials}
              </div>

              <div className="smarthr-navbar-user-info">
                <strong>{adminName}</strong>
                <span>HR Administrator</span>
              </div>
            </div>

            <button
              type="button"
              className="smarthr-navbar-logout"
              onClick={logout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* ALL ADMIN PAGES RENDER HERE */}
        <main className="admin-content">
          <Outlet />
        </main>

        {/* SHARED FOOTER */}
        <footer className="admin-footer smarthr-admin-footer">
          <div className="smarthr-footer-brand">
            <BrainCircuit size={19} />
            <strong>SmartHR</strong>
            <span>Admin Workspace</span>
          </div>

          <span>
            © {new Date().getFullYear()} SmartHR.
            All rights reserved.
          </span>

          <span className="smarthr-footer-secure">
            <ShieldCheck size={17} />
            Secure Workforce Management
          </span>
        </footer>
      </div>
    </div>
  );
}
