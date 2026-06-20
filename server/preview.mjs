import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { loadAppEnv } from './env.mjs'
import { createTtsHandler } from './elevenlabs.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '..')
const dist = join(root, 'dist')
const env = loadAppEnv(root)
const port = Number(process.env.PORT ?? 4173)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

const handleTts = createTtsHandler(env)

async function serveStatic(pathname) {
  const safePath = pathname === '/' ? '/index.html' : pathname
  const filePath = join(dist, safePath)

  if (!filePath.startsWith(dist)) {
    return null
  }

  try {
    const data = await readFile(filePath)
    const ext = extname(filePath)
    return { data, type: MIME[ext] ?? 'application/octet-stream' }
  } catch {
    if (!extname(safePath)) {
      try {
        const data = await readFile(join(dist, 'index.html'))
        return { data, type: MIME['.html'] }
      } catch {
        return null
      }
    }
    return null
  }
}

createServer(async (req, res) => {
  const url = req.url ?? '/'

  if (url.startsWith('/api/tts')) {
    await handleTts(req, res)
    return
  }

  const asset = await serveStatic(url.split('?')[0])
  if (!asset) {
    res.writeHead(404)
    res.end('Not found')
    return
  }

  res.writeHead(200, { 'Content-Type': asset.type })
  res.end(asset.data)
}).listen(port, '0.0.0.0', () => {
  const ttsReady = Boolean(env.ELEVENLABS_API_KEY?.trim())
  console.log(`BB8 English running on port ${port}`)
  console.log(`Voice: ${ttsReady ? 'ElevenLabs ✨' : 'Browser fallback (set ELEVENLABS_API_KEY)'}`)
})
