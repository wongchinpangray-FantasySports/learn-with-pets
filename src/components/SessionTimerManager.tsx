import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { stopSpeaking } from '../utils/audio'
import { stopBgm } from '../utils/bgm'
import { getSessionRemainingMs, isSessionExpired } from '../utils/sessionTimer'
import { SessionTimerOverlay } from './SessionTimerOverlay'

/** Starts a 30-minute session timer when the app opens and shows a break reminder when time is up. */
export function SessionTimerManager() {
  const selectedPet = useGameStore((s) => s.selectedPet)
  const [expired, setExpired] = useState(() => isSessionExpired())

  useEffect(() => {
    if (expired) return

    const remaining = getSessionRemainingMs()
    const timer = window.setTimeout(() => {
      stopBgm()
      stopSpeaking()
      setExpired(true)
    }, remaining)

    return () => window.clearTimeout(timer)
  }, [expired])

  if (!expired) return null

  return <SessionTimerOverlay selectedPet={selectedPet} />
}
