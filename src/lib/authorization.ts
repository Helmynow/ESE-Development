interface User {
  id: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  department: string
  email: string
}

interface EvaluationAssignment {
  evalueeId: string
  evaluatorId: string
  evaluatorRole: 'self' | 'supervisor' | 'peer' | 'ceo' | 'pc-head'
  weight: number
}

/**
 * Determines what evaluations a user is authorized to see and participate in
 */
export function getUserAuthorizedEvaluations(currentUser: User, allStaff: User[]): EvaluationAssignment[] {
  const assignments: EvaluationAssignment[] = []

  // Only CEO and P&C Head can see all evaluations
  if (currentUser.id === 'ceo' || currentUser.id === 'pc-head') {
    // They can evaluate anyone and see all results
    allStaff.forEach(staff => {
      if (staff.id !== currentUser.id) {
        assignments.push({
          evalueeId: staff.id,
          evaluatorId: currentUser.id,
          evaluatorRole: currentUser.id === 'ceo' ? 'ceo' : 'pc-head',
          weight: currentUser.id === 'ceo' ? 15 : 25
        })
      }
    })
    return assignments
  }

  // Managers can evaluate their direct reports
  if (currentUser.role === 'manager') {
    const directReports = getDirectReports(currentUser, allStaff)
    directReports.forEach(staff => {
      assignments.push({
        evalueeId: staff.id,
        evaluatorId: currentUser.id,
        evaluatorRole: 'supervisor',
        weight: getSupervisorWeight(currentUser, staff)
      })
    })

    // Managers also do self-evaluation
    assignments.push({
      evalueeId: currentUser.id,
      evaluatorId: currentUser.id,
      evaluatorRole: 'self',
      weight: 5
    })

    return assignments
  }

  // Staff can only do self-evaluation and peer evaluations (limited)
  if (currentUser.role === 'staff') {
    // Self evaluation
    assignments.push({
      evalueeId: currentUser.id,
      evaluatorId: currentUser.id,
      evaluatorRole: 'self',
      weight: 5
    })

    // Peer evaluations (only for staff in same department/level)
    const peers = getPeerEvaluationTargets(currentUser, allStaff)
    peers.forEach(peer => {
      assignments.push({
        evalueeId: peer.id,
        evaluatorId: currentUser.id,
        evaluatorRole: 'peer',
        weight: 10
      })
    })

    return assignments
  }

  return assignments
}

/**
 * Get direct reports for a manager
 */
function getDirectReports(manager: User, allStaff: User[]): User[] {
  switch (manager.id) {
    case 'primary-principal':
      return allStaff.filter(staff => 
        staff.department.includes('Teacher') && staff.role === 'staff' ||
        staff.department.includes('Counselor') ||
        staff.department.includes('Librarian')
      )
    case 'secondary-coordinator':
      return allStaff.filter(staff => 
        staff.department.includes('Teacher') && staff.role === 'staff'
      )
    case 'admin-manager':
      return allStaff.filter(staff => 
        staff.department.includes('Assistant') ||
        staff.department.includes('Nurse') ||
        staff.role === 'staff' && !staff.department.includes('Teacher')
      )
    default:
      return []
  }
}

/**
 * Get weight for supervisor evaluation based on the relationship
 */
function getSupervisorWeight(supervisor: User, evaluee: User): number {
  if (supervisor.id === 'primary-principal' || supervisor.id === 'secondary-coordinator') {
    return 40 // Academic supervisors have higher weight
  }
  if (supervisor.id === 'admin-manager') {
    return 35 // Administrative manager
  }
  return 30 // Default supervisor weight
}

/**
 * Get peer evaluation targets (limited to prevent bias)
 */
function getPeerEvaluationTargets(currentUser: User, allStaff: User[]): User[] {
  // Very limited peer evaluations to prevent conflicts
  // Only for same role/department colleagues
  return allStaff.filter(staff => 
    staff.id !== currentUser.id &&
    staff.role === currentUser.role &&
    staff.department.split(' ')[0] === currentUser.department.split(' ')[0] // Same subject area
  ).slice(0, 2) // Maximum 2 peer evaluations
}

/**
 * Check if user can see evaluation results
 */
export function canViewEvaluationResults(currentUser: User, evalueeId: string): boolean {
  // Only CEO and P&C Head can see final results
  return currentUser.id === 'ceo' || currentUser.id === 'pc-head'
}

/**
 * Check if user can see other evaluators' ratings
 */
export function canViewOtherRatings(currentUser: User): boolean {
  // Only CEO and P&C Head can see what others rated
  return currentUser.id === 'ceo' || currentUser.id === 'pc-head'
}

/**
 * Check if user is authorized to evaluate a specific person
 */
export function isAuthorizedToEvaluate(
  currentUser: User, 
  evalueeId: string, 
  authorizedEvaluations: EvaluationAssignment[]
): boolean {
  return authorizedEvaluations.some(assignment => 
    assignment.evaluatorId === currentUser.id && 
    assignment.evalueeId === evalueeId
  )
}

/**
 * Get the evaluation role and weight for a specific evaluation
 */
export function getEvaluationRoleAndWeight(
  currentUser: User, 
  evalueeId: string, 
  authorizedEvaluations: EvaluationAssignment[]
): { role: string; weight: number } | null {
  const assignment = authorizedEvaluations.find(a => 
    a.evaluatorId === currentUser.id && 
    a.evalueeId === evalueeId
  )
  
  if (!assignment) return null
  
  const roleNames = {
    'self': 'Self Evaluation',
    'supervisor': 'Supervisor Review',
    'peer': 'Peer Review',
    'ceo': 'CEO Review',
    'pc-head': 'P&C Head Review'
  }
  
  return {
    role: roleNames[assignment.evaluatorRole],
    weight: assignment.weight
  }
}