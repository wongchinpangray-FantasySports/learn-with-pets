import { useState } from 'react'
import { BigButton } from '../components/BigButton'
import { PETS } from '../data/content'
import { useGameStore } from '../store/gameStore'
import type { PetType } from '../types'

export function OnboardingScreen() {
  const { setPlayerName, selectPet, completeOnboarding } = useGameStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [chosenPet, setChosenPet] = useState<PetType | null>(null)

  const handleFinish = () => {
    if (!name.trim() || !chosenPet) return
    setPlayerName(name.trim())
    selectPet(chosenPet)
    completeOnboarding()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-light via-purple-50 to-pink-50 flex flex-col items-center justify-center p-6">
      {step === 0 && (
        <div className="text-center animate-pop max-w-md">
          <div className="text-8xl mb-4 animate-bounceSlow">🐾</div>
          <h1 className="font-kid text-4xl font-bold text-grape mb-3">
            BB8 English!
          </h1>
          <p className="font-kid text-xl text-gray-600 mb-8">
            Learn English with your very own pet friend!
          </p>
          <BigButton onClick={() => setStep(1)} size="xl">
            Let's Go! 🚀
          </BigButton>
        </div>
      )}

      {step === 1 && (
        <div className="text-center animate-pop max-w-md w-full">
          <h2 className="font-kid text-3xl font-bold text-grape mb-2">
            What's your name?
          </h2>
          <p className="font-kid text-lg text-gray-500 mb-6">
            Your pet wants to know you!
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name..."
            maxLength={20}
            className="
              w-full text-center text-2xl font-kid font-semibold
              px-6 py-4 rounded-2xl border-4 border-sky
              focus:outline-none focus:border-berry mb-6
              bg-white shadow-lg
            "
            autoFocus
          />
          <BigButton
            onClick={() => setStep(2)}
            disabled={!name.trim()}
            size="xl"
          >
            Next ➡️
          </BigButton>
        </div>
      )}

      {step === 2 && (
        <div className="text-center animate-pop max-w-lg w-full">
          <h2 className="font-kid text-3xl font-bold text-grape mb-2">
            Choose Your Pet!
          </h2>
          <p className="font-kid text-lg text-gray-500 mb-6">
            Pick a friend to learn English with!
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {PETS.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setChosenPet(pet.id)}
                className={`
                  p-4 rounded-3xl border-4 transition-all duration-200
                  font-kid active:scale-95
                  ${chosenPet === pet.id
                    ? 'border-berry bg-berry/10 scale-105 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-sky hover:shadow-md'
                  }
                `}
              >
                <div className="text-6xl mb-2">{pet.emoji}</div>
                <div className="font-bold text-lg text-gray-800">{pet.name}</div>
                <div className="text-sm text-gray-500">{pet.personality}</div>
              </button>
            ))}
          </div>
          <BigButton onClick={handleFinish} disabled={!chosenPet} size="xl">
            Start Adventure! 🎉
          </BigButton>
        </div>
      )}
    </div>
  )
}
