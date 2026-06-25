/**
 * Background music: uses `public/audio/bgm.mp3` when present, else a built-in cute synth loop.
 * MP3 volume is controlled via Web Audio GainNode (required on iOS — HTMLAudioElement.volume is ignored).
 */

const BGM_MP3_PATH = '/audio/bgm.mp3'
export const DEFAULT_BGM_VOLUME = 0.28
const DUCK_RATIO = 0.18

let volumeLevel = DEFAULT_BGM_VOLUME

type BgmMode = 'mp3' | 'synth' | null

let bgmMode: BgmMode = null
let playing = false
let userAudible = true
let duckCount = 0

/** Shared Web Audio graph: sources → musicGain (duck) → masterGain (volume/mute) → output */
let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
let musicGain: GainNode | null = null

/** --- MP3 player --- */
let audioEl: HTMLAudioElement | null = null
let mp3MediaConnected = false
let mp3State: 'idle' | 'loading' | 'ready' | 'missing' = 'idle'
let mp3LoadPromise: Promise<boolean> | null = null

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

  if (audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }

  return audioCtx
}

function resumeAudioContext(): void {
  if (audioCtx?.state === 'suspended') {
    void audioCtx.resume()
  }
}

function applyMasterVolume(): void {
  if (!masterGain || !audioCtx) return
  resumeAudioContext()
  masterGain.gain.setTargetAtTime(
    userAudible ? volumeLevel : 0,
    audioCtx.currentTime,
    0.05
  )
}

function applyDuckVolume(): void {
  if (!musicGain || !audioCtx) return
  resumeAudioContext()
  musicGain.gain.setTargetAtTime(
    duckCount > 0 ? DUCK_RATIO : 1,
    audioCtx.currentTime,
    duckCount > 0 ? 0.12 : 0.2
  )
}

/** Fallback when MediaElementSource is unavailable (desktop-only path). */
function applyMp3VolumeFallback(): void {
  if (!audioEl || mp3MediaConnected) return
  audioEl.volume = userAudible
    ? duckCount > 0
      ? volumeLevel * DUCK_RATIO
      : volumeLevel
    : 0
}

function connectMp3ToAudioGraph(): void {
  if (mp3MediaConnected || !audioEl) return
  if (!ensureAudioContext() || !musicGain) return

  try {
    const source = audioCtx!.createMediaElementSource(audioEl)
    source.connect(musicGain)
    mp3MediaConnected = true
    audioEl.volume = 1
    applyMasterVolume()
    applyDuckVolume()
  } catch {
    mp3MediaConnected = false
  }
}

function loadMp3(): Promise<boolean> {
  if (mp3State === 'ready') return Promise.resolve(true)
  if (mp3State === 'missing') return Promise.resolve(false)
  if (mp3LoadPromise) return mp3LoadPromise

  mp3LoadPromise = new Promise((resolve) => {
    mp3State = 'loading'
    const audio = new Audio(BGM_MP3_PATH)
    audio.loop = true
    audio.preload = 'auto'
    audio.setAttribute('playsinline', 'true')

    const finish = (ok: boolean) => {
      mp3State = ok ? 'ready' : 'missing'
      if (ok) {
        audioEl = audio
        connectMp3ToAudioGraph()
        if (!mp3MediaConnected) applyMp3VolumeFallback()
      }
      mp3LoadPromise = null
      resolve(ok)
    }

    audio.addEventListener('canplaythrough', () => finish(true), { once: true })
    audio.addEventListener('error', () => finish(false), { once: true })
    audio.load()
  })

  return mp3LoadPromise
}

async function startMp3(): Promise<boolean> {
  const ok = await loadMp3()
  if (!ok || !audioEl) return false

  ensureAudioContext()
  connectMp3ToAudioGraph()
  applyMasterVolume()
  applyDuckVolume()
  if (!mp3MediaConnected) applyMp3VolumeFallback()

  bgmMode = 'mp3'
  playing = true

  try {
    resumeAudioContext()
    await audioEl.play()
    return true
  } catch {
    playing = false
    bgmMode = null
    return false
  }
}

function stopMp3(): void {
  if (!audioEl) return
  audioEl.pause()
  audioEl.currentTime = 0
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
  if (!audioCtx || !playing || bgmMode !== 'synth') return
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
  if (!ensureAudioContext()) return false
  applyMasterVolume()
  applyDuckVolume()
  bgmMode = 'synth'
  playing = true
  step = 0
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
  if (playing) return

  const mp3Ok = await startMp3()
  if (mp3Ok) return

  startSynth()
}

/** --- Public API --- */

export function isBgmPlaying(): boolean {
  return playing
}

export function usesMp3Bgm(): boolean {
  return bgmMode === 'mp3'
}

export function startBgm(): boolean {
  if (playing) return true
  void beginBgm()
  return true
}

export function stopBgm(): void {
  playing = false
  stopMp3()
  stopSynth()
  bgmMode = null
}

export function getBgmVolume(): number {
  return volumeLevel
}

export function setBgmVolume(level: number): void {
  volumeLevel = Math.max(0, Math.min(1, level))
  applyMasterVolume()
  if (bgmMode === 'mp3' && !mp3MediaConnected) {
    applyMp3VolumeFallback()
  }
}

export function setBgmAudible(audible: boolean): void {
  userAudible = audible
  applyMasterVolume()
  if (bgmMode === 'mp3' && !mp3MediaConnected) {
    applyMp3VolumeFallback()
  }
}

export function duckBgm(): void {
  duckCount++
  applyDuckVolume()
  if (bgmMode === 'mp3' && !mp3MediaConnected) {
    applyMp3VolumeFallback()
  }
}

export function unduckBgm(): void {
  duckCount = Math.max(0, duckCount - 1)
  applyDuckVolume()
  if (bgmMode === 'mp3' && !mp3MediaConnected) {
    applyMp3VolumeFallback()
  }
}

export function unlockBgmAudio(): void {
  ensureAudioContext()
  void loadMp3().then((ok) => {
    if (ok) {
      connectMp3ToAudioGraph()
      applyMasterVolume()
    }
  })
}
