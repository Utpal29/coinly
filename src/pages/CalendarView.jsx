import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import Footer from '../components/Footer';

function CalendarView() {
  const { user } = useAuthContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [dailySummaries, setDailySummaries] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [currentDate]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: true });

      if (error) throw error;

      setTransactions(data);
      calculateDailySummaries(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDailySummaries = (transactions) => {
    const summaries = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      if (!summaries[date]) {
        summaries[date] = { income: 0, expense: 0 };
      }
      if (transaction.type === 'income') {
        summaries[date].income += transaction.amount;
      } else {
        summaries[date].expense += transaction.amount;
      }
    });
    setDailySummaries(summaries);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendarDay = (day) => {
    const dateString = day.toISOString().split('T')[0];
    const summary = dailySummaries[dateString] || { income: 0, expense: 0 };
    const hasIncome = summary.income > 0;
    const hasExpense = summary.expense < 0;

    return (
      <div
        key={day.toString()}
        className={`relative p-1 sm:p-2 min-h-[60px] sm:min-h-[100px] border border-white/10 rounded-lg ${
          isSameMonth(day, currentDate) ? 'bg-white/5' : 'bg-white/5 opacity-50'
        } ${isToday(day) ? 'ring-2 ring-yellow-400' : ''}`}
      >
        <span className={`text-xs sm:text-sm ${isToday(day) ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>
          {format(day, 'd')}
        </span>
        
        {(hasIncome || hasExpense) && (
          <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
            <div className="text-[10px] sm:text-xs">
              {hasIncome && (
                <div className="text-green-400 truncate">
                  +{summary.income.toFixed(2)}
                </div>
              )}
              {hasExpense && (
                <div className="text-red-400 truncate">
                  -{Math.abs(summary.expense).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg overflow-hidden">
          {/* Calendar Header */}
          <div className="p-3 sm:p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-semibold text-white">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={previousMonth}
                  className="p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-2 sm:p-6">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {days.map(day => renderCalendarDay(day))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarView; 