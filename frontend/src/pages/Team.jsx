import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
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

  return (
    <Layout pageTitle="Team Members">
      <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Organization Members</h2>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Invite Member
            </button>
          </div>
          
          {loading ? (
             <p style={{ color: 'var(--text-secondary)' }}>Loading members...</p>
          ) : (
            <div className="flex-col gap-2">
              {members.map(member => (
                <div key={member.id} className="glass-card flex items-center justify-between" style={{ padding: '1rem 1.5rem', borderRadius: '8px' }}>
                  <div className="flex items-center gap-4">
                    <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>
                      {member.user_details?.first_name?.[0]?.toUpperCase() || member.user_details?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: '500', color: 'var(--text-primary)', margin: 0 }}>
                        {member.user_details?.first_name || member.user_details?.last_name
                          ? `${member.user_details.first_name} ${member.user_details.last_name}`.trim()
                          : member.user_details?.email?.split('@')[0]}
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {member.user_details?.email}
                      </p>
                    </div>
                  </div>
                  <span style={{ 
                    padding: '4px 10px', 
                    background: member.role === 'ADMIN' ? 'rgba(229, 72, 77, 0.1)' : 'rgba(255,255,255,0.05)', 
                    color: member.role === 'ADMIN' ? 'var(--danger)' : 'var(--text-secondary)',
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: '500' 
                  }}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
