/**
 * Background music: uses `public/audio/bgm.mp3` when present, else a built-in cute synth loop.
 * See public/audio/README.md for how to add a royalty-free MP3.
 */

const BGM_MP3_PATH = '/audio/bgm.mp3'
const BASE_VOLUME = 0.28
const DUCK_RATIO = 0.18

type BgmMode = 'mp3' | 'synth' | null

let bgmMode: BgmMode = null
let playing = false
let userAudible = true
let duckCount = 0

/** --- MP3 player --- */
let audioEl: HTMLAudioElement | null = null
let mp3State: 'idle' | 'loading' | 'ready' | 'missing' = 'idle'
let mp3LoadPromise: Promise<boolean> | null = null

function applyMp3Volume(): void {
  if (!audioEl) return
  if (!userAudible) {
    audioEl.volume = 0
    return
  }
  audioEl.volume = duckCount > 0 ? BASE_VOLUME * DUCK_RATIO : BASE_VOLUME
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

    const finish = (ok: boolean) => {
      mp3State = ok ? 'ready' : 'missing'
      if (ok) {
        audioEl = audio
        applyMp3Volume()
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
  bgmMode = 'mp3'
  playing = true
  applyMp3Volume()
  try {
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
let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
let musicGain: GainNode | null = null
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

function ensureSynthContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioCtx) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
    masterGain = audioCtx.createGain()
    musicGain = audioCtx.createGain()
    masterGain.gain.value = userAudible ? BASE_VOLUME : 0
    musicGain.gain.value = duckCount > 0 ? DUCK_RATIO : 1
    musicGain.connect(masterGain)
    masterGain.connect(audioCtx.destination)
  }

  if (audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }

  return audioCtx
}

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
  if (!ensureSynthContext()) return false
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

/** --- Public API (unchanged for the rest of the app) --- */

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

export function setBgmAudible(audible: boolean): void {
  userAudible = audible

  if (bgmMode === 'mp3') {
    applyMp3Volume()
    return
  }

  if (masterGain && audioCtx) {
    masterGain.gain.setTargetAtTime(audible ? BASE_VOLUME : 0, audioCtx.currentTime, 0.08)
  }
}

export function duckBgm(): void {
  duckCount++
  if (bgmMode === 'mp3') {
    applyMp3Volume()
    return
  }
  if (audioCtx && musicGain) {
    musicGain.gain.setTargetAtTime(DUCK_RATIO, audioCtx.currentTime, 0.12)
  }
}

export function unduckBgm(): void {
  duckCount = Math.max(0, duckCount - 1)
  if (bgmMode === 'mp3') {
    applyMp3Volume()
    return
  }
  if (audioCtx && musicGain && duckCount === 0) {
    musicGain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.2)
  }
}

export function unlockBgmAudio(): void {
  ensureSynthContext()
  void loadMp3()
}
