import { useState } from 'react'
import {
  PLAY_GAME_CATEGORIES,
  PLAY_GAMES,
  type PlayGameCategory,
  type PlayGameDefinition,
} from '../../data/playGames'

interface PlayGamePickerProps {
  coins: number
  onSelect: (game: PlayGameDefinition) => void
}

export function PlayGamePicker({ coins, onSelect }: PlayGamePickerProps) {
  const [category, setCategory] = useState<PlayGameCategory>('sports')

  const games = PLAY_GAMES.filter((g) => g.category === category)

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {PLAY_GAME_CATEGORIES.map((cat) => {
          const active = category === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`
                flex-1 font-kid text-xs font-semibold py-2 px-2 rounded-xl border-2 transition-all
                ${active
                  ? 'bg-sky/20 border-sky text-teal-800'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
                }
              `}
            >
              {cat.emoji} {cat.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {games.map((game) => {
          const canAfford = coins >= game.coinCost
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => canAfford && onSelect(game)}
              disabled={!canAfford}
              className={`
                text-left rounded-2xl border-2 p-3 transition-all font-kid
                ${canAfford
                  ? 'bg-berry/5 border-berry/30 hover:bg-berry/10 active:scale-95'
                  : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                }
              `}
            >
              <div className="text-3xl mb-1">{game.emoji}</div>
              <div className="font-bold text-sm text-gray-800">{game.name}</div>
              <div className="text-[10px] text-gray-500 leading-tight mt-1">{game.description}</div>
              <div className="text-xs font-semibold text-amber-600 mt-2">{game.coinCost} 🪙</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
