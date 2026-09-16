import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Calendar,
  Receipt,
  PiggyBank,
  PlusCircle,
  Mic,
  ArrowRight,
  TrendingDown,
  Utensils,
  Shirt,
  Film,
  Tag,
} from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import SummaryCard from '../components/SummaryCard';
import BudgetProgress from '../components/BudgetProgress';
import ExpenseCard from '../components/ExpenseCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORY_META = {
  Food: { icon: Utensils, color: '#3b82f6', bg: '#eff6ff' },
  Clothes: { icon: Shirt, color: '#8b5cf6', bg: '#f5f3ff' },
  Entertainment: { icon: Film, color: '#ec4899', bg: '#fdf2f8' },
  Other: { icon: Tag, color: '#64748b', bg: '#f8fafc' },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [todaySpending, setTodaySpending] = useState(0);
  const [error, setError] = useState('');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch monthly analytics
      const { data: analyticsData } = await API.get(
        `/analytics/monthly?month=${currentMonth}&year=${currentYear}`
      );
      setAnalytics(analyticsData);

      // Fetch recent expenses (last 5)
      const { data: expenseData } = await API.get(
        `/expenses?month=${currentMonth}&year=${currentYear}`
      );
      const allExpenses = expenseData.data || [];
      setRecentExpenses(allExpenses.slice(0, 5));

      // Calculate today's spending
      const todayISO = new Date().toISOString().split('T')[0];
      const todayTotal = allExpenses
        .filter((e) => new Date(e.date).toISOString().split('T')[0] === todayISO)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      setTodaySpending(todayTotal);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Unable to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading-wrapper">
        <LoadingSpinner text="Loading dashboard metrics..." />
      </div>
    );
  }

  const totalSpent = analytics?.total || 0;
  const expenseCount = analytics?.expenseCount || 0;
  const budget = analytics?.budget || 0;
  const remainingBudget = analytics?.remainingBudget || 0;
  const categoryTotals = analytics?.categoryTotals || { Food: 0, Clothes: 0, Entertainment: 0, Other: 0 };
  const categoryPercentages = analytics?.categoryPercentages || { Food: 0, Clothes: 0, Entertainment: 0, Other: 0 };

  return (
    <div className="dashboard-container">
      {/* Top Welcome Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-heading">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name}
          </h1>
          <p className="dashboard-subheading">
            Here is your financial summary for <strong>{monthName}</strong>
          </p>
        </div>

        <div className="dashboard-actions">
          <Link to="/add-expense?mode=voice" className="btn btn-outline voice-action-btn">
            <Mic size={18} />
            <span>Voice Entry</span>
          </Link>
          <Link to="/add-expense" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {error && <div className="page-error-alert">{error}</div>}

      {/* 4 Key Metric Summary Cards */}
      <div className="summary-cards-grid">
        <SummaryCard
          title="Total Spent"
          value={`₹${totalSpent.toLocaleString()}`}
          icon={Wallet}
          subtitle={`In ${monthName}`}
          type="primary"
        />
        <SummaryCard
          title="Today's Spending"
          value={`₹${todaySpending.toLocaleString()}`}
          icon={Calendar}
          subtitle="Spent today"
          type="info"
        />
        <SummaryCard
          title="Number of Expenses"
          value={expenseCount}
          icon={Receipt}
          subtitle="Transactions recorded"
          type="neutral"
        />
        <SummaryCard
          title="Remaining Budget"
          value={budget > 0 ? `₹${remainingBudget.toLocaleString()}` : 'No Budget Set'}
          icon={PiggyBank}
          subtitle={budget > 0 ? `${analytics?.budgetPercentage}% utilized` : 'Set in Budget tab'}
          type={remainingBudget < 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Main Content Grid: Budget Progress & Category Breakdown */}
      <div className="dashboard-main-grid">
        {/* Left Column: Budget Status + Category Summary */}
        <div className="dashboard-col">
          <BudgetProgress
            budget={budget}
            spent={totalSpent}
            onSetBudget={() => {}}
          />

          {/* Category Summary Breakdown */}
          <div className="content-panel category-summary-panel">
            <div className="panel-header">
              <h3 className="panel-title">Category Breakdown</h3>
              <Link to="/analytics" className="panel-link">
                Full Analytics <ArrowRight size={14} />
              </Link>
            </div>

            <div className="category-cards-list">
              {['Food', 'Clothes', 'Entertainment', 'Other'].map((cat) => {
                const meta = CATEGORY_META[cat];
                const Icon = meta.icon;
                const amt = categoryTotals[cat] || 0;
                const pct = categoryPercentages[cat] || 0;

                return (
                  <div key={cat} className="category-metric-row">
                    <div className="cat-left">
                      <div className="cat-icon-wrap" style={{ backgroundColor: meta.bg, color: meta.color }}>
                        <Icon size={18} />
                      </div>
                      <div className="cat-info">
                        <span className="cat-name">{cat}</span>
                        <span className="cat-pct">{pct}% of total</span>
                      </div>
                    </div>
                    <div className="cat-right">
                      <span className="cat-amount">₹{amt.toLocaleString()}</span>
                      <div className="cat-bar-bg">
                        <div
                          className="cat-bar-fill"
                          style={{ width: `${pct}%`, backgroundColor: meta.color }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="dashboard-col">
          <div className="content-panel recent-expenses-panel">
            <div className="panel-header">
              <h3 className="panel-title">Recent Expenses</h3>
              {recentExpenses.length > 0 && (
                <Link to="/expenses" className="panel-link">
                  View All <ArrowRight size={14} />
                </Link>
              )}
            </div>

            {recentExpenses.length > 0 ? (
              <div className="recent-expenses-list">
                {recentExpenses.map((expense) => (
                  <ExpenseCard key={expense._id} expense={expense} />
                ))}
              </div>
            ) : (
              <div className="empty-state-panel">
                <Receipt size={48} className="text-muted" />
                <h4 className="empty-title">No expenses recorded yet.</h4>
                <p className="empty-desc">
                  Start tracking your financial transactions today.
                </p>
                <Link to="/add-expense" className="btn btn-primary btn-sm">
                  Add Your First Expense
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
