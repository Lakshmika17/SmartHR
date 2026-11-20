
import { useCallback, useEffect, useState } from "react";
import {
  Building2, Users, Network, Pencil, Plus,
  Save, X, RefreshCw, CheckCircle2, AlertCircle
} from "lucide-react";
import "./CompanyManagement.css";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/api\/?$/, "").replace(/\/$/, "");

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("smarthr_token");

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export default function CompanyManagement() {
  const [company, setCompany] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingCompany, setEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    industry: "",
  });

  const [newDepartment, setNewDepartment] = useState("");
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const [departmentName, setDepartmentName] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [companyData, departmentData] = await Promise.all([
        apiRequest("/api/company"),
        apiRequest("/api/departments"),
      ]);

      const currentCompany = companyData.company;
      const departmentList = departmentData.departments || [];

      setCompany(currentCompany);
      setDepartments(departmentList);
      setCompanyForm({
        name: currentCompany.name || "",
        industry: currentCompany.industry || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveCompany(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = await apiRequest("/api/company", {
        method: "PUT",
        body: JSON.stringify(companyForm),
      });

      setCompany(data.company);
      setEditingCompany(false);
      setSuccess("Company details updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function addDepartment(e) {
    e.preventDefault();

    if (!newDepartment.trim()) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await apiRequest("/api/departments", {
        method: "POST",
        body: JSON.stringify({
          name: newDepartment.trim(),
        }),
      });

      setNewDepartment("");
      setSuccess("Department added successfully.");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateDepartment(id) {
    if (!departmentName.trim()) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await apiRequest(`/api/departments/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: departmentName.trim(),
        }),
      });

      setEditingDepartmentId(null);
      setSuccess("Department updated successfully.");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleDepartment(department) {
    const nextStatus = !department.isActive;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await apiRequest(
        `/api/departments/${department._id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            isActive: nextStatus,
          }),
        }
      );

      setSuccess(
        `Department ${nextStatus ? "activated" : "deactivated"} successfully.`
      );
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const totalEmployees = departments.reduce(
    (total, department) =>
      total + (Number(department.employeeCount) || 0),
    0
  );

  if (loading && !company) {
    return (
      <div className="cm-loading">
        <RefreshCw className="cm-spin" size={24} />
        <p>Loading company information...</p>
      </div>
    );
  }

  return (
    <div className="cm-page">
      <div className="cm-header">
        <div>
          <span className="cm-eyebrow">ADMIN WORKSPACE</span>
          <h1>Company Management</h1>
          <p>Manage your company profile and departments.</p>
        </div>

        <button
          className="cm-btn cm-btn-outline"
          onClick={loadData}
          disabled={loading || saving}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="cm-alert cm-alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="cm-alert cm-alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {company && (
        <>
          <div className="cm-stats">
            <div className="cm-stat-card">
              <div className="cm-stat-icon">
                <Building2 size={23} />
              </div>
              <div>
                <span>Company</span>
                <strong>{company.name}</strong>
              </div>
            </div>

            <div className="cm-stat-card">
              <div className="cm-stat-icon">
                <Network size={23} />
              </div>
              <div>
                <span>Total Departments</span>
                <strong>{departments.length}</strong>
              </div>
            </div>

            <div className="cm-stat-card">
              <div className="cm-stat-icon">
                <Users size={23} />
              </div>
              <div>
                <span>Employees in Departments</span>
                <strong>{totalEmployees}</strong>
              </div>
            </div>
          </div>

          <section className="cm-card">
            <div className="cm-section-header">
              <div>
                <h2>Company Profile</h2>
                <p>Registered company information</p>
              </div>

              {!editingCompany && (
                <button
                  className="cm-btn cm-btn-primary"
                  onClick={() => setEditingCompany(true)}
                >
                  <Pencil size={16} />
                  Edit Company
                </button>
              )}
            </div>

            {editingCompany ? (
              <form onSubmit={saveCompany} className="cm-form">
                <div className="cm-form-grid">
                  <label>
                    Company Name
                    <input
                      value={companyForm.name}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Industry
                    <input
                      value={companyForm.industry}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          industry: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                </div>

                <div className="cm-actions">
                  <button
                    type="submit"
                    className="cm-btn cm-btn-primary"
                    disabled={saving}
                  >
                    <Save size={16} />
                    Save Changes
                  </button>

                  <button
                    type="button"
                    className="cm-btn cm-btn-outline"
                    onClick={() => {
                      setEditingCompany(false);
                      setCompanyForm({
                        name: company.name,
                        industry: company.industry,
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="cm-profile-grid">
                <div>
                  <span>Company Name</span>
                  <strong>{company.name}</strong>
                </div>
                <div>
                  <span>Company Code</span>
                  <strong>{company.companyCode}</strong>
                </div>
                <div>
                  <span>Industry</span>
                  <strong>{company.industry}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>
                    {company.isActive ? "Active" : "Inactive"}
                  </strong>
                </div>
                <div>
                  <span>Registration Date</span>
                  <strong>
                    {company.createdAt
                      ? new Date(company.createdAt).toLocaleDateString()
                      : "—"}
                  </strong>
                </div>
              </div>
            )}
          </section>

          <section className="cm-card">
            <div className="cm-section-header">
              <div>
                <h2>Department Management</h2>
                <p>Create and manage company departments</p>
              </div>
            </div>

            <form
              onSubmit={addDepartment}
              className="cm-add-department"
            >
              <input
                placeholder="Enter new department name"
                value={newDepartment}
                onChange={(e) =>
                  setNewDepartment(e.target.value)
                }
                maxLength={100}
                required
              />

              <button
                type="submit"
                className="cm-btn cm-btn-primary"
                disabled={saving}
              >
                <Plus size={17} />
                Add Department
              </button>
            </form>

            <div className="cm-table-wrap">
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Employees</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="cm-empty">
                        No departments added yet.
                      </td>
                    </tr>
                  ) : (
                    departments.map((department) => (
                      <tr key={department._id}>
                        <td>
                          {editingDepartmentId === department._id ? (
                            <input
                              className="cm-edit-input"
                              value={departmentName}
                              onChange={(e) =>
                                setDepartmentName(e.target.value)
                              }
                              maxLength={100}
                            />
                          ) : (
                            <strong>{department.name}</strong>
                          )}
                        </td>

                        <td>{department.employeeCount ?? "—"}</td>

                        <td>
                          <span
                            className={`cm-status ${
                              department.isActive
                                ? "cm-active"
                                : "cm-inactive"
                            }`}
                          >
                            {department.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <div className="cm-row-actions">
                            {editingDepartmentId === department._id ? (
                              <>
                                <button
                                  className="cm-icon-btn"
                                  onClick={() =>
                                    updateDepartment(department._id)
                                  }
                                  disabled={saving}
                                  title="Save"
                                >
                                  <Save size={17} />
                                </button>

                                <button
                                  className="cm-icon-btn"
                                  onClick={() =>
                                    setEditingDepartmentId(null)
                                  }
                                  title="Cancel"
                                >
                                  <X size={17} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="cm-icon-btn"
                                  onClick={() => {
                                    setEditingDepartmentId(
                                      department._id
                                    );
                                    setDepartmentName(department.name);
                                  }}
                                  title="Edit department"
                                >
                                  <Pencil size={17} />
                                </button>

                                <button
                                  className="cm-btn cm-btn-outline cm-small"
                                  onClick={() =>
                                    toggleDepartment(department)
                                  }
                                  disabled={saving}
                                >
                                  {department.isActive
                                    ? "Deactivate"
                                    : "Activate"}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
