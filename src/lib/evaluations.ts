import { StaffMember } from '@/data/staff-data'

/**
 * Derives the expected number of evaluators for a given employee based on role/department heuristics.
 * Falls back to at least 1 to avoid divide-by-zero scenarios when progress is calculated.
 */
export function getExpectedRaterCount(employeeId: string, allStaff: StaffMember[]): number {
  const employee = allStaff.find(staff => staff.id === employeeId)
  if (!employee) {
    return 1
  }

  let count = 1 // self evaluation is always expected

  if (employee.role === 'staff') {
    if (employee.department.includes('Teacher')) {
      count += 1 // Principal/Coordinator
    }
    if (employee.department.includes('Assistant') || employee.department.includes('Nurse')) {
      count += 1 // Administrative Manager
    }
  }

  count += 2 // CEO + P&C Head

  if (employee.role === 'staff') {
    const peerCount = allStaff.filter(staff =>
      staff.role === 'staff' &&
      staff.id !== employeeId &&
      staff.department.split(' ')[0] === employee.department.split(' ')[0]
    ).length
    count += Math.min(2, peerCount)
  }

  return Math.max(count, 1)
}
