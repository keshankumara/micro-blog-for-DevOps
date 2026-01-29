import { createContext, useState, useEffect } from 'react';
import { api } from '../api/axios';

// Local context definition
export const AuthContext = createContext(null);

// Initialize user from localStorage outside component to avoid setState in effect
const getInitialUser = () => {
  try {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
  }
  return null;
};

function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser());
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (!token || !user) {
        return { success: false, message: 'Invalid response format' };
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    if (!username || !email || !password) {
      return { success: false, message: 'All fields are required' };
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { token, user } = response.data;
      
      if (!token || !user) {
        return { success: false, message: 'Invalid response format' };
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Export component separately to satisfy fast refresh
export { AuthProvider };
