import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}
