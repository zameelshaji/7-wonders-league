import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import type { Game } from './lib/supabase'
import ScoreInput from './components/ScoreInput'
import LeagueTable from './components/LeagueTable'
import StatsDashboard from './components/StatsDashboard'
import GameHistory from './components/GameHistory'

type Tab = 'league' | 'newgame' | 'stats' | 'history'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('league')
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGames = async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setGames(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchGames()
  }, [])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'league', label: 'League' },
    { id: 'newgame', label: 'New Game' },
    { id: 'stats', label: 'Stats' },
    { id: 'history', label: 'History' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-ancient-950 via-ancient-900 to-ancient-950">
      {/* Header */}
      <header className="bg-ancient-950/80 border-b border-gold-600/30 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            <span className="text-gold-400">7 Wonders</span>
            <span className="text-ancient-300"> League</span>
          </h1>
          <p className="text-center text-ancient-500 text-sm mt-1">
            Track your civilization's glory
          </p>
        </div>

        {/* Navigation */}
        <nav className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center gap-1 md:gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 md:px-6 md:py-3 font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-gold-400 border-gold-400 bg-ancient-900/50'
                    : 'text-ancient-400 border-transparent hover:text-ancient-200 hover:border-ancient-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gold-400 text-xl">Loading games...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-6 text-red-200">
            <h2 className="font-bold mb-2">Error loading games</h2>
            <p>{error}</p>
            <button
              onClick={fetchGames}
              className="mt-4 bg-red-600 hover:bg-red-500 px-4 py-2 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'league' && <LeagueTable games={games} />}
            {activeTab === 'newgame' && (
              <ScoreInput
                onGameAdded={() => {
                  fetchGames()
                  setActiveTab('league')
                }}
              />
            )}
            {activeTab === 'stats' && <StatsDashboard games={games} />}
            {activeTab === 'history' && (
              <GameHistory games={games} onGameDeleted={fetchGames} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-ancient-800 py-6 mt-auto">
        <p className="text-center text-ancient-600 text-sm">
          {games.length} game{games.length !== 1 ? 's' : ''} recorded
        </p>
      </footer>
    </div>
  )
}

export default App
