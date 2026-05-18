const Transaction = require('../models/Transaction');

// @desc    Get all transactions
// @route   GET /api/v1/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    next(err);
  }
};

// @desc    Add transaction
// @route   POST /api/v1/transactions
// @access  Private
exports.addTransaction = async (req, res, next) => {
  try {
    const { text, amount, category } = req.body;
    const transaction = await Transaction.create({ user: req.user.id, text, amount, category });
    return res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    next(err);
  }
};

// @desc    Delete transaction by ID
// @route   DELETE /api/v1/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    return res.status(200).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};
