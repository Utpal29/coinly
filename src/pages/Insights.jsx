import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { getTransactions } from '../lib/api';
import { supabase } from '../lib/supabase';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
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
import { Pie, Bar, Line } from 'react-chartjs-2';

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

// Chart colors
const chartColors = {
  gold: '#D4AF37',
  brown: '#8B4513',
  neutral: '#A9A9A9',
  green: '#4CAF50',
  red: '#F44336',
  blue: '#2196F3',
  purple: '#9C27B0',
  orange: '#FF9800',
};

function Insights() {
  const { user } = useAuthContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('last6Months');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTransactions(user.id);
        setTransactions(data);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id);

        if (categoriesError) throw categoriesError;

        const uniqueCategories = [...new Set([
          ...data.map(t => t.category),
          ...(categoriesData?.map(c => c.name) || [])
        ])].sort();

        setCategories(uniqueCategories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  // Get filtered transactions based on date range
  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    const now = new Date();

    switch (dateRange) {
      case 'last30Days':
        const thirtyDaysAgo = subMonths(now, 1);
        filtered = filtered.filter(t => new Date(t.date) >= thirtyDaysAgo);
        break;
      case 'last6Months':
        const sixMonthsAgo = subMonths(now, 6);
        filtered = filtered.filter(t => new Date(t.date) >= sixMonthsAgo);
        break;
      case 'thisYear':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        filtered = filtered.filter(t => new Date(t.date) >= startOfYear);
        break;
      default:
        break;
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    return filtered;
  };

  // Prepare data for Spending by Category (Pie Chart)
  const getSpendingByCategoryData = () => {
    const filtered = getFilteredTransactions().filter(t => t.amount < 0);
    const categoryTotals = filtered.reduce((acc, t) => {
      const category = t.category;
      acc[category] = (acc[category] || 0) + Math.abs(t.amount);
      return acc;
    }, {});

    const colors = Object.keys(categoryTotals).map((_, index) => {
      const colorKeys = Object.keys(chartColors);
      return chartColors[colorKeys[index % colorKeys.length]];
    });

    return {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: colors,
        borderColor: colors.map(color => color + '80'),
        borderWidth: 1,
      }],
    };
  };

  // Prepare data for Monthly Income vs Expenses (Bar Chart)
  const getMonthlyComparisonData = () => {
    const filtered = getFilteredTransactions();
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 6),
      end: new Date(),
    });

    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthTransactions = filtered.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= monthStart && transDate <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return { income, expenses };
    });

    return {
      labels: months.map(month => format(month, 'MMM yyyy')),
      datasets: [
        {
          label: 'Income',
          data: monthlyData.map(d => d.income),
          backgroundColor: chartColors.green + '80',
          borderColor: chartColors.green,
          borderWidth: 1,
        },
        {
          label: 'Expenses',
          data: monthlyData.map(d => d.expenses),
          backgroundColor: chartColors.red + '80',
          borderColor: chartColors.red,
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for Total Balance Over Time (Line Chart)
  const getBalanceOverTimeData = () => {
    const filtered = getFilteredTransactions();
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 6),
      end: new Date(),
    });

    let runningBalance = 0;
    const balanceData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthTransactions = filtered.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= monthStart && transDate <= monthEnd;
      });

      const monthBalance = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      runningBalance += monthBalance;
      return runningBalance;
    });

    return {
      labels: months.map(month => format(month, 'MMM yyyy')),
      datasets: [{
        label: 'Balance',
        data: balanceData,
        borderColor: chartColors.gold,
        backgroundColor: chartColors.gold + '20',
        fill: true,
        tension: 0.4,
      }],
    };
  };

  // Get top 5 expenses
  const getTopExpenses = () => {
    return getFilteredTransactions()
      .filter(t => t.amount < 0)
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Filters */}
        <div className={`mb-8 transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range Filter */}
              <div>
                <label htmlFor="dateRange" className="block text-sm font-medium text-gray-300 mb-1">
                  Date Range
                </label>
                <select
                  id="dateRange"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-200"
                >
                  <option value="last30Days">Last 30 Days</option>
                  <option value="last6Months">Last 6 Months</option>
                  <option value="thisYear">This Year</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-200"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {/* Spending by Category */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Spending by Category</h3>
            <div className="h-80">
              <Pie
                data={getSpendingByCategoryData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        color: '#E5E7EB',
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          return `${label}: $${value.toFixed(2)}`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Monthly Income vs Expenses */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Monthly Income vs Expenses</h3>
            <div className="h-80">
              <Bar
                data={getMonthlyComparisonData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: '#E5E7EB',
                      },
                    },
                    y: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: '#E5E7EB',
                        callback: (value) => `$${value}`,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: '#E5E7EB',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Total Balance Over Time */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Balance Over Time</h3>
            <div className="h-80">
              <Line
                data={getBalanceOverTimeData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: '#E5E7EB',
                      },
                    },
                    y: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: '#E5E7EB',
                        callback: (value) => `$${value}`,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: '#E5E7EB',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Top 5 Expenses */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Top 5 Expenses</h3>
            <div className="space-y-4">
              {getTopExpenses().map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{transaction.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-400/10 text-red-400`}>
                        {transaction.category}
                      </span>
                      <span className="text-sm text-gray-400">
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <p className="text-red-400 font-medium">
                    -${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Insights; 