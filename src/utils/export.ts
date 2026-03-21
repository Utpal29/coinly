import type { Transaction, CurrencyCode } from '@/types'

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportToCSV(transactions: Transaction[], currency: CurrencyCode): void {
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Type']

  const rows = transactions.map(transaction => {
    const date = new Date(transaction.date).toLocaleDateString()
    const amount = Math.abs(transaction.amount).toFixed(2)
    const type = transaction.type === 'income' ? 'Income' : 'Expense'

    return [
      escapeCSV(date),
      escapeCSV(transaction.description),
      escapeCSV(transaction.category),
      escapeCSV(`${amount} ${currency}`),
      type,
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.setAttribute('href', url)
  link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
