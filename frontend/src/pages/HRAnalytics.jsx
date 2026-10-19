
import React from "react";
import "./HRAnalytics.css";

const departments = [
  { name: "Sales", employees: 446, attrition: 20.6, income: 5900 },
  { name: "Research & Development", employees: 961, attrition: 13.8, income: 6280 },
  { name: "Human Resources", employees: 63, attrition: 19.0, income: 6650 },
];

const metrics = [
  { label: "Total Employees", value: "1,470", note: "Workforce overview", icon: "👥" },
  { label: "Attrition Rate", value: "16.1%", note: "Employees who left", icon: "📉" },
  { label: "Average Monthly Income", value: "₹6,503", note: "Across employees", icon: "💰" },
  { label: "Average Tenure", value: "7.0 yrs", note: "Years at company", icon: "📅" },
];

export default function HRAnalytics() {
  return (
    <main className="hra-page">
      <header className="hra-header">
        <div>
          <span className="hra-eyebrow">SMART HR / REPORTS</span>
          <h1>HR Analytics</h1>
          <p>Understand workforce trends and employee retention.</p>
        </div>
        <button
          className="hra-export"
          onClick={() => window.print()}
        >
          Export / Print Report
        </button>
      </header>

      <section className="hra-metrics">
        {metrics.map((item) => (
          <article className="hra-card" key={item.label}>
            <div className="hra-metric-top">
              <span>{item.label}</span>
              <span className="hra-icon">{item.icon}</span>
            </div>
            <strong>{item.value}</strong>
            <small>{item.note}</small>
          </article>
        ))}
      </section>

      <section className="hra-panels">
        <article className="hra-panel">
          <div className="hra-panel-heading">
            <div>
              <h2>Attrition by Department</h2>
              <p>Percentage of employees who left</p>
            </div>
          </div>
          <div className="hra-chart">
            {departments.map((dept) => (
              <div className="hra-bar-row" key={dept.name}>
                <div className="hra-bar-label">
                  <span>{dept.name}</span>
                  <strong>{dept.attrition}%</strong>
                </div>
                <div className="hra-track">
                  <div
                    className="hra-fill"
                    style={{ width: `${(dept.attrition / 25) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="hra-footnote">
            Highest attrition in this dataset: Sales.
          </p>
        </article>

        <article className="hra-panel">
          <h2>Workforce Distribution</h2>
          <p>Employees by department</p>
          <div className="hra-distribution">
            {departments.map((dept) => {
              const share = (dept.employees / 1470) * 100;
              return (
                <div className="hra-dist-row" key={dept.name}>
                  <div className="hra-dist-info">
                    <span>{dept.name}</span>
                    <strong>{dept.employees}</strong>
                  </div>
                  <div className="hra-track">
                    <div className="hra-fill" style={{ width: `${share}%` }} />
                  </div>
                  <small>{share.toFixed(1)}% of workforce</small>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="hra-panel hra-table-panel">
        <h2>Department Overview</h2>
        <p>Compare employee counts, attrition and monthly income.</p>
        <div className="hra-table-scroll">
          <table className="hra-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Employees</th>
                <th>Attrition Rate</th>
                <th>Avg. Monthly Income</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.name}>
                  <td>{dept.name}</td>
                  <td>{dept.employees}</td>
                  <td>
                    <span className="hra-rate">{dept.attrition}%</span>
                  </td>
                  <td>₹{dept.income.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="hra-disclaimer">
        Note: Figures shown are based on sample IBM HR attrition dataset
        summaries. This page currently uses static display data and is not
        connected to the backend.
      </p>
    </main>
  );
}
