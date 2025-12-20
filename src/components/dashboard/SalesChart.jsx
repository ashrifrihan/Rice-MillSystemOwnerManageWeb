import React, { useState } from 'react';
import { mockSalesData } from '../../data/mockData';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function SalesChart() {
  const [timeframe, setTimeframe] = useState('7days');

  // Sample chart data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales (Rs.)',
        data: [65000, 59000, 80000, 81000, 56000, 55000, 40000],
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.9)'); // emerald-500
          gradient.addColorStop(1, 'rgba(5, 150, 105, 0.5)'); // emerald-700
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `Rs. ${tooltipItem.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280' }, // gray-500
      },
      y: {
        ticks: {
          callback: (val) => `Rs. ${val / 1000}k`,
          color: '#6B7280',
        },
        grid: { color: '#F3F4F6' }, // subtle gray grid
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          📊 Sales Overview
        </h2>
        <select
          className="text-sm border-gray-300 rounded-lg px-3 py-1 bg-white shadow-sm"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="3months">Last 3 months</option>
        </select>
      </div>

      {/* Chart */}
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {mockSalesData.summary.map((item) => (
          <div
            key={item.label}
            className="text-center bg-gray-50 rounded-xl p-3 hover:bg-emerald-50 transition"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-lg font-bold text-gray-900">
              {item.value.includes('Rs.')
                ? item.value
                : `Rs. ${item.value}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
