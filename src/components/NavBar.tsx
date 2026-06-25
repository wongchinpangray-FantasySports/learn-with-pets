import { Screen } from '../types'
import { VoiceBadge } from './VoiceBadge'
import { BgmToggle } from './BgmToggle'

interface NavBarProps {
  current: Screen
  onNavigate: (screen: Screen) => void
}

const NAV_ITEMS: { screen: Screen; emoji: string; label: string }[] = [
  { screen: 'home', emoji: '🏠', label: 'Home' },
  { screen: 'learn', emoji: '📚', label: 'Learn' },
  { screen: 'practice', emoji: '🎤', label: 'Practice' },
  { screen: 'pet', emoji: '🐾', label: 'Pet' },
  { screen: 'shop', emoji: '🛍️', label: 'Shop' },
  { screen: 'me', emoji: '👤', label: 'Me' },
]

export function NavBar({ current, onNavigate }: NavBarProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-4 border-sky shadow-lg z-50"
      style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
      aria-label="Main navigation"
    >
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center px-2 pt-1 pb-0.5">
          <BgmToggle />
          <VoiceBadge />
        </div>
        <div className="grid grid-cols-6 gap-0 px-1 pb-1">
          {NAV_ITEMS.map(({ screen, emoji, label }) => {
            const active = current === screen
            return (
              <button
                key={screen}
                onClick={() => onNavigate(screen)}
                className={`
                  flex flex-col items-center justify-center gap-0 rounded-xl transition-all
                  font-kid font-semibold text-[10px] leading-none py-1.5 min-h-[3rem]
                  ${active
                    ? 'bg-sky/20 text-teal-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span className={`text-xl leading-none ${active ? 'scale-110' : ''}`}>{emoji}</span>
                <span className="mt-0.5">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
