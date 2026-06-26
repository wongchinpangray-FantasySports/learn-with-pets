import { useState, useEffect, useRef, useMemo } from 'react'
import { PageShell } from '../components/PageShell'
import { BigButton } from '../components/BigButton'
import { CoinDisplay } from '../components/CoinDisplay'
import { getLearnedVocabularyWords } from '../data/content'
import { useGameStore } from '../store/gameStore'
import {
  speak,
  stopSpeaking,
  listenForSpeechWithPrep,
  comparePronunciation,
  isSpeechRecognitionSupported,
  CHALLENGE_LISTEN_MS,
  CHALLENGE_PREP_MS,
} from '../utils/audio'

type ChallengeState = 'pick' | 'ready' | 'prep' | 'listening' | 'result'

export function ChallengeScreen() {
  const { coins, addCoins, completedLessons, setScreen } = useGameStore()
  const [state, setState] = useState<ChallengeState>('pick')
  const [currentWord, setCurrentWord] = useState<{ word: string; emoji: string } | null>(null)
  const [result, setResult] = useState<{ score: number; passed: boolean; feedback: string; spoken: string } | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [round, setRound] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [listenProgress, setListenProgress] = useState(100)
  const maxRounds = 5
  const listeningRef = useRef(false)

  const challengeWords = useMemo(
    () => getLearnedVocabularyWords(completedLessons),
    [completedLessons]
  )

  useEffect(() => {
    return () => {
      listeningRef.current = false
      stopSpeaking()
    }
  }, [])

  const pickWord = () => {
    if (challengeWords.length === 0) return
    const word = challengeWords[Math.floor(Math.random() * challengeWords.length)]
    setCurrentWord({ word: word.word, emoji: word.emoji })
    setState('ready')
    setResult(null)
    setSecondsLeft(0)
    setListenProgress(100)
  }

  const handleListen = async () => {
    if (!currentWord) return
    try {
      await speak(currentWord.word, { style: 'word', force: true })
    } catch {
      // ignore
    }
  }

  const handleSpeak = async () => {
    if (!currentWord || listeningRef.current) return

    listeningRef.current = true
    stopSpeaking()
    setState('prep')
    setSecondsLeft(Math.ceil(CHALLENGE_PREP_MS / 1000))
    setListenProgress(100)

    try {
      const spoken = await listenForSpeechWithPrep(
        CHALLENGE_LISTEN_MS,
        CHALLENGE_PREP_MS,
        (nextPhase, secs) => {
          setSecondsLeft(secs)
          if (nextPhase === 'listening') {
            setState('listening')
            setListenProgress(100)
          }
        }
      )

      setListenProgress(0)
      setSecondsLeft(0)

      const comparison = comparePronunciation(currentWord.word, spoken)
      setResult({ ...comparison, spoken })
      setTotalScore((s) => s + comparison.score)

      if (comparison.passed) {
        addCoins(3)
      }

      setRound((r) => r + 1)
      setState('result')
    } catch (err) {
      setResult({
        score: 0,
        passed: false,
        feedback: err instanceof Error ? err.message : 'Try again!',
        spoken: '',
      })
      setRound((r) => r + 1)
      setState('result')
    } finally {
      listeningRef.current = false
    }
  }

  useEffect(() => {
    if (state !== 'listening') return

    const started = Date.now()
    const duration = CHALLENGE_LISTEN_MS

    const timer = setInterval(() => {
      const elapsed = Date.now() - started
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setListenProgress(remaining)
    }, 100)

    return () => clearInterval(timer)
  }, [state, currentWord?.word])

  const handleNext = () => {
    if (round >= maxRounds) {
      setState('pick')
      setRound(0)
      setTotalScore(0)
      setCurrentWord(null)
      setResult(null)
      return
    }
    pickWord()
  }

  const speechSupported = isSpeechRecognitionSupported()
  const prepSeconds = Math.ceil(CHALLENGE_PREP_MS / 1000)
  const listenSeconds = Math.ceil(CHALLENGE_LISTEN_MS / 1000)
  const hasLearnedWords = challengeWords.length > 0

  return (
    <PageShell className="bg-gradient-to-b from-purple-50 to-white">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-kid text-3xl font-bold text-gray-800">🎤 Challenge</h1>
          <CoinDisplay amount={coins} size="sm" />
        </div>

        {!speechSupported && (
          <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-4 mb-6 font-kid text-amber-800">
            ⚠️ Speech recognition works best in Chrome! Try using Chrome for pronunciation challenges.
          </div>
        )}

        {state === 'pick' && (
          <div className="text-center py-12">
            <div className="text-8xl mb-6 animate-wiggle">🗣️</div>
            <h2 className="font-kid text-2xl font-bold text-grape mb-3">
              Pronunciation Challenge!
            </h2>
            {hasLearnedWords ? (
              <>
                <p className="font-kid text-gray-600 mb-8">
                  Challenge yourself with words from your Learn chapters!
                  <br />
                  You have <strong>{challengeWords.length}</strong> word{challengeWords.length === 1 ? '' : 's'} ready.
                  <br />
                  Get ready ({prepSeconds}s), then speak ({listenSeconds}s).
                  <br />
                  Earn 3 🪙 for each good try!
                </p>
                <BigButton onClick={pickWord} size="xl">
                  Start Challenge! 🚀
                </BigButton>
              </>
            ) : (
              <>
                <p className="font-kid text-gray-600 mb-8">
                  Finish a vocabulary lesson in Learn first — then come back here to challenge those words!
                </p>
                <BigButton onClick={() => setScreen('learn')} size="xl">
                  Go to Learn 📚
                </BigButton>
              </>
            )}
          </div>
        )}

        {(state === 'ready' || state === 'prep' || state === 'listening') && currentWord && (
          <div className="text-center">
            <div className="font-kid text-gray-500 mb-2">
              Round {round + 1} of {maxRounds}
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-grape/30 mb-6">
              <div className="text-8xl mb-4">{currentWord.emoji}</div>
              <h2 className="font-kid text-3xl font-bold text-gray-800 mb-6 capitalize">
                {currentWord.word}
              </h2>

              {state === 'ready' && (
                <div className="flex flex-col gap-3">
                  <BigButton onClick={handleListen} variant="secondary" size="md">
                    🔊 Hear the Word
                  </BigButton>
                  <BigButton onClick={handleSpeak} variant="primary" size="xl">
                    🎤 Say It Now!
                  </BigButton>
                </div>
              )}

              {(state === 'prep' || state === 'listening') && (
                <div className="font-kid">
                  {state === 'prep' && (
                    <div className="animate-pulse">
                      <p className="text-xl text-grape font-bold mb-3">Get ready...</p>
                      <div className="text-6xl font-bold text-sun-dark mb-2">{secondsLeft}</div>
                      <p className="text-gray-500">Take a breath — then say the word!</p>
                    </div>
                  )}

                  {state === 'listening' && (
                    <div>
                      <p className="text-xl text-grape font-bold mb-3">Speak now! 🎤</p>
                      <div className="text-6xl font-bold text-berry mb-4 animate-pulse">
                        {secondsLeft}
                      </div>
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-berry rounded-full transition-all duration-100"
                          style={{ width: `${listenProgress}%` }}
                        />
                      </div>
                      <p className="text-gray-500">I&apos;m listening for {listenSeconds} seconds 👂</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {state === 'result' && result && currentWord && (
          <div className="text-center animate-pop">
            <div className="text-7xl mb-4">
              {result.passed ? '🌟' : '💪'}
            </div>

            <div className={`
              rounded-3xl p-6 mb-6 border-4
              ${result.passed ? 'bg-green-50 border-mint' : 'bg-orange-50 border-orange-300'}
            `}>
              <h2 className="font-kid text-2xl font-bold mb-2">
                {result.passed ? 'Great Job!' : 'Keep Trying!'}
              </h2>
              <p className="font-kid text-lg text-gray-700 mb-2">{result.feedback}</p>
              <div className="font-kid text-gray-500 space-y-1">
                <p>Target: <strong className="capitalize">{currentWord.word}</strong></p>
                {result.spoken && (
                  <p>You said: <strong>&quot;{result.spoken}&quot;</strong></p>
                )}
                <p>Score: <strong>{result.score}%</strong></p>
                {result.passed && (
                  <p className="text-amber-600 font-bold">+3 🪙</p>
                )}
              </div>
            </div>

            {round >= maxRounds ? (
              <div>
                <p className="font-kid text-xl text-grape font-bold mb-4">
                  Session Complete! Average: {Math.round(totalScore / maxRounds)}%
                </p>
                <BigButton onClick={handleNext} size="xl">
                  Challenge Again! 🔄
                </BigButton>
              </div>
            ) : (
              <BigButton onClick={handleNext} size="xl">
                Next Word ➡️
              </BigButton>
            )}
          </div>
        )}
    </PageShell>
  )
}
