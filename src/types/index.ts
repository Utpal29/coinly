import type { User as SupabaseUser } from '@supabase/supabase-js'

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'INR' | 'SGD'

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: TransactionType
  category: string
  description: string
  date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  user_id: string
}

export interface TransactionFormData {
  amount: string
  type: TransactionType
  category: string
  description: string
  date: string
  notes: string
}

export type DateRangeFilter = 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'last30Days' | 'last6Months' | 'thisYear' | 'custom'

export type AppUser = SupabaseUser & {
  user_metadata: {
    full_name?: string
    currency?: CurrencyCode
  }
}

export interface AuthState {
  user: AppUser | null
  loading: boolean
  signUp: (params: { email: string; password: string; fullName: string }) => Promise<AuthResult>
  signIn: (params: { email: string; password: string }) => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  signOut: () => Promise<void>
  updateUserProfile: (updates: Record<string, unknown>) => Promise<AuthResult>
}

export interface AuthResult {
  data: unknown
  error: Error | null
}

export interface TransactionFilters {
  category?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface TransactionStats {
  totalIncome: number
  totalExpenses: number
  count: number
}
