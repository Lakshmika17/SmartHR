
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Users,
} from "lucide-react";
import "./RegisterCompany.css";

const initialForm = {
  companyName: "",
  industry: "Information Technology",
  adminName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterCompany() {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  };

  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.companyName.trim().length < 2) {
      setError("Enter a valid company name.");
      return;
    }

    if (form.adminName.trim().length < 2) {
      setError("Enter the HR Admin's full name.");
      return;
    }

    if (form.password.length < 12) {
      setError("Password must contain at least 12 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register-company",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyName: form.companyName.trim(),
            industry: form.industry,
            adminName: form.adminName.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            confirmPassword: form.confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Company registration failed."
        );
      }

      setSuccess(
        "Company registered successfully! You can now sign in."
      );

      setForm(initialForm);
    } catch (error) {
      setError(
        error.message ||
          "Cannot connect to the backend. Check that the server is running."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="register-page">
      <section className="register-banner">
        <Link to="/" className="register-brand">
          <span className="register-brand-icon">
            <Users size={26} />
          </span>
          <span>
            SmartHR
            <small>Intelligent HR analytics</small>
          </span>
        </Link>

        <div className="register-banner-content">
          <span className="register-eyebrow">
            GET STARTED WITH SMARTHR
          </span>
          <h1>
            Your company.
            <br />
            <span>Your HR workspace.</span>
          </h1>
          <p>
            Create your company workspace and establish your first
            HR Administrator account to begin managing your team.
          </p>

          <div className="register-benefit">
            <ShieldCheck size={20} />
            Secure, role-based access
          </div>
          <div className="register-benefit">
            <Building2 size={20} />
            Dedicated company workspace
          </div>
          <div className="register-benefit">
            <Users size={20} />
            Invite multiple HR Staff members
          </div>
        </div>
      </section>

      <section className="register-form-section">
        <div className="register-card">
          <Link to="/" className="register-back">
            ← Back to home
          </Link>

          <div className="register-heading">
            <span className="register-eyebrow">COMPANY REGISTRATION</span>
            <h2>Create your workspace</h2>
            <p>
              Register your organization and create its first HR Admin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <h3 className="register-group-title">
              <Building2 size={19} />
              Company details
            </h3>

            <div className="register-field">
              <label htmlFor="companyName">Company name</label>
              <input
                id="companyName"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="e.g. InnovateSoft Technologies"
                minLength={2}
                maxLength={120}
                autoComplete="organization"
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="industry">Industry</label>
              <select
                id="industry"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                required
              >
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="Software Development">
                  Software Development
                </option>
                <option value="Consulting">Consulting</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <h3 className="register-group-title">
              <UserRound size={19} />
              First HR Admin account
            </h3>

            <div className="register-field">
              <label htmlFor="adminName">Full name</label>
              <div className="register-input-icon">
                <UserRound size={18} />
                <input
                  id="adminName"
                  name="adminName"
                  value={form.adminName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="email">Work email address</label>
              <div className="register-input-icon">
                <Mail size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="password">Password</label>
              <div className="register-input-icon">
                <LockKeyhole size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 12 characters"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={128}
                  required
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="register-input-icon">
                <LockKeyhole size={18} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={128}
                  required
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="register-message register-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="register-message register-success" role="status">
                {success}
              </div>
            )}

            <button
              className="register-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating workspace..." : "Register company"}
              {!loading && <ArrowRight size={18} />}
            </button>

            <p className="register-login-link">
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
