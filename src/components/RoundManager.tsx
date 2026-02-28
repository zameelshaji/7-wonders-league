import { useState } from 'react'
import { supabase, CATEGORIES, calculateTotal, emptyScores } from '../lib/supabase'
import type { Team, PlayerScores, RoundScores } from '../lib/supabase'

interface RoundManagerProps {
  roundNumber: number
  teams: Team[]
  sittingOutTeam: string
  onRoundSaved: () => void
}

type ScoreMap = Record<string, Omit<PlayerScores, 'Total'>>

export default function RoundManager({
  roundNumber,
  teams,
  sittingOutTeam,
  onRoundSaved,
}: RoundManagerProps) {
  const playingTeams = teams.filter(t => t.team_name !== sittingOutTeam)

  const [scores, setScores] = useState<ScoreMap>(() => {
    const initial: ScoreMap = {}
    playingTeams.forEach(team => {
      initial[team.player1] = emptyScores()
      initial[team.player2] = emptyScores()
    })
    return initial
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateScore = (
    playerName: string,
    category: keyof Omit<PlayerScores, 'Total'>,
    value: number
  ) => {
    setScores(prev => ({
      ...prev,
      [playerName]: {
        ...prev[playerName],
        [category]: value,
      },
    }))
  }

  const getTotal = (playerName: string) => calculateTotal(scores[playerName])

  const getTeamTotal = (team: Team) =>
    getTotal(team.player1) + getTotal(team.player2)

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const roundScores: RoundScores = {}
    playingTeams.forEach(team => {
      roundScores[team.team_name] = {
        player1: {
          name: team.player1,
          scores: { ...scores[team.player1], Total: getTotal(team.player1) },
        },
        player2: {
          name: team.player2,
          scores: { ...scores[team.player2], Total: getTotal(team.player2) },
        },
        teamTotal: getTeamTotal(team),
      }
    })

    const { error: saveError } = await supabase
      .from('game_night_rounds')
      .insert({
        round_number: roundNumber,
        sitting_out_team: sittingOutTeam,
        scores: roundScores,
      })

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    onRoundSaved()
  }

  return (
    <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gold-400">
          Round {roundNumber}
        </h2>
        <div className="bg-ancient-800 border border-ancient-600 rounded-lg px-4 py-2">
          <span className="text-ancient-400 text-sm">Sitting out: </span>
          <span className="text-gold-400 font-bold">{sittingOutTeam}</span>
        </div>
      </div>

      {/* Score entry per team */}
      <div className="space-y-6">
        {playingTeams.map(team => (
          <div
            key={team.team_name}
            className="bg-ancient-800/30 rounded-lg p-4 border border-ancient-700/50"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-ancient-100">
                {team.team_name}
              </h3>
              <div className="text-gold-400 font-bold text-lg">
                Team Total: {getTeamTotal(team)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ancient-700">
                    <th className="text-left py-2 px-2 text-ancient-400 w-24">
                      Category
                    </th>
                    <th className="text-center py-2 px-2 text-gold-400">
                      {team.player1}
                    </th>
                    <th className="text-center py-2 px-2 text-gold-400">
                      {team.player2}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map(category => (
                    <tr
                      key={category}
                      className="border-b border-ancient-800/50"
                    >
                      <td className="py-1.5 px-2 text-ancient-300 text-xs">
                        {category}
                      </td>
                      {[team.player1, team.player2].map(player => (
                        <td key={player} className="py-1.5 px-2">
                          <input
                            type="number"
                            inputMode="numeric"
                            value={
                              scores[player]?.[
                                category as keyof Omit<PlayerScores, 'Total'>
                              ] || ''
                            }
                            onChange={e =>
                              updateScore(
                                player,
                                category as keyof Omit<PlayerScores, 'Total'>,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-16 mx-auto block bg-ancient-900 border border-ancient-600 rounded px-2 py-1 text-center text-ancient-100 focus:border-gold-500 focus:outline-none"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-gold-900/20">
                    <td className="py-2 px-2 font-bold text-gold-400 text-xs">
                      Total
                    </td>
                    {[team.player1, team.player2].map(player => (
                      <td
                        key={player}
                        className="py-2 px-2 text-center font-bold text-gold-300"
                      >
                        {getTotal(player)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
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
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full bg-gold-600 hover:bg-gold-500 disabled:bg-ancient-700 disabled:text-ancient-500 text-ancient-950 font-bold py-3 px-6 rounded-lg transition-colors"
      >
        {saving ? 'Saving Round...' : `Save Round ${roundNumber}`}
      </button>
    </div>
  )
}
