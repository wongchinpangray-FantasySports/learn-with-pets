import { useGameStore } from '../store/gameStore'
import { unlockBgmAudio, startBgm, setBgmAudible, isBgmPlaying } from '../utils/bgm'

export function BgmToggle({ className = '' }: { className?: string }) {
  const { bgmEnabled, setBgmEnabled } = useGameStore()

  const handleToggle = () => {
    const next = !bgmEnabled
    unlockBgmAudio()
    setBgmEnabled(next)
    setBgmAudible(next)
    if (next && !isBgmPlaying()) {
      startBgm()
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`
        font-kid text-[10px] font-semibold leading-tight text-center
        px-2 py-1 rounded-xl border transition-all active:scale-95
        ${bgmEnabled
          ? 'bg-sky-50 border-sky-200 text-teal-700'
          : 'bg-gray-50 border-gray-200 text-gray-400'
        }
        ${className}
      `}
      title={bgmEnabled ? 'Mute background music' : 'Play background music'}
      aria-label={bgmEnabled ? 'Mute background music' : 'Play background music'}
    >
      {bgmEnabled ? '🎵 Music on' : '🔇 Music off'}
    </button>
  )
}
