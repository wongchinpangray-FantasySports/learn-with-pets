import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

const DECAY_CHECK_MS = 5 * 60 * 1000

/** Applies hunger/happiness decay on load and while the app stays open. */
export function PetDecayManager() {
  const onboarded = useGameStore((s) => s.onboarded)
  const selectedPet = useGameStore((s) => s.selectedPet)
  const applyPetDecay = useGameStore((s) => s.applyPetDecay)

  useEffect(() => {
    if (!onboarded || !selectedPet) return

    applyPetDecay()

    const interval = setInterval(applyPetDecay, DECAY_CHECK_MS)
    return () => clearInterval(interval)
  }, [onboarded, selectedPet, applyPetDecay])

  return null
}
