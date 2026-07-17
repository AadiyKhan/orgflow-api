import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { UserPlus } from 'lucide-react';
import Layout from '../components/Layout';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try { const r = await api.get('/members/'); setMembers(r.data.results || r.data); }
      catch (e) { if (e.response?.status === 401) navigate('/login'); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  const name = (m) => {
    const f = m.user_details?.first_name, l = m.user_details?.last_name;
    return (f || l) ? `${f || ''} ${l || ''}`.trim() : m.user_details?.email?.split('@')[0] || 'Unknown';
  };

  return (
    <Layout pageTitle="Team">
      <div className="page-scroll">
        <div className="page-center">
          <div className="page-header">
            <h2 className="page-title">Members</h2>
            <button className="btn btn-primary"><UserPlus size={14} /> Invite</button>
          </div>

          {loading ? (
            <div className="flex justify-center mt-4"><div className="spinner" /></div>
          ) : (
            <div className="card">
              {members.map(m => (
                <div key={m.id} className="member-row">
                  <div className="member-info">
                    <div className="avatar avatar-md">{name(m)[0]?.toUpperCase()}</div>
                    <div>
                      <div className="member-name">{name(m)}</div>
                      <div className="member-email">{m.user_details?.email}</div>
                    </div>
                  </div>
                  <span className={`badge ${m.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>{m.role}</span>
                </div>
              ))}
              {!members.length && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>No members found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
