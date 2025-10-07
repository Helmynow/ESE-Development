import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Star,
  Plus,
  Eye,
  Send,
  Shield,
  Lock,
  Bot,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getUserAuthorizedEvaluations,
  canViewEvaluationResults,
  canViewOtherRatings,
  isAuthorizedToEvaluate,
  getEvaluationRoleAndWeight
} from '@/lib/authorization'
import { getExpectedRaterCount } from '@/lib/evaluations'
import { getAllStaff } from '@/data/staff-data'

interface User {
  id: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  department: string
  email: string
  oasisId: string
}

interface Evaluation {
  id: string
  evalueeId: string
  evalueeName: string
  evalueeRole: string
  evalueeDepartment: string
  cycle: string
  status: 'pending' | 'in-progress' | 'completed'
  dueDate: string
  completedBy: string[]
  totalRaters: number
  myRating?: EvaluationRating
}

interface EvaluationRating {
  evaluatorId: string
  evaluatorRole?: string
  weight?: number
  scores: Record<string, number>
  feedback: {
    strengths: string
    improvements: string
    comments: string
  }
  submittedAt: string
}

interface EvaluationCenterProps {
  user: User
}

// Get all staff members from the centralized data
const allStaff = getAllStaff()

export function EvaluationCenter({ user }: EvaluationCenterProps) {
  const [evaluationRatings, setEvaluationRatings] = useKV<Record<string, EvaluationRating[]>>('evaluation-ratings', {})
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [aiInsights, setAiInsights] = useState<string>('')
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [evaluationForm, setEvaluationForm] = useState({
    // Academic Staff Criteria
    teachingEffectiveness: 5,
    studentEngagement: 5,
    curriculumImplementation: 5,
    classroomManagement: 5,
    // Administrative Staff Criteria  
    taskManagement: 5,
    policyAdherence: 5,
    interdepartmentalCommunication: 5,
    serviceQuality: 5,
    // Common Criteria
    collaboration: 5,
    innovation: 5,
    attendance: 5,
    professionalDevelopment: 5,
    // Feedback fields
    comments: '',
    strengths: '',
    improvements: ''
  })

  // Get user's authorized evaluations
  const authorizedEvaluations = getUserAuthorizedEvaluations(user, allStaff)
  
  // Create evaluation objects from authorized assignments
  const userEvaluations: Evaluation[] = authorizedEvaluations.map(assignment => {
    const evaluee = allStaff.find(s => s.id === assignment.evalueeId)!
    const roleAndWeight = getEvaluationRoleAndWeight(user, assignment.evalueeId, authorizedEvaluations)!
    const existingRating = evaluationRatings?.[assignment.evalueeId]?.find(r => r.evaluatorId === user.id)
    const expectedRaters = getExpectedRaterCount(assignment.evalueeId, allStaff)

    return {
      id: `eval-${assignment.evalueeId}-${user.id}`,
      evalueeId: assignment.evalueeId,
      evalueeName: evaluee.name,
      evalueeRole: evaluee.department,
      evalueeDepartment: evaluee.department,
      cycle: 'March 2025',
      status: existingRating ? 'completed' : 'pending',
      dueDate: '2025-03-20',
      completedBy: evaluationRatings?.[assignment.evalueeId]?.map(r => r.evaluatorId) || [],
      totalRaters: expectedRaters,
      myRating: existingRating
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-accent text-accent-foreground'
      case 'in-progress': return 'bg-primary text-primary-foreground'
      default: return 'bg-secondary text-secondary-foreground'
    }
  }

  const getProgress = (evaluation: Evaluation) => {
    if (!evaluation.totalRaters) {
      return 0
    }

    return (evaluation.completedBy.length / evaluation.totalRaters) * 100
  }

  const handleStartEvaluation = (evaluation: Evaluation) => {
    // Check authorization
    if (!isAuthorizedToEvaluate(user, evaluation.evalueeId, authorizedEvaluations)) {
      toast.error('You are not authorized to evaluate this employee')
      return
    }

    setSelectedEvaluation(evaluation)
    setIsEvaluating(true)
  }

  const handleSubmitEvaluation = async () => {
    if (!selectedEvaluation) return
    
    // Calculate average based on role-specific criteria
    let averageScore = 0
    const isAcademic = selectedEvaluation.evalueeRole.toLowerCase().includes('teacher') || 
                      selectedEvaluation.evalueeRole.toLowerCase().includes('coordinator')
    
    if (isAcademic) {
      // Academic staff evaluation
      averageScore = (
        evaluationForm.teachingEffectiveness + 
        evaluationForm.studentEngagement + 
        evaluationForm.curriculumImplementation + 
        evaluationForm.classroomManagement +
        evaluationForm.collaboration + 
        evaluationForm.innovation +
        evaluationForm.attendance +
        evaluationForm.professionalDevelopment
      ) / 8
    } else {
      // Administrative staff evaluation
      averageScore = (
        evaluationForm.taskManagement + 
        evaluationForm.policyAdherence + 
        evaluationForm.interdepartmentalCommunication + 
        evaluationForm.serviceQuality +
        evaluationForm.collaboration + 
        evaluationForm.innovation +
        evaluationForm.attendance +
        evaluationForm.professionalDevelopment
      ) / 8
    }

    // Create rating object
    const roleAndWeight = getEvaluationRoleAndWeight(user, selectedEvaluation.evalueeId, authorizedEvaluations)

    const newRating: EvaluationRating = {
      evaluatorId: user.id,
      evaluatorRole: roleAndWeight?.role,
      weight: roleAndWeight?.weight,
      scores: {
        ...(isAcademic ? {
          teachingEffectiveness: evaluationForm.teachingEffectiveness,
          studentEngagement: evaluationForm.studentEngagement,
          curriculumImplementation: evaluationForm.curriculumImplementation,
          classroomManagement: evaluationForm.classroomManagement,
        } : {
          taskManagement: evaluationForm.taskManagement,
          policyAdherence: evaluationForm.policyAdherence,
          interdepartmentalCommunication: evaluationForm.interdepartmentalCommunication,
          serviceQuality: evaluationForm.serviceQuality,
        }),
        collaboration: evaluationForm.collaboration,
        innovation: evaluationForm.innovation,
        attendance: evaluationForm.attendance,
        professionalDevelopment: evaluationForm.professionalDevelopment,
      },
      feedback: {
        strengths: evaluationForm.strengths,
        improvements: evaluationForm.improvements,
        comments: evaluationForm.comments
      },
      submittedAt: new Date().toISOString()
    }

    // Update ratings
    setEvaluationRatings(current => {
      const currentRatings = current || {}
      const evalueeRatings = currentRatings[selectedEvaluation.evalueeId] || []
      const filteredRatings = evalueeRatings.filter(r => r.evaluatorId !== user.id)
      return {
        ...currentRatings,
        [selectedEvaluation.evalueeId]: [...filteredRatings, newRating]
      }
    })

    toast.success(`Evaluation submitted for ${selectedEvaluation.evalueeName}. Your rating: ${averageScore.toFixed(1)}/10`)
    setIsEvaluating(false)
    setSelectedEvaluation(null)
  }

  const pendingEvaluations = userEvaluations.filter(e => e.status !== 'completed')
  const completedEvaluations = userEvaluations.filter(e => e.status === 'completed')

  const generateAIInsights = async () => {
    setIsGeneratingInsights(true)
    try {
      const completedCount = completedEvaluations.length
      const pendingCount = pendingEvaluations.length
      const inProgressCount = userEvaluations.filter(e => e.status === 'in-progress').length
      
      const prompt = `Generate evaluation insights for ${user.name} (${user.role}) in ${user.department} department. 

Current Status:
- Completed evaluations: ${completedCount}
- Pending evaluations: ${pendingCount}
- In progress: ${inProgressCount}
- Total assigned: ${userEvaluations.length}

Provide 3-4 actionable insights about:
1. Evaluation performance and trends
2. Time management recommendations
3. Quality improvement suggestions
4. Department-specific best practices

Keep it professional, concise, and actionable.`

      const insights = await window.spark.llm(prompt)
      setAiInsights(insights)
      toast.success('AI insights generated successfully')
    } catch (error) {
      console.error('Error generating AI insights:', error)
      toast.error('Failed to generate AI insights. Please try again.')
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold border-slate-200">Multi-Rater Evaluation Center</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Complete authorized evaluations for ESE staff following our bi-annual assessment cycle
          </p>
        </div>
        {/* Show authorization info */}
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {authorizedEvaluations.length} evaluation{authorizedEvaluations.length !== 1 ? 's' : ''} assigned
          </span>
        </div>
      </div>

      {/* Authorization Alert for restricted users */}
      {user.role !== 'admin' && !canViewEvaluationResults(user, '') && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You can only view and complete evaluations you are authorized for. 
            Final results and other evaluators' ratings are confidential and visible only to CEO and P&C Head.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEvaluations.length}</div>
            <p className="text-sm text-muted-foreground">Awaiting your input</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userEvaluations.filter(e => e.status === 'in-progress').length}
            </div>
            <p className="text-sm text-muted-foreground">Partial completion</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedEvaluations.length}</div>
            <p className="text-sm text-muted-foreground">This cycle</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            AI Performance Insights
            <Sparkles className="h-4 w-4 text-blue-400" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Get AI-powered insights about your evaluation performance and recommendations
            </p>
            <Button 
              onClick={generateAIInsights}
              disabled={isGeneratingInsights}
              variant="outline"
              size="sm"
            >
              {isGeneratingInsights ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
          
          {aiInsights && (
            <div className="bg-muted/50 p-4 rounded-lg border">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm">{aiInsights}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Assigned Evaluations</h3>
        {userEvaluations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No evaluations assigned</h3>
              <p className="text-muted-foreground">
                You don't have any pending evaluations at this time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {userEvaluations.map(evaluation => {
              const roleAndWeight = getEvaluationRoleAndWeight(user, evaluation.evalueeId, authorizedEvaluations)
              
              return (
                <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <h4 className="font-semibold">{evaluation.evalueeName}</h4>
                          <div className="flex gap-2">
                            <Badge variant="outline">{evaluation.evalueeRole}</Badge>
                            <Badge className={getStatusColor(evaluation.status)}>
                              {evaluation.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
                          <div>
                            <span className="font-medium">Department:</span><br className="sm:hidden" /> {evaluation.evalueeDepartment}
                          </div>
                          <div>
                            <span className="font-medium">Your Role:</span><br className="sm:hidden" /> {roleAndWeight?.role || 'Unknown'}
                          </div>
                          <div>
                            <span className="font-medium">Weight:</span><br className="sm:hidden" />
                            {roleAndWeight?.weight != null ? `${roleAndWeight.weight}%` : 'Not weighted'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>Due: {new Date(evaluation.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {canViewOtherRatings(user) ? (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">Progress:</span>
                              <span className="text-sm text-muted-foreground">
                                {evaluation.completedBy.length}/{evaluation.totalRaters} evaluators
                              </span>
                            </div>
                            <Progress value={getProgress(evaluation)} className="h-2" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Lock className="h-4 w-4" />
                            <span>Evaluation progress is confidential</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        {canViewEvaluationResults(user, evaluation.evalueeId) && (
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <Eye className="h-4 w-4 mr-2" />
                            View Results
                          </Button>
                        )}
                        {evaluation.status !== 'completed' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => handleStartEvaluation(evaluation)} className="w-full sm:w-auto">
                                <Star className="h-4 w-4 mr-2" />
                                Evaluate
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-lg">
                                  Evaluate {evaluation.evalueeName} - {roleAndWeight?.role}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Role-specific criteria based on job type */}
                                {(evaluation.evalueeRole.toLowerCase().includes('teacher') || 
                                  evaluation.evalueeRole.toLowerCase().includes('coordinator')) ? (
                                  // Academic Staff Criteria
                                  <>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-4">Academic Staff Evaluation Criteria</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                      <div>
                                        <Label>Teaching Effectiveness (1-10)</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={evaluationForm.teachingEffectiveness}
                                          onChange={(e) => setEvaluationForm(prev => ({
                                            ...prev,
                                            teachingEffectiveness: parseInt(e.target.value) || 5
                                          }))}
                                        />
                                      </div>
                                      <div>
                                        <Label>Student Engagement (1-10)</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={evaluationForm.studentEngagement}
                                          onChange={(e) => setEvaluationForm(prev => ({
                                            ...prev,
                                            studentEngagement: parseInt(e.target.value) || 5
                                          }))}
                                        />
                                      </div>
                                      <div>
                                        <Label>Curriculum Implementation (1-10)</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={evaluationForm.curriculumImplementation}
                                          onChange={(e) => setEvaluationForm(prev => ({
                                            ...prev,
                                            curriculumImplementation: parseInt(e.target.value) || 5
                                          }))}
                                        />
                                      </div>
                                      <div>
                                        <Label>Classroom Management (1-10)</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={evaluationForm.classroomManagement}
                                          onChange={(e) => setEvaluationForm(prev => ({
                                            ...prev,
                                            classroomManagement: parseInt(e.target.value) || 5
                                          }))}
                                        />
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  // Administrative Staff Criteria
                                  <>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-4">Administrative Staff Evaluation Criteria</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                      <div>
                                        <Label>Task Management (1-10)</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={evaluationForm.taskManagement}
                                          onChange={(e) => setEvaluationForm(prev => ({
                                            ...prev,
                                            taskManagement: parseInt(e.target.value) || 5
                                          }))}
                                        />
                                      </div>
                                      <div>
                                        <Label>Policy Adherence (1-10)</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={evaluationForm.policyAdherence}
                                          onChange={(e) => setEvaluationForm(prev => ({
                                            ...prev,
                                            policyAdherence: parseInt(e.target.value) || 5
                                          }))}
                                        />
                                      </div>
                                      <div>
                                        <Label>Interdepartmental Communication (1-10)</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={evaluationForm.interdepartmentalCommunication}
                                          onChange={(e) => setEvaluationForm(prev => ({
                                            ...prev,
                                            interdepartmentalCommunication: parseInt(e.target.value) || 5
                                          }))}
                                        />
                                      </div>
                                      <div>
                                        <Label>Service Quality (1-10)</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={evaluationForm.serviceQuality}
                                          onChange={(e) => setEvaluationForm(prev => ({
                                            ...prev,
                                            serviceQuality: parseInt(e.target.value) || 5
                                          }))}
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}
                                
                                {/* Common criteria for all staff */}
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground mb-4">Common Evaluation Criteria</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                      <Label>Collaboration & Teamwork (1-10)</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={evaluationForm.collaboration}
                                        onChange={(e) => setEvaluationForm(prev => ({
                                          ...prev,
                                          collaboration: parseInt(e.target.value) || 5
                                        }))}
                                      />
                                    </div>
                                    <div>
                                      <Label>Innovation & Initiative (1-10)</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={evaluationForm.innovation}
                                        onChange={(e) => setEvaluationForm(prev => ({
                                          ...prev,
                                          innovation: parseInt(e.target.value) || 5
                                        }))}
                                      />
                                    </div>
                                    <div>
                                      <Label>Attendance & Punctuality (1-10)</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={evaluationForm.attendance}
                                        onChange={(e) => setEvaluationForm(prev => ({
                                          ...prev,
                                          attendance: parseInt(e.target.value) || 5
                                        }))}
                                      />
                                    </div>
                                    <div>
                                      <Label>Professional Development (1-10)</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={evaluationForm.professionalDevelopment}
                                        onChange={(e) => setEvaluationForm(prev => ({
                                          ...prev,
                                          professionalDevelopment: parseInt(e.target.value) || 5
                                        }))}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <Label>Key Strengths</Label>
                                    <Textarea
                                      placeholder="Highlight the employee's main strengths and achievements..."
                                      value={evaluationForm.strengths}
                                      onChange={(e) => setEvaluationForm(prev => ({
                                        ...prev,
                                        strengths: e.target.value
                                      }))}
                                    />
                                  </div>
                                  <div>
                                    <Label>Areas for Improvement</Label>
                                    <Textarea
                                      placeholder="Suggest specific areas for professional development..."
                                      value={evaluationForm.improvements}
                                      onChange={(e) => setEvaluationForm(prev => ({
                                        ...prev,
                                        improvements: e.target.value
                                      }))}
                                    />
                                  </div>
                                  <div>
                                    <Label>Additional Comments</Label>
                                    <Textarea
                                      placeholder="Any other relevant feedback or observations..."
                                      value={evaluationForm.comments}
                                      onChange={(e) => setEvaluationForm(prev => ({
                                        ...prev,
                                        comments: e.target.value
                                      }))}
                                    />
                                  </div>
                                </div>

                                <Button onClick={handleSubmitEvaluation} className="w-full">
                                  <Send className="h-4 w-4 mr-2" />
                                  Submit Evaluation
                                </Button>
                              </div>
                          <div className="space-y-6">
                            {/* Role-specific criteria based on job type */}
                            {(evaluation.evalueeRole.toLowerCase().includes('teacher') || 
                              evaluation.evalueeRole.toLowerCase().includes('coordinator')) ? (
                              // Academic Staff Criteria
                              <>
                                <h4 className="font-medium text-sm text-muted-foreground mb-4">Academic Staff Evaluation Criteria</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                  <div>
                                    <Label>Teaching Effectiveness (1-10)</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={evaluationForm.teachingEffectiveness}
                                      onChange={(e) => setEvaluationForm(prev => ({
                                        ...prev,
                                        teachingEffectiveness: parseInt(e.target.value) || 5
                                      }))}
                                    />
                                  </div>
                                  <div>
                                    <Label>Student Engagement (1-10)</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={evaluationForm.studentEngagement}
                                      onChange={(e) => setEvaluationForm(prev => ({
                                        ...prev,
                                        studentEngagement: parseInt(e.target.value) || 5
                                      }))}
                                    />
                                  </div>
                                  <div>
                                    <Label>Curriculum Implementation (1-10)</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={evaluationForm.curriculumImplementation}
                                      onChange={(e) => setEvaluationForm(prev => ({
                                        ...prev,
                                        curriculumImplementation: parseInt(e.target.value) || 5
                                      }))}
                                    />
                                  </div>
                                  <div>
                                    <Label>Classroom Management (1-10)</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={evaluationForm.classroomManagement}
                                      onChange={(e) => setEvaluationForm(prev => ({
                                        ...prev,
                                        classroomManagement: parseInt(e.target.value) || 5
                                      }))}
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              // Administrative Staff Criteria
                              <>
                                <h4 className="font-medium text-sm text-muted-foreground mb-4">Administrative Staff Evaluation Criteria</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                  <div>
                                    <Label>Task Management (1-10)</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={evaluationForm.taskManagement}
                                      onChange={(e) => setEvaluationForm(prev => ({
                                        ...prev,
                                        taskManagement: parseInt(e.target.value) || 5
                                      }))}
                                    />
                                  </div>
                                  <div>
                                    <Label>Policy Adherence (1-10)</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={evaluationForm.policyAdherence}
                                      onChange={(e) => setEvaluationForm(prev => ({
                                        ...prev,
                                        policyAdherence: parseInt(e.target.value) || 5
                                      }))}
                                    />
                                  </div>
                                  <div>
                                    <Label>Interdepartmental Communication (1-10)</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={evaluationForm.interdepartmentalCommunication}
                                      onChange={(e) => setEvaluationForm(prev => ({
                                        ...prev,
                                        interdepartmentalCommunication: parseInt(e.target.value) || 5
                                      }))}
                                    />
                                  </div>
                                  <div>
                                    <Label>Service Quality (1-10)</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={evaluationForm.serviceQuality}
                                      onChange={(e) => setEvaluationForm(prev => ({
                                        ...prev,
                                        serviceQuality: parseInt(e.target.value) || 5
                                      }))}
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {/* Common criteria for all staff */}
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-4">Common Evaluation Criteria</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                  <Label>Collaboration & Teamwork (1-10)</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={evaluationForm.collaboration}
                                    onChange={(e) => setEvaluationForm(prev => ({
                                      ...prev,
                                      collaboration: parseInt(e.target.value) || 5
                                    }))}
                                  />
                                </div>
                                <div>
                                  <Label>Innovation & Initiative (1-10)</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={evaluationForm.innovation}
                                    onChange={(e) => setEvaluationForm(prev => ({
                                      ...prev,
                                      innovation: parseInt(e.target.value) || 5
                                    }))}
                                  />
                                </div>
                                <div>
                                  <Label>Attendance & Punctuality (1-10)</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={evaluationForm.attendance}
                                    onChange={(e) => setEvaluationForm(prev => ({
                                      ...prev,
                                      attendance: parseInt(e.target.value) || 5
                                    }))}
                                  />
                                </div>
                                <div>
                                  <Label>Professional Development (1-10)</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={evaluationForm.professionalDevelopment}
                                    onChange={(e) => setEvaluationForm(prev => ({
                                      ...prev,
                                      professionalDevelopment: parseInt(e.target.value) || 5
                                    }))}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <Label>Key Strengths</Label>
                                <Textarea
                                  placeholder="Highlight the employee's main strengths and achievements..."
                                  value={evaluationForm.strengths}
                                  onChange={(e) => setEvaluationForm(prev => ({
                                    ...prev,
                                    strengths: e.target.value
                                  }))}
                                />
                              </div>
                              <div>
                                <Label>Areas for Improvement</Label>
                                <Textarea
                                  placeholder="Suggest specific areas for professional development..."
                                  value={evaluationForm.improvements}
                                  onChange={(e) => setEvaluationForm(prev => ({
                                    ...prev,
                                    improvements: e.target.value
                                  }))}
                                />
                              </div>
                              <div>
                                <Label>Additional Comments</Label>
                                <Textarea
                                  placeholder="Any other relevant feedback or observations..."
                                  value={evaluationForm.comments}
                                  onChange={(e) => setEvaluationForm(prev => ({
                                    ...prev,
                                    comments: e.target.value
                                  }))}
                                />
                              </div>
                            </div>

                            <Button onClick={handleSubmitEvaluation} className="w-full">
                              <Send className="h-4 w-4 mr-2" />
                              Submit Evaluation
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>
      )}
      </div>
    </div>
  );
}