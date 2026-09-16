const mongoose = require('mongoose');

const allowedCategories = ['Food', 'Clothes', 'Entertainment', 'Other'];

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: {
        values: allowedCategories,
        message: '{VALUE} is not a valid category. Allowed: Food, Clothes, Entertainment, Other',
      },
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Please provide an expense date'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index on userId and date for high-performance user-scoped monthly and daily queries
expenseSchema.index({ userId: 1, date: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
