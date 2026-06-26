import { CoinDisplay } from '../components/CoinDisplay'
import { BgmVolumeControl } from '../components/BgmVolumeControl'
import { PageShell } from '../components/PageShell'
import { PetAvatar } from '../components/PetAvatar'
import { ProgressBar } from '../components/ProgressBar'
import { BigButton } from '../components/BigButton'
import {
  getLearnedVocabularyWords,
  getLessonById,
  getPetById,
  getShopItemById,
  LESSONS,
} from '../data/content'
import { useGameStore } from '../store/gameStore'

export function MeScreen() {
  const {
    playerName,
    selectedPet,
    coins,
    hunger,
    happiness,
    completedLessons,
    ownedItems,
    foodInventory,
    unlockedTranslations,
    equippedOutfit,
    equippedAccessory,
    setScreen,
  } = useGameStore()

  const pet = selectedPet ? getPetById(selectedPet) : null
  const totalLessons = LESSONS.length
  const wordsLearned = getLearnedVocabularyWords(completedLessons).length
  const ownedGear = ownedItems
    .map((id) => getShopItemById(id))
    .filter((item) => item && item.category !== 'food')
  const foodCount = Object.values(foodInventory).reduce((sum, n) => sum + n, 0)

  return (
    <PageShell className="bg-gradient-to-b from-indigo-50 to-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-kid text-3xl font-bold text-gray-800">👤 Me</h1>
          <p className="font-kid text-gray-500">Hi, {playerName}!</p>
        </div>
        <CoinDisplay amount={coins} />
      </div>

      <div className="bg-gradient-to-br from-amber-100 to-yellow-50 rounded-3xl border-4 border-amber-200 p-5 mb-5 text-center shadow-md">
        <p className="font-kid text-sm text-amber-700 font-semibold mb-1">My Coins</p>
        <p className="font-kid text-5xl font-bold text-amber-600">{coins} 🪙</p>
        <p className="font-kid text-sm text-gray-500 mt-2">
          Earn coins from lessons and challenges!
        </p>
      </div>

      <BgmVolumeControl />

      {selectedPet && pet && (
        <div className="bg-white rounded-3xl shadow-lg p-5 mb-5 border-2 border-orange-100">
          <h2 className="font-kid font-bold text-lg text-gray-800 mb-4">🐾 My Pet</h2>
          <div className="flex flex-col items-center">
            <PetAvatar
              petId={selectedPet}
              size="lg"
              outfit={equippedOutfit}
              accessory={equippedAccessory}
              animate={false}
            />
            <p className="font-kid text-xl font-bold text-gray-800 mt-3">{pet.name}</p>
            <p className="font-kid text-sm text-gray-500 mb-4">{pet.personality}</p>
            <div className="w-full space-y-3">
              <ProgressBar label="Hunger" value={hunger} emoji="🍽️" color="bg-orange-400" />
              <ProgressBar label="Happiness" value={happiness} emoji="😊" color="bg-berry" />
            </div>
            <BigButton
              onClick={() => setScreen('pet')}
              variant="secondary"
              size="md"
              className="w-full mt-4"
            >
              🎮 Play games & feed {pet.name}
            </BigButton>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-lg p-5 mb-5 border-2 border-gray-100">
        <h2 className="font-kid font-bold text-lg text-gray-800 mb-4">🏆 My Records</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard emoji="📚" label="Lessons done" value={`${completedLessons.length}/${totalLessons}`} />
          <StatCard emoji="📝" label="Words learned" value={String(wordsLearned)} />
          <StatCard emoji="🇨🇳" label="Translations" value={String(unlockedTranslations.length)} />
          <StatCard emoji="🛍️" label="Items owned" value={String(ownedGear.length)} />
          <StatCard emoji="🍎" label="Snacks in bag" value={String(foodCount)} />
        </div>

        <h3 className="font-kid font-semibold text-gray-700 mb-2">Completed chapters</h3>
        {completedLessons.length === 0 ? (
          <p className="font-kid text-gray-500 text-sm py-3 text-center">
            No lessons finished yet — start in Learn! 📚
          </p>
        ) : (
          <ul className="space-y-2">
            {completedLessons.map((lessonId) => {
              const lesson = getLessonById(lessonId)
              if (!lesson) return null
              return (
                <li
                  key={lessonId}
                  className="flex items-center gap-3 bg-mint/10 border border-mint/30 rounded-2xl px-3 py-2"
                >
                  <span className="text-2xl">{lesson.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-kid font-semibold text-gray-800 text-sm truncate">
                      {lesson.title}
                    </p>
                    <p className="font-kid text-xs text-gray-500 capitalize">{lesson.category}</p>
                  </div>
                  <span className="text-mint font-bold">✅</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {(ownedGear.length > 0 || foodCount > 0) && (
        <div className="bg-white rounded-3xl shadow-lg p-5 mb-2 border-2 border-gray-100">
          <h2 className="font-kid font-bold text-lg text-gray-800 mb-4">🎒 My Collection</h2>
          {ownedGear.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {ownedGear.map((item) => (
                <span
                  key={item!.id}
                  className="font-kid inline-flex items-center gap-1 bg-purple-50 border border-purple-100 rounded-xl px-3 py-1.5 text-sm"
                >
                  {item!.emoji} {item!.name}
                </span>
              ))}
            </div>
          )}
          {foodCount > 0 && (
            <p className="font-kid text-sm text-gray-600">
              🍎 {foodCount} snack{foodCount === 1 ? '' : 's'} ready to feed your pet
            </p>
          )}
        </div>
      )}
    </PageShell>
  )
}

function StatCard({
  emoji,
  label,
  value,
}: {
  emoji: string
  label: string
  value: string
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
      <div className="text-2xl mb-1">{emoji}</div>
      <p className="font-kid text-lg font-bold text-gray-800">{value}</p>
      <p className="font-kid text-[11px] text-gray-500 leading-tight">{label}</p>
    </div>
  )
}
