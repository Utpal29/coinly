import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/utils/currency'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays, Pencil, Plus } from 'lucide-react'
import { useSwipe } from '@/hooks/useSwipe'
import type { Transaction, CurrencyCode } from '@/types'

interface DailySummary {
  income: number
  expense: number
}

type DailySummaries = Record<string, DailySummary>

/** Get a YYYY-MM-DD string from a Date using local timezone */
function toLocalDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Get YYYY-MM-DD from a DB date string (could be "2026-03-03" or "2026-03-03T00:00:00+00:00") */
function txnDateKey(dateStr: string): string {
  return dateStr.slice(0, 10)
}

export default function CalendarView() {
  const { user } = useAuthContext()
  const currency = (user?.user_metadata?.currency ?? 'USD') as CurrencyCode
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dailySummaries, setDailySummaries] = useState<DailySummaries>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate])

  const fetchTransactions = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', toLocalDateKey(monthStart))
        .lte('date', toLocalDateKey(monthEnd))
        .order('date', { ascending: true })

      if (error) throw error

      const txns = (data ?? []) as Transaction[]
      setTransactions(txns)
      calculateDailySummaries(txns)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDailySummaries = (txns: Transaction[]) => {
    const summaries: DailySummaries = {}
    txns.forEach((t) => {
      const dateKey = txnDateKey(t.date)
      if (!summaries[dateKey]) {
        summaries[dateKey] = { income: 0, expense: 0 }
      }
      if (t.type === 'income') {
        summaries[dateKey].income += Math.abs(t.amount)
      } else {
        summaries[dateKey].expense += Math.abs(t.amount)
      }
    })
    setDailySummaries(summaries)
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  // Number of empty cells before the 1st of the month
  const leadingBlanks = startOfMonth(currentDate).getDay()

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    )
  }

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    )
  }

  // Swipe gestures for month navigation
  const calendarRef = useSwipe<HTMLDivElement>({
    onSwipeLeft: nextMonth,
    onSwipeRight: previousMonth,
  })

  // Filter transactions for the selected date using string comparison (no timezone issues)
  const selectedDateTransactions = useMemo(() => {
    if (!selectedDate) return []
    const key = toLocalDateKey(selectedDate)
    return transactions.filter((t) => txnDateKey(t.date) === key)
  }, [selectedDate, transactions])

  const renderCalendarDay = (day: Date) => {
    const dateKey = toLocalDateKey(day)
    const summary = dailySummaries[dateKey] ?? { income: 0, expense: 0 }
    const hasIncome = summary.income > 0
    const hasExpense = summary.expense > 0
    const isSelected = selectedDate != null && toLocalDateKey(day) === toLocalDateKey(selectedDate)

    return (
      <div
        key={day.toString()}
        onClick={() => setSelectedDate(day)}
        className={`relative p-1 sm:p-2 min-h-[60px] sm:min-h-[100px] border border-white/[0.06] rounded-xl cursor-pointer
          bg-white/[0.03]
          ${isToday(day) ? 'ring-2 ring-yellow-400/50 bg-yellow-400/[0.05]' : ''}
          ${isSelected ? 'ring-2 ring-cyan-400/50 bg-cyan-400/[0.05]' : ''}
          hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-200`}
      >
        <span
          className={`text-xs sm:text-sm ${
            isToday(day) ? 'flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-yellow-400 text-gray-900 font-bold text-[10px] sm:text-xs' : 'text-gray-300'
          }`}
        >
          {format(day, 'd')}
        </span>

        {(hasIncome || hasExpense) && (
          <>
            {/* Mobile: colored dots */}
            <div className="mt-1 flex gap-1 sm:hidden">
              {hasIncome && <div className="h-1.5 w-1.5 rounded-full bg-green-400" />}
              {hasExpense && <div className="h-1.5 w-1.5 rounded-full bg-red-400" />}
            </div>
            {/* Desktop: amounts */}
            <div className="mt-1 hidden space-y-1 sm:block">
              {hasIncome && (
                <div className="text-xs text-green-400 truncate">
                  +{formatCurrency(summary.income, currency)}
                </div>
              )}
              {hasExpense && (
                <div className="text-xs text-red-400 truncate">
                  -{formatCurrency(summary.expense, currency)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  const renderDailyDetail = () => {
    if (!selectedDate) return null

    const dateKey = toLocalDateKey(selectedDate)
    const summary = dailySummaries[dateKey] ?? { income: 0, expense: 0 }
    const netAmount = summary.income - summary.expense

    return (
      <div className="mt-4 p-4 bg-white/[0.04] rounded-2xl border border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">
            Summary for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <Link
            to={`/add-transaction?date=${toLocalDateKey(selectedDate)}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 transition-colors"
            title="Add transaction for this date"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <div className="bg-green-500/10 p-2 sm:p-3 rounded-xl border border-green-400/10">
            <p className="text-xs sm:text-sm text-gray-400">Income</p>
            <p className="text-sm sm:text-lg font-semibold text-green-400">
              +{formatCurrency(summary.income, currency)}
            </p>
          </div>
          <div className="bg-red-500/10 p-2 sm:p-3 rounded-xl border border-red-400/10">
            <p className="text-xs sm:text-sm text-gray-400">Expense</p>
            <p className="text-sm sm:text-lg font-semibold text-red-400">
              -{formatCurrency(summary.expense, currency)}
            </p>
          </div>
          <div
            className={`p-2 sm:p-3 rounded-xl border ${
              netAmount >= 0 ? 'bg-green-500/10 border-green-400/10' : 'bg-red-500/10 border-red-400/10'
            }`}
          >
            <p className="text-xs sm:text-sm text-gray-400">Net</p>
            <p
              className={`text-sm sm:text-lg font-semibold ${
                netAmount >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {netAmount >= 0 ? '+' : '-'}
              {formatCurrency(Math.abs(netAmount), currency)}
            </p>
          </div>
        </div>

        {/* Individual transactions */}
        {selectedDateTransactions.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No transactions"
            description="There are no transactions on this date."
            action={{
              label: 'Add Transaction',
              href: '/add-transaction',
            }}
          />
        ) : (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-400 mb-2">
              Transactions
            </h4>
            {selectedDateTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 bg-white/[0.04] rounded-xl border border-white/[0.08] hover:bg-white/[0.07] transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge
                    variant={t.type === 'income' ? 'success' : 'destructive'}
                    className="shrink-0"
                  >
                    {t.type === 'income' ? 'Income' : 'Expense'}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {t.description || t.category}
                    </p>
                    <p className="text-xs text-gray-400">{t.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-sm font-semibold ${
                      t.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrency(Math.abs(t.amount), currency)}
                  </span>
                  <Link
                    to={`/edit-transaction/${t.id}`}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Edit transaction"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app-bg p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <GlassCard>
          {/* Calendar Header */}
          <div className="pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-semibold text-white">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const today = new Date()
                    setCurrentDate(today)
                    setSelectedDate(today)
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/10 rounded-full transition-all duration-200"
                >
                  Today
                </button>
                <button
                  onClick={previousMonth}
                  className="p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div ref={calendarRef}>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                (day) => (
                  <div
                    key={day}
                    className="text-center text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-500"
                  >
                    {day}
                  </div>
                )
              )}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {days.map((day) => renderCalendarDay(day))}
            </div>
          </div>

          {/* Daily Detail */}
          {renderDailyDetail()}
        </GlassCard>
      </div>
    </div>
  )
}
