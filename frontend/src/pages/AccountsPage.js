// frontend/src/pages/AccountsPage.js
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FormInput from '../components/Forminput';
import api from '../services/api';
import '../styles/custom.css';

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    industry: '',
    website: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError('Error loading accounts');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/accounts/${editingId}`, form);
        setAccounts(accounts.map(account => account.id === editingId ? res.data : account));
        setEditingId(null);
      } else {
        const res = await api.post('/accounts', form);
        setAccounts([...accounts, res.data]);
      }
      setForm({ name: '', industry: '', website: '' });
    } catch (err) {
      console.error('Error saving account:', err);
      setError('Error saving account');
    }
  };

  const handleEdit = (account) => {
    setEditingId(account.id);
    setForm({
      name: account.name,
      industry: account.industry,
      website: account.website,
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/accounts/${id}`);
      setAccounts(accounts.filter(account => account.id !== id));
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Error deleting account');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container page-container">
        <h2>Accounts</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card page-card">
          <div className="card-header page-card-header bg-primary">
            Account Form
          </div>
          <div className="card-body page-card-body">
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter account name"
              />
              <FormInput
                label="Industry"
                type="text"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                placeholder="Enter industry"
              />
              <FormInput
                label="Website"
                type="url"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="Enter website URL"
              />
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Account' : 'Create Account'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary ml-2"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ name: '', industry: '', website: '' });
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
            Accounts List
          </div>
          <div className="card-body page-card-body">
            <ul className="list-group">
              {accounts.map(account => (
                <li key={account.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h5>{account.name}</h5>
                    <p>{account.industry} | {account.website}</p>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-warning mr-2" onClick={() => handleEdit(account)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(account.id)}>Delete</button>
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

export default AccountsPage;
