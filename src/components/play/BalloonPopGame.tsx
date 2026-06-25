import { useEffect, useRef, useState } from 'react'
import type { PlayGameDefinition } from '../../data/playGames'
import { happinessForScore } from '../../data/playGames'
import { PlayGameResult, PlayGameShell } from './PlayGameShell'

const ROUNDS = 5
const FLOAT_MS = 2600

interface BalloonPopGameProps {
  game: PlayGameDefinition
  onFinish: (happiness: number, message: string) => void
  onCancel: () => void
}

export function BalloonPopGame({ game, onFinish, onCancel }: BalloonPopGameProps) {
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [xPos, setXPos] = useState(50)
  const [yPos, setYPos] = useState(85)
  const [active, setActive] = useState(true)
  const [done, setDone] = useState(false)
  const [finalGain, setFinalGain] = useState(0)
  const startRef = useRef(0)
  const frameRef = useRef(0)

  const spawnBalloon = () => {
    setXPos(15 + Math.random() * 70)
    setYPos(85)
    setActive(true)
    startRef.current = performance.now()
  }

  useEffect(() => {
    spawnBalloon()
  }, [])

  useEffect(() => {
    if (!active || done) return

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startRef.current) / FLOAT_MS)
      setYPos(85 - progress * 90)

      if (progress >= 1) {
        setActive(false)
        window.setTimeout(() => advance(score), 400)
        return
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [active, done, round])

  const advance = (nextScore: number) => {
    if (round >= ROUNDS) {
      const gain = happinessForScore(nextScore, ROUNDS, game)
      setFinalGain(gain)
      setDone(true)
      onFinish(gain, nextScore >= 4 ? 'Balloon master!' : 'Fun popping!')
    } else {
      setRound((r) => r + 1)
      spawnBalloon()
    }
  }

  const pop = () => {
    if (!active) return
    cancelAnimationFrame(frameRef.current)
    setActive(false)
    const nextScore = score + 1
    setScore(nextScore)
    window.setTimeout(() => advance(nextScore), 350)
  }

  if (done) {
    return (
      <PlayGameShell title={game.name} emoji={game.emoji} onBack={onCancel}>
        <PlayGameResult
          message={`${score}/${ROUNDS} balloons popped!`}
          happinessGain={finalGain}
          onDone={onCancel}
        />
      </PlayGameShell>
    )
  }

  return (
    <PlayGameShell
      title={game.name}
      emoji={game.emoji}
      onBack={onCancel}
      hint={`Pop ${round}/${ROUNDS} — tap the balloon before it floats away!`}
    >
      <div className="flex-1 flex flex-col">
        <div className="relative flex-1 min-h-[240px] bg-gradient-to-b from-sky-light to-white rounded-3xl border-4 border-sky/30 mb-4 overflow-hidden">
          {active && (
            <button
              type="button"
              onClick={pop}
              className="absolute text-5xl active:scale-125 transition-transform animate-float"
              style={{ left: `${xPos}%`, top: `${yPos}%`, transform: 'translate(-50%, -50%)' }}
              aria-label="Pop balloon"
            >
              🎈
            </button>
          )}
        </div>
        <p className="font-kid text-center text-gray-500">Score: {score}/{ROUNDS}</p>
      </div>
    </PlayGameShell>
  )
}
