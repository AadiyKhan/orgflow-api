import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, LogOut, Search, Bell, 
  Settings as SettingsIcon, Layers, Users, Command 
} from 'lucide-react';

export default function Layout({ children, pageTitle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? "nav-item active" : "nav-item";

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="flex items-center gap-2" style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--gradient-vibe)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Layers size={16} color="white" />
          </div>
          <span className="text-gradient" style={{ fontWeight: '700', fontSize: '1.25rem', letterSpacing: '-0.02em' }}>OrgFlow</span>
        </div>

        <nav className="flex-col" style={{ flex: 1, gap: '0.25rem' }}>
          <Link to="/dashboard" className={isActive('/dashboard')}>
            <LayoutDashboard size={18} /> Board
          </Link>
          <Link to="/team" className={isActive('/team')}>
            <Users size={18} /> Team
          </Link>
          <Link to="/settings" className={isActive('/settings')}>
            <SettingsIcon size={18} /> Settings
          </Link>
        </nav>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Top Header */}
        <header className="top-header">
          <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>ACME Corp</span>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{pageTitle}</span>
          </div>

          <div className="flex items-center gap-4">
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input type="text" placeholder="Search..." style={{ paddingLeft: '2rem', paddingRight: '2rem', padding: '0.5rem 2rem', fontSize: '0.8125rem' }} />
              <Command size={12} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            </div>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        {children}

      </main>
    </div>
  );
}
