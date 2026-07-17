import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Check, X } from 'lucide-react';
import api from '../api';

export default function Invite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await api.post('/auth/invite/accept/', { token });
      setMessage(data.message || 'Invitation accepted successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept invitation. The link might be invalid or expired.');
      setLoading(false);
    }
  };

  const handleDecline = () => {
    navigate('/login');
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Invalid Link</h1>
          <p className="auth-subtitle text-center">This invitation link is invalid or missing the required token.</p>
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
        <div className="auth-logo"><Mail size={24} color="#000" /></div>
        <h1 className="auth-title">You're Invited!</h1>
        <p className="auth-subtitle">You have been invited to join an organization on OrgFlow.</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div style={{ background: 'var(--emerald-muted)', color: '#000', padding: '0.75rem', borderRadius: 'var(--r-md)', fontSize: '0.875rem', fontWeight: 600, border: '2px solid var(--border-default)', marginBottom: '1rem', textAlign: 'center' }}>{message}<br/><small>Redirecting to login...</small></div>}

        {!message && (
          <div className="flex-col gap-4">
            <button className="btn btn-primary w-full" onClick={handleAccept} disabled={loading}>
              {loading ? 'Accepting...' : <><Check size={16} /> Accept Invitation</>}
            </button>
            <button className="btn w-full" onClick={handleDecline} disabled={loading} style={{ background: 'var(--surface-2)' }}>
              <X size={16} /> Decline
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
