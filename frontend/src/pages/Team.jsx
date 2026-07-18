import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { UserPlus } from 'lucide-react';
import Layout from '../components/Layout';

export default function Team() {
  const queryClient = useQueryClient();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviteError, setInviteError] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/users/me/');
      return data;
    }
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data } = await api.get('/members/');
      return data.results || data;
    }
  });

  const inviteMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/auth/invite/', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['members']);
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteError(null);
    },
    onError: (err) => {
      setInviteError(err.response?.data?.error || 'Failed to invite user');
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/members/${id}/`);
    },
    onSuccess: () => queryClient.invalidateQueries(['members'])
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      await api.patch(`/members/${id}/`, { role });
    },
    onSuccess: () => queryClient.invalidateQueries(['members'])
  });

  const handleInvite = (e) => {
    e.preventDefault();
    setInviteError(null);
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const name = (m) => {
    const f = m.user?.first_name, l = m.user?.last_name;
    return (f || l) ? `${f || ''} ${l || ''}`.trim() : m.user?.email?.split('@')[0] || 'Unknown';
  };

  const currentMember = members.find(m => m.user?.id === currentUser?.id);
  const isAdmin = currentMember?.role === 'ADMIN';

  return (
    <Layout pageTitle="Team">
      <div className="page-scroll">
        <div className="page-center">
          <div className="page-header">
            <h2 className="page-title">Members</h2>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => setInviteModalOpen(true)}>
                <UserPlus size={14} /> Invite
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center mt-4"><div className="spinner" /></div>
          ) : (
            <div className="card">
              {members.map(m => (
                <div key={m.id} className="member-row">
                  <div className="member-info">
                    <div className="avatar avatar-md">{name(m)[0]?.toUpperCase()}</div>
                    <div>
                      <div className="member-name">{name(m)}</div>
                      <div className="member-email">{m.user?.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span className={`badge ${m.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>{m.role}</span>
                    {isAdmin && m.user?.id !== currentUser?.id && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => roleMutation.mutate({ id: m.id, role: m.role === 'ADMIN' ? 'MEMBER' : 'ADMIN' })}
                          disabled={roleMutation.isPending}
                        >
                          {m.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                        </button>
                        <button 
                          className="btn" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderColor: '#f87171' }}
                          onClick={() => { if(window.confirm('Remove this member?')) removeMutation.mutate(m.id) }}
                          disabled={removeMutation.isPending}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!members.length && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>No members found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {inviteModalOpen && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setInviteModalOpen(false); }}>
          <div className="modal">
            <h3 className="modal-title">Invite Member</h3>
            <p className="modal-desc">Add a new member to your organization.</p>
            {inviteError && <div className="auth-error" style={{ marginBottom: '1rem' }}>{inviteError}</div>}
            
            <form onSubmit={handleInvite} className="flex-col gap-3">
              <div>
                <label>Email Address</label>
                <input 
                  autoFocus 
                  type="email" 
                  value={inviteEmail} 
                  onChange={e => setInviteEmail(e.target.value)} 
                  placeholder="colleague@example.com" 
                  required 
                />
              </div>
              <div>
                <label>Role</label>
                <select 
                  value={inviteRole} 
                  onChange={e => setInviteRole(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem', border: 'var(--border-width) solid #000', borderRadius: 'var(--r-md)', fontSize: '0.9375rem', fontWeight: '500' }}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
                <button type="button" className="btn" onClick={() => setInviteModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
