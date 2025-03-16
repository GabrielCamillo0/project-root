// frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import FormInput from '../components/Forminput';
import '../styles/custom.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.token, { username });
      navigate('/dashboard');
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="container page-container">
      <div className="card page-card mx-auto" style={{ maxWidth: '400px' }}>
        <div className="card-header page-card-header bg-dark text-white">
          Login
        </div>
        <div className="card-body page-card-body">
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Username"
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <button type="submit" className="btn btn-primary btn-block">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
