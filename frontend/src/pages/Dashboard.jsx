import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Plus, MoreHorizontal, ArrowRight, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLS = [
  { key: 'TODO',        label: 'To Do',       color: 'var(--amber)' },
  { key: 'IN_PROGRESS', label: 'In Progress',  color: 'var(--sky)' },
  { key: 'DONE',        label: 'Done',         color: 'var(--emerald)' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('project');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('TODO');
  const [newTitle, setNewTitle] = useState('');

  const [activeTask, setActiveTask] = useState(null);
  const [editTask, setEditTask] = useState(null);

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: async () => (await api.get('/projects/')).data.results || (await api.get('/projects/')).data });
  const activeProject = projectId ? projects.find(p => p.id === projectId) : projects[0];

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', activeProject?.id],
    queryFn: async () => {
      if (!activeProject?.id) return [];
      const { data } = await api.get(`/tasks/?project=${activeProject.id}`);
      return data.results || data;
    },
    enabled: !!activeProject?.id
  });

  const { data: members = [] } = useQuery({ queryKey: ['members'], queryFn: async () => (await api.get('/members/')).data.results || (await api.get('/members/')).data });

  const createTaskMut = useMutation({
    mutationFn: async (payload) => (await api.post('/tasks/', payload)).data,
    onSuccess: () => { queryClient.invalidateQueries(['tasks', activeProject?.id]); setModalOpen(false); setNewTitle(''); }
  });

  const updateTaskMut = useMutation({
    mutationFn: async ({ id, ...payload }) => (await api.patch(`/tasks/${id}/`, payload)).data,
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries(['tasks', activeProject?.id]);
      const previousTasks = queryClient.getQueryData(['tasks', activeProject?.id]);
      queryClient.setQueryData(['tasks', activeProject?.id], old => old.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
      return { previousTasks };
    },
    onError: (err, newTodo, context) => queryClient.setQueryData(['tasks', activeProject?.id], context.previousTasks),
    onSettled: () => queryClient.invalidateQueries(['tasks', activeProject?.id])
  });

  const deleteTaskMut = useMutation({
    mutationFn: async (id) => await api.delete(`/tasks/${id}/`),
    onSuccess: () => queryClient.invalidateQueries(['tasks', activeProject?.id])
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveTask(tasks.find(t => t.id === active.id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    
    const activeTask = tasks.find(t => t.id === active.id);
    const overCol = COLS.find(c => c.key === over.id);
    const overTask = tasks.find(t => t.id === over.id);

    const newStatus = overCol ? overCol.key : (overTask ? overTask.status : activeTask.status);
    
    if (activeTask.status !== newStatus) {
      updateTaskMut.mutate({ id: activeTask.id, status: newStatus });
    }
  };

  if (!activeProject) {
    return (
      <Layout pageTitle="Board">
        <div className="flex items-center justify-center" style={{ flex: 1, color: 'var(--text-tertiary)' }}>
          Please select or create a project.
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={activeProject.name}>
      {isLoading ? (
        <div className="flex items-center justify-center" style={{ flex: 1 }}><div className="spinner" /></div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="kanban">
            {COLS.map(col => {
              const colTasks = tasks.filter(t => t.status === col.key);
              return (
                <KanbanColumn 
                  key={col.key} 
                  col={col} 
                  tasks={colTasks} 
                  onAdd={() => { setModalStatus(col.key); setNewTitle(''); setModalOpen(true); }}
                  onClickTask={setEditTask}
                />
              );
            })}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* CREATE TASK MODAL */}
      {modalOpen && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal">
            <h3 className="modal-title">New task</h3>
            <p className="modal-desc">Adding to {COLS.find(c => c.key === modalStatus)?.label}</p>
            <form onSubmit={e => { e.preventDefault(); createTaskMut.mutate({ title: newTitle, status: modalStatus, project: activeProject.id }); }}>
              <label>Title</label>
              <input autoFocus type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What needs to be done?" required />
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createTaskMut.isPending}>{createTaskMut.isPending ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editTask && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setEditTask(null); }}>
          <div className="modal" style={{ maxWidth: '500px' }}>
            <h3 className="modal-title">Edit Task</h3>
            <div className="task-card-id mb-3">ORG-{editTask.id?.substring(0, 4).toUpperCase()}</div>
            
            <form onSubmit={e => {
              e.preventDefault();
              updateTaskMut.mutate({ id: editTask.id, title: editTask.title, description: editTask.description, assignee: editTask.assignee });
              setEditTask(null);
            }} className="flex-col gap-3">
              <div>
                <label>Title</label>
                <input type="text" value={editTask.title} onChange={e => setEditTask({...editTask, title: e.target.value})} required />
              </div>
              <div>
                <label>Description</label>
                <textarea 
                  value={editTask.description || ''} 
                  onChange={e => setEditTask({...editTask, description: e.target.value})} 
                  style={{ width: '100%', padding: '0.625rem', border: 'var(--border-width) solid #000', borderRadius: 'var(--r-md)', minHeight: '100px', resize: 'vertical' }}
                  placeholder="Add a detailed description..."
                />
              </div>
              <div>
                <label>Assignee</label>
                <select 
                  value={editTask.assignee || ''} 
                  onChange={e => setEditTask({...editTask, assignee: e.target.value || null})}
                  style={{ width: '100%', padding: '0.625rem', border: 'var(--border-width) solid #000', borderRadius: 'var(--r-md)', fontSize: '0.9375rem', fontWeight: '500' }}
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.user_details.id} value={m.user_details.id}>{m.user_details.email}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer" style={{ marginTop: '1rem', justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-danger" onClick={() => { deleteTaskMut.mutate(editTask.id); setEditTask(null); }}>Delete</button>
                <div className="flex gap-2">
                  <button type="button" className="btn" onClick={() => setEditTask(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={updateTaskMut.isPending}>Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

import { useDroppable } from '@dnd-kit/core';

function KanbanColumn({ col, tasks, onAdd, onClickTask }) {
  const { setNodeRef } = useDroppable({ id: col.key });

  return (
    <div className="kanban-col">
      <div className="kanban-col-head">
        <div className="kanban-col-info">
          <span className="kanban-dot" style={{ background: col.color }} />
          {col.label}
          <span className="kanban-col-count">{tasks.length}</span>
        </div>
        <button className="kanban-add-btn" onClick={onAdd}><Plus size={15} /></button>
      </div>
      <div className="kanban-col-body" ref={setNodeRef}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(t => (
            <SortableTaskCard key={t.id} task={t} onClick={() => onClickTask(t)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function SortableTaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
      <TaskCard task={task} />
    </div>
  );
}

function TaskCard({ task }) {
  const initials = task.assignee_details
    ? (`${task.assignee_details.first_name?.[0] || ''}${task.assignee_details.last_name?.[0] || ''}`.toUpperCase() || task.assignee_details.email?.[0]?.toUpperCase())
    : null;

  return (
    <div className="task-card">
      <div className="task-card-top">
        <span className="task-card-id">ORG-{task.id?.substring(0, 4).toUpperCase()}</span>
      </div>
      <div className="task-card-title">{task.title}</div>
      <div className="task-card-meta">
        <span className="task-card-tag">Engineering</span>
        {initials && <div className="avatar">{initials}</div>}
      </div>
    </div>
  );
}
