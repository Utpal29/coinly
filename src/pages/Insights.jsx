import React from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import dummyTransactions from '../data/dummyTransactions';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Insights() {
  // Process data for charts
  const processMonthlyData = () => {
    const monthlyData = {};
    
    dummyTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthYear].income += transaction.amount;
      } else {
        monthlyData[monthYear].expenses += Math.abs(transaction.amount);
      }
    });

    return monthlyData;
  };

  const processCategoryData = () => {
    const categoryData = {};
    
    dummyTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        if (!categoryData[transaction.category]) {
          categoryData[transaction.category] = 0;
        }
        categoryData[transaction.category] += Math.abs(transaction.amount);
      });

    return categoryData;
  };

  const monthlyData = processMonthlyData();
  const categoryData = processCategoryData();

  // Prepare chart data
  const monthlyChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Income',
        data: Object.values(monthlyData).map(d => d.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: Object.values(monthlyData).map(d => d.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const savingsRateData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Savings Rate (%)',
        data: Object.values(monthlyData).map(d => 
          ((d.income - d.expenses) / d.income * 100).toFixed(1)
        ),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  // Calculate insights
  const totalIncome = Object.values(monthlyData).reduce((sum, d) => sum + d.income, 0);
  const totalExpenses = Object.values(monthlyData).reduce((sum, d) => sum + d.expenses, 0);
  const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1);
  const topCategory = Object.entries(categoryData).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Financial Insights</h1>
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Income</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Expenses</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Savings Rate</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{savingsRate}%</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Top Category</h3>
            <p className="mt-2 text-3xl font-bold text-purple-600">{topCategory[0]}</p>
            <p className="mt-1 text-sm text-gray-500">${topCategory[1].toFixed(2)}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Trend */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Income vs Expenses</h2>
            <div className="h-80">
              <Line
                data={monthlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: value => `$${value}`
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Expense Categories</h2>
            <div className="h-80">
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Savings Rate Trend */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Savings Rate</h2>
            <div className="h-80">
              <Bar
                data={savingsRateData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: value => `${value}%`
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Spending Categories</h2>
            <div className="space-y-4">
              {Object.entries(categoryData)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([category, amount], index) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg font-medium text-gray-900">{index + 1}.</span>
                      <span className="ml-2 text-gray-700">{category}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-900">${amount.toFixed(2)}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({((amount / totalExpenses) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Insights; 