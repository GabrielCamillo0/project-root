// frontend/src/pages/TasksPage.js
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FormInput from '../components/Forminput';
import api from '../services/api';
import '../styles/custom.css';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
    contact_id: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError('Error loading tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/tasks/${editingId}`, form);
        setTasks(tasks.map(task => task.id === editingId ? res.data : task));
        setEditingId(null);
      } else {
        const res = await api.post('/tasks', form);
        setTasks([...tasks, res.data]);
      }
      setForm({ title: '', description: '', due_date: '', status: 'pending', contact_id: '' });
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Error saving task');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      status: task.status,
      contact_id: task.contact_id || ''
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Error deleting task');
    }
  };

  // Função para criar follow-up task
  const handleFollowUp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks/follow-up', {
        contact_id: form.contact_id,
        description: form.description
      });
      setTasks([...tasks, res.data]);
    } catch (err) {
      console.error('Error creating follow-up task:', err);
      setError('Error creating follow-up task');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container page-container">
        <h2>Tasks</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card page-card">
          <div className="card-header page-card-header bg-warning text-dark">
            Task Form
          </div>
          <div className="card-body page-card-body">
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter task title"
              />
              <FormInput
                label="Description"
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter task description"
              />
              <FormInput
                label="Due Date"
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                placeholder="Enter due date"
              />
              <FormInput
                label="Status"
                type="text"
                name="status"
                value={form.status}
                onChange={handleChange}
                placeholder="Enter task status"
              />
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Task' : 'Create Task'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary ml-2"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ title: '', description: '', due_date: '', status: 'pending', contact_id: '' });
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>
        <div className="card page-card">
          <div className="card-header page-card-header">
            Tasks List
          </div>
          <div className="card-body page-card-body">
            <ul className="list-group">
              {tasks.map(task => (
                <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h5>{task.title}</h5>
                    <p>
                      {task.description} | Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'} | Status: {task.status}
                    </p>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-warning mr-2" onClick={() => handleEdit(task)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card page-card">
          <div className="card-header page-card-header bg-secondary text-white">
            Create Follow-up Task
          </div>
          <div className="card-body page-card-body">
            <form onSubmit={handleFollowUp}>
              <FormInput
                label="Contact ID"
                type="text"
                name="contact_id"
                value={form.contact_id}
                onChange={handleChange}
                placeholder="Enter associated contact ID"
              />
              <FormInput
                label="Follow-up Description"
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter follow-up description"
              />
              <button type="submit" className="btn btn-info">Create Follow-up</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
