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
      const res = await api.post('/auth/token/', { email, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
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
        <div className="auth-logo"><Layers size={18} color="white" /></div>
        <h1 className="auth-title">Sign in to OrgFlow</h1>
        <p className="auth-subtitle">Enter your credentials to continue</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="flex-col gap-3">
          <div><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required /></div>
          <div><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required /></div>
          <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading} style={{ padding: '0.5rem' }}>
            {loading ? 'Signing in...' : (<>Continue <ArrowRight size={15} /></>)}
          </button>
        </form>
      </div>
    </div>
  );
}
