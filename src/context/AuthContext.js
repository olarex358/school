import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);
  const isAuthed = !!token;

  useEffect(() => {
    console.debug('[AuthProvider] mounted, token present:', !!token);
    if (token) localStorage.setItem('authToken', token);
    else localStorage.removeItem('authToken');
  }, [token]);

  const login = (newToken) => setToken(newToken);
  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, isAuthed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // don't crash — helpful for debugging. Replace with throw when fixed.
    console.warn('useAuth() called but no AuthProvider found in the tree.');
    return { token: null, isAuthed: false, login: () => {}, logout: () => {} };
  }
  return ctx;
}