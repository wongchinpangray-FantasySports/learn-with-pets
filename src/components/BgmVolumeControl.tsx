import { useGameStore } from '../store/gameStore'
import {
  unlockBgmAudio,
  startBgm,
  setBgmAudible,
  setBgmVolume,
  isBgmPlaying,
} from '../utils/bgm'

function volumeLabel(volume: number): string {
  const pct = Math.round(volume * 100)
  if (pct === 0) return 'Muted'
  if (pct <= 20) return 'Very quiet'
  if (pct <= 45) return 'Soft'
  if (pct <= 70) return 'Just right'
  return 'Loud'
}

export function BgmVolumeControl() {
  const { bgmEnabled, bgmVolume, setBgmEnabled, setBgmVolume: setStoredVolume } =
    useGameStore()

  const handleToggle = () => {
    const next = !bgmEnabled
    unlockBgmAudio()
    setBgmEnabled(next)
    setBgmAudible(next)
    if (next && !isBgmPlaying()) {
      startBgm()
    }
  }

  const handleVolumeChange = (value: number) => {
    unlockBgmAudio()
    setStoredVolume(value)
    setBgmVolume(value)
    if (value > 0 && !bgmEnabled) {
      setBgmEnabled(true)
      setBgmAudible(true)
      if (!isBgmPlaying()) {
        startBgm()
      }
      return
    }
    if (value === 0 && bgmEnabled) {
      setBgmEnabled(false)
      setBgmAudible(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-5 mb-5 border-2 border-sky-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-kid font-bold text-lg text-gray-800">🎵 Music</h2>
        <button
          type="button"
          onClick={handleToggle}
          className={`
            font-kid text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all active:scale-95
            ${bgmEnabled
              ? 'bg-sky-50 border-sky-200 text-teal-700'
              : 'bg-gray-50 border-gray-200 text-gray-400'
            }
          `}
          aria-pressed={bgmEnabled}
        >
          {bgmEnabled ? 'On' : 'Off'}
        </button>
      </div>

      <div className={`${bgmEnabled ? '' : 'opacity-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-kid text-sm font-semibold text-gray-700">Volume</span>
          <span className="font-kid text-xs text-sky-700 font-medium">
            {volumeLabel(bgmVolume)} · {Math.round(bgmVolume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={bgmVolume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          disabled={!bgmEnabled}
          className="w-full h-3 rounded-full appearance-none cursor-pointer accent-sky-500 disabled:cursor-not-allowed"
          aria-label="Background music volume"
        />
        <div className="flex justify-between font-kid text-xs text-gray-400 mt-1">
          <span>🔇 Quiet</span>
          <span>🔊 Loud</span>
        </div>
      </div>
    </div>
  )
}
