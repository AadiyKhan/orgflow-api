import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowRight, Layers } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/token/', { email, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="sidebar-brand-icon" style={{ margin: '0 auto 1rem', width: '40px', height: '40px' }}>
            <Layers size={20} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
            Sign in to OrgFlow
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Enter your credentials to continue
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--red-muted)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col gap-3">
          <div>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading} style={{ padding: '0.5rem' }}>
            {loading ? 'Signing in...' : (<>Continue <ArrowRight size={16} /></>)}
          </button>
        </form>
      </div>
    </div>
  );
}
