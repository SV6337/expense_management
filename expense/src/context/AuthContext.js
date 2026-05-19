import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import authReducer from './authReducer';
// Import your centralized API Base URL variable
import API_BASE_URL from '../config/api'; 

const initialState = {
  user: null,
  loading: false,
  error: null
};

export const AuthContext = createContext(initialState);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Cleanly wire the auth route prefix to your production NodePort string
  const API_BASE = `${API_BASE_URL}/auth`;

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        dispatch({ type: 'SET_USER', payload: JSON.parse(storedUser) });
        // Set default Authorization header for all axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (err) {
        console.error('Error restoring user:', err);
      }
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      const { user, token } = res.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true, user };
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errMsg });
      return { success: false, error: errMsg };
    }
  };

  // Signup function
  const signup = async (name, email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const res = await axios.post(`${API_BASE}/signup`, { name, email, password });
      const { user, token } = res.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      dispatch({ type: 'SIGNUP_SUCCESS', payload: user });
      return { success: true, user };
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Signup failed';
      dispatch({ type: 'AUTH_ERROR', payload: errMsg });
      return { success: false, error: errMsg };
    }
  };

  // Update profile function
  const updateProfile = async (updatedData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const res = await axios.put(`${API_BASE}/profile`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = res.data.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: updatedUser });
      return { success: true, user: updatedUser };
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Update failed';
      dispatch({ type: 'AUTH_ERROR', payload: errMsg });
      return { success: false, error: errMsg };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      user: state.user,
      loading: state.loading,
      error: state.error,
      login,
      signup,
      updateProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};