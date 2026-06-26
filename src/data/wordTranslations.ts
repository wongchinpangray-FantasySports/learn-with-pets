import type { TranslationLocale } from './homeCountries'
import { getWordTranslationZh, TRANSLATION_UNLOCK_COST } from './wordTranslationsZh'

export type { WordTranslationZh as WordTranslation } from './wordTranslationsZh'
export { TRANSLATION_UNLOCK_COST }

export function getWordTranslation(
  word: string,
  locale: TranslationLocale
): import('./wordTranslationsZh').WordTranslationZh | undefined {
  if (locale === 'zh') {
    return getWordTranslationZh(word)
  }
  return undefined
}
