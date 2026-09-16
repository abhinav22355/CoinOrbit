import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on application load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('coinorbit_token');
        const storedUser = localStorage.getItem('coinorbit_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Optionally verify profile with backend
          try {
            const { data } = await API.get('/auth/profile');
            if (data.success && data.data) {
              setUser(data.data);
              localStorage.setItem('coinorbit_user', JSON.stringify(data.data));
            }
          } catch (profileErr) {
            // If token expired, axios interceptor handles redirect
            console.warn('Session verification error:', profileErr.message);
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        localStorage.removeItem('coinorbit_token');
        localStorage.removeItem('coinorbit_user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    if (data.success && data.token) {
      localStorage.setItem('coinorbit_token', data.token);
      localStorage.setItem('coinorbit_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  // Register handler
  const register = async (name, email, password) => {
    const { data } = await API.post('/auth/register', { name, email, password });
    return data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('coinorbit_token');
    localStorage.removeItem('coinorbit_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
