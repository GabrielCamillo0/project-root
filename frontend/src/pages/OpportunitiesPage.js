// frontend/src/pages/OpportunitiesPage.js
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FormInput from '../components/Forminput';
import api from '../services/api';
import '../styles/custom.css';

const OpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    value: '',
    stage: 'new',
    contact_id: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchOpportunities = async () => {
    try {
      const res = await api.get('/opportunities');
      setOpportunities(res.data);
    } catch (err) {
      console.error("Error fetching opportunities:", err);
      setError('Error loading opportunities');
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/opportunities/${editingId}`, form);
        setOpportunities(opportunities.map(opp => opp.id === editingId ? res.data : opp));
        setEditingId(null);
      } else {
        const res = await api.post('/opportunities', form);
        setOpportunities([...opportunities, res.data]);
      }
      setForm({ title: '', value: '', stage: 'new', contact_id: '' });
    } catch (err) {
      console.error('Error saving opportunity:', err);
      setError('Error saving opportunity');
    }
  };

  const handleEdit = (opp) => {
    setEditingId(opp.id);
    setForm({
      title: opp.title,
      value: opp.value,
      stage: opp.stage,
      contact_id: opp.contact_id
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/opportunities/${id}`);
      setOpportunities(opportunities.filter(opp => opp.id !== id));
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      setError('Error deleting opportunity');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container page-container">
        <h2>Opportunities</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card page-card">
          <div className="card-header page-card-header bg-success">
            Opportunity Form
          </div>
          <div className="card-body page-card-body">
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter opportunity title"
              />
              <FormInput
                label="Value"
                type="number"
                name="value"
                value={form.value}
                onChange={handleChange}
                placeholder="Enter opportunity value"
              />
              <FormInput
                label="Stage"
                type="text"
                name="stage"
                value={form.stage}
                onChange={handleChange}
                placeholder="Enter stage (e.g., new, negotiation, closed)"
              />
              <FormInput
                label="Contact ID"
                type="text"
                name="contact_id"
                value={form.contact_id}
                onChange={handleChange}
                placeholder="Enter associated contact ID"
              />
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Opportunity' : 'Create Opportunity'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary ml-2"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ title: '', value: '', stage: 'new', contact_id: '' });
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
            Opportunities List
          </div>
          <div className="card-body page-card-body">
            <ul className="list-group">
              {opportunities.map(opp => (
                <li key={opp.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h5>{opp.title}</h5>
                    <p>Value: {opp.value} | Stage: {opp.stage} | Contact ID: {opp.contact_id}</p>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-warning mr-2" onClick={() => handleEdit(opp)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(opp.id)}>Delete</button>
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

export default OpportunitiesPage;
