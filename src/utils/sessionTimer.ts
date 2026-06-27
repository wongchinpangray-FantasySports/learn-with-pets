/** Max time a learner can stay in the app per session (from first open). */
export const SESSION_LIMIT_MS = 30 * 60 * 1000

const SESSION_START_KEY = 'bb8-session-start'

export function getSessionStartAt(): number {
  if (typeof sessionStorage === 'undefined') return Date.now()

  const stored = sessionStorage.getItem(SESSION_START_KEY)
  if (stored) {
    const parsed = Number(stored)
    if (!Number.isNaN(parsed)) return parsed
  }

  const now = Date.now()
  sessionStorage.setItem(SESSION_START_KEY, String(now))
  return now
}

export function getSessionRemainingMs(): number {
  const elapsed = Date.now() - getSessionStartAt()
  return Math.max(0, SESSION_LIMIT_MS - elapsed)
}

export function isSessionExpired(): boolean {
  return getSessionRemainingMs() <= 0
}
