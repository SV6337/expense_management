import './App.css';
import './index.css';
import React, { useState } from 'react';
import { GlobalProvider } from './context/GlobalState';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Balance from './components/Balance';
import IncomeExpenses from './components/IncomeExpenses';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // If not logged in, show Auth component
  if (!user) {
    return <Auth onNavigate={setCurrentPage} />;
  }

  // If logged in, show header and content
  return (
    <div className="app">
      <Header onNavigate={setCurrentPage} />
      {currentPage === 'dashboard' && (
        <div className="container">
          <Balance />
          <IncomeExpenses />
          <TransactionList />
          <AddTransaction />
        </div>
      )}
      {currentPage === 'profile' && (
        <Profile onNavigate={setCurrentPage} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <GlobalProvider>
        <AppContent />
      </GlobalProvider>
    </AuthProvider>
  );
}

export default App;
