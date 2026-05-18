import React, { useContext, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';

export default function Transaction({ transaction }) {
  const { deleteTransaction } = useContext(GlobalContext);
  const [removing, setRemoving] = useState(false);
  const id = transaction._id || transaction.id; // support both id shapes
  const amt = Number(transaction.amount) || 0;
  const sign = amt < 0 ? '-' : '+';

  const handleDelete = () => {
    // play fade-out animation then call delete (will remove from backend DB and global state)
    setRemoving(true);
    setTimeout(() => {
      deleteTransaction(id); // backend removes, reducer updates state, UI re-renders
    }, 250);
  };

  return (
    <li className={`${amt < 0 ? 'minus' : 'plus'} ${removing ? 'fade-out' : ''}`}>
      {transaction.text} <span>{sign}{Math.abs(amt)}</span> <small>({transaction.category})</small>
      <button onClick={handleDelete} aria-label={`Delete transaction ${id}`} className="delete-btn">×</button>
    </li>
  );
}
