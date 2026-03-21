import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import type { TransactionType } from '@/types'

export function useCategories(type: TransactionType, userId: string) {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES[type])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Immediately show correct defaults when type changes (before async fetch)
  useEffect(() => {
    setCategories(DEFAULT_CATEGORIES[type])
  }, [type])

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('type', type)
        .eq('user_id', userId)

      if (fetchError) throw fetchError

      const allCategories = [
        ...DEFAULT_CATEGORIES[type],
        ...(data?.map((cat: { name: string }) => cat.name) || []),
      ]
      setCategories(allCategories)
      setError(null)
    } catch (err) {
      setError('Failed to load categories')
      setCategories(DEFAULT_CATEGORIES[type])
    } finally {
      setLoading(false)
    }
  }, [type, userId])

  useEffect(() => {
    if (userId) {
      fetchCategories()
    }
  }, [fetchCategories, userId])

  const addCategory = useCallback(async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

    const { error: insertError } = await supabase
      .from('categories')
      .insert([{ name: trimmed, type, user_id: userId }])

    if (insertError) throw new Error('Failed to add category')

    setCategories(prev => [...prev, trimmed])
    return trimmed
  }, [type, userId])

  return { categories, addCategory, loading, error, refetch: fetchCategories }
}
