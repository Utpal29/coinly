import { useNavigate } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 animate-blob rounded-full bg-yellow-500 opacity-20 mix-blend-multiply blur-xl filter" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-blob rounded-full bg-yellow-400 opacity-20 mix-blend-multiply blur-xl filter [animation-delay:2s]" />
      </div>
      <div className="relative max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-white/5 p-6">
            <FileQuestion className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h1 className="text-6xl sm:text-8xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white">Page Not Found</h2>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6">
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
