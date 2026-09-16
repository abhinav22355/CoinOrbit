const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// @desc    Get monthly analytics and metrics
// @route   GET /api/analytics/monthly?month=9&year=2026
// @access  Private
const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const daysInMonth = new Date(year, month, 0).getDate();

    // Fetch user's expenses for this month
    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Fetch user's budget for this month
    const budgetDoc = await Budget.findOne({
      userId: req.user._id,
      month,
      year,
    });
    const budget = budgetDoc ? budgetDoc.amount : 0;

    // Calculate totals & category breakdowns
    let total = 0;
    let highestExpense = 0;
    const categoryTotals = {
      Food: 0,
      Clothes: 0,
      Entertainment: 0,
      Other: 0,
    };

    // Map to aggregate spending per day (YYYY-MM-DD)
    const dayTotalsMap = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dayTotalsMap[dayStr] = 0;
    }

    expenses.forEach((expense) => {
      const amt = Number(expense.amount);
      total += amt;

      if (amt > highestExpense) {
        highestExpense = amt;
      }

      if (categoryTotals[expense.category] !== undefined) {
        categoryTotals[expense.category] += amt;
      } else {
        categoryTotals.Other += amt;
      }

      // Group by YYYY-MM-DD
      const expDate = new Date(expense.date);
      const dayStr = `${expDate.getUTCFullYear()}-${String(expDate.getUTCMonth() + 1).padStart(2, '0')}-${String(expDate.getUTCDate()).padStart(2, '0')}`;
      if (dayTotalsMap[dayStr] !== undefined) {
        dayTotalsMap[dayStr] += amt;
      } else {
        dayTotalsMap[dayStr] = amt;
      }
    });

    // Round total
    total = Number(total.toFixed(2));

    // Calculate Highest Spending Day
    let highestSpendingDay = null;
    let maxDaySpend = 0;
    Object.entries(dayTotalsMap).forEach(([dateStr, dayTotal]) => {
      if (dayTotal > maxDaySpend) {
        maxDaySpend = dayTotal;
        highestSpendingDay = dateStr;
      }
    });

    // Average daily spending
    const averageDailySpending = daysInMonth > 0 ? Number((total / daysInMonth).toFixed(2)) : 0;

    // Category percentages
    const categoryPercentages = {};
    Object.keys(categoryTotals).forEach((cat) => {
      categoryPercentages[cat] = total > 0 ? Number(((categoryTotals[cat] / total) * 100).toFixed(1)) : 0;
    });

    // Budget remaining & percentage
    const remainingBudget = Number((budget - total).toFixed(2));
    const budgetPercentage = budget > 0 ? Number(((total / budget) * 100).toFixed(1)) : 0;

    // Build day-by-day series for charts
    let cumulative = 0;
    const dailySeries = Object.keys(dayTotalsMap).sort().map((dateStr) => {
      const daySpend = Number(dayTotalsMap[dateStr].toFixed(2));
      cumulative = Number((cumulative + daySpend).toFixed(2));
      const dayNum = parseInt(dateStr.split('-')[2], 10);
      return {
        date: dateStr,
        day: dayNum,
        amount: daySpend,
        cumulative,
      };
    });

    res.status(200).json({
      success: true,
      month,
      year,
      total,
      expenseCount: expenses.length,
      categoryTotals,
      categoryPercentages,
      averageDailySpending,
      highestExpense: Number(highestExpense.toFixed(2)),
      highestSpendingDay,
      budget,
      remainingBudget,
      budgetPercentage,
      dailySeries,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlyAnalytics,
};
