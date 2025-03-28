import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FormInput from '../components/Forminput';
import api from '../services/api';
import { Modal, Button } from 'react-bootstrap';
import '../styles/custom.css';

const CommunicationsPage = () => {
  const [communications, setCommunications] = useState([]);
  const [error, setError] = useState('');
  
  // Estado para o formulário principal de comunicação (criação/edição)
  const [form, setForm] = useState({
    type: '',
    content: '',
    contact_id: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showCommModal, setShowCommModal] = useState(false);
  
  // Estado para o formulário de follow-up
  const [followUpForm, setFollowUpForm] = useState({
    contact_id: '',
    content: ''
  });
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  const fetchCommunications = async () => {
    try {
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

  // Handlers para o formulário principal de comunicação
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCommSubmit = async (e) => {
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
      setShowCommModal(false);
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
    setShowCommModal(true);
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

  const handleCloseCommModal = () => {
    setShowCommModal(false);
    setEditingId(null);
    setForm({ type: '', content: '', contact_id: '' });
  };

  const handleShowCommModal = () => {
    setEditingId(null);
    setForm({ type: '', content: '', contact_id: '' });
    setShowCommModal(true);
  };

  // Handlers para o formulário de follow-up
  const handleFollowUpChange = (e) => {
    setFollowUpForm({ ...followUpForm, [e.target.name]: e.target.value });
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/communications/follow-up', {
        contact_id: followUpForm.contact_id,
        content: followUpForm.content,
        type: 'follow-up'
      });
      setCommunications([...communications, res.data]);
      setFollowUpForm({ contact_id: '', content: '' });
      setShowFollowUpModal(false);
    } catch (err) {
      console.error('Error creating follow-up communication:', err);
      setError('Error creating follow-up communication');
    }
  };

  const handleCloseFollowUpModal = () => {
    setShowFollowUpModal(false);
    setFollowUpForm({ contact_id: '', content: '' });
  };

  const handleShowFollowUpModal = () => {
    setFollowUpForm({ contact_id: '', content: '' });
    setShowFollowUpModal(true);
  };

  return (
    <div>
      <Navbar />
      <div className="container page-container my-4">
        {/* Cabeçalho com dois botões: um para comunicação e outro para follow-up */}
        <div className="d-flex flex-column align-items-end mb-3">
          <h2>Communications</h2>
          <div className="d-flex flex-column align-items-end">
            <Button variant="primary" onClick={handleShowCommModal} className="mb-2">
              New Communication
            </Button>
            <Button variant="secondary" onClick={handleShowFollowUpModal}>
              New Follow-up
            </Button>
          </div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Modal para o formulário principal de comunicação */}
        <Modal show={showCommModal} onHide={handleCloseCommModal}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Edit Communication' : 'New Communication'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleCommSubmit}>
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
              <Button type="submit" variant="primary" className="mt-3">
                {editingId ? 'Update Communication' : 'Create Communication'}
              </Button>
            </form>
          </Modal.Body>
        </Modal>

        {/* Modal para o formulário de follow-up */}
        <Modal show={showFollowUpModal} onHide={handleCloseFollowUpModal}>
          <Modal.Header closeButton>
            <Modal.Title>New Follow-up Communication</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleFollowUpSubmit}>
              <FormInput
                label="Contact ID"
                type="text"
                name="contact_id"
                value={followUpForm.contact_id}
                onChange={handleFollowUpChange}
                placeholder="Enter contact ID"
              />
              <FormInput
                label="Follow-up Content"
                type="text"
                name="content"
                value={followUpForm.content}
                onChange={handleFollowUpChange}
                placeholder="Enter follow-up message"
              />
              <Button type="submit" variant="secondary" className="mt-3">
                Create Follow-up
              </Button>
            </form>
          </Modal.Body>
        </Modal>

        {/* Lista de Communications */}
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
                    <Button variant="warning" size="sm" onClick={() => handleEdit(comm)} className="mr-2">
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(comm.id)}>
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

export default CommunicationsPage;
