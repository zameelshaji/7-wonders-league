import { useState } from 'react'
import { supabase, PLAYERS, CATEGORIES, calculateTotal } from '../lib/supabase'
import type { Player, PlayerScores } from '../lib/supabase'

interface ScoreInputProps {
  onGameAdded: () => void
}

export default function ScoreInput({ onGameAdded }: ScoreInputProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [scores, setScores] = useState<Record<Player, Omit<PlayerScores, 'Total'>>>(() => {
    const initial: Record<string, Omit<PlayerScores, 'Total'>> = {}
    PLAYERS.forEach(player => {
      initial[player] = {
        Wonders: 0,
        Coins: 0,
        Military: 0,
        Blue: 0,
        Gold: 0,
        Green: 0,
        Purple: 0,
        Black: 0,
        Armada: 0,
        Islands: 0,
      }
    })
    return initial as Record<Player, Omit<PlayerScores, 'Total'>>
  })
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const togglePlayer = (player: Player) => {
    setSelectedPlayers(prev => {
      if (prev.includes(player)) {
        return prev.filter(p => p !== player)
      }
      if (prev.length >= 5) return prev
      return [...prev, player]
    })
  }

  const updateScore = (player: Player, category: keyof Omit<PlayerScores, 'Total'>, value: number) => {
    setScores(prev => ({
      ...prev,
      [player]: {
        ...prev[player],
        [category]: value,
      },
    }))
  }

  const getTotal = (player: Player) => calculateTotal(scores[player])

  const handleSubmit = async () => {
    if (selectedPlayers.length < 3) {
      setError('Please select at least 3 players')
      return
    }

    setSaving(true)
    setError(null)

    const gameScores: Record<string, PlayerScores> = {}
    selectedPlayers.forEach(player => {
      gameScores[player] = {
        ...scores[player],
        Total: getTotal(player),
      }
    })

    const { error: saveError } = await supabase
      .from('games')
      .insert({
        date,
        players: selectedPlayers,
        scores: gameScores,
      })

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    // Reset form
    setSelectedPlayers([])
    setScores(() => {
      const reset: Record<string, Omit<PlayerScores, 'Total'>> = {}
      PLAYERS.forEach(player => {
        reset[player] = {
          Wonders: 0,
          Coins: 0,
          Military: 0,
          Blue: 0,
          Gold: 0,
          Green: 0,
          Purple: 0,
          Black: 0,
          Armada: 0,
          Islands: 0,
        }
      })
      return reset as Record<Player, Omit<PlayerScores, 'Total'>>
    })
    setDate(new Date().toISOString().split('T')[0])
    onGameAdded()
  }

  return (
    <div className="bg-ancient-900/50 rounded-lg p-6 border border-gold-600/30">
      <h2 className="text-2xl font-bold text-gold-400 mb-6">Record New Game</h2>

      {/* Date Input */}
      <div className="mb-6">
        <label className="block text-ancient-300 mb-2">Game Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-ancient-800 border border-ancient-600 rounded px-3 py-2 text-ancient-100 focus:border-gold-500 focus:outline-none"
        />
      </div>

      {/* Player Selection */}
      <div className="mb-6">
        <label className="block text-ancient-300 mb-2">Select Players (3-5)</label>
        <div className="flex flex-wrap gap-2">
          {PLAYERS.map(player => (
            <button
              key={player}
              onClick={() => togglePlayer(player)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPlayers.includes(player)
                  ? 'bg-gold-600 text-ancient-950'
                  : 'bg-ancient-800 text-ancient-300 hover:bg-ancient-700'
              }`}
            >
              {player}
            </button>
          ))}
        </div>
        <p className="text-ancient-500 text-sm mt-2">
          {selectedPlayers.length} player{selectedPlayers.length !== 1 ? 's' : ''} selected
        </p>
      </div>

      {/* Score Entry Table */}
      {selectedPlayers.length > 0 && (
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ancient-700">
                <th className="text-left py-2 px-2 text-ancient-400">Category</th>
                {selectedPlayers.map(player => (
                  <th key={player} className="text-center py-2 px-2 text-gold-400">
                    {player}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map(category => (
                <tr key={category} className="border-b border-ancient-800/50">
                  <td className="py-2 px-2 text-ancient-300">
                    {category}
                    {['Black', 'Armada', 'Islands'].includes(category) && (
                      <span className="text-ancient-600 text-xs ml-1">(exp)</span>
                    )}
                  </td>
                  {selectedPlayers.map(player => (
                    <td key={player} className="py-2 px-2">
                      <input
                        type="number"
                        value={scores[player][category as keyof Omit<PlayerScores, 'Total'>] || ''}
                        onChange={e =>
                          updateScore(
                            player,
                            category as keyof Omit<PlayerScores, 'Total'>,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-16 bg-ancient-800 border border-ancient-600 rounded px-2 py-1 text-center text-ancient-100 focus:border-gold-500 focus:outline-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-gold-900/20">
                <td className="py-2 px-2 font-bold text-gold-400">Total</td>
                {selectedPlayers.map(player => (
                  <td key={player} className="py-2 px-2 text-center font-bold text-gold-300">
                    {getTotal(player)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-200">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={saving || selectedPlayers.length < 3}
        className="w-full bg-gold-600 hover:bg-gold-500 disabled:bg-ancient-700 disabled:text-ancient-500 text-ancient-950 font-bold py-3 px-6 rounded-lg transition-colors"
      >
        {saving ? 'Saving...' : 'Save Game'}
      </button>
    </div>
  )
}
