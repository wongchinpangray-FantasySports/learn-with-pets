import type { TranslationLocale } from './homeCountries'
import type { WordTranslation } from './wordTranslationTypes'
import { getWordTranslationId } from './wordTranslationsId'
import { getWordTranslationTh } from './wordTranslationsTh'
import { getWordTranslationVi } from './wordTranslationsVi'
import { getWordTranslationZh, TRANSLATION_UNLOCK_COST } from './wordTranslationsZh'

export type { WordTranslation }
export { TRANSLATION_UNLOCK_COST }

export function getWordTranslation(
  word: string,
  locale: TranslationLocale
): WordTranslation | undefined {
  switch (locale) {
    case 'zh':
      return getWordTranslationZh(word)
    case 'th':
      return getWordTranslationTh(word)
    case 'id':
      return getWordTranslationId(word)
    case 'vi':
      return getWordTranslationVi(word)
    default:
      return undefined
  }
}
