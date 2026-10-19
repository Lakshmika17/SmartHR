
import { useMemo, useState } from "react";
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

const initialEmployees = [
  {
    id: 1001,
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    department: "Technology",
    role: "Software Engineer",
    experience: 4,
    rating: 4,
    training: 82,
    status: "Active",
  },
  {
    id: 1002,
    name: "Ananya Patel",
    email: "ananya.patel@example.com",
    department: "HR",
    role: "HR Executive",
    experience: 3,
    rating: 5,
    training: 91,
    status: "Active",
  },
  {
    id: 1003,
    name: "Rohan Mehta",
    email: "rohan.mehta@example.com",
    department: "Finance",
    role: "Financial Analyst",
    experience: 6,
    rating: 3,
    training: 74,
    status: "Active",
  },
  {
    id: 1004,
    name: "Priya Nair",
    email: "priya.nair@example.com",
    department: "Sales",
    role: "Sales Executive",
    experience: 2,
    rating: 4,
    training: 88,
    status: "Inactive",
  },
  {
    id: 1005,
    name: "Ishaan Verma",
    email: "ishaan.verma@example.com",
    department: "Technology",
    role: "Data Analyst",
    experience: 5,
    rating: 4,
    training: 85,
    status: "Active",
  },
];

const emptyForm = {
  name: "",
  email: "",
  department: "Technology",
  role: "",
  experience: "0",
  rating: "3",
  training: "70",
};

function EmployeeManagement() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const departments = [
    "Technology",
    "HR",
    "Finance",
    "Sales",
    "Operations",
    "Research & Development",
  ];

  const filteredEmployees = useMemo(() => {
    const query = search.toLowerCase().trim();

    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query) ||
        String(employee.id).includes(query);

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

  function openAdd() {
    setSelected(null);
    setForm(emptyForm);
    setError("");
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
    setModal("edit");
  }

  function saveEmployee(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.role.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    const duplicate = employees.some(
      (employee) =>
        employee.email.toLowerCase() === form.email.toLowerCase() &&
        employee.id !== selected?.id
    );

    if (duplicate) {
      setError("An employee with this email already exists.");
      return;
    }

    const employeeData = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
      experience: Number(form.experience),
      rating: Number(form.rating),
      training: Number(form.training),
    };

    if (modal === "edit") {
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === selected.id
            ? { ...employee, ...employeeData }
            : employee
        )
      );
    } else {
      const newEmployee = {
        id: Date.now(),
        ...employeeData,
        status: "Active",
      };

      setEmployees((current) => [newEmployee, ...current]);
    }

    setModal(null);
    setError("");
  }

  function toggleStatus(employee) {
    const nextStatus =
      employee.status === "Active" ? "Inactive" : "Active";

    const confirmed = window.confirm(
      `${nextStatus === "Inactive" ? "Deactivate" : "Reactivate"} ${employee.name}?`
    );

    if (!confirmed) return;

    setEmployees((current) =>
      current.map((item) =>
        item.id === employee.id
          ? { ...item, status: nextStatus }
          : item
      )
    );
  }

  function updateForm(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  return (
    <div className="employee-page">
      <div className="employee-heading">
        <div>
          <span className="employee-eyebrow">PEOPLE OPERATIONS</span>
          <h1>Employee Management</h1>
          <p>Manage employee records, roles and workforce information.</p>
        </div>

        <button className="employee-primary-btn" onClick={openAdd}>
          <Plus size={18} />
          Add Employee
        </button>
      </div>

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
            <h2>
              {new Set(employees.map((employee) => employee.department)).size}
            </h2>
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
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-identity">
                      <span className="employee-avatar">
                        {employee.name
                          .split(" ")
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
                    <span className="employee-role">{employee.role}</span>
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
                        title="Edit employee"
                        aria-label={`Edit ${employee.name}`}
                        onClick={() => openEdit(employee)}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
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
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="6" className="employee-empty">
                    No employees match your search or filters.
                  </td>
                </tr>
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
            if (event.target === event.currentTarget) setModal(null);
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
                className="employee-modal-close"
                onClick={() => setModal(null)}
                aria-label="Close form"
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
                    required
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
                  />
                </label>

                <label>
                  Department *
                  <select
                    name="department"
                    value={form.department}
                    onChange={updateForm}
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
                  />
                </label>

                <label>
                  Previous Year Rating
                  <select
                    name="rating"
                    value={form.rating}
                    onChange={updateForm}
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
                  />
                </label>
              </div>

              {error && <p className="employee-form-error">{error}</p>}

              <div className="employee-modal-actions">
                <button
                  type="button"
                  className="employee-secondary-btn"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="employee-primary-btn">
                  {modal === "add" ? "Save Employee" : "Save Changes"}
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
            if (event.target === event.currentTarget) setModal(null);
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
                <span className="employee-eyebrow">EMPLOYEE PROFILE</span>
                <h2 id="employee-view-title">{selected.name}</h2>
                <p>{selected.email}</p>
              </div>
              <button
                className="employee-modal-close"
                onClick={() => setModal(null)}
                aria-label="Close profile"
              >
                <X size={21} />
              </button>
            </div>

            <div className="employee-profile-details">
              <div><span>Employee ID</span><strong>{selected.id}</strong></div>
              <div><span>Department</span><strong>{selected.department}</strong></div>
              <div><span>Job Role</span><strong>{selected.role}</strong></div>
              <div><span>Experience</span><strong>{selected.experience} years</strong></div>
              <div><span>Previous Rating</span><strong>{selected.rating}/5</strong></div>
              <div><span>Training Score</span><strong>{selected.training}/100</strong></div>
              <div><span>Employment Status</span><strong>{selected.status}</strong></div>
            </div>

            <div className="employee-modal-actions">
              <button
                className="employee-secondary-btn"
                onClick={() => setModal(null)}
              >
                Close
              </button>
              <button
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
