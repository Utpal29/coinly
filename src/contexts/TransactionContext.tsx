import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { useAuthContext } from '@/contexts/AuthContext'
import {
  getTransactionsPage,
  getTransactionStats,
  insertTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/lib/api'
import type { Transaction, TransactionFilters, TransactionStats } from '@/types'

const PAGE_SIZE = 20

interface TransactionContextValue {
  transactions: Transaction[]
  stats: TransactionStats | null
  hasMore: boolean
  loading: boolean
  loadingMore: boolean
  error: string | null
  filters: TransactionFilters
  loadPage: () => Promise<void>
  resetAndLoad: (filters?: TransactionFilters) => Promise<void>
  addTransaction: (
    data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    userId: string
  ) => Promise<Transaction>
  editTransaction: (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>
  ) => Promise<Transaction>
  removeTransaction: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const TransactionContext = createContext<TransactionContextValue | null>(null)

export function useTransactionContext() {
  const ctx = useContext(TransactionContext)
  if (!ctx) {
    throw new Error('useTransactionContext must be used within TransactionProvider')
  }
  return ctx
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  const userId = user?.id ?? ''

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TransactionFilters>({})

  const offsetRef = useRef(0)
  const loadingRef = useRef(false)

  const fetchStats = useCallback(async (filterOpts?: TransactionFilters) => {
    if (!userId) return
    try {
      const s = await getTransactionStats(userId, {
        dateFrom: filterOpts?.dateFrom,
        dateTo: filterOpts?.dateTo,
      })
      setStats(s)
    } catch {
      // Stats failure is non-critical
    }
  }, [userId])

  const loadPage = useCallback(async () => {
    if (!userId || loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoadingMore(true)

    try {
      const { data, hasMore: more } = await getTransactionsPage(userId, {
        limit: PAGE_SIZE,
        offset: offsetRef.current,
        category: filters.category,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      })

      setTransactions(prev => {
        const existingIds = new Set(prev.map(t => t.id))
        const newItems = data.filter(t => !existingIds.has(t.id))
        return [...prev, ...newItems]
      })
      setHasMore(more)
      offsetRef.current += data.length
      setError(null)
    } catch {
      setError('Failed to load transactions')
    } finally {
      setLoadingMore(false)
      loadingRef.current = false
    }
  }, [userId, hasMore, filters])

  const resetAndLoad = useCallback(async (newFilters?: TransactionFilters) => {
    if (!userId) return
    const f = newFilters ?? {}
    setFilters(f)
    setTransactions([])
    setHasMore(true)
    offsetRef.current = 0
    loadingRef.current = false
    setLoading(true)

    try {
      const [page, s] = await Promise.all([
        getTransactionsPage(userId, {
          limit: PAGE_SIZE,
          offset: 0,
          category: f.category,
          dateFrom: f.dateFrom,
          dateTo: f.dateTo,
        }),
        getTransactionStats(userId, {
          dateFrom: f.dateFrom,
          dateTo: f.dateTo,
        }),
      ])

      setTransactions(page.data)
      setHasMore(page.hasMore)
      offsetRef.current = page.data.length
      setStats(s)
      setError(null)
    } catch {
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Initial load
  useEffect(() => {
    if (userId) {
      resetAndLoad()
    } else {
      setTransactions([])
      setStats(null)
      setLoading(false)
    }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const addTransaction = useCallback(async (
    data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    uid: string
  ): Promise<Transaction> => {
    const tempId = `temp-${Date.now()}`
    const now = new Date().toISOString()
    const optimistic: Transaction = {
      ...data,
      id: tempId,
      user_id: uid,
      created_at: now,
      updated_at: now,
    }

    // Snapshot for rollback
    const prevTransactions = transactions
    const prevStats = stats

    // Optimistic insert at correct sorted position
    setTransactions(prev => {
      const next = [...prev, optimistic]
      next.sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
      return next
    })

    // Optimistic stats update
    if (stats) {
      const amt = Math.abs(data.amount)
      setStats({
        ...stats,
        totalIncome: stats.totalIncome + (data.type === 'income' ? amt : 0),
        totalExpenses: stats.totalExpenses + (data.type === 'expense' ? amt : 0),
        count: stats.count + 1,
      })
    }

    try {
      const result = await insertTransaction(data, uid)
      // Replace temp with real
      setTransactions(prev => prev.map(t => t.id === tempId ? result : t))
      // Refresh stats from server
      fetchStats(filters)
      return result
    } catch (err) {
      setTransactions(prevTransactions)
      setStats(prevStats)
      toast.error('Failed to add transaction. Change reverted.')
      throw err
    }
  }, [transactions, stats, filters, fetchStats])

  const editTransaction = useCallback(async (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>
  ): Promise<Transaction> => {
    const prevTransactions = transactions
    const prevStats = stats

    // Optimistic update
    setTransactions(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t)
      next.sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
      return next
    })

    try {
      const result = await updateTransaction(id, updates)
      setTransactions(prev => prev.map(t => t.id === id ? result : t))
      fetchStats(filters)
      return result
    } catch (err) {
      setTransactions(prevTransactions)
      setStats(prevStats)
      toast.error('Failed to update transaction. Change reverted.')
      throw err
    }
  }, [transactions, stats, filters, fetchStats])

  const removeTransaction = useCallback(async (id: string): Promise<void> => {
    const prevTransactions = transactions
    const prevStats = stats

    // Optimistic remove
    const removed = transactions.find(t => t.id === id)
    setTransactions(prev => prev.filter(t => t.id !== id))

    if (stats && removed) {
      const amt = Math.abs(removed.amount)
      setStats({
        ...stats,
        totalIncome: stats.totalIncome - (removed.type === 'income' ? amt : 0),
        totalExpenses: stats.totalExpenses - (removed.type === 'expense' ? amt : 0),
        count: stats.count - 1,
      })
    }

    try {
      await deleteTransaction(id)
      fetchStats(filters)
    } catch {
      setTransactions(prevTransactions)
      setStats(prevStats)
      toast.error('Failed to delete transaction. Change reverted.')
    }
  }, [transactions, stats, filters, fetchStats])

  const refetch = useCallback(() => resetAndLoad(filters), [resetAndLoad, filters])

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        stats,
        hasMore,
        loading,
        loadingMore,
        error,
        filters,
        loadPage,
        resetAndLoad,
        addTransaction,
        editTransaction,
        removeTransaction,
        refetch,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}
