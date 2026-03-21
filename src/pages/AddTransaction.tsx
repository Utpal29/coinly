import { useAuthContext } from '@/contexts/AuthContext'
import { useTransactionContext } from '@/contexts/TransactionContext'
import { TransactionForm } from '@/components/TransactionForm'
import type { TransactionFormData } from '@/types'

export default function AddTransaction() {
  const { user } = useAuthContext()
  const { addTransaction } = useTransactionContext()

  const handleSubmit = async (data: TransactionFormData) => {
    const amount = parseFloat(data.amount)
    await addTransaction(
      {
        amount: data.type === 'expense' ? -amount : amount,
        type: data.type,
        category: data.category,
        description: data.description,
        date: data.date,
        notes: data.notes,
      },
      user!.id
    )
  }

  return <TransactionForm mode="add" onSubmit={handleSubmit} />
}
