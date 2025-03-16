import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import AccountsPage from './pages/AccountsPage';
import TasksPage from './pages/TasksPage';
import CommunicationsPage from './pages/CommunicationsPage';
import PrivateRoute from './components/PrivateRoute';
import './styles/Navbar.css';

const App = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* Rotas protegidas */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/communications" element={<CommunicationsPage />} />
      </Route>
      {/* Redirecionamento para rotas inexistentes */}
      <Route path="*" element={<h2 className="text-center mt-5">404 - Page Not Found</h2>} />
    </Routes>
  </Router>
);

export default App;
