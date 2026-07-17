import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import api from '../api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await api.post('/auth/password-reset/confirm/', { uid, token, password });
      setMessage(data.message || 'Password successfully reset!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link might be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Invalid Link</h1>
          <p className="auth-subtitle text-center">This password reset link is invalid or missing the required token.</p>
          <div className="mt-4 text-center">
            <Link to="/login" className="btn btn-primary w-full">Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><KeyRound size={24} color="#000" /></div>
        <h1 className="auth-title">New Password</h1>
        <p className="auth-subtitle">Choose a new password for your account.</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div style={{ background: 'var(--emerald-muted)', color: '#000', padding: '0.75rem', borderRadius: 'var(--r-md)', fontSize: '0.875rem', fontWeight: 600, border: '2px solid var(--border-default)', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

        {!message && (
          <form onSubmit={handleSubmit} className="flex-col gap-4">
            <div>
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
            <div>
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save New Password'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <Link to="/login" className="nav-link" style={{ justifyContent: 'center', color: 'var(--text-tertiary)', border: 'none' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
