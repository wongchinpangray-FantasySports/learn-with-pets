import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { loadVoices } from './utils/audio'
import { OnboardingScreen } from './pages/OnboardingScreen'
import { HomeScreen } from './pages/HomeScreen'
import { LearnScreen } from './pages/LearnScreen'
import { PracticeScreen } from './pages/PracticeScreen'
import { ShopScreen } from './pages/ShopScreen'
import { PetScreen } from './pages/PetScreen'
import { MeScreen } from './pages/MeScreen'
import { NavBar } from './components/NavBar'

export default function App() {
  const { onboarded, currentScreen, setScreen } = useGameStore()

  useEffect(() => {
    loadVoices()
  }, [])

  if (!onboarded) {
    return <OnboardingScreen />
  }

  const screens = {
    home: <HomeScreen />,
    learn: <LearnScreen />,
    practice: <PracticeScreen />,
    shop: <ShopScreen />,
    pet: <PetScreen />,
    me: <MeScreen />,
    onboarding: null,
  }

  return (
    <div className="font-kid">
      {screens[currentScreen]}
      <NavBar current={currentScreen} onNavigate={setScreen} />
    </div>
  )
}
