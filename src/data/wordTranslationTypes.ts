export interface WordTranslation {
  word: string
  meaning: string
  example: string
}

export type WordTranslationMap = Record<string, WordTranslation>

export function getFromMap(map: WordTranslationMap, word: string): WordTranslation | undefined {
  return map[word.toLowerCase()]
}
