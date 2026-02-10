import type { Rank } from '../types'

export const RANKS: Rank[] = [
  {
    name: 'E-Rank',
    xpRequired: 0,
    color: '#9ca3af',
    bgClass: 'bg-gray-500',
    textClass: 'text-gray-400',
    glow: false,
    animated: false,
  },
  {
    name: 'D-Rank',
    xpRequired: 500,
    color: '#f97316',
    bgClass: 'bg-orange-500',
    textClass: 'text-orange-400',
    glow: false,
    animated: false,
  },
  {
    name: 'C-Rank',
    xpRequired: 1500,
    color: '#eab308',
    bgClass: 'bg-yellow-500',
    textClass: 'text-yellow-400',
    glow: false,
    animated: false,
  },
  {
    name: 'B-Rank',
    xpRequired: 3500,
    color: '#22c55e',
    bgClass: 'bg-green-500',
    textClass: 'text-green-400',
    glow: false,
    animated: false,
  },
  {
    name: 'A-Rank',
    xpRequired: 7000,
    color: '#3b82f6',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-400',
    glow: false,
    animated: false,
  },
  {
    name: 'S-Rank',
    xpRequired: 12000,
    color: '#a855f7',
    bgClass: 'bg-purple-500',
    textClass: 'text-purple-400',
    glow: true,
    animated: false,
  },
  {
    name: 'National Level',
    xpRequired: 20000,
    color: '#fbbf24',
    bgClass: 'bg-amber-400',
    textClass: 'text-amber-300',
    glow: true,
    animated: false,
  },
  {
    name: 'Monarch',
    xpRequired: 35000,
    color: '#fbbf24',
    bgClass: 'bg-gradient-to-r from-amber-400 to-purple-500',
    textClass: 'text-amber-300',
    glow: true,
    animated: true,
  },
]

export function getRankForXP(totalXP: number): Rank {
  let currentRank = RANKS[0]
  for (const rank of RANKS) {
    if (totalXP >= rank.xpRequired) {
      currentRank = rank
    } else {
      break
    }
  }
  return currentRank
}

export function getNextRank(totalXP: number): Rank | null {
  for (const rank of RANKS) {
    if (totalXP < rank.xpRequired) {
      return rank
    }
  }
  return null
}

export function getXPProgress(totalXP: number): { current: number; required: number; percentage: number } {
  const currentRank = getRankForXP(totalXP)
  const nextRank = getNextRank(totalXP)

  if (!nextRank) {
    return { current: totalXP, required: totalXP, percentage: 100 }
  }

  const xpIntoCurrentRank = totalXP - currentRank.xpRequired
  const xpNeededForNextRank = nextRank.xpRequired - currentRank.xpRequired

  return {
    current: xpIntoCurrentRank,
    required: xpNeededForNextRank,
    percentage: Math.min((xpIntoCurrentRank / xpNeededForNextRank) * 100, 100),
  }
}
