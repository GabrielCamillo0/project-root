import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicialmente, recupera o token do localStorage; o usuário é nulo.
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    user: null,
  });

  useEffect(() => {
    // Se houver token e o usuário ainda não estiver definido, definimos um usuário dummy.
    // Em produção, você buscaria os dados reais do usuário.
    if (auth.token && !auth.user) {
      const dummyUser = { id: 1, username: 'demoUser', role: 'gestor' };
      setAuth({ token: auth.token, user: dummyUser });
    }
  }, [auth.token, auth.user]);

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
