import type { CurrencyCode } from '@/types'

const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(currency: CurrencyCode): Intl.NumberFormat {
  const key = currency
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }))
  }
  return formatterCache.get(key)!
}

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  return getFormatter(currency).format(Math.abs(amount))
}

export function formatCurrencyWithSign(amount: number, currency: CurrencyCode = 'USD'): string {
  const formatted = formatCurrency(amount, currency)
  const sign = amount >= 0 ? '+' : '-'
  return `${sign}${formatted}`
}
