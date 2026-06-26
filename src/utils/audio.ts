import { isCloudTtsAvailable, playCloudTts, stopCloudAudio } from './cloudTts'
import { duckBgm, unduckBgm } from './bgm'
import { useGameStore } from '../store/gameStore'

let synth: SpeechSynthesis | null = null
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null
let activeSpeakId = 0
let lastDedupe = { key: '', time: 0 }

function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null
  if (!synth) synth = window.speechSynthesis
  return synth
}

function getNarrationSpeed(): number {
  return useGameStore.getState().narrationSpeed
}

/** User speed slider applies to all teaching audio (narration + word playback) */
function getEffectiveRate(style: SpeakStyle, optionRate?: number): number {
  const userSpeed = getNarrationSpeed()
  if (optionRate !== undefined) return optionRate * (userSpeed / 0.75)
  if (style === 'narration') return userSpeed
  return userSpeed * 0.92
}

/** Voices that tend to sound softer / more kid-friendly on common platforms */
const CUTE_VOICE_NAMES = [
  'samantha', 'karen', 'moira', 'tessa', 'fiona', 'zira', 'aria',
  'jenny', 'susan', 'sara', 'emma', 'amy', 'linda', 'heather',
  'victoria', 'allison', 'ava', 'nicky', 'serena', 'child', 'kid', 'junior',
]

const AVOID_VOICE_NAMES = [
  'david', 'mark', 'james', 'daniel', 'richard', 'george',
  'tom', 'alex', 'fred', 'male', 'man',
]

function scoreVoice(voice: SpeechSynthesisVoice, preferCute: boolean): number {
  const name = voice.name.toLowerCase()
  let score = 0

  if (!voice.lang.toLowerCase().startsWith('en')) return -1
  if (AVOID_VOICE_NAMES.some((n) => name.includes(n))) return -1

  if (preferCute) {
    for (let i = 0; i < CUTE_VOICE_NAMES.length; i++) {
      if (name.includes(CUTE_VOICE_NAMES[i])) score += 100 - i * 2
    }
    if (name.includes('female') || name.includes('woman')) score += 40
    if (name.includes('natural') || name.includes('neural')) score += 25
  } else {
    if (name.includes('natural') || name.includes('neural')) score += 50
    score += 10
  }

  return score
}

function pickVoice(voices: SpeechSynthesisVoice[], preferCute: boolean): SpeechSynthesisVoice | null {
  const ranked = voices
    .map((v) => ({ voice: v, score: scoreVoice(v, preferCute) }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.voice ?? voices.find((v) => v.lang.startsWith('en')) ?? null
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (voicesReady) return voicesReady

  voicesReady = new Promise((resolve) => {
    const speechSynth = getSynth()
    if (!speechSynth) {
      resolve([])
      return
    }

    const collect = () => {
      const voices = speechSynth.getVoices()
      if (voices.length > 0) {
        resolve(voices)
        return true
      }
      return false
    }

    if (collect()) return

    speechSynth.onvoiceschanged = () => {
      if (collect()) speechSynth.onvoiceschanged = null
    }

    setTimeout(() => resolve(speechSynth.getVoices()), 500)
  })

  return voicesReady
}

export type SpeakStyle = 'word' | 'narration'

interface SpeakOptions {
  style?: SpeakStyle
  rate?: number
  /** Skip dedupe check (for manual replay buttons) */
  force?: boolean
}

const STYLE_PRESETS: Record<SpeakStyle, { rate: number; pitch: number }> = {
  word: { rate: 0.82, pitch: 1.2 },
  narration: { rate: 0.9, pitch: 1.55 },
}

export function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  const style = options.style ?? 'word'
  return speakWithCloudFallback(text, style, options.rate, options.force)
}

async function speakWithCloudFallback(
  text: string,
  style: SpeakStyle,
  rate?: number,
  force = false
): Promise<void> {
  const trimmed = text.trim()
  if (!trimmed) return

  const dedupeKey = `${style}:${trimmed}`
  if (
    !force &&
    dedupeKey === lastDedupe.key &&
    Date.now() - lastDedupe.time < 2000
  ) {
    return
  }
  lastDedupe = { key: dedupeKey, time: Date.now() }

  const speakId = ++activeSpeakId
  stopSpeaking()
  duckBgm()

  const speed = getEffectiveRate(style, rate)

  try {
    if (await isCloudTtsAvailable()) {
      try {
        await playCloudTts(trimmed, style, speed)
        if (speakId === activeSpeakId) return
      } catch {
        if (speakId !== activeSpeakId) return
      }
    }

    if (speakId !== activeSpeakId) return
    await speakBrowser(trimmed, style, speed)
  } finally {
    if (speakId === activeSpeakId) {
      unduckBgm()
    }
  }
}

function speakBrowser(text: string, style: SpeakStyle, rate: number): Promise<void> {
  const preset = STYLE_PRESETS[style]

  return new Promise((resolve, reject) => {
    const speechSynth = getSynth()
    if (!speechSynth) {
      reject(new Error('Speech synthesis not supported'))
      return
    }

    loadVoices().then((voices) => {
      speechSynth.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = preset.pitch
      utterance.lang = 'en-US'

      const voice = pickVoice(voices, style === 'narration')
      if (voice) utterance.voice = voice

      utterance.onend = () => resolve()
      utterance.onerror = (e) => reject(e)
      speechSynth.speak(utterance)
    })
  })
}

export function speakNarration(text: string, force = false): Promise<void> {
  return speak(text, { style: 'narration', force })
}

export function stopSpeaking(): void {
  activeSpeakId++
  getSynth()?.cancel()
  stopCloudAudio()
  unduckBgm()
}

export { isCloudTtsAvailable }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionCtor = new () => any

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const w = window as unknown as Record<string, SpeechRecognitionCtor>
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognition() !== null
}

export const CHALLENGE_PREP_MS = 3000
export const CHALLENGE_LISTEN_MS = 5000

const RECOVERABLE_SPEECH_ERRORS = new Set([
  'no-speech',
  'aborted',
  'network',
  'audio-capture',
])

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Waits for prepMs (get-ready time), then listens for the full listenMs window.
 * Never ends early — kids always get the full window to speak.
 */
export async function listenForSpeechWithPrep(
  listenMs = CHALLENGE_LISTEN_MS,
  prepMs = CHALLENGE_PREP_MS,
  onPhase?: (phase: 'prep' | 'listening', secondsLeft: number) => void
): Promise<string> {
  if (prepMs > 0) {
    const prepSeconds = Math.ceil(prepMs / 1000)
    for (let s = prepSeconds; s >= 1; s--) {
      onPhase?.('prep', s)
      await delay(1000)
    }
  }

  onPhase?.('listening', Math.ceil(listenMs / 1000))
  return listenForSpeech(listenMs, onPhase)
}

export function listenForSpeech(
  timeoutMs = CHALLENGE_LISTEN_MS,
  onTick?: (phase: 'prep' | 'listening', secondsLeft: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const Recognition = getSpeechRecognition()
    if (!Recognition) {
      reject(new Error('Speech recognition not supported in this browser'))
      return
    }

    let settled = false
    let finalTranscript = ''
    let interimTranscript = ''
    let activeRecognition: InstanceType<SpeechRecognitionCtor> | null = null
    let finishTimer: ReturnType<typeof setTimeout> | null = null
    let tickTimer: ReturnType<typeof setInterval> | null = null
    const sessionStart = Date.now()
    const deadline = sessionStart + timeoutMs

    const getSpoken = () => `${finalTranscript}${interimTranscript}`.trim()

    const clearTimers = () => {
      if (finishTimer) clearTimeout(finishTimer)
      if (tickTimer) clearInterval(tickTimer)
      finishTimer = null
      tickTimer = null
    }

    const stopActive = () => {
      if (!activeRecognition) return
      try {
        activeRecognition.onresult = null
        activeRecognition.onerror = null
        activeRecognition.onend = null
        activeRecognition.stop()
      } catch {
        // ignore
      }
      activeRecognition = null
    }

    const finish = () => {
      if (settled) return
      settled = true
      clearTimers()
      stopActive()

      const spoken = getSpoken()
      if (spoken) resolve(spoken)
      else reject(new Error('No speech detected — try again!'))
    }

    const timeLeft = () => Math.max(0, deadline - Date.now())

    const scheduleRestart = () => {
      if (settled || timeLeft() < 250) return
      setTimeout(startRecognition, 200)
    }

    const startRecognition = () => {
      if (settled || timeLeft() < 250) return

      stopActive()

      const recognition = new Recognition()
      activeRecognition = recognition
      recognition.lang = 'en-US'
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 3

      recognition.onresult = (event: {
        results: {
          length: number
          [index: number]: {
            isFinal: boolean
            [index: number]: { transcript: string }
          }
        }
      }) => {
        interimTranscript = ''
        for (let i = 0; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += `${piece} `
          } else {
            interimTranscript += piece
          }
        }
      }

      recognition.onerror = (event: { error: string }) => {
        if (settled) return

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          settled = true
          clearTimers()
          stopActive()
          reject(new Error('Microphone blocked — please allow mic access! 🎤'))
          return
        }

        if (RECOVERABLE_SPEECH_ERRORS.has(event.error)) {
          scheduleRestart()
        }
      }

      recognition.onend = () => {
        if (settled) return
        scheduleRestart()
      }

      try {
        recognition.start()
      } catch {
        scheduleRestart()
      }
    }

    finishTimer = setTimeout(finish, timeoutMs)

    tickTimer = setInterval(() => {
      const ms = timeLeft()
      const seconds = Math.max(1, Math.ceil(ms / 1000))
      onTick?.('listening', seconds)
      if (ms <= 0) finish()
    }, 200)

    startRecognition()
  })
}

export function comparePronunciation(expected: string, spoken: string): {
  score: number
  passed: boolean
  feedback: string
} {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z\s]/g, '').trim()

  const expectedNorm = normalize(expected)
  const spokenNorm = normalize(spoken)

  if (expectedNorm === spokenNorm) {
    return { score: 100, passed: true, feedback: 'Perfect! Amazing pronunciation! 🌟' }
  }

  if (spokenNorm.includes(expectedNorm) || expectedNorm.includes(spokenNorm)) {
    return { score: 85, passed: true, feedback: 'Great job! Almost perfect! ⭐' }
  }

  const expectedWords = expectedNorm.split(/\s+/)
  const spokenWords = spokenNorm.split(/\s+/)
  let matches = 0
  for (const word of expectedWords) {
    if (spokenWords.some((sw) => sw === word || levenshtein(sw, word) <= 1)) {
      matches++
    }
  }

  const score = Math.round((matches / expectedWords.length) * 100)

  if (score >= 60) {
    return { score, passed: true, feedback: 'Good try! Keep practicing! 👍' }
  }
  return { score, passed: false, feedback: `Try again! Say "${expected}" clearly. 💪` }
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : 1 + Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j])
    }
  }
  return matrix[b.length][a.length]
}
