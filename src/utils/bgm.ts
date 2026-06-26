/**
 * Background music: decodes `public/audio/bgm.mp3` and plays via Web Audio (works on iOS).
 * Falls back to a built-in synth loop if the MP3 is missing.
 */

const BGM_MP3_PATH = '/audio/bgm.mp3'
export const DEFAULT_BGM_VOLUME = 0.28
const DUCK_RATIO = 0.18

let volumeLevel = DEFAULT_BGM_VOLUME

type BgmMode = 'mp3' | 'synth' | null

let bgmMode: BgmMode = null
/** User has started BGM (may be muted via userAudible). */
let playing = false
let userAudible = true
let duckCount = 0

let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
let musicGain: GainNode | null = null

/** --- MP3 via decoded buffer (reliable volume/mute on mobile) --- */
let mp3Buffer: AudioBuffer | null = null
let mp3BufferSource: AudioBufferSourceNode | null = null
let mp3State: 'idle' | 'loading' | 'ready' | 'missing' = 'idle'
let mp3LoadPromise: Promise<boolean> | null = null
/** Invalidates in-flight MP3 starts so only one source can play. */
let mp3StartGeneration = 0
let beginBgmInFlight: Promise<void> | null = null
let syncMp3InFlight: Promise<void> | null = null

function ensureAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioCtx) {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
    masterGain = audioCtx.createGain()
    musicGain = audioCtx.createGain()
    masterGain.gain.value = userAudible ? volumeLevel : 0
    musicGain.gain.value = duckCount > 0 ? DUCK_RATIO : 1
    musicGain.connect(masterGain)
    masterGain.connect(audioCtx.destination)
  }

  return audioCtx
}

async function resumeAudioContext(): Promise<void> {
  if (audioCtx?.state === 'suspended') {
    try {
      await audioCtx.resume()
    } catch {
      /* ignore */
    }
  }
}

function applyMasterVolume(): void {
  if (!masterGain || !audioCtx) return
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime)
  masterGain.gain.value = userAudible ? volumeLevel : 0
}

function applyDuckVolume(): void {
  if (!musicGain || !audioCtx) return
  musicGain.gain.cancelScheduledValues(audioCtx.currentTime)
  musicGain.gain.value = duckCount > 0 ? DUCK_RATIO : 1
}

function disposeMp3Source(source: AudioBufferSourceNode): void {
  try {
    source.stop()
  } catch {
    /* already stopped */
  }
  try {
    source.disconnect()
  } catch {
    /* ignore */
  }
}

function stopMp3Source(): void {
  mp3StartGeneration++
  if (mp3BufferSource) {
    disposeMp3Source(mp3BufferSource)
    mp3BufferSource = null
  }
}

async function loadMp3Buffer(): Promise<boolean> {
  if (mp3Buffer) return true
  if (mp3State === 'missing') return false
  if (mp3LoadPromise) return mp3LoadPromise

  mp3LoadPromise = (async () => {
    try {
      const ctx = ensureAudioContext()
      if (!ctx) {
        mp3State = 'missing'
        return false
      }
      await resumeAudioContext()

      const res = await fetch(BGM_MP3_PATH)
      if (!res.ok) {
        mp3State = 'missing'
        return false
      }

      const data = await res.arrayBuffer()
      mp3Buffer = await ctx.decodeAudioData(data)
      mp3State = 'ready'
      return true
    } catch {
      mp3State = 'missing'
      return false
    } finally {
      mp3LoadPromise = null
    }
  })()

  return mp3LoadPromise
}

async function startMp3Source(): Promise<boolean> {
  if (!mp3Buffer || !audioCtx || !musicGain) return false

  stopMp3Source()
  const gen = mp3StartGeneration

  if (!userAudible) return true

  const source = audioCtx.createBufferSource()
  source.buffer = mp3Buffer
  source.loop = true
  source.connect(musicGain)

  try {
    await resumeAudioContext()
    if (gen !== mp3StartGeneration) {
      disposeMp3Source(source)
      return false
    }
    source.start(0)
    if (gen !== mp3StartGeneration) {
      disposeMp3Source(source)
      return false
    }
    mp3BufferSource = source
    return true
  } catch {
    disposeMp3Source(source)
    return false
  }
}

async function syncMp3Playback(): Promise<void> {
  if (bgmMode !== 'mp3' || !playing) return
  if (syncMp3InFlight) return syncMp3InFlight

  syncMp3InFlight = (async () => {
    try {
      applyMasterVolume()

      if (!userAudible) {
        stopMp3Source()
        return
      }

      if (!mp3BufferSource && mp3Buffer) {
        await startMp3Source()
      }
    } finally {
      syncMp3InFlight = null
    }
  })()

  return syncMp3InFlight
}

async function startMp3(): Promise<boolean> {
  stopSynth()

  const ok = await loadMp3Buffer()
  if (!ok || !mp3Buffer) return false

  ensureAudioContext()
  applyMasterVolume()
  applyDuckVolume()

  bgmMode = 'mp3'
  playing = true

  await syncMp3Playback()
  return mp3BufferSource !== null || !userAudible
}

function stopMp3(): void {
  stopMp3Source()
}

/** --- Synth fallback --- */
let tickTimer: ReturnType<typeof setInterval> | null = null
let step = 0

const BPM = 104
const BEAT_SEC = 60 / BPM

const CHORDS: number[][] = [
  [261.63, 329.63, 392.0],
  [392.0, 493.88, 587.33],
  [220.0, 261.63, 329.63],
  [349.23, 440.0, 523.25],
]

const MELODY = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.0, 440.0, 523.25]

function playPluck(freq: number, time: number, volume = 0.35) {
  if (!audioCtx || !musicGain) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.025)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.38)
  osc.connect(gain)
  gain.connect(musicGain)
  osc.start(time)
  osc.stop(time + 0.45)
}

function playPad(chord: number[], time: number, duration: number) {
  if (!audioCtx || !musicGain) return
  for (const freq of chord) {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq / 2
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.linearRampToValueAtTime(0.07, time + 0.35)
    gain.gain.setValueAtTime(0.07, time + duration - 0.4)
    gain.gain.linearRampToValueAtTime(0.0001, time + duration)
    osc.connect(gain)
    gain.connect(musicGain)
    osc.start(time)
    osc.stop(time + duration + 0.05)
  }
}

function playShaker(time: number) {
  if (!audioCtx || !musicGain) return
  const bufferSize = audioCtx.sampleRate * 0.04
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  const source = audioCtx.createBufferSource()
  const filter = audioCtx.createBiquadFilter()
  const gain = audioCtx.createGain()
  source.buffer = buffer
  filter.type = 'highpass'
  filter.frequency.value = 7000
  gain.gain.value = 0.035
  source.connect(filter)
  filter.connect(gain)
  gain.connect(musicGain)
  source.start(time)
}

function synthTick() {
  if (!audioCtx || !playing || bgmMode !== 'synth' || !userAudible) return
  const now = audioCtx.currentTime + 0.05
  const beatInBar = step % 8
  const bar = Math.floor(step / 8)
  if (beatInBar === 0) {
    playPad(CHORDS[bar % CHORDS.length], now, BEAT_SEC * 8)
  }
  if (beatInBar % 2 === 0) {
    const note = MELODY[(Math.floor(step / 2) + bar) % MELODY.length]
    playPluck(note, now, beatInBar === 0 ? 0.32 : 0.22)
  }
  if (beatInBar % 4 === 2) {
    playShaker(now)
  }
  step++
}

function startSynth(): boolean {
  stopMp3()
  if (!ensureAudioContext()) return false
  applyMasterVolume()
  applyDuckVolume()
  bgmMode = 'synth'
  playing = true
  step = 0
  if (tickTimer) clearInterval(tickTimer)
  tickTimer = setInterval(synthTick, (BEAT_SEC * 1000) / 2)
  return true
}

function stopSynth(): void {
  if (tickTimer) {
    clearInterval(tickTimer)
    tickTimer = null
  }
}

async function beginBgm(): Promise<void> {
  if (beginBgmInFlight) return beginBgmInFlight

  beginBgmInFlight = (async () => {
    try {
      if (playing) {
        await syncMp3Playback()
        return
      }

      const mp3Ok = await startMp3()
      if (mp3Ok) return

      startSynth()
    } finally {
      beginBgmInFlight = null
    }
  })()

  return beginBgmInFlight
}

/** --- Public API --- */

export function isBgmPlaying(): boolean {
  return playing && userAudible && (mp3BufferSource !== null || bgmMode === 'synth')
}

export function isBgmActive(): boolean {
  return playing
}

export function usesMp3Bgm(): boolean {
  return bgmMode === 'mp3'
}

export function startBgm(): boolean {
  void beginBgm()
  return true
}

export function stopBgm(): void {
  playing = false
  userAudible = true
  mp3StartGeneration++
  stopMp3()
  stopSynth()
  bgmMode = null
  beginBgmInFlight = null
  syncMp3InFlight = null
}

export function getBgmVolume(): number {
  return volumeLevel
}

export function setBgmVolume(level: number): void {
  volumeLevel = Math.max(0, Math.min(1, level))
  applyMasterVolume()
}

export function setBgmAudible(audible: boolean): void {
  userAudible = audible
  applyMasterVolume()
  applyDuckVolume()
  void syncMp3Playback()
}

export function duckBgm(): void {
  duckCount++
  applyDuckVolume()
}

export function unduckBgm(): void {
  duckCount = Math.max(0, duckCount - 1)
  applyDuckVolume()
}

export function unlockBgmAudio(): void {
  ensureAudioContext()
  void resumeAudioContext()
  void loadMp3Buffer()
}
