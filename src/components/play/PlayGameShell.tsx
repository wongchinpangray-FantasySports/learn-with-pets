import { ReactNode } from 'react'
import { BigButton } from '../BigButton'

interface PlayGameShellProps {
  title: string
  emoji: string
  onBack: () => void
  children: ReactNode
  hint?: string
}

export function PlayGameShell({ title, emoji, onBack, children, hint }: PlayGameShellProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-gradient-to-b from-sky-light to-white flex flex-col">
      <div
        className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 pt-4 overflow-y-auto"
        style={{ paddingBottom: 'calc(7.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={onBack}
            className="font-kid text-sm font-semibold text-grape bg-white border-2 border-purple-100 rounded-xl px-3 py-2 active:scale-95"
          >
            ← Back
          </button>
          <h2 className="font-kid text-xl font-bold text-gray-800">
            {emoji} {title}
          </h2>
        </div>

        {hint && (
          <p className="font-kid text-sm text-gray-500 text-center mb-4">{hint}</p>
        )}

        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  )
}

interface PlayGameResultProps {
  message: string
  happinessGain: number
  onDone: () => void
}

export function PlayGameResult({ message, happinessGain, onDone }: PlayGameResultProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center animate-pop">
      <p className="font-kid text-3xl mb-3">{message}</p>
      <p className="font-kid text-lg text-berry font-semibold mb-6">
        +{happinessGain} happiness 😊
      </p>
      <BigButton onClick={onDone} variant="success" size="lg">
        Done!
      </BigButton>
    </div>
  )
}
