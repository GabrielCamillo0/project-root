import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FormInput from '../components/Forminput';
import api from '../services/api';
import { Modal, Button } from 'react-bootstrap';
import '../styles/custom.css';
import '../styles/Contacts.css';


const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'lead',
    lead_score: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError('Error loading contacts');
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/contacts/${editingId}`, form);
        setContacts(contacts.map(contact => contact.id === editingId ? res.data : contact));
        setEditingId(null);
      } else {
        const res = await api.post('/contacts', form);
        setContacts([...contacts, res.data]);
      }
      setForm({ name: '', email: '', phone: '', status: 'lead', lead_score: 0 });
      setShowModal(false);
    } catch (err) {
      console.error('Error saving contact:', err);
      setError('Error saving contact');
    }
  };

  const handleEdit = (contact) => {
    setEditingId(contact.id);
    setForm({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      status: contact.status,
      lead_score: contact.lead_score || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/contacts/${id}`);
      setContacts(contacts.filter(contact => contact.id !== id));
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Error deleting contact');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', status: 'lead', lead_score: 0 });
  };

  const handleShowModal = () => {
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', status: 'lead', lead_score: 0 });
    setShowModal(true);
  };

  return (
    <div>
      <Navbar />
      <div className="container page-container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Contacts</h2>
          <Button variant="primary" onClick={handleShowModal}>
            New Contact
          </Button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Modal Popup para o formulário */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Edit Contact' : 'New Contact'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter name"
              />
              <FormInput
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
              <FormInput
                label="Phone"
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone"
              />
              <FormInput
                label="Status"
                type="text"
                name="status"
                value={form.status}
                onChange={handleChange}
                placeholder="Enter status (e.g., lead, client)"
              />
              <FormInput
                label="Score"
                type="number"
                name="lead_score"
                value={form.lead_score}
                onChange={handleChange}
                placeholder="Enter score"
              />
              <Button type="submit" variant="primary" className="mt-3">
                {editingId ? 'Update Contact' : 'Create Contact'}
              </Button>
            </form>
          </Modal.Body>
        </Modal>

        {/* Tabela de contatos */}
        <div className="card page-card">
          <div className="card-header page-card-header">
            Contacts List
          </div>
          <div className="card-body page-card-body">
            <table className="contacts-table">
              <thead className="thead-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length > 0 ? (
                  contacts.map(contact => (
                    <tr key={contact.id}>
                      <td>{contact.id}</td>
                      <td>{contact.name}</td>
                      <td>{contact.email}</td>
                      <td>{contact.phone}</td>
                      <td>{contact.status}</td>
                      <td>{contact.lead_score || 0}</td>
                      <td>{contact.creator_name || contact.user_id}</td>
                      <td>
                        <button className="btn btn-sm btn-warning mr-2" onClick={() => handleEdit(contact)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(contact.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
