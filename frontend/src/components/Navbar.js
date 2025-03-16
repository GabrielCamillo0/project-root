import React from 'react';
import { useNavigate,Link } from "react-router-dom";
import useAuth from '../hooks/useAuth';
import '../styles/Navbar.css';

const Sidebar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar bg-light">
      {/* Logo at top */}
      <div className="sidebar-logo">
        <Link to="/">
          <img src="/logo.png" alt="Logo" className="img-fluid p-3" />
        </Link>
      </div>

      {/* Navigation Links */}
      {auth.token && (
        <div className="sidebar-menu">
          <ul className="nav flex-column">
                            
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                <i className="fa fa-tachometer-alt mr-2"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contacts">
                <i className="fa fa-address-book mr-2"></i> Contacts
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/opportunities">
                <i className="fa fa-chart-line mr-2"></i> Opportunities
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/accounts">
                <i className="fa fa-briefcase mr-2"></i> Accounts
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/tasks">
                <i className="fa fa-tasks mr-2"></i> Tasks
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/communications">
                <i className="fa fa-comment mr-2"></i> Communications
              </Link>
            </li>
            
            
            <li className="nav-item user-profile">
              <div className="nav-link">
                <span></span>
                <i className="fa fa-chevron-right float-right"></i>
              </div>
            </li>
            <li className="nav-item">
              <button className="btn btn-outline-danger w-100 mt-2" onClick={handleLogout}>
                <i className="fa fa-sign-out-alt mr-2"></i> Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;