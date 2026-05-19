const Transaction = require('../models/Transaction');
const {
  safeRedisGet,
  safeRedisSet,
  safeRedisDel
} = require('../config/redis');

const getTransactionsCacheKey = (userId) => `transactions:${userId}`;

// @desc    Get all transactions
// @route   GET /api/v1/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const cacheKey = getTransactionsCacheKey(req.user.id);

    // Attempt to read from Redis cache, but don't let Redis failures block DB access
    let cachedTransactions = null;
    try {
      cachedTransactions = await safeRedisGet(cacheKey);
    } catch (redisErr) {
      console.error(`Redis GET error for key ${cacheKey}:`, redisErr && (redisErr.stack || redisErr.message || redisErr));
      cachedTransactions = null;
    }

    if (cachedTransactions) {
      try {
        const data = JSON.parse(cachedTransactions);
        if (Array.isArray(data)) {
          return res.status(200).json({ success: true, count: data.length, data });
        }
        console.warn(`Cached transactions for key ${cacheKey} are not an array; falling back to MongoDB`);
      } catch (parseErr) {
        console.error(`Failed to parse cached transactions for key ${cacheKey}:`, parseErr && (parseErr.stack || parseErr.message || parseErr));
      }
    }

    // Primary DB query
    let transactions;
    try {
      transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    } catch (dbErr) {
      console.error(`Primary MongoDB query failed for user ${req.user.id}:`, dbErr && (dbErr.stack || dbErr.message || dbErr));

      // Graceful fallback: try a simpler query in case of an unexpected state
      try {
        transactions = await Transaction.find({ user: req.user.id }).lean();
      } catch (dbErr2) {
        console.error(`Fallback MongoDB query also failed for user ${req.user.id}:`, dbErr2 && (dbErr2.stack || dbErr2.message || dbErr2));
        return res.status(500).json({ success: false, error: 'Failed to retrieve transactions' });
      }
    }

    if (!transactions) transactions = [];

    // Attempt to populate cache but don't fail the request if cache write fails
    try {
      await safeRedisSet(cacheKey, JSON.stringify(transactions), 60);
    } catch (cacheSetErr) {
      console.error(`Redis SET failed for key ${cacheKey}:`, cacheSetErr && (cacheSetErr.stack || cacheSetErr.message || cacheSetErr));
    }

    return res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    console.error('Unexpected error in getTransactions:', err && (err.stack || err.message || err));
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Add transaction
// @route   POST /api/v1/transactions
// @access  Private
exports.addTransaction = async (req, res, next) => {
  try {
    const { text, amount, category } = req.body;
    const transaction = await Transaction.create({ user: req.user.id, text, amount, category });
    await safeRedisDel(getTransactionsCacheKey(req.user.id));
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
    await safeRedisDel(getTransactionsCacheKey(req.user.id));
    return res.status(200).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};
