import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function Profile() {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuthContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const [userData, setUserData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    currency: user?.user_metadata?.currency || 'USD',
    theme: user?.user_metadata?.theme || 'light'
  });

  const [formData, setFormData] = useState(userData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        currency: user.user_metadata?.currency || 'USD',
        theme: user.user_metadata?.theme || 'light'
      });
      setFormData({
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        currency: user.user_metadata?.currency || 'USD',
        theme: user.user_metadata?.theme || 'light'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prevState => ({
        ...prevState,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSaving(true);
      try {
        await updateUserProfile({
          full_name: formData.name,
          phone: formData.phone,
          currency: formData.currency,
          theme: formData.theme
        });
        setUserData(formData);
        setIsEditing(false);
      } catch (error) {
        setErrors({ submit: error.message });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error.message);
      setErrors({ submit: 'Failed to sign out. Please try again.' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderProfileTab = () => (
    <div className={`space-y-6 transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className="flex items-center space-x-4 p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white">
          <span className="text-2xl font-medium">
            {userData.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-medium text-white">{userData.name}</h3>
          <p className="text-sm text-gray-300">{userData.email}</p>
          <p className="text-sm text-gray-400 mt-1">
            Member since {new Date(user?.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing}
            className={`mt-1 block w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white ${
              !isEditing ? 'bg-white/5' : ''
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={true}
            className="mt-1 block w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm text-gray-400"
          />
          <p className="mt-1 text-sm text-gray-400">Email cannot be changed</p>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="+1 (555) 555-5555"
            className={`mt-1 block w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white ${
              !isEditing ? 'bg-white/5' : ''
            }`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
        </div>

        {errors.submit && (
          <div className="rounded-lg bg-red-400/10 p-4 border border-red-400/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-400">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setFormData(userData);
                setIsEditing(false);
              }}
              className="px-4 py-2 border border-white/20 rounded-lg text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border border-white/20 rounded-lg text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
          >
            Edit Profile
          </button>
        )}
      </form>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className={`space-y-6 transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20">
        <div className="space-y-6">
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-300">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
            >
              <option value="USD">USD ($)</option>
              <option value="CAD">CAD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
            <p className="mt-1 text-sm text-gray-400">
              This will be used for all your transactions and reports
            </p>
          </div>

          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-300">
              Theme
            </label>
            <select
              id="theme"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
            <p className="mt-1 text-sm text-gray-400">
              Choose your preferred color scheme
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className={`space-y-6 transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white">Change Password</h3>
            <p className="mt-1 text-sm text-gray-400">
              Update your password to keep your account secure
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                className="mt-1 block w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="mt-1 block w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="mt-1 block w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white">Delete Account</h3>
            <p className="mt-1 text-sm text-gray-400">
              Permanently delete your account and all associated data
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <Link
            to="/dashboard"
            className="text-gray-300 hover:text-white transition-colors duration-200"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-white/10">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'profile'
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'preferences'
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'security'
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Security
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'preferences' && renderPreferencesTab()}
            {activeTab === 'security' && renderSecurityTab()}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 border border-white/20 rounded-lg text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile; 