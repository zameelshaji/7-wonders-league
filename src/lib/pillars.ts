import type { Pillar, PillarId } from '../types'

export const PILLARS: Record<PillarId, Pillar> = {
  career: {
    id: 'career',
    name: 'Career',
    icon: '\u{1F4BC}',
    color: '#3b82f6',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/40',
  },
  health: {
    id: 'health',
    name: 'Health',
    icon: '\u{1F3CB}\uFE0F',
    color: '#22c55e',
    bgClass: 'bg-green-500',
    textClass: 'text-green-400',
    borderClass: 'border-green-500/40',
  },
  wealth: {
    id: 'wealth',
    name: 'Wealth',
    icon: '\u{1F4B0}',
    color: '#f59e0b',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/40',
  },
  content: {
    id: 'content',
    name: 'Content',
    icon: '\u{1F4F8}',
    color: '#ec4899',
    bgClass: 'bg-pink-500',
    textClass: 'text-pink-400',
    borderClass: 'border-pink-500/40',
  },
  foundation: {
    id: 'foundation',
    name: 'Foundation',
    icon: '\u{1F9E0}',
    color: '#a855f7',
    bgClass: 'bg-purple-500',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/40',
  },
  life_admin: {
    id: 'life_admin',
    name: 'Life Admin',
    icon: '\u{1F4DD}',
    color: '#94a3b8',
    bgClass: 'bg-slate-400',
    textClass: 'text-slate-400',
    borderClass: 'border-slate-400/40',
  },
  relationships: {
    id: 'relationships',
    name: 'Relationships',
    icon: '\u2764\uFE0F',
    color: '#ef4444',
    bgClass: 'bg-red-500',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/40',
  },
}

export const PILLAR_LIST = Object.values(PILLARS)
export const PILLAR_IDS = Object.keys(PILLARS) as PillarId[]
