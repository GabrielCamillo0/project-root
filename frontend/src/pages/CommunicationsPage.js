// frontend/src/pages/CommunicationsPage.js
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FormInput from '../components/Forminput';
import api from '../services/api';
import '../styles/custom.css';

const CommunicationsPage = () => {
  const [communications, setCommunications] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    type: '',
    content: '',
    contact_id: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchCommunications = async () => {
    try {
      // Para gestores, retorna todos; para usuários comuns, a filtragem será feita no backend
      const res = await api.get('/communications');
      setCommunications(res.data);
    } catch (err) {
      console.error("Error fetching communications:", err);
      setError('Error loading communications');
    }
  };

  useEffect(() => {
    fetchCommunications();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/communications/${editingId}`, form);
        setCommunications(communications.map(comm => comm.id === editingId ? res.data : comm));
        setEditingId(null);
      } else {
        const res = await api.post('/communications', form);
        setCommunications([...communications, res.data]);
      }
      setForm({ type: '', content: '', contact_id: '' });
    } catch (err) {
      console.error('Error saving communication:', err);
      setError('Error saving communication');
    }
  };

  const handleEdit = (comm) => {
    setEditingId(comm.id);
    setForm({
      type: comm.type,
      content: comm.content,
      contact_id: comm.contact_id
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/communications/${id}`);
      setCommunications(communications.filter(comm => comm.id !== id));
    } catch (err) {
      console.error('Error deleting communication:', err);
      setError('Error deleting communication');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container page-container">
        <h2>Communications</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card page-card">
          <div className="card-header page-card-header bg-danger">
            Communication Form
          </div>
          <div className="card-body page-card-body">
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Type"
                type="text"
                name="type"
                value={form.type}
                onChange={handleChange}
                placeholder="Enter type (e.g., email, call)"
              />
              <FormInput
                label="Content"
                type="text"
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Enter content"
              />
              <FormInput
                label="Contact ID"
                type="text"
                name="contact_id"
                value={form.contact_id}
                onChange={handleChange}
                placeholder="Enter contact ID"
              />
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Communication' : 'Create Communication'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary ml-2"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ type: '', content: '', contact_id: '' });
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
            Communications List
          </div>
          <div className="card-body page-card-body">
            <ul className="list-group">
              {communications.map(comm => (
                <li key={comm.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h5>{comm.type}</h5>
                    <p>
                      {comm.content} | Contact ID: {comm.contact_id} | {comm.created_at ? new Date(comm.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-warning mr-2" onClick={() => handleEdit(comm)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(comm.id)}>Delete</button>
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

export default CommunicationsPage;
