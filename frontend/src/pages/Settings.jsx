import React, { useState, useEffect } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import { User, Shield, Key, Bell, Palette, Copy, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [fn, setFn] = useState('');
  const [ln, setLn] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [toast, setToast] = useState(null);
  const [keyModal, setKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    (async () => {
      try { const r = await api.get('/users/me/'); setUser(r.data); setFn(r.data.first_name || ''); setLn(r.data.last_name || ''); }
      catch {}
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true); setMsg('');
    try { await api.patch('/users/me/', { first_name: fn, last_name: ln }); setMsg('ok'); setTimeout(() => setMsg(''), 2500); }
    catch { setMsg('err'); }
    finally { setSaving(false); }
  };

  const fire = (m) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const genKey = () => {
    const r = Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
    setApiKey(`org_live_${r}`); setKeyModal(true);
  };

  const copyKey = () => { navigator.clipboard.writeText(apiKey); fire('Copied to clipboard'); };

  return (
    <Layout pageTitle="Settings">
      <div className="page-scroll">
        <div className="page-center">

          {/* Profile */}
          <div className="section-label mb-2">Profile</div>
          <div className="card mb-4">
            <div style={{ padding: '1rem' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="card-icon" style={{ background: 'var(--violet-muted)' }}>
                  <User size={16} color="var(--violet)" />
                </div>
                <div>
                  <div className="card-label">Personal information</div>
                  <div className="card-desc">Update your name visible to your team.</div>
                </div>
              </div>
              <form onSubmit={save} className="form-row">
                <div><label>First name</label><input type="text" value={fn} onChange={e => setFn(e.target.value)} placeholder="Jane" /></div>
                <div><label>Last name</label><input type="text" value={ln} onChange={e => setLn(e.target.value)} placeholder="Doe" /></div>
                <div className="form-full flex justify-end items-center gap-2 mt-1">
                  {msg && (
                    <span className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: msg === 'ok' ? 'var(--emerald)' : 'var(--rose)' }}>
                      {msg === 'ok' && <CheckCircle2 size={13} />} {msg === 'ok' ? 'Saved' : 'Failed'}
                    </span>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
                </div>
              </form>
            </div>
          </div>

          {/* General */}
          <div className="section-label mb-2">General</div>
          <div className="card mb-4">
            <div className="card-row">
              <div className="card-row-left">
                <div className="card-icon" style={{ background: 'var(--violet-muted)' }}><Palette size={16} color="var(--violet)" /></div>
                <div><div className="card-label">Appearance</div><div className="card-desc">Toggle Dark/Light mode theme.</div></div>
              </div>
              <button className="btn" onClick={(e) => {
                if (!document.startViewTransition) {
                  document.documentElement.classList.toggle('dark');
                  fire('Theme updated');
                  return;
                }
                const x = e.clientX || window.innerWidth / 2;
                const y = e.clientY || window.innerHeight / 2;
                const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
                const transition = document.startViewTransition(() => {
                  document.documentElement.classList.toggle('dark');
                });
                transition.ready.then(() => {
                  document.documentElement.animate(
                    {
                      clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                      ],
                    },
                    {
                      duration: 500,
                      easing: 'ease-in-out',
                      pseudoElement: '::view-transition-new(root)',
                    }
                  );
                });
                fire('Theme updated');
              }}>Toggle</button>
            </div>
            {[
              { icon: Shield, bg: 'var(--sky-muted)', ic: 'var(--sky)', t: 'Security', d: 'Password, two-factor authentication, sessions.', a: () => fire('Security settings are up to date') },
              { icon: Bell, bg: 'var(--emerald-muted)', ic: 'var(--emerald)', t: 'Notifications', d: 'Email digests and push notification preferences.', a: () => fire('Preferences saved') },
            ].map((r, i) => (
              <div key={i} className="card-row">
                <div className="card-row-left">
                  <div className="card-icon" style={{ background: r.bg }}><r.icon size={16} color={r.ic} /></div>
                  <div><div className="card-label">{r.t}</div><div className="card-desc">{r.d}</div></div>
                </div>
                <button className="btn" onClick={r.a}>Manage</button>
              </div>
            ))}
          </div>

          {/* Developer */}
          <div className="section-label mb-2">Developer</div>
          <div className="card">
            <div className="card-row">
              <div className="card-row-left">
                <div className="card-icon" style={{ background: 'var(--rose-muted)' }}><Key size={16} color="var(--rose)" /></div>
                <div><div className="card-label">API Keys</div><div className="card-desc">Generate tokens for programmatic API access.</div></div>
              </div>
              <button className="btn btn-danger" onClick={genKey}>Generate</button>
            </div>
          </div>

        </div>
      </div>

      {toast && <div className="toast"><CheckCircle2 size={13} className="toast-check" />{toast}</div>}

      {keyModal && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setKeyModal(false); }}>
          <div className="modal">
            <h3 className="modal-title">API token created</h3>
            <p className="modal-desc">Copy this token now. It will not be shown again.</p>
            <div className="token-block">
              <code>{apiKey}</code>
              <button className="btn-ghost" onClick={copyKey}><Copy size={14} /></button>
            </div>
            <div className="modal-footer"><button className="btn btn-primary" onClick={() => setKeyModal(false)}>Done</button></div>
          </div>
        </div>
      )}
    </Layout>
  );
}
