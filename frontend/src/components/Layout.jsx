import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, LogOut, Settings as SettingsIcon, Layers, Users } from 'lucide-react';

export default function Layout({ children, pageTitle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
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
    </div>
  );
}
