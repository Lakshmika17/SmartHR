import { useCallback, useEffect, useState } from "react";
import "./HRAnalytics.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const number = (value) => Number(value || 0).toLocaleString("en-IN");
const percent = (part, whole) => whole > 0 ? `${((part / whole) * 100).toFixed(1)}%` : "0.0%";

export default function HRAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("smarthr_token");
      if (!token) throw new Error("Please log in again.");
      const response = await fetch(`${API_BASE}/api/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Unable to load analytics.");
      setData(json);
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message || "Connection failed.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const a = data?.attrition || {};
  const departments = data?.departments || [];
  const total = data?.totalEmployees || 0;
  const metrics = [
    { label: "Total Employees", value: number(total), note: "Company employee records", icon: "👥" },
    { label: "Promotion Requests", value: data?.promotionRequests == null ? "N/A" : number(data.promotionRequests), note: "Submitted requests", icon: "📈" },
    { label: "Attrition Assessments", value: number(a.total), note: "ML assessments submitted", icon: "📊" },
    { label: "High-Risk Assessments", value: number(a.high), note: "Predicted high-risk assessments", icon: "⚠️" },
  ];

  return (
    <main className="hra-page">
      <header className="hra-header">
        <div>
          <span className="hra-eyebrow">SMART HR / LIVE REPORTS</span>
          <h1>HR Analytics</h1>
          <p>Company-specific workforce and assessment analytics from MongoDB.</p>
        </div>
        <div className="hra-actions">
          <button className="hra-export" type="button" onClick={() => load()} disabled={loading}>Refresh</button>
          <button className="hra-export" type="button" onClick={() => window.print()} disabled={!data}>Export / Print Report</button>
        </div>
      </header>

      {error && <p className="hra-error" role="alert">{error}</p>}
      {loading && !data && <p role="status">Loading company analytics...</p>}

      {data && (
        <>
          <section className="hra-metrics">
            {metrics.map((item) => (
              <article className="hra-card" key={item.label}>
                <div className="hra-metric-top"><span>{item.label}</span><span className="hra-icon">{item.icon}</span></div>
                <strong>{item.value}</strong><small>{item.note}</small>
              </article>
            ))}
          </section>

          <section className="hra-panels">
            <article className="hra-panel">
              <div className="hra-panel-heading"><div><h2>Attrition Risk Breakdown</h2><p>Distribution of submitted ML assessments</p></div></div>
              <div className="hra-chart">
                {[
                  { name: "High", count: a.high || 0 },
                  { name: "Medium", count: a.medium || 0 },
                  { name: "Low", count: a.low || 0 },
                ].map((item) => (
                  <div className="hra-bar-row" key={item.name}>
                    <div className="hra-bar-label"><span>{item.name} risk</span><strong>{item.count} ({percent(item.count, a.total)})</strong></div>
                    <div className="hra-track"><div className="hra-fill" style={{ width: percent(item.count, a.total) }} /></div>
                  </div>
                ))}
              </div>
              <p className="hra-footnote">Risk counts represent assessments, not unique employees or confirmed resignations.</p>
            </article>

            <article className="hra-panel">
              <h2>Workforce Distribution</h2><p>Employees by department</p>
              <div className="hra-distribution">
                {departments.length === 0 && <p>No employees have been added yet.</p>}
                {departments.map((dept) => (
                  <div className="hra-dist-row" key={dept.name}>
                    <div className="hra-dist-info"><span>{dept.name}</span><strong>{number(dept.employees)}</strong></div>
                    <div className="hra-track"><div className="hra-fill" style={{ width: percent(dept.employees, total) }} /></div>
                    <small>{percent(dept.employees, total)} of workforce</small>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="hra-panel hra-table-panel">
            <h2>Department Overview</h2><p>Current employee distribution in your company</p>
            <div className="hra-table-scroll">
              <table className="hra-table">
                <thead><tr><th>Department</th><th>Employees</th><th>Share of Workforce</th></tr></thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.name}><td>{dept.name}</td><td>{number(dept.employees)}</td><td><span className="hra-rate">{percent(dept.employees, total)}</span></td></tr>
                  ))}
                  {departments.length === 0 && <tr><td colSpan={3}>No department records available.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="hra-panel hra-table-panel">
            <h2>Attrition Review Workflow</h2><p>Status of submitted assessments</p>
            <div className="hra-table-scroll">
              <table className="hra-table">
                <thead><tr><th>Pending</th><th>Under Review</th><th>Action Taken</th><th>Closed</th></tr></thead>
                <tbody><tr><td>{number(a.pending)}</td><td>{number(a.underReview)}</td><td>{number(a.actionTaken)}</td><td>{number(a.closed)}</td></tr></tbody>
              </table>
            </div>
          </section>
          <p className="hra-disclaimer">Live company data. Attrition predictions indicate estimated risk, not actual employee departures. Repeated assessments of the same employee are counted separately.</p>
          <p className="hra-disclaimer">Report generated: {data.generatedAt ? new Date(data.generatedAt).toLocaleString("en-IN") : "—"}</p>
        </>
      )}
    </main>
  );
}
