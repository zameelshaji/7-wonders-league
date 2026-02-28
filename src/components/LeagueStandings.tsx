import type { Team, Round } from '../lib/supabase'

interface LeagueStandingsProps {
  teams: Team[]
  rounds: Round[]
}

interface TeamStanding {
  teamName: string
  player1: string
  player2: string
  gamesPlayed: number
  totalScore: number
  avgScore: number
  bestRound: number
  roundScores: number[]
}

export default function LeagueStandings({ teams, rounds }: LeagueStandingsProps) {
  const standings: TeamStanding[] = teams.map(team => {
    const roundScores: number[] = []
    let totalScore = 0
    let gamesPlayed = 0
    let bestRound = 0

    rounds.forEach(round => {
      const teamData = round.scores[team.team_name]
      if (teamData) {
        const score = teamData.teamTotal
        roundScores.push(score)
        totalScore += score
        gamesPlayed++
        if (score > bestRound) bestRound = score
      }
    })

    return {
      teamName: team.team_name,
      player1: team.player1,
      player2: team.player2,
      gamesPlayed,
      totalScore,
      avgScore: gamesPlayed > 0 ? totalScore / gamesPlayed : 0,
      bestRound,
      roundScores,
    }
  })

  standings.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
    return b.avgScore - a.avgScore
  })

  const positionStyles = [
    'text-gold-400',
    'text-ancient-300',
    'text-amber-700',
    'text-ancient-400',
    'text-ancient-500',
  ]

  const positionLabels = ['1st', '2nd', '3rd', '4th', '5th']

  if (rounds.length === 0) {
    return (
      <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
        <h2 className="text-2xl font-bold text-gold-400 mb-4">League Standings</h2>
        <p className="text-ancient-400">No rounds played yet. Start Round 1!</p>
      </div>
    )
  }

  return (
    <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
      <h2 className="text-2xl font-bold text-gold-400 mb-6">League Standings</h2>

      {/* Podium cards for top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {standings.slice(0, 3).map((team, idx) => (
          <div
            key={team.teamName}
            className={`rounded-lg p-4 border ${
              idx === 0
                ? 'bg-gold-900/30 border-gold-500/50 order-2 md:order-1'
                : idx === 1
                ? 'bg-ancient-800/50 border-ancient-600 order-1 md:order-2'
                : 'bg-ancient-800/30 border-ancient-700 order-3'
            }`}
          >
            <div className="text-center">
              <div className={`text-3xl font-bold ${positionStyles[idx]}`}>
                {positionLabels[idx]}
              </div>
              <div className="text-lg font-bold text-ancient-100 mt-1">
                {team.teamName}
              </div>
              <div className="text-ancient-400 text-xs mt-0.5">
                {team.player1} & {team.player2}
              </div>
              <div className="text-2xl font-bold text-gold-400 mt-2">
                {team.totalScore}
              </div>
              <div className="text-ancient-500 text-xs">total points</div>
            </div>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ancient-700">
              <th className="text-left py-3 px-2 text-ancient-400">#</th>
              <th className="text-left py-3 px-2 text-ancient-400">Team</th>
              <th className="text-left py-3 px-2 text-ancient-400 hidden md:table-cell">Players</th>
              <th className="text-center py-3 px-2 text-ancient-400">Played</th>
              <th className="text-center py-3 px-2 text-ancient-400">Total</th>
              <th className="text-center py-3 px-2 text-ancient-400">Avg</th>
              <th className="text-center py-3 px-2 text-ancient-400">Best</th>
              {rounds.map((_, i) => (
                <th key={i} className="text-center py-3 px-2 text-ancient-400 hidden lg:table-cell">
                  R{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <tr
                key={team.teamName}
                className={`border-b border-ancient-800/50 ${
                  index === 0 ? 'bg-gold-900/20' : ''
                }`}
              >
                <td className={`py-3 px-2 font-bold ${positionStyles[index]}`}>
                  {positionLabels[index]}
                </td>
                <td className="py-3 px-2 font-medium text-ancient-100">
                  {team.teamName}
                </td>
                <td className="py-3 px-2 text-ancient-400 text-xs hidden md:table-cell">
                  {team.player1} & {team.player2}
                </td>
                <td className="py-3 px-2 text-center text-ancient-300">
                  {team.gamesPlayed}
                </td>
                <td className="py-3 px-2 text-center text-gold-400 font-bold text-lg">
                  {team.totalScore}
                </td>
                <td className="py-3 px-2 text-center text-ancient-300">
                  {team.avgScore.toFixed(1)}
                </td>
                <td className="py-3 px-2 text-center text-ancient-300">
                  {team.bestRound || '-'}
                </td>
                {rounds.map((round, i) => {
                  const roundData = round.scores[team.teamName]
                  return (
                    <td key={i} className="py-3 px-2 text-center text-ancient-400 hidden lg:table-cell">
                      {roundData ? roundData.teamTotal : (
                        <span className="text-ancient-600 italic">sat</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
