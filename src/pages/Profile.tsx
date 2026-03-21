import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { exportToCSV } from '@/utils/export'
import { getTransactions } from '@/lib/api'
import { CURRENCY_OPTIONS } from '@/constants/categories'
import { GlassCard } from '@/components/ui/glass-card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { toast } from 'sonner'
import {
  User,
  Settings,
  Shield,
  Download,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import type { CurrencyCode } from '@/types'

interface FormErrors {
  name?: string
  email?: string
  submit?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, signOut, updateUserProfile } = useAuthContext()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [userData, setUserData] = useState({
    name: user?.user_metadata?.full_name ?? '',
    email: user?.email ?? '',
    currency: (user?.user_metadata?.currency ?? 'USD') as CurrencyCode,
  })

  const [formData, setFormData] = useState(userData)
  const [errors, setErrors] = useState<FormErrors>({})

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      const updated = {
        name: user.user_metadata?.full_name ?? '',
        email: user.email ?? '',
        currency: (user.user_metadata?.currency ?? 'USD') as CurrencyCode,
      }
      setUserData(updated)
      setFormData(updated)
    }
  }, [user])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const { error } = await updateUserProfile({
        full_name: formData.name,
        currency: formData.currency,
      })
      if (error) throw error

      setUserData(formData)
      setIsEditing(false)
      toast.success('Settings updated successfully!')
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update settings.'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
      navigate('/login')
    } catch (error: unknown) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validatePasswordChange = (): boolean => {
    const newErrors: FormErrors = {}
    if (!passwordData.currentPassword)
      newErrors.currentPassword = 'Current password is required'
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePasswordChange() || !user) return

    setIsChangingPassword(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwordData.currentPassword,
      })
      if (signInError) throw new Error('Current password is incorrect')

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })
      if (updateError) throw updateError

      toast.success('Password updated successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update password.'
      toast.error(message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setIsDeleting(true)

    try {
      const { error: deleteTransactionsError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)
      if (deleteTransactionsError) throw deleteTransactionsError

      const { error: deleteUserError } = await supabase.rpc('delete_user')
      if (deleteUserError) throw deleteUserError

      await signOut()
      navigate('/login')
    } catch (error: unknown) {
      console.error('Error deleting account:', error)
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete account. Please try again.'
      toast.error(message)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleExport = async () => {
    if (!user) return
    try {
      const txns = await getTransactions(user.id)
      exportToCSV(txns, userData.currency)
      toast.success('Transactions exported successfully!')
    } catch {
      toast.error('Failed to export transactions. Please try again.')
    }
  }

  return (
    <div className="app-bg p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <GlassCard>
          <Tabs defaultValue="profile">
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1 gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex-1 gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex-1 gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 mt-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative shrink-0">
                  {/* Gradient ring */}
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-cyan-400 opacity-70 blur-[2px]" />
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-gray-900 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                    <span className="text-xl sm:text-2xl font-bold">
                      {userData.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {userData.name}
                  </h3>
                  <p className="text-sm text-gray-300">{userData.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Member since{' '}
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : ''}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-400">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled
                    />
                    <p className="text-sm text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                </div>

                {isEditing ? (
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormData(userData)
                        setIsEditing(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <LoadingButton
                      type="submit"
                      loading={isSaving}
                      loadingText="Saving..."
                    >
                      Save Changes
                    </LoadingButton>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </form>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, currency: v as CurrencyCode }))}
                  >
                    <SelectTrigger className="border-white/20 bg-white/10 text-gray-200">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    This will be used for all your transactions and reports
                  </p>
                </div>

                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <h3 className="text-lg font-medium text-white mb-2">
                    Data Export
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Download all your transaction data in CSV format.
                  </p>
                  <Button onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Transactions
                  </Button>
                </div>

                <div className="flex justify-end">
                  <LoadingButton
                    onClick={handleSubmit}
                    loading={isSaving}
                    loadingText="Saving..."
                  >
                    Save Preferences
                  </LoadingButton>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6 mt-6">
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                <h3 className="text-lg font-medium text-white">
                  Change Password
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your password to keep your account secure
                </p>

                <form
                  onSubmit={handlePasswordSubmit}
                  className="mt-4 space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-red-400">
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-sm text-red-400">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-400">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <LoadingButton
                      type="submit"
                      loading={isChangingPassword}
                      loadingText="Updating..."
                    >
                      Update Password
                    </LoadingButton>
                  </div>
                </form>
              </div>

              {/* Danger zone */}
              <div className="bg-red-500/[0.04] border border-red-500/[0.15] rounded-xl p-6">
                <h3 className="text-lg font-medium text-red-400">
                  Danger Zone
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </GlassCard>

        <div className="flex justify-end">
          <LoadingButton
            variant="outline"
            onClick={handleLogout}
            loading={isLoggingOut}
            loadingText="Signing out..."
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </LoadingButton>
        </div>

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Account"
          description="Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your transactions, settings, and profile information."
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete Account'}
          variant="destructive"
          onConfirm={handleDeleteAccount}
        />
      </div>
    </div>
  )
}
