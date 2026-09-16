import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Wallet,
  TrendingUp,
  Award,
  Zap,
  PiggyBank,
  PieChart as PieIcon,
  Activity,
} from 'lucide-react';
import API from '../api/axios';
import ExpensePieChart from '../charts/ExpensePieChart';
import DailyBarChart from '../charts/DailyBarChart';
import SpendingLineChart from '../charts/SpendingLineChart';
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

const Analytics = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedYear]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await API.get(
        `/analytics/monthly?month=${selectedMonth}&year=${selectedYear}`
      );
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Unable to load analytics for the selected period.');
    } finally {
      setLoading(false);
    }
  };

  const selectedMonthName =
    MONTHS.find((m) => m.value === selectedMonth)?.label || 'Month';

  return (
    <div className="analytics-page-container">
      {/* Header with Month/Year Selectors */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Financial Analytics</h1>
          <p className="page-subtitle">
            Visual breakdown & insights for {selectedMonthName} {selectedYear}
          </p>
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

      {error && <div className="page-error-alert">{error}</div>}

      {loading ? (
        <div className="page-loading-wrapper">
          <LoadingSpinner text="Computing financial analytics..." />
        </div>
      ) : !analytics ? (
        <div className="empty-state-panel">
          <p>No data available</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="analytics-metrics-grid">
            <div className="metric-box box-primary">
              <div className="metric-icon-bubble">
                <Wallet size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-title">Total Spent</span>
                <h3 className="metric-value">₹{analytics.total.toLocaleString()}</h3>
                <span className="metric-sub">{analytics.expenseCount} transactions</span>
              </div>
            </div>

            <div className="metric-box box-info">
              <div className="metric-icon-bubble">
                <Activity size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-title">Daily Average</span>
                <h3 className="metric-value">₹{analytics.averageDailySpending.toLocaleString()}</h3>
                <span className="metric-sub">per day this month</span>
              </div>
            </div>

            <div className="metric-box box-warning">
              <div className="metric-icon-bubble">
                <Award size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-title">Highest Expense</span>
                <h3 className="metric-value">₹{analytics.highestExpense.toLocaleString()}</h3>
                <span className="metric-sub">Single largest purchase</span>
              </div>
            </div>

            <div className="metric-box box-success">
              <div className="metric-icon-bubble">
                <PiggyBank size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-title">Remaining Budget</span>
                <h3 className={`metric-value ${analytics.remainingBudget < 0 ? 'text-danger' : ''}`}>
                  ₹{analytics.remainingBudget.toLocaleString()}
                </h3>
                <span className="metric-sub">
                  {analytics.budget > 0 ? `${analytics.budgetPercentage}% of budget spent` : 'Budget not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Highest Spending Day Card */}
          {analytics.highestSpendingDay && (
            <div className="peak-day-banner">
              <Zap size={20} className="peak-icon" />
              <span>
                Peak spending day was on{' '}
                <strong>
                  {new Date(analytics.highestSpendingDay).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </strong>
                .
              </span>
            </div>
          )}

          {/* Charts Row 1: Doughnut Category Breakdown & Bar Chart */}
          <div className="charts-double-grid">
            <div className="chart-panel">
              <div className="chart-panel-header">
                <h3 className="chart-panel-title">
                  <PieIcon size={18} /> Spending by Category
                </h3>
                <span className="chart-panel-badge">Breakdown</span>
              </div>
              <div className="chart-panel-body">
                <ExpensePieChart categoryTotals={analytics.categoryTotals} />
              </div>
            </div>

            <div className="chart-panel">
              <div className="chart-panel-header">
                <h3 className="chart-panel-title">
                  <BarChart3 size={18} /> Daily Spending
                </h3>
                <span className="chart-panel-badge">Distribution</span>
              </div>
              <div className="chart-panel-body">
                <DailyBarChart dailySeries={analytics.dailySeries} />
              </div>
            </div>
          </div>

          {/* Charts Row 2: Cumulative Spending Trend Line Chart */}
          <div className="chart-panel-full">
            <div className="chart-panel-header">
              <h3 className="chart-panel-title">
                <TrendingUp size={18} /> Spending Trend
              </h3>
              <span className="chart-panel-badge">Cumulative vs Budget</span>
            </div>
            <div className="chart-panel-body">
              <SpendingLineChart
                dailySeries={analytics.dailySeries}
                budget={analytics.budget}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
