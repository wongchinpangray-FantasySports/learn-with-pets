import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { startBgm, stopBgm, setBgmAudible, setBgmVolume, unlockBgmAudio } from '../utils/bgm'

/** Starts BGM after first tap; keeps in sync with mute preference. */
export function BgmManager() {
  const bgmEnabled = useGameStore((s) => s.bgmEnabled)
  const bgmVolume = useGameStore((s) => s.bgmVolume)
  const startedRef = useRef(false)

  useEffect(() => {
    setBgmVolume(bgmVolume)
  }, [bgmVolume])

  useEffect(() => {
    setBgmAudible(bgmEnabled)
    if (!bgmEnabled || !startedRef.current) return
    startBgm()
  }, [bgmEnabled])

  useEffect(() => {
    const tryStart = () => {
      if (startedRef.current) return
      startedRef.current = true
      unlockBgmAudio()
      if (useGameStore.getState().bgmEnabled) {
        startBgm()
      }
      document.removeEventListener('pointerdown', tryStart)
      document.removeEventListener('keydown', tryStart)
    }

    document.addEventListener('pointerdown', tryStart)
    document.addEventListener('keydown', tryStart)

    return () => {
      document.removeEventListener('pointerdown', tryStart)
      document.removeEventListener('keydown', tryStart)
      stopBgm()
    }
  }, [])

  return null
}
