export type PlayGameCategory = 'sports' | 'games' | 'table'

export interface PlayGameDefinition {
  id: string
  name: string
  emoji: string
  category: PlayGameCategory
  description: string
  coinCost: number
  minHappiness: number
  maxHappiness: number
}

export const PLAY_GAME_CATEGORIES: { id: PlayGameCategory; label: string; emoji: string }[] = [
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'games', label: 'Games', emoji: '🎮' },
  { id: 'table', label: 'Table', emoji: '🎲' },
]

export const PLAY_GAMES: PlayGameDefinition[] = [
  {
    id: 'goal-kick',
    name: 'Goal Kick',
    emoji: '⚽',
    category: 'sports',
    description: 'Tap when the ball hits the green zone!',
    coinCost: 2,
    minHappiness: 10,
    maxHappiness: 19,
  },
  {
    id: 'bounce-catch',
    name: 'Bounce Catch',
    emoji: '🏀',
    category: 'sports',
    description: 'Catch the ball before it falls!',
    coinCost: 2,
    minHappiness: 10,
    maxHappiness: 19,
  },
  {
    id: 'balloon-pop',
    name: 'Balloon Pop',
    emoji: '🎈',
    category: 'games',
    description: 'Pop balloons before they float away!',
    coinCost: 2,
    minHappiness: 10,
    maxHappiness: 18,
  },
  {
    id: 'tap-sprint',
    name: 'Tap Sprint',
    emoji: '🎯',
    category: 'games',
    description: 'Tap as fast as you can in 5 seconds!',
    coinCost: 2,
    minHappiness: 10,
    maxHappiness: 18,
  },
  {
    id: 'lucky-dice',
    name: 'Lucky Dice',
    emoji: '🎲',
    category: 'table',
    description: 'Roll the dice — beat your pet!',
    coinCost: 2,
    minHappiness: 12,
    maxHappiness: 18,
  },
  {
    id: 'match-card',
    name: 'Match Card',
    emoji: '🃏',
    category: 'table',
    description: 'Find the card with your pet on it!',
    coinCost: 2,
    minHappiness: 10,
    maxHappiness: 18,
  },
]

export function getPlayGameById(id: string): PlayGameDefinition | undefined {
  return PLAY_GAMES.find((g) => g.id === id)
}

export function happinessForScore(
  score: number,
  maxScore: number,
  game: PlayGameDefinition
): number {
  if (maxScore <= 0) return game.minHappiness
  const ratio = Math.max(0, Math.min(1, score / maxScore))
  return Math.round(game.minHappiness + ratio * (game.maxHappiness - game.minHappiness))
}
