import { useState } from 'react'
import { CATEGORIES } from '../lib/supabase'
import type { Round } from '../lib/supabase'

interface RoundHistoryProps {
  rounds: Round[]
}

export default function RoundHistory({ rounds }: RoundHistoryProps) {
  const [expandedRound, setExpandedRound] = useState<number | null>(
    rounds.length > 0 ? rounds[rounds.length - 1].round_number : null
  )

  if (rounds.length === 0) {
    return (
      <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
        <h2 className="text-2xl font-bold text-gold-400 mb-4">Round History</h2>
        <p className="text-ancient-400">No rounds played yet.</p>
      </div>
    )
  }

  const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number)

  return (
    <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
      <h2 className="text-2xl font-bold text-gold-400 mb-6">Round History</h2>

      <div className="space-y-4">
        {sortedRounds.map(round => {
          const isExpanded = expandedRound === round.round_number
          const teamEntries = Object.entries(round.scores).sort(
            ([, a], [, b]) => b.teamTotal - a.teamTotal
          )

          return (
            <div
              key={round.round_number}
              className="bg-ancient-800/30 rounded-lg border border-ancient-700/50 overflow-hidden"
            >
              {/* Round header - clickable */}
              <button
                onClick={() =>
                  setExpandedRound(isExpanded ? null : round.round_number)
                }
                className="w-full flex items-center justify-between p-4 hover:bg-ancient-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-gold-400 font-bold text-lg">
                    Round {round.round_number}
                  </span>
                  <span className="text-ancient-500 text-sm">
                    Sat out: {round.sitting_out_team}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Quick scores */}
                  <div className="hidden md:flex gap-3">
                    {teamEntries.map(([teamName, data], idx) => (
                      <span
                        key={teamName}
                        className={`text-sm ${
                          idx === 0 ? 'text-gold-400 font-bold' : 'text-ancient-400'
                        }`}
                      >
                        {teamName}: {data.teamTotal}
                      </span>
                    ))}
                  </div>
                  <span className="text-ancient-500">
                    {isExpanded ? '\u25B2' : '\u25BC'}
                  </span>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-ancient-700/50 p-4 space-y-4">
                  {teamEntries.map(([teamName, data], idx) => (
                    <div
                      key={teamName}
                      className={`rounded-lg p-3 ${
                        idx === 0
                          ? 'bg-gold-900/20 border border-gold-600/30'
                          : 'bg-ancient-800/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-ancient-100">
                          {idx === 0 && (
                            <span className="text-gold-400 mr-2">
                              &#9812;
                            </span>
                          )}
                          {teamName}
                        </h4>
                        <span className="text-gold-400 font-bold text-lg">
                          {data.teamTotal}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-ancient-700">
                              <th className="text-left py-1 px-1 text-ancient-500">
                                Player
                              </th>
                              {CATEGORIES.map(cat => (
                                <th
                                  key={cat}
                                  className="text-center py-1 px-1 text-ancient-500"
                                >
                                  {cat.slice(0, 4)}
                                </th>
                              ))}
                              <th className="text-center py-1 px-1 text-gold-500 font-bold">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[data.player1, data.player2].map(player => (
                              <tr
                                key={player.name}
                                className="border-b border-ancient-800/50"
                              >
                                <td className="py-1 px-1 text-ancient-300 font-medium">
                                  {player.name}
                                </td>
                                {CATEGORIES.map(cat => (
                                  <td
                                    key={cat}
                                    className="py-1 px-1 text-center text-ancient-400"
                                  >
                                    {player.scores[cat] || 0}
                                  </td>
                                ))}
                                <td className="py-1 px-1 text-center text-gold-300 font-bold">
                                  {player.scores.Total}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
