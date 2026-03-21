import { useState, useMemo, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useTransactions } from '@/hooks/useTransactions'
import { supabase } from '@/lib/supabase'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import { formatCurrency } from '@/utils/currency'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { EmptyState } from '@/components/EmptyState'
import { ChartSkeleton } from '@/components/LoadingSkeleton'
import { BarChart3, PieChart, TrendingUp, ArrowDownRight } from 'lucide-react'
import type { Transaction, CurrencyCode } from '@/types'
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
  Filler,
} from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const CHART_PALETTE = [
  '#D4AF37', '#4CAF50', '#F44336', '#2196F3',
  '#9C27B0', '#FF9800', '#8B4513', '#A9A9A9',
  '#00BCD4', '#E91E63',
] as const

type DateRange = 'last30Days' | 'last6Months' | 'thisYear'

function Insights() {
  const { user } = useAuthContext()
  const { transactions, loading, error } = useTransactions(user!.id)

  const [dateRange, setDateRange] = useState<DateRange>('last30Days')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<string[]>([])

  const userCurrency = (user?.user_metadata?.currency ?? 'USD') as CurrencyCode

  // Fetch categories from supabase
  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('name')
        .eq('user_id', user!.id)

      if (cancelled) return

      const fromTransactions = transactions.map((t) => t.category)
      const fromDb = data?.map((c) => c.name) ?? []
      const unique = [...new Set([...fromTransactions, ...fromDb])].sort()
      setCategories(unique)
    }

    fetchCategories()
    return () => { cancelled = true }
  }, [user, transactions])

  // Filtered transactions
  const filtered = useMemo<Transaction[]>(() => {
    const now = new Date()
    let result = [...transactions]

    switch (dateRange) {
      case 'last30Days': {
        const cutoff = subMonths(now, 1)
        result = result.filter((t) => new Date(t.date) >= cutoff)
        break
      }
      case 'last6Months': {
        const cutoff = subMonths(now, 6)
        result = result.filter((t) => new Date(t.date) >= cutoff)
        break
      }
      case 'thisYear': {
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        result = result.filter((t) => new Date(t.date) >= startOfYear)
        break
      }
    }

    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory)
    }

    return result
  }, [transactions, dateRange, selectedCategory])

  // Pie chart: Spending by category
  const spendingByCategoryData = useMemo(() => {
    const expenses = filtered.filter((t) => t.type === 'expense')
    const totals: Record<string, number> = {}

    for (const t of expenses) {
      totals[t.category] = (totals[t.category] ?? 0) + Math.abs(t.amount)
    }

    const labels = Object.keys(totals)
    const data = Object.values(totals)
    const colors = labels.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length])

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: 'transparent',
          borderWidth: 0,
          hoverBorderWidth: 2,
          hoverBorderColor: '#ffffff',
        },
      ],
    }
  }, [filtered])

  // Bar chart: Monthly income vs expenses
  const monthlyComparisonData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 6),
      end: new Date(),
    })

    const monthly = months.map((month) => {
      const mStart = startOfMonth(month)
      const mEnd = endOfMonth(month)

      const inRange = filtered.filter((t) => {
        const d = new Date(t.date)
        return d >= mStart && d <= mEnd
      })

      const income = inRange
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0)

      const expenses = inRange
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + Math.abs(t.amount), 0)

      return { income, expenses }
    })

    return {
      labels: months.map((m) => format(m, 'MMM yyyy')),
      datasets: [
        {
          label: 'Income',
          data: monthly.map((d) => d.income),
          backgroundColor: 'rgba(74, 222, 128, 0.6)',
          borderColor: '#4ade80',
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: 'Expenses',
          data: monthly.map((d) => d.expenses),
          backgroundColor: 'rgba(248, 113, 113, 0.6)',
          borderColor: '#f87171',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    }
  }, [filtered])

  // Line chart: Balance over time
  const balanceOverTimeData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 6),
      end: new Date(),
    })

    let running = 0
    const balances = months.map((month) => {
      const mStart = startOfMonth(month)
      const mEnd = endOfMonth(month)

      const net = filtered
        .filter((t) => {
          const d = new Date(t.date)
          return d >= mStart && d <= mEnd
        })
        .reduce((s, t) => {
          return s + (t.type === 'income' ? t.amount : -Math.abs(t.amount))
        }, 0)

      running += net
      return running
    })

    return {
      labels: months.map((m) => format(m, 'MMM yyyy')),
      datasets: [
        {
          label: 'Balance',
          data: balances,
          borderColor: '#facc15',
          backgroundColor: 'rgba(250, 204, 21, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: '#facc15',
          pointHoverBackgroundColor: '#facc15',
        },
      ],
    }
  }, [filtered])

  // Top 5 expenses
  const topExpenses = useMemo(
    () =>
      filtered
        .filter((t) => t.type === 'expense')
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        .slice(0, 5),
    [filtered]
  )

  const maxExpense = topExpenses.length > 0 ? Math.abs(topExpenses[0].amount) : 1

  // Chart tooltip config
  const tooltipConfig = {
    backgroundColor: 'rgba(15, 17, 23, 0.95)',
    borderColor: 'rgba(250, 204, 21, 0.3)',
    borderWidth: 1,
    cornerRadius: 12,
    padding: 12,
    titleColor: '#f5f5f5',
    bodyColor: '#d1d5db',
    titleFont: { weight: 'bold' as const },
  }

  // Chart options
  const pieOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' as const, labels: { color: '#9ca3af', padding: 12, usePointStyle: true, pointStyleWidth: 8 } },
        tooltip: {
          ...tooltipConfig,
          callbacks: {
            label: (ctx: { label?: string; raw?: number }) => {
              return `${ctx.label ?? ''}: ${formatCurrency(ctx.raw ?? 0, userCurrency)}`
            },
          },
        },
      },
    }),
    [userCurrency]
  )

  const axisOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#9ca3af' },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#9ca3af',
            callback: (value: string | number) =>
              formatCurrency(Number(value), userCurrency),
          },
        },
      },
      plugins: {
        legend: { labels: { color: '#9ca3af', usePointStyle: true, pointStyleWidth: 8 } },
        tooltip: {
          ...tooltipConfig,
        },
      },
    }),
    [userCurrency]
  )

  // Render

  if (loading) {
    return (
      <div className="app-bg p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <GlassCard key={i}>
                <ChartSkeleton />
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-bg p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <GlassCard>
            <p className="text-center text-red-400">{error}</p>
          </GlassCard>
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="app-bg p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <GlassCard>
            <EmptyState
              icon={BarChart3}
              title="No insights yet"
              description="Add some transactions to start seeing charts and spending breakdowns."
              action={{ label: 'Add Transaction', href: '/add-transaction' }}
            />
          </GlassCard>
        </div>
      </div>
    )
  }

  return (
    <div className="app-bg p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Filters */}
        <GlassCard>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Date Range</label>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger className="border-white/[0.12] bg-white/[0.06] text-gray-200 focus:ring-yellow-400/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last30Days">Last 30 Days</SelectItem>
                  <SelectItem value="last6Months">Last 6 Months</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-white/[0.12] bg-white/[0.06] text-gray-200 focus:ring-yellow-400/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Spending by Category - Pie */}
          <GlassCard>
            <h3 className="mb-4 flex items-center gap-3 text-lg font-medium text-white">
              <div className="rounded-lg bg-yellow-400/10 p-2">
                <PieChart className="h-5 w-5 text-yellow-400" />
              </div>
              Spending by Category
            </h3>
            <div className="aspect-[4/3]">
              <Pie data={spendingByCategoryData} options={pieOptions} />
            </div>
          </GlassCard>

          {/* Monthly Income vs Expenses - Bar */}
          <GlassCard>
            <h3 className="mb-4 flex items-center gap-3 text-lg font-medium text-white">
              <div className="rounded-lg bg-green-400/10 p-2">
                <BarChart3 className="h-5 w-5 text-green-400" />
              </div>
              Monthly Income vs Expenses
            </h3>
            <div className="aspect-[4/3]">
              <Bar data={monthlyComparisonData} options={axisOptions} />
            </div>
          </GlassCard>

          {/* Balance Over Time - Line */}
          <GlassCard>
            <h3 className="mb-4 flex items-center gap-3 text-lg font-medium text-white">
              <div className="rounded-lg bg-yellow-400/10 p-2">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
              </div>
              Balance Over Time
            </h3>
            <div className="aspect-[4/3]">
              <Line data={balanceOverTimeData} options={axisOptions} />
            </div>
          </GlassCard>

          {/* Top 5 Expenses */}
          <GlassCard>
            <h3 className="mb-4 flex items-center gap-3 text-lg font-medium text-white">
              <div className="rounded-lg bg-red-400/10 p-2">
                <ArrowDownRight className="h-5 w-5 text-red-400" />
              </div>
              Top 5 Expenses
            </h3>

            {topExpenses.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No expenses in this period.</p>
            ) : (
              <div className="space-y-3">
                {topExpenses.map((t, i) => (
                  <div
                    key={t.id}
                    className="relative flex items-center justify-between rounded-xl bg-white/[0.04] p-4 overflow-hidden transition-all duration-200 hover:bg-white/[0.07]"
                  >
                    {/* Proportion bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-red-400/[0.06] rounded-xl"
                      style={{ width: `${(Math.abs(t.amount) / maxExpense) * 100}%` }}
                    />
                    <div className="relative flex items-center gap-3">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900' : 'bg-white/10 text-gray-400'
                      }`}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-white">{t.description}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="destructive" className="bg-red-400/10 text-red-400">
                            {t.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(new Date(t.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="relative font-semibold tabular-nums text-red-400">
                      -{formatCurrency(t.amount, userCurrency)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default Insights
