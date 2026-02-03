import { useState, useMemo } from 'react'
import { PLAYERS, CATEGORIES } from '../lib/supabase'
import type { Game, Player } from '../lib/supabase'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const PLAYER_COLORS: Record<string, string> = {
  Zam: '#f59e0b',
  Arps: '#3b82f6',
  Re: '#10b981',
  Aru: '#ef4444',
  Molly: '#a855f7',
}

interface PlayerBreakdownsProps {
  games: Game[]
}

interface PlayerGameResult {
  date: string
  position: number
  totalPlayers: number
  scores: Record<string, number>
  total: number
  isWin: boolean
}

function getGamePosition(game: Game, playerName: string): { position: number; totalPlayers: number } {
  const players = game.players.map(p => ({
    name: p,
    score: game.scores[p]?.Total || 0,
    coins: game.scores[p]?.Coins || 0,
    military: game.scores[p]?.Military || 0,
  }))

  players.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.coins !== a.coins) return b.coins - a.coins
    return b.military - a.military
  })

  const position = players.findIndex(p => p.name === playerName) + 1
  return { position, totalPlayers: players.length }
}

export default function PlayerBreakdowns({ games }: PlayerBreakdownsProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'position'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const playersWithGames = useMemo(() => {
    return PLAYERS.filter(player =>
      games.some(game => game.players.includes(player))
    )
  }, [games])

  const playerStats = useMemo(() => {
    const stats: Record<string, {
      games: PlayerGameResult[]
      wins: number
      totalGames: number
      avgScore: number
      avgPosition: number
      bestScore: number
      worstScore: number
      categoryTotals: Record<string, number>
      positionCounts: Record<number, number>
    }> = {}

    PLAYERS.forEach(player => {
      const playerGames: PlayerGameResult[] = []
      let totalScore = 0
      let totalPosition = 0
      let bestScore = -Infinity
      let worstScore = Infinity
      let wins = 0
      const categoryTotals: Record<string, number> = {}
      const positionCounts: Record<number, number> = {}

      CATEGORIES.forEach(cat => {
        categoryTotals[cat] = 0
      })

      games.forEach(game => {
        if (!game.players.includes(player)) return

        const scores = game.scores[player]
        if (!scores) return

        const { position, totalPlayers } = getGamePosition(game, player)
        const total = scores.Total || 0

        playerGames.push({
          date: game.date,
          position,
          totalPlayers,
          scores: { ...scores },
          total,
          isWin: position === 1,
        })

        totalScore += total
        totalPosition += position
        if (total > bestScore) bestScore = total
        if (total < worstScore) worstScore = total
        if (position === 1) wins++

        positionCounts[position] = (positionCounts[position] || 0) + 1

        CATEGORIES.forEach(cat => {
          categoryTotals[cat] += scores[cat] || 0
        })
      })

      stats[player] = {
        games: playerGames,
        wins,
        totalGames: playerGames.length,
        avgScore: playerGames.length > 0 ? totalScore / playerGames.length : 0,
        avgPosition: playerGames.length > 0 ? totalPosition / playerGames.length : 0,
        bestScore: bestScore === -Infinity ? 0 : bestScore,
        worstScore: worstScore === Infinity ? 0 : worstScore,
        categoryTotals,
        positionCounts,
      }
    })

    return stats
  }, [games])

  const filteredAndSortedGames = useMemo(() => {
    let allGames: (PlayerGameResult & { player: string })[] = []

    if (selectedPlayer === 'all') {
      PLAYERS.forEach(player => {
        playerStats[player].games.forEach(game => {
          allGames.push({ ...game, player })
        })
      })
    } else {
      allGames = playerStats[selectedPlayer].games.map(game => ({
        ...game,
        player: selectedPlayer,
      }))
    }

    allGames.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === 'total') {
        comparison = a.total - b.total
      } else if (sortBy === 'position') {
        comparison = a.position - b.position
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return allGames
  }, [selectedPlayer, playerStats, sortBy, sortOrder])

  if (games.length === 0) {
    return (
      <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
        <h2 className="text-2xl font-bold text-gold-400 mb-4">Player Breakdowns</h2>
        <p className="text-ancient-400">No games played yet.</p>
      </div>
    )
  }

  const currentPlayerStats = selectedPlayer !== 'all' ? playerStats[selectedPlayer] : null

  const radarData = useMemo(() => {
    return CATEGORIES.map(category => {
      const dataPoint: Record<string, string | number> = { category }

      if (selectedPlayer === 'all') {
        playersWithGames.forEach(player => {
          const stats = playerStats[player]
          dataPoint[player] = stats.totalGames > 0
            ? Number((stats.categoryTotals[category] / stats.totalGames).toFixed(1))
            : 0
        })
      } else {
        const stats = playerStats[selectedPlayer]
        dataPoint[selectedPlayer] = stats.totalGames > 0
          ? Number((stats.categoryTotals[category] / stats.totalGames).toFixed(1))
          : 0
      }

      return dataPoint
    })
  }, [selectedPlayer, playerStats, playersWithGames])

  const radarPlayers = selectedPlayer === 'all' ? playersWithGames : [selectedPlayer]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
        <h2 className="text-2xl font-bold text-gold-400 mb-6">Player Breakdowns</h2>

        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-ancient-400 text-sm mb-1">Player</label>
            <select
              value={selectedPlayer}
              onChange={e => setSelectedPlayer(e.target.value as Player | 'all')}
              className="bg-ancient-800 border border-ancient-600 rounded px-3 py-2 text-ancient-100 focus:border-gold-500 focus:outline-none min-w-[120px]"
            >
              <option value="all">All Players</option>
              {playersWithGames.map(player => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-ancient-400 text-sm mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'date' | 'total' | 'position')}
              className="bg-ancient-800 border border-ancient-600 rounded px-3 py-2 text-ancient-100 focus:border-gold-500 focus:outline-none"
            >
              <option value="date">Date</option>
              <option value="total">Total Score</option>
              <option value="position">Position</option>
            </select>
          </div>

          <div>
            <label className="block text-ancient-400 text-sm mb-1">Order</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="bg-ancient-800 border border-ancient-600 rounded px-3 py-2 text-ancient-100 focus:border-gold-500 focus:outline-none"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
        <h3 className="text-xl font-bold text-gold-400 mb-4">
          Category Averages {selectedPlayer !== 'all' ? `- ${selectedPlayer}` : '- All Players'}
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#5b4536" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: '#d1bda3', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 'auto']}
                tick={{ fill: '#a47a58', fontSize: 10 }}
              />
              {radarPlayers.map(player => (
                <Radar
                  key={player}
                  name={player}
                  dataKey={player}
                  stroke={PLAYER_COLORS[player] || '#fbbf24'}
                  fill={PLAYER_COLORS[player] || '#fbbf24'}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ))}
              <Tooltip
                contentStyle={{
                  backgroundColor: '#30231b',
                  border: '1px solid #5b4536',
                  borderRadius: '8px',
                  color: '#f0ebe3',
                }}
              />
              <Legend
                wrapperStyle={{ color: '#d1bda3' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Player Summary Card (when single player selected) */}
      {currentPlayerStats && currentPlayerStats.totalGames > 0 && (
        <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
          <h3 className="text-xl font-bold text-gold-400 mb-4">{selectedPlayer}'s Summary</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-ancient-800/50 rounded-lg p-4 text-center">
              <p className="text-ancient-400 text-sm">Games Played</p>
              <p className="text-2xl font-bold text-ancient-100">{currentPlayerStats.totalGames}</p>
            </div>
            <div className="bg-ancient-800/50 rounded-lg p-4 text-center">
              <p className="text-ancient-400 text-sm">Wins</p>
              <p className="text-2xl font-bold text-gold-400">{currentPlayerStats.wins}</p>
              <p className="text-ancient-500 text-xs">
                {((currentPlayerStats.wins / currentPlayerStats.totalGames) * 100).toFixed(0)}% win rate
              </p>
            </div>
            <div className="bg-ancient-800/50 rounded-lg p-4 text-center">
              <p className="text-ancient-400 text-sm">Avg Position</p>
              <p className="text-2xl font-bold text-ancient-100">{currentPlayerStats.avgPosition.toFixed(2)}</p>
            </div>
            <div className="bg-ancient-800/50 rounded-lg p-4 text-center">
              <p className="text-ancient-400 text-sm">Avg Score</p>
              <p className="text-2xl font-bold text-ancient-100">{currentPlayerStats.avgScore.toFixed(1)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Range */}
            <div>
              <h4 className="text-ancient-300 font-medium mb-3">Score Range</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-ancient-800/50 rounded p-3">
                  <p className="text-green-400 text-sm">Best</p>
                  <p className="text-xl font-bold text-ancient-100">{currentPlayerStats.bestScore}</p>
                </div>
                <div className="flex-1 bg-ancient-800/50 rounded p-3">
                  <p className="text-red-400 text-sm">Worst</p>
                  <p className="text-xl font-bold text-ancient-100">{currentPlayerStats.worstScore}</p>
                </div>
              </div>
            </div>

            {/* Position Distribution */}
            <div>
              <h4 className="text-ancient-300 font-medium mb-3">Position Distribution</h4>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(pos => {
                  const count = currentPlayerStats.positionCounts[pos] || 0
                  const percentage = currentPlayerStats.totalGames > 0
                    ? (count / currentPlayerStats.totalGames) * 100
                    : 0
                  return (
                    <div key={pos} className="flex-1 text-center">
                      <div
                        className="bg-ancient-800 rounded-t relative overflow-hidden"
                        style={{ height: '60px' }}
                      >
                        <div
                          className={`absolute bottom-0 left-0 right-0 ${pos === 1 ? 'bg-gold-600' : 'bg-ancient-600'}`}
                          style={{ height: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-ancient-400 text-xs mt-1">{pos}st</p>
                      <p className="text-ancient-300 text-sm font-medium">{count}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Category Averages */}
          <div className="mt-6">
            <h4 className="text-ancient-300 font-medium mb-3">Category Averages</h4>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {CATEGORIES.map(cat => (
                <div key={cat} className="bg-ancient-800/50 rounded p-2 text-center">
                  <p className="text-ancient-500 text-xs truncate">{cat.slice(0, 3)}</p>
                  <p className="text-ancient-200 font-medium">
                    {(currentPlayerStats.categoryTotals[cat] / currentPlayerStats.totalGames).toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game-by-Game Results */}
      <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
        <h3 className="text-xl font-bold text-gold-400 mb-4">
          Game Results {selectedPlayer !== 'all' && `for ${selectedPlayer}`}
          <span className="text-ancient-500 text-sm font-normal ml-2">
            ({filteredAndSortedGames.length} games)
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ancient-700">
                {selectedPlayer === 'all' && (
                  <th className="text-left py-2 px-2 text-ancient-400">Player</th>
                )}
                <th className="text-left py-2 px-2 text-ancient-400">Date</th>
                <th className="text-center py-2 px-2 text-ancient-400">Pos</th>
                {CATEGORIES.map(cat => (
                  <th key={cat} className="text-center py-2 px-1 text-ancient-400 text-xs">
                    {cat.slice(0, 3)}
                  </th>
                ))}
                <th className="text-center py-2 px-2 text-gold-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedGames.map((game, index) => (
                <tr
                  key={`${game.player}-${game.date}-${index}`}
                  className={`border-b border-ancient-800/50 ${game.isWin ? 'bg-gold-900/20' : ''}`}
                >
                  {selectedPlayer === 'all' && (
                    <td className="py-2 px-2 text-ancient-200 font-medium">{game.player}</td>
                  )}
                  <td className="py-2 px-2 text-ancient-300">{game.date}</td>
                  <td className="py-2 px-2 text-center">
                    {game.isWin ? (
                      <span className="text-gold-400">&#9812; 1st</span>
                    ) : (
                      <span className="text-ancient-400">
                        {game.position}/{game.totalPlayers}
                      </span>
                    )}
                  </td>
                  {CATEGORIES.map(cat => (
                    <td key={cat} className="py-2 px-1 text-center text-ancient-400 text-xs">
                      {game.scores[cat] || 0}
                    </td>
                  ))}
                  <td className="py-2 px-2 text-center font-bold text-gold-300">
                    {game.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
