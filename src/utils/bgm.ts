/** Cute looping BGM — soft marimba melody + gentle pads (Web Audio, no external file). */

let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
let musicGain: GainNode | null = null
let playing = false
let tickTimer: ReturnType<typeof setInterval> | null = null
let step = 0
let duckCount = 0

const BPM = 104
const BEAT_SEC = 60 / BPM
const BASE_VOLUME = 0.2

/** I – V – vi – IV (bright, kid-friendly) */
const CHORDS: number[][] = [
  [261.63, 329.63, 392.0],
  [392.0, 493.88, 587.33],
  [220.0, 261.63, 329.63],
  [349.23, 440.0, 523.25],
]

/** C-major pentatonic melody */
const MELODY = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.0, 440.0, 523.25]

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  return audioCtx
}

function ensureAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioCtx) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
    masterGain = audioCtx.createGain()
    musicGain = audioCtx.createGain()
    masterGain.gain.value = BASE_VOLUME
    musicGain.gain.value = 1
    musicGain.connect(masterGain)
    masterGain.connect(audioCtx.destination)
  }

  if (audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }

  return audioCtx
}

function playPluck(freq: number, time: number, volume = 0.35) {
  const ctx = getCtx()
  if (!ctx || !musicGain) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
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
  const ctx = getCtx()
  if (!ctx || !musicGain) return

  for (const freq of chord) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
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
  const ctx = getCtx()
  if (!ctx || !musicGain) return

  const bufferSize = ctx.sampleRate * 0.04
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }

  const source = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  source.buffer = buffer
  filter.type = 'highpass'
  filter.frequency.value = 7000
  gain.gain.value = 0.035

  source.connect(filter)
  filter.connect(gain)
  gain.connect(musicGain)
  source.start(time)
}

function tick() {
  const ctx = getCtx()
  if (!ctx || !playing) return

  const now = ctx.currentTime + 0.05
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

export function isBgmPlaying(): boolean {
  return playing
}

export function startBgm(): boolean {
  if (playing) return true
  if (!ensureAudio()) return false

  playing = true
  step = 0
  tickTimer = setInterval(tick, (BEAT_SEC * 1000) / 2)
  return true
}

export function stopBgm(): void {
  playing = false
  if (tickTimer) {
    clearInterval(tickTimer)
    tickTimer = null
  }
}

export function setBgmAudible(audible: boolean): void {
  if (!masterGain || !audioCtx) return
  masterGain.gain.setTargetAtTime(audible ? BASE_VOLUME : 0, audioCtx.currentTime, 0.08)
}

export function duckBgm(): void {
  duckCount++
  const ctx = getCtx()
  if (!ctx || !musicGain) return
  musicGain.gain.setTargetAtTime(0.18, ctx.currentTime, 0.12)
}

export function unduckBgm(): void {
  duckCount = Math.max(0, duckCount - 1)
  const ctx = getCtx()
  if (!ctx || !musicGain || duckCount > 0) return
  musicGain.gain.setTargetAtTime(1, ctx.currentTime, 0.2)
}

/** Call once from a user gesture so browsers allow audio. */
export function unlockBgmAudio(): void {
  ensureAudio()
}
