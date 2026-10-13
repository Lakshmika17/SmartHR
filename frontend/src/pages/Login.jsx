
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  Users,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Expected response: { token, user }
      if (!response?.token || response?.user?.role !== "HR") {
        throw new Error("Invalid HR login response.");
      }

      localStorage.setItem("smarthr_token", response.token);
      localStorage.setItem(
        "smarthr_user",
        JSON.stringify(response.user)
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="visual-top">
          <div className="brand-mark">
            <Users size={25} />
          </div>
          <span>SmartHR</span>
        </div>

        <div className="visual-content">
          <span className="visual-label">
            INTELLIGENT HR MANAGEMENT
          </span>

          <h1>
            Make smarter
            <br />
            <span>people decisions.</span>
          </h1>

          <p>
            Predict employee promotions, identify attrition risks,
            and turn workforce data into actionable insights.
          </p>

          <div className="visual-features">
            <div>
              <ShieldCheck size={20} />
              <span>Secure HR access</span>
            </div>
            <div>
              <Users size={20} />
              <span>AI-powered workforce insights</span>
            </div>
          </div>
        </div>

        <p className="visual-footer">
          Smarter workforce. Better decisions.
        </p>
      </section>

      <section className="login-form-section">
        <div className="login-card">
          <Link to="/" className="back-home">
            ← Back to home
          </Link>

          <div className="mobile-brand">
            <div className="brand-mark">
              <Users size={23} />
            </div>
            <span>SmartHR</span>
          </div>

          <div className="login-heading">
            <span className="welcome-label">WELCOME BACK</span>
            <h2>HR Portal Login</h2>
            <p>
              Sign in with your authorized HR account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <div className="input-wrapper">
                <Mail size={19} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="hr@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <LockKeyhole size={19} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in to SmartHR"}
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="login-security">
            <ShieldCheck size={17} />
            <span>Authorized HR personnel only</span>
          </div>

          <p className="login-bottom">
            SmartHR · Employee Promotion & Attrition Prediction
          </p>
        </div>
      </section>
    </main>
  );
}
