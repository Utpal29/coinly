import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CreditCard,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
  ChevronRight,
  Star,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])

  return (
    <span className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: Wallet,
      title: 'Smart Tracking',
      description: 'Effortlessly log income and expenses with intelligent categorization that learns your habits.',
      color: 'yellow',
      gradient: 'from-yellow-400/20 to-amber-500/10',
      iconBg: 'from-yellow-400/15 to-yellow-600/10',
    },
    {
      icon: BarChart3,
      title: 'Visual Insights',
      description: 'Beautiful charts and analytics that reveal your spending patterns and financial trends.',
      color: 'cyan',
      gradient: 'from-cyan-400/20 to-blue-500/10',
      iconBg: 'from-cyan-400/15 to-blue-600/10',
    },
    {
      icon: Calendar,
      title: 'Calendar View',
      description: 'See your financial activity on a calendar. Tap any day to drill into transactions.',
      color: 'green',
      gradient: 'from-green-400/20 to-emerald-500/10',
      iconBg: 'from-green-400/15 to-emerald-600/10',
    },
    {
      icon: Zap,
      title: 'Instant Updates',
      description: 'Lightning-fast optimistic UI — your changes appear instantly, no waiting for servers.',
      color: 'purple',
      gradient: 'from-purple-400/20 to-violet-500/10',
      iconBg: 'from-purple-400/15 to-violet-600/10',
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your data is encrypted and secured with Supabase. We never sell your information.',
      color: 'blue',
      gradient: 'from-blue-400/20 to-indigo-500/10',
      iconBg: 'from-blue-400/15 to-indigo-600/10',
    },
    {
      icon: CreditCard,
      title: 'Multi-Currency',
      description: 'Track finances in 10+ currencies. Perfect for travelers and global professionals.',
      color: 'rose',
      gradient: 'from-rose-400/20 to-pink-500/10',
      iconBg: 'from-rose-400/15 to-pink-600/10',
    },
  ]

  const steps = [
    { step: '01', title: 'Create Account', description: 'Sign up in seconds with email or Google.' },
    { step: '02', title: 'Add Transactions', description: 'Log your income and expenses as they happen.' },
    { step: '03', title: 'Get Insights', description: 'Watch your financial picture come alive with charts and trends.' },
  ]

  return (
    <div className="min-h-screen app-bg relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-yellow-400/[0.07] blur-[120px] animate-pulse animation-delay-2000" />
        <div className="absolute top-1/3 -left-60 h-[500px] w-[500px] rounded-full bg-cyan-400/[0.05] blur-[100px] animate-pulse animation-delay-4000" />
        <div className="absolute bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-yellow-400/[0.04] blur-[80px] animate-pulse animation-delay-6000" />
        <div className="absolute top-2/3 left-1/3 h-[300px] w-[300px] rounded-full bg-purple-400/[0.04] blur-[80px] animate-pulse animation-delay-8000" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-400/20">
                <span className="text-base font-bold text-gray-900">$</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Coinly
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:text-white hover:bg-white/[0.06]"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="btn-shimmer rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-semibold text-gray-900 shadow-lg shadow-yellow-400/20 transition-all duration-200 hover:shadow-yellow-400/30 hover:shadow-xl active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20">
        <div
          className={`mx-auto max-w-4xl text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/[0.08] px-4 py-1.5 text-sm text-yellow-400">
            <Sparkles className="h-4 w-4" />
            <span>Free &amp; Open Source</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Your money,{' '}
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
              beautifully
            </span>
            <br />
            organized
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Track expenses, visualize spending patterns, and take control of your financial future —
            all in one stunning, intuitive app.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="group btn-shimmer flex items-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-3.5 text-base font-semibold text-gray-900 shadow-[0_4px_24px_rgba(250,204,21,0.4)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(250,204,21,0.5)] hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Start for Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.04] px-8 py-3.5 text-base font-medium text-gray-200 backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.08] hover:border-white/[0.2]"
            >
              I already have an account
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Mock */}
        <div
          className={`mt-16 sm:mt-20 mx-auto max-w-5xl transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="gradient-border rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-1">
            <div className="rounded-xl bg-gray-900/80 backdrop-blur-xl p-4 sm:p-6">
              {/* Mock stat cards */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/[0.05] p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Balance</p>
                  <p className="text-sm sm:text-xl font-bold text-white tabular-nums">$12,450</p>
                  <p className="text-[10px] sm:text-xs text-green-400 mt-0.5">↑ 12%</p>
                </div>
                <div className="rounded-xl border border-green-400/20 bg-green-400/[0.05] p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Income</p>
                  <p className="text-sm sm:text-xl font-bold text-green-400 tabular-nums">$8,200</p>
                  <p className="text-[10px] sm:text-xs text-green-400 mt-0.5">↑ 8%</p>
                </div>
                <div className="rounded-xl border border-red-400/20 bg-red-400/[0.05] p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Expenses</p>
                  <p className="text-sm sm:text-xl font-bold text-red-400 tabular-nums">$3,750</p>
                  <p className="text-[10px] sm:text-xs text-red-400 mt-0.5">↓ 5%</p>
                </div>
              </div>
              {/* Mock chart area */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-300">Spending Overview</p>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
                      <span className="h-2 w-2 rounded-full bg-yellow-400" /> Income
                    </span>
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
                      <span className="h-2 w-2 rounded-full bg-cyan-400" /> Expenses
                    </span>
                  </div>
                </div>
                {/* SVG chart mock */}
                <svg viewBox="0 0 600 120" className="w-full h-16 sm:h-24" fill="none">
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(250,204,21,0.3)" />
                      <stop offset="100%" stopColor="rgba(250,204,21,0)" />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(34,211,238,0.2)" />
                      <stop offset="100%" stopColor="rgba(34,211,238,0)" />
                    </linearGradient>
                  </defs>
                  <path d="M0,80 C50,75 100,40 150,50 C200,60 250,30 300,25 C350,20 400,45 450,35 C500,25 550,15 600,10 L600,120 L0,120Z" fill="url(#incomeGrad)" />
                  <path d="M0,80 C50,75 100,40 150,50 C200,60 250,30 300,25 C350,20 400,45 450,35 C500,25 550,15 600,10" stroke="rgba(250,204,21,0.8)" strokeWidth="2.5" />
                  <path d="M0,90 C50,95 100,70 150,85 C200,100 250,75 300,80 C350,85 400,65 450,75 C500,80 550,60 600,55 L600,120 L0,120Z" fill="url(#expenseGrad)" />
                  <path d="M0,90 C50,95 100,70 150,85 C200,100 250,75 300,80 C350,85 400,65 450,75 C500,80 550,60 600,55" stroke="rgba(34,211,238,0.6)" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
          {/* Reflection glow */}
          <div className="mx-auto mt-1 h-20 w-3/4 rounded-full bg-yellow-400/[0.06] blur-3xl" />
        </div>
      </section>

      {/* Social proof strip */}
      <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                <AnimatedCounter target={10} suffix="+" />
              </p>
              <p className="mt-1 text-xs sm:text-sm text-gray-400">Currencies Supported</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                <AnimatedCounter target={100} suffix="%" />
              </p>
              <p className="mt-1 text-xs sm:text-sm text-gray-400">Free Forever</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-400">
                <AnimatedCounter target={5} />
              </p>
              <p className="mt-1 text-xs sm:text-sm text-gray-400">Visualization Types</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center gap-1">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 fill-yellow-400" />
                <AnimatedCounter target={5} suffix=".0" />
              </p>
              <p className="mt-1 text-xs sm:text-sm text-gray-400">User Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              master your money
            </span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Powerful features wrapped in a beautiful interface. No complexity, just clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, i) => (
            <GlassCard
              key={feature.title}
              hover
              className={`group relative overflow-hidden transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 100 + 400}ms` } as React.CSSProperties}
            >
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

              <div className="relative">
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.iconBg} p-3`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Get started in{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              3 simple steps
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, i) => (
            <div key={step.step} className="relative text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-yellow-400/30 to-transparent" />
              )}
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.06]">
                <span className="text-2xl font-bold bg-gradient-to-br from-yellow-300 to-amber-500 bg-clip-text text-transparent">
                  {step.step}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="gradient-border rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl px-6 sm:px-12 py-12 sm:py-16 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-yellow-400/[0.08] blur-[100px] rounded-full" />
            </div>

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to take control?
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-8">
                Join Coinly today and start your journey to financial clarity. It's free, it's beautiful, and it just works.
              </p>
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 btn-shimmer rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-10 py-4 text-lg font-semibold text-gray-900 shadow-[0_4px_24px_rgba(250,204,21,0.4)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(250,204,21,0.5)] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Create Free Account
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="mt-4 text-xs text-gray-500">No credit card required • Free forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-white/[0.02]">
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500">
                <span className="text-xs font-bold text-gray-900">$</span>
              </div>
              <span className="text-sm font-semibold text-gray-400">Coinly</span>
              <span className="text-gray-600 mx-1">•</span>
              <span className="text-xs text-gray-500">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://utpal.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-yellow-400 transition-colors"
              >
                Creator
              </a>
              <Link to="/support" className="text-sm text-gray-500 hover:text-yellow-400 transition-colors">
                Support
              </Link>
              <Link to="/login" className="text-sm text-gray-500 hover:text-yellow-400 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
