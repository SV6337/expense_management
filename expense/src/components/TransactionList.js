import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import Transaction from './Transaction';

export default function TransactionList() {
  const { transactions, loading } = useContext(GlobalContext);

  return (
    <>
      <h3>History</h3>
      <ul className="list">
        {loading ? <p>Loading...</p> : transactions.map(tx => (
          <Transaction key={tx._id || tx.id} transaction={tx} />
        ))}
      </ul>
    </>
  );
}
