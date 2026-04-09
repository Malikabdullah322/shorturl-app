import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const res = await axios.get('/me');
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/login', { email, password });
    setUser(res.data);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/register', { name, email, password });
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post('/logout');
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
