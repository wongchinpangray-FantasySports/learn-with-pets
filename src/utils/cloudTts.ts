import type { SpeakStyle } from './audio'

let cloudTtsEnabled: boolean | null = null
let currentAudio: HTMLAudioElement | null = null
let currentAudioUrl: string | null = null

export async function isCloudTtsAvailable(): Promise<boolean> {
  if (cloudTtsEnabled !== null) return cloudTtsEnabled

  try {
    const res = await fetch('/api/tts/status')
    if (!res.ok) {
      cloudTtsEnabled = false
      return false
    }
    const data = (await res.json()) as { enabled?: boolean }
    cloudTtsEnabled = Boolean(data.enabled)
  } catch {
    cloudTtsEnabled = false
  }

  return cloudTtsEnabled
}

export function stopCloudAudio(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio.onended = null
    currentAudio.onerror = null
    currentAudio = null
  }
  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl)
    currentAudioUrl = null
  }
}

export async function playCloudTts(
  text: string,
  style: SpeakStyle,
  playbackRate = 1
): Promise<void> {
  stopCloudAudio()

  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, style }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'TTS request failed' }))
    throw new Error((err as { error?: string }).error ?? 'TTS request failed')
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  currentAudioUrl = url

  return new Promise((resolve, reject) => {
    const audio = new Audio(url)
    audio.playbackRate = playbackRate
    currentAudio = audio

    audio.onended = () => {
      stopCloudAudio()
      resolve()
    }

    audio.onerror = () => {
      stopCloudAudio()
      reject(new Error('Audio playback failed'))
    }

    audio.play().catch((err) => {
      stopCloudAudio()
      reject(err)
    })
  })
}
