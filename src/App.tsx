import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from 'sonner'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { Loader2 } from 'lucide-react'

interface User {
  id: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  department: string
  email: string
  oasisId: string
}

function App() {
  const [currentUser, setCurrentUser] = useKV<User | null>('current-user', null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Recognition System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {currentUser ? (
        <Dashboard user={currentUser} onLogout={() => setCurrentUser(null)} />
      ) : (
        <LoginScreen onLogin={setCurrentUser} />
      )}
      <Toaster position="top-right" />
    </div>
  )
}

export default App