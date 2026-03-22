import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { AppUser, AuthResult, AuthState } from '@/types'

export function useAuth(): AuthState {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser((session?.user as AppUser) ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user as AppUser) ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async ({ email, password, fullName }: { email: string; password: string; fullName: string }): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }, [])

  const signIn = useCallback(async ({ email, password }: { email: string; password: string }): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }, [])

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }, [])

  const signOut = useCallback(async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    navigate('/login')
  }, [navigate])

  const updateUserProfile = useCallback(async (updates: Record<string, unknown>): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.updateUser({ data: updates })
      if (error) throw error

      setUser(prev => prev ? {
        ...prev,
        user_metadata: { ...prev.user_metadata, ...updates },
      } as AppUser : null)

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }, [])

  return useMemo(() => ({
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateUserProfile,
  }), [user, loading, signUp, signIn, signInWithGoogle, signOut, updateUserProfile])
}
