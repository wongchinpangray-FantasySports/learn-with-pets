import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createTtsMiddleware } from './server/elevenlabs.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'elevenlabs-tts-api',
        configureServer(server) {
          server.middlewares.use(createTtsMiddleware(env))
        },
      },
    ],
  }
})
