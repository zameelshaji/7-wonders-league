import { useState, useEffect, useReducer } from 'react'
import { supabase, generateRotation, TOTAL_ROUNDS } from './lib/supabase'
import type { Team, Round } from './lib/supabase'
import TeamSetup from './components/TeamSetup'
import RoundManager from './components/RoundManager'
import LeagueStandings from './components/LeagueStandings'
import RoundHistory from './components/RoundHistory'
import RotationSchedule from './components/RotationSchedule'

type Tab = 'standings' | 'play' | 'history' | 'schedule'

interface AppState {
  teams: Team[]
  rounds: Round[]
  loading: boolean
  error: string | null
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; teams: Team[]; rounds: Round[] }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'SET_TEAMS'; teams: Team[] }
  | { type: 'RESET' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { teams: action.teams, rounds: action.rounds, loading: false, error: null }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error }
    case 'SET_TEAMS':
      return { ...state, teams: action.teams }
    case 'RESET':
      return { teams: [], rounds: [], loading: false, error: null }
  }
}

async function loadData(): Promise<{ teams: Team[]; rounds: Round[] } | { error: string }> {
  const { data: teamsData, error: teamsError } = await supabase
    .from('game_night_teams')
    .select('*')
    .order('id')

  if (teamsError) return { error: teamsError.message }

  const { data: roundsData, error: roundsError } = await supabase
    .from('game_night_rounds')
    .select('*')
    .order('round_number')

  if (roundsError) return { error: roundsError.message }

  return { teams: teamsData || [], rounds: roundsData || [] }
}

function App() {
  const [state, dispatch] = useReducer(reducer, {
    teams: [],
    rounds: [],
    loading: true,
    error: null,
  })
  const [activeTab, setActiveTab] = useState<Tab>('standings')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'FETCH_START' })
    loadData().then(result => {
      if (cancelled) return
      if ('error' in result) {
        dispatch({ type: 'FETCH_ERROR', error: result.error })
      } else {
        dispatch({ type: 'FETCH_SUCCESS', teams: result.teams, rounds: result.rounds })
      }
    })
    return () => { cancelled = true }
  }, [refreshKey])

  const { teams, rounds, loading, error } = state
  const teamsLocked = teams.length === 5
  const completedRounds = rounds.length
  const currentRound = completedRounds + 1
  const rotation = teamsLocked ? generateRotation(teams) : []
  const allRoundsComplete = completedRounds >= TOTAL_ROUNDS
  const currentSittingOut = currentRound <= TOTAL_ROUNDS ? rotation[currentRound - 1] : ''

  const refresh = () => setRefreshKey(k => k + 1)

  const handleTeamsLocked = (newTeams: Team[]) => {
    dispatch({ type: 'SET_TEAMS', teams: newTeams })
    setActiveTab('play')
  }

  const handleRoundSaved = () => {
    refresh()
    setActiveTab('standings')
  }

  const handleResetNight = async () => {
    if (!confirm('Are you sure you want to reset the entire game night? This will delete all teams and rounds.')) return

    await supabase.from('game_night_rounds').delete().neq('id', 0)
    await supabase.from('game_night_teams').delete().neq('id', 0)
    dispatch({ type: 'RESET' })
    setActiveTab('standings')
  }

  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: 'standings', label: 'Standings' },
    { id: 'play', label: allRoundsComplete ? 'Complete!' : `Round ${currentRound}`, disabled: allRoundsComplete },
    { id: 'history', label: 'History' },
    { id: 'schedule', label: 'Schedule' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-ancient-950 via-ancient-900 to-ancient-950">
      {/* Header */}
      <header className="bg-ancient-950/80 border-b border-gold-600/30 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            <span className="text-gold-400">7 Wonders</span>
            <span className="text-ancient-300"> Team League</span>
          </h1>
          <p className="text-center text-ancient-500 text-sm mt-1">
            {teamsLocked
              ? `${completedRounds}/${TOTAL_ROUNDS} rounds played`
              : 'Set up your teams to begin'}
          </p>
        </div>

        {/* Navigation - only show when teams are locked */}
        {teamsLocked && (
          <nav className="max-w-6xl mx-auto px-4">
            <div className="flex justify-center gap-1 md:gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  className={`px-3 py-2 md:px-6 md:py-3 font-medium transition-all border-b-2 text-sm md:text-base ${
                    tab.disabled
                      ? 'text-ancient-600 border-transparent cursor-not-allowed'
                      : activeTab === tab.id
                      ? 'text-gold-400 border-gold-400 bg-ancient-900/50'
                      : 'text-ancient-400 border-transparent hover:text-ancient-200 hover:border-ancient-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gold-400 text-xl">Loading...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-6 text-red-200">
            <h2 className="font-bold mb-2">Error</h2>
            <p>{error}</p>
            <button
              onClick={refresh}
              className="mt-4 bg-red-600 hover:bg-red-500 px-4 py-2 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        ) : !teamsLocked ? (
          <TeamSetup onTeamsLocked={handleTeamsLocked} />
        ) : (
          <>
            {activeTab === 'standings' && (
              <LeagueStandings teams={teams} rounds={rounds} />
            )}
            {activeTab === 'play' && !allRoundsComplete && (
              <RoundManager
                key={currentRound}
                roundNumber={currentRound}
                teams={teams}
                sittingOutTeam={currentSittingOut}
                onRoundSaved={handleRoundSaved}
              />
            )}
            {activeTab === 'history' && <RoundHistory rounds={rounds} />}
            {activeTab === 'schedule' && (
              <RotationSchedule
                teams={teams}
                rounds={rounds}
                currentRound={currentRound}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-ancient-800 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <p className="text-ancient-600 text-sm">
            {teamsLocked
              ? `${teams.length} teams \u00B7 ${rounds.length} rounds`
              : '7 Wonders Team League'}
          </p>
          {teamsLocked && (
            <button
              onClick={handleResetNight}
              className="text-red-600 hover:text-red-400 text-xs transition-colors"
            >
              Reset Night
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

export default App
