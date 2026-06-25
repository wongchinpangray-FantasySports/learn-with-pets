/** How often hunger drops by 1 point while the player is away or idle. */
export const HUNGER_DECAY_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes

/** How often happiness drops by 1 point. */
export const HAPPINESS_DECAY_INTERVAL_MS = 60 * 60 * 1000 // 60 minutes

/** Cap decay per check so a long absence never wipes stats in one go. */
export const MAX_DECAY_PER_STAT = 35

export const MIN_PET_STAT = 0
export const MAX_PET_STAT = 100

export function clampPetStat(value: number): number {
  return Math.max(MIN_PET_STAT, Math.min(MAX_PET_STAT, value))
}

export function calculatePetDecay(
  hunger: number,
  happiness: number,
  lastDecayAt: number | null,
  now = Date.now()
): { hunger: number; happiness: number; lastDecayAt: number } {
  if (!lastDecayAt || now <= lastDecayAt) {
    return { hunger, happiness, lastDecayAt: now }
  }

  const elapsedMs = now - lastDecayAt

  const hungerDrop = Math.min(
    MAX_DECAY_PER_STAT,
    hunger - MIN_PET_STAT,
    Math.floor(elapsedMs / HUNGER_DECAY_INTERVAL_MS)
  )

  const happinessDrop = Math.min(
    MAX_DECAY_PER_STAT,
    happiness - MIN_PET_STAT,
    Math.floor(elapsedMs / HAPPINESS_DECAY_INTERVAL_MS)
  )

  return {
    hunger: clampPetStat(hunger - hungerDrop),
    happiness: clampPetStat(happiness - happinessDrop),
    lastDecayAt: now,
  }
}
