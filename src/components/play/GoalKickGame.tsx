import { useEffect, useState } from 'react'
import type { PlayGameDefinition } from '../../data/playGames'
import { happinessForScore } from '../../data/playGames'
import { BigButton } from '../BigButton'
import { PlayGameResult, PlayGameShell } from './PlayGameShell'

const ROUNDS = 3
const ZONE_START = 38
const ZONE_END = 62

interface GoalKickGameProps {
  game: PlayGameDefinition
  onFinish: (happiness: number, message: string) => void
  onCancel: () => void
}

export function GoalKickGame({ game, onFinish, onCancel }: GoalKickGameProps) {
  const [pos, setPos] = useState(20)
  const [dir, setDir] = useState(1)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [done, setDone] = useState(false)
  const [finalGain, setFinalGain] = useState(0)
  const [finalScore, setFinalScore] = useState(0)

  useEffect(() => {
    if (done) return
    const id = window.setInterval(() => {
      setPos((p) => {
        const next = p + dir * 6
        if (next >= 96) {
          setDir(-1)
          return 96
        }
        if (next <= 4) {
          setDir(1)
          return 4
        }
        return next
      })
    }, 40)
    return () => window.clearInterval(id)
  }, [dir, done])

  const kick = () => {
    if (done || feedback) return
    const hit = pos >= ZONE_START && pos <= ZONE_END
    const nextScore = score + (hit ? 1 : 0)
    setFeedback(hit ? 'GOAL! ⚽' : 'Miss!')

    window.setTimeout(() => {
      if (round >= ROUNDS) {
        const gain = happinessForScore(nextScore, ROUNDS, game)
        setFinalScore(nextScore)
        setFinalGain(gain)
        setDone(true)
        onFinish(
          gain,
          nextScore === ROUNDS ? 'Perfect hat-trick!' : nextScore >= 2 ? 'Great kicking!' : 'Nice try!'
        )
      } else {
        setScore(nextScore)
        setRound((r) => r + 1)
        setFeedback('')
      }
    }, 700)
  }

  if (done) {
    return (
      <PlayGameShell title={game.name} emoji={game.emoji} onBack={onCancel}>
        <PlayGameResult
          message={finalScore === ROUNDS ? 'Perfect hat-trick! ⚽' : `${finalScore}/${ROUNDS} goals!`}
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
      hint={`Kick ${round}/${ROUNDS} — tap when the ball is in the green zone!`}
    >
      <div className="flex-1 flex flex-col justify-center">
        <div className="relative h-16 bg-gray-100 rounded-2xl border-4 border-gray-200 overflow-hidden mb-6">
          <div
            className="absolute top-0 bottom-0 bg-mint/40 border-x-4 border-mint"
            style={{ left: `${ZONE_START}%`, width: `${ZONE_END - ZONE_START}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 text-3xl transition-[left] duration-75"
            style={{ left: `calc(${pos}% - 1rem)` }}
          >
            ⚽
          </div>
        </div>

        {feedback && (
          <p className="font-kid text-2xl text-center text-grape font-bold mb-4 animate-pop">
            {feedback}
          </p>
        )}

        <p className="font-kid text-center text-gray-500 mb-4">Score: {score}/{ROUNDS}</p>

        <BigButton onClick={kick} variant="primary" size="xl" className="w-full" disabled={!!feedback}>
          Kick! ⚽
        </BigButton>
      </div>
    </PlayGameShell>
  )
}
