import React from 'react';

const SummaryCard = ({ title, value, icon: Icon, subtitle, type = 'default', trend }) => {
  return (
    <div className={`summary-card card-${type}`}>
      <div className="card-header-row">
        <span className="card-title">{title}</span>
        {Icon && (
          <div className={`card-icon-badge badge-${type}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="card-body-row">
        <h3 className="card-value">{value}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
        {trend && (
          <span className={`trend-badge ${trend.isPositive ? 'trend-positive' : 'trend-negative'}`}>
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
