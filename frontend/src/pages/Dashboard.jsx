import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import Layout from '../components/Layout';

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

  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  return (
    <Layout pageTitle="Alpha Launch">
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
    </Layout>
  );
}

function TaskCard({ task }) {
  const initials = task.assignee_details 
    ? `${task.assignee_details.first_name?.[0] || ''}${task.assignee_details.last_name?.[0] || ''}`.toUpperCase()
    : 'U';
    
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
