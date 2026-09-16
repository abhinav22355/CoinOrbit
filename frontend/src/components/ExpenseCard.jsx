import React from 'react';
import { Utensils, Shirt, Film, Tag, Edit2, Trash2, Calendar } from 'lucide-react';

const categoryConfig = {
  Food: {
    icon: Utensils,
    color: '#3b82f6',
    bgColor: '#eff6ff',
  },
  Clothes: {
    icon: Shirt,
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
  },
  Entertainment: {
    icon: Film,
    color: '#ec4899',
    bgColor: '#fdf2f8',
  },
  Other: {
    icon: Tag,
    color: '#64748b',
    bgColor: '#f8fafc',
  },
};

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const { amount, category, note, date } = expense;
  const config = categoryConfig[category] || categoryConfig.Other;
  const IconComponent = config.icon;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="expense-card-item">
      <div className="expense-left">
        <div
          className="category-icon-box"
          style={{ backgroundColor: config.bgColor, color: config.color }}
        >
          <IconComponent size={20} />
        </div>
        <div className="expense-details">
          <h4 className="expense-title">{note || category}</h4>
          <div className="expense-meta">
            <span className="badge-category" style={{ color: config.color, borderColor: config.color }}>
              {category}
            </span>
            <span className="expense-date">
              <Calendar size={13} style={{ marginRight: 4 }} />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      <div className="expense-right">
        <span className="expense-amount">₹{Number(amount).toLocaleString()}</span>
        <div className="expense-actions">
          {onEdit && (
            <button
              onClick={() => onEdit(expense)}
              className="action-btn edit-btn"
              title="Edit Expense"
              aria-label="Edit Expense"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(expense)}
              className="action-btn delete-btn"
              title="Delete Expense"
              aria-label="Delete Expense"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
