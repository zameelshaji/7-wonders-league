import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ibqjhroxgfdvoltzdqwh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicWpocm94Z2Zkdm9sdHpkcXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjQxMDUsImV4cCI6MjA4NTY0MDEwNX0.abrAkm76N_jRGrjpDbmold3R2oIajwTIUj6Oc_1plpY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const PLAYERS = ['Zam', 'Arps', 'Re', 'Aru', 'Molly'] as const
export type Player = typeof PLAYERS[number]

export const CATEGORIES = [
  'Wonders',
  'Coins',
  'Military',
  'Blue',
  'Gold',
  'Green',
  'Purple',
  'Black',
  'Armada',
  'Islands',
] as const
export type Category = typeof CATEGORIES[number]

export const BASE_CATEGORIES: Category[] = ['Wonders', 'Coins', 'Military', 'Blue', 'Gold', 'Green', 'Purple']
export const EXPANSION_CATEGORIES: Category[] = ['Black', 'Armada', 'Islands']

export interface PlayerScores {
  Wonders: number
  Coins: number
  Military: number
  Blue: number
  Gold: number
  Green: number
  Purple: number
  Black: number
  Armada: number
  Islands: number
  Total: number
}

export interface GameScores {
  [playerName: string]: PlayerScores
}

export interface Game {
  id: number
  date: string
  players: string[]
  scores: GameScores
  created_at: string
}

export function calculateTotal(scores: Omit<PlayerScores, 'Total'>): number {
  return Object.values(scores).reduce((sum, val) => sum + val, 0)
}
