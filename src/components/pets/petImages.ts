import type { PetType } from '../../types'
import catImg from '../../assets/pets/pet-cat.png'
import dogImg from '../../assets/pets/pet-dog.png'
import dragonImg from '../../assets/pets/pet-dragon.png'
import bunnyImg from '../../assets/pets/pet-bunny.png'

export const PET_IMAGES: Record<PetType, string> = {
  cat: catImg,
  dog: dogImg,
  dragon: dragonImg,
  bunny: bunnyImg,
}
