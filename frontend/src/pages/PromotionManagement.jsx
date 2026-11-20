import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock3, RefreshCw, TrendingUp } from "lucide-react";
import "./PromotionManagement.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/$/, "")
  .replace(/\/api$/, "");

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("smarthr_token");
  const response = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token || ""}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

function displayDate(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function PromotionManagement() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [requestData, statsData] = await Promise.all([
        apiRequest("/promotions"),
        apiRequest("/promotions/stats"),
      ]);
      setRequests(requestData.requests || []);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const visibleRequests = requests.filter((request) =>
    filter === "All" || request.status === filter
  );

  async function review(status) {
    if (!selected || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await apiRequest(`/promotions/${selected._id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminRemarks: remarks.trim() }),
      });
      setSelected(null);
      setRemarks("");
      setMessage(`Promotion request ${status.toLowerCase()} successfully.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="pm-page">
      <div className="pm-heading">
        <div>
          <span className="pm-eyebrow">HR ADMIN WORKSPACE</span>
          <h1>Promotion Management</h1>
          <p>Review ML-assisted requests submitted by HR Staff. The final decision is yours.</p>
        </div>
        <button type="button" className="pm-refresh" onClick={loadData} disabled={loading}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <div className="pm-stats">
        {[
          { label: "Total requests", value: stats?.total, icon: TrendingUp },
          { label: "Pending", value: stats?.pending, icon: Clock3 },
          { label: "Approved", value: stats?.approved, icon: CheckCircle2 },
          { label: "Rejected", value: stats?.rejected, icon: XCircle },
        ].map(({ label, value, icon: Icon }) => (
          <div className="pm-stat" key={label}>
            <div className="pm-stat-top"><span>{label}</span><Icon size={20} /></div>
            <strong>{value ?? "—"}</strong>
          </div>
        ))}
      </div>

      {error && <p className="pm-alert pm-error" role="alert">{error}</p>}
      {message && <p className="pm-alert pm-success" role="status">{message}</p>}

      <div className="pm-panel">
        <div className="pm-panel-heading">
          <h2>Promotion requests</h2>
          <label>Show <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            {["Pending", "Approved", "Rejected", "All"].map((value) => (
              <option value={value} key={value}>{value}</option>
            ))}
          </select></label>
        </div>
        {loading ? (
          <p className="pm-empty">Loading promotion requests...</p>
        ) : visibleRequests.length === 0 ? (
          <p className="pm-empty">No {filter === "All" ? "" : filter.toLowerCase()} promotion requests found.</p>
        ) : (
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>Employee</th><th>Requested by</th><th>Prediction</th><th>Probability</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{visibleRequests.map((request) => (
                <tr key={request._id}>
                  <td><strong>{request.employee?.name || "Employee unavailable"}</strong><small>{request.employee?.department || "—"}</small></td>
                  <td>{request.requestedBy?.name || "—"}</td>
                  <td>{request.modelPrediction}</td>
                  <td>{Number(request.promotionProbability).toFixed(1)}%</td>
                  <td>{displayDate(request.createdAt)}</td>
                  <td><span className={`pm-status pm-${request.status?.toLowerCase()}`}>{request.status}</span></td>
                  <td><button type="button" className="pm-view" onClick={() => { setSelected(request); setRemarks(request.adminRemarks || ""); setMessage(""); }}>View details</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="pm-modal-backdrop" onClick={() => !saving && setSelected(null)}>
          <div className="pm-modal" role="dialog" aria-modal="true" aria-label="Promotion request details" onClick={(event) => event.stopPropagation()}>
            <div className="pm-modal-head"><h2>Promotion review</h2><button type="button" onClick={() => setSelected(null)} disabled={saving} aria-label="Close">×</button></div>
            <p><strong>Employee:</strong> {selected.employee?.name || "Unavailable"}</p>
            <p><strong>Department:</strong> {selected.employee?.department || "—"}</p>
            <p><strong>Requested by:</strong> {selected.requestedBy?.name || "—"}</p>
            <p><strong>ML prediction:</strong> {selected.modelPrediction}</p>
            <p><strong>Promotion probability:</strong> {Number(selected.promotionProbability).toFixed(1)}%</p>
            <p><strong>Submitted:</strong> {displayDate(selected.createdAt)}</p>
            <p><strong>Status:</strong> {selected.status}</p>
            {selected.status !== "Pending" && <p><strong>Reviewed:</strong> {displayDate(selected.reviewedAt)} by {selected.reviewedBy?.name || "Admin"}</p>}
            <details className="pm-input-details"><summary>View ML inputs</summary><dl>{Object.entries(selected.modelInputs || {}).map(([key, value]) => <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd>{String(value)}</dd></div>)}</dl></details>
            <label className="pm-remarks">Admin remarks<textarea rows={3} maxLength={1000} value={remarks} onChange={(event) => setRemarks(event.target.value)} disabled={selected.status !== "Pending" || saving} placeholder="Add a reason for your decision (optional)" /></label>
            {selected.status === "Pending" && <div className="pm-actions">
              <button type="button" className="pm-approve" disabled={saving} onClick={() => review("Approved")}>Approve</button>
              <button type="button" className="pm-reject" disabled={saving} onClick={() => review("Rejected")}>Reject</button>
            </div>}
            <p className="pm-disclaimer">The ML score is advisory. Approval does not automatically change the employee's job title or salary.</p>
          </div>
        </div>
      )}
    </section>
  );
}
