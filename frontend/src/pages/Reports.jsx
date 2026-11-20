import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText, Printer, RefreshCw, Search } from "lucide-react";
import "./Reports.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api\/?$/, "").replace(/\/$/, "");

const OPTIONS = {
  employees: { title: "Employee Report", statuses: ["All", "Active", "Inactive"] },
  promotions: { title: "Promotion Report", statuses: ["All", "Pending", "Approved", "Rejected"] },
  attrition: { title: "Attrition Report", statuses: ["All", "Pending", "Under Review", "Action Taken", "Closed"] },
};
const dateText = (value) => value ? new Date(value).toLocaleDateString("en-IN") : "—";
const cellText = (value) => value == null || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value);
const probabilityText = (value) => value == null ? "—" : `${Number(value).toFixed(1)}%`;

function makeRows(type, rows) {
  if (type === "employees") return rows.map((r) => ({
    Name: r.name || "—", Email: r.email || "—", Department: r.department || "—",
    Designation: r.designation || "—", Status: r.status || "—", Created: dateText(r.createdAt),
  }));
  if (type === "promotions") return rows.map((r) => ({
    Employee: r.employee?.name || "—", Department: r.employee?.department || "—",
    Status: r.status || "—", Prediction: cellText(r.modelPrediction),
    Probability: probabilityText(r.promotionProbability), Remarks: r.adminRemarks || "—",
    Submitted: dateText(r.createdAt),
  }));
  return rows.map((r) => ({
    Employee: r.employee?.name || "—", Department: r.employee?.department || "—",
    Risk: r.riskLevel || "—", Probability: probabilityText(r.attritionProbability),
    Status: r.status || "—", "Retention Action": r.retentionAction || "—",
    "Admin Remarks": r.adminRemarks || "—", Submitted: dateText(r.createdAt),
  }));
}

function exportCsv(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escapeCsv = (value) => {
    // Prevent spreadsheet formula injection for untrusted employee-provided text.
    const str = String(value ?? "");
    const safe = /^[\s]*[=+\-@]/.test(str) ? `'${str}` : str;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const csv = [headers.map(escapeCsv).join(","), ...rows.map((r) => headers.map((h) => escapeCsv(r[h])).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [type, setType] = useState("employees");
  const [status, setStatus] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [result, setResult] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (signal) => {
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("smarthr_token");
      if (!token) throw new Error("Please log in again.");
      const query = new URLSearchParams({ type, status });
      if (from) query.set("from", from);
      if (to) query.set("to", to);
      const response = await fetch(`${API_BASE}/api/reports?${query}`, {
        headers: { Authorization: `Bearer ${token}` }, signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not load report.");
      if (!signal?.aborted) setResult(data);
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message || "Unable to load report.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [type, status, from, to]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const rows = useMemo(() => makeRows(type, result.rows || []), [type, result.rows]);
  const visible = useMemo(() => rows.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(search.toLowerCase()))
  ), [rows, search]);
  const headers = rows.length ? Object.keys(rows[0]) : [];

  return (
    <main className="reports-page">
      <header className="reports-header">
        <div><span className="reports-eyebrow">SMART HR / ADMIN REPORTS</span><h1>Reports Management</h1>
          <p>View and export company employee, promotion, and attrition records.</p></div>
        <div className="reports-actions">
          <button type="button" onClick={() => load()} disabled={loading}><RefreshCw size={16} /> Refresh</button>
          <button type="button" onClick={() => exportCsv(visible, `smarthr-${type}-${new Date().toISOString().slice(0,10)}.csv`)} disabled={!visible.length || loading}><Download size={16} /> Export CSV</button>
          <button type="button" onClick={() => window.print()} disabled={!visible.length || loading}><Printer size={16} /> Print / Save PDF</button>
        </div>
      </header>
      <section className="reports-types" aria-label="Report category">
        {Object.entries(OPTIONS).map(([key, option]) => (
          <button key={key} type="button" className={type === key ? "selected" : ""} onClick={() => { setType(key); setStatus("All"); setSearch(""); }}>
            <FileText size={18} /> {option.title}
          </button>
        ))}
      </section>
      <section className="reports-panel">
        <div className="reports-filters">
          <label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}>{OPTIONS[type].statuses.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label>From<input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} /></label>
          <label>To<input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} /></label>
          <label className="reports-search">Search loaded records<div><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, department, status..." /></div></label>
        </div>
        <div className="reports-summary"><strong>{OPTIONS[type].title}</strong><span>{loading ? "Loading..." : `${visible.length} displayed · ${result.total || 0} matching database records`}</span></div>
        {error && <div className="reports-error" role="alert">{error}</div>}
        {loading ? <p className="reports-empty">Loading report...</p> : !visible.length ? <p className="reports-empty">No records found for the selected filters.</p> : (
          <div className="reports-scroll"><table><thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>
            {visible.map((row, i) => <tr key={i}>{headers.map((h) => <td key={h}>{row[h]}</td>)}</tr>)}
          </tbody></table></div>
        )}
        {result.total > (result.rows?.length || 0) && <p className="reports-warning">Showing the first {result.rows.length} records. Narrow the date/status filters to export a smaller complete set.</p>}
        <p className="reports-note">Report data is company-specific. ML probabilities are estimates, not confirmed employee outcomes. CSV exports include the currently displayed search results; Print / Save PDF uses your browser's print dialog.</p>
      </section>
    </main>
  );
}
