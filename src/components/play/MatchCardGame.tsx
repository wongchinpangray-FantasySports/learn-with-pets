import { useMemo, useState } from 'react'
import type { PetType } from '../../types'
import type { PlayGameDefinition } from '../../data/playGames'
import { getPetById } from '../../data/content'
import { PlayGameResult, PlayGameShell } from './PlayGameShell'

interface MatchCardGameProps {
  game: PlayGameDefinition
  petId: PetType
  onFinish: (happiness: number, message: string) => void
  onCancel: () => void
}

export function MatchCardGame({ game, petId, onFinish, onCancel }: MatchCardGameProps) {
  const pet = getPetById(petId)!
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const [finalGain, setFinalGain] = useState(0)
  const [resultMsg, setResultMsg] = useState('')

  const winningIndex = useMemo(() => Math.floor(Math.random() * 3), [])

  const pick = (index: number) => {
    if (picked !== null) return
    setPicked(index)
    const win = index === winningIndex
    const gain = win ? game.maxHappiness : game.minHappiness
    const msg = win ? 'You found your pet! 🎉' : `It was card ${winningIndex + 1}! Nice try!`

    window.setTimeout(() => {
      setFinalGain(gain)
      setResultMsg(msg)
      setDone(true)
      onFinish(gain, msg)
    }, 600)
  }

  if (done) {
    return (
      <PlayGameShell title={game.name} emoji={game.emoji} onBack={onCancel}>
        <PlayGameResult message={resultMsg} happinessGain={finalGain} onDone={onCancel} />
      </PlayGameShell>
    )
  }

  return (
    <PlayGameShell
      title={game.name}
      emoji={game.emoji}
      onBack={onCancel}
      hint={`Find ${pet.name} ${pet.emoji} — pick one card!`}
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="grid grid-cols-3 gap-3 w-full">
          {[0, 1, 2].map((index) => {
            const revealed = picked !== null
            const isWinner = index === winningIndex
            const showPet = revealed && isWinner
            const showWrong = revealed && picked === index && !isWinner

            return (
              <button
                key={index}
                type="button"
                onClick={() => pick(index)}
                disabled={picked !== null}
                className={`
                  aspect-[3/4] rounded-2xl border-4 font-kid text-4xl
                  flex items-center justify-center transition-all active:scale-95
                  ${showPet ? 'bg-mint/20 border-mint' : showWrong ? 'bg-red-50 border-red-200' : 'bg-grape/10 border-grape/30'}
                  ${picked === null ? 'hover:bg-grape/20' : ''}
                `}
              >
                {showPet ? pet.emoji : showWrong ? '❌' : revealed ? '🃏' : '🂠'}
              </button>
            )
          })}
        </div>
      </div>
    </PlayGameShell>
  )
}
