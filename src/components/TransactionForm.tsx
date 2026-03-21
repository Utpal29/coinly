import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthContext } from '@/contexts/AuthContext'
import { useCategories } from '@/hooks/useCategories'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { validateTransactionForm } from '@/utils/validation'
import { formatCurrency } from '@/utils/currency'
import { GlassCard } from '@/components/ui/glass-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectSeparator,
} from '@/components/ui/select'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import type { TransactionFormData, TransactionType, CurrencyCode } from '@/types'

function getLocalToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface TransactionFormProps {
  mode: 'add' | 'edit'
  initialData?: TransactionFormData
  onSubmit: (data: TransactionFormData) => Promise<void>
}

export function TransactionForm({ mode, initialData, onSubmit }: TransactionFormProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefilledDate = searchParams.get('date')
  const { user } = useAuthContext()
  const userCurrency = (user?.user_metadata?.currency || 'USD') as CurrencyCode
  const isSubmittingRef = useRef(false)

  const defaultData: TransactionFormData = {
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: prefilledDate || getLocalToday(),
    notes: '',
  }

  const [formData, setFormData] = useState<TransactionFormData>(initialData || defaultData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  // Track unsaved changes
  const isDirty = !isSubmittingRef.current && (
    formData.amount !== (initialData?.amount ?? defaultData.amount) ||
    formData.type !== (initialData?.type ?? defaultData.type) ||
    formData.category !== (initialData?.category ?? defaultData.category) ||
    formData.description !== (initialData?.description ?? defaultData.description) ||
    formData.notes !== (initialData?.notes ?? defaultData.notes)
  )
  useUnsavedChanges(isDirty)

  const { categories: customCategories, addCategory } = useCategories(formData.type, user?.id || '')

  // Compute categories synchronously — always correct for the current type
  const categories = [
    ...DEFAULT_CATEGORIES[formData.type],
    ...customCategories.filter(c => !DEFAULT_CATEGORIES[formData.type].includes(c)),
  ]

  const updateField = (field: keyof TransactionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleTypeChange = (type: TransactionType) => {
    setFormData(prev => ({ ...prev, type, category: '' }))
  }

  const handleCategorySelect = (value: string) => {
    if (value === '__new__') {
      setShowNewCategory(true)
      setFormData(prev => ({ ...prev, category: '' }))
    } else {
      setShowNewCategory(false)
      updateField('category', value)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    setAddingCategory(true)
    try {
      const name = await addCategory(newCategoryName)
      if (name) {
        updateField('category', name)
        setNewCategoryName('')
        setShowNewCategory(false)
      }
    } catch {
      toast.error('Failed to add category')
    } finally {
      setAddingCategory(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateTransactionForm(formData)
    if (validationErrors) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    isSubmittingRef.current = true
    try {
      await onSubmit(formData)
      toast.success(mode === 'add' ? 'Transaction added' : 'Transaction updated')
      setSubmitSuccess(true)
      setTimeout(() => navigate('/dashboard'), 400)
    } catch (err) {
      isSubmittingRef.current = false
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen app-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {mode === 'add' ? 'Add New Transaction' : 'Edit Transaction'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'add' ? 'Enter the details of your transaction' : 'Update your transaction details'}
          </p>
        </div>

        <GlassCard className="mt-8 px-4 py-8 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Transaction Type */}
            <div>
              <Label className="mb-3 block text-gray-300">Transaction Type</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                    formData.type === 'income'
                      ? 'border-green-400 bg-green-400/10 text-green-400'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <ArrowUpRight className="h-5 w-5" />
                  <span>Income</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                    formData.type === 'expense'
                      ? 'border-red-400 bg-red-400/10 text-red-400'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <ArrowDownRight className="h-5 w-5" />
                  <span>Expense</span>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
                  {formatCurrency(0, userCurrency).replace('0.00', '').replace('0', '').trim()}
                </span>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={e => updateField('amount', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="pl-7"
                />
              </div>
              {errors.amount && <p className="mt-1 text-sm text-destructive">{errors.amount}</p>}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <div className="mt-1">
                {!showNewCategory ? (
                  <>
                    <Select value={formData.category || undefined} onValueChange={handleCategorySelect}>
                      <SelectTrigger className="border-white/20 bg-white/10 text-gray-200 focus:ring-yellow-400/50">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        <SelectSeparator />
                        <SelectItem value="__new__">
                          <span className="flex items-center gap-1.5">
                            <Plus className="h-3.5 w-3.5" />
                            Add New Category
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category}</p>}
                  </>
                ) : (
                  <div className="space-y-2">
                    <Input
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder="Enter new category"
                    />
                    <div className="flex gap-2">
                      <LoadingButton
                        type="button"
                        onClick={handleAddCategory}
                        loading={addingCategory}
                        loadingText="Adding..."
                        className="flex-1"
                        size="sm"
                      >
                        Add Category
                      </LoadingButton>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowNewCategory(false)
                          setNewCategoryName('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={e => updateField('description', e.target.value)}
                className="mt-1"
                placeholder="What was this for?"
              />
              {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={e => updateField('date', e.target.value)}
                className="mt-1"
              />
              {errors.date && <p className="mt-1 text-sm text-destructive">{errors.date}</p>}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => updateField('notes', e.target.value)}
                rows={3}
                className="mt-1"
                placeholder="Any additional details..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                loading={loading}
                loadingText={mode === 'add' ? 'Adding...' : 'Saving...'}
                className={submitSuccess ? 'animate-success-pulse bg-green-500 hover:bg-green-500' : ''}
              >
                {mode === 'add' ? 'Add Transaction' : 'Save Changes'}
              </LoadingButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
