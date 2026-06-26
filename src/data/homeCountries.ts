/** Locales that map to word-translation data in the app. */
export type TranslationLocale =
  | 'zh'
  | 'ja'
  | 'ko'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'hi'
  | 'ar'
  | 'th'
  | 'id'
  | 'vi'
  | 'none'

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
  | 'th'
  | 'id'
  | 'vn'
  | 'other'

export interface HomeCountryOption {
  id: HomeCountryId
  label: string
  emoji: string
  translationLocale: TranslationLocale
}

export const HOME_COUNTRIES: HomeCountryOption[] = [
  { id: 'cn', label: 'China', emoji: '🇨🇳', translationLocale: 'zh' },
  { id: 'hk', label: 'Hong Kong', emoji: '🇭🇰', translationLocale: 'zh' },
  { id: 'tw', label: 'Taiwan', emoji: '🇹🇼', translationLocale: 'zh' },
  { id: 'sg', label: 'Singapore', emoji: '🇸🇬', translationLocale: 'zh' },
  { id: 'jp', label: 'Japan', emoji: '🇯🇵', translationLocale: 'ja' },
  { id: 'kr', label: 'South Korea', emoji: '🇰🇷', translationLocale: 'ko' },
  { id: 'es', label: 'Spain', emoji: '🇪🇸', translationLocale: 'es' },
  { id: 'mx', label: 'Mexico', emoji: '🇲🇽', translationLocale: 'es' },
  { id: 'fr', label: 'France', emoji: '🇫🇷', translationLocale: 'fr' },
  { id: 'de', label: 'Germany', emoji: '🇩🇪', translationLocale: 'de' },
  { id: 'br', label: 'Brazil', emoji: '🇧🇷', translationLocale: 'pt' },
  { id: 'in', label: 'India', emoji: '🇮🇳', translationLocale: 'hi' },
  { id: 'ae', label: 'UAE', emoji: '🇦🇪', translationLocale: 'ar' },
  { id: 'th', label: 'Thailand', emoji: '🇹🇭', translationLocale: 'th' },
  { id: 'id', label: 'Indonesia', emoji: '🇮🇩', translationLocale: 'id' },
  { id: 'vn', label: 'Vietnam', emoji: '🇻🇳', translationLocale: 'vi' },
  { id: 'other', label: 'Other', emoji: '🌍', translationLocale: 'none' },
]

export interface LocaleUiLabels {
  flag: string
  languageName: string
  panelTitle: string
  wordLabel: string
  meaningLabel: string
  exampleLabel: string
  unlockHint: string
  comingSoonHint: string
}

export const LOCALE_UI: Record<TranslationLocale, LocaleUiLabels> = {
  zh: {
    flag: '🇨🇳',
    languageName: '中文',
    panelTitle: '中文翻译',
    wordLabel: '单词',
    meaningLabel: '意思',
    exampleLabel: '例句',
    unlockHint: '解锁后可查看单词、意思和例句的中文翻译',
    comingSoonHint: '',
  },
  ja: {
    flag: '🇯🇵',
    languageName: '日本語',
    panelTitle: '日本語訳',
    wordLabel: '単語',
    meaningLabel: '意味',
    exampleLabel: '例文',
    unlockHint: 'Unlock Japanese word help for this word.',
    comingSoonHint: 'Japanese translations are coming soon!',
  },
  ko: {
    flag: '🇰🇷',
    languageName: '한국어',
    panelTitle: '한국어 번역',
    wordLabel: '단어',
    meaningLabel: '뜻',
    exampleLabel: '예문',
    unlockHint: 'Unlock Korean word help for this word.',
    comingSoonHint: 'Korean translations are coming soon!',
  },
  es: {
    flag: '🇪🇸',
    languageName: 'Español',
    panelTitle: 'Traducción',
    wordLabel: 'Palabra',
    meaningLabel: 'Significado',
    exampleLabel: 'Ejemplo',
    unlockHint: 'Unlock Spanish word help for this word.',
    comingSoonHint: 'Spanish translations are coming soon!',
  },
  fr: {
    flag: '🇫🇷',
    languageName: 'Français',
    panelTitle: 'Traduction',
    wordLabel: 'Mot',
    meaningLabel: 'Sens',
    exampleLabel: 'Exemple',
    unlockHint: 'Unlock French word help for this word.',
    comingSoonHint: 'French translations are coming soon!',
  },
  de: {
    flag: '🇩🇪',
    languageName: 'Deutsch',
    panelTitle: 'Übersetzung',
    wordLabel: 'Wort',
    meaningLabel: 'Bedeutung',
    exampleLabel: 'Beispiel',
    unlockHint: 'Unlock German word help for this word.',
    comingSoonHint: 'German translations are coming soon!',
  },
  pt: {
    flag: '🇧🇷',
    languageName: 'Português',
    panelTitle: 'Tradução',
    wordLabel: 'Palavra',
    meaningLabel: 'Significado',
    exampleLabel: 'Exemplo',
    unlockHint: 'Unlock Portuguese word help for this word.',
    comingSoonHint: 'Portuguese translations are coming soon!',
  },
  hi: {
    flag: '🇮🇳',
    languageName: 'हिन्दी',
    panelTitle: 'अनुवाद',
    wordLabel: 'शब्द',
    meaningLabel: 'अर्थ',
    exampleLabel: 'उदाहरण',
    unlockHint: 'Unlock Hindi word help for this word.',
    comingSoonHint: 'Hindi translations are coming soon!',
  },
  ar: {
    flag: '🇸🇦',
    languageName: 'العربية',
    panelTitle: 'الترجمة',
    wordLabel: 'كلمة',
    meaningLabel: 'المعنى',
    exampleLabel: 'مثال',
    unlockHint: 'Unlock Arabic word help for this word.',
    comingSoonHint: 'Arabic translations are coming soon!',
  },
  th: {
    flag: '🇹🇭',
    languageName: 'ภาษาไทย',
    panelTitle: 'คำแปลภาษาไทย',
    wordLabel: 'คำศัพท์',
    meaningLabel: 'ความหมาย',
    exampleLabel: 'ตัวอย่าง',
    unlockHint: 'ปลดล็อกเพื่อดูคำแปล ความหมาย และตัวอย่างประโยค',
    comingSoonHint: '',
  },
  id: {
    flag: '🇮🇩',
    languageName: 'Bahasa Indonesia',
    panelTitle: 'Terjemahan',
    wordLabel: 'Kata',
    meaningLabel: 'Arti',
    exampleLabel: 'Contoh',
    unlockHint: 'Buka kunci untuk melihat terjemahan, arti, dan contoh kalimat.',
    comingSoonHint: '',
  },
  vi: {
    flag: '🇻🇳',
    languageName: 'Tiếng Việt',
    panelTitle: 'Bản dịch',
    wordLabel: 'Từ',
    meaningLabel: 'Nghĩa',
    exampleLabel: 'Ví dụ',
    unlockHint: 'Mở khóa để xem bản dịch, nghĩa và câu ví dụ.',
    comingSoonHint: '',
  },
  none: {
    flag: '🌍',
    languageName: 'English',
    panelTitle: 'Translation',
    wordLabel: 'Word',
    meaningLabel: 'Meaning',
    exampleLabel: 'Example',
    unlockHint: '',
    comingSoonHint: '',
  },
}

export function getHomeCountryById(id: string): HomeCountryOption | undefined {
  return HOME_COUNTRIES.find((c) => c.id === id)
}

export function getTranslationLocale(homeCountry: HomeCountryId | string): TranslationLocale {
  return getHomeCountryById(homeCountry)?.translationLocale ?? 'none'
}

const LOCALES_WITH_WORD_DATA: TranslationLocale[] = ['zh', 'th', 'id', 'vi']

export function localeHasWordData(locale: TranslationLocale): boolean {
  return LOCALES_WITH_WORD_DATA.includes(locale)
}

export function showTranslationFeature(locale: TranslationLocale): boolean {
  return locale !== 'none'
}
