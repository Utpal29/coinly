import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { insertTransaction } from '../lib/api';
import { supabase } from '../lib/supabase';

// Default categories
const DEFAULT_CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Business', 'Other Income'],
  expense: ['Food & Dining', 'Housing', 'Transportation', 'Utilities', 'Health & Fitness', 'Entertainment', 'Shopping', 'Education', 'Other Expense']
};

function AddTransaction() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch categories from Supabase
  useEffect(() => {
    fetchCategories();
  }, [formData.type]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', formData.type)
        .eq('user_id', user.id);

      if (error) throw error;

      // Combine default and custom categories
      const allCategories = [
        ...DEFAULT_CATEGORIES[formData.type],
        ...(data?.map(cat => cat.name) || [])
      ];
      setCategories(allCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);

    // If type changes, reset category
    if (name === 'type') {
      setFormData(prevState => ({
        ...prevState,
        category: ''
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'new') {
      setShowNewCategoryInput(true);
      setFormData(prevState => ({
        ...prevState,
        category: ''
      }));
    } else {
      setShowNewCategoryInput(false);
      setFormData(prevState => ({
        ...prevState,
        category: value
      }));
    }
  };

  const handleNewCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsAddingCategory(true);
    try {
      // Insert new category into Supabase
      const { error } = await supabase
        .from('categories')
        .insert([
          {
            name: newCategory.trim(),
            type: formData.type,
            user_id: user.id
          }
        ]);

      if (error) throw error;

      // Update local state
      setCategories(prev => [...prev, newCategory.trim()]);
      setFormData(prev => ({
        ...prev,
        category: newCategory.trim()
      }));
      setNewCategory('');
      setShowNewCategoryInput(false);
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add new category');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert amount to number and validate
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }

      // Create transaction object
      const transaction = {
        amount: formData.type === 'expense' ? -amount : amount,
        type: formData.type,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        notes: formData.notes
      };

      // Insert transaction
      await insertTransaction(transaction, user.id);

      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className={`text-center transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h2 className="text-3xl font-extrabold text-white">
            Add New Transaction
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter the details of your transaction
          </p>
        </div>

        <div className={`mt-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg py-8 px-4 sm:px-10 transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
                Amount
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-200"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-300">
                Type
              </label>
              <div className="mt-1">
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-200"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300">
                Category
              </label>
              <div className="mt-1">
                {!showNewCategoryInput ? (
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className="appearance-none block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-200"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                    <option value="new">+ Add New Category</option>
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category"
                      className="appearance-none block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-200"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleNewCategorySubmit}
                        disabled={isAddingCategory}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {isAddingCategory ? 'Adding...' : 'Add Category'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          setNewCategory('');
                        }}
                        className="inline-flex items-center px-3 py-2 border border-white/10 text-sm font-medium rounded-lg text-gray-300 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="description"
                  id="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-200"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300">
                Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="date"
                  id="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-200"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300">
                Notes (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-200"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-400/10 border border-red-400/20 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-400">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-white/10 shadow-sm text-sm font-medium rounded-lg text-gray-300 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-colors duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading ? 'Adding...' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddTransaction; 