const Expense = require('../models/Expense');

// Helper to get month boundaries in UTC/ISO
const getMonthRange = (month, year) => {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  const startDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  return { startDate, endDate };
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const { amount, category, note, date } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required and must be greater than zero',
      });
    }

    const allowedCategories = ['Food', 'Clothes', 'Entertainment', 'Other'];
    if (!category || !allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${allowedCategories.join(', ')}`,
      });
    }

    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        success: false,
        message: 'A valid date is required',
      });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      amount: Number(amount),
      category,
      note: note ? note.trim() : '',
      date: new Date(date),
    });

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get authenticated user's expenses with search & filtering
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { category, month, year, search, date } = req.query;

    const query = { userId: req.user._id };

    // Filter by specific category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by month & year
    if (month && year) {
      const { startDate, endDate } = getMonthRange(month, year);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (date) {
      // Filter by single day
      const d = new Date(date);
      const startOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Search query across note or category
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { note: searchRegex },
        { category: searchRegex },
      ];
    }

    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly expenses
// @route   GET /api/expenses/monthly?month=9&year=2026
// @access  Private
const getMonthlyExpenses = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const { startDate, endDate } = getMonthRange(month, year);

    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      month,
      year,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Enforce user ownership
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this expense',
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Ownership check
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to edit this expense',
      });
    }

    const { amount, category, note, date } = req.body;

    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than zero',
        });
      }
      expense.amount = Number(amount);
    }

    if (category !== undefined) {
      const allowedCategories = ['Food', 'Clothes', 'Entertainment', 'Other'];
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${allowedCategories.join(', ')}`,
        });
      }
      expense.category = category;
    }

    if (note !== undefined) {
      expense.note = note.trim();
    }

    if (date !== undefined) {
      if (isNaN(new Date(date).getTime())) {
        return res.status(400).json({
          success: false,
          message: 'A valid date is required',
        });
      }
      expense.date = new Date(date);
    }

    const updatedExpense = await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Ownership check
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to delete this expense',
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getMonthlyExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
