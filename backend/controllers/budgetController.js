const Budget = require('../models/Budget');

// @desc    Get budget for a specific month and year
// @route   GET /api/budget?month=9&year=2026
// @access  Private
const getBudget = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    let budget = await Budget.findOne({
      userId: req.user._id,
      month,
      year,
    });

    if (!budget) {
      return res.status(200).json({
        success: true,
        data: {
          userId: req.user._id,
          month,
          year,
          amount: 0,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update (upsert) monthly budget
// @route   POST /api/budget or PUT /api/budget
// @access  Private
const setBudget = async (req, res, next) => {
  try {
    const { month, year, amount } = req.body;

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const amt = Number(amount);

    if (!m || m < 1 || m > 12) {
      return res.status(400).json({
        success: false,
        message: 'Valid month between 1 and 12 is required',
      });
    }

    if (!y || isNaN(y)) {
      return res.status(400).json({
        success: false,
        message: 'Valid year is required',
      });
    }

    if (amt === undefined || isNaN(amt) || amt < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid budget amount (non-negative number) is required',
      });
    }

    // Upsert budget using unique compound index { userId, month, year }
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, month: m, year: y },
      { amount: amt },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Budget saved successfully',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudget,
  setBudget,
};
