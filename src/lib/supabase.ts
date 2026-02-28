import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ibqjhroxgfdvoltzdqwh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicWpocm94Z2Zkdm9sdHpkcXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjQxMDUsImV4cCI6MjA4NTY0MDEwNX0.abrAkm76N_jRGrjpDbmold3R2oIajwTIUj6Oc_1plpY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const CATEGORIES = [
  'Wonders',
  'Coins',
  'Military',
  'Blue',
  'Gold',
  'Green',
  'Purple',
  'Black',
  'Leaders',
] as const
export type Category = typeof CATEGORIES[number]

export const NUM_TEAMS = 5
export const PLAYERS_PER_TEAM = 2
export const TOTAL_ROUNDS = 5

export interface Team {
  id?: number
  team_name: string
  player1: string
  player2: string
  created_at?: string
}

export interface PlayerScores {
  Wonders: number
  Coins: number
  Military: number
  Blue: number
  Gold: number
  Green: number
  Purple: number
  Black: number
  Leaders: number
  Total: number
}

export interface RoundScores {
  [teamName: string]: {
    player1: { name: string; scores: PlayerScores }
    player2: { name: string; scores: PlayerScores }
    teamTotal: number
  }
}

export interface Round {
  id?: number
  round_number: number
  sitting_out_team: string
  scores: RoundScores
  created_at?: string
}

export function calculateTotal(scores: Omit<PlayerScores, 'Total'>): number {
  return Object.values(scores).reduce((sum, val) => sum + val, 0)
}

export function emptyScores(): Omit<PlayerScores, 'Total'> {
  return {
    Wonders: 0,
    Coins: 0,
    Military: 0,
    Blue: 0,
    Gold: 0,
    Green: 0,
    Purple: 0,
    Black: 0,
    Leaders: 0,
  }
}

// Generate fair rotation: each team sits out exactly once across 5 rounds
export function generateRotation(teams: Team[]): string[] {
  return teams.map(t => t.team_name)
}
