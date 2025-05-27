import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: '$',
  CAD: '$',
  CHF: 'Fr',
  CNY: '¥',
  INR: '₹',
  SGD: '$'
};

// Default categories
const DEFAULT_CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Business', 'Other Income'],
  expense: ['Food & Dining', 'Housing', 'Transportation', 'Utilities', 'Health & Fitness', 'Entertainment', 'Shopping', 'Education', 'Other Expense']
};

function EditTransaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Get user's preferred currency
  const userCurrency = user?.user_metadata?.currency || 'USD';
  const currencySymbol = CURRENCY_SYMBOLS[userCurrency] || '$';

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: '',
    notes: ''
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchTransaction();
    };
    loadData();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Set type first to trigger category fetch
      setFormData(prev => ({
        ...prev,
        type: data.amount >= 0 ? 'income' : 'expense'
      }));

      // Wait for categories to be loaded
      await fetchCategories();

      // Now set the complete form data
      setFormData({
        amount: Math.abs(data.amount).toString(),
        type: data.amount >= 0 ? 'income' : 'expense',
        category: data.category,
        description: data.description,
        date: data.date,
        notes: data.notes || ''
      });
    } catch (err) {
      console.error('Error fetching transaction:', err);
      setError('Failed to load transaction');
    } finally {
      setLoading(false);
    }
  };

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
    if (error) setError(null);

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
    setSaving(true);
    setError(null);

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }

      const { error } = await supabase
        .from('transactions')
        .update({
          amount: formData.type === 'expense' ? -amount : amount,
          type: formData.type,
          category: formData.category,
          description: formData.description,
          date: formData.date,
          notes: formData.notes
        })
        .eq('id', id);

      if (error) throw error;

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className={`text-center transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h2 className="text-3xl font-extrabold text-white">
            Edit Transaction
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Update your transaction details
          </p>
        </div>

        <div className={`mt-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg py-8 px-4 sm:px-10 transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Transaction Type
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 text-center font-medium transition-all duration-200 ${
                    formData.type === 'income'
                      ? 'border-green-400 bg-green-400/10 text-green-400'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Income</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 text-center font-medium transition-all duration-200 ${
                    formData.type === 'expense'
                      ? 'border-red-400 bg-red-400/10 text-red-400'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    <span>Expense</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
                Amount
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 sm:text-sm">{currencySymbol}</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="block w-full pl-7 pr-12 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
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
                disabled={saving}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-colors duration-200 ${
                  saving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {saving ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditTransaction; 