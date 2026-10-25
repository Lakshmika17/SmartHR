
import { useEffect, useMemo, useState } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
} from "../services/employeeService";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  UserX,
  Users,
  X,
  BriefcaseBusiness,
  Building2,
  Filter,
} from "lucide-react";
import "./EmployeeManagement.css";

const emptyForm = {
  name: "",
  email: "",
  department: "Technology",
  role: "",
  experience: "0",
  rating: "3",
  training: "70",
};

const departments = [
  "Technology",
  "HR",
  "Finance",
  "Sales",
  "Operations",
  "Research & Development",
];

function normalizeEmployee(employee) {
  return {
    ...employee,
    id: String(employee._id || employee.id),
    name: employee.name || "",
    email: employee.email || "",
    department: employee.department || "Technology",
    role: employee.role || "",
    experience: Number(employee.experience ?? 0),
    rating: Number(employee.rating ?? 3),
    training: Number(employee.training ?? 70),
    status: employee.status || "Active",
  };
}

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function loadEmployees() {
    try {
      setLoading(true);
      setApiError("");

      const response = await getEmployees();
      const records = Array.isArray(response)
        ? response
        : response.employees;

      if (!Array.isArray(records)) {
        throw new Error("The server returned an unexpected employee list.");
      }

      setEmployees(records.map(normalizeEmployee));
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load employees. Please sign in again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  let ignore = false;

  async function fetchEmployees() {
    try {
      setLoading(true);
      setApiError("");

      const response = await getEmployees();
      const records = Array.isArray(response)
        ? response
        : response.employees;

      if (!Array.isArray(records)) {
        throw new Error("Invalid employee data received.");
      }

      if (!ignore) {
        setEmployees(records.map(normalizeEmployee));
      }
    } catch (err) {
      if (!ignore) {
        setApiError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load employees."
        );
      }
    } finally {
      if (!ignore) {
        setLoading(false);
      }
    }
  }

  fetchEmployees();

  return () => {
    ignore = true;
  };
}, []);

  const filteredEmployees = useMemo(() => {
    const query = search.toLowerCase().trim();

    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query) ||
        employee.id.toLowerCase().includes(query);

      const matchesDepartment =
        department === "All" || employee.department === department;

      const matchesStatus =
        status === "All" || employee.status === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, search, department, status]);

  const activeCount = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const departmentCount = new Set(
    employees.map((employee) => employee.department)
  ).size;

  function openAdd() {
    setSelected(null);
    setForm({ ...emptyForm });
    setError("");
    setApiError("");
    setModal("add");
  }

  function openEdit(employee) {
    setSelected(employee);
    setForm({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      role: employee.role,
      experience: String(employee.experience),
      rating: String(employee.rating),
      training: String(employee.training),
    });
    setError("");
    setApiError("");
    setModal("edit");
  }

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  async function saveEmployee(event) {
    event.preventDefault();
    setError("");
    setApiError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const role = form.role.trim();
    const experience = Number(form.experience);
    const rating = Number(form.rating);
    const training = Number(form.training);

    if (!name || !email || !role) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (
      !Number.isFinite(experience) ||
      experience < 0 ||
      experience > 50
    ) {
      setError("Experience must be between 0 and 50 years.");
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    if (
      !Number.isFinite(training) ||
      training < 0 ||
      training > 100
    ) {
      setError("Training score must be between 0 and 100.");
      return;
    }

    const duplicate = employees.some(
      (employee) =>
        employee.email.toLowerCase() === email &&
        employee.id !== selected?.id
    );

    if (duplicate) {
      setError("An employee with this email already exists.");
      return;
    }

    const employeeData = {
      name,
      email,
      department: form.department,
      role,
      experience,
      rating,
      training,
    };

    try {
      setSaving(true);

      if (modal === "edit") {
        const response = await updateEmployee(
          selected.id,
          employeeData
        );

        const updated = response.employee || response;

        setEmployees((current) =>
          current.map((employee) =>
            employee.id === selected.id
              ? normalizeEmployee(updated)
              : employee
          )
        );
      } else {
        const response = await createEmployee(employeeData);
        const created = response.employee || response;

        setEmployees((current) => [
          normalizeEmployee(created),
          ...current,
        ]);
      }

      setModal(null);
      setSelected(null);
      setForm({ ...emptyForm });
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the employee. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(employee) {
    const nextStatus =
      employee.status === "Active" ? "Inactive" : "Active";

    const confirmed = window.confirm(
      `${nextStatus === "Inactive" ? "Deactivate" : "Reactivate"} ${employee.name}?`
    );

    if (!confirmed) return;

    setApiError("");

    try {
      const response = await updateEmployeeStatus(
        employee.id,
        nextStatus
      );

      const updated = response.employee || response;

      setEmployees((current) =>
        current.map((item) =>
          item.id === employee.id
            ? normalizeEmployee(updated)
            : item
        )
      );

      if (selected?.id === employee.id) {
        setSelected(normalizeEmployee(updated));
      }
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          "Unable to update employee status."
      );
    }
  }

  return (
    <div className="employee-page">
      <div className="employee-heading">
        <div>
          <span className="employee-eyebrow">PEOPLE OPERATIONS</span>
          <h1>Employee Management</h1>
          <p>
            Manage employee records, roles and workforce information.
          </p>
        </div>

        <button
          className="employee-primary-btn"
          onClick={openAdd}
          disabled={loading || saving}
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {apiError && (
        <div className="employee-form-error" role="alert">
          {apiError}
          <button
            type="button"
            onClick={loadEmployees}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}

      <div className="employee-stats">
        <div className="employee-stat-card">
          <span className="employee-stat-icon purple">
            <Users size={21} />
          </span>
          <div>
            <p>Total Employees</p>
            <h2>{employees.length}</h2>
          </div>
        </div>

        <div className="employee-stat-card">
          <span className="employee-stat-icon green">
            <BriefcaseBusiness size={21} />
          </span>
          <div>
            <p>Active Employees</p>
            <h2>{activeCount}</h2>
          </div>
        </div>

        <div className="employee-stat-card">
          <span className="employee-stat-icon blue">
            <Building2 size={21} />
          </span>
          <div>
            <p>Departments</p>
            <h2>{departmentCount}</h2>
          </div>
        </div>
      </div>

      <section className="employee-table-card">
        <div className="employee-table-heading">
          <div>
            <h2>Employee Directory</h2>
            <p>Search, review and manage employee records.</p>
          </div>
          <span className="employee-count">
            {filteredEmployees.length} records
          </span>
        </div>

        <div className="employee-toolbar">
          <div className="employee-search">
            <Search size={19} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, role or ID..."
            />
            {search && (
              <button
                type="button"
                className="employee-clear-btn"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="employee-filter">
            <Filter size={17} />
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              aria-label="Filter by department"
            >
              <option value="All">All Departments</option>
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <select
            className="employee-status-filter"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="employee-table-wrap">
          <table className="employee-table">
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>DEPARTMENT / ROLE</th>
                <th>EXPERIENCE</th>
                <th>RATING</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="employee-empty">
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="employee-empty">
                    {employees.length === 0
                      ? "No employees have been added yet. Select Add Employee to create the first record."
                      : "No employees match your search or filters."}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="employee-identity">
                        <span className="employee-avatar">
                          {employee.name
                            .split(" ")
                            .filter(Boolean)
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                        <div>
                          <strong>{employee.name}</strong>
                          <span>{employee.email}</span>
                          <small>ID: {employee.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong className="employee-department">
                        {employee.department}
                      </strong>
                      <span className="employee-role">
                        {employee.role}
                      </span>
                    </td>

                    <td>{employee.experience} years</td>

                    <td>
                      <span className="employee-rating">
                        ★ {employee.rating}/5
                      </span>
                    </td>

                    <td>
                      <span
                        className={`employee-status ${employee.status.toLowerCase()}`}
                      >
                        {employee.status}
                      </span>
                    </td>

                    <td>
                      <div className="employee-actions">
                        <button
                          type="button"
                          title="View employee"
                          aria-label={`View ${employee.name}`}
                          onClick={() => {
                            setSelected(employee);
                            setModal("view");
                          }}
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          title="Edit employee"
                          aria-label={`Edit ${employee.name}`}
                          onClick={() => openEdit(employee)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          title={
                            employee.status === "Active"
                              ? "Deactivate employee"
                              : "Reactivate employee"
                          }
                          aria-label={`Change status for ${employee.name}`}
                          onClick={() => toggleStatus(employee)}
                        >
                          <UserX size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="employee-table-footer">
          Showing {filteredEmployees.length} of {employees.length} employee
          records
        </div>
      </section>

      {(modal === "add" || modal === "edit") && (
        <div
          className="employee-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              setModal(null);
            }
          }}
        >
          <section
            className="employee-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-modal-title"
          >
            <div className="employee-modal-header">
              <div>
                <span className="employee-eyebrow">EMPLOYEE RECORD</span>
                <h2 id="employee-modal-title">
                  {modal === "add" ? "Add Employee" : "Edit Employee"}
                </h2>
              </div>
              <button
                type="button"
                className="employee-modal-close"
                onClick={() => setModal(null)}
                aria-label="Close form"
                disabled={saving}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={saveEmployee}>
              <div className="employee-form-grid">
                <label>
                  Full Name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateForm}
                    placeholder="Enter full name"
                    maxLength={100}
                    required
                    disabled={saving}
                  />
                </label>

                <label>
                  Email Address *
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateForm}
                    placeholder="name@company.com"
                    required
                    disabled={saving}
                  />
                </label>

                <label>
                  Department *
                  <select
                    name="department"
                    value={form.department}
                    onChange={updateForm}
                    disabled={saving}
                  >
                    {departments.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Job Role *
                  <input
                    name="role"
                    value={form.role}
                    onChange={updateForm}
                    placeholder="Enter job role"
                    required
                    disabled={saving}
                  />
                </label>

                <label>
                  Years of Experience
                  <input
                    name="experience"
                    type="number"
                    min="0"
                    max="50"
                    value={form.experience}
                    onChange={updateForm}
                    required
                    disabled={saving}
                  />
                </label>

                <label>
                  Previous Year Rating
                  <select
                    name="rating"
                    value={form.rating}
                    onChange={updateForm}
                    disabled={saving}
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value} / 5
                      </option>
                    ))}
                  </select>
                </label>

                <label className="employee-full-width">
                  Average Training Score
                  <input
                    name="training"
                    type="number"
                    min="0"
                    max="100"
                    value={form.training}
                    onChange={updateForm}
                    required
                    disabled={saving}
                  />
                </label>
              </div>

              {error && (
                <p className="employee-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="employee-modal-actions">
                <button
                  type="button"
                  className="employee-secondary-btn"
                  onClick={() => setModal(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="employee-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : modal === "add"
                      ? "Save Employee"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modal === "view" && selected && (
        <div
          className="employee-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModal(null);
            }
          }}
        >
          <section
            className="employee-modal employee-view-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-view-title"
          >
            <div className="employee-modal-header">
              <div>
                <span className="employee-eyebrow">
                  EMPLOYEE PROFILE
                </span>
                <h2 id="employee-view-title">{selected.name}</h2>
                <p>{selected.email}</p>
              </div>
              <button
                type="button"
                className="employee-modal-close"
                onClick={() => setModal(null)}
                aria-label="Close profile"
              >
                <X size={21} />
              </button>
            </div>

            <div className="employee-profile-details">
              <div>
                <span>Employee ID</span>
                <strong>{selected.id}</strong>
              </div>
              <div>
                <span>Department</span>
                <strong>{selected.department}</strong>
              </div>
              <div>
                <span>Job Role</span>
                <strong>{selected.role}</strong>
              </div>
              <div>
                <span>Experience</span>
                <strong>{selected.experience} years</strong>
              </div>
              <div>
                <span>Previous Rating</span>
                <strong>{selected.rating}/5</strong>
              </div>
              <div>
                <span>Training Score</span>
                <strong>{selected.training}/100</strong>
              </div>
              <div>
                <span>Employment Status</span>
                <strong>{selected.status}</strong>
              </div>
            </div>

            <div className="employee-modal-actions">
              <button
                type="button"
                className="employee-secondary-btn"
                onClick={() => setModal(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="employee-primary-btn"
                onClick={() => openEdit(selected)}
              >
                <Pencil size={16} /> Edit Employee
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default EmployeeManagement;
