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
    const fetchMembers = async () => {
      try {
        const response = await api.get('/members/');
        setMembers(response.data.results || response.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [navigate]);

  const getName = (m) => {
    const first = m.user_details?.first_name;
    const last = m.user_details?.last_name;
    if (first || last) return `${first || ''} ${last || ''}`.trim();
    return m.user_details?.email?.split('@')[0] || 'Unknown';
  };

  const getInitial = (m) => {
    const name = getName(m);
    return name[0]?.toUpperCase() || '?';
  };

  return (
    <Layout pageTitle="Team">
      <div className="page-container">
        <div className="page-inner">
          <div className="page-header">
            <h2 className="page-title">Members</h2>
            <button className="btn btn-primary"><UserPlus size={14} /> Invite</button>
          </div>

          {loading ? (
            <div className="flex justify-center mt-4"><div className="spinner"></div></div>
          ) : (
            <div className="card">
              {members.map((member, i) => (
                <div key={member.id} className="member-row" style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}>
                  <div className="member-info">
                    <div className="avatar avatar-lg">{getInitial(member)}</div>
                    <div>
                      <div className="member-name">{getName(member)}</div>
                      <div className="member-email">{member.user_details?.email}</div>
                    </div>
                  </div>
                  <span className={`badge ${member.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>
                    {member.role}
                  </span>
                </div>
              ))}
              {members.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No team members found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
