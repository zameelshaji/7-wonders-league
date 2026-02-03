import { useState } from 'react'
import { supabase, CATEGORIES } from '../lib/supabase'
import type { Game } from '../lib/supabase'

interface GameHistoryProps {
  games: Game[]
  onGameDeleted: () => void
}

export default function GameHistory({ games, onGameDeleted }: GameHistoryProps) {
  const [expandedGame, setExpandedGame] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    setDeleting(id)
    const { error } = await supabase.from('games').delete().eq('id', id)
    setDeleting(null)
    setConfirmDelete(null)

    if (!error) {
      onGameDeleted()
    }
  }

  const getWinner = (game: Game): string => {
    let winner = ''
    let highestScore = -Infinity
    let highestCoins = -Infinity
    let highestMilitary = -Infinity

    game.players.forEach(player => {
      const scores = game.scores[player]
      if (!scores) return

      const total = scores.Total ?? 0
      const coins = scores.Coins ?? 0
      const military = scores.Military ?? 0

      if (
        total > highestScore ||
        (total === highestScore && coins > highestCoins) ||
        (total === highestScore && coins === highestCoins && military > highestMilitary)
      ) {
        winner = player
        highestScore = total
        highestCoins = coins
        highestMilitary = military
      }
    })

    return winner
  }

  if (games.length === 0) {
    return (
      <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
        <h2 className="text-2xl font-bold text-gold-400 mb-4">Game History</h2>
        <p className="text-ancient-400">No games recorded yet.</p>
      </div>
    )
  }

  const sortedGames = [...games].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
      <h2 className="text-2xl font-bold text-gold-400 mb-6">Game History</h2>

      <div className="space-y-3">
        {sortedGames.map(game => {
          const winner = getWinner(game)
          const isExpanded = expandedGame === game.id

          return (
            <div
              key={game.id}
              className="bg-ancient-800/50 rounded-lg border border-ancient-700/50 overflow-hidden"
            >
              {/* Game Header */}
              <div
                onClick={() => setExpandedGame(isExpanded ? null : game.id)}
                className="p-4 cursor-pointer hover:bg-ancient-700/30 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-ancient-300">{game.date}</span>
                    <span className="mx-2 text-ancient-600">|</span>
                    <span className="text-ancient-400">{game.players.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gold-400 font-bold">
                      &#9812; {winner}
                    </span>
                    <span className="text-ancient-500 text-sm">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Score Details */}
              {isExpanded && (
                <div className="border-t border-ancient-700/50 p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-ancient-700">
                          <th className="text-left py-2 px-2 text-ancient-400">Player</th>
                          {CATEGORIES.map(cat => (
                            <th
                              key={cat}
                              className="text-center py-2 px-1 text-ancient-400 text-xs"
                            >
                              {cat.slice(0, 3)}
                            </th>
                          ))}
                          <th className="text-center py-2 px-2 text-gold-400">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {game.players
                          .sort(
                            (a, b) =>
                              (game.scores[b]?.Total ?? 0) - (game.scores[a]?.Total ?? 0)
                          )
                          .map(player => (
                            <tr
                              key={player}
                              className={`border-b border-ancient-800/50 ${
                                player === winner ? 'bg-gold-900/20' : ''
                              }`}
                            >
                              <td className="py-2 px-2 text-ancient-200 font-medium">
                                {player === winner && (
                                  <span className="text-gold-400 mr-1">&#9812;</span>
                                )}
                                {player}
                              </td>
                              {CATEGORIES.map(cat => (
                                <td
                                  key={cat}
                                  className="py-2 px-1 text-center text-ancient-400 text-xs"
                                >
                                  {game.scores[player]?.[cat] ?? 0}
                                </td>
                              ))}
                              <td className="py-2 px-2 text-center font-bold text-gold-300">
                                {game.scores[player]?.Total ?? 0}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Delete Button */}
                  <div className="mt-4 flex justify-end">
                    {confirmDelete === game.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-ancient-400 text-sm">Delete this game?</span>
                        <button
                          onClick={() => handleDelete(game.id)}
                          disabled={deleting === game.id}
                          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          {deleting === game.id ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="bg-ancient-700 hover:bg-ancient-600 text-ancient-200 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setConfirmDelete(game.id)
                        }}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors"
                      >
                        Delete Game
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
