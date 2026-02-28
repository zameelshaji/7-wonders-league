import type { Team, Round } from '../lib/supabase'
import { generateRotation } from '../lib/supabase'

interface RotationScheduleProps {
  teams: Team[]
  rounds: Round[]
  currentRound: number
}

export default function RotationSchedule({
  teams,
  rounds,
  currentRound,
}: RotationScheduleProps) {
  const rotation = generateRotation(teams)
  const completedRounds = rounds.length

  return (
    <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
      <h2 className="text-2xl font-bold text-gold-400 mb-6">
        Rotation Schedule
      </h2>

      <div className="space-y-3">
        {rotation.map((sittingOut, index) => {
          const roundNum = index + 1
          const isCompleted = roundNum <= completedRounds
          const isCurrent = roundNum === currentRound
          const playingTeams = teams.filter(t => t.team_name !== sittingOut)

          return (
            <div
              key={roundNum}
              className={`rounded-lg p-4 border transition-all ${
                isCurrent
                  ? 'bg-gold-900/30 border-gold-500/50 ring-1 ring-gold-500/30'
                  : isCompleted
                  ? 'bg-ancient-800/20 border-ancient-700/30 opacity-70'
                  : 'bg-ancient-800/30 border-ancient-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold ${
                      isCurrent ? 'text-gold-400' : 'text-ancient-400'
                    }`}
                  >
                    Round {roundNum}
                  </span>
                  {isCompleted && (
                    <span className="text-green-500 text-xs bg-green-900/30 px-2 py-0.5 rounded">
                      Done
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-gold-400 text-xs bg-gold-900/30 px-2 py-0.5 rounded animate-pulse">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-ancient-500 text-xs">Sits out: </span>
                  <span className="text-red-400 font-medium text-sm">
                    {sittingOut}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {playingTeams.map(team => (
                  <span
                    key={team.team_name}
                    className="bg-ancient-900/50 text-ancient-300 text-xs px-2 py-1 rounded"
                  >
                    {team.team_name}{' '}
                    <span className="text-ancient-600">
                      ({team.player1} & {team.player2})
                    </span>
                  </span>
                ))}
              </div>

              {/* Show round winner if completed */}
              {isCompleted && rounds[index] && (() => {
                const roundData = rounds[index]
                const entries = Object.entries(roundData.scores)
                if (entries.length === 0) return null
                const winner = entries.sort(([, a], [, b]) => b.teamTotal - a.teamTotal)[0]
                return (
                  <div className="mt-2 text-xs text-gold-400">
                    Winner: {winner[0]} ({winner[1].teamTotal} pts)
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>

      <div className="mt-6 bg-ancient-800/30 rounded-lg p-4 border border-ancient-700/30">
        <h3 className="text-sm font-bold text-ancient-300 mb-2">
          Format Summary
        </h3>
        <ul className="text-xs text-ancient-400 space-y-1">
          <li>5 rounds total, each team sits out exactly once</li>
          <li>4 teams (8 players) play each round</li>
          <li>Team score = combined individual scores of both players</li>
        </ul>
      </div>
    </div>
  )
}
