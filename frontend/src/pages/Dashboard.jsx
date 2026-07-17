import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, MoreHorizontal, Circle, ArrowRight, CheckCircle2, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';

const STATUS_CONFIG = {
  TODO: { label: 'To Do', color: '#71717A' },
  IN_PROGRESS: { label: 'In Progress', color: '#3B82F6' },
  DONE: { label: 'Done', color: '#22C55E' },
};

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('TODO');
  const [newTitle, setNewTitle] = useState('');
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
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const openModal = (status) => {
    setModalStatus(status);
    setNewTitle('');
    setModalOpen(true);
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!projects.length) return;
    setSubmitting(true);
    try {
      const res = await api.post('/tasks/', { title: newTitle, status: modalStatus, project: projects[0].id });
      setTasks([res.data, ...tasks]);
      setModalOpen(false);
    } catch { /* silently fail */ }
    finally { setSubmitting(false); }
  };

  const changeStatus = async (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.patch(`/tasks/${taskId}/`, { status: newStatus });
    } catch {
      const res = await api.get('/tasks/');
      setTasks(res.data.results || res.data);
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    try {
      await api.delete(`/tasks/${taskId}/`);
    } catch {
      const res = await api.get('/tasks/');
      setTasks(res.data.results || res.data);
    }
  };

  const columns = ['TODO', 'IN_PROGRESS', 'DONE'];

  return (
    <Layout pageTitle={projects[0]?.name || 'Board'}>
      {loading ? (
        <div className="flex items-center justify-center" style={{ flex: 1 }}><div className="spinner"></div></div>
      ) : (
        <div className="kanban">
          {columns.map(status => {
            const cfg = STATUS_CONFIG[status];
            const colTasks = tasks.filter(t => t.status === status);
            return (
              <div className="kanban-col" key={status}>
                <div className="kanban-col-header">
                  <div className="kanban-col-label">
                    <span className="kanban-col-dot" style={{ background: cfg.color }}></span>
                    {cfg.label}
                    <span className="kanban-col-count">{colTasks.length}</span>
                  </div>
                  <button className="kanban-col-add" onClick={() => openModal(status)}>
                    <Plus size={16} />
                  </button>
                </div>
                <div className="kanban-col-body">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} onChangeStatus={changeStatus} onDelete={deleteTask} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal-card">
            <h3 className="modal-title">New task</h3>
            <p className="modal-desc">Adding to {STATUS_CONFIG[modalStatus].label}</p>
            <form onSubmit={createTask}>
              <div>
                <label>Title</label>
                <input autoFocus type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What needs to be done?" required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

function TaskCard({ task, onChangeStatus, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = task.assignee_details
    ? `${task.assignee_details.first_name?.[0] || ''}${task.assignee_details.last_name?.[0] || ''}`.toUpperCase() || task.assignee_details.email?.[0]?.toUpperCase()
    : null;

  const otherStatuses = ['TODO', 'IN_PROGRESS', 'DONE'].filter(s => s !== task.status);

  return (
    <div className="task-card" onMouseLeave={() => setMenuOpen(false)}>
      <div className="task-card-header">
        <span className="task-card-id">ORG-{task.id?.substring(0, 4).toUpperCase()}</span>
        <div style={{ position: 'relative' }}>
          <button className="task-card-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div className="dropdown-menu">
              {otherStatuses.map(s => (
                <button key={s} className="dropdown-item" onClick={() => { onChangeStatus(task.id, s); setMenuOpen(false); }}>
                  <ArrowRight size={14} />
                  Move to {STATUS_CONFIG[s].label}
                </button>
              ))}
              <div className="dropdown-separator"></div>
              <button className="dropdown-item" style={{ color: 'var(--red)' }} onClick={() => { onDelete(task.id); setMenuOpen(false); }}>
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="task-card-title">{task.title}</div>
      <div className="task-card-footer">
        <span className="task-card-tag">Engineering</span>
        {initials && <div className="avatar">{initials}</div>}
      </div>
    </div>
  );
}
