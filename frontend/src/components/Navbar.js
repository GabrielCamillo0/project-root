import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from '../hooks/useAuth';
import '../styles/Navbar.css';

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado de colapso e se o modo manual (toggle) está ativo
  const [collapsed, setCollapsed] = useState(true);
  const [manual, setManual] = useState(false);
  
  // Estado para desabilitar a transição (usado em troca de página)
  const [disableTransition, setDisableTransition] = useState(false);
  
  const initialMount = useRef(true);

  // Função para alternar o estado da sidebar via botão (TopBar)
  const toggleSidebar = useCallback(() => {
    // Ao clicar, reabilitamos a transição para o efeito de toggle
    setDisableTransition(false);
    if (collapsed) {
      setCollapsed(false);
      setManual(true);
    } else {
      setCollapsed(true);
      setManual(false);
    }
  }, [collapsed]);

  // Escuta o evento global disparado pelo TopBar
  useEffect(() => {
    const handleToggleEvent = () => {
      toggleSidebar();
    };
    window.addEventListener('toggleSidebar', handleToggleEvent);
    return () => window.removeEventListener('toggleSidebar', handleToggleEvent);
  }, [toggleSidebar]);

  // Ao trocar de página, force a sidebar a ficar expandida sem animação
  useEffect(() => {
    // No primeiro carregamento não forçamos nada
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    // Força a sidebar a ficar aberta e ativa o modo manual
    setCollapsed(false);
    setManual(true);
    // Desativa a transição para evitar animação
    setDisableTransition(true);
    // (Opcional) Você pode reabilitar a transição após um curto intervalo, 
    // mas se deseja que a troca de página não tenha animação, deixe desabilitado.
  }, [location.pathname]);

  // Eventos de hover só atuam se não estivermos em modo manual
  const handleMouseEnter = () => {
    if (!manual) {
      setCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!manual) {
      setCollapsed(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div 
      className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ transition: disableTransition ? 'none' : 'width 0.3s ease-in-out' }}
    >
      <div className="sidebar-content">       
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
