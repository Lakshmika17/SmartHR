
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  RefreshCw,
  Eye,
  X,
  History,
} from "lucide-react";

import "./AttritionHistory.css";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

function formatProbability(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(1)}%` : "N/A";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function getPrediction(prediction) {
  if (prediction == null) return "N/A";

  if (typeof prediction !== "object") {
    return String(prediction);
  }

  const value =
    prediction.prediction ??
    prediction.attrition_prediction ??
    prediction.attrition ??
    prediction.result;

  if (value === undefined || value === null) {
    return "Prediction available";
  }

  return typeof value === "object"
    ? JSON.stringify(value)
    : String(value);
}

export default function AttritionHistory() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [search, setSearch] = useState("");

  const loadAssessments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("smarthr_token");

      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const response = await fetch(`${API_BASE}/api/attrition`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load attrition history."
        );
      }

      setAssessments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load assessments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  const filtered = assessments.filter((item) => {
    const employeeName = item.employee?.name || "";
    const department = item.employee?.department || "";

    const matchesSearch =
      `${employeeName} ${department}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());

    return (
      matchesSearch &&
      (statusFilter === "All" || item.status === statusFilter) &&
      (riskFilter === "All" || item.riskLevel === riskFilter)
    );
  });

  const total = assessments.length;
  const highRisk = assessments.filter(
    (item) => item.riskLevel === "High"
  ).length;
  const pending = assessments.filter(
    (item) => item.status === "Pending"
  ).length;
  const reviewed = assessments.filter(
    (item) => item.status !== "Pending"
  ).length;

  return (
    <div className="staff-attrition-history">
      <header className="staff-history-header">
        <div>
          <span className="staff-history-eyebrow">
            WORKFORCE RETENTION
          </span>
          <h1>Attrition Assessment History</h1>
          <p>
            Track your submitted employee attrition assessments
            and HR Admin review updates.
          </p>
        </div>

        <button
          type="button"
          className="staff-history-refresh"
          onClick={loadAssessments}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div className="staff-history-error" role="alert">
          {error}
        </div>
      )}

      <section className="staff-history-stats">
        {[
          { label: "Total Submitted", value: total, icon: History },
          { label: "High Risk", value: highRisk, icon: AlertTriangle },
          { label: "Pending Review", value: pending, icon: Clock3 },
          { label: "Reviewed", value: reviewed, icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div className="staff-history-stat" key={label}>
            <div className="staff-history-stat-top">
              <span>{label}</span>
              <Icon size={20} />
            </div>
            <strong>{loading ? "—" : value}</strong>
          </div>
        ))}
      </section>

      <section className="staff-history-panel">
        <div className="staff-history-panel-header">
          <div>
            <h2>My Submitted Assessments</h2>
            <p>Assessments submitted using your HR Staff account</p>
          </div>
        </div>

        <div className="staff-history-filters">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search employee or department"
            aria-label="Search assessments"
          />

          <select
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value)}
            aria-label="Filter by risk"
          >
            {["All", "High", "Medium", "Low", "Unknown"].map(
              (risk) => (
                <option key={risk} value={risk}>
                  {risk === "All" ? "All risk levels" : risk}
                </option>
              )
            )}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by review status"
          >
            {[
              "All",
              "Pending",
              "Under Review",
              "Action Taken",
              "Closed",
            ].map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All statuses" : status}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="staff-history-empty">Loading history...</p>
        ) : filtered.length === 0 ? (
          <p className="staff-history-empty">
            {total === 0
              ? "No attrition assessments submitted yet."
              : "No assessments match your filters."}
          </p>
        ) : (
          <div className="staff-history-table-scroll">
            <table className="staff-history-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Prediction</th>
                  <th>Probability</th>
                  <th>Risk</th>
                  <th>Review Status</th>
                  <th>Submitted</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>
                        {item.employee?.name || "Unknown employee"}
                      </strong>
                    </td>
                    <td>{item.employee?.department || "—"}</td>
                    <td>{getPrediction(item.modelPrediction)}</td>
                    <td>
                      {formatProbability(item.attritionProbability)}
                    </td>
                    <td>
                      <span
                        className={`staff-risk risk-${(
                          item.riskLevel || "Unknown"
                        ).toLowerCase()}`}
                      >
                        {item.riskLevel || "Unknown"}
                      </span>
                    </td>
                    <td>
                      <span className="staff-review-status">
                        {item.status || "Pending"}
                      </span>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="staff-history-view"
                        onClick={() => setSelected(item)}
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <section className="staff-history-panel staff-history-details">
          <div className="staff-history-panel-header">
            <div>
              <h2>Assessment Details</h2>
              <p>
                {selected.employee?.name || "Unknown employee"}
              </p>
            </div>

            <button
              type="button"
              className="staff-history-refresh"
              onClick={() => setSelected(null)}
            >
              <X size={17} />
              Close
            </button>
          </div>

          <div className="staff-history-detail-grid">
            <div>
              <span>Attrition Risk</span>
              <strong>{selected.riskLevel || "Unknown"}</strong>
            </div>
            <div>
              <span>Probability</span>
              <strong>
                {formatProbability(selected.attritionProbability)}
              </strong>
            </div>
            <div>
              <span>Review Status</span>
              <strong>{selected.status || "Pending"}</strong>
            </div>
            <div>
              <span>Reviewed On</span>
              <strong>{formatDate(selected.reviewedAt)}</strong>
            </div>
          </div>

          <div className="staff-history-note">
            <h3>Retention Action</h3>
            <p>
              {selected.retentionAction ||
                "No retention action has been recorded yet."}
            </p>
          </div>

          <div className="staff-history-note">
            <h3>HR Admin Remarks</h3>
            <p>
              {selected.adminRemarks ||
                "No admin remarks have been added yet."}
            </p>
          </div>

          <p className="staff-history-disclaimer">
            <Activity size={16} />
            ML predictions are decision-support estimates,
            not confirmed employee resignation outcomes.
          </p>
        </section>
      )}
    </div>
  );
}
