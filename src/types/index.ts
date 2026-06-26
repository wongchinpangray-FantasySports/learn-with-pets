export type PetType = 'cat' | 'dog' | 'dragon' | 'bunny'

export type HomeCountryId =
  | 'cn'
  | 'hk'
  | 'tw'
  | 'sg'
  | 'jp'
  | 'kr'
  | 'es'
  | 'mx'
  | 'fr'
  | 'de'
  | 'br'
  | 'in'
  | 'ae'
  | 'us'
  | 'uk'
  | 'au'
  | 'other'

export type Screen =
  | 'onboarding'
  | 'home'
  | 'learn'
  | 'challenge'
  | 'shop'
  | 'pet'
  | 'me'

export type ItemCategory = 'food' | 'outfit' | 'accessory'

export interface Pet {
  id: PetType
  name: string
  emoji: string
  color: string
  greeting: string
  personality: string
}

export interface VocabularyWord {
  word: string
  emoji: string
  definition: string
  example: string
}

export interface Lesson {
  id: string
  title: string
  category: 'vocabulary' | 'grammar'
  emoji: string
  description: string
  coinReward: number
  words?: VocabularyWord[]
  grammarRule?: string
  grammarExamples?: string[]
}

export interface ShopItem {
  id: string
  name: string
  emoji: string
  category: ItemCategory
  price: number
  description: string
}

export interface GameState {
  playerName: string
  selectedPet: PetType | null
  homeCountry: HomeCountryId
  coins: number
  hunger: number
  happiness: number
  lastPetDecayAt: number | null
  completedLessons: string[]
  ownedItems: string[]
  foodInventory: Record<string, number>
  equippedOutfit: string | null
  equippedAccessory: string | null
  narrationSpeed: number
  unlockedTranslations: string[]
  bgmEnabled: boolean
  bgmVolume: number
  onboarded: boolean
}

export interface GameActions {
  setPlayerName: (name: string) => void
  selectPet: (pet: PetType) => void
  setHomeCountry: (country: HomeCountryId) => void
  completeOnboarding: () => void
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean
  completeLesson: (lessonId: string, reward: number) => void
  feedPet: (foodId: string, hungerBoost: number) => boolean
  playWithPet: (coinCost: number, happinessBoost: number) => boolean
  boostHappiness: (amount: number) => void
  applyPetDecay: () => void
  buyItem: (itemId: string, price: number) => boolean
  equipItem: (itemId: string, category: 'outfit' | 'accessory') => void
  setNarrationSpeed: (speed: number) => void
  unlockTranslation: (wordKey: string) => boolean
  setBgmEnabled: (enabled: boolean) => void
  setBgmVolume: (volume: number) => void
  setScreen: (screen: Screen) => void
  resetGame: () => void
}

export type GameStore = GameState & GameActions & { currentScreen: Screen }
