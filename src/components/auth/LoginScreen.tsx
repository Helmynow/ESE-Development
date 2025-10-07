import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Users, Award, Mail, Hash } from 'lucide-react'
import { toast } from 'sonner'
import schoolLogo from '@/assets/images/Image_2.png'
import { getStaffByEmailAndOasis, type StaffMember } from '@/data/staff-data'

interface User {
  id: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  department: string
  email: string
  oasisId: string
}

interface LoginScreenProps {
  onLogin: (user: User) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState<string>('')
  const [oasisId, setOasisId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !oasisId) {
      toast.error('Please enter both email and Oasis ID')
      return
    }

    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const user = getStaffByEmailAndOasis(email, oasisId)
    if (user) {
      onLogin(user)
      toast.success(`Welcome back, ${user.name}!`)
    } else {
      toast.error('Invalid email or Oasis ID. Please check your credentials.')
    }
    
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 text-lime-700">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center space-y-4 sm:space-y-6">
          <div className="flex flex-col items-center justify-center">
            <img src={schoolLogo} alt="ESE Logo" className="w-48 h-48 sm:w-64 sm:h-64 object-contain text-2xl" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">Recognition System</CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Empowering excellence through recognition
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-center">
            <div className="p-3 sm:p-4 rounded-lg font-sans font-light bg-cyan-800 border-yellow-300 text-amber-300">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-slate-50">Evaluations</p>
              <p className="text-xs text-slate-50">
</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-cyan-800 text-lime-100">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-accent" />
              <p className="text-sm font-medium text-slate-50">Appreciation</p>
              <p className="text-xs text-muted-foreground">
</p>
            </div>
          </div>

          <div className="space-y-4 bg-slate-100">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your ESE email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oasis-id">Oasis ID</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="oasis-id"
                  type="text"
                  placeholder="Enter your Oasis ID"
                  value={oasisId}
                  onChange={(e) => setOasisId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
            </div>

            <Button 
              onClick={handleLogin} 
              className="w-full" 
              size="lg"
              disabled={!email || !oasisId || isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Access System'}
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Secure access with your ESE email and Oasis ID
          </div>
        </CardContent>
      </Card>
    </div>
  );
}