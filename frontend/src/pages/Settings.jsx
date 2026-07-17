import React from 'react';
import Layout from '../components/Layout';
import { Shield, Key, Bell, Palette } from 'lucide-react';

export default function Settings() {
  return (
    <Layout pageTitle="Workspace Settings">
      <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <h2 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '2rem' }}>General Settings</h2>
          
          <div className="flex-col gap-4">
            
            <div className="glass-card flex justify-between items-center" style={{ padding: '1.25rem 1.5rem', borderRadius: '8px', cursor: 'default' }}>
              <div className="flex gap-4">
                <Shield size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>Security & Authentication</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>Manage your password, 2FA, and active sessions.</p>
                </div>
              </div>
              <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>Manage</button>
            </div>

            <div className="glass-card flex justify-between items-center" style={{ padding: '1.25rem 1.5rem', borderRadius: '8px', cursor: 'default' }}>
              <div className="flex gap-4">
                <Palette size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>Appearance</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>Customize theme, density, and accessibility options.</p>
                </div>
              </div>
              <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>Manage</button>
            </div>

            <div className="glass-card flex justify-between items-center" style={{ padding: '1.25rem 1.5rem', borderRadius: '8px', cursor: 'default' }}>
              <div className="flex gap-4">
                <Bell size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>Notifications</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>Configure email and push notification preferences.</p>
                </div>
              </div>
              <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>Manage</button>
            </div>
            
            <div className="glass-card flex justify-between items-center" style={{ padding: '1.25rem 1.5rem', borderRadius: '8px', cursor: 'default', borderLeft: '3px solid var(--danger)' }}>
              <div className="flex gap-4">
                <Key size={20} color="var(--danger)" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>API Keys</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>Generate API tokens for programmatic access.</p>
                </div>
              </div>
              <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'rgba(229, 72, 77, 0.1)', color: 'var(--danger)' }}>Generate Token</button>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
