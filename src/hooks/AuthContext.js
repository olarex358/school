import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // ✅ Fixed import

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const login = useCallback((newToken) => {
    try {
      const decodedUser = jwtDecode(newToken);  // ✅ Now works correctly
      
      const currentTime = Date.now() / 1000;
      if (decodedUser.exp < currentTime) {
        throw new Error('Token expired');
      }
      
      sessionStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(decodedUser);
    } catch (error) {
      console.error("Login error:", error);
      logout();
      throw error;
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);  // ✅ Now works correctly
        const currentTime = Date.now() / 1000;
        
        if (decodedUser.exp < currentTime) {
          console.warn("Token expired on mount");
          logout();
          return;
        }
        
        setUser(decodedUser);
      } catch (error) {
        console.error("Invalid token on mount:", error);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token, logout]);

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};