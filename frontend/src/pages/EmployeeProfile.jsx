
import React, { useState } from "react";
import "./EmployeeProfile.css";

export default function EmployeeProfile() {
  const [activeTab, setActiveTab] = useState("Personal Info");
  const [editing, setEditing] = useState(false);

  const [employee, setEmployee] = useState({
    name: "Priya Sharma",
    id: "EMP001",
    email: "priya.sharma@company.com",
    phone: "+91 9876543210",
    department: "Sales",
    role: "Sales Executive",
    location: "Mumbai",
    joiningDate: "10 Jan 2022",
    salary: "650000",
    experience: "4 Years",
    rating: "4",
    training: "85",
    status: "Active",
  });

  const updateField = (field, value) => {
    setEmployee((prev) => ({ ...prev, [field]: value }));
  };

  const tabs = [
    "Personal Info",
    "Job Details",
    "Performance",
    "Training",
  ];

  return (
    <div className="ep-page">
      <header className="ep-header">
        <div>
          <span className="ep-eyebrow">SMART HR / EMPLOYEES</span>
          <h1>Employee Profile</h1>
          <p>View and manage employee information.</p>
        </div>
        <button
          className="ep-edit-btn"
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Save Changes" : "Edit Profile"}
        </button>
      </header>

      <section className="ep-profile-card">
        <div className="ep-avatar">
          {employee.name.split(" ").map((part) => part[0]).join("")}
        </div>

        <div className="ep-identity">
          {editing ? (
            <input
              aria-label="Employee name"
              value={employee.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          ) : (
            <h2>{employee.name}</h2>
          )}
          <p>{employee.role} · {employee.department}</p>
          <span className="ep-id">{employee.id}</span>
        </div>

        <span className="ep-status">
          <span /> {employee.status}
        </span>
      </section>

      <nav className="ep-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="ep-content">
        {activeTab === "Personal Info" && (
          <>
            <h3>Personal Information</h3>
            <div className="ep-grid">
              <Field label="Employee ID" value={employee.id} />
              <Field label="Full Name" value={employee.name}
                editing={editing} onChange={(v) => updateField("name", v)} />
              <Field label="Email Address" value={employee.email}
                editing={editing} onChange={(v) => updateField("email", v)} />
              <Field label="Phone Number" value={employee.phone}
                editing={editing} onChange={(v) => updateField("phone", v)} />
              <Field label="Location" value={employee.location}
                editing={editing} onChange={(v) => updateField("location", v)} />
              <Field label="Joining Date" value={employee.joiningDate} />
            </div>
          </>
        )}

        {activeTab === "Job Details" && (
          <>
            <h3>Job Details</h3>
            <div className="ep-grid">
              <Field label="Department" value={employee.department}
                editing={editing} onChange={(v) => updateField("department", v)} />
              <Field label="Job Role" value={employee.role}
                editing={editing} onChange={(v) => updateField("role", v)} />
              <Field label="Annual Salary (₹)" value={employee.salary}
                editing={editing} onChange={(v) => updateField("salary", v)} />
              <Field label="Experience" value={employee.experience} />
              <Field label="Employment Status" value={employee.status} />
              <Field label="Joining Date" value={employee.joiningDate} />
            </div>
          </>
        )}

        {activeTab === "Performance" && (
          <>
            <h3>Performance Overview</h3>
            <div className="ep-stats">
              <div className="ep-stat">
                <span>Performance Rating</span>
                <strong>{employee.rating}/5</strong>
                <div className="ep-bar"><span style={{ width: `${Number(employee.rating) * 20}%` }} /></div>
              </div>
              <div className="ep-stat">
                <span>Training Score</span>
                <strong>{employee.training}%</strong>
                <div className="ep-bar"><span style={{ width: `${Number(employee.training)}%` }} /></div>
              </div>
              <div className="ep-stat">
                <span>Experience</span>
                <strong>{employee.experience}</strong>
              </div>
            </div>
            <p className="ep-note">
              These are sample values for the UI. Actual performance data
              will be connected later.
            </p>
          </>
        )}

        {activeTab === "Training" && (
          <>
            <h3>Training & Development</h3>
            <div className="ep-training">
              <div>
                <span className="ep-training-icon">01</span>
                <div>
                  <strong>Employee Training Programme</strong>
                  <p>Overall training score</p>
                </div>
              </div>
              <strong>{employee.training}%</strong>
            </div>
            <div className="ep-bar">
              <span style={{ width: `${Number(employee.training)}%` }} />
            </div>
            <p className="ep-note">
              Training information is currently sample data.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

function Field({ label, value, editing, onChange }) {
  return (
    <label className="ep-field">
      <span>{label}</span>
      {editing && onChange ? (
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <strong>{value || "—"}</strong>
      )}
    </label>
  );
}
