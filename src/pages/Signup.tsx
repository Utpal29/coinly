import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, AtSign, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { GlassCard } from '@/components/ui/glass-card';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuthContext();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
      });
      if (signUpError) throw signUpError;
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Grid pattern */}
      <div className="login-grid absolute inset-0 pointer-events-none" />

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-4000" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-400 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-6000" />
        <div className="absolute top-1/2 right-1/3 w-56 h-56 bg-cyan-300 rounded-full mix-blend-multiply filter blur-2xl opacity-[0.07] animate-blob animation-delay-8000" />
      </div>

      {/* Header / Logo */}
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div
          className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-yellow-400/20 rounded-full scale-150" />
              <img
                src="/logo.png"
                alt="Coinly Logo"
                className="relative h-16 w-16 object-contain animate-float"
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Join Coinly
          </h2>
          <p className="mt-2 text-center text-sm bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-400 bg-clip-text text-transparent font-medium">
            Start your financial journey today
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div
          className={`transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <GlassCard variant="highlight" className="py-8 px-4 shadow-2xl sm:px-10 bg-gradient-to-b from-white/[0.08] to-white/[0.03]">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-200">
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="h-12 px-4 bg-white/[0.04] border-white/[0.12] text-white placeholder:text-gray-500 pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">
                  Email address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="h-12 px-4 bg-white/[0.04] border-white/[0.12] text-white placeholder:text-gray-500 pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <AtSign className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="h-12 px-4 bg-white/[0.04] border-white/[0.12] text-white placeholder:text-gray-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="h-12 px-4 bg-white/[0.04] border-white/[0.12] text-white placeholder:text-gray-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 animate-shake">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                    <p className="text-sm font-medium text-red-200">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <LoadingButton
                type="submit"
                loading={loading}
                loadingText="Creating account..."
                className="w-full h-12 text-sm font-semibold text-gray-900 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:shadow-[0_0_24px_rgba(250,204,21,0.35)] active:scale-[0.98] transition-all duration-200 btn-shimmer"
              >
                Create Account
              </LoadingButton>

              {/* Link to login */}
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
