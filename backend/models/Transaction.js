const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  text: {
    type: String,
    trim: true,
    required: [true, 'Please add some text for the transaction']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  category: {
    type: String,
    trim: true,
    required: [true, 'Please add a category']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
