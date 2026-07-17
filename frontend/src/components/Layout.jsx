import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, LogOut, Search, Settings as SettingsIcon, Layers, Users } from 'lucide-react';

export default function Layout({ children, pageTitle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-item active' : 'nav-item';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Layers size={15} color="white" />
          </div>
          <span className="sidebar-brand-name">OrgFlow</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className={isActive('/dashboard')}>
            <LayoutDashboard size={16} /> Board
          </Link>
          <Link to="/team" className={isActive('/team')}>
            <Users size={16} /> Team
          </Link>
          <Link to="/settings" className={isActive('/settings')}>
            <SettingsIcon size={16} /> Settings
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <span className="breadcrumb-current">{pageTitle}</span>
          </div>
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
