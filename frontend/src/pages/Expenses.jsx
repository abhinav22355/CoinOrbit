import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Search,
  Filter,
  PlusCircle,
  Calendar,
  X,
  AlertTriangle,
} from 'lucide-react';
import API from '../api/axios';
import ExpenseCard from '../components/ExpenseCard';
import ExpenseForm from '../components/ExpenseForm';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['All', 'Food', 'Clothes', 'Entertainment', 'Other'];

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const Expenses = () => {
  const now = new Date();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState('');

  // Modal states
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear, selectedCategory, selectedDate]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setActionError('');

      let url = `/expenses?`;
      const params = new URLSearchParams();

      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }

      if (selectedDate) {
        params.append('date', selectedDate);
      } else {
        params.append('month', selectedMonth);
        params.append('year', selectedYear);
      }

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const { data } = await API.get(`${url}${params.toString()}`);
      setExpenses(data.data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setActionError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
    setSelectedDate('');
  };

  // Group expenses by Date string (e.g. "September 16, 2026")
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const d = new Date(expense.date);
    const dateKey = d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(expense);
    return groups;
  }, {});

  const handleUpdateSubmit = async (formData) => {
    if (!editingExpense) return;
    try {
      setIsSubmitting(true);
      await API.put(`/expenses/${editingExpense._id}`, formData);
      setEditingExpense(null);
      fetchExpenses();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;
    try {
      setIsSubmitting(true);
      await API.delete(`/expenses/${deletingExpense._id}`);
      setDeletingExpense(null);
      fetchExpenses();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalFilteredAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="expenses-page-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Daily Expenses</h1>
          <p className="page-subtitle">Track, filter, and manage your day-to-day spending</p>
        </div>
        <Link to="/add-expense" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add Expense</span>
        </Link>
      </div>

      {actionError && <div className="page-error-alert">{actionError}</div>}

      {/* Filter and Search Bar */}
      <div className="filters-card">
        <form onSubmit={handleSearchSubmit} className="search-box-form">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by note or category..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        <div className="filter-controls-row">
          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="filter-group">
            <label className="filter-label">Month</label>
            <select
              className="filter-select"
              value={selectedMonth}
              disabled={!!selectedDate}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="filter-group">
            <label className="filter-label">Year</label>
            <select
              className="filter-select"
              value={selectedYear}
              disabled={!!selectedDate}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Specific Date Filter */}
          <div className="filter-group">
            <label className="filter-label">Specific Date</label>
            <input
              type="date"
              className="filter-date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="filter-group filter-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleClearFilters}
              title="Reset all filters"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Filter summary bar */}
        <div className="filter-stats-summary">
          <span>
            Found <strong>{expenses.length}</strong> transactions
          </span>
          <span className="stats-total">
            Total Spent: <strong>₹{totalFilteredAmount.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* Expenses List Grouped by Date */}
      {loading ? (
        <div className="page-loading-wrapper">
          <LoadingSpinner text="Fetching expenses..." />
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state-panel">
          <Receipt size={48} className="text-muted" />
          <h4 className="empty-title">
            {search || selectedCategory !== 'All' || selectedDate
              ? 'No expenses match your filters.'
              : 'No expenses found for this month.'}
          </h4>
          <p className="empty-desc">
            Try adjusting your search criteria or add a new expense.
          </p>
          <Link to="/add-expense" className="btn btn-primary btn-sm">
            <PlusCircle size={16} /> Add First Expense
          </Link>
        </div>
      ) : (
        <div className="grouped-expenses-container">
          {Object.entries(groupedExpenses).map(([dateLabel, dateExpenses]) => {
            const dateTotal = dateExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
            return (
              <div key={dateLabel} className="date-group-card">
                <div className="date-group-header">
                  <div className="date-badge">
                    <Calendar size={16} />
                    <span>{dateLabel}</span>
                  </div>
                  <span className="date-group-total">₹{dateTotal.toLocaleString()}</span>
                </div>
                <div className="date-expenses-list">
                  {dateExpenses.map((expense) => (
                    <ExpenseCard
                      key={expense._id}
                      expense={expense}
                      onEdit={(item) => setEditingExpense(item)}
                      onDelete={(item) => setDeletingExpense(item)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingExpense && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Edit Expense</h3>
              <button
                className="modal-close-btn"
                onClick={() => setEditingExpense(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <ExpenseForm
                initialData={editingExpense}
                onSubmit={handleUpdateSubmit}
                onCancel={() => setEditingExpense(null)}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpense && (
        <div className="modal-backdrop">
          <div className="modal-card modal-confirm">
            <div className="modal-header">
              <h3 className="modal-title text-danger">
                <AlertTriangle size={20} style={{ marginRight: 8 }} /> Delete Expense
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setDeletingExpense(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to permanently delete this expense?</p>
              <div className="delete-preview-box">
                <strong>{deletingExpense.category}</strong>: ₹{deletingExpense.amount}
                {deletingExpense.note && <span> ({deletingExpense.note})</span>}
              </div>
            </div>
            <div className="modal-actions-row">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingExpense(null)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
