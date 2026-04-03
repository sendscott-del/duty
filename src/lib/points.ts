import type { Completion, Redemption } from './types'

export function calculateBalance(
  completions: Completion[],
  redemptions: Redemption[],
  memberId: string
): number {
  const earned = completions
    .filter(c => c.member_id === memberId)
    .reduce((sum, c) => sum + c.points_awarded, 0)

  const spent = redemptions
    .filter(r => r.member_id === memberId)
    .reduce((sum, r) => sum + r.points_spent, 0)

  return earned - spent
}

export function isChoreComplete(
  completion: Completion | undefined,
  requireCheckoff: boolean,
  requirePhoto: boolean,
  requireApproval: boolean
): boolean {
  if (!completion) return false

  if (requireCheckoff && !completion.checked_off) return false
  if (requirePhoto && !completion.photo_url) return false
  if (requireApproval && completion.approved !== true) return false

  return true
}
