import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  LogOut, 
  Users, 
  Award, 
  Calendar, 
  Settings, 
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  Bot
} from 'lucide-react'
import { EvaluationCenter } from './EvaluationCenter'
import { RecognitionCenter } from './RecognitionCenter'
import { AutomationCenter } from './AutomationCenter'
import { ResultsCenter } from './ResultsCenter'
import { AIAssistant } from './AIAssistant'
import { canViewEvaluationResults } from '@/lib/authorization'
import { toast } from 'sonner'
import schoolLogo from '@/assets/images/Image_2.png'

interface User {
  id: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  department: string
  email: string
  oasisId: string
}

interface DashboardProps {
  user: User
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const handleLogout = () => {
    toast.success('Successfully logged out')
    onLogout()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive text-destructive-foreground'
      case 'manager': return 'bg-primary text-primary-foreground'
      default: return 'bg-secondary text-secondary-foreground'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 bg-slate-50 border-slate-700">
          <div className="flex items-center gap-2 sm:gap-4">
            <img 
              src={schoolLogo} 
              alt="School Logo" 
              className="h-30 w-30 sm:h-36 sm:w-36 object-contain rounded-sm font-normal border-slate-100 text-5xl"
            />
            <div className="hidden sm:block">
              <h1 className="font-medium text-xs">Recognition System</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Bell className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-sm">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.department}</p>
              </div>
              <Badge className={`${getRoleColor(user.role)} hidden sm:inline-flex`} variant="secondary">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${canViewEvaluationResults(user, '') ? 'grid-cols-6' : 'grid-cols-5'} h-auto`}>
            <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="evaluations" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Evaluations</span>
            </TabsTrigger>
            <TabsTrigger value="recognition" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Recognition</span>
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Automation</span>
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </TabsTrigger>
            {canViewEvaluationResults(user, '') && (
              <TabsTrigger value="results" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Results</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Active Evaluations
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-semibold text-orange-700 border-cyan-800">12</div>
                  <p className="text-sm text-lime-800">March cycle ongoing</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" />
                    Nominations Open
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-red-700 font-semibold text-3xl bg-slate-100 border-cyan-800">5</div>
                  <p className="text-sm text-lime-800">Days remaining</p>
                </CardContent>
              </Card>
              
              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Pending Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-semibold text-red-700">3</div>
                  <p className="text-sm text-lime-800">Requiring attention</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="h-2 w-2 bg-accent rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Evaluation completed for John Smith</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">New nomination submitted</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="h-2 w-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Reminder sent to 8 evaluators</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Button 
                    variant="outline" 
                    className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
                    onClick={() => setActiveTab('evaluations')}
                  >
                    <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Start Evaluation</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
                    onClick={() => setActiveTab('recognition')}
                  >
                    <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Submit Nomination</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
                    onClick={() => setActiveTab('automation')}
                  >
                    <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Configure Tasks</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
                    onClick={() => setActiveTab('ai-assistant')}
                  >
                    <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>AI Assistant</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="evaluations">
            <EvaluationCenter user={user} />
          </TabsContent>

          <TabsContent value="recognition">
            <RecognitionCenter user={user} />
          </TabsContent>

          <TabsContent value="automation">
            <AutomationCenter user={user} />
          </TabsContent>

          <TabsContent value="ai-assistant">
            <AIAssistant user={user} />
          </TabsContent>

          {canViewEvaluationResults(user, '') && (
            <TabsContent value="results">
              <ResultsCenter user={user} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}