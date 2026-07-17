import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { LayoutDashboard, LogOut, Settings as SettingsIcon, Layers, Users, Folder, Plus } from 'lucide-react';

export default function Layout({ children, pageTitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects/');
      return data.results || data;
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/projects/', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setCreateModalOpen(false);
      setNewProjectName('');
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    createProjectMutation.mutate({ name: newProjectName });
  };

  const cls = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><Layers size={13} color="white" /></div>
          <span className="sidebar-brand-name">OrgFlow</span>
        </div>

        <div className="sidebar-section-label">Workspace</div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={cls('/dashboard')}><LayoutDashboard size={15} /> Board</Link>
          <Link to="/team" className={cls('/team')}><Users size={15} /> Team</Link>
          <Link to="/settings" className={cls('/settings')}><SettingsIcon size={15} /> Settings</Link>
        </nav>

        <div className="sidebar-section-label" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Projects
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setCreateModalOpen(true)}>
            <Plus size={14} />
          </button>
        </div>
        <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}>
          {projects.map(p => (
            <Link key={p.id} to={`/dashboard?project=${p.id}`} className={cls(`/dashboard?project=${p.id}`)}>
              <Folder size={15} /> {p.name}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-link"><LogOut size={15} /> Sign out</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="top-bar">
          <span className="top-bar-parent">Workspace</span>
          <span className="top-bar-separator">/</span>
          <span className="top-bar-title">{pageTitle}</span>
        </header>
        {children}
      </main>

      {isCreateModalOpen && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setCreateModalOpen(false); }}>
          <div className="modal">
            <h3 className="modal-title">New Project</h3>
            <p className="modal-desc">Create a new project workspace.</p>
            <form onSubmit={handleCreateProject} className="flex-col gap-3">
              <div>
                <label>Project Name</label>
                <input 
                  autoFocus 
                  type="text" 
                  value={newProjectName} 
                  onChange={e => setNewProjectName(e.target.value)} 
                  placeholder="e.g. Marketing Campaign" 
                  required 
                />
              </div>
              
              <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
                <button type="button" className="btn" onClick={() => setCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createProjectMutation.isPending}>
                  {createProjectMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
