import { useEffect, useState } from 'react'
import { isCloudTtsAvailable } from '../utils/audio'

export function VoiceBadge() {
  const [premium, setPremium] = useState<boolean | null>(null)

  useEffect(() => {
    isCloudTtsAvailable().then(setPremium)
  }, [])

  if (premium === null) return null

  return (
    <span
      className={`
        font-kid text-[10px] font-semibold leading-tight text-center
        px-2 py-1 rounded-xl border
        ${premium
          ? 'bg-purple-50 border-purple-200 text-purple-600'
          : 'bg-gray-50 border-gray-200 text-gray-400'
        }
      `}
      title={
        premium
          ? 'Using ElevenLabs premium kid voice'
          : 'Using browser voice — add ELEVENLABS_API_KEY for premium'
      }
    >
      {premium ? '✨ Premium' : '🔊 Browser'}
    </span>
  )
}
