import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { useTransactionContext } from '@/contexts/TransactionContext'
import { getTransactionById } from '@/lib/api'
import { TransactionForm } from '@/components/TransactionForm'
import { FormSkeleton } from '@/components/LoadingSkeleton'
import type { TransactionFormData } from '@/types'

export default function EditTransaction() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { editTransaction } = useTransactionContext()
  const [initialData, setInitialData] = useState<TransactionFormData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const txn = await getTransactionById(id!)
        if (!txn) {
          navigate('/dashboard')
          return
        }
        setInitialData({
          amount: Math.abs(txn.amount).toString(),
          type: txn.type || (txn.amount >= 0 ? 'income' : 'expense'),
          category: txn.category,
          description: txn.description,
          date: txn.date,
          notes: txn.notes || '',
        })
      } catch {
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const handleSubmit = async (data: TransactionFormData) => {
    const amount = parseFloat(data.amount)
    await editTransaction(id!, {
      amount: data.type === 'expense' ? -amount : amount,
      type: data.type,
      category: data.category,
      description: data.description,
      date: data.date,
      notes: data.notes,
    })
  }

  if (loading || !initialData) {
    return (
      <div className="min-h-screen app-bg py-12 px-4">
        <div className="mx-auto max-w-md">
          <FormSkeleton />
        </div>
      </div>
    )
  }

  return <TransactionForm mode="edit" initialData={initialData} onSubmit={handleSubmit} />
}
