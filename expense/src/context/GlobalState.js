import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import AppReducer from './AppReducer';
import API_BASE_URL from '../config/api';

const API_BASE = `${API_BASE_URL}/transactions`;

const initialState = {
  transactions: [],
  error: null,
  loading: true
};

export const GlobalContext = createContext(initialState);

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);
  const { user } = useAuth();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getTransactions = useCallback(async () => {
    try {
      console.debug('GET transactions from', API_BASE);
      const res = await axios.get(API_BASE, { headers: getAuthHeaders() });
      const data = res.data;
      console.debug('GET transactions response data', data);
      if (!data || data.success === false) throw new Error(data.error || 'Failed to fetch');
      dispatch({ type: 'GET_TRANSACTIONS', payload: data.data });
    } catch (err) {
      console.error('getTransactions error', err);
      const msg = err.response?.data?.error || err.message || 'Failed to fetch';
      dispatch({ type: 'TRANSACTION_ERROR', payload: msg });
    }
  }, []);

  // Add transaction
  const addTransaction = async (transaction) => {
    try {
      const res = await axios.post(API_BASE, transaction, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
      });
      const data = res.data;
      if (!data || data.success === false) throw new Error(Array.isArray(data.error) ? data.error.join(', ') : data.error || 'Failed to add');
      // Ensure UI reflects latest DB state by re-fetching transactions
      dispatch({ type: 'ADD_TRANSACTION', payload: data.data });
      try {
        await getTransactions();
      } catch (err) {
        console.warn('Could not refresh transactions after add:', err);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to add';
      dispatch({ type: 'TRANSACTION_ERROR', payload: msg });
    }
  };

  // Delete transaction by ID from backend and update state
  const deleteTransaction = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
      const data = res.data;
      if (!data || data.success === false) throw new Error(data.error || 'Failed to delete');
      // Dispatch action to remove from state (triggers Balance, IncomeExpenses, TransactionList re-render)
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      try {
        await getTransactions();
      } catch (err) {
        console.warn('Could not refresh transactions after delete:', err);
      }
    } catch (err) {
      console.error('Delete error:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to delete';
      dispatch({ type: 'TRANSACTION_ERROR', payload: msg });
    }
  };

  useEffect(() => {
    if (user) {
      getTransactions();
      return;
    }

    dispatch({ type: 'GET_TRANSACTIONS', payload: [] });
    dispatch({ type: 'TRANSACTION_ERROR', payload: null });
  }, [user, getTransactions]);

  return (
    <GlobalContext.Provider value={{
      transactions: state.transactions,
      error: state.error,
      loading: state.loading,
      getTransactions,
      addTransaction,
      deleteTransaction
    }}>
      {children}
    </GlobalContext.Provider>
  );
};
