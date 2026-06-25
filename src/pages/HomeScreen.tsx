import { useEffect } from 'react'
import { PageShell } from '../components/PageShell'
import { CoinDisplay } from '../components/CoinDisplay'
import { PetAvatar } from '../components/PetAvatar'
import { ProgressBar } from '../components/ProgressBar'
import { BigButton } from '../components/BigButton'
import { NarrationSpeedControl } from '../components/NarrationSpeedControl'
import { getPetById, LESSONS } from '../data/content'
import { useGameStore } from '../store/gameStore'
import { speakNarration, stopSpeaking } from '../utils/audio'

export function HomeScreen() {
  const {
    playerName,
    selectedPet,
    coins,
    hunger,
    happiness,
    completedLessons,
    equippedOutfit,
    equippedAccessory,
    setScreen,
  } = useGameStore()

  const pet = selectedPet ? getPetById(selectedPet) : null
  const totalLessons = LESSONS.length
  const doneCount = completedLessons.length

  useEffect(() => {
    if (!pet) return

    const timer = setTimeout(() => {
      speakNarration(pet.greeting)
    }, 400)

    return () => {
      clearTimeout(timer)
      stopSpeaking()
    }
  }, [pet?.id, pet?.greeting])

  return (
    <PageShell className="bg-gradient-to-b from-sky-light to-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-kid text-2xl font-bold text-gray-800">
              Hi, {playerName}! 👋
            </h1>
            <p className="font-kid text-gray-500">
              {pet?.name} is happy to see you!
            </p>
          </div>
          <CoinDisplay amount={coins} />
        </div>

        {/* Pet display */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 text-center border-4 border-sky/30">
          {selectedPet && (
            <PetAvatar
              petId={selectedPet}
              size="xl"
              outfit={equippedOutfit}
              accessory={equippedAccessory}
            />
          )}
          {pet && (
            <div className="mt-4">
              <p className="font-kid text-lg text-gray-600 italic">
                "{pet.greeting}"
              </p>
              <button
                onClick={() => speakNarration(pet.greeting, true)}
                className="font-kid text-sm text-grape mt-2 hover:underline"
              >
                🐾 Hear {pet.name} again
              </button>
            </div>
          )}

          <div className="mt-4">
            <NarrationSpeedControl compact />
          </div>

          <div className="mt-6 space-y-3">
            <ProgressBar label="Hunger" value={hunger} emoji="🍽️" color="bg-orange-400" />
            <ProgressBar label="Happiness" value={happiness} emoji="😊" color="bg-berry" />
          </div>
          {pet && hunger < 30 && (
            <p className="font-kid text-orange-500 mt-3 font-semibold text-sm">
              🥺 {pet.name} is hungry — visit Pet to feed!
            </p>
          )}
          {pet && happiness < 30 && (
            <p className="font-kid text-berry mt-3 font-semibold text-sm">
              😢 {pet.name} wants to play — visit Pet!
            </p>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setScreen('learn')}
            className="bg-gradient-to-br from-mint to-teal-400 text-white rounded-3xl p-5 shadow-lg active:scale-95 transition-transform font-kid"
          >
            <div className="text-4xl mb-2">📚</div>
            <div className="font-bold text-lg">Learn</div>
            <div className="text-sm opacity-90">New words!</div>
          </button>
          <button
            onClick={() => setScreen('practice')}
            className="bg-gradient-to-br from-grape to-purple-500 text-white rounded-3xl p-5 shadow-lg active:scale-95 transition-transform font-kid"
          >
            <div className="text-4xl mb-2">🎤</div>
            <div className="font-bold text-lg">Practice</div>
            <div className="text-sm opacity-90">Say it out loud!</div>
          </button>
          <button
            onClick={() => setScreen('pet')}
            className="bg-gradient-to-br from-orange-300 to-orange-400 text-white rounded-3xl p-5 shadow-lg active:scale-95 transition-transform font-kid"
          >
            <div className="text-4xl mb-2">🎮</div>
            <div className="font-bold text-lg">Pet Games</div>
            <div className="text-sm opacity-90">6 mini-games!</div>
          </button>
          <button
            onClick={() => setScreen('shop')}
            className="bg-gradient-to-br from-sun to-amber-400 text-gray-800 rounded-3xl p-5 shadow-lg active:scale-95 transition-transform font-kid"
          >
            <div className="text-4xl mb-2">🛍️</div>
            <div className="font-bold text-lg">Shop</div>
            <div className="text-sm opacity-90">Spend coins!</div>
          </button>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-3xl shadow-lg p-5 border-2 border-gray-100">
          <h3 className="font-kid font-bold text-lg text-gray-700 mb-3">
            🏆 Your Progress
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar
                label="Lessons Done"
                value={Math.round((doneCount / totalLessons) * 100)}
                emoji="📖"
                color="bg-sky"
              />
            </div>
            <span className="font-kid font-bold text-grape text-lg">
              {doneCount}/{totalLessons}
            </span>
          </div>
          {doneCount === 0 && (
            <BigButton
              onClick={() => setScreen('learn')}
              variant="secondary"
              size="md"
              className="w-full mt-4"
            >
              Start Your First Lesson! ✨
            </BigButton>
          )}
        </div>
    </PageShell>
  )
}
