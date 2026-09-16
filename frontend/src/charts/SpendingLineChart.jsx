import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SpendingLineChart = ({ dailySeries = [], budget = 0 }) => {
  const totalSpent = dailySeries.reduce((sum, item) => sum + item.amount, 0);

  if (!dailySeries.length || totalSpent === 0) {
    return (
      <div className="chart-empty-state">
        <TrendingUp size={44} className="text-muted" />
        <p className="empty-title">No spending trend</p>
        <p className="empty-desc">Your cumulative spending trajectory will plot here as you log expenses.</p>
      </div>
    );
  }

  const labels = dailySeries.map((item) => `Day ${item.day}`);
  const cumulativeData = dailySeries.map((item) => item.cumulative);

  const datasets = [
    {
      label: 'Cumulative Spent (₹)',
      data: cumulativeData,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.08)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 6,
      borderWidth: 2.5,
    },
  ];

  // If budget exists, show budget limit reference line
  if (budget > 0) {
    datasets.push({
      label: 'Monthly Budget Limit (₹)',
      data: labels.map(() => budget),
      borderColor: '#ef4444',
      borderDash: [6, 6],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
    });
  }

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 14,
          padding: 12,
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const index = items[0].dataIndex;
            return `Date: ${dailySeries[index]?.date || items[0].label}`;
          },
          label: (context) => `${context.dataset.label}: ₹${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 12,
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          callback: (value) => `₹${value}`,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="chart-canvas-wrapper">
      <Line data={data} options={options} />
    </div>
  );
};

export default SpendingLineChart;
