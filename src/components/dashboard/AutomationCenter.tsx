import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Settings, 
  Clock, 
  Bell, 
  Calendar, 
  Mail, 
  Play, 
  Pause, 
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle,
  Zap,
  Bot,
  Brain
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  department: string
  email: string
  oasisId: string
}

interface AutomatedTask {
  id: string
  name: string
  description: string
  type: 'reminder' | 'notification' | 'report' | 'evaluation'
  schedule: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  isActive: boolean
  lastRun: string
  nextRun: string
  recipients: string[]
  conditions: string
}

interface AutomationCenterProps {
  user: User
}

const mockTasks: AutomatedTask[] = [
  {
    id: '1',
    name: 'Evaluation Reminder',
    description: 'Send reminders to evaluators 3 days before deadline',
    type: 'reminder',
    schedule: '0 9 * * *',
    frequency: 'daily',
    isActive: true,
    lastRun: '2025-01-19T09:00:00Z',
    nextRun: '2025-01-20T09:00:00Z',
    recipients: ['department-heads', 'evaluators'],
    conditions: 'evaluation.dueDate <= now + 3 days AND evaluation.status != completed'
  },
  {
    id: '2',
    name: 'Nomination Window Opening',
    description: 'Notify all staff when nomination window opens (15th of each month)',
    type: 'notification',
    schedule: '0 8 15 * *',
    frequency: 'monthly',
    isActive: true,
    lastRun: '2025-01-15T08:00:00Z',
    nextRun: '2025-02-15T08:00:00Z',
    recipients: ['all-staff'],
    conditions: 'date.day == 15'
  },
  {
    id: '3',
    name: 'Monthly Recognition Report',
    description: 'Generate and distribute monthly recognition summary',
    type: 'report',
    schedule: '0 17 1 * *',
    frequency: 'monthly',
    isActive: true,
    lastRun: '2025-01-01T17:00:00Z',
    nextRun: '2025-02-01T17:00:00Z',
    recipients: ['senior-leadership'],
    conditions: 'date.day == 1'
  },
  {
    id: '4',
    name: 'Overdue Evaluation Alert',
    description: 'Alert administrators about overdue evaluations',
    type: 'notification',
    schedule: '0 10,15 * * *',
    frequency: 'custom',
    isActive: false,
    lastRun: '2025-01-18T15:00:00Z',
    nextRun: '2025-01-20T10:00:00Z',
    recipients: ['administrators'],
    conditions: 'evaluation.dueDate < now AND evaluation.status != completed'
  }
]

export function AutomationCenter({ user }: AutomationCenterProps) {
  const [tasks] = useKV<AutomatedTask[]>('automated-tasks', mockTasks)
  const [isCreating, setIsCreating] = useState(false)
  const [aiOptimizations, setAiOptimizations] = useState<string>('')
  const [isGeneratingOptimizations, setIsGeneratingOptimizations] = useState(false)
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    type: 'reminder' as const,
    frequency: 'daily' as const,
    schedule: '0 9 * * *',
    recipients: [] as string[],
    conditions: ''
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return Bell
      case 'notification': return Mail
      case 'report': return Calendar
      case 'evaluation': return Settings
      default: return Clock
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'text-orange-500'
      case 'notification': return 'text-blue-500'
      case 'report': return 'text-purple-500'
      case 'evaluation': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'
  }

  const handleToggleTask = (taskId: string) => {
    const task = tasks?.find(t => t.id === taskId)
    if (task) {
      toast.success(`Task ${task.isActive ? 'paused' : 'activated'}: ${task.name}`)
    }
  }

  const handleRunNow = (taskId: string) => {
    const task = tasks?.find(t => t.id === taskId)
    if (task) {
      toast.success(`Executing task: ${task.name}`)
    }
  }

  const handleDeleteTask = (taskId: string) => {
    const task = tasks?.find(t => t.id === taskId)
    if (task) {
      toast.success(`Deleted task: ${task.name}`)
    }
  }

  const handleCreateTask = () => {
    if (!newTask.name || !newTask.description) {
      toast.error('Please fill in all required fields')
      return
    }
    
    toast.success(`Created new automated task: ${newTask.name}`)
    setIsCreating(false)
    setNewTask({
      name: '',
      description: '',
      type: 'reminder',
      frequency: 'daily',
      schedule: '0 9 * * *',
      recipients: [],
      conditions: ''
    })
  }

  const generateAIOptimizations = async () => {
    setIsGeneratingOptimizations(true)
    try {
      const activeCount = tasks?.filter(t => t.isActive).length || 0
      const taskTypes = tasks?.map(t => t.type) || []
      const taskFrequencies = tasks?.map(t => t.frequency) || []
      
      const prompt = `Generate workflow automation optimization recommendations for a Recognition System.

Current automation status:
- Total tasks: ${tasks?.length || 0}
- Active tasks: ${activeCount}
- Task types: ${[...new Set(taskTypes)].join(', ')}
- Frequencies: ${[...new Set(taskFrequencies)].join(', ')}
- User role: ${user.role}
- Department: ${user.department}

Provide specific recommendations for:
1. Automation opportunities and efficiency improvements
2. Task scheduling optimization
3. Notification timing best practices
4. Process automation ideas specific to ${user.role} role
5. Integration possibilities between different workflows

Keep recommendations actionable and implementable.`

      const optimizations = await window.spark.llm(prompt)
      setAiOptimizations(optimizations)
      toast.success('AI optimization recommendations generated')
    } catch (error) {
      console.error('Error generating AI optimizations:', error)
      toast.error('Failed to generate optimizations. Please try again.')
    } finally {
      setIsGeneratingOptimizations(false)
    }
  }

  const activeTasks = tasks?.filter(t => t.isActive).length || 0
  const totalTasks = tasks?.length || 0

  if (user.role === 'staff') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md text-center">
          <CardContent className="p-6">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Automation management is available to administrators and managers only.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Automation Center</h2>
          <p className="sm:text-base text-muted-foreground text-xs">Manage automated tasks for evaluations, notifications, and reports</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Automated Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Task Name *</Label>
                  <Input
                    placeholder="Enter task name"
                    value={newTask.name}
                    onChange={(e) => setNewTask(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label>Task Type</Label>
                  <Select 
                    value={newTask.type} 
                    onValueChange={(value: any) => setNewTask(prev => ({
                      ...prev,
                      type: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="evaluation">Evaluation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  placeholder="Describe what this task does..."
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Frequency</Label>
                  <Select 
                    value={newTask.frequency} 
                    onValueChange={(value: any) => setNewTask(prev => ({
                      ...prev,
                      frequency: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Schedule (Cron)</Label>
                  <Input
                    placeholder="0 9 * * *"
                    value={newTask.schedule}
                    onChange={(e) => setNewTask(prev => ({
                      ...prev,
                      schedule: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label>Execution Conditions</Label>
                <Textarea
                  placeholder="Define when this task should run (e.g., evaluation.dueDate <= now + 3 days)..."
                  value={newTask.conditions}
                  onChange={(e) => setNewTask(prev => ({
                    ...prev,
                    conditions: e.target.value
                  }))}
                />
              </div>

              <Button onClick={handleCreateTask} className="w-full">
                Create Automated Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks}</div>
            <p className="text-muted-foreground text-xs">Running automatically</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-muted-foreground text-xs">Configured</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Last 24h Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-muted-foreground text-xs">Successful executions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Failures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Optimization Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            AI Workflow Optimization
            <Brain className="h-4 w-4 text-blue-400" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Get AI-powered recommendations to optimize your automation workflows and improve efficiency
            </p>
            <Button 
              onClick={generateAIOptimizations}
              disabled={isGeneratingOptimizations}
              variant="outline"
              size="sm"
            >
              {isGeneratingOptimizations ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize Workflows
                </>
              )}
            </Button>
          </div>
          
          {aiOptimizations && (
            <div className="bg-muted/50 p-4 rounded-lg border">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm">{aiOptimizations}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configured Tasks</h3>
        <div className="space-y-3">
          {tasks?.map(task => {
            const Icon = getTypeIcon(task.type)
            
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`h-5 w-5 ${getTypeColor(task.type)}`} />
                        <h4 className="font-semibold">{task.name}</h4>
                        <Badge variant="outline" className="capitalize">
                          {task.type}
                        </Badge>
                        <Badge className={getStatusColor(task.isActive)}>
                          {task.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {task.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Schedule:</span>
                          <p className="capitalize">{task.frequency} ({task.schedule})</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Last Run:</span>
                          <p>{new Date(task.lastRun).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Next Run:</span>
                          <p>{new Date(task.nextRun).toLocaleString()}</p>
                        </div>
                      </div>

                      {task.conditions && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <span className="text-sm font-medium text-muted-foreground">Conditions:</span>
                          <code className="text-sm block mt-1 text-foreground">{task.conditions}</code>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleTask(task.id)}
                      >
                        {task.isActive ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunNow(task.id)}
                        disabled={!task.isActive}
                      >
                        <Zap className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }) || []}
        </div>
      </div>
    </div>
  );
}