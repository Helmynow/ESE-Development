import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Bot, 
  Send, 
  Lightbulb, 
  TrendingUp, 
  FileText, 
  Users,
  Award,
  Calendar,
  Settings,
  Loader2,
  Sparkles,
  Brain,
  BarChart3
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

interface AIAssistantProps {
  user: User
}

interface Suggestion {
  id: string
  type: 'insight' | 'recommendation' | 'automation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'evaluation' | 'recognition' | 'workflow' | 'analysis'
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIAssistant({ user }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState('chat')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello ${user.name}! I'm your AI assistant for the Recognition System. I can help you with evaluation insights, recognition recommendations, workflow optimization, and data analysis. What would you like to explore today?`,
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions] = useState<Suggestion[]>([
    {
      id: '1',
      type: 'insight',
      title: 'Evaluation Completion Trend',
      description: 'Your department has shown a 15% increase in on-time evaluation completions this quarter.',
      impact: 'high',
      category: 'evaluation'
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Recognition Distribution',
      description: 'Consider highlighting achievements from the IT department - they have received fewer nominations recently.',
      impact: 'medium',
      category: 'recognition'
    },
    {
      id: '3',
      type: 'automation',
      title: 'Reminder Optimization',
      description: 'Sending reminders on Tuesday afternoons shows 23% higher response rates.',
      impact: 'medium',
      category: 'workflow'
    }
  ])

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsLoading(true)

    try {
      const prompt = `You are an AI assistant for a Recognition System at an educational institution. The user is ${user.name} with role ${user.role} in the ${user.department} department. 

The user asked: "${chatInput}"

Provide a helpful, professional response that focuses on:
- Evaluation management and insights
- Employee recognition strategies
- Workflow optimization
- Data analysis and reporting
- Administrative automation

Keep responses concise, actionable, and relevant to their role and context.`

      const response = await window.spark.llm(prompt)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, assistantMessage])
      toast.success('Response generated successfully')
    } catch (error) {
      console.error('AI Assistant error:', error)
      toast.error('Failed to get AI response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateEvaluationInsights = async () => {
    setIsLoading(true)
    try {
      const prompt = `Generate evaluation insights for ${user.department} department. Create 3-4 actionable insights about evaluation performance, completion rates, trends, and recommendations for improvement. Format as a clear, professional analysis.`
      
      const insights = await window.spark.llm(prompt)
      
      const insightMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `## Evaluation Insights for ${user.department}\n\n${insights}`,
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, insightMessage])
      setActiveTab('chat')
      toast.success('Evaluation insights generated')
    } catch (error) {
      console.error('Error generating insights:', error)
      toast.error('Failed to generate insights')
    } finally {
      setIsLoading(false)
    }
  }

  const generateRecognitionSuggestions = async () => {
    setIsLoading(true)
    try {
      const prompt = `Generate employee recognition suggestions for ${user.department} department. Include ideas for nomination categories, recognition criteria, and strategies to increase participation and fairness. Make it practical and implementable.`
      
      const suggestions = await window.spark.llm(prompt)
      
      const suggestionMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `## Recognition Suggestions for ${user.department}\n\n${suggestions}`,
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, suggestionMessage])
      setActiveTab('chat')
      toast.success('Recognition suggestions generated')
    } catch (error) {
      console.error('Error generating suggestions:', error)
      toast.error('Failed to generate suggestions')
    } finally {
      setIsLoading(false)
    }
  }

  const generateWorkflowOptimization = async () => {
    setIsLoading(true)
    try {
      const prompt = `Generate workflow optimization recommendations for a Recognition System. Focus on automation opportunities, process improvements, timing optimizations, and efficiency gains. Make recommendations specific and actionable for ${user.role} role.`
      
      const optimization = await window.spark.llm(prompt)
      
      const optimizationMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `## Workflow Optimization Recommendations\n\n${optimization}`,
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, optimizationMessage])
      setActiveTab('chat')
      toast.success('Workflow optimization generated')
    } catch (error) {
      console.error('Error generating optimization:', error)
      toast.error('Failed to generate optimization')
    } finally {
      setIsLoading(false)
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'insight': return <TrendingUp className="h-4 w-4" />
      case 'recommendation': return <Lightbulb className="h-4 w-4" />
      case 'automation': return <Settings className="h-4 w-4" />
      default: return <Bot className="h-4 w-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">AI Assistant</h2>
        <Badge variant="secondary" className="ml-2">
          <Sparkles className="h-3 w-3 mr-1" />
          Powered by AI
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Chat Assistant
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Smart Insights
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card className="h-96">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Chat Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-64 overflow-y-auto space-y-3 p-3 bg-muted/30 rounded-lg">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border shadow-sm'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-background border shadow-sm p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything about evaluations, recognition, or workflows..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !chatInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getSuggestionIcon(suggestion.type)}
                        <h3 className="font-medium">{suggestion.title}</h3>
                        <Badge className={getImpactColor(suggestion.impact)} variant="secondary">
                          {suggestion.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Evaluation Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate AI-powered insights about evaluation performance, trends, and improvement opportunities.
                </p>
                <Button onClick={generateEvaluationInsights} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                  Generate Insights
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Recognition Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get AI recommendations for improving employee recognition programs and nomination strategies.
                </p>
                <Button onClick={generateRecognitionSuggestions} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                  Get Suggestions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-green-500" />
                  Workflow Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover automation opportunities and process improvements for better efficiency.
                </p>
                <Button onClick={generateWorkflowOptimization} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                  Optimize Workflows
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Smart Content Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate evaluation criteria, recognition templates, and communication content.
                </p>
                <Button disabled className="w-full" variant="outline">
                  <Bot className="h-4 w-4" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}