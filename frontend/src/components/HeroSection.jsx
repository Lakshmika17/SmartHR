
import "./HeroSection.css";

const insights = [
  { label: "Promotion Analysis", value: "01", type: "purple" },
  { label: "Attrition Analysis", value: "02", type: "pink" },
];

const chartBars = [38, 57, 45, 72, 53, 84, 64, 92, 70, 60];

export default function HeroSection() {
  return (
    <section className="sh-hero" id="home">
      <div className="sh-hero-glow sh-glow-one" />
      <div className="sh-hero-glow sh-glow-two" />

      <div className="sh-hero-container">
        {/* Left: Hero content */}
        <div className="sh-hero-content">
          <div className="sh-hero-badge">
            <span className="sh-badge-dot" />
            <span>SMARTER HUMAN RESOURCE MANAGEMENT</span>
          </div>

          <h1 className="sh-hero-title">
            People insights.
            <br />
            <span>Powered by AI.</span>
          </h1>

          <p className="sh-hero-description">
            Discover employee trends, predict promotion outcomes, and
            understand attrition patterns with a machine-learning-powered
            HR analytics platform.
          </p>

          <div className="sh-hero-actions">
            <a href="#features" className="sh-btn sh-btn-primary">
              Explore Features
              <span aria-hidden="true">↗</span>
            </a>

            <a href="#workflow" className="sh-btn sh-btn-secondary">
              <span className="sh-play-icon" aria-hidden="true">▷</span>
              How It Works
            </a>
          </div>

          <div className="sh-hero-highlights">
            <div className="sh-highlight-icon">✦</div>
            <div>
              <strong>One focused HR workspace</strong>
              <p>Promotion · Attrition · Explainable AI</p>
            </div>
          </div>

          <div className="sh-hero-line" />
          <p className="sh-hero-caption">
            BUILT WITH MACHINE LEARNING · DESIGNED FOR HR INSIGHTS
          </p>
        </div>

        {/* Right: Illustrative HR dashboard */}
        <div className="sh-hero-visual">
          <div className="sh-orbit sh-orbit-one" />
          <div className="sh-orbit sh-orbit-two" />

          <div className="sh-dashboard">
            <div className="sh-dashboard-header">
              <div className="sh-dashboard-brand">
                <div className="sh-logo-mark">S</div>
                <div>
                  <strong>SmartHR</strong>
                  <span>INTELLIGENT HR ANALYTICS</span>
                </div>
              </div>

              <span className="sh-dashboard-tag">
                <span className="sh-live-dot" />
                OVERVIEW
              </span>
            </div>

            <div className="sh-dashboard-welcome">
              <div>
                <span className="sh-mini-label">YOUR WORKSPACE</span>
                <h2>HR Intelligence</h2>
                <p>Explore workforce insights in one place.</p>
              </div>
              <div className="sh-profile-icon">HR</div>
            </div>

            <div className="sh-insight-grid">
              {insights.map((item) => (
                <div className="sh-insight-card" key={item.label}>
                  <div className={`sh-insight-symbol ${item.type}`}>
                    {item.type === "purple" ? "↗" : "◎"}
                  </div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>ML prediction module</small>
                </div>
              ))}
            </div>

            <div className="sh-chart-card">
              <div className="sh-chart-header">
                <div>
                  <strong>Workforce insights</strong>
                  <p>Illustrative dashboard preview</p>
                </div>
                <span className="sh-chart-chip">ML + AI</span>
              </div>

              <div className="sh-chart">
                <div className="sh-chart-axis">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>

                <div className="sh-chart-plot">
                  {[0, 1, 2, 3, 4].map((line) => (
                    <div
                      className="sh-chart-gridline"
                      style={{ top: `${line * 25}%` }}
                      key={line}
                    />
                  ))}

                  <div className="sh-chart-bars">
                    {chartBars.map((height, index) => (
                      <div
                        key={index}
                        className={`sh-chart-bar sh-bar-${index % 3}`}
                        style={{ "--bar-height": `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="sh-chart-legend">
                <span>
                  <i className="sh-legend-purple" />
                  Promotion analysis
                </span>
                <span>
                  <i className="sh-legend-pink" />
                  Attrition analysis
                </span>
              </div>
            </div>

            <div className="sh-dashboard-footer">
              <span>✦ Explainable AI</span>
              <span>Model evaluation</span>
              <span>HR analytics</span>
            </div>
          </div>

          {/* Floating labels */}
          <div className="sh-float-card sh-float-top">
            <span className="sh-float-icon">✧</span>
            <div>
              <strong>Machine Learning</strong>
              <small>Intelligent insights</small>
            </div>
          </div>

          <div className="sh-float-card sh-float-bottom">
            <span className="sh-float-icon sh-float-icon-pink">✓</span>
            <div>
              <strong>Explainable AI</strong>
              <small>Understand predictions</small>
            </div>
          </div>
        </div>
      </div>

      <div className="sh-hero-bottom">
        <span>BUILT FOR HR PROFESSIONALS</span>
        <div><i /> Employee analytics</div>
        <div><i /> Predictive ML</div>
        <div><i /> Explainable results</div>
      </div>
    </section>
  );
}
