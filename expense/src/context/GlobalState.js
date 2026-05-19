import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import AppReducer from './AppReducer';
import { TRANSACTIONS_API } from '../config/api';

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
      console.debug('GET transactions from', TRANSACTIONS_API);
      const res = await fetch(TRANSACTIONS_API, {
        headers: getAuthHeaders()
      });
      console.debug('GET transactions response status', res.status);
      const data = await res.json();
      console.debug('GET transactions response data', data);
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      dispatch({ type: 'GET_TRANSACTIONS', payload: data.data });
    } catch (err) {
      console.error('getTransactions error', err);
      dispatch({ type: 'TRANSACTION_ERROR', payload: err.message });
    }
  }, []);

  // Add transaction
  const addTransaction = async (transaction) => {
    try {
      const res = await fetch(TRANSACTIONS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(transaction)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(Array.isArray(data.error) ? data.error.join(', ') : data.error || 'Failed to add');
      // Ensure UI reflects latest DB state by re-fetching transactions
      dispatch({ type: 'ADD_TRANSACTION', payload: data.data });
      try {
        await getTransactions();
      } catch (err) {
        // silently ignore; we've already optimistically added the transaction
        console.warn('Could not refresh transactions after add:', err);
      }
    } catch (err) {
      dispatch({ type: 'TRANSACTION_ERROR', payload: err.message });
    }
  };

  // Delete transaction by ID from backend and update state
  const deleteTransaction = async (id) => {
    try {
      const res = await fetch(`${TRANSACTIONS_API}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      // Dispatch action to remove from state (triggers Balance, IncomeExpenses, TransactionList re-render)
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      try {
        await getTransactions();
      } catch (err) {
        console.warn('Could not refresh transactions after delete:', err);
      }
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
