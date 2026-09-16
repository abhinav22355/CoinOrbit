const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getMonthlyExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

// All expense routes require authentication
router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.get('/monthly', getMonthlyExpenses);

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
