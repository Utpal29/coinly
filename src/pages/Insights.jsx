import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { getTransactions } from '../lib/api';
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

// Custom color palette
const colors = {
  income: {
    main: 'rgb(34, 197, 94)', // green-500
    light: 'rgba(34, 197, 94, 0.2)',
    dark: 'rgb(22, 163, 74)', // green-600
  },
  expense: {
    main: 'rgb(239, 68, 68)', // red-500
    light: 'rgba(239, 68, 68, 0.2)',
    dark: 'rgb(220, 38, 38)', // red-600
  },
  savings: {
    main: 'rgb(59, 130, 246)', // blue-500
    light: 'rgba(59, 130, 246, 0.2)',
    dark: 'rgb(37, 99, 235)', // blue-600
  },
  categories: [
    'rgba(255, 99, 132, 0.8)',   // pink
    'rgba(54, 162, 235, 0.8)',   // blue
    'rgba(255, 206, 86, 0.8)',   // yellow
    'rgba(75, 192, 192, 0.8)',   // teal
    'rgba(153, 102, 255, 0.8)',  // purple
    'rgba(255, 159, 64, 0.8)',   // orange
    'rgba(16, 185, 129, 0.8)',   // emerald
    'rgba(245, 158, 11, 0.8)',   // amber
  ],
};

function Insights() {
  const { user } = useAuthContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'month', 'year'

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const data = await getTransactions(user.id);
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchTransactions();
    }
  }, [user]);

  // Filter transactions based on time filter
  const getFilteredTransactions = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      switch (timeFilter) {
        case 'month':
          return transactionDate >= startOfMonth;
        case 'year':
          return transactionDate >= startOfYear;
        default:
          return true;
      }
    });
  };

  // Process data for charts
  const processMonthlyData = () => {
    const monthlyData = {};
    const filteredTransactions = getFilteredTransactions();
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expenses: 0 };
      }
      
      if (transaction.amount > 0) {
        monthlyData[monthYear].income += transaction.amount;
      } else {
        monthlyData[monthYear].expenses += Math.abs(transaction.amount);
      }
    });

    return monthlyData;
  };

  const processCategoryData = () => {
    const categoryData = {};
    const filteredTransactions = getFilteredTransactions();
    
    filteredTransactions
      .filter(t => t.amount < 0)
      .forEach(transaction => {
        if (!categoryData[transaction.category]) {
          categoryData[transaction.category] = 0;
        }
        categoryData[transaction.category] += Math.abs(transaction.amount);
      });

    return categoryData;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading insights
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const monthlyData = processMonthlyData();
  const categoryData = processCategoryData();

  // Prepare chart data with enhanced styling
  const monthlyChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Income',
        data: Object.values(monthlyData).map(d => d.income),
        borderColor: colors.income.main,
        backgroundColor: colors.income.light,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: colors.income.main,
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointHoverBackgroundColor: colors.income.dark,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
      {
        label: 'Expenses',
        data: Object.values(monthlyData).map(d => d.expenses),
        borderColor: colors.expense.main,
        backgroundColor: colors.expense.light,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: colors.expense.main,
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointHoverBackgroundColor: colors.expense.dark,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: colors.categories,
        borderWidth: 1,
        borderColor: '#fff',
        hoverOffset: 4,
      },
    ],
  };

  const savingsRateData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Savings Rate (%)',
        data: Object.values(monthlyData).map(d => 
          d.income > 0 ? ((d.income - d.expenses) / d.income * 100).toFixed(1) : 0
        ),
        backgroundColor: colors.savings.main,
        borderColor: colors.savings.dark,
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: colors.savings.dark,
      },
    ],
  };

  // Calculate insights
  const totalIncome = Object.values(monthlyData).reduce((sum, d) => sum + d.income, 0);
  const totalExpenses = Object.values(monthlyData).reduce((sum, d) => sum + d.expenses, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;
  const topCategory = Object.entries(categoryData).sort((a, b) => b[1] - a[1])[0] || ['No data', 0];

  // Common chart options
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Financial Insights</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                    timeFilter === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setTimeFilter('year')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                    timeFilter === 'year'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  This Year
                </button>
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                    timeFilter === 'month'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  This Month
                </button>
              </div>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-lg font-medium text-gray-900">No transactions yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Add some transactions to see your financial insights.
            </p>
            <div className="mt-6">
              <Link
                to="/add-transaction"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Transaction
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:scale-105">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Income</h3>
                <p className="mt-2 text-3xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:scale-105">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Expenses</h3>
                <p className="mt-2 text-3xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:scale-105">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Savings Rate</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">{savingsRate}%</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:scale-105">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Top Category</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600">{topCategory[0]}</p>
                <p className="mt-1 text-sm text-gray-500">${topCategory[1].toFixed(2)}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Trend */}
              <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Income vs Expenses</h2>
                <div className="h-80">
                  <Line
                    data={monthlyChartData}
                    options={{
                      ...commonChartOptions,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                          },
                          ticks: {
                            callback: value => `$${value}`,
                            font: {
                              size: 11,
                            },
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            font: {
                              size: 11,
                            },
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Expense Categories</h2>
                <div className="h-80">
                  <Doughnut
                    data={categoryChartData}
                    options={{
                      ...commonChartOptions,
                      cutout: '60%',
                      plugins: {
                        ...commonChartOptions.plugins,
                        legend: {
                          position: 'right',
                          labels: {
                            ...commonChartOptions.plugins.legend.labels,
                            padding: 15,
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Savings Rate Trend */}
              <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Savings Rate</h2>
                <div className="h-80">
                  <Bar
                    data={savingsRateData}
                    options={{
                      ...commonChartOptions,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                          },
                          ticks: {
                            callback: value => `${value}%`,
                            font: {
                              size: 11,
                            },
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            font: {
                              size: 11,
                            },
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Spending Categories</h2>
                <div className="space-y-4">
                  {Object.entries(categoryData)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, amount], index) => (
                      <div key={category} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: colors.categories[index % colors.categories.length] }}
                          />
                          <span className="text-gray-600">{category}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-gray-900">${amount.toFixed(2)}</span>
                          <span className="text-sm text-gray-500">
                            ({((amount / totalExpenses) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Insights; 