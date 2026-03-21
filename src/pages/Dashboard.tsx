import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Scale, TrendingUp, TrendingDown, Plus, Pencil, Trash2, Search, WalletCards, Loader2 } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useTransactionContext } from '@/contexts/TransactionContext'
import { useCountUp } from '@/hooks/useCountUp'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatCurrencyWithSign } from '@/utils/currency'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { DashboardSkeleton } from '@/components/LoadingSkeleton'
import { Sparkline } from '@/components/Sparkline'
import type { Transaction, CurrencyCode, DateRangeFilter } from '@/types'

export default function Dashboard() {
  const { user } = useAuthContext()
  const userId = user?.id ?? ''
  const {
    transactions,
    stats,
    loading,
    loadingMore,
    hasMore,
    error,
    loadPage,
    resetAndLoad,
    removeTransaction,
  } = useTransactionContext()

  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [dateRange, setDateRange] = useState<DateRangeFilter>('all')
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)
  const userCurrency = (user?.user_metadata?.currency ?? 'USD') as CurrencyCode

  // Fetch categories from supabase
  useEffect(() => {
    async function fetchCategories() {
      if (!user) return
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)

      const uniqueCategories = [
        ...new Set([
          ...transactions.map((t: Transaction) => t.category),
          ...(categoriesData?.map((c: { name: string }) => c.name) ?? []),
        ]),
      ].sort()

      setCategories(uniqueCategories)
    }
    fetchCategories()
  }, [user, transactions])

  // Compute date range filter boundaries
  const getDateBounds = useCallback((range: DateRangeFilter, custom: { start: string; end: string }) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (range) {
      case 'today': {
        const d = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        return { dateFrom: d, dateTo: d }
      }
      case 'thisWeek': {
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return {
          dateFrom: `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`,
          dateTo: `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`,
        }
      }
      case 'thisMonth': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return {
          dateFrom: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-${String(monthStart.getDate()).padStart(2, '0')}`,
          dateTo: `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`,
        }
      }
      case 'custom':
        if (custom.start && custom.end) {
          return { dateFrom: custom.start, dateTo: custom.end }
        }
        return {}
      default:
        return {}
    }
  }, [])

  // Push filters to context when they change (skip initial render — context loads on mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const dateBounds = getDateBounds(dateRange, customDateRange)
    resetAndLoad({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      ...dateBounds,
    })
  }, [selectedCategory, dateRange, customDateRange, getDateBounds]) // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadPage()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loadPage])

  // Client-side search filter on loaded transactions
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions
    const q = searchQuery.toLowerCase()
    return transactions.filter((t) => t.description.toLowerCase().includes(q))
  }, [transactions, searchQuery])

  // Stats from context
  const totalIncome = stats?.totalIncome ?? 0
  const totalExpenses = stats?.totalExpenses ?? 0
  const balance = totalIncome - totalExpenses

  // Animated stat values
  const animatedBalance = useCountUp(balance)
  const animatedIncome = useCountUp(totalIncome)
  const animatedExpenses = useCountUp(totalExpenses)

  // Percentage change badges — compare current period to previous period
  const { balanceChange, incomeChange, expenseChange } = useMemo(() => {
    // For percentage change we need previous period data
    // Since we now use server stats, we show change only for scoped periods
    // For simplicity, return null (no change shown) when using paginated data
    // The stats reflect the filtered period already
    const calcChange = (_current: number, _previous: number): number | null => {
      // With paginated data, we don't have previous period data readily available
      // Return null to hide the badges rather than show incorrect data
      return null
    }

    return {
      balanceChange: calcChange(balance, 0),
      incomeChange: calcChange(totalIncome, 0),
      expenseChange: calcChange(totalExpenses, 0),
    }
  }, [balance, totalIncome, totalExpenses])

  // Sparkline data — last 7 days from loaded transactions
  const sparklineData = useMemo(() => {
    const now = new Date()
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })

    let runningBalance = 0
    const balanceData: number[] = []
    const incomeData: number[] = []
    const expenseData: number[] = []

    days.forEach((day) => {
      const dayTxns = transactions.filter((t) => t.date.slice(0, 10) === day)
      const dayIncome = dayTxns
        .filter((t) => t.amount > 0)
        .reduce((s, t) => s + Number(t.amount), 0)
      const dayExpense = dayTxns
        .filter((t) => t.amount < 0)
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
      runningBalance += dayIncome - dayExpense
      balanceData.push(runningBalance)
      incomeData.push(dayIncome)
      expenseData.push(dayExpense)
    })

    return { balanceData, incomeData, expenseData }
  }, [transactions])

  // Group transactions by date
  const { groupedTransactions, sortedDates } = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}
    for (const transaction of filteredTransactions) {
      const date = new Date(transaction.date)
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
      if (!groups[formattedDate]) groups[formattedDate] = []
      groups[formattedDate].push(transaction)
    }

    const sorted = Object.keys(groups).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    )

    return { groupedTransactions: groups, sortedDates: sorted }
  }, [filteredTransactions])

  // Delete handlers
  const handleDelete = (id: string) => {
    setTransactionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!transactionToDelete) return
    setDeletingId(transactionToDelete)
    try {
      await removeTransaction(transactionToDelete)
    } catch {
      // error handled by context
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="app-bg p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  let cardIndex = 0

  return (
    <div className="app-bg p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-3">
          <GlassCard hover accent="gold" className="flex items-center gap-3 sm:gap-4 hover:glow-gold">
            <div className="rounded-xl bg-gradient-to-br from-yellow-400/15 to-yellow-600/10 p-2.5 sm:p-3">
              <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-300">Balance</p>
              <div className="flex items-center">
                <p className={`text-base sm:text-lg font-semibold tabular-nums ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                  {formatCurrencyWithSign(animatedBalance, userCurrency)}
                </p>
                {balanceChange !== null && (
                  <span className={`ml-2 text-xs font-medium ${balanceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {balanceChange >= 0 ? '\u2191' : '\u2193'}{Math.abs(balanceChange).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <Sparkline data={sparklineData.balanceData} color="#facc15" className="hidden sm:block" />
          </GlassCard>

          <GlassCard hover accent="green" className="flex items-center gap-3 sm:gap-4 hover:glow-green">
            <div className="rounded-xl bg-gradient-to-br from-green-400/15 to-emerald-600/10 p-2.5 sm:p-3">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-300">Income</p>
              <div className="flex items-center">
                <p className="text-base sm:text-lg font-semibold tabular-nums text-green-400">
                  {formatCurrency(animatedIncome, userCurrency)}
                </p>
                {incomeChange !== null && (
                  <span className={`ml-2 text-xs font-medium ${incomeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {incomeChange >= 0 ? '\u2191' : '\u2193'}{Math.abs(incomeChange).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <Sparkline data={sparklineData.incomeData} color="#4ade80" className="hidden sm:block" />
          </GlassCard>

          <GlassCard hover accent="red" className="flex items-center gap-3 sm:gap-4 hover:glow-red">
            <div className="rounded-xl bg-gradient-to-br from-red-400/15 to-rose-600/10 p-2.5 sm:p-3">
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-300">Expenses</p>
              <div className="flex items-center">
                <p className="text-base sm:text-lg font-semibold tabular-nums text-red-400">
                  {formatCurrency(animatedExpenses, userCurrency)}
                </p>
                {expenseChange !== null && (
                  <span className={`ml-2 text-xs font-medium ${expenseChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {expenseChange >= 0 ? '\u2191' : '\u2193'}{Math.abs(expenseChange).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <Sparkline data={sparklineData.expenseData} color="#f87171" className="hidden sm:block" />
          </GlassCard>
        </div>

        {/* Transactions Section */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-xl sm:p-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-white border-l-2 border-yellow-400 pl-3">Recent Transactions</h2>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link to="/add-transaction">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Transaction
                </Link>
              </Button>
            </div>
            {/* Filters */}
            <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-3 bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
              <div className="relative flex-1 sm:max-w-[260px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 border-white/20 bg-white/10 pl-9 text-sm text-gray-200 placeholder:text-gray-500 focus-visible:ring-yellow-400/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-9 w-full sm:w-[160px] border-white/20 bg-white/10 text-sm text-gray-200 focus:ring-yellow-400/50">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRangeFilter)}>
                  <SelectTrigger className="h-9 w-full sm:w-[160px] border-white/20 bg-white/10 text-sm text-gray-200 focus:ring-yellow-400/50">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Custom date inputs */}
          {dateRange === 'custom' && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                type="date"
                value={customDateRange.start}
                onChange={(e) =>
                  setCustomDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="border-white/20 bg-white/10 text-gray-200 focus-visible:ring-yellow-400/50"
              />
              <Input
                type="date"
                value={customDateRange.end}
                onChange={(e) =>
                  setCustomDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="border-white/20 bg-white/10 text-gray-200 focus-visible:ring-yellow-400/50"
              />
            </div>
          )}

          {/* Transaction list */}
          {filteredTransactions.length === 0 && !loadingMore ? (
            <EmptyState
              icon={WalletCards}
              title="No transactions found"
              description="Add your first transaction to start tracking your finances."
              action={{ label: 'Add Transaction', href: '/add-transaction' }}
            />
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {sortedDates.map((date) => (
                <div key={date} className="space-y-2 sm:space-y-3">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-400">{date}</h3>
                  <div className="grid gap-2 sm:gap-3">
                    {groupedTransactions[date].map((transaction) => {
                      const currentIndex = cardIndex
                      cardIndex++
                      return (
                        <div
                          key={transaction.id}
                          className={`group stagger-item rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 sm:p-4 transition-all duration-300 ease-out hover:bg-white/[0.08] hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/20 ${transaction.id.startsWith('temp-') ? 'opacity-70' : ''}`}
                          style={{ '--stagger-delay': `${Math.min(currentIndex * 50, 500)}ms` } as React.CSSProperties}
                        >
                          {/* Mobile: stacked layout */}
                          <div className="flex items-start justify-between gap-2 sm:hidden">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={transaction.amount > 0 ? 'success' : 'destructive'}
                                  className="text-xs"
                                >
                                  {transaction.category}
                                </Badge>
                                <span
                                  className={`ml-auto text-sm font-semibold whitespace-nowrap ${
                                    transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  {formatCurrencyWithSign(transaction.amount, userCurrency)}
                                </span>
                              </div>
                              <h4 className="mt-1.5 truncate text-sm font-medium text-white">
                                {transaction.description}
                              </h4>
                            </div>
                            {!transaction.id.startsWith('temp-') && (
                              <div className="flex items-center gap-1 pt-0.5">
                                <Link
                                  to={`/edit-transaction/${transaction.id}`}
                                  className="rounded-md p-1 text-gray-400 transition-colors hover:bg-yellow-400/10 hover:text-yellow-400"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Link>
                                <button
                                  onClick={() => handleDelete(transaction.id)}
                                  disabled={deletingId === transaction.id}
                                  className="rounded-md p-1 text-gray-400 transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Desktop: side-by-side layout */}
                          <div className="hidden sm:flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <Badge
                                variant={transaction.amount > 0 ? 'success' : 'destructive'}
                              >
                                {transaction.category}
                              </Badge>
                              <h4 className="mt-2 truncate text-base font-medium text-white">
                                {transaction.description}
                              </h4>
                              {transaction.notes && (
                                <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                                  {transaction.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`text-lg font-semibold ${
                                  transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                {formatCurrencyWithSign(transaction.amount, userCurrency)}
                              </span>
                              {!transaction.id.startsWith('temp-') && (
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <Link
                                    to={`/edit-transaction/${transaction.id}`}
                                    className="rounded-lg p-1.5 text-gray-400 transition-colors duration-200 hover:bg-yellow-400/10 hover:text-yellow-400"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(transaction.id)}
                                    disabled={deletingId === transaction.id}
                                    className="rounded-lg p-1.5 text-gray-400 transition-colors duration-200 hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-1" />

              {loadingMore && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
                </div>
              )}

              {!hasMore && filteredTransactions.length > 0 && (
                <p className="text-center text-sm text-gray-500 py-2">All transactions loaded</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      {/* Mobile FAB */}
      <Link
        to="/add-transaction"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900 shadow-[0_4px_24px_rgba(250,204,21,0.4)] transition-transform hover:scale-110 active:scale-95 sm:hidden animate-bounce-in animate-glow-pulse"
        aria-label="Add transaction"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  )
}
