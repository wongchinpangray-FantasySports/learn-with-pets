import { useEffect, useRef, useState } from 'react'
import type { PlayGameDefinition } from '../../data/playGames'
import { happinessForScore } from '../../data/playGames'
import { BigButton } from '../BigButton'
import { PlayGameResult, PlayGameShell } from './PlayGameShell'

const ROUNDS = 3
const FALL_MS = 2200
const CATCH_ZONE_TOP = 72
const CATCH_ZONE_BOTTOM = 92

interface BounceCatchGameProps {
  game: PlayGameDefinition
  onFinish: (happiness: number, message: string) => void
  onCancel: () => void
}

export function BounceCatchGame({ game, onFinish, onCancel }: BounceCatchGameProps) {
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [ballY, setBallY] = useState(8)
  const [falling, setFalling] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [done, setDone] = useState(false)
  const [finalGain, setFinalGain] = useState(0)
  const startRef = useRef(0)
  const frameRef = useRef(0)

  const startRound = () => {
    setBallY(8)
    setFalling(true)
    setFeedback('')
    startRef.current = performance.now()
  }

  useEffect(() => {
    startRound()
  }, [])

  useEffect(() => {
    if (!falling || done) return

    const tick = (now: number) => {
      const elapsed = now - startRef.current
      const progress = Math.min(1, elapsed / FALL_MS)
      setBallY(8 + progress * 84)

      if (progress >= 1) {
        setFalling(false)
        setFeedback('Dropped! 🏀')
        window.setTimeout(() => advance(score), 800)
        return
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [falling, done, round])

  const advance = (nextScore: number) => {
    if (round >= ROUNDS) {
      const gain = happinessForScore(nextScore, ROUNDS, game)
      setFinalGain(gain)
      setDone(true)
      onFinish(gain, nextScore >= 2 ? 'Great catches!' : 'Keep practicing!')
    } else {
      setRound((r) => r + 1)
      startRound()
    }
  }

  const catchBall = () => {
    if (!falling || feedback) return
    const caught = ballY >= CATCH_ZONE_TOP && ballY <= CATCH_ZONE_BOTTOM
    setFalling(false)
    cancelAnimationFrame(frameRef.current)

    const nextScore = score + (caught ? 1 : 0)
    setScore(nextScore)
    setFeedback(caught ? 'Caught! 🙌' : 'Too early!')

    window.setTimeout(() => advance(nextScore), 800)
  }

  if (done) {
    return (
      <PlayGameShell title={game.name} emoji={game.emoji} onBack={onCancel}>
        <PlayGameResult
          message={`${score}/${ROUNDS} catches!`}
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
      hint={`Catch ${round}/${ROUNDS} — tap when the ball is in the green zone!`}
    >
      <div className="flex-1 flex flex-col">
        <div className="relative flex-1 min-h-[220px] bg-gradient-to-b from-sky/10 to-orange-50 rounded-3xl border-4 border-orange-100 mb-4">
          <div
            className="absolute left-4 right-4 bg-mint/30 border-y-4 border-mint rounded-xl"
            style={{ top: `${CATCH_ZONE_TOP}%`, height: `${CATCH_ZONE_BOTTOM - CATCH_ZONE_TOP}%` }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 text-4xl"
            style={{ top: `${ballY}%` }}
          >
            🏀
          </div>
        </div>

        {feedback && (
          <p className="font-kid text-2xl text-center text-grape font-bold mb-3 animate-pop">
            {feedback}
          </p>
        )}

        <p className="font-kid text-center text-gray-500 mb-3">Score: {score}/{ROUNDS}</p>

        <BigButton onClick={catchBall} variant="primary" size="xl" className="w-full" disabled={!falling || !!feedback}>
          Catch! 🏀
        </BigButton>
      </div>
    </PlayGameShell>
  )
}
