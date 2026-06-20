import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameStore, PetType, Screen } from '../types'
import { FOOD_HUNGER, SHOP_ITEMS, getShopItemById } from '../data/content'
import { TRANSLATION_UNLOCK_COST } from '../data/wordTranslationsZh'

const initialState = {
  playerName: '',
  selectedPet: null as PetType | null,
  coins: 0,
  hunger: 80,
  happiness: 80,
  completedLessons: [] as string[],
  ownedItems: [] as string[],
  foodInventory: {} as Record<string, number>,
  equippedOutfit: null as string | null,
  equippedAccessory: null as string | null,
  narrationSpeed: 0.75,
  unlockedTranslations: [] as string[],
  onboarded: false,
  currentScreen: 'onboarding' as Screen,
}

function isFoodItem(itemId: string): boolean {
  return getShopItemById(itemId)?.category === 'food'
}

function migrateLegacyFood(state: GameStore): Partial<GameStore> {
  const foodInventory = { ...state.foodInventory }
  const ownedItems = [...state.ownedItems]
  let changed = false

  for (const item of SHOP_ITEMS.filter((i) => i.category === 'food')) {
    const legacyCount = ownedItems.filter((id) => id === item.id).length
    if (legacyCount > 0) {
      foodInventory[item.id] = (foodInventory[item.id] ?? 0) + legacyCount
      changed = true
    }
  }

  if (!changed) return {}

  return {
    foodInventory,
    ownedItems: ownedItems.filter((id) => !isFoodItem(id)),
  }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      currentScreen: 'onboarding' as Screen,

      setPlayerName: (name) => set({ playerName: name }),

      selectPet: (pet) => set({ selectedPet: pet }),

      completeOnboarding: () =>
        set({ onboarded: true, currentScreen: 'home', coins: 20 }),

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

      spendCoins: (amount) => {
        const { coins } = get()
        if (coins < amount) return false
        set({ coins: coins - amount })
        return true
      },

      completeLesson: (lessonId, reward) => {
        const { completedLessons } = get()
        if (completedLessons.includes(lessonId)) return
        set((s) => ({
          completedLessons: [...s.completedLessons, lessonId],
          coins: s.coins + reward,
          happiness: Math.min(100, s.happiness + 10),
        }))
      },

      feedPet: (foodId, hungerBoost) => {
        const state = get()
        const count = state.foodInventory[foodId] ?? 0
        if (count <= 0) return false

        const nextInventory = { ...state.foodInventory, [foodId]: count - 1 }
        if (nextInventory[foodId] <= 0) delete nextInventory[foodId]

        set({
          foodInventory: nextInventory,
          hunger: Math.min(100, state.hunger + hungerBoost),
          happiness: Math.min(100, state.happiness + 5),
        })
        return true
      },

      buyItem: (itemId, price) => {
        const state = get()
        if (state.coins < price) return false

        const item = getShopItemById(itemId)
        if (!item) return false

        if (item.category === 'food') {
          set({
            coins: state.coins - price,
            foodInventory: {
              ...state.foodInventory,
              [itemId]: (state.foodInventory[itemId] ?? 0) + 1,
            },
          })
          return true
        }

        if (state.ownedItems.includes(itemId)) return false

        set({
          coins: state.coins - price,
          ownedItems: [...state.ownedItems, itemId],
        })
        return true
      },

      equipItem: (itemId, category) => {
        if (category === 'outfit') set({ equippedOutfit: itemId })
        else set({ equippedAccessory: itemId })
      },

      setNarrationSpeed: (speed) =>
        set({ narrationSpeed: Math.max(0.5, Math.min(1.1, speed)) }),

      unlockTranslation: (wordKey) => {
        const state = get()
        const key = wordKey.toLowerCase()
        if (state.unlockedTranslations.includes(key)) return true
        if (state.coins < TRANSLATION_UNLOCK_COST) return false
        set({
          coins: state.coins - TRANSLATION_UNLOCK_COST,
          unlockedTranslations: [...state.unlockedTranslations, key],
        })
        return true
      },

      setScreen: (screen) => set({ currentScreen: screen }),

      resetGame: () => set({ ...initialState, currentScreen: 'onboarding' as Screen }),
    }),
    {
      name: 'bb8-english-save',
      version: 3,
      migrate: (persisted, version) => {
        let state = { ...(persisted as GameStore), currentScreen: (persisted as GameStore).currentScreen ?? 'onboarding' }
        if (version < 2) {
          state.foodInventory = state.foodInventory ?? {}
          state.narrationSpeed = state.narrationSpeed ?? 0.75
          state = { ...state, ...migrateLegacyFood(state as GameStore) }
        }
        if (version < 3) {
          state.unlockedTranslations = state.unlockedTranslations ?? []
        }
        return state
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          const patch = migrateLegacyFood(state)
          if (Object.keys(patch).length > 0) {
            useGameStore.setState(patch)
          }
        }
      },
    }
  )
)

export { FOOD_HUNGER }
