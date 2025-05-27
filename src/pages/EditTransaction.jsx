import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { getTransactionById, updateTransaction } from '../lib/api';

function EditTransaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const transaction = await getTransactionById(id);
        
        // Verify the transaction belongs to the current user
        if (transaction.user_id !== user.id) {
          throw new Error('Unauthorized access to transaction');
        }

        setFormData({
          amount: Math.abs(transaction.amount).toString(),
          type: transaction.amount >= 0 ? 'income' : 'expense',
          category: transaction.category,
          description: transaction.description,
          date: transaction.date,
          notes: transaction.notes || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, user.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
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

      // Update transaction
      await updateTransaction(id, transaction);

      // Redirect to dashboard on success
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
        <svg className="animate-spin h-8 w-8 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
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
            Update the details of your transaction
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
                <input
                  type="text"
                  name="category"
                  id="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-200"
                />
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