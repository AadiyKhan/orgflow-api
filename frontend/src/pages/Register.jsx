import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { ArrowRight, Layers } from 'lucide-react';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
      const res = await api.post('/auth/register/', { 
        email, 
        password,
        first_name: firstName,
        last_name: lastName
      });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><Layers size={18} color="white" /></div>
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Join OrgFlow today</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="flex-col gap-3">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}><label>First Name</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" /></div>
            <div style={{ flex: 1 }}><label>Last Name</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" /></div>
          </div>
          <div><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" required /></div>
          <div><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create password" required /></div>
          <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading} style={{ padding: '0.5rem' }}>
            {loading ? 'Creating account...' : (<>Register <ArrowRight size={15} /></>)}
          </button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#38bdf8', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
