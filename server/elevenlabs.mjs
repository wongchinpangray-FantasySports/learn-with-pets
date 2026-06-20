/** ElevenLabs voice IDs — kid-friendly premade voices */
export const VOICES = {
  /** Playful, bright, warm — pet narrator & lessons */
  narration: 'cgSgspJ2msm6clMCkdW9', // Jessica
  /** Clear, steady — single vocabulary words */
  word: 'EXAVITQu4vr4xnSDxMaL', // Bella
}

export const MODEL_ID = 'eleven_turbo_v2_5'

const STYLE_SETTINGS = {
  narration: {
    stability: 0.42,
    similarity_boost: 0.85,
    style: 0.72,
    use_speaker_boost: true,
  },
  word: {
    stability: 0.65,
    similarity_boost: 0.8,
    style: 0.35,
    use_speaker_boost: true,
  },
}

/**
 * @param {Record<string, string>} env
 */
export function isElevenLabsConfigured(env) {
  return Boolean(env.ELEVENLABS_API_KEY?.trim())
}

/**
 * @param {Record<string, string>} env
 * @param {string} text
 * @param {'narration' | 'word'} style
 */
export async function synthesizeSpeech(env, text, style = 'narration') {
  const apiKey = env.ELEVENLABS_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured')
  }

  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('Text is required')
  }

  const voiceId =
    style === 'word'
      ? env.ELEVENLABS_WORD_VOICE_ID?.trim() || VOICES.word
      : env.ELEVENLABS_NARRATION_VOICE_ID?.trim() || VOICES.narration

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: trimmed,
        model_id: env.ELEVENLABS_MODEL_ID?.trim() || MODEL_ID,
        voice_settings: STYLE_SETTINGS[style] ?? STYLE_SETTINGS.narration,
      }),
    }
  )

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`ElevenLabs error ${response.status}: ${detail}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

/**
 * @param {import('http').IncomingMessage} req
 */
async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

/**
 * @param {Record<string, string>} env
 */
export function createTtsHandler(env) {
  const enabled = isElevenLabsConfigured(env)

  return async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const url = req.url ?? ''

    if (req.method === 'GET' && url.startsWith('/api/tts/status')) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          enabled,
          provider: enabled ? 'elevenlabs' : 'browser',
        })
      )
      return
    }

    if (req.method === 'POST' && url.startsWith('/api/tts')) {
      if (!enabled) {
        res.writeHead(503, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'ElevenLabs not configured' }))
        return
      }

      try {
        const body = await readJsonBody(req)
        const style = body.style === 'word' ? 'word' : 'narration'
        const audio = await synthesizeSpeech(env, body.text ?? '', style)

        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-store',
        })
        res.end(audio)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'TTS failed'
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: message }))
      }
      return
    }

    res.writeHead(404)
    res.end('Not found')
  }
}

/**
 * Connect-style middleware for Vite dev server.
 * @param {Record<string, string>} env
 */
export function createTtsMiddleware(env) {
  const handler = createTtsHandler(env)

  return (req, res, next) => {
    const url = req.url ?? ''
    if (url.startsWith('/api/tts')) {
      handler(req, res)
      return
    }
    next()
  }
}
