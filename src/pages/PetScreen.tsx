import { useState } from 'react'
import { PetAvatar } from '../components/PetAvatar'
import { ProgressBar } from '../components/ProgressBar'
import { CoinDisplay } from '../components/CoinDisplay'
import { PageShell } from '../components/PageShell'
import { PlayGamePicker } from '../components/play/PlayGamePicker'
import { PlayGameHost } from '../components/play/PlayGameHost'
import { getPetById, SHOP_ITEMS, FOOD_HUNGER } from '../data/content'
import type { PlayGameDefinition } from '../data/playGames'
import { useGameStore } from '../store/gameStore'

export function PetScreen() {
  const {
    selectedPet,
    coins,
    hunger,
    happiness,
    foodInventory,
    equippedOutfit,
    equippedAccessory,
    feedPet,
    spendCoins,
    boostHappiness,
  } = useGameStore()

  const [message, setMessage] = useState('')
  const [petReaction, setPetReaction] = useState('')
  const [activeGame, setActiveGame] = useState<PlayGameDefinition | null>(null)

  const pet = selectedPet ? getPetById(selectedPet) : null
  const ownedFood = SHOP_ITEMS.filter(
    (i) => i.category === 'food' && (foodInventory[i.id] ?? 0) > 0
  )

  const showMessage = (msg: string, reaction: string) => {
    setMessage(msg)
    setPetReaction(reaction)
    setTimeout(() => {
      setMessage('')
      setPetReaction('')
    }, 2500)
  }

  const handleFeed = (foodId: string) => {
    const hungerBoost = FOOD_HUNGER[foodId] ?? 20
    const success = feedPet(foodId, hungerBoost)
    if (success) {
      showMessage('Yummy! Your pet loved it! 😋', '😋')
    } else {
      showMessage('Buy food from the shop first! 🛍️', '🥺')
    }
  }

  const handleSelectGame = (game: PlayGameDefinition) => {
    if (coins < game.coinCost) {
      showMessage('Need more coins! Earn some from lessons! 🪙', '😢')
      return
    }
    if (!spendCoins(game.coinCost)) {
      showMessage('Need more coins! Earn some from lessons! 🪙', '😢')
      return
    }
    setActiveGame(game)
  }

  const handleGameComplete = (happiness: number) => {
    boostHappiness(happiness)
    showMessage(`+${happiness} happiness! Great game! 🎉`, '😊')
  }

  const handleGameClose = () => {
    setActiveGame(null)
  }

  if (!selectedPet || !pet) return null

  if (activeGame) {
    return (
      <PlayGameHost
        game={activeGame}
        petId={selectedPet}
        petName={pet.name}
        onComplete={handleGameComplete}
        onCancel={handleGameClose}
      />
    )
  }

  return (
    <PageShell className="bg-gradient-to-b from-orange-50 to-white">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-kid text-3xl font-bold text-gray-800">🐾 My Pet</h1>
          <CoinDisplay amount={coins} size="sm" />
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 text-center border-4 border-orange-200 mb-6">
          <PetAvatar
            petId={selectedPet}
            size="xl"
            outfit={equippedOutfit}
            accessory={equippedAccessory}
          />
          <h2 className="font-kid text-2xl font-bold text-gray-800 mt-4">
            {pet.name} {petReaction}
          </h2>

          {message && (
            <div className="mt-3 font-kid text-lg text-grape font-semibold animate-pop">
              {message}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <ProgressBar label="Hunger" value={hunger} emoji="🍽️" color="bg-orange-400" />
            <ProgressBar label="Happiness" value={happiness} emoji="😊" color="bg-berry" />
          </div>

          {hunger < 30 && (
            <p className="font-kid text-orange-500 mt-3 font-semibold">
              🥺 {pet.name} is hungry! Feed me please!
            </p>
          )}
          {happiness < 30 && (
            <p className="font-kid text-berry mt-3 font-semibold">
              😢 {pet.name} feels lonely. Come play!
            </p>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-5 mb-4 border-2 border-gray-100">
          <h3 className="font-kid font-bold text-lg text-gray-700 mb-4">
            🍎 Feed {pet.name}
          </h3>
          <p className="font-kid text-xs text-gray-500 mb-3">
            Each snack can be used once. Buy more at the shop!
          </p>
          {ownedFood.length === 0 ? (
            <p className="font-kid text-gray-500 text-center py-4">
              No food yet! Visit the shop to buy snacks! 🛍️
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {ownedFood.map((food) => {
                const count = foodInventory[food.id] ?? 0
                return (
                  <button
                    key={food.id}
                    onClick={() => handleFeed(food.id)}
                    className="
                      relative bg-orange-50 border-2 border-orange-200 rounded-2xl p-3
                      hover:bg-orange-100 active:scale-95 transition-all font-kid
                    "
                  >
                    <span className="absolute -top-2 -right-2 bg-berry text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {count}
                    </span>
                    <div className="text-3xl">{food.emoji}</div>
                    <div className="text-xs font-semibold text-gray-700 mt-1">{food.name}</div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-5 border-2 border-gray-100">
          <h3 className="font-kid font-bold text-lg text-gray-700 mb-1">
            🎾 Play with {pet.name}
          </h3>
          <p className="font-kid text-xs text-gray-500 mb-4">
            Pick a game — sports, party games, or table games!
          </p>
          <PlayGamePicker coins={coins} onSelect={handleSelectGame} />
        </div>
    </PageShell>
  )
}
