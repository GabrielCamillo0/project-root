import React, { createContext, useState, useEffect } from 'react';

// Cria o contexto para autenticação
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado para armazenar token e informações do usuário
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    user: null
  });

  useEffect(() => {
    // Se houver token, você pode decodificá-lo ou buscar informações do usuário
    // Exemplo: setAuth({ token, user: decodedUser });
  }, []);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    setAuth({ token, user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
