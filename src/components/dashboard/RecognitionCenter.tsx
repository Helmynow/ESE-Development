import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { 
  Award, 
  Star, 
  Crown, 
  Lightbulb, 
  TrendingUp, 
  Heart,
  Plus,
  Vote,
  Users,
  Calendar,
  Trophy,
  Bot,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import {
  validateNominationSubmission,
  type EligibilityFlag,
  type NominationRecord,
  type WinnerRecord
} from '@/lib/recognition-policy'

interface User {
  id: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  department: string
  email: string
  oasisId: string
}

type Nomination = NominationRecord
type Winner = WinnerRecord

interface RecognitionCenterProps {
  user: User
}

const categories = [
  { id: 'leadership', name: 'Outstanding Leadership', icon: Crown, color: 'text-purple-500' },
  { id: 'teamspirit', name: 'Team Spirit', icon: Heart, color: 'text-pink-500' },
  { id: 'innovation', name: 'Innovation', icon: Lightbulb, color: 'text-yellow-500' },
  { id: 'risingstar', name: 'Rising Star', icon: TrendingUp, color: 'text-blue-500' },
  { id: 'service', name: 'Service Excellence', icon: Star, color: 'text-green-500' }
]

const mockNominations: Nomination[] = [
  {
    id: '1',
    nomineeId: 'emp1',
    nomineeName: 'Nour Al-Masry',
    nomineeDepartment: 'Primary School',
    category: 'leadership',
    nominatorName: 'Mahmoud El-Khouly',
    description: 'Led the English curriculum innovation with exceptional dedication and student-centered approach.',
    submittedDate: '2025-01-18',
    status: 'voting',
    votes: 8,
    totalVoters: 12
  },
  {
    id: '2',
    nomineeId: 'emp2',
    nomineeName: 'Omar Abdel-Rahman',
    nomineeDepartment: 'Administration',
    category: 'innovation',
    nominatorName: 'Dr. Amira Hassan',
    description: 'Implemented digital workflow system that improved efficiency across all departments.',
    submittedDate: '2025-01-17',
    status: 'voting',
    votes: 6,
    totalVoters: 12
  },
  {
    id: '3',
    nomineeId: 'emp3',
    nomineeName: 'Yasmin Said',
    nomineeDepartment: 'Secondary School',
    category: 'risingstar',
    nominatorName: 'Ahmed Farouk',
    description: 'Outstanding performance in first year, excellent student feedback and innovative teaching methods.',
    submittedDate: '2025-01-16',
    status: 'pending',
    votes: 0,
    totalVoters: 12
  }
]

const mockWinners: Winner[] = [
  {
    id: '1',
    name: 'Layla Mostafa',
    category: 'Service Excellence',
    month: 'December 2024',
    department: 'Administration',
    description: 'Exceptional support during registration period and parent communications'
  },
  {
    id: '2',
    name: 'Ahmed Farouk',
    category: 'Team Spirit',
    month: 'November 2024',
    department: 'Secondary School',
    description: 'Outstanding collaboration on the International Baccalaureate preparation program'
  },
  {
    id: '3',
    name: 'Dr. Amira Hassan',
    category: 'Outstanding Leadership',
    month: 'October 2024',
    department: 'People & Culture',
    description: 'Excellent leadership during staff development and training initiatives'
  }
]

export function RecognitionCenter({ user }: RecognitionCenterProps) {
  const [nominations, setNominations] = useKV<Nomination[]>('nominations', mockNominations)
  const [winners] = useKV<Winner[]>('winners', mockWinners)
  const [isNominating, setIsNominating] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string>('')
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [nominationForm, setNominationForm] = useState({
    nomineeName: '',
    nomineeDepartment: '',
    category: '',
    description: '',
    achievements: ''
  })

  const eligibilityFlags: EligibilityFlag[] = []

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[0]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selected': return 'bg-accent text-accent-foreground'
      case 'voting': return 'bg-primary text-primary-foreground'
      case 'rejected': return 'bg-destructive text-destructive-foreground'
      default: return 'bg-secondary text-secondary-foreground'
    }
  }

  const handleSubmitNomination = async () => {
    if (!nominationForm.nomineeName || !nominationForm.category || !nominationForm.description) {
      toast.error('Please fill in all required fields')
      return
    }

    const trimmedNomineeName = nominationForm.nomineeName.trim()

    const policyViolations = validateNominationSubmission(
      {
        nomineeName: trimmedNomineeName,
        nomineeDepartment: nominationForm.nomineeDepartment,
        category: nominationForm.category,
        nominatorName: user.name
      },
      {
        existingNominations: nominations ?? [],
        winners: winners ?? [],
        ineligibleNominees: eligibilityFlags
      }
    )

    if (policyViolations.length > 0) {
      policyViolations.forEach(violation => {
        toast.error(violation.message)
      })
      return
    }

    const previousNominations = nominations ? [...nominations] : []
    const nomineeDepartment = nominationForm.nomineeDepartment || user.department
    const generateId = () => {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
      }
      return `nomination-${Date.now()}`
    }
    const sanitizedNomineeId = `nominee-${trimmedNomineeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    const newNomination: Nomination = {
      id: generateId(),
      nomineeId: sanitizedNomineeId,
      nomineeName: trimmedNomineeName,
      nomineeDepartment,
      category: nominationForm.category,
      nominatorName: user.name,
      description: nominationForm.description,
      submittedDate: new Date().toISOString(),
      status: 'pending',
      votes: 0,
      totalVoters: 0
    }

    try {
      setNominations(previous => {
        const current = previous ?? []
        return [...current, newNomination]
      })
      toast.success(`Nomination submitted for ${trimmedNomineeName}`)
      setIsNominating(false)
      setNominationForm({
        nomineeName: '',
        nomineeDepartment: '',
        category: '',
        description: '',
        achievements: ''
      })
    } catch (error) {
      console.error('Failed to persist nomination:', error)
      toast.error('Unable to save nomination. Please try again.')
      try {
        setNominations(previousNominations)
      } catch (resetError) {
        console.error('Failed to reset nominations after error:', resetError)
      }
    }
  }

  const handleVote = (nominationId: string) => {
    if (!nominations) {
      toast.error('Nomination list is unavailable')
      return
    }

    const targetNomination = nominations.find(nomination => nomination.id === nominationId)

    if (!targetNomination) {
      toast.error('Nomination not found for voting')
      return
    }

    if (targetNomination.status !== 'voting') {
      toast.error('Voting is not open for this nomination')
      return
    }

    const previousNominations = [...nominations]

    try {
      setNominations(previous => {
        const current = previous ?? []
        return current.map(nomination => {
          if (nomination.id !== nominationId) {
            return nomination
          }

          return {
            ...nomination,
            votes: nomination.votes + 1
          }
        })
      })

      toast.success('Vote submitted successfully')
    } catch (error) {
      console.error('Error persisting vote:', error)
      toast.error('Failed to record vote. Please try again.')
      try {
        setNominations(previousNominations)
      } catch (resetError) {
        console.error('Failed to reset nominations after vote error:', resetError)
      }
    }
  }

  const generateAISuggestions = async () => {
    setIsGeneratingSuggestions(true)
    try {
      const activeNominations = (nominations || []).filter(n => n.status === 'voting' || n.status === 'pending').length
      const departmentCounts = (nominations || []).reduce((acc, nom) => {
        acc[nom.nomineeDepartment] = (acc[nom.nomineeDepartment] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const prompt = `Generate employee recognition suggestions for ${user.department} department at an educational institution.

Current recognition data:
- Active nominations: ${activeNominations}
- User role: ${user.role}
- User department: ${user.department}
- Department representation in nominations: ${JSON.stringify(departmentCounts)}

Available categories: ${categories.map(c => c.name).join(', ')}

Provide actionable suggestions for:
1. Improving nomination quality and participation
2. Identifying underrepresented areas/departments
3. Category-specific recognition strategies
4. Best practices for recognition programs

Keep suggestions practical and implementable.`

      const suggestions = await window.spark.llm(prompt)
      setAiSuggestions(suggestions)
      toast.success('AI suggestions generated successfully')
    } catch (error) {
      console.error('Error generating AI suggestions:', error)
      toast.error('Failed to generate AI suggestions. Please try again.')
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  const nominationWindowOpen = true
  const daysRemaining = 5

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Employee Recognition Center</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Celebrate excellence through structured nomination and voting
          </p>
        </div>
        <Dialog open={isNominating} onOpenChange={setIsNominating}>
          <DialogTrigger asChild>
            <Button disabled={!nominationWindowOpen} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Submit Nomination
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Employee Nomination</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nominee Name *</Label>
                  <Input
                    placeholder="Enter employee name"
                    value={nominationForm.nomineeName}
                    onChange={(e) => setNominationForm(prev => ({
                      ...prev,
                      nomineeName: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Select 
                    value={nominationForm.nomineeDepartment} 
                    onValueChange={(value) => setNominationForm(prev => ({
                      ...prev,
                      nomineeDepartment: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary-school">Primary School</SelectItem>
                      <SelectItem value="secondary-school">Secondary School</SelectItem>
                      <SelectItem value="administration">Administration</SelectItem>
                      <SelectItem value="people-culture">People & Culture</SelectItem>
                      <SelectItem value="quality-assurance">Quality Assurance</SelectItem>
                      <SelectItem value="international-program">International Program</SelectItem>
                      <SelectItem value="language-program">Language Program</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Award Category *</Label>
                <Select 
                  value={nominationForm.category} 
                  onValueChange={(value) => setNominationForm(prev => ({
                    ...prev,
                    category: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select award category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Nomination Description *</Label>
                <Textarea
                  placeholder="Describe why this employee deserves recognition..."
                  value={nominationForm.description}
                  onChange={(e) => setNominationForm(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  rows={4}
                />
              </div>

              <div>
                <Label>Specific Achievements</Label>
                <Textarea
                  placeholder="List specific achievements, projects, or contributions..."
                  value={nominationForm.achievements}
                  onChange={(e) => setNominationForm(prev => ({
                    ...prev,
                    achievements: e.target.value
                  }))}
                  rows={3}
                />
              </div>

              <Button onClick={handleSubmitNomination} className="w-full">
                Submit Nomination
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Nomination Window
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{daysRemaining}</div>
            <p className="text-sm text-muted-foreground">Days remaining</p>
            <div className="mt-3">
              <Progress value={(7 - daysRemaining) / 7 * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Active Nominations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nominations?.length || 0}</div>
            <p className="text-sm text-muted-foreground">This cycle</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Vote className="h-5 w-5 text-purple-500" />
              Pending Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nominations?.filter(n => n.status === 'voting').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Requiring your vote</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Categories Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-sm text-muted-foreground">Award types</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-green-500" />
            AI Recognition Insights
            <Sparkles className="h-4 w-4 text-green-400" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Get AI-powered suggestions to improve your recognition program's effectiveness
            </p>
            <Button 
              onClick={generateAISuggestions}
              disabled={isGeneratingSuggestions}
              variant="outline"
              size="sm"
            >
              {isGeneratingSuggestions ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Get Suggestions
                </>
              )}
            </Button>
          </div>
          
          {aiSuggestions && (
            <div className="bg-muted/50 p-4 rounded-lg border">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm">{aiSuggestions}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {categories.map(category => {
          const Icon = category.icon
          const categoryNominations = nominations?.filter(n => n.category === category.id) || []
          
          return (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="text-center pb-3">
                <Icon className={`h-8 w-8 mx-auto mb-2 ${category.color}`} />
                <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-xl font-bold">{categoryNominations.length}</div>
                <p className="text-xs text-muted-foreground">Nominations</p>
                {categoryNominations.length > 0 && (
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    View Details
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {nominations && nominations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Nominations</h3>
          <div className="space-y-3">
            {nominations.map(nomination => {
              const categoryInfo = getCategoryInfo(nomination.category)
              const Icon = categoryInfo.icon
              const totalVotesLabel = nomination.totalVoters > 0
                ? `${nomination.votes}/${nomination.totalVoters} votes`
                : `${nomination.votes} vote${nomination.votes === 1 ? '' : 's'}`
              const votingProgress = nomination.totalVoters > 0
                ? Math.min(100, (nomination.votes / nomination.totalVoters) * 100)
                : 0

              return (
                <Card key={nomination.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-5 w-5 ${categoryInfo.color}`} />
                            <h4 className="font-semibold">{nomination.nomineeName}</h4>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{nomination.nomineeDepartment}</Badge>
                            <Badge className={getStatusColor(nomination.status)}>
                              {nomination.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          <span className="font-medium">Category:</span> {categoryInfo.name}
                        </p>
                        
                        <p className="text-sm mb-3">{nomination.description}</p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
                          <span>
                            <span className="font-medium">Nominated by:</span> {nomination.nominatorName}
                          </span>
                          <span>
                            <span className="font-medium">Date:</span> {new Date(nomination.submittedDate).toLocaleDateString()}
                          </span>
                        </div>

                        {nomination.status === 'voting' && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">Voting Progress:</span>
                              <span className="text-sm text-muted-foreground">{totalVotesLabel}</span>
                            </div>
                            <Progress value={votingProgress} className="h-2" />
                          </div>
                        )}
                      </div>

                      {nomination.status === 'voting' && user.role !== 'staff' && (
                        <div className="flex sm:flex-col gap-2">
                          <Button size="sm" onClick={() => handleVote(nomination.id)} className="w-full sm:w-auto">
                            <Vote className="h-4 w-4 mr-2" />
                            Vote
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {winners && winners.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Winners</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {winners.map(winner => (
              <Card key={winner.id} className="border-accent/20 bg-accent/5">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="h-6 w-6 text-accent flex-shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-semibold">{winner.name}</h4>
                      <p className="text-sm text-muted-foreground">{winner.department}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <Badge className="bg-accent text-accent-foreground w-fit">
                        {winner.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{winner.month}</span>
                    </div>
                    <p className="text-sm">{winner.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}