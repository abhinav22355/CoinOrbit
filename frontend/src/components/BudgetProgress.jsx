import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon, TrendingUp } from 'lucide-react';

const BudgetProgress = ({ budget = 0, spent = 0, onSetBudget }) => {
  const hasBudget = budget > 0;
  const percentage = hasBudget ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
  const rawPercentage = hasBudget ? ((spent / budget) * 100).toFixed(1) : 0;
  const remaining = budget - spent;

  // Determine warning status based on requirements
  let status = 'normal';
  let warningMessage = null;
  let statusIcon = <CheckCircle2 size={18} className="text-success" />;

  if (hasBudget) {
    if (spent >= budget) {
      status = 'danger';
      warningMessage = 'Your monthly budget has been exceeded.';
      statusIcon = <AlertOctagon size={18} className="text-danger" />;
    } else if (rawPercentage >= 90) {
      status = 'warning-high';
      warningMessage = 'Your spending is close to your monthly budget.';
      statusIcon = <AlertTriangle size={18} className="text-danger" />;
    } else if (rawPercentage >= 80) {
      status = 'warning-medium';
      warningMessage = '80% of your monthly budget has been used.';
      statusIcon = <AlertTriangle size={18} className="text-warning" />;
    }
  }

  return (
    <div className={`budget-card status-${status}`}>
      <div className="budget-header">
        <div>
          <h4 className="budget-title">Monthly Budget Status</h4>
          <p className="budget-subtitle">
            {hasBudget ? `Target: ₹${budget.toLocaleString()}` : 'No budget set for this month'}
          </p>
        </div>
        {onSetBudget && (
          <button onClick={onSetBudget} className="btn btn-outline btn-sm">
            {hasBudget ? 'Adjust Budget' : 'Set Budget'}
          </button>
        )}
      </div>

      {hasBudget ? (
        <>
          <div className="budget-metrics">
            <div className="budget-metric">
              <span className="metric-label">Spent</span>
              <span className="metric-val text-dark">₹{spent.toLocaleString()}</span>
            </div>
            <div className="budget-metric">
              <span className="metric-label">Remaining</span>
              <span className={`metric-val ${remaining >= 0 ? 'text-success' : 'text-danger'}`}>
                {remaining >= 0 ? `₹${remaining.toLocaleString()}` : `-₹${Math.abs(remaining).toLocaleString()}`}
              </span>
            </div>
            <div className="budget-metric">
              <span className="metric-label">Used</span>
              <span className={`metric-val ${status === 'danger' ? 'text-danger' : ''}`}>
                {rawPercentage}%
              </span>
            </div>
          </div>

          <div className="progress-track">
            <div
              className={`progress-fill fill-${status}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>

          {warningMessage && (
            <div className={`budget-alert-banner banner-${status}`}>
              {statusIcon}
              <span>{warningMessage}</span>
            </div>
          )}
        </>
      ) : (
        <div className="budget-empty-notice">
          <TrendingUp size={24} className="text-muted" />
          <p>Setting a monthly budget helps you track limits and avoid overspending.</p>
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;
