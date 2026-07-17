import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import api from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await api.post('/auth/password-reset/', { email });
      setMessage(data.message || 'If an account with this email exists, a password reset link has been sent.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><ShieldAlert size={24} color="#000" /></div>
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">We'll send you a link to reset it.</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div style={{ background: 'var(--emerald-muted)', color: '#000', padding: '0.75rem', borderRadius: 'var(--r-md)', fontSize: '0.875rem', fontWeight: 600, border: '2px solid var(--border-default)', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="nav-link" style={{ justifyContent: 'center', color: 'var(--text-tertiary)', border: 'none' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
