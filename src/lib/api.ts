import { supabase } from './supabase'
import type { Transaction, TransactionStats } from '@/types'

interface GetTransactionsOptions {
  limit?: number
  offset?: number
  dateFrom?: string
  dateTo?: string
}

export async function getTransactions(
  userId: string,
  options?: GetTransactionsOptions
): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (options?.dateFrom) {
    query = query.gte('date', options.dateFrom)
  }
  if (options?.dateTo) {
    query = query.lte('date', options.dateTo)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1)
  } else if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data as Transaction[]
}

export async function getTransactionsPage(
  userId: string,
  options: {
    limit: number
    offset: number
    category?: string
    dateFrom?: string
    dateTo?: string
  }
): Promise<{ data: Transaction[]; hasMore: boolean }> {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (options.category) {
    query = query.eq('category', options.category)
  }
  if (options.dateFrom) {
    query = query.gte('date', options.dateFrom)
  }
  if (options.dateTo) {
    query = query.lte('date', options.dateTo)
  }

  // Fetch limit + 1 to determine if there are more
  const fetchCount = options.limit + 1
  query = query.range(options.offset, options.offset + fetchCount - 1)

  const { data, error } = await query

  if (error) throw new Error(error.message)

  const rows = data as Transaction[]
  const hasMore = rows.length > options.limit

  return {
    data: hasMore ? rows.slice(0, options.limit) : rows,
    hasMore,
  }
}

export async function getTransactionStats(
  userId: string,
  options?: { dateFrom?: string; dateTo?: string }
): Promise<TransactionStats> {
  let query = supabase
    .from('transactions')
    .select('amount, type')
    .eq('user_id', userId)

  if (options?.dateFrom) {
    query = query.gte('date', options.dateFrom)
  }
  if (options?.dateTo) {
    query = query.lte('date', options.dateTo)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  const rows = data as { amount: number; type: string }[]
  let totalIncome = 0
  let totalExpenses = 0

  for (const row of rows) {
    if (row.type === 'income' || row.amount > 0) {
      totalIncome += Math.abs(row.amount)
    } else {
      totalExpenses += Math.abs(row.amount)
    }
  }

  return { totalIncome, totalExpenses, count: rows.length }
}

export async function getTransactionById(transactionId: string): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (error) throw new Error(error.message)
  return data as Transaction
}

export async function insertTransaction(
  transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  userId: string
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      ...transaction,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Transaction
}

export async function updateTransaction(
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transactionId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Transaction
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)

  if (error) throw new Error(error.message)
}
