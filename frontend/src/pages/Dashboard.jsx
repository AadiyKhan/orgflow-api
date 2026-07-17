import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LayoutDashboard, CheckCircle2, Clock, Circle, LogOut } from 'lucide-react';

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
    <div className="container flex-col" style={{ height: '100vh', padding: '1rem 2rem' }}>
      
      {/* Header */}
      <header className="flex justify-between items-center glass-panel" style={{ padding: '1rem 2rem', marginBottom: '2rem' }}>
        <div className="flex items-center gap-4">
          <LayoutDashboard size={24} color="var(--accent-primary)" />
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>OrgFlow</h1>
        </div>
        <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center" style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your workspace...</p>
        </div>
      ) : (
        <div className="flex gap-4" style={{ flex: 1, overflow: 'hidden' }}>
          
          {/* To Do Column */}
          <div className="flex-col glass-panel" style={{ flex: 1, padding: '1.5rem', background: 'rgba(22, 27, 34, 0.4)' }}>
            <h3 className="flex items-center gap-4" style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>
              <Circle size={18} color="var(--text-secondary)" /> To Do <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{todoTasks.length}</span>
            </h3>
            <div className="flex-col gap-4" style={{ overflowY: 'auto', paddingRight: '0.5rem' }}>
              {todoTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="flex-col glass-panel" style={{ flex: 1, padding: '1.5rem', background: 'rgba(22, 27, 34, 0.4)' }}>
            <h3 className="flex items-center gap-4" style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>
              <Clock size={18} color="var(--accent-primary)" /> In Progress <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{inProgressTasks.length}</span>
            </h3>
            <div className="flex-col gap-4" style={{ overflowY: 'auto', paddingRight: '0.5rem' }}>
              {inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          </div>

          {/* Done Column */}
          <div className="flex-col glass-panel" style={{ flex: 1, padding: '1.5rem', background: 'rgba(22, 27, 34, 0.4)' }}>
            <h3 className="flex items-center gap-4" style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>
              <CheckCircle2 size={18} color="var(--success)" /> Done <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{doneTasks.length}</span>
            </h3>
            <div className="flex-col gap-4" style={{ overflowY: 'auto', paddingRight: '0.5rem' }}>
              {doneTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function TaskCard({ task }) {
  return (
    <div className="glass-card flex-col" style={{ gap: '0.75rem', cursor: 'pointer' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>ORG-{task.id?.substring(0,4).toUpperCase()}</p>
      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>{task.title}</h4>
      {task.assignee_details && (
        <div className="flex items-center gap-4" style={{ marginTop: '0.5rem' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
            {task.assignee_details.first_name?.[0]}{task.assignee_details.last_name?.[0]}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {task.assignee_details.first_name} {task.assignee_details.last_name}
          </span>
        </div>
      )}
    </div>
  );
}
