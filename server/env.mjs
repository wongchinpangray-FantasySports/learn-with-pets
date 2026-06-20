import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

/**
 * Load env for production server. process.env (hosting platform) overrides .env file.
 * Does not depend on Vite, so `node server/preview.mjs` works after a production install.
 */
export function loadAppEnv(root) {
  /** @type {Record<string, string>} */
  const env = {}

  const envPath = join(root, '.env')
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      env[key] = value
    }
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      env[key] = value
    }
  }

  return env
}
