export const XP_PER_TASK = 20
export const XP_PER_HABIT = 10
export const TOTAL_HABITS = 4

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0
  if (streak >= 14) return 1.75
  if (streak >= 7) return 1.5
  return 1.0
}

export function getMultiplierLabel(streak: number): string {
  const multiplier = getStreakMultiplier(streak)
  return `${multiplier}x`
}

export function calculateXPWithMultiplier(baseXP: number, streak: number): number {
  const multiplier = getStreakMultiplier(streak)
  return Math.round(baseXP * multiplier)
}
