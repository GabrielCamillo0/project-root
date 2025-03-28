import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/TopBar.css';

const TopBar = () => {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    const updateState = () => {
      setCollapsed(sidebar.classList.contains('collapsed'));
    };
    updateState();
    const observer = new MutationObserver(updateState);
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleToggle = () => {
    window.dispatchEvent(new Event('toggleSidebar'));
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <Link to="/" className="top-bar-logo">
          <img
            src="https://i.imgur.com/Hw6gtnQ.png"
            className={`top-bar-logo-img ${collapsed ? 'hidden' : ''}`}
            alt="Logo"
          />
        </Link>
        <button className="navbar-toggler sidebar-toggle" type="button" onClick={handleToggle}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
      <div className="top-bar-right">
        {/* Outros elementos, se necessário */}
      </div>
    </div>
  );
};

export default TopBar;
