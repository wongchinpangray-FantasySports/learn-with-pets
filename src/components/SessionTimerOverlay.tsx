import { getPetById } from '../data/content'
import type { PetType } from '../types'

interface SessionTimerOverlayProps {
  selectedPet: PetType | null
}

/** Full-screen gentle reminder when the 30-minute session limit is reached. */
export function SessionTimerOverlay({ selectedPet }: SessionTimerOverlayProps) {
  const pet = selectedPet ? getPetById(selectedPet) : null
  const petEmoji = pet?.emoji ?? '🐾'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-b from-indigo-900/75 via-purple-900/80 to-pink-900/75 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-break-title"
    >
      <div className="animate-pop w-full max-w-md rounded-3xl border-4 border-white/40 bg-gradient-to-b from-white to-sky-light p-8 text-center shadow-2xl">
        <div className="mb-4 text-7xl animate-float" aria-hidden="true">
          {petEmoji} 🌙
        </div>

        <h2
          id="session-break-title"
          className="font-kid mb-3 text-3xl font-bold text-grape"
        >
          Time for a cozy break!
        </h2>

        <p className="font-kid mb-2 text-lg leading-relaxed text-gray-700">
          Hi superstar! You and {pet?.name ?? 'your pet friend'} did so much learning
          today. Even the bounciest pets need rest — and so do you!
        </p>

        <p className="font-kid mb-6 text-lg font-semibold text-berry">
          See you next time! 💤✨
        </p>

        <div className="rounded-2xl bg-white/80 px-4 py-3 text-left">
          <p className="font-kid text-sm leading-relaxed text-gray-600">
            <span className="font-semibold text-gray-700">Grown-ups:</span> 30 minutes
            of screen time is up. A little break helps eyes and brains stay happy and
            healthy.
          </p>
        </div>
      </div>
    </div>
  )
}
