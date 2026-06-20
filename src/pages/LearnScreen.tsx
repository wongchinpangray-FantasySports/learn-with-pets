import { useState, useEffect, useCallback } from 'react'
import { PageShell } from '../components/PageShell'
import { BigButton } from '../components/BigButton'
import { CoinDisplay } from '../components/CoinDisplay'
import { LESSONS } from '../data/content'
import { getWordTranslationZh, TRANSLATION_UNLOCK_COST } from '../data/wordTranslationsZh'
import type { WordTranslationZh } from '../data/wordTranslationsZh'
import { useGameStore } from '../store/gameStore'
import { speak, speakNarration, stopSpeaking } from '../utils/audio'
import type { Lesson } from '../types'

export function LearnScreen() {
  const { completedLessons, completeLesson, coins } = useGameStore()
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [wordIndex, setWordIndex] = useState(0)
  const [showReward, setShowReward] = useState(false)

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson)
    setWordIndex(0)
    setShowReward(false)
  }

  const handleSpeakWord = useCallback(async (text: string) => {
    try {
      await speak(text, { style: 'word' })
    } catch {
      // TTS may fail silently in some browsers
    }
  }, [])

  const handleSpeakNarration = useCallback(async (text: string, force = false) => {
    try {
      await speakNarration(text, force)
    } catch {
      // TTS may fail silently in some browsers
    }
  }, [])

  const handleNext = () => {
    if (!activeLesson) return

    if (activeLesson.category === 'vocabulary' && activeLesson.words) {
      if (wordIndex < activeLesson.words.length - 1) {
        setWordIndex(wordIndex + 1)
      } else {
        finishLesson()
      }
    } else {
      finishLesson()
    }
  }

  const finishLesson = () => {
    if (!activeLesson) return
    const alreadyDone = completedLessons.includes(activeLesson.id)
    if (!alreadyDone) {
      completeLesson(activeLesson.id, activeLesson.coinReward)
    }
    setShowReward(true)
  }

  const backToList = () => {
    setActiveLesson(null)
    setWordIndex(0)
    setShowReward(false)
  }

  // Lesson list view
  if (!activeLesson) {
    return (
      <PageShell className="bg-gradient-to-b from-green-50 to-white">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-kid text-3xl font-bold text-gray-800">📚 Learn</h1>
            <CoinDisplay amount={coins} size="sm" />
          </div>
          <p className="font-kid text-gray-500 mb-6">
            Pick a lesson and earn coins!
          </p>
          <div className="space-y-4">
            {LESSONS.map((lesson) => {
              const done = completedLessons.includes(lesson.id)
              return (
                <button
                  key={lesson.id}
                  onClick={() => startLesson(lesson)}
                  className={`
                    w-full text-left p-5 rounded-3xl border-4 transition-all active:scale-[0.98]
                    font-kid shadow-md hover:shadow-lg
                    ${done
                      ? 'border-mint bg-mint/10'
                      : 'border-gray-200 bg-white hover:border-sky'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{lesson.emoji}</span>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        {lesson.title}
                        {done && <span className="text-mint text-sm">✅ Done!</span>}
                      </div>
                      <div className="text-sm text-gray-500">{lesson.description}</div>
                      <div className="text-sm font-semibold text-amber-600 mt-1">
                        🪙 +{lesson.coinReward} coins
                      </div>
                    </div>
                    <span className="text-2xl text-gray-300">▶</span>
                  </div>
                </button>
              )
            })}
          </div>
      </PageShell>
    )
  }

  // Reward screen
  if (showReward) {
    const alreadyDone = completedLessons.includes(activeLesson.id)
    return (
      <PageShell className="bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center p-6">
        <div className="text-center animate-pop max-w-md">
          <div className="text-8xl mb-4 animate-bounceSlow">
            {alreadyDone ? '🌟' : '🎉'}
          </div>
          <h2 className="font-kid text-3xl font-bold text-grape mb-3">
            {alreadyDone ? 'Great Review!' : 'Lesson Complete!'}
          </h2>
          {!alreadyDone && (
            <p className="font-kid text-2xl text-amber-600 font-bold mb-4">
              +{activeLesson.coinReward} 🪙
            </p>
          )}
          <p className="font-kid text-lg text-gray-600 mb-8">
            {alreadyDone
              ? 'You remembered everything! Awesome!'
              : 'Your pet is so proud of you!'}
          </p>
          <BigButton onClick={backToList} size="xl">
            Back to Lessons 📚
          </BigButton>
        </div>
      </PageShell>
    )
  }

  // Vocabulary lesson view
  if (activeLesson.category === 'vocabulary' && activeLesson.words) {
    const word = activeLesson.words[wordIndex]
    const progress = ((wordIndex + 1) / activeLesson.words.length) * 100
    const translation = getWordTranslationZh(word.word)

    return (
      <VocabWordView
        lessonTitle={activeLesson.title}
        word={word}
        translation={translation}
        wordIndex={wordIndex}
        totalWords={activeLesson.words.length}
        progress={progress}
        onBack={backToList}
        onNext={handleNext}
        onSpeakWord={handleSpeakWord}
        onSpeakNarration={handleSpeakNarration}
        isLastWord={wordIndex >= activeLesson.words.length - 1}
      />
    )
  }

  // Grammar lesson view
  return (
    <GrammarLessonView
      lesson={activeLesson}
      onBack={backToList}
      onNext={handleNext}
      onSpeakNarration={handleSpeakNarration}
    />
  )
}

interface VocabWordViewProps {
  lessonTitle: string
  word: { word: string; emoji: string; definition: string; example: string }
  translation?: WordTranslationZh
  wordIndex: number
  totalWords: number
  progress: number
  onBack: () => void
  onNext: () => void
  onSpeakWord: (text: string) => void
  onSpeakNarration: (text: string, force?: boolean) => void
  isLastWord: boolean
}

function ChineseTranslationPanel({
  wordKey,
  translation,
}: {
  wordKey: string
  translation: WordTranslationZh
}) {
  const { coins, unlockedTranslations, unlockTranslation } = useGameStore()
  const isUnlocked = unlockedTranslations.includes(wordKey.toLowerCase())
  const canAfford = coins >= TRANSLATION_UNLOCK_COST

  const handleUnlock = () => {
    unlockTranslation(wordKey)
  }

  return (
    <div className="mt-5 pt-5 border-t-2 border-dashed border-sky/30 text-left">
      <p className="font-kid text-sm font-semibold text-gray-500 mb-3">🇨🇳 中文翻译</p>
      {isUnlocked ? (
        <div className="space-y-3 font-kid text-gray-800">
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">单词</p>
            <p className="text-2xl font-bold">{translation.word}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">意思</p>
            <p className="text-lg leading-relaxed">{translation.meaning}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">例句</p>
            <p className="text-lg leading-relaxed text-grape italic">
              「{translation.example}」
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="font-kid text-sm text-gray-500 mb-3">
            解锁后可查看单词、意思和例句的中文翻译
          </p>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={!canAfford}
            className={`
              font-kid w-full px-4 py-3 rounded-2xl border-2 transition-all active:scale-[0.98]
              ${canAfford
                ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            🔓 Unlock translation · {TRANSLATION_UNLOCK_COST} 🪙
          </button>
          {!canAfford && (
            <p className="font-kid text-sm text-orange-500 mt-2">
              Not enough coins — finish lessons to earn more!
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function VocabWordView({
  lessonTitle,
  word,
  translation,
  wordIndex,
  totalWords,
  progress,
  onBack,
  onNext,
  onSpeakWord,
  onSpeakNarration,
  isLastWord,
}: VocabWordViewProps) {
  const { coins } = useGameStore()
  useEffect(() => {
    const timer = setTimeout(() => {
      onSpeakNarration(
        `Let's learn the word ${word.word}! ${word.definition} For example: ${word.example}`
      )
    }, 350)

    return () => {
      clearTimeout(timer)
      stopSpeaking()
    }
  }, [word.word, word.definition, word.example, onSpeakNarration])

  return (
    <PageShell className="bg-gradient-to-b from-blue-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="font-kid text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
          <CoinDisplay amount={coins} size="sm" />
        </div>

        <div className="mb-4">
          <div className="flex justify-between font-kid text-sm text-gray-500 mb-1">
            <span>{lessonTitle}</span>
            <span>{wordIndex + 1}/{totalWords}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 text-center border-4 border-sky/30 mb-6">
          <div className="text-8xl mb-4 animate-float">{word.emoji}</div>
          <h2 className="font-kid text-4xl font-bold text-gray-800 mb-3 capitalize">
            {word.word}
          </h2>
          <p className="font-kid text-lg text-gray-600 mb-2">{word.definition}</p>
          <p className="font-kid text-md text-grape italic mb-4">
            "{word.example}"
          </p>

          {translation && (
            <ChineseTranslationPanel wordKey={word.word} translation={translation} />
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center mt-6">
            <BigButton
              onClick={() => onSpeakWord(word.word)}
              variant="secondary"
              size="md"
            >
              🔊 Say the word
            </BigButton>
            <BigButton
              onClick={() =>
                onSpeakNarration(
                  `${word.word} means ${word.definition} For example: ${word.example}`,
                  true
                )
              }
              variant="ghost"
              size="md"
            >
              🐾 Tell me again!
            </BigButton>
          </div>
        </div>

        <BigButton onClick={onNext} size="xl" className="w-full">
          {isLastWord ? 'Finish! 🎉' : 'Next Word ➡️'}
        </BigButton>
    </PageShell>
  )
}

interface GrammarLessonViewProps {
  lesson: Lesson
  onBack: () => void
  onNext: () => void
  onSpeakNarration: (text: string, force?: boolean) => void
}

function GrammarLessonView({ lesson, onBack, onNext, onSpeakNarration }: GrammarLessonViewProps) {
  useEffect(() => {
    if (!lesson.grammarRule) return

    const timer = setTimeout(() => {
      onSpeakNarration(`Here's a grammar tip! ${lesson.grammarRule}`)
    }, 350)

    return () => {
      clearTimeout(timer)
      stopSpeaking()
    }
  }, [lesson.id, lesson.grammarRule, onSpeakNarration])

  return (
    <PageShell className="bg-gradient-to-b from-purple-50 to-white">
        <button
          onClick={onBack}
          className="font-kid text-gray-500 mb-4 hover:text-gray-700"
        >
          ← Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-grape/30 mb-6">
          <div className="text-5xl text-center mb-4">{lesson.emoji}</div>
          <h2 className="font-kid text-2xl font-bold text-gray-800 text-center mb-4">
            {lesson.title}
          </h2>

          <div className="bg-grape/10 rounded-2xl p-4 mb-6">
            <h3 className="font-kid font-bold text-grape mb-2">📌 Rule:</h3>
            <p className="font-kid text-gray-700">{lesson.grammarRule}</p>
            <button
              onClick={() => onSpeakNarration(lesson.grammarRule ?? '', true)}
              className="font-kid text-sm text-grape mt-2 hover:underline"
            >
              🐾 Hear the rule again
            </button>
          </div>

          <h3 className="font-kid font-bold text-gray-700 mb-3">✏️ Examples:</h3>
          <div className="space-y-2">
            {lesson.grammarExamples?.map((ex, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
              >
                <span className="font-kid text-gray-700">{ex}</span>
                <button
                  onClick={() => onSpeakNarration(ex.replace(/→.*$/, '').trim(), true)}
                  className="text-xl hover:scale-110 transition-transform"
                  aria-label="Listen to example"
                >
                  🔊
                </button>
              </div>
            ))}
          </div>
        </div>

        <BigButton onClick={onNext} size="xl" className="w-full">
          I Got It! 🎉
        </BigButton>
    </PageShell>
  )
}
