import { useEffect, useRef, useState } from 'react'
import type { PlayGameDefinition } from '../../data/playGames'
import { happinessForScore } from '../../data/playGames'
import { BigButton } from '../BigButton'
import { PlayGameResult, PlayGameShell } from './PlayGameShell'

const DURATION_SEC = 5
const GREAT_TAPS = 12

interface TapSprintGameProps {
  game: PlayGameDefinition
  onFinish: (happiness: number, message: string) => void
  onCancel: () => void
}

export function TapSprintGame({ game, onFinish, onCancel }: TapSprintGameProps) {
  const [phase, setPhase] = useState<'ready' | 'go' | 'done'>('ready')
  const [timeLeft, setTimeLeft] = useState(DURATION_SEC)
  const [taps, setTaps] = useState(0)
  const [finalGain, setFinalGain] = useState(0)
  const tapsRef = useRef(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    if (phase !== 'go') return
    if (timeLeft <= 0) {
      if (finishedRef.current) return
      finishedRef.current = true
      const total = tapsRef.current
      const gain = happinessForScore(Math.min(total, GREAT_TAPS), GREAT_TAPS, game)
      setFinalGain(gain)
      setPhase('done')
      onFinish(gain, total >= GREAT_TAPS ? 'Lightning fingers!' : 'Great sprint!')
      return
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => window.clearTimeout(id)
  }, [phase, timeLeft, game, onFinish])

  const start = () => {
    tapsRef.current = 0
    finishedRef.current = false
    setTaps(0)
    setTimeLeft(DURATION_SEC)
    setPhase('go')
  }

  const registerTap = () => {
    tapsRef.current += 1
    setTaps(tapsRef.current)
  }

  if (phase === 'done') {
    return (
      <PlayGameShell title={game.name} emoji={game.emoji} onBack={onCancel}>
        <PlayGameResult
          message={`${taps} taps in ${DURATION_SEC} seconds!`}
          happinessGain={finalGain}
          onDone={onCancel}
        />
      </PlayGameShell>
    )
  }

  if (phase === 'ready') {
    return (
      <PlayGameShell title={game.name} emoji={game.emoji} onBack={onCancel} hint="Tap as fast as you can!">
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="font-kid text-gray-600 text-center mb-6">
            You have {DURATION_SEC} seconds. Ready?
          </p>
          <BigButton onClick={start} variant="primary" size="xl">
            Start! 🎯
          </BigButton>
        </div>
      </PlayGameShell>
    )
  }

  return (
    <PlayGameShell title={game.name} emoji={game.emoji} onBack={onCancel}>
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="font-kid text-5xl font-bold text-berry mb-2">{timeLeft}</p>
        <p className="font-kid text-3xl font-bold text-gray-800 mb-8">{taps} taps</p>
        <BigButton
          onClick={registerTap}
          variant="secondary"
          size="xl"
          className="w-full min-h-[120px] text-3xl"
        >
          TAP! 👆
        </BigButton>
      </div>
    </PlayGameShell>
  )
}
