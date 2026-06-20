import { getPetById, getShopItemById } from '../data/content'
import type { PetType } from '../types'

interface PetAvatarProps {
  petId: PetType
  size?: 'sm' | 'md' | 'lg' | 'xl'
  outfit?: string | null
  accessory?: string | null
  animate?: boolean
}

export function PetAvatar({ petId, size = 'lg', outfit, accessory, animate = true }: PetAvatarProps) {
  const pet = getPetById(petId)
  if (!pet) return null

  const outfitItem = outfit ? getShopItemById(outfit) : null
  const accessoryItem = accessory ? getShopItemById(accessory) : null

  const sizes = {
    sm: 'text-5xl w-20 h-20',
    md: 'text-7xl w-28 h-28',
    lg: 'text-8xl w-36 h-36',
    xl: 'text-9xl w-44 h-44',
  }

  return (
    <div className="relative inline-flex flex-col items-center">
      {accessoryItem && (
        <span className="absolute -top-2 text-3xl z-10 animate-float">{accessoryItem.emoji}</span>
      )}
      <div
        className={`
          relative flex items-center justify-center rounded-full
          bg-gradient-to-br ${pet.color} shadow-xl border-4 border-white
          ${sizes[size]} ${animate ? 'animate-float' : ''}
        `}
      >
        <span role="img" aria-label={pet.name}>{pet.emoji}</span>
        {outfitItem && (
          <span className="absolute -bottom-1 text-2xl">{outfitItem.emoji}</span>
        )}
      </div>
    </div>
  )
}
