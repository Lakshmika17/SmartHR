import React, { useEffect, useState } from "react";
import "./EmployeeProfile.css";

export default function EmployeeProfile() {
  const [activeTab, setActiveTab] = useState("Personal Info");
  const [editing, setEditing] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [employee, setEmployee] = useState(null);

  const apiBase =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch employees from MongoDB
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError("");

        // SmartHR stores login token using this key
        const token = localStorage.getItem("smarthr_token");

        if (!token) {
          throw new Error("Please log in again.");
        }

        const response = await fetch(
          `${apiBase}/api/employees`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load employees."
          );
        }

        // Backend returns employees inside data.employees
        const employeeList = Array.isArray(data.employees)
          ? data.employees
          : [];

        setEmployees(employeeList);

        // Select first employee by default
        if (employeeList.length > 0) {
          setSelectedEmployeeId(
            employeeList[0]._id
          );
        }

      } catch (err) {
        console.error("Employee fetch error:", err);
        setError(
          err.message || "Unable to load employee data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Convert selected database employee into profile data
  useEffect(() => {
    if (
      !selectedEmployeeId ||
      employees.length === 0
    ) {
      return;
    }

    const selected = employees.find(
      (emp) =>
        String(emp._id) === String(selectedEmployeeId)
    );

    if (!selected) {
      return;
    }

    setEmployee({
      name:
        selected.name ||
        selected.fullName ||
        `${selected.firstName || ""} ${
          selected.lastName || ""
        }`.trim() ||
        "—",

      id:
        selected.employeeId ||
        selected.empId ||
        selected._id ||
        "—",

      email:
        selected.email ||
        selected.emailAddress ||
        "—",

      phone:
        selected.phone ||
        selected.phoneNumber ||
        selected.mobile ||
        "—",

      department:
        selected.department ||
        selected.dept ||
        "—",

      role:
        selected.role ||
        selected.jobRole ||
        selected.position ||
        "—",

      location:
        selected.location ||
        selected.city ||
        "—",

      joiningDate:
        selected.joiningDate ||
        selected.dateOfJoining ||
        selected.joining_date ||
        "—",

      salary:
        selected.salary ||
        selected.annualSalary ||
        selected.ctc ||
        "—",

      experience:
        selected.experience ||
        selected.yearsOfExperience ||
        "—",

      rating:
        selected.rating ||
        selected.performanceRating ||
        "0",

      training:
        selected.training ||
        selected.trainingScore ||
        "0",

      status:
        selected.status ||
        selected.employmentStatus ||
        "Active",
    });

    setEditing(false);
  }, [selectedEmployeeId, employees]);

  const updateField = (field, value) => {
    setEmployee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const tabs = [
    "Personal Info",
    "Job Details",
    "Performance",
    "Training",
  ];

  // Loading
  if (loading) {
    return (
      <div className="ep-page">
        <header className="ep-header">
          <div>
            <span className="ep-eyebrow">
              SMART HR / EMPLOYEES
            </span>

            <h1>Employee Profile</h1>

            <p>
              Loading employee information...
            </p>
          </div>
        </header>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="ep-page">
        <header className="ep-header">
          <div>
            <span className="ep-eyebrow">
              SMART HR / EMPLOYEES
            </span>

            <h1>Employee Profile</h1>

            <p>
              {error}
            </p>
          </div>
        </header>
      </div>
    );
  }

  // No employee
  if (
    !employee ||
    employees.length === 0
  ) {
    return (
      <div className="ep-page">
        <header className="ep-header">
          <div>
            <span className="ep-eyebrow">
              SMART HR / EMPLOYEES
            </span>

            <h1>Employee Profile</h1>

            <p>
              No employees found.
            </p>
          </div>
        </header>

        <section className="ep-content">
          <h3>No Employee Available</h3>

          <p className="ep-note">
            Employees added by the HR Admin
            will appear here.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="ep-page">

      {/* HEADER */}
      <header className="ep-header">

        <div>
          <span className="ep-eyebrow">
            SMART HR / EMPLOYEES
          </span>

          <h1>Employee Profile</h1>

          <p>
            View and manage employee information.
          </p>
        </div>

        <button
          className="ep-edit-btn"
          onClick={() =>
            setEditing(!editing)
          }
        >
          {editing
            ? "Save Changes"
            : "Edit Profile"}
        </button>

      </header>

      {/* EMPLOYEE SELECTOR */}
      {employees.length > 1 && (
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >

          <label
            style={{
              fontWeight: "600",
              color: "#333",
            }}
          >
            Select Employee:
          </label>

          <select
            value={selectedEmployeeId}
            onChange={(e) =>
              setSelectedEmployeeId(
                e.target.value
              )
            }
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              minWidth: "250px",
            }}
          >

            {employees.map((emp) => {

              const id = emp._id;

              const name =
                emp.name ||
                emp.fullName ||
                `${emp.firstName || ""} ${
                  emp.lastName || ""
                }`.trim() ||
                "Employee";

              return (
                <option
                  key={id}
                  value={id}
                >
                  {name} —{" "}
                  {emp.employeeId ||
                    emp.empId ||
                    id}
                </option>
              );
            })}

          </select>

        </div>
      )}

      {/* PROFILE CARD */}
      <section className="ep-profile-card">

        <div className="ep-avatar">
          {employee.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()}
        </div>

        <div className="ep-identity">

          {editing ? (
            <input
              aria-label="Employee name"
              value={employee.name}
              onChange={(e) =>
                updateField(
                  "name",
                  e.target.value
                )
              }
            />
          ) : (
            <h2>
              {employee.name}
            </h2>
          )}

          <p>
            {employee.role} ·{" "}
            {employee.department}
          </p>

          <span className="ep-id">
            {employee.id}
          </span>

        </div>

        <span className="ep-status">
          <span />
          {employee.status}
        </span>

      </section>

      {/* TABS */}
      <nav className="ep-tabs">

        {tabs.map((tab) => (
          <button
            key={tab}
            className={
              activeTab === tab
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(tab)
            }
          >
            {tab}
          </button>
        ))}

      </nav>

      {/* CONTENT */}
      <section className="ep-content">

        {/* PERSONAL INFO */}
        {activeTab === "Personal Info" && (
          <>
            <h3>
              Personal Information
            </h3>

            <div className="ep-grid">

              <Field
                label="Employee ID"
                value={employee.id}
              />

              <Field
                label="Full Name"
                value={employee.name}
                editing={editing}
                onChange={(v) =>
                  updateField(
                    "name",
                    v
                  )
                }
              />

              <Field
                label="Email Address"
                value={employee.email}
                editing={editing}
                onChange={(v) =>
                  updateField(
                    "email",
                    v
                  )
                }
              />

              <Field
                label="Phone Number"
                value={employee.phone}
                editing={editing}
                onChange={(v) =>
                  updateField(
                    "phone",
                    v
                  )
                }
              />

              <Field
                label="Location"
                value={employee.location}
                editing={editing}
                onChange={(v) =>
                  updateField(
                    "location",
                    v
                  )
                }
              />

              <Field
                label="Joining Date"
                value={employee.joiningDate}
              />

            </div>
          </>
        )}

        {/* JOB DETAILS */}
        {activeTab === "Job Details" && (
          <>
            <h3>
              Job Details
            </h3>

            <div className="ep-grid">

              <Field
                label="Department"
                value={employee.department}
                editing={editing}
                onChange={(v) =>
                  updateField(
                    "department",
                    v
                  )
                }
              />

              <Field
                label="Job Role"
                value={employee.role}
                editing={editing}
                onChange={(v) =>
                  updateField(
                    "role",
                    v
                  )
                }
              />

              <Field
                label="Annual Salary (₹)"
                value={employee.salary}
                editing={editing}
                onChange={(v) =>
                  updateField(
                    "salary",
                    v
                  )
                }
              />

              <Field
                label="Experience"
                value={employee.experience}
              />

              <Field
                label="Employment Status"
                value={employee.status}
              />

              <Field
                label="Joining Date"
                value={employee.joiningDate}
              />

            </div>
          </>
        )}

        {/* PERFORMANCE */}
        {activeTab === "Performance" && (
          <>
            <h3>
              Performance Overview
            </h3>

            <div className="ep-stats">

              <div className="ep-stat">

                <span>
                  Performance Rating
                </span>

                <strong>
                  {employee.rating}/5
                </strong>

                <div className="ep-bar">
                  <span
                    style={{
                      width: `${
                        Number(
                          employee.rating
                        ) * 20
                      }%`,
                    }}
                  />
                </div>

              </div>

              <div className="ep-stat">

                <span>
                  Training Score
                </span>

                <strong>
                  {employee.training}%
                </strong>

                <div className="ep-bar">
                  <span
                    style={{
                      width: `${Number(
                        employee.training
                      )}%`,
                    }}
                  />
                </div>

              </div>

              <div className="ep-stat">

                <span>
                  Experience
                </span>

                <strong>
                  {employee.experience}
                </strong>

              </div>

            </div>

            <p className="ep-note">
              Performance data is fetched
              from the employee record
              when available.
            </p>

          </>
        )}

        {/* TRAINING */}
        {activeTab === "Training" && (
          <>
            <h3>
              Training & Development
            </h3>

            <div className="ep-training">

              <div>

                <span className="ep-training-icon">
                  01
                </span>

                <div>

                  <strong>
                    Employee Training Programme
                  </strong>

                  <p>
                    Overall training score
                  </p>

                </div>

              </div>

              <strong>
                {employee.training}%
              </strong>

            </div>

            <div className="ep-bar">

              <span
                style={{
                  width: `${Number(
                    employee.training
                  )}%`,
                }}
              />

            </div>

            <p className="ep-note">
              Training information is
              fetched from the employee
              record when available.
            </p>

          </>
        )}

      </section>

    </div>
  );
}

function Field({
  label,
  value,
  editing,
  onChange,
}) {
  return (
    <label className="ep-field">

      <span>
        {label}
      </span>

      {editing && onChange ? (
        <input
          value={value || ""}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
        />
      ) : (
        <strong>
          {value || "—"}
        </strong>
      )}

    </label>
  );
}