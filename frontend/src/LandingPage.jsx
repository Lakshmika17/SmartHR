import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BrainCircuit,
  ChartNoAxesCombined,
  Database,
  LogIn,
  Moon,
  ShieldCheck,
  Sun,
  Target,
} from "lucide-react";

import HeroSection from "./components/HeroSection";
import "./LandingPage.css";

const features = [
  {
    icon: Target,
    title: "Promotion prediction",
    description:
      "Analyze employee attributes to estimate promotion outcomes using a trained machine-learning model.",
  },
  {
    icon: Activity,
    title: "Attrition prediction",
    description:
      "Identify patterns associated with employee attrition and support informed retention decisions.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "HR analytics",
    description:
      "Explore workforce distributions, department trends and descriptive statistics.",
  },
  {
    icon: BrainCircuit,
    title: "Explainable AI",
    description:
      "Understand model outputs using feature importance and SHAP explanations.",
  },
];

const workflow = [
  ["01", "Prepare employee data", "Clean, validate and explore the datasets."],
  ["02", "Train machine-learning models", "Compare suitable classification algorithms."],
  ["03", "Evaluate predictions", "Measure model performance using test data."],
  ["04", "Understand the results", "Explore prediction explanations and HR insights."],
];

const techStack = [
  [Database, "React + Vite", "Frontend"],
  [ShieldCheck, "FastAPI", "Backend APIs"],
  [BrainCircuit, "Scikit-learn", "Machine learning"],
  [ChartNoAxesCombined, "SHAP", "Model explainability"],
];

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("smarthr-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* storage unavailable, fall through */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function LandingPage() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem("smarthr-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <div className="landing-page" data-theme={theme}>
      <header className="landing-navbar">
        <a className="landing-brand" href="#home">
          <span className="landing-brand-icon">S</span>
          <span className="landing-brand-text">
            SmartHR
            <small>Intelligent HR analytics</small>
          </span>
        </a>

        <nav className="landing-nav-links" aria-label="Primary">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#workflow">How it works</a>
        </nav>

        <div className="landing-nav-actions">
          <button
            type="button"
            className="landing-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link className="landing-login-button" to="/login">
            <LogIn size={16} />
            HR login
          </Link>
        </div>
      </header>

      <div id="home">
        <HeroSection />
      </div>

      <section className="landing-features" id="features">
        <div className="landing-container">
          <div className="landing-section-heading">
            <h2>Better insights for smarter HR decisions</h2>
            <p>
              A focused workspace for employee promotion and attrition
              prediction, workforce analytics and interpretable ML results.
            </p>
          </div>

          <div className="landing-feature-grid">
            {features.map(({ icon: Icon, title, description }) => (
              <article className="landing-feature-card" key={title}>
                <div className="landing-feature-icon">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-workflow" id="workflow">
        <div className="landing-container landing-workflow-layout">
          <div className="landing-workflow-intro">
            <h2>From employee data to meaningful insights</h2>
            <p>
              SmartHR follows a structured ML workflow, from data preparation
              to model evaluation and explainable predictions.
            </p>

            <Link className="landing-login-button" to="/login">
              <LogIn size={16} />
              Log in to HR workspace
            </Link>
          </div>

          <ol className="landing-steps">
            {workflow.map(([number, title, description]) => (
              <li className="landing-step" key={number}>
                <span className="landing-step-number">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-technology">
        <div className="landing-container">
          <div className="landing-section-heading">
            <h2>Built with</h2>
            <p>A modular frontend and backend architecture for HR analytics.</p>
          </div>

          <div className="landing-tech-grid">
            {techStack.map(([Icon, name, role]) => (
              <div key={name}>
                <Icon />
                <strong>{name}</strong>
                <span>{role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div>
            <strong>SmartHR</strong>
            <p>
              Employee Promotion &amp; Attrition Prediction System Using
              Machine Learning
            </p>
          </div>

          <Link to="/login">HR login</Link>
        </div>
      </footer>
    </div>
  );
}