import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { CheckCircle2, Clock, Circle, Plus, MoreHorizontal } from 'lucide-react';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('TODO');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          api.get('/tasks/'),
          api.get('/projects/')
        ]);
        setTasks(tasksRes.data.results || tasksRes.data);
        setProjects(projectsRes.data.results || projectsRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleOpenModal = (status) => {
    setNewTaskStatus(status);
    setNewTaskTitle('');
    setIsModalOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!projects.length) return alert('No projects exist in this organization.');
    setSubmitting(true);
    try {
      const response = await api.post('/tasks/', {
        title: newTaskTitle,
        status: newTaskStatus,
        project: projects[0].id // Default to first project
      });
      setTasks([response.data, ...tasks]);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await api.patch(`/tasks/${taskId}/`, { status: newStatus });
    } catch (err) {
      console.error(err);
      alert('Failed to update task');
      // Revert if failed by refetching
      const response = await api.get('/tasks/');
      setTasks(response.data.results || response.data);
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  return (
    <Layout pageTitle={projects[0]?.name || "Dashboard"}>
      {loading ? (
        <div className="flex items-center justify-center" style={{ flex: 1 }}>
          <div style={{ width: '24px', height: '24px', border: '2px solid var(--glass-border)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : (
        <div className="kanban-container">
          
          {/* To Do Column */}
          <div className="kanban-column">
            <div className="kanban-header flex justify-between">
              <div className="flex items-center gap-2">
                <Circle size={16} color="var(--todo-color)" /> To Do <span className="kanban-count">{todoTasks.length}</span>
              </div>
              <button onClick={() => handleOpenModal('TODO')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <Plus size={16} />
              </button>
            </div>
            <div className="kanban-body">
              {todoTasks.map(task => <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />)}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="kanban-column">
            <div className="kanban-header flex justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} color="var(--in-progress-color)" /> In Progress <span className="kanban-count">{inProgressTasks.length}</span>
              </div>
              <button onClick={() => handleOpenModal('IN_PROGRESS')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <Plus size={16} />
              </button>
            </div>
            <div className="kanban-body">
              {inProgressTasks.map(task => <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />)}
            </div>
          </div>

          {/* Done Column */}
          <div className="kanban-column">
            <div className="kanban-header flex justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} color="var(--done-color)" /> Done <span className="kanban-count">{doneTasks.length}</span>
              </div>
              <button onClick={() => handleOpenModal('DONE')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <Plus size={16} />
              </button>
            </div>
            <div className="kanban-body">
              {doneTasks.map(task => <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />)}
            </div>
          </div>

        </div>
      )}

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Create Task</h3>
            <form onSubmit={handleCreateTask} className="flex-col gap-4">
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Task Title</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value)} 
                  placeholder="e.g. Implement redesign" 
                  required 
                />
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

function TaskCard({ task, onStatusChange }) {
  const [showMenu, setShowMenu] = useState(false);

  const initials = task.assignee_details 
    ? `${task.assignee_details.first_name?.[0] || ''}${task.assignee_details.last_name?.[0] || ''}`.toUpperCase()
    : 'U';
    
  const displayName = task.assignee_details?.first_name 
    ? `${task.assignee_details.first_name} ${task.assignee_details.last_name}`
    : task.assignee_details?.email?.split('@')[0] || 'Unassigned';

  const nextStatus = task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';

  return (
    <div className="task-card flex-col" onMouseLeave={() => setShowMenu(false)}>
      <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
        <div className="task-id">ORG-{task.id?.substring(0,4).toUpperCase() || '0000'}</div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
            <MoreHorizontal size={14} />
          </button>
          
          {showMenu && (
            <div className="glass-panel" style={{ position: 'absolute', right: 0, top: '100%', padding: '0.5rem', zIndex: 50, minWidth: '150px' }}>
              <button 
                onClick={() => { onStatusChange(task.id, nextStatus); setShowMenu(false); }} 
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', padding: '0.5rem', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: '4px' }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                Move to {nextStatus.replace('_', ' ')}
              </button>
            </div>
          )}
        </div>
      </div>
      
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
