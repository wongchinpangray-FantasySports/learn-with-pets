import { useRef } from 'react'
import type { PetType } from '../../types'
import type { PlayGameDefinition } from '../../data/playGames'
import { BalloonPopGame } from './BalloonPopGame'
import { BounceCatchGame } from './BounceCatchGame'
import { GoalKickGame } from './GoalKickGame'
import { LuckyDiceGame } from './LuckyDiceGame'
import { MatchCardGame } from './MatchCardGame'
import { TapSprintGame } from './TapSprintGame'

interface PlayGameHostProps {
  game: PlayGameDefinition
  petId: PetType
  petName: string
  onComplete: (happiness: number) => void
  onCancel: () => void
}

export function PlayGameHost({ game, petId, petName, onComplete, onCancel }: PlayGameHostProps) {
  const finishedRef = useRef(false)

  const handleFinish = (happiness: number) => {
    if (finishedRef.current) return
    finishedRef.current = true
    onComplete(happiness)
  }

  const handleCancel = () => {
    onCancel()
  }

  switch (game.id) {
    case 'goal-kick':
      return <GoalKickGame game={game} onFinish={(h) => handleFinish(h)} onCancel={handleCancel} />
    case 'bounce-catch':
      return <BounceCatchGame game={game} onFinish={(h) => handleFinish(h)} onCancel={handleCancel} />
    case 'balloon-pop':
      return <BalloonPopGame game={game} onFinish={(h) => handleFinish(h)} onCancel={handleCancel} />
    case 'tap-sprint':
      return <TapSprintGame game={game} onFinish={(h) => handleFinish(h)} onCancel={handleCancel} />
    case 'lucky-dice':
      return (
        <LuckyDiceGame
          game={game}
          petName={petName}
          onFinish={(h) => handleFinish(h)}
          onCancel={handleCancel}
        />
      )
    case 'match-card':
      return <MatchCardGame game={game} petId={petId} onFinish={(h) => handleFinish(h)} onCancel={handleCancel} />
    default:
      return null
  }
}
