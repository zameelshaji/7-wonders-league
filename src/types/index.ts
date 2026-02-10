// Pillar types
export type PillarId = 'career' | 'health' | 'wealth' | 'content' | 'foundation' | 'life_admin' | 'relationships'

export interface Pillar {
  id: PillarId
  name: string
  icon: string
  color: string
  bgClass: string
  textClass: string
  borderClass: string
}

// Task types
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  user_id: string
  title: string
  status: TaskStatus
  pillar: PillarId
  notes: string | null
  position: number
  date_added: string
  date_completed: string | null
  xp_awarded: number
  created_at: string
}

// Habit types
export interface HabitDay {
  id: string
  user_id: string
  date: string
  meditation: boolean
  water: boolean
  creatine: boolean
  reading: boolean
  xp_awarded: number
  created_at: string
}

export type HabitKey = 'meditation' | 'water' | 'creatine' | 'reading'

export interface HabitDefinition {
  key: HabitKey
  label: string
  icon: string
}

// XP types
export interface XPLogEntry {
  id: string
  user_id: string
  source_type: 'task' | 'habit'
  source_id: string | null
  xp_amount: number
  multiplier: number
  date_earned: string
  created_at: string
}

export interface UserStats {
  user_id: string
  total_xp: number
  current_rank: string
  current_streak: number
  longest_streak: number
  pillar_xp: Record<PillarId, number>
  last_habit_date: string | null
  updated_at: string
}

// Rank types
export interface Rank {
  name: string
  xpRequired: number
  color: string
  bgClass: string
  textClass: string
  glow: boolean
  animated: boolean
}

// XP popup
export interface XPFloat {
  id: string
  amount: number
  x: number
  y: number
}
