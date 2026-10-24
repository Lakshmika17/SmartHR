
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
  Building2,
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
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({ email, password });

      const allowedRoles = ["HR_ADMIN", "HR_STAFF"];
      const user = response?.user;

      if (
        !response?.token ||
        !user ||
        !allowedRoles.includes(user.role) ||
        !user.company?.id
      ) {
        throw new Error(
          "Your account information is incomplete. Please contact your administrator."
        );
      }

      // Save the authenticated session information.
      localStorage.setItem("smarthr_token", response.token);
      localStorage.setItem("smarthr_user", JSON.stringify(user));

      // Both roles currently use the existing dashboard route.
      // Role-specific navigation will be implemented separately.
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
            and turn workforce data into actionable insights
            across your organization.
          </p>

          <div className="visual-features">
            <div>
              <ShieldCheck size={20} />
              <span>Secure, role-based access</span>
            </div>

            <div>
              <Users size={20} />
              <span>Multiple HR users per company</span>
            </div>

            <div>
              <Building2 size={20} />
              <span>Company-specific workforce insights</span>
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
            <h2>Welcome to SmartHR</h2>
            <p>
              Sign in using your authorized HR account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Work email address</label>

              <div className="input-wrapper">
                <Mail size={19} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                  disabled={loading}
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
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  disabled={loading}
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
            <span>Secure access for authorized HR personnel</span>
          </div>

          <p className="login-bottom">
            SmartHR · Employee Promotion & Attrition Prediction
          </p>
        </div>
      </section>
    </main>
  );
}
