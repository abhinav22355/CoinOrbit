import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart as PieIcon } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS = {
  Food: '#3b82f6',         // Vibrant Blue
  Clothes: '#8b5cf6',      // Purple
  Entertainment: '#ec4899',// Pink
  Other: '#64748b',        // Slate
};

const ExpensePieChart = ({ categoryTotals = {} }) => {
  const categories = ['Food', 'Clothes', 'Entertainment', 'Other'];
  const values = categories.map((cat) => categoryTotals[cat] || 0);
  const total = values.reduce((sum, val) => sum + val, 0);

  // If no expenses, show clean empty state
  if (total === 0) {
    return (
      <div className="chart-empty-state">
        <PieIcon size={44} className="text-muted" />
        <p className="empty-title">No spending data</p>
        <p className="empty-desc">Add expenses in this period to view category breakdown.</p>
      </div>
    );
  }

  const data = {
    labels: categories,
    datasets: [
      {
        data: values,
        backgroundColor: [
          CATEGORY_COLORS.Food,
          CATEGORY_COLORS.Clothes,
          CATEGORY_COLORS.Entertainment,
          CATEGORY_COLORS.Other,
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 14,
          padding: 16,
          font: {
            family: "'Inter', sans-serif",
            size: 13,
            weight: 500,
          },
          generateLabels: (chart) => {
            const chartData = chart.data;
            return chartData.labels.map((label, i) => {
              const val = chartData.datasets[0].data[i];
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return {
                text: `${label}: ₹${val.toLocaleString()} (${pct}%)`,
                fillStyle: chartData.datasets[0].backgroundColor[i],
                strokeStyle: '#ffffff',
                lineWidth: 1,
                hidden: isNaN(chartData.datasets[0].data[i]),
                index: i,
              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return ` ₹${val.toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
    cutout: '62%',
  };

  return (
    <div className="chart-canvas-wrapper doughnut-wrapper">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default ExpensePieChart;
