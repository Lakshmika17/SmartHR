
import { useEffect, useState } from "react";
import {
  UserRound,
  LockKeyhole,
  Building2,
  Save,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminSettings.css";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

export default function AdminSettings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  function authHeaders() {
    const token = localStorage.getItem("smarthr_token");

    return {
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": "application/json",
    };
  }

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: authHeaders(),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (${response.status})`
      );
    }

    return data;
  }

  async function loadProfile() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await request("/api/settings/profile");

      setProfile(data.user);
      setName(data.user?.name || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await request("/api/settings/profile");

        if (!active) return;

        setProfile(data.user);
        setName(data.user?.name || "");
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  async function saveProfile(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const data = await request("/api/settings/profile", {
        method: "PUT",
        body: JSON.stringify({ name: name.trim() }),
      });

      setProfile((previous) => ({
        ...previous,
        ...data.user,
      }));

      const stored = JSON.parse(
        localStorage.getItem("smarthr_user") || "{}"
      );

      localStorage.setItem(
        "smarthr_user",
        JSON.stringify({
          ...stored,
          name: data.user.name,
        })
      );

      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      passwords.newPassword !== passwords.confirmPassword
    ) {
      setError("New passwords do not match.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    setChanging(true);

    try {
      await request("/api/settings/password", {
        method: "PUT",
        body: JSON.stringify(passwords),
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      localStorage.removeItem("smarthr_token");
      localStorage.removeItem("smarthr_user");

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Password changed successfully. Please log in again.",
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setChanging(false);
    }
  }

  function updatePassword(event) {
    const { name: field, value } = event.target;

    setPasswords((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  if (loading) {
    return (
      <main className="as-page">
        <p>Loading Admin Settings...</p>
      </main>
    );
  }

  return (
    <main className="as-page">
      <header className="as-header">
        <div>
          <span className="as-eyebrow">
            SMART HR / ACCOUNT
          </span>
          <h1>Admin Settings</h1>
          <p>
            Manage your profile, company details,
            and account security.
          </p>
        </div>

        <button
          type="button"
          className="as-secondary-btn"
          onClick={loadProfile}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="as-alert as-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="as-alert as-success" role="status">
          {message}
        </div>
      )}

      <div className="as-grid">
        <section className="as-card">
          <div className="as-card-title">
            <UserRound size={22} />
            <div>
              <h2>Admin Profile</h2>
              <p>Update your account information.</p>
            </div>
          </div>

          <form onSubmit={saveProfile}>
            <label className="as-field">
              Full Name
              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                minLength={2}
                maxLength={100}
                required
              />
            </label>

            <label className="as-field">
              Email Address
              <input
                type="email"
                value={profile?.email || ""}
                readOnly
              />
            </label>

            <label className="as-field">
              Account Role
              <input
                type="text"
                value={profile?.role || "HR_ADMIN"}
                readOnly
              />
            </label>

            <button
              className="as-primary-btn"
              type="submit"
              disabled={saving || !name.trim()}
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </section>

        <section className="as-card">
          <div className="as-card-title">
            <Building2 size={22} />
            <div>
              <h2>Company Information</h2>
              <p>Your registered SmartHR workspace.</p>
            </div>
          </div>

          <label className="as-field">
            Company Name
            <input
              value={profile?.company?.name || ""}
              readOnly
            />
          </label>

          <label className="as-field">
            Company Code
            <input
              value={profile?.company?.companyCode || ""}
              readOnly
            />
          </label>

          <div className="as-info">
            <ShieldCheck size={19} />
            Company information is read-only here.
            Use Company Management for supported changes.
          </div>
        </section>

        <section className="as-card as-security-card">
          <div className="as-card-title">
            <LockKeyhole size={22} />
            <div>
              <h2>Change Password</h2>
              <p>
                Update your password to protect your account.
              </p>
            </div>
          </div>

          <form onSubmit={changePassword}>
            {[
              {
                name: "currentPassword",
                label: "Current Password",
              },
              {
                name: "newPassword",
                label: "New Password",
              },
              {
                name: "confirmPassword",
                label: "Confirm New Password",
              },
            ].map((field) => (
              <label className="as-field" key={field.name}>
                {field.label}

                <input
                  type={showPassword ? "text" : "password"}
                  name={field.name}
                  value={passwords[field.name]}
                  onChange={updatePassword}
                  autoComplete={
                    field.name === "currentPassword"
                      ? "current-password"
                      : "new-password"
                  }
                  required
                />
              </label>
            ))}

            <button
              type="button"
              className="as-show-password"
              onClick={() =>
                setShowPassword((previous) => !previous)
              }
            >
              {showPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
              {showPassword
                ? "Hide passwords"
                : "Show passwords"}
            </button>

            <p className="as-password-hint">
              Use a password containing at least 8 characters.
              You will be redirected to login after changing it.
            </p>

            <button
              className="as-primary-btn"
              type="submit"
              disabled={changing}
            >
              <LockKeyhole size={17} />
              {changing
                ? "Updating..."
                : "Change Password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
