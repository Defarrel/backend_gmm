const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  getTransactions,
  addTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

router.get('/', authenticateToken, getTransactions);
router.post('/', authenticateToken, addTransaction);
router.delete('/:id', authenticateToken, deleteTransaction);

module.exports = router;
