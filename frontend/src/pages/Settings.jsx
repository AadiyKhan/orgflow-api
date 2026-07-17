import React, { useState, useEffect } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import { Shield, Key, Bell, Palette, User as UserIcon, Check, Copy } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // UI state
  const [toast, setToast] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await api.get('/users/me/');
        setUser(response.data);
        setFirstName(response.data.first_name || '');
        setLastName(response.data.last_name || '');
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      await api.patch(`/users/${user.id}/`, {
        first_name: firstName,
        last_name: lastName
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const generateApiKey = () => {
    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(`org_live_${randomString}`);
    setShowApiKey(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    showToast('API Key copied to clipboard!');
  };

  return (
    <Layout pageTitle="Workspace Settings">
      <div style={{ padding: '2.5rem', flex: 1, overflowY: 'auto', position: 'relative' }}>
        
        {/* Toast Notification */}
        {toast && (
          <div style={{ 
            position: 'fixed', bottom: '2rem', right: '2rem', 
            background: 'var(--gradient-vibe)', color: '#fff', 
            padding: '0.75rem 1.5rem', borderRadius: '8px', 
            boxShadow: '0 8px 32px var(--accent-glow)', 
            fontWeight: '500', zIndex: 100,
            animation: 'float 2s ease-in-out infinite'
          }}>
            {toast}
          </div>
        )}

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <h2 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '2rem' }}>General Settings</h2>
          
          <div className="flex-col gap-4">

            {/* Profile Settings */}
            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
              <div className="flex gap-4 items-start mb-6">
                <UserIcon size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)', margin: 0 }}>My Profile</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>Update your personal details.</p>
                </div>
              </div>
              
              <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>First Name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Last Name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                  {message && <span style={{ fontSize: '0.8125rem', color: message.includes('Failed') ? 'var(--danger)' : 'var(--success)' }}>{message}</span>}
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="glass-card flex justify-between items-center" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
              <div className="flex gap-4">
                <Shield size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>Security & Authentication</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>Manage your password, 2FA, and active sessions.</p>
                </div>
              </div>
              <button onClick={() => showToast('Security settings are optimal.')} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>Manage</button>
            </div>

            <div className="glass-card flex justify-between items-center" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
              <div className="flex gap-4">
                <Palette size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>Appearance</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>Customize theme, density, and accessibility options.</p>
                </div>
              </div>
              <button onClick={() => showToast('Appearance synced with system.')} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>Manage</button>
            </div>

            <div className="glass-card flex justify-between items-center" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
              <div className="flex gap-4">
                <Bell size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>Notifications</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>Configure email and push notification preferences.</p>
                </div>
              </div>
              <button onClick={() => showToast('Notifications configured.')} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>Manage</button>
            </div>
            
            <div className="glass-card flex justify-between items-center" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--bg-card)', borderLeft: '3px solid var(--danger)' }}>
              <div className="flex gap-4">
                <Key size={20} color="var(--danger)" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>API Keys</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>Generate API tokens for programmatic access.</p>
                </div>
              </div>
              <button onClick={generateApiKey} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger)' }}>Generate Token</button>
            </div>

          </div>
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKey && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '450px', padding: '2.5rem' }}>
            <h3 className="text-gradient" style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>New API Token Generated</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Make sure to copy your API key now. You won't be able to see it again!
            </p>
            
            <div className="flex items-center justify-between" style={{ background: '#0A0A0B', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <code style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', letterSpacing: '0.05em' }}>{apiKey}</code>
              <button onClick={copyToClipboard} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <Copy size={16} />
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <button type="button" className="btn btn-primary" onClick={() => setShowApiKey(false)}>
                I have copied the key
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
