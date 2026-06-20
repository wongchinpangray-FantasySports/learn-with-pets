import { useState } from 'react'
import { PageShell } from '../components/PageShell'
import { CoinDisplay } from '../components/CoinDisplay'
import { BigButton } from '../components/BigButton'
import { SHOP_ITEMS } from '../data/content'
import { useGameStore } from '../store/gameStore'
import type { ItemCategory } from '../types'

const TABS: { key: ItemCategory | 'all'; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '🛍️' },
  { key: 'food', label: 'Food', emoji: '🍎' },
  { key: 'outfit', label: 'Outfits', emoji: '👕' },
  { key: 'accessory', label: 'Extras', emoji: '✨' },
]

export function ShopScreen() {
  const { coins, ownedItems, foodInventory, buyItem, equipItem, equippedOutfit, equippedAccessory } = useGameStore()
  const [tab, setTab] = useState<ItemCategory | 'all'>('all')
  const [message, setMessage] = useState('')

  const filtered = tab === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter((i) => i.category === tab)

  const handleBuy = (itemId: string, price: number, category: ItemCategory) => {
    const success = buyItem(itemId, price)
    if (success) {
      setMessage(category === 'food' ? 'Snack bought! Feed your pet! 🍎' : 'Purchased! 🎉')
    } else if (category !== 'food' && ownedItems.includes(itemId)) {
      setMessage('You already own this!')
    } else {
      setMessage('Not enough coins! 🪙')
    }
    setTimeout(() => setMessage(''), 2000)
  }

  const handleEquip = (itemId: string, category: 'outfit' | 'accessory') => {
    equipItem(itemId, category)
    setMessage('Equipped! ✨')
    setTimeout(() => setMessage(''), 2000)
  }

  return (
    <PageShell className="bg-gradient-to-b from-yellow-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-kid text-3xl font-bold text-gray-800">🛍️ Shop</h1>
          <CoinDisplay amount={coins} size="sm" />
        </div>

        {message && (
          <div className="bg-mint/20 text-mint font-kid font-bold text-center rounded-2xl py-2 mb-4 animate-pop">
            {message}
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`
                flex-shrink-0 font-kid font-semibold px-4 py-2 rounded-full transition-all
                ${tab === key
                  ? 'bg-sun text-gray-800 shadow-md'
                  : 'bg-white text-gray-500 border-2 border-gray-200'
                }
              `}
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filtered.map((item) => {
            const isFood = item.category === 'food'
            const foodCount = foodInventory[item.id] ?? 0
            const owned = !isFood && ownedItems.includes(item.id)
            const equipped =
              (item.category === 'outfit' && equippedOutfit === item.id) ||
              (item.category === 'accessory' && equippedAccessory === item.id)

            return (
              <div
                key={item.id}
                className={`
                  bg-white rounded-3xl p-4 border-4 shadow-md text-center
                  ${equipped ? 'border-mint' : owned || foodCount > 0 ? 'border-sky' : 'border-gray-200'}
                `}
              >
                <div className="text-5xl mb-2">{item.emoji}</div>
                <h3 className="font-kid font-bold text-gray-800">{item.name}</h3>
                <p className="font-kid text-xs text-gray-500 mb-2">{item.description}</p>

                {isFood && foodCount > 0 && (
                  <p className="font-kid text-xs text-orange-600 font-semibold mb-2">
                    In bag: {foodCount} 🎒
                  </p>
                )}

                {owned ? (
                  <div className="space-y-2">
                    <span className="font-kid text-sm text-mint font-bold">✅ Owned</span>
                    {(item.category === 'outfit' || item.category === 'accessory') && (
                      <BigButton
                        onClick={() => handleEquip(item.id, item.category as 'outfit' | 'accessory')}
                        variant={equipped ? 'success' : 'ghost'}
                        size="md"
                        className="w-full"
                      >
                        {equipped ? '✨ Equipped' : 'Wear It!'}
                      </BigButton>
                    )}
                  </div>
                ) : (
                  <BigButton
                    onClick={() => handleBuy(item.id, item.price, item.category)}
                    variant={coins >= item.price ? 'secondary' : 'ghost'}
                    size="md"
                    className="w-full"
                    disabled={coins < item.price}
                  >
                    🪙 {item.price}
                  </BigButton>
                )}
              </div>
            )
          })}
        </div>
    </PageShell>
  )
}
