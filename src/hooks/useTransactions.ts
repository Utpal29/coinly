import { useTransactionContext } from '@/contexts/TransactionContext'

export function useTransactions(_userId: string) {
  const ctx = useTransactionContext()
  return {
    transactions: ctx.transactions,
    loading: ctx.loading,
    error: ctx.error,
    deleteTransaction: ctx.removeTransaction,
    refetch: ctx.refetch,
  }
}
