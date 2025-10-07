import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  TrendingUp, 
  Users, 
  Eye,
  Download,
  Filter,
  BarChart3
} from 'lucide-react'
import { canViewEvaluationResults } from '@/lib/authorization'
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

interface ResultsCenterProps {
  user: User
}

// Get all staff members from the centralized data
const allStaff = getAllStaff()

export function ResultsCenter({ user }: ResultsCenterProps) {
  const [evaluationRatings] = useKV<Record<string, EvaluationRating[]>>('evaluation-ratings', {})
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  // Check if user has access to results
  if (!canViewEvaluationResults(user, '')) {
    return (
      <div className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access Denied. Only CEO and People & Culture Head can view evaluation results.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calculate aggregated results for each employee
  const employeeResults = allStaff.map(employee => {
    const ratings = evaluationRatings?.[employee.id] || []
    const expectedRaters = getExpectedRaterCount(employee.id, allStaff)

    if (ratings.length === 0) {
      return {
        employee,
        totalRatings: 0,
        averageScore: 0,
        progress: 0,
        breakdown: {}
      }
    }

    // Calculate weighted average based on evaluator roles
    let totalWeightedScore = 0
    let totalWeight = 0

    ratings.forEach(rating => {
      const scores = Object.values(rating.scores)
      if (scores.length === 0) return

      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      const weight = rating.weight ?? 1

      totalWeightedScore += avgScore * weight
      totalWeight += weight
    })

    const averageScore = totalWeight > 0
      ? totalWeightedScore / totalWeight
      : 0

    return {
      employee,
      totalRatings: ratings.length,
      averageScore: Math.round(averageScore * 10) / 10,
      progress: expectedRaters > 0
        ? Math.min(100, (ratings.length / expectedRaters) * 100)
        : 0,
      breakdown: calculateScoreBreakdown(ratings)
    }
  }).filter(result => result.totalRatings > 0) // Only show employees with ratings

  function calculateScoreBreakdown(ratings: EvaluationRating[]) {
    if (ratings.length === 0) return {}
    
    const allCriteria = new Set<string>()
    ratings.forEach(rating => {
      Object.keys(rating.scores).forEach(criteria => allCriteria.add(criteria))
    })

    const breakdown: Record<string, number> = {}
    allCriteria.forEach(criteria => {
      const scores = ratings
        .map(rating => rating.scores[criteria])
        .filter(score => score !== undefined)
      
      if (scores.length > 0) {
        breakdown[criteria] = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
      }
    })

    return breakdown
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Evaluation Results Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Confidential results for authorized personnel only
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Total Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeResults.length}</div>
            <p className="text-sm text-muted-foreground">Employees evaluated</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeResults.length > 0 
                ? Math.round((employeeResults.reduce((sum, r) => sum + r.averageScore, 0) / employeeResults.length) * 10) / 10
                : 0
              }
            </div>
            <p className="text-sm text-muted-foreground">Out of 10</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              High Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeResults.filter(r => r.averageScore >= 8).length}
            </div>
            <p className="text-sm text-muted-foreground">Score ≥ 8.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((employeeResults.length / allStaff.length) * 100)}%
            </div>
            <p className="text-sm text-muted-foreground">Evaluations complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Individual Results</h3>
        <div className="space-y-3">
          {employeeResults.map(result => (
            <Card key={result.employee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h4 className="font-semibold">{result.employee.name}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">{result.employee.department}</Badge>
                        <Badge className={`${getPerformanceColor(result.averageScore)} bg-background border`}>
                          Score: {result.averageScore}/10
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
                      <div>
                        <span className="font-medium">Role:</span><br className="sm:hidden" /> {result.employee.role}
                      </div>
                      <div>
                        <span className="font-medium">Evaluators:</span><br className="sm:hidden" /> {result.totalRatings}
                      </div>
                      <div>
                        <span className="font-medium">Overall Performance:</span><br className="sm:hidden" /> 
                        <span className={getPerformanceColor(result.averageScore)}>
                          {result.averageScore >= 8 ? 'Excellent' : 
                           result.averageScore >= 6 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Evaluation Progress:</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(result.progress)}% complete
                        </span>
                      </div>
                      <Progress value={result.progress} className="h-2" />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto"
                      onClick={() => setSelectedEmployee(selectedEmployee === result.employee.id ? null : result.employee.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {selectedEmployee === result.employee.id ? 'Hide Details' : 'View Details'}
                    </Button>
                  </div>
                </div>

                {/* Detailed breakdown */}
                {selectedEmployee === result.employee.id && (
                  <div className="mt-6 pt-6 border-t space-y-4">
                    <h5 className="font-medium">Score Breakdown by Criteria</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(result.breakdown).map(([criteria, score]) => (
                        <div key={criteria} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm font-medium capitalize">
                            {criteria.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className={`font-semibold ${getPerformanceColor(score)}`}>
                            {score}/10
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Individual evaluator feedback (only criteria breakdown, no names) */}
                    <div className="space-y-3">
                      <h5 className="font-medium">Feedback Summary</h5>
                      {evaluationRatings?.[result.employee.id]?.map((rating, index) => (
                        <div key={index} className="p-4 bg-muted rounded-lg space-y-2">
                          <div className="text-sm text-muted-foreground">Evaluator #{index + 1}</div>
                          {rating.feedback.strengths && (
                            <div>
                              <span className="text-sm font-medium text-green-600">Strengths:</span>
                              <p className="text-sm mt-1">{rating.feedback.strengths}</p>
                            </div>
                          )}
                          {rating.feedback.improvements && (
                            <div>
                              <span className="text-sm font-medium text-orange-600">Improvements:</span>
                              <p className="text-sm mt-1">{rating.feedback.improvements}</p>
                            </div>
                          )}
                          {rating.feedback.comments && (
                            <div>
                              <span className="text-sm font-medium text-blue-600">Comments:</span>
                              <p className="text-sm mt-1">{rating.feedback.comments}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {employeeResults.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No evaluation results yet</h3>
              <p className="text-muted-foreground">
                Results will appear here as evaluations are completed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}