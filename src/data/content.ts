import type { Pet, Lesson, ShopItem, VocabularyWord } from '../types'
import { LESSONS } from './syllabus'

export { LESSONS } from './syllabus'

export const PETS: Pet[] = [
  {
    id: 'cat',
    name: 'Whiskers',
    emoji: '🐱',
    color: 'from-orange-300 to-orange-500',
    greeting: "Meow! I'm Whiskers! Let's learn English together!",
    personality: 'Playful & curious',
  },
  {
    id: 'dog',
    name: 'Buddy',
    emoji: '🐶',
    color: 'from-amber-300 to-amber-500',
    greeting: "Woof woof! I'm Buddy! Ready for an adventure?",
    personality: 'Loyal & energetic',
  },
  {
    id: 'dragon',
    name: 'Spark',
    emoji: '🐲',
    color: 'from-purple-400 to-purple-600',
    greeting: "Roar! I'm Spark the dragon! Let's explore words!",
    personality: 'Brave & magical',
  },
  {
    id: 'bunny',
    name: 'Cotton',
    emoji: '🐰',
    color: 'from-pink-300 to-pink-500',
    greeting: "Hop hop! I'm Cotton! Learning is so much fun!",
    personality: 'Gentle & smart',
  },
]

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'apple-snack', name: 'Apple Snack', emoji: '🍎', category: 'food', price: 5, description: 'A tasty apple treat!' },
  { id: 'fish-dinner', name: 'Fish Dinner', emoji: '🐟', category: 'food', price: 10, description: 'Yummy fish for your pet!' },
  { id: 'pizza-party', name: 'Pizza Party', emoji: '🍕', category: 'food', price: 15, description: 'Special pizza feast!' },
  { id: 'star-cape', name: 'Star Cape', emoji: '⭐', category: 'outfit', price: 30, description: 'A magical star cape!' },
  { id: 'rainbow-shirt', name: 'Rainbow Shirt', emoji: '🌈', category: 'outfit', price: 25, description: 'Colorful rainbow shirt!' },
  { id: 'super-hero', name: 'Hero Costume', emoji: '🦸', category: 'outfit', price: 50, description: 'Be a superhero!' },
  { id: 'cool-hat', name: 'Cool Hat', emoji: '🎩', category: 'accessory', price: 20, description: 'A fancy top hat!' },
  { id: 'sunglasses', name: 'Sunglasses', emoji: '😎', category: 'accessory', price: 15, description: 'Look super cool!' },
  { id: 'bow-tie', name: 'Bow Tie', emoji: '🎀', category: 'accessory', price: 18, description: 'A cute bow tie!' },
  { id: 'crown', name: 'Royal Crown', emoji: '👑', category: 'accessory', price: 40, description: 'Rule the kingdom!' },
]

export function getPetById(id: string): Pet | undefined {
  return PETS.find((p) => p.id === id)
}

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id)
}

export function getShopItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id)
}

/** Vocabulary words from completed Learn chapters (deduped). */
export function getLearnedVocabularyWords(completedLessonIds: string[]): VocabularyWord[] {
  const seen = new Set<string>()
  const words: VocabularyWord[] = []

  for (const lesson of LESSONS) {
    if (!completedLessonIds.includes(lesson.id) || !lesson.words) continue
    for (const entry of lesson.words) {
      const key = entry.word.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      words.push(entry)
    }
  }

  return words
}

export const FOOD_HUNGER: Record<string, number> = {
  'apple-snack': 15,
  'fish-dinner': 30,
  'pizza-party': 50,
}
