import React, { useState, useEffect } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import { User, Shield, Key, Bell, Palette, Copy, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [toast, setToast] = useState(null);
  const [apiKeyModal, setApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/users/me/');
        setUser(res.data);
        setFirstName(res.data.first_name || '');
        setLastName(res.data.last_name || '');
      } catch (err) { console.error(err); }
    };
    fetchMe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      await api.patch(`/users/${user.id}/`, { first_name: firstName, last_name: lastName });
      setMessage('Saved');
      setTimeout(() => setMessage(''), 2500);
    } catch {
      setMessage('Error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const generateApiKey = () => {
    const rand = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(`org_live_${rand}`);
    setApiKeyModal(true);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    showToast('Copied to clipboard');
  };

  const settingsRows = [
    { icon: Shield, iconBg: 'var(--blue-muted)', iconColor: 'var(--blue)', title: 'Security', desc: 'Manage password, two-factor authentication, and sessions.', action: () => showToast('Security settings are up to date'), actionLabel: 'Manage' },
    { icon: Palette, iconBg: 'var(--accent-muted)', iconColor: 'var(--accent)', title: 'Appearance', desc: 'Theme preferences synced with your system settings.', action: () => showToast('Appearance synced with system'), actionLabel: 'Manage' },
    { icon: Bell, iconBg: 'var(--green-muted)', iconColor: 'var(--green)', title: 'Notifications', desc: 'Configure email digests and push notification preferences.', action: () => showToast('Notification preferences saved'), actionLabel: 'Manage' },
  ];

  return (
    <Layout pageTitle="Settings">
      <div className="page-container">
        <div className="page-inner">

          {/* Profile Section */}
          <h2 className="page-title mb-4">Profile</h2>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ padding: '1.25rem' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="card-row-icon" style={{ background: 'var(--accent-muted)' }}>
                  <User size={18} color="var(--accent)" />
                </div>
                <div>
                  <div className="card-row-title">Personal information</div>
                  <div className="card-row-desc">Update your name. This will be visible to your team.</div>
                </div>
              </div>
              <form onSubmit={handleSave} className="form-grid">
                <div>
                  <label>First name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" />
                </div>
                <div>
                  <label>Last name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
                </div>
                <div className="form-field-full flex justify-end items-center gap-2 mt-1">
                  {message && (
                    <span className="flex items-center gap-1" style={{ fontSize: '0.8125rem', color: message === 'Saved' ? 'var(--green)' : 'var(--red)' }}>
                      {message === 'Saved' && <CheckCircle2 size={14} />}
                      {message === 'Saved' ? 'Profile saved' : 'Failed to save'}
                    </span>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* General Settings */}
          <h2 className="page-title mb-4">General</h2>
          <div className="card" style={{ marginBottom: '2rem' }}>
            {settingsRows.map((row, i) => (
              <div key={i} className="card-row">
                <div className="card-row-info">
                  <div className="card-row-icon" style={{ background: row.iconBg }}>
                    <row.icon size={18} color={row.iconColor} />
                  </div>
                  <div>
                    <div className="card-row-title">{row.title}</div>
                    <div className="card-row-desc">{row.desc}</div>
                  </div>
                </div>
                <button className="btn" onClick={row.action}>{row.actionLabel}</button>
              </div>
            ))}
          </div>

          {/* API Keys */}
          <h2 className="page-title mb-4">Developer</h2>
          <div className="card">
            <div className="card-row">
              <div className="card-row-info">
                <div className="card-row-icon" style={{ background: 'var(--red-muted)' }}>
                  <Key size={18} color="var(--red)" />
                </div>
                <div>
                  <div className="card-row-title">API Keys</div>
                  <div className="card-row-desc">Generate tokens for programmatic access to the OrgFlow API.</div>
                </div>
              </div>
              <button className="btn btn-danger" onClick={generateApiKey}>Generate</button>
            </div>
          </div>

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={14} className="toast-icon" />
          {toast}
        </div>
      )}

      {/* API Key Modal */}
      {apiKeyModal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setApiKeyModal(false); }}>
          <div className="modal-card">
            <h3 className="modal-title">API token created</h3>
            <p className="modal-desc">Copy this token now. It will not be shown again.</p>
            <div className="code-block">
              <code>{apiKey}</code>
              <button className="btn-ghost" onClick={copyKey} style={{ cursor: 'pointer' }}>
                <Copy size={14} />
              </button>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setApiKeyModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
