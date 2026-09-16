import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DailyBarChart = ({ dailySeries = [] }) => {
  const totalSpent = dailySeries.reduce((sum, item) => sum + item.amount, 0);

  if (!dailySeries.length || totalSpent === 0) {
    return (
      <div className="chart-empty-state">
        <BarChart3 size={44} className="text-muted" />
        <p className="empty-title">No daily expenses recorded</p>
        <p className="empty-desc">Daily expenditures will appear here once you log expenses.</p>
      </div>
    );
  }

  const labels = dailySeries.map((item) => `Day ${item.day}`);
  const amounts = dailySeries.map((item) => item.amount);

  const data = {
    labels,
    datasets: [
      {
        label: 'Daily Spending (₹)',
        data: amounts,
        backgroundColor: '#3b82f6',
        hoverBackgroundColor: '#1d4ed8',
        borderRadius: 4,
        maxBarThickness: 18,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const index = items[0].dataIndex;
            return `Date: ${dailySeries[index]?.date || items[0].label}`;
          },
          label: (context) => `Spent: ₹${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 15,
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
      <Bar data={data} options={options} />
    </div>
  );
};

export default DailyBarChart;
