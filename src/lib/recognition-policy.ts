import { differenceInCalendarDays, parseISO } from 'date-fns'

export interface NominationRecord {
  id: string
  nomineeId: string
  nomineeName: string
  nomineeDepartment: string
  category: string
  nominatorName: string
  description: string
  submittedDate: string
  status: 'pending' | 'voting' | 'selected' | 'rejected'
  votes: number
  totalVoters: number
}

export interface WinnerRecord {
  id: string
  name: string
  category: string
  month: string
  department: string
  description: string
}

export interface EligibilityFlag {
  nomineeName: string
  reason?: string
}

export interface NominationSubmission {
  nomineeName: string
  nomineeDepartment?: string
  category: string
  nominatorName: string
}

export type NominationPolicyViolationCode = 'duplicate' | 'rotation_lock' | 'ineligible'

export interface NominationPolicyViolation {
  code: NominationPolicyViolationCode
  message: string
}

export interface NominationPolicyContext {
  existingNominations: NominationRecord[]
  winners?: WinnerRecord[]
  rotationLockDays?: number
  ineligibleNominees?: EligibilityFlag[]
}

const DEFAULT_ROTATION_DAYS = 90

const normalize = (value: string) => value.trim().toLowerCase()

function getMostRecentNominationDate(
  nomineeName: string,
  nominations: NominationRecord[]
): Date | undefined {
  const normalizedName = normalize(nomineeName)

  const timestamps = nominations
    .filter(nomination => normalize(nomination.nomineeName) === normalizedName)
    .map(nomination => {
      const parsed = parseDateString(nomination.submittedDate)
      return parsed?.getTime()
    })
    .filter((timestamp): timestamp is number => typeof timestamp === 'number')

  if (!timestamps.length) {
    return undefined
  }

  return new Date(Math.max(...timestamps))
}

function getMostRecentWinnerDate(
  nomineeName: string,
  winners: WinnerRecord[] = []
): Date | undefined {
  const normalizedName = normalize(nomineeName)

  const timestamps = winners
    .filter(winner => normalize(winner.name) === normalizedName)
    .map(winner => parseDateString(winner.month)?.getTime())
    .filter((timestamp): timestamp is number => typeof timestamp === 'number')

  if (!timestamps.length) {
    return undefined
  }

  return new Date(Math.max(...timestamps))
}

function parseDateString(value: string): Date | undefined {
  if (!value) return undefined

  const isoDate = safeParseISO(value)
  if (isoDate) {
    return isoDate
  }

  const fallback = new Date(value)
  return Number.isNaN(fallback.getTime()) ? undefined : fallback
}

function safeParseISO(value: string): Date | undefined {
  try {
    const parsed = parseISO(value)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  } catch {
    return undefined
  }
}

export function validateNominationSubmission(
  submission: NominationSubmission,
  context: NominationPolicyContext
): NominationPolicyViolation[] {
  const violations: NominationPolicyViolation[] = []
  const { existingNominations, winners = [], rotationLockDays = DEFAULT_ROTATION_DAYS, ineligibleNominees = [] } = context
  const normalizedNominee = normalize(submission.nomineeName)

  const duplicateNomination = existingNominations.some(nomination => {
    if (['rejected'].includes(nomination.status)) {
      return false
    }

    return (
      normalize(nomination.nomineeName) === normalizedNominee &&
      nomination.category === submission.category
    )
  })

  if (duplicateNomination) {
    violations.push({
      code: 'duplicate',
      message: `${submission.nomineeName} already has an active nomination in this category.`
    })
  }

  const rotationLockDate = getMostRecentNominationDate(submission.nomineeName, existingNominations)
  const winnerDate = getMostRecentWinnerDate(submission.nomineeName, winners)
  const mostRecentDate = [rotationLockDate, winnerDate]
    .filter((date): date is Date => !!date)
    .sort((a, b) => b.getTime() - a.getTime())[0]

  if (mostRecentDate) {
    const daysSinceLastRecognition = differenceInCalendarDays(new Date(), mostRecentDate)
    if (daysSinceLastRecognition <= rotationLockDays) {
      violations.push({
        code: 'rotation_lock',
        message: `${submission.nomineeName} is within the ${rotationLockDays}-day rotation lock period.`
      })
    }
  }

  const ineligibleNominee = ineligibleNominees.find(flag => normalize(flag.nomineeName) === normalizedNominee)
  if (ineligibleNominee) {
    violations.push({
      code: 'ineligible',
      message: ineligibleNominee.reason || `${submission.nomineeName} is currently not eligible for nominations.`
    })
  }

  return violations
}
