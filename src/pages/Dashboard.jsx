import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { getTransactions, deleteTransaction } from '../lib/api';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatCurrencyWithSign } from '../utils/currency';

function Dashboard() {
  const { user } = useAuthContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [isVisible, setIsVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Get user's preferred currency
  const userCurrency = user?.user_metadata?.currency || 'USD';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch transactions
        const data = await getTransactions(user.id);
        setTransactions(data);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id);

        if (categoriesError) throw categoriesError;

        // Get unique categories from both transactions and custom categories
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

  const handleDelete = async (id) => {
    setTransactionToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    setDeletingId(transactionToDelete);
    try {
      await deleteTransaction(transactionToDelete);
      setTransactions(transactions.filter(t => t.id !== transactionToDelete));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by date range
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case 'today':
        filtered = filtered.filter(t => {
          const transDate = new Date(t.date);
          return transDate.toDateString() === today.toDateString();
        });
        break;
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        filtered = filtered.filter(t => {
          const transDate = new Date(t.date);
          return transDate >= weekStart && transDate <= weekEnd;
        });
        break;
      case 'thisMonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        filtered = filtered.filter(t => {
          const transDate = new Date(t.date);
          return transDate >= monthStart && transDate <= monthEnd;
        });
        break;
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          const startDate = new Date(customDateRange.start);
          const endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999); // End of the day
          filtered = filtered.filter(t => {
            const transDate = new Date(t.date);
            return transDate >= startDate && transDate <= endDate;
          });
        }
        break;
      default:
        break;
    }

    return filtered;
  };

  // Get current month's transactions
  const getCurrentMonthTransactions = () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return transactions.filter(transaction => {
      const transDate = new Date(transaction.date);
      return transDate >= firstDayOfMonth && transDate <= lastDayOfMonth;
    });
  };

  // Calculate totals based on current month's transactions
  const currentMonthTransactions = getCurrentMonthTransactions();
  const totalIncome = currentMonthTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const balance = totalIncome - totalExpenses;

  // Group transactions by date
  const filteredTransactions = getFilteredTransactions();
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'  // Use UTC to avoid timezone issues
    });
    
    if (!groups[formattedDate]) {
      groups[formattedDate] = [];
    }
    groups[formattedDate].push(transaction);
    return groups;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    return new Date(b) - new Date(a);
  });

  // Get limited dates for recent transactions
  const displayDates = showAllTransactions ? sortedDates : sortedDates.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-8 w-8 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-white">Delete Transaction</h3>
              <p className="mt-2 text-sm text-gray-400">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTransactionToDelete(null);
                }}
                className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId === transactionToDelete}
                className={`px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ${
                  deletingId === transactionToDelete ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {deletingId === transactionToDelete ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Financial Overview */}
        <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8 transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {/* Balance Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-300 truncate">Current Month Balance</dt>
                    <dd className="text-lg font-medium text-white">{formatCurrency(balance, userCurrency)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Income Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-300 truncate">Current Month Income</dt>
                    <dd className="text-lg font-medium text-green-400">{formatCurrency(totalIncome, userCurrency)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-300 truncate">Current Month Expenses</dt>
                    <dd className="text-lg font-medium text-red-400">{formatCurrency(totalExpenses, userCurrency)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Add Transaction Button */}
        <div className={`mb-8 transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range Inputs */}
            {dateRange === 'custom' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-200"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-200">Recent Transactions</h2>
            <div className="flex items-center space-x-4">
              {sortedDates.length > 3 && (
                <button
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  className="inline-flex items-center px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:text-yellow-400 hover:border-yellow-400/50 transition-colors duration-200"
                >
                  {showAllTransactions ? 'Show Recent Transactions' : 'View All Transactions'}
                  <svg 
                    className={`ml-2 h-4 w-4 transition-transform duration-200 ${showAllTransactions ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
              <Link
                to="/add-transaction"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-colors duration-200"
              >
                Add Transaction
              </Link>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg overflow-hidden">
            {sortedDates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <svg
                  className="h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-200 mb-2">No Transactions Yet</h3>
                <p className="text-gray-400 text-center max-w-sm">
                  Start tracking your finances by adding your first transaction. Click the "Add Transaction" button above to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {displayDates.map((date) => (
                  <div key={date} className="bg-white/5">
                    <div className="px-6 py-3 bg-white/5">
                      <h3 className="text-sm font-medium text-gray-400">{date}</h3>
                    </div>
                    <div className="divide-y divide-white/10">
                      {groupedTransactions[date].map((transaction) => (
                        <div key={transaction.id} className="px-6 py-4 hover:bg-white/5 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  transaction.amount >= 0 
                                    ? 'bg-green-400/10 text-green-400' 
                                    : 'bg-red-400/10 text-red-400'
                                }`}>
                                  {transaction.category}
                                </span>
                                <p className="text-sm font-medium text-white truncate">
                                  {transaction.description}
                                </p>
                              </div>
                              {transaction.notes && (
                                <p className="mt-1 text-sm text-gray-400 truncate">
                                  {transaction.notes}
                                </p>
                              )}
                            </div>
                            <div className="ml-4 flex items-center space-x-4">
                              <p className={`text-sm font-medium ${
                                transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {formatCurrencyWithSign(transaction.amount, userCurrency)}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Link
                                  to={`/edit-transaction/${transaction.id}`}
                                  className="text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Link>
                                <button
                                  onClick={() => handleDelete(transaction.id)}
                                  disabled={deletingId === transaction.id}
                                  className={`text-gray-400 hover:text-red-400 transition-colors duration-200 ${
                                    deletingId === transaction.id ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 