import { PLAYERS } from '../lib/supabase'
import type { Game } from '../lib/supabase'

interface LeagueTableProps {
  games: Game[]
}

interface PlayerStats {
  name: string
  gamesPlayed: number
  wins: number
  winRate: number
  avgPosition: number
  avgScore: number
  totalScore: number
  totalCoins: number
  totalMilitary: number
}

function getGameRankings(game: Game): { player: string; score: number; coins: number; military: number; position: number }[] {
  const players = game.players.map(player => ({
    player,
    score: game.scores[player]?.Total || 0,
    coins: game.scores[player]?.Coins || 0,
    military: game.scores[player]?.Military || 0,
  }))

  // Sort by tiebreaker rules: Total -> Coins -> Military
  players.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.coins !== a.coins) return b.coins - a.coins
    return b.military - a.military
  })

  // Assign positions (handling ties)
  let currentPosition = 1
  return players.map((p, i) => {
    if (i > 0) {
      const prev = players[i - 1]
      // Check if tied with previous player
      if (p.score === prev.score && p.coins === prev.coins && p.military === prev.military) {
        // True tie - same position
      } else {
        currentPosition = i + 1
      }
    }
    return { ...p, position: currentPosition }
  })
}

export default function LeagueTable({ games }: LeagueTableProps) {
  const stats: Record<string, PlayerStats> = {}

  // Initialize stats for all players
  PLAYERS.forEach(player => {
    stats[player] = {
      name: player,
      gamesPlayed: 0,
      wins: 0,
      winRate: 0,
      avgPosition: 0,
      avgScore: 0,
      totalScore: 0,
      totalCoins: 0,
      totalMilitary: 0,
    }
  })

  // Calculate stats from games
  games.forEach(game => {
    const rankings = getGameRankings(game)

    rankings.forEach(({ player, score, coins, military, position }) => {
      if (stats[player]) {
        stats[player].gamesPlayed++
        stats[player].totalScore += score
        stats[player].totalCoins += coins
        stats[player].totalMilitary += military
        stats[player].avgPosition += position
        if (position === 1) {
          stats[player].wins++
        }
      }
    })
  })

  // Calculate averages and sort
  const sortedPlayers = Object.values(stats)
    .filter(s => s.gamesPlayed > 0)
    .map(s => ({
      ...s,
      winRate: s.gamesPlayed > 0 ? (s.wins / s.gamesPlayed) * 100 : 0,
      avgPosition: s.gamesPlayed > 0 ? s.avgPosition / s.gamesPlayed : 0,
      avgScore: s.gamesPlayed > 0 ? s.totalScore / s.gamesPlayed : 0,
    }))
    .sort((a, b) => {
      // Sort by wins first
      if (b.wins !== a.wins) return b.wins - a.wins
      // Then by win rate
      if (b.winRate !== a.winRate) return b.winRate - a.winRate
      // Then by average position (lower is better)
      if (a.avgPosition !== b.avgPosition) return a.avgPosition - b.avgPosition
      // Finally by average score
      return b.avgScore - a.avgScore
    })

  if (sortedPlayers.length === 0) {
    return (
      <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
        <h2 className="text-2xl font-bold text-gold-400 mb-4">League Standings</h2>
        <p className="text-ancient-400">No games played yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
      <h2 className="text-2xl font-bold text-gold-400 mb-6">League Standings</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ancient-700">
              <th className="text-left py-3 px-2 text-ancient-400">#</th>
              <th className="text-left py-3 px-2 text-ancient-400">Player</th>
              <th className="text-center py-3 px-2 text-ancient-400">Games</th>
              <th className="text-center py-3 px-2 text-ancient-400">Wins</th>
              <th className="text-center py-3 px-2 text-ancient-400">Win %</th>
              <th className="text-center py-3 px-2 text-ancient-400">Avg Pos</th>
              <th className="text-center py-3 px-2 text-ancient-400">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr
                key={player.name}
                className={`border-b border-ancient-800/50 ${
                  index === 0 ? 'bg-gold-900/20' : ''
                }`}
              >
                <td className="py-3 px-2">
                  {index === 0 && (
                    <span className="text-gold-400 text-lg">&#9812;</span>
                  )}
                  {index !== 0 && (
                    <span className="text-ancient-500">{index + 1}</span>
                  )}
                </td>
                <td className="py-3 px-2 font-medium text-ancient-100">
                  {player.name}
                </td>
                <td className="py-3 px-2 text-center text-ancient-300">
                  {player.gamesPlayed}
                </td>
                <td className="py-3 px-2 text-center text-gold-400 font-bold">
                  {player.wins}
                </td>
                <td className="py-3 px-2 text-center text-ancient-300">
                  {player.winRate.toFixed(1)}%
                </td>
                <td className="py-3 px-2 text-center text-ancient-300">
                  {player.avgPosition.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-center text-ancient-300">
                  {player.avgScore.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-ancient-500">
        <p>Tiebreaker: Total Score → Coins → Military → True Tie</p>
      </div>
    </div>
  )
}
