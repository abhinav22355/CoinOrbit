import React, { useState, useEffect } from 'react';
import { PiggyBank, Calendar, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import API from '../api/axios';
import BudgetProgress from '../components/BudgetProgress';
import LoadingSpinner from '../components/LoadingSpinner';

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

const Budget = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [budgetAmount, setBudgetAmount] = useState('');
  const [currentBudget, setCurrentBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBudgetData();
  }, [selectedMonth, selectedYear]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // 1. Get Budget
      const { data: budgetRes } = await API.get(
        `/budget?month=${selectedMonth}&year=${selectedYear}`
      );
      const amt = budgetRes.data?.amount || 0;
      setCurrentBudget(amt);
      setBudgetAmount(amt > 0 ? amt : '');

      // 2. Get Spent from Analytics
      const { data: analyticsRes } = await API.get(
        `/analytics/monthly?month=${selectedMonth}&year=${selectedYear}`
      );
      setTotalSpent(analyticsRes.total || 0);
    } catch (err) {
      console.error('Error fetching budget data:', err);
      setMessage({ type: 'error', text: 'Failed to retrieve budget information' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const num = parseFloat(budgetAmount);
    if (isNaN(num) || num < 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive budget amount' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const { data } = await API.post('/budget', {
        month: selectedMonth,
        year: selectedYear,
        amount: num,
      });

      if (data.success) {
        setCurrentBudget(num);
        setMessage({
          type: 'success',
          text: `Budget for ${MONTHS.find((m) => m.value === selectedMonth)?.label} ${selectedYear} saved as ₹${num.toLocaleString()}!`,
        });
      }
    } catch (err) {
      console.error('Error saving budget:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save budget',
      });
    } finally {
      setSaving(false);
    }
  };

  const monthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label;

  return (
    <div className="budget-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Monthly Budget</h1>
          <p className="page-subtitle">Set, track, and monitor spending limits with real-time alerts</p>
        </div>

        <div className="month-year-selectors">
          <div className="select-pill">
            <Calendar size={16} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="select-pill">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={message.type === 'success' ? 'form-success-alert' : 'form-error-alert'}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="page-loading-wrapper">
          <LoadingSpinner text="Fetching budget details..." />
        </div>
      ) : (
        <div className="budget-content-grid">
          {/* Left Column: Set Budget Form */}
          <div className="content-panel budget-form-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <PiggyBank size={20} /> Set Budget for {monthLabel} {selectedYear}
              </h3>
            </div>
            <p className="panel-description">
              Establish your target spending threshold for this month. CoinOrbit will notify you at 80%, 90%, and 100% consumption.
            </p>

            <form onSubmit={handleSaveBudget} className="budget-input-form">
              <div className="form-group">
                <label className="form-label" htmlFor="budget-amount-input">
                  Budget Amount (₹)
                </label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">₹</span>
                  <input
                    id="budget-amount-input"
                    type="number"
                    min="0"
                    step="100"
                    required
                    placeholder="e.g. 20000"
                    className="form-control with-prefix"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save Budget'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Live Budget Progress Meter & Thresholds */}
          <div className="content-panel budget-monitor-panel">
            <BudgetProgress
              budget={currentBudget}
              spent={totalSpent}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
