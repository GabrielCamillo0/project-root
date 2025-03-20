import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import useAuth from '../hooks/useAuth';
import '../styles/Navbar.css';

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [manual, setManual] = useState(false);

  const toggleSidebar = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    // Se a sidebar for expandida manualmente (collapsed === false) desativa os efeitos de hover.
    setManual(!newCollapsed);
  };

  // Escuta o evento global disparado pelo TopBar
  useEffect(() => {
    const handleToggleEvent = () => {
      toggleSidebar();
    };

    window.addEventListener('toggleSidebar', handleToggleEvent);
    return () => {
      window.removeEventListener('toggleSidebar', handleToggleEvent);
    };
  }, [collapsed]); // Note: usamos collapsed para refletir a alteração

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div 
      className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}
      {...(!manual && {
        onMouseEnter: () => setCollapsed(false),
        onMouseLeave: () => setCollapsed(true)
      })}
    >
      <div className="sidebar-content">
        <div className="sidebar-logo">
          <Link to="/">
            <img src="/logo.png" alt="Logo" />
          </Link>
        </div>
        {auth.token && (
          <ul className="nav">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                <i className="fa fa-tachometer-alt"></i>
                <span className="nav-text">Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contacts">
                <i className="fa fa-address-book"></i>
                <span className="nav-text">Contacts</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/opportunities">
                <i className="fa fa-chart-line"></i>
                <span className="nav-text">Opportunities</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/accounts">
                <i className="fa fa-briefcase"></i>
                <span className="nav-text">Accounts</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/tasks">
                <i className="fa fa-tasks"></i>
                <span className="nav-text">Tasks</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/communications">
                <i className="fa fa-comment"></i>
                <span className="nav-text">Communications</span>
              </Link>
            </li>
          </ul>
        )}
      </div>

      {auth.token && (
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <i className="fa fa-sign-out-alt"></i>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
