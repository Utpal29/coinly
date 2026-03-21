import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AtSign, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { GlassCard } from '@/components/ui/glass-card';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuthContext();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
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

    try {
      const { error: signInError } = await signIn({
        email: formData.email,
        password: formData.password,
      });
      if (signInError) throw signInError;
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error: googleError } = await signInWithGoogle();
      if (googleError) throw googleError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
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
            Welcome to Coinly
          </h2>
          <p className="mt-2 text-center text-sm bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-400 bg-clip-text text-transparent font-medium">
            Your personal finance companion
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
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="h-12 px-4 bg-white/[0.04] border-white/[0.12] text-white placeholder:text-gray-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
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
                loadingText="Signing in..."
                className="w-full h-12 text-sm font-semibold text-gray-900 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:shadow-[0_0_24px_rgba(250,204,21,0.35)] active:scale-[0.98] transition-all duration-200 btn-shimmer"
              >
                Sign in
              </LoadingButton>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm text-gray-500 bg-transparent backdrop-blur-sm">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-white/[0.12] rounded-xl text-sm font-medium text-white bg-white/[0.06] hover:bg-white/[0.10] backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>

              {/* Link to signup */}
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/signup"
                    className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                  >
                    Create one now
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
