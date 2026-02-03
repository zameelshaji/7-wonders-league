import { CATEGORIES, PLAYERS } from '../lib/supabase'
import type { Game, Category } from '../lib/supabase'

interface StatsDashboardProps {
  games: Game[]
}

interface CategoryRecord {
  category: Category | 'Total'
  player: string
  score: number
  date: string
}

interface PlayerCategoryAverage {
  player: string
  averages: Record<string, number>
  gamesPlayed: number
}

export default function StatsDashboard({ games }: StatsDashboardProps) {
  if (games.length === 0) {
    return (
      <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
        <h2 className="text-2xl font-bold text-gold-400 mb-4">Statistics</h2>
        <p className="text-ancient-400">No games played yet.</p>
      </div>
    )
  }

  // Calculate category records (highest single-game score per category)
  const categoryRecords: CategoryRecord[] = []
  const categoriesWithTotal = [...CATEGORIES, 'Total'] as const

  categoriesWithTotal.forEach(category => {
    let record: CategoryRecord | null = null

    games.forEach(game => {
      game.players.forEach(player => {
        const score = game.scores[player]?.[category] ?? 0
        if (!record || score > record.score) {
          record = {
            category,
            player,
            score,
            date: game.date,
          }
        }
      })
    })

    if (record) {
      categoryRecords.push(record)
    }
  })

  // Calculate category averages by player
  const playerStats: Record<string, { totals: Record<string, number>; games: number }> = {}
  PLAYERS.forEach(player => {
    playerStats[player] = { totals: {}, games: 0 }
    categoriesWithTotal.forEach(cat => {
      playerStats[player].totals[cat] = 0
    })
  })

  games.forEach(game => {
    game.players.forEach(player => {
      if (playerStats[player]) {
        playerStats[player].games++
        categoriesWithTotal.forEach(cat => {
          playerStats[player].totals[cat] += game.scores[player]?.[cat] ?? 0
        })
      }
    })
  })

  const playerAverages: PlayerCategoryAverage[] = PLAYERS
    .filter(player => playerStats[player].games > 0)
    .map(player => {
      const averages: Record<string, number> = {}
      categoriesWithTotal.forEach(cat => {
        averages[cat] = playerStats[player].totals[cat] / playerStats[player].games
      })
      return {
        player,
        averages,
        gamesPlayed: playerStats[player].games,
      }
    })

  // All-time high and low scores
  let highScore = { player: '', score: -Infinity, date: '' }
  let lowScore = { player: '', score: Infinity, date: '' }

  games.forEach(game => {
    game.players.forEach(player => {
      const total = game.scores[player]?.Total ?? 0
      if (total > highScore.score) {
        highScore = { player, score: total, date: game.date }
      }
      if (total < lowScore.score) {
        lowScore = { player, score: total, date: game.date }
      }
    })
  })

  return (
    <div className="space-y-6">
      {/* All-Time Records */}
      <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
        <h2 className="text-2xl font-bold text-gold-400 mb-6">All-Time Records</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-ancient-800/50 rounded-lg p-4 border border-green-600/30">
            <h3 className="text-green-400 font-bold mb-2">Highest Score</h3>
            <p className="text-3xl font-bold text-ancient-100">{highScore.score}</p>
            <p className="text-ancient-400">{highScore.player} on {highScore.date}</p>
          </div>
          <div className="bg-ancient-800/50 rounded-lg p-4 border border-red-600/30">
            <h3 className="text-red-400 font-bold mb-2">Lowest Score</h3>
            <p className="text-3xl font-bold text-ancient-100">{lowScore.score}</p>
            <p className="text-ancient-400">{lowScore.player} on {lowScore.date}</p>
          </div>
        </div>
      </div>

      {/* Category Records */}
      <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
        <h2 className="text-2xl font-bold text-gold-400 mb-6">Category Records</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ancient-700">
                <th className="text-left py-2 px-2 text-ancient-400">Category</th>
                <th className="text-center py-2 px-2 text-ancient-400">Record</th>
                <th className="text-center py-2 px-2 text-ancient-400">Player</th>
                <th className="text-center py-2 px-2 text-ancient-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {categoryRecords.map(record => (
                <tr key={record.category} className="border-b border-ancient-800/50">
                  <td className="py-2 px-2 text-ancient-300">{record.category}</td>
                  <td className="py-2 px-2 text-center font-bold text-gold-400">{record.score}</td>
                  <td className="py-2 px-2 text-center text-ancient-200">{record.player}</td>
                  <td className="py-2 px-2 text-center text-ancient-500">{record.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player Category Averages */}
      <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
        <h2 className="text-2xl font-bold text-gold-400 mb-6">Player Averages by Category</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ancient-700">
                <th className="text-left py-2 px-2 text-ancient-400">Player</th>
                {CATEGORIES.map(cat => (
                  <th key={cat} className="text-center py-2 px-1 text-ancient-400 text-xs">
                    {cat.slice(0, 3)}
                  </th>
                ))}
                <th className="text-center py-2 px-2 text-gold-400 font-bold">Avg</th>
              </tr>
            </thead>
            <tbody>
              {playerAverages.map(({ player, averages }) => (
                <tr key={player} className="border-b border-ancient-800/50">
                  <td className="py-2 px-2 text-ancient-200 font-medium">{player}</td>
                  {CATEGORIES.map(cat => (
                    <td key={cat} className="py-2 px-1 text-center text-ancient-400 text-xs">
                      {averages[cat].toFixed(1)}
                    </td>
                  ))}
                  <td className="py-2 px-2 text-center font-bold text-gold-300">
                    {averages['Total'].toFixed(1)}
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
