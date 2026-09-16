import React, { useState, useEffect } from 'react';
import { IndianRupee, Tag, FileText, Calendar, PlusCircle, Check } from 'lucide-react';

const CATEGORIES = ['Food', 'Clothes', 'Entertainment', 'Other'];

const ExpenseForm = ({ initialData = null, onSubmit, onCancel, isLoading = false }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount || '');
      setCategory(initialData.category || 'Food');
      setNote(initialData.note || '');
      if (initialData.date) {
        setDate(new Date(initialData.date).toISOString().split('T')[0]);
      }
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }

    if (!CATEGORIES.includes(category)) {
      setError('Please select a valid category');
      return;
    }

    if (!date) {
      setError('Please choose a valid date');
      return;
    }

    try {
      await onSubmit({
        amount: parsedAmount,
        category,
        note: note.trim(),
        date: new Date(date).toISOString(),
      });

      // Clear form if not editing
      if (!initialData) {
        setAmount('');
        setNote('');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save expense');
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      {error && <div className="form-error-alert">{error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="amount">
          <IndianRupee size={16} /> Amount (₹) *
        </label>
        <div className="input-prefix-wrapper">
          <span className="input-prefix">₹</span>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="form-control with-prefix"
            placeholder="e.g. 450"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="category">
          <Tag size={16} /> Category *
        </label>
        <select
          id="category"
          className="form-control"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isLoading}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="note">
          <FileText size={16} /> Note / Description (Optional)
        </label>
        <input
          id="note"
          type="text"
          className="form-control"
          placeholder="e.g. Lunch with team, Movie tickets"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="date">
          <Calendar size={16} /> Date *
        </label>
        <input
          id="date"
          type="date"
          required
          className="form-control"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="form-actions-row">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (
            'Saving...'
          ) : initialData ? (
            <>
              <Check size={18} /> Update Expense
            </>
          ) : (
            <>
              <PlusCircle size={18} /> Add Expense
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
