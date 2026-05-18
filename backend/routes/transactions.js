const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTransactions,
  addTransaction,
  deleteTransaction
} = require('../controllers/transactionsController');

router.route('/').get(protect, getTransactions).post(protect, addTransaction);
router.route('/:id').delete(protect, deleteTransaction);

module.exports = router;
