import { useState } from 'react'
import { supabase, NUM_TEAMS } from '../lib/supabase'
import type { Team } from '../lib/supabase'

interface TeamSetupProps {
  onTeamsLocked: (teams: Team[]) => void
}

export default function TeamSetup({ onTeamsLocked }: TeamSetupProps) {
  const [teams, setTeams] = useState<Team[]>(
    Array.from({ length: NUM_TEAMS }, () => ({
      team_name: '',
      player1: '',
      player2: '',
    }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateTeam = (index: number, field: keyof Team, value: string) => {
    setTeams(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const isValid = teams.every(
    t => t.team_name.trim() && t.player1.trim() && t.player2.trim()
  )

  const handleLockTeams = async () => {
    if (!isValid) {
      setError('Please fill in all team names and player names')
      return
    }

    // Check for duplicate team names
    const names = teams.map(t => t.team_name.trim().toLowerCase())
    if (new Set(names).size !== names.length) {
      setError('Team names must be unique')
      return
    }

    setSaving(true)
    setError(null)

    // Clear existing teams first
    await supabase.from('game_night_teams').delete().neq('id', 0)

    const { data, error: saveError } = await supabase
      .from('game_night_teams')
      .insert(teams.map(t => ({
        team_name: t.team_name.trim(),
        player1: t.player1.trim(),
        player2: t.player2.trim(),
      })))
      .select()

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    onTeamsLocked(data || [])
  }

  return (
    <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
      <h2 className="text-2xl font-bold text-gold-400 mb-2">Team Setup</h2>
      <p className="text-ancient-400 text-sm mb-6">
        Configure your 5 teams of 2 players each. Once locked, teams are fixed for the night.
      </p>

      <div className="space-y-4">
        {teams.map((team, index) => (
          <div
            key={index}
            className="bg-ancient-800/50 rounded-lg p-4 border border-ancient-700"
          >
            <div className="text-ancient-500 text-xs mb-3 uppercase tracking-wider">
              Team {index + 1}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-ancient-400 text-xs mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={team.team_name}
                  onChange={e => updateTeam(index, 'team_name', e.target.value)}
                  placeholder="e.g. The Architects"
                  className="w-full bg-ancient-900 border border-ancient-600 rounded px-3 py-2 text-ancient-100 placeholder:text-ancient-700 focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-ancient-400 text-xs mb-1">
                  Player 1
                </label>
                <input
                  type="text"
                  value={team.player1}
                  onChange={e => updateTeam(index, 'player1', e.target.value)}
                  placeholder="Player name"
                  className="w-full bg-ancient-900 border border-ancient-600 rounded px-3 py-2 text-ancient-100 placeholder:text-ancient-700 focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-ancient-400 text-xs mb-1">
                  Player 2
                </label>
                <input
                  type="text"
                  value={team.player2}
                  onChange={e => updateTeam(index, 'player2', e.target.value)}
                  placeholder="Player name"
                  className="w-full bg-ancient-900 border border-ancient-600 rounded px-3 py-2 text-ancient-100 placeholder:text-ancient-700 focus:border-gold-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleLockTeams}
        disabled={saving || !isValid}
        className="mt-6 w-full bg-gold-600 hover:bg-gold-500 disabled:bg-ancient-700 disabled:text-ancient-500 text-ancient-950 font-bold py-3 px-6 rounded-lg transition-colors"
      >
        {saving ? 'Saving Teams...' : 'Lock Teams & Start League'}
      </button>
    </div>
  )
}
