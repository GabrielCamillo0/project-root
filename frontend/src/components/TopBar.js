import React, { useState, useEffect } from 'react';
import '../styles/TopBar.css';

const TopBar = () => {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const updateState = () => {
      setCollapsed(sidebar.classList.contains('collapsed'));
    };

    // Atualiza imediatamente e observa mudanças na classe
    updateState();
    const observer = new MutationObserver(updateState);
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleToggle = () => {
    // Dispara o evento que a Navbar está escutando
    window.dispatchEvent(new Event('toggleSidebar'));
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <button className="sidebar-toggle" onClick={handleToggle}>
          <i className={`fa ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
