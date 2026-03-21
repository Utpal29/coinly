import type { TransactionFormData } from '@/types'

export function validateTransactionForm(data: TransactionFormData): Record<string, string> | null {
  const errors: Record<string, string> = {}

  const amount = parseFloat(data.amount)
  if (!data.amount || isNaN(amount) || amount <= 0) {
    errors.amount = 'Please enter a valid amount greater than 0'
  }

  if (!data.category) {
    errors.category = 'Please select a category'
  }

  if (!data.description.trim()) {
    errors.description = 'Please enter a description'
  }

  if (!data.date) {
    errors.date = 'Please select a date'
  }

  return Object.keys(errors).length > 0 ? errors : null
}
