import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, BriefcaseBusiness, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { loginUser } from "../services/authService";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("HR_ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    try {
      setLoading(true);
      const response = await loginUser({ email: email.trim().toLowerCase(), password, role });
      if (!response?.success || !response?.token || !response?.user) {
        throw new Error("Invalid login response.");
      }
      if (response.user.role !== role) throw new Error("Account role mismatch.");
      if (!["HR_ADMIN", "HR_STAFF"].includes(response.user.role)) {
        throw new Error("Unsupported account role.");
      }
      localStorage.setItem("smarthr_token", response.token);
      localStorage.setItem("smarthr_user", JSON.stringify(response.user));
      navigate(response.user.role === "HR_ADMIN" ? "/admin/dashboard" : "/staff/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <header className="login-navbar">
        <Link to="/" className="login-nav-brand" aria-label="SmartHR home">
          <span className="login-nav-brand-icon"><BriefcaseBusiness size={21} /></span>
          <span className="login-nav-brand-text">SmartHR<small>Intelligent HR Management</small></span>
        </Link>
        <nav className="login-nav-links" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <a href="#features">Features</a>
          <a href="#about">About SmartHR</a>
        </nav>
        <Link className="login-nav-cta" to="/register-company">Get Started <ArrowRight size={16} /></Link>
      </header>

      <main className="login-page">
        <section className="login-visual" id="features" aria-label="SmartHR benefits">
          <div className="visual-content">
            <span className="visual-label">SMARTER PEOPLE MANAGEMENT</span>
            <h1>Make better HR decisions with <span>SmartHR.</span></h1>
            <p>One secure workspace for employee management, promotion insights, attrition risk assessments and meaningful workforce analytics.</p>
            <div className="visual-features">
              <div><UsersRound size={21} /><span>Centralized employee and HR management</span></div>
              <div><BarChart3 size={21} /><span>Data-driven promotion and attrition insights</span></div>
              <div><ShieldCheck size={21} /><span>Role-based access for Admin and HR Staff</span></div>
            </div>
          </div>
          <p className="visual-footer">Built for efficient, informed HR workflows.</p>
        </section>

        <section className="login-form-section" aria-labelledby="login-title">
          <div className="login-card">
            <div className="login-heading">
              <span className="welcome-label">WELCOME BACK</span>
              <h2 id="login-title">Sign in to SmartHR</h2>
              <p>Select your account type and enter your credentials to continue.</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="role-selection">
                <span className="role-selection-label" id="login-role-label">Login as</span>
                <div className="role-options" role="group" aria-labelledby="login-role-label">
                  <button type="button" className={`role-option ${role === "HR_ADMIN" ? "active" : ""}`} aria-pressed={role === "HR_ADMIN"} disabled={loading} onClick={() => setRole("HR_ADMIN")}>
                    <ShieldCheck size={23} /><span>HR Admin</span><small>Manage your organization</small>
                  </button>
                  <button type="button" className={`role-option ${role === "HR_STAFF" ? "active" : ""}`} aria-pressed={role === "HR_STAFF"} disabled={loading} onClick={() => setRole("HR_STAFF")}>
                    <UsersRound size={23} /><span>HR Staff</span><small>Manage HR workflows</small>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-email">Email address</label>
                <div className="input-wrapper"><Mail size={19} />
                  <input id="login-email" type="email" placeholder="Enter your registered email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required disabled={loading} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="input-wrapper"><LockKeyhole size={19} />
                  <input id="login-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required disabled={loading} />
                  <button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>
              {error && <div className="login-error" role="alert">{error}</div>}
              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? "Signing in..." : <>Sign In <ArrowRight size={18} /></>}
              </button>
            </form>
            <p className="login-security"><ShieldCheck size={16} /> Secure access to your SmartHR workspace</p>
            <p className="login-bottom">New to SmartHR? <Link to="/register-company">Register your company</Link></p>
          </div>
        </section>
      </main>

      <footer className="login-footer" id="about">
        <div className="login-footer-inner">
          <div className="login-footer-about"><strong>SmartHR</strong><p>Intelligent HR management for employee records, prediction workflows, analytics and reporting.</p></div>
          <div className="login-footer-links"><Link to="/">Home</Link><a href="#features">Features</a><Link to="/register-company">Register Company</Link></div>
        </div>
        <div className="login-footer-bottom">© {new Date().getFullYear()} SmartHR. All rights reserved.</div>
      </footer>
    </div>
  );
}
