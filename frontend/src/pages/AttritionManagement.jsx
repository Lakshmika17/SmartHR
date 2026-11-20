
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  RefreshCw,
  Save,
} from "lucide-react";

import "./AttritionManagement.css";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const STATUSES = ["Under Review", "Action Taken", "Closed"];

function formatProbability(value) {
  if (value === null || value === undefined) return "N/A";
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(1)}%` : "N/A";
}

function getPredictionLabel(prediction) {
  if (prediction === null || prediction === undefined) return "N/A";

  if (typeof prediction !== "object") {
    return String(prediction);
  }

  const value =
    prediction.prediction ??
    prediction.attrition_prediction ??
    prediction.attrition ??
    prediction.result;

  return value === undefined
    ? "Prediction available"
    : String(value);
}

export default function AttritionManagement() {
  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("Under Review");
  const [retentionAction, setRetentionAction] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("smarthr_token");

      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [assessmentResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE}/api/attrition`, { headers }),
        fetch(`${API_BASE}/api/attrition/stats`, { headers }),
      ]);

      const assessmentData = await assessmentResponse.json();
      const statsData = await statsResponse.json();

      if (!assessmentResponse.ok) {
        throw new Error(
          assessmentData.message || "Unable to load assessments."
        );
      }

      if (!statsResponse.ok) {
        throw new Error(
          statsData.message || "Unable to load statistics."
        );
      }

      setAssessments(
        Array.isArray(assessmentData) ? assessmentData : []
      );
      setStats(statsData);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openReview(assessment) {
    setSelected(assessment);
    setStatus(
      STATUSES.includes(assessment.status)
        ? assessment.status
        : "Under Review"
    );
    setRetentionAction(assessment.retentionAction || "");
    setAdminRemarks(assessment.adminRemarks || "");
    setError("");
    setMessage("");
  }

  async function saveReview(event) {
    event.preventDefault();

    if (!selected || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("smarthr_token");

      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const response = await fetch(
        `${API_BASE}/api/attrition/${selected._id}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            retentionAction,
            adminRemarks,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save retention review."
        );
      }

      setSelected(null);
      await loadData();
      setMessage("Retention review updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update review.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="attrition-management">
      <div className="attrition-page-header">
        <div>
          <span className="attrition-eyebrow">
            WORKFORCE RETENTION
          </span>
          <h1>Attrition Management</h1>
          <p>
            Review employee attrition assessments and record
            appropriate retention actions.
          </p>
        </div>

        <button
          className="attrition-refresh"
          onClick={loadData}
          disabled={loading}
          type="button"
        >
          <RefreshCw size={17} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="attrition-alert" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="attrition-success" role="status">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <div className="attrition-stats">
        {[
          {
            label: "Total Assessments",
            value: stats?.total,
            icon: Activity,
          },
          {
            label: "High Risk",
            value: stats?.highRisk,
            icon: AlertTriangle,
          },
          {
            label: "Medium Risk",
            value: stats?.mediumRisk,
            icon: Activity,
          },
          {
            label: "Pending Reviews",
            value: stats?.pending,
            icon: Clock3,
          },
          {
            label: "Actions Taken",
            value: stats?.actionTaken,
            icon: CheckCircle2,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div className="attrition-stat-card" key={label}>
            <div className="attrition-stat-heading">
              <span>{label}</span>
              <Icon size={21} />
            </div>
            <strong>{value ?? "—"}</strong>
          </div>
        ))}
      </div>

      <section className="attrition-panel">
        <div className="attrition-panel-header">
          <div>
            <h2>Employee Assessments</h2>
            <p>Company-wide attrition assessment history</p>
          </div>
        </div>

        {loading ? (
          <p className="attrition-empty">Loading assessments...</p>
        ) : assessments.length === 0 ? (
          <p className="attrition-empty">
            No attrition assessments found.
            HR Staff must submit an assessment first.
          </p>
        ) : (
          <div className="attrition-table-scroll">
            <table className="attrition-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Prediction</th>
                  <th>Probability</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {assessments.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>
                        {item.employee?.name || "Unknown employee"}
                      </strong>
                    </td>
                    <td>
                      {item.employee?.department || "—"}
                    </td>
                    <td>
                      {getPredictionLabel(item.modelPrediction)}
                    </td>
                    <td>
                      {formatProbability(
                        item.attritionProbability
                      )}
                    </td>
                    <td>
                      <span
                        className={`attrition-pill risk-${(
                          item.riskLevel || "Unknown"
                        ).toLowerCase()}`}
                      >
                        {item.riskLevel || "Unknown"}
                      </span>
                    </td>
                    <td>
                      <span className="attrition-status">
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="attrition-review-button"
                        onClick={() => openReview(item)}
                      >
                        Review
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
        <section className="attrition-panel attrition-review-panel">
          <div className="attrition-panel-header">
            <div>
              <h2>Retention Review</h2>
              <p>
                Employee:{" "}
                <strong>
                  {selected.employee?.name || "Unknown employee"}
                </strong>
              </p>
            </div>

            <button
              type="button"
              className="attrition-close"
              onClick={() => setSelected(null)}
              disabled={saving}
            >
              Close
            </button>
          </div>

          <p>
            Estimated attrition probability:{" "}
            <strong>
              {formatProbability(
                selected.attritionProbability
              )}
            </strong>
          </p>

          <form onSubmit={saveReview} className="attrition-review-form">
            <label>
              Review Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                required
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Retention Action
              <textarea
                value={retentionAction}
                onChange={(event) =>
                  setRetentionAction(event.target.value)
                }
                maxLength={2000}
                rows={4}
                placeholder="Example: Schedule a confidential employee check-in and review workload."
              />
            </label>

            <label>
              Admin Remarks
              <textarea
                value={adminRemarks}
                onChange={(event) =>
                  setAdminRemarks(event.target.value)
                }
                maxLength={2000}
                rows={4}
                placeholder="Enter review notes..."
              />
            </label>

            <button
              className="attrition-save-button"
              type="submit"
              disabled={saving}
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Retention Review"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
