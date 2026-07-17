import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  LayoutDashboard, CheckCircle2, Clock, Circle, LogOut, 
  Search, Bell, Settings, Layers, Users, Command 
} from 'lucide-react';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks/');
        setTasks(response.data.results || response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  return (
    <div className="layout">
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="flex items-center gap-2" style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--accent-primary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Layers size={16} color="white" />
          </div>
          <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1rem', letterSpacing: '-0.02em' }}>OrgFlow</span>
        </div>

        <nav className="flex-col" style={{ flex: 1, gap: '0.25rem' }}>
          <a href="#" className="nav-item active">
            <LayoutDashboard size={18} /> Board
          </a>
          <a href="#" className="nav-item">
            <Users size={18} /> Team
          </a>
          <a href="#" className="nav-item">
            <Settings size={18} /> Settings
          </a>
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
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Alpha Launch</span>
          </div>

          <div className="flex items-center gap-4">
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input type="text" placeholder="Search tasks..." style={{ paddingLeft: '2rem', paddingRight: '2rem', padding: '0.5rem 2rem', fontSize: '0.8125rem' }} />
              <Command size={12} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            </div>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <Bell size={18} />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center" style={{ flex: 1 }}>
            <div style={{ width: '24px', height: '24px', border: '2px solid var(--glass-border)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          <div className="kanban-container">
            
            {/* To Do Column */}
            <div className="kanban-column">
              <div className="kanban-header">
                <Circle size={16} color="var(--todo-color)" /> To Do <span className="kanban-count">{todoTasks.length}</span>
              </div>
              <div className="kanban-body">
                {todoTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="kanban-column">
              <div className="kanban-header">
                <Clock size={16} color="var(--in-progress-color)" /> In Progress <span className="kanban-count">{inProgressTasks.length}</span>
              </div>
              <div className="kanban-body">
                {inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            </div>

            {/* Done Column */}
            <div className="kanban-column">
              <div className="kanban-header">
                <CheckCircle2 size={16} color="var(--done-color)" /> Done <span className="kanban-count">{doneTasks.length}</span>
              </div>
              <div className="kanban-body">
                {doneTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

function TaskCard({ task }) {
  // Extract initials
  const initials = task.assignee_details 
    ? `${task.assignee_details.first_name?.[0] || ''}${task.assignee_details.last_name?.[0] || ''}`.toUpperCase()
    : 'U';
    
  // If no name is provided, default to email prefix
  const displayName = task.assignee_details?.first_name 
    ? `${task.assignee_details.first_name} ${task.assignee_details.last_name}`
    : task.assignee_details?.email?.split('@')[0] || 'Unassigned';

  return (
    <div className="task-card flex-col">
      <div className="task-id">ORG-{task.id?.substring(0,4).toUpperCase() || '0000'}</div>
      <h4 className="task-title">{task.title}</h4>
      
      <div className="task-footer">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: '500' }}>
            ENGINEERING
          </span>
        </div>
        
        {task.assignee_details && (
          <div className="flex items-center gap-2">
            <div className="avatar" title={displayName}>
              {initials || displayName[0].toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
