import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, MoreHorizontal, ArrowRight, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';

const COLS = [
  { key: 'TODO',        label: 'To Do',       color: 'var(--amber)' },
  { key: 'IN_PROGRESS', label: 'In Progress',  color: 'var(--sky)' },
  { key: 'DONE',        label: 'Done',         color: 'var(--emerald)' },
];

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
    (async () => {
      try {
        const [t, p] = await Promise.all([api.get('/tasks/'), api.get('/projects/')]);
        setTasks(t.data.results || t.data);
        setProjects(p.data.results || p.data);
      } catch (err) { if (err.response?.status === 401) navigate('/login'); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  const openCreate = (status) => { setModalStatus(status); setNewTitle(''); setModalOpen(true); };

  const createTask = async (e) => {
    e.preventDefault();
    if (!projects.length) return;
    setSubmitting(true);
    try {
      const res = await api.post('/tasks/', { title: newTitle, status: modalStatus, project: projects[0].id });
      setTasks(prev => [res.data, ...prev]);
      setModalOpen(false);
    } catch { /* */ } finally { setSubmitting(false); }
  };

  const moveTask = async (id, status) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    try { await api.patch(`/tasks/${id}/`, { status }); }
    catch { const r = await api.get('/tasks/'); setTasks(r.data.results || r.data); }
  };

  const removeTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try { await api.delete(`/tasks/${id}/`); }
    catch { const r = await api.get('/tasks/'); setTasks(r.data.results || r.data); }
  };

  return (
    <Layout pageTitle={projects[0]?.name || 'Board'}>
      {loading ? (
        <div className="flex items-center justify-center" style={{ flex: 1 }}><div className="spinner" /></div>
      ) : (
        <div className="kanban">
          {COLS.map(col => {
            const items = tasks.filter(t => t.status === col.key);
            return (
              <div className="kanban-col" key={col.key}>
                <div className="kanban-col-head">
                  <div className="kanban-col-info">
                    <span className="kanban-dot" style={{ background: col.color }} />
                    {col.label}
                    <span className="kanban-col-count">{items.length}</span>
                  </div>
                  <button className="kanban-add-btn" onClick={() => openCreate(col.key)}><Plus size={15} /></button>
                </div>
                <div className="kanban-col-body">
                  {items.map(t => (
                    <TaskCard key={t.id} task={t} onMove={moveTask} onDelete={removeTask} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal">
            <h3 className="modal-title">New task</h3>
            <p className="modal-desc">Adding to {COLS.find(c => c.key === modalStatus)?.label}</p>
            <form onSubmit={createTask}>
              <label>Title</label>
              <input autoFocus type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What needs to be done?" required />
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

function TaskCard({ task, onMove, onDelete }) {
  const [open, setOpen] = useState(false);
  const initials = task.assignee_details
    ? (`${task.assignee_details.first_name?.[0] || ''}${task.assignee_details.last_name?.[0] || ''}`.toUpperCase() || task.assignee_details.email?.[0]?.toUpperCase())
    : null;

  const targets = COLS.filter(c => c.key !== task.status);

  return (
    <div className="task-card" onMouseLeave={() => setOpen(false)}>
      <div className="task-card-top">
        <span className="task-card-id">ORG-{task.id?.substring(0, 4).toUpperCase()}</span>
        <div style={{ position: 'relative' }}>
          <button className="task-card-actions" onClick={() => setOpen(!open)}><MoreHorizontal size={14} /></button>
          {open && (
            <div className="ctx-menu">
              {targets.map(t => (
                <button key={t.key} className="ctx-item" onClick={() => { onMove(task.id, t.key); setOpen(false); }}>
                  <ArrowRight size={13} /> Move to {t.label}
                </button>
              ))}
              <div className="ctx-divider" />
              <button className="ctx-item ctx-item--danger" onClick={() => { onDelete(task.id); setOpen(false); }}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="task-card-title">{task.title}</div>
      <div className="task-card-meta">
        <span className="task-card-tag">Engineering</span>
        {initials && <div className="avatar">{initials}</div>}
      </div>
    </div>
  );
}
