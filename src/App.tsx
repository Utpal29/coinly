import { lazy, Suspense, Component, type ErrorInfo, type ReactNode } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext'
import { TransactionProvider } from '@/contexts/TransactionContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardSkeleton } from '@/components/LoadingSkeleton'
import { FadeIn } from '@/components/FadeIn'

const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const AddTransaction = lazy(() => import('@/pages/AddTransaction'))
const EditTransaction = lazy(() => import('@/pages/EditTransaction'))
const Profile = lazy(() => import('@/pages/Profile'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Insights = lazy(() => import('@/pages/Insights'))
const CalendarView = lazy(() => import('@/pages/CalendarView'))
const Support = lazy(() => import('@/pages/Support'))
const Home = lazy(() => import('@/pages/Home'))

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('ErrorBoundary caught:', error, info) }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center app-bg p-8">
          <div className="max-w-lg bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-300 mb-4 break-all">{this.state.error.message}</p>
            <pre className="text-xs text-gray-500 text-left overflow-auto max-h-40 mb-4">{this.state.error.stack}</pre>
            <button onClick={() => { this.setState({ error: null }); window.location.href = '/dashboard' }} className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium">Go to Dashboard</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center app-bg">
      <DashboardSkeleton />
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuthContext()
  const location = useLocation()

  return (
    <Suspense fallback={<PageFallback />}>
      <FadeIn key={location.pathname}>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/add-transaction" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
            <Route path="/edit-transaction/:id" element={<ProtectedRoute><EditTransaction /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </FadeIn>
    </Suspense>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <TransactionProvider>
        <AppRoutes />
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15,17,23,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              color: '#f5f5f5',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
          }}
        />
        </TransactionProvider>
      </AuthProvider>
    </Router>
  )
}
