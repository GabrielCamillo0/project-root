import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FormInput from '../components/Forminput';
import api from '../services/api';
import { Modal, Button } from 'react-bootstrap';
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
  const [showModal, setShowModal] = useState(false);

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
      setShowModal(false);
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
    setShowModal(true);
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

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ title: '', description: '', due_date: '', status: 'pending', contact_id: '' });
  };

  const handleShowModal = () => {
    setEditingId(null);
    setForm({ title: '', description: '', due_date: '', status: 'pending', contact_id: '' });
    setShowModal(true);
  };

  return (
    <div>
      <Navbar />
      <div className="container page-container my-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Tasks</h2>
          <Button variant="primary" onClick={handleShowModal}>
            New Task
          </Button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Modal Popup para o formulário */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Edit Task' : 'New Task'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
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
              <FormInput
                label="Contact ID"
                type="text"
                name="contact_id"
                value={form.contact_id}
                onChange={handleChange}
                placeholder="Enter contact ID"
              />
              <Button type="submit" variant="primary" className="mt-3">
                {editingId ? 'Update Task' : 'Create Task'}
              </Button>
            </form>
          </Modal.Body>
        </Modal>

        {/* Lista de Tasks */}
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
                    <Button variant="warning" size="sm" onClick={() => handleEdit(task)} className="mr-2">
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(task.id)}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
