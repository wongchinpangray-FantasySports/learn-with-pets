import { useState } from 'react'
import type { PlayGameDefinition } from '../../data/playGames'
import { BigButton } from '../BigButton'
import { PlayGameResult, PlayGameShell } from './PlayGameShell'

const DICE = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

interface LuckyDiceGameProps {
  game: PlayGameDefinition
  petName: string
  onFinish: (happiness: number, message: string) => void
  onCancel: () => void
}

export function LuckyDiceGame({ game, petName, onFinish, onCancel }: LuckyDiceGameProps) {
  const [playerRoll, setPlayerRoll] = useState<number | null>(null)
  const [petRoll, setPetRoll] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [done, setDone] = useState(false)
  const [finalGain, setFinalGain] = useState(0)
  const [resultMsg, setResultMsg] = useState('')

  const roll = () => {
    if (rolling) return
    setRolling(true)
    setPlayerRoll(null)
    setPetRoll(null)

    let ticks = 0
    const id = window.setInterval(() => {
      setPlayerRoll(1 + Math.floor(Math.random() * 6))
      setPetRoll(1 + Math.floor(Math.random() * 6))
      ticks++
      if (ticks >= 8) {
        window.clearInterval(id)
        const you = 1 + Math.floor(Math.random() * 6)
        const pet = 1 + Math.floor(Math.random() * 6)
        setPlayerRoll(you)
        setPetRoll(pet)
        setRolling(false)

        let gain = game.minHappiness
        let msg = 'Good roll!'
        if (you > pet) {
          gain = game.maxHappiness
          msg = 'You win! 🎉'
        } else if (you === pet) {
          gain = Math.round((game.minHappiness + game.maxHappiness) / 2)
          msg = 'It\'s a tie!'
        } else {
          gain = game.minHappiness
          msg = `${petName} wins — try again next time!`
        }

        setFinalGain(gain)
        setResultMsg(msg)
        setDone(true)
        onFinish(gain, msg)
      }
    }, 120)
  }

  if (done && playerRoll && petRoll) {
    return (
      <PlayGameShell title={game.name} emoji={game.emoji} onBack={onCancel}>
        <PlayGameResult message={resultMsg} happinessGain={finalGain} onDone={onCancel} />
      </PlayGameShell>
    )
  }

  return (
    <PlayGameShell title={game.name} emoji={game.emoji} onBack={onCancel} hint="Roll the dice — highest number wins!">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-white rounded-3xl border-4 border-sky/40 p-5 text-center">
            <p className="font-kid text-sm text-gray-500 mb-2">You</p>
            <p className="text-5xl">{playerRoll ? DICE[playerRoll - 1] : '🎲'}</p>
            {playerRoll && <p className="font-kid text-lg font-bold mt-2">{playerRoll}</p>}
          </div>
          <div className="bg-white rounded-3xl border-4 border-orange-200 p-5 text-center">
            <p className="font-kid text-sm text-gray-500 mb-2">{petName}</p>
            <p className="text-5xl">{petRoll ? DICE[petRoll - 1] : '🎲'}</p>
            {petRoll && <p className="font-kid text-lg font-bold mt-2">{petRoll}</p>}
          </div>
        </div>

        <BigButton onClick={roll} variant="primary" size="xl" className="w-full" disabled={rolling}>
          {rolling ? 'Rolling...' : 'Roll! 🎲'}
        </BigButton>
      </div>
    </PlayGameShell>
  )
}
