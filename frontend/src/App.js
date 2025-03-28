import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import AccountsPage from './pages/AccountsPage';
import TasksPage from './pages/TasksPage';
import CommunicationsPage from './pages/CommunicationsPage';
import PrivateRoute from './components/PrivateRoute';
import TopBar from './components/TopBar';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';

// Importação dos CSS
import './styles/custom.css';
import './styles/Navbar.css';
import './styles/TopBar.css';

const App = () => (
  <AuthProvider>
    <Router>
      {/* TopBar permanece fora do container */}
      <TopBar />
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/communications" element={<CommunicationsPage />} />
            </Route>
            <Route path="*" element={<h2 className="text-center mt-5">404 - Page Not Found</h2>} />
          </Routes>
        </div>
      </div>
    </Router>
  </AuthProvider>
);

export default App;
