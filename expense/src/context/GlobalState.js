import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import AppReducer from './AppReducer';

const initialState = {
  transactions: [],
  error: null,
  loading: true
};

export const GlobalContext = createContext(initialState);

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);
  const { user } = useAuth();

  // Fetch transactions
  const API_BASE = '/api/v1/transactions';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getTransactions = useCallback(async () => {
    try {
      const res = await fetch(API_BASE, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      dispatch({ type: 'GET_TRANSACTIONS', payload: data.data });
    } catch (err) {
      dispatch({ type: 'TRANSACTION_ERROR', payload: err.message });
    }
  }, [API_BASE]);

  // Add transaction
  const addTransaction = async (transaction) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(transaction)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(Array.isArray(data.error) ? data.error.join(', ') : data.error || 'Failed to add');
      dispatch({ type: 'ADD_TRANSACTION', payload: data.data });
    } catch (err) {
      dispatch({ type: 'TRANSACTION_ERROR', payload: err.message });
    }
  };

  // Delete transaction by ID from backend and update state
  const deleteTransaction = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      // Dispatch action to remove from state (triggers Balance, IncomeExpenses, TransactionList re-render)
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    } catch (err) {
      console.error('Delete error:', err);
      dispatch({ type: 'TRANSACTION_ERROR', payload: err.message });
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
