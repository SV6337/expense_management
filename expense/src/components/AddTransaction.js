import React, { useState, useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';

export default function AddTransaction() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(''); // always positive in input
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');

  const { addTransaction } = useContext(GlobalContext);

  const onSubmit = e => {
    e.preventDefault();
    if (!description || !amount || !category) return alert('Please enter description, amount and category');
    const numericAmount = Math.abs(Number(amount));
    const signedAmount = type === 'expense' ? -numericAmount : numericAmount;
    const newTx = { text: description, amount: signedAmount, category };
    addTransaction(newTx);
    setDescription(''); setAmount(''); setType('expense'); setCategory('');
  };

  return (
    <>
      <h3>Add new transaction</h3>
      <form onSubmit={onSubmit}>
        <div className="form-control">
          <label>Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter description..." />
        </div>

        <div className="form-control">
          <label>Amount</label>
          <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount..." />
        </div>

        <div className="form-control">
          <label>Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="glass-select">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="form-control">
          <label>Category</label>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category e.g., Food" />
        </div>

        <button className="btn">Add transaction</button>
      </form>
    </>
  );
}
