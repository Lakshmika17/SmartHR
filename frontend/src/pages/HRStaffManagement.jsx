import { useCallback, useEffect, useRef, useState } from 'react';
import './HRStaffManagement.css';

const API_URL = 'http://localhost:5000/api/staff';
const blankForm = () => ({ name: '', email: '', password: '', confirmPassword: '' });
const getToken = () => localStorage.getItem('smarthr_token');

export default function HRStaffManagement() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editId, setEditId] = useState(null);
  const editSectionRef = useRef(null);
  const [editForm, setEditForm] = useState(blankForm);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({ create: false, edit: false });

  const request = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: { Authorization: `Bearer ${getToken()}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `Request failed (${response.status}).`);
    return data;
  };

  const loadStaff = useCallback(async () => {
    setFetching(true);
    try {
      const response = await fetch(API_URL, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to load HR Staff.');
      setStaff(data.staff || []);
    } catch (err) { setError(err.message); }
    finally { setFetching(false); }
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const validate = (values, isEdit = false) => {
    if (!values.name.trim() || !values.email.trim()) return 'Staff name and email are required.';
    if (!isEdit || values.password || values.confirmPassword) {
      if (values.password.length < 12 || values.password.length > 128) return 'Password must contain 12 to 128 characters.';
      if (values.password !== values.confirmPassword) return 'Password and confirm password do not match.';
    }
    return '';
  };

  const createStaff = async event => {
    event.preventDefault(); setError(''); setSuccess('');
    const validation = validate(form);
    if (validation) { setError(validation); return; }
    setLoading(true);
    try {
      const data = await request(API_URL, { method: 'POST', body: JSON.stringify(form) });
      setForm(blankForm()); setSuccess(data.message || 'HR Staff created successfully.'); await loadStaff();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const startEdit = member => {
    setError(''); setSuccess(''); setEditId(member._id || member.id);
    setEditForm({ name: member.name, email: member.email, password: '', confirmPassword: '' });
    setShowPasswords(previous => ({ ...previous, edit: false }));
  };

  useEffect(() => {
    if (editId && editSectionRef.current) {
      editSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      editSectionRef.current.querySelector("input")?.focus({ preventScroll: true });
    }
  }, [editId]);

  const saveEdit = async event => {
    event.preventDefault(); setError(''); setSuccess('');
    const validation = validate(editForm, true);
    if (validation) { setError(validation); return; }
    setBusyId(editId);
    try {
      const data = await request(`${API_URL}/${editId}`, { method: 'PUT', body: JSON.stringify(editForm) });
      setEditId(null); setEditForm(blankForm()); setSuccess(data.message || 'Staff updated successfully.'); await loadStaff();
    } catch (err) { setError(err.message); }
    finally { setBusyId(null); }
  };

  const toggleStatus = async member => {
    const id = member._id || member.id;
    const action = member.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${member.name}?`)) return;
    setError(''); setSuccess(''); setBusyId(id);
    try {
      const data = await request(`${API_URL}/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive: !member.isActive }) });
      setSuccess(data.message); await loadStaff();
    } catch (err) { setError(err.message); }
    finally { setBusyId(null); }
  };

  const activeCount = staff.filter(member => member.isActive).length;

  const fields = (values, setValues, scope, editing = false) => (
    <div className="sm-staff-form-grid">
      <div className="sm-staff-field">
        <label htmlFor={`${scope}-name`}>Full Name <span>*</span></label>
        <input id={`${scope}-name`} type="text" placeholder="Enter staff full name" maxLength={100} required value={values.name} onChange={e => setValues(previous => ({ ...previous, name: e.target.value }))} />
      </div>
      <div className="sm-staff-field">
        <label htmlFor={`${scope}-email`}>Email Address <span>*</span></label>
        <input id={`${scope}-email`} type="email" placeholder="name@company.com" maxLength={254} required value={values.email} onChange={e => setValues(previous => ({ ...previous, email: e.target.value }))} />
      </div>
      <div className="sm-staff-field">
        <label htmlFor={`${scope}-password`}>{editing ? 'New Password' : 'Password'} {!editing && <span>*</span>}</label>
        <input id={`${scope}-password`} type={showPasswords[scope] ? 'text' : 'password'} placeholder={editing ? 'Leave blank to keep current password' : 'Minimum 12 characters'} minLength={editing ? undefined : 12} maxLength={128} required={!editing} autoComplete="new-password" value={values.password} onChange={e => setValues(previous => ({ ...previous, password: e.target.value }))} />
      </div>
      <div className="sm-staff-field">
        <label htmlFor={`${scope}-confirm`}>{editing ? 'Confirm New Password' : 'Confirm Password'} {!editing && <span>*</span>}</label>
        <input id={`${scope}-confirm`} type={showPasswords[scope] ? 'text' : 'password'} placeholder="Re-enter the password" minLength={editing ? undefined : 12} maxLength={128} required={!editing} autoComplete="new-password" value={values.confirmPassword} onChange={e => setValues(previous => ({ ...previous, confirmPassword: e.target.value }))} />
      </div>
      <label className="sm-staff-show-password"><input type="checkbox" checked={showPasswords[scope]} onChange={e => setShowPasswords(previous => ({ ...previous, [scope]: e.target.checked }))} /> Show passwords</label>
      <p className="sm-staff-help">{editing ? 'Password fields are optional. Fill both to set a new password.' : 'Use a unique password of 12–128 characters. Both password fields must match.'}</p>
    </div>
  );

  return (
    <main className="sm-staff-page">
      <header className="sm-staff-heading"><div><p className="sm-staff-eyebrow">SMART HR / ADMIN WORKSPACE</p><h1>HR Staff Management</h1><p>Manage your company's HR team, account access, and staff credentials.</p></div><span className="sm-staff-heading-icon" aria-hidden="true">👥</span></header>
      {error && <div className="sm-staff-alert sm-staff-alert-error" role="alert">{error}</div>}
      {success && <div className="sm-staff-alert sm-staff-alert-success" role="status">{success}</div>}
      <section className="sm-staff-stats" aria-label="HR Staff statistics">
        <article className="sm-staff-stat"><span>Total HR Staff</span><strong>{fetching ? '—' : staff.length}</strong><small>Registered accounts</small></article>
        <article className="sm-staff-stat"><span>Active HR Staff</span><strong>{fetching ? '—' : activeCount}</strong><small>Currently enabled</small></article>
        <article className="sm-staff-stat"><span>Inactive HR Staff</span><strong>{fetching ? '—' : staff.length - activeCount}</strong><small>Access disabled</small></article>
      </section>
      {editId && <section ref={editSectionRef} className="sm-staff-card sm-staff-edit-card"><div className="sm-staff-section-title"><div><h2>Edit HR Staff</h2><p>Update account information or optionally set a new password.</p></div></div><form onSubmit={saveEdit}>{fields(editForm, setEditForm, 'edit', true)}<div className="sm-staff-actions"><button className="sm-staff-button sm-staff-button-primary" type="submit" disabled={busyId !== null}>{busyId ? 'Saving...' : 'Save Changes'}</button><button className="sm-staff-button sm-staff-button-muted" type="button" disabled={busyId !== null} onClick={() => { setEditId(null); setEditForm(blankForm()); }}>Cancel</button></div></form></section>}
      <section className="sm-staff-card"><div className="sm-staff-section-title"><div><h2>Add HR Staff</h2><p>Create a new account for a member of your HR team.</p></div></div><form onSubmit={createStaff}>{fields(form, setForm, 'create')}<div className="sm-staff-actions"><button className="sm-staff-button sm-staff-button-primary" type="submit" disabled={loading || busyId !== null}>{loading ? 'Creating Account...' : '+ Create HR Staff'}</button></div></form></section>

      <section className="sm-staff-card"><div className="sm-staff-section-title"><div><h2>Existing HR Staff</h2><p>Review staff details and manage account status.</p></div><button type="button" className="sm-staff-button sm-staff-button-muted" onClick={loadStaff} disabled={fetching}>Refresh</button></div>{fetching ? <p>Loading staff accounts...</p> : staff.length === 0 ? <p>No HR Staff accounts found yet.</p> : <div className="sm-staff-table-wrap"><table className="sm-staff-table"><thead><tr><th>Name</th><th>Email Address</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>{staff.map(member => { const id = member._id || member.id; return <tr key={id}><td className="sm-staff-name">{member.name}</td><td>{member.email}</td><td>HR Staff</td><td><span className={`sm-staff-status ${member.isActive ? 'is-active' : 'is-inactive'}`}>{member.isActive ? 'Active' : 'Inactive'}</span></td><td><div className="sm-staff-table-actions"><button type="button" className="sm-staff-button sm-staff-button-edit" onClick={() => startEdit(member)} disabled={busyId !== null}>Edit</button><button type="button" className={`sm-staff-button ${member.isActive ? 'sm-staff-button-danger' : 'sm-staff-button-success'}`} onClick={() => toggleStatus(member)} disabled={busyId !== null}>{busyId === id ? 'Updating...' : member.isActive ? 'Deactivate' : 'Activate'}</button></div></td></tr>; })}</tbody></table></div>}</section>
    </main>
  );
}
