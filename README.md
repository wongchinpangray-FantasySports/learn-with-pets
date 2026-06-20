# BB8 English Learning Tool 🐾

A gamified English learning app for kids aged 7–10. Learn vocabulary and grammar with your virtual pet companion!

## Features

- **Pet Onboarding** — Choose from 4 cute pets (cat, dog, dragon, bunny) as your language partner
- **Premium kid voice** — ElevenLabs AI narration (playful Jessica voice) with browser fallback
- **Vocabulary Lessons** — Interactive word learning with emoji visuals and audio
- **Grammar Lessons** — Simple rules with spoken examples
- **Pronunciation Practice** — Speech recognition to test how kids say words aloud
- **Coin Rewards** — Earn coins by completing lessons and practicing pronunciation
- **Pet Shop** — Buy food, outfits, and accessories for your pet
- **Pet Care** — Feed and play with your pet to keep hunger and happiness up
- **Kid-Friendly UI** — Big buttons, bright colors, playful animations

## Getting Started

```bash
npm install
cp .env.example .env
# Add your ElevenLabs API key to .env (free tier works!)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Look for **✨ Premium voice** in the top-right corner — that means ElevenLabs is connected.

> **Tip:** Pronunciation practice works best in **Google Chrome** (uses Web Speech API).

## ElevenLabs Setup (Premium Voice)

1. Create a free account at [elevenlabs.io](https://elevenlabs.io)
2. Copy your API key from Profile → API Keys
3. Create a `.env` file in the project root:

```env
ELEVENLABS_API_KEY=your_api_key_here
```

4. Restart the dev server

The API key stays on the server only (never exposed to the browser). Without a key, the app falls back to browser text-to-speech.

### Optional voice overrides

```env
ELEVENLABS_NARRATION_VOICE_ID=cgSgspJ2msm6clMCkdW9  # Jessica — playful kid narrator
ELEVENLABS_WORD_VOICE_ID=EXAVITQu4vr4xnSDxMaL       # Bella — clear word pronunciation
ELEVENLABS_MODEL_ID=eleven_turbo_v2_5
```

Browse voices at [elevenlabs.io/voice-library](https://elevenlabs.io/voice-library) and paste any voice ID.

## Production

```bash
npm run start
```

Builds the app and serves it at [http://localhost:4173](http://localhost:4173) with the TTS API proxy included.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state + localStorage persistence)
- ElevenLabs API (premium narration)
- Web Speech API (fallback TTS + speech recognition)

## Project Structure

```
src/
├── components/     # Reusable UI (buttons, pet avatar, nav bar)
├── data/           # Pets, lessons, shop items
├── pages/          # Screen components (home, learn, shop, etc.)
├── store/          # Game state management
├── types/          # TypeScript interfaces
└── utils/          # Audio/speech utilities
server/
├── elevenlabs.mjs  # Secure TTS proxy (API key stays server-side)
└── preview.mjs     # Production static server + TTS API
```

## Syllabus

Vocabulary is pitched at **Cambridge A1 Movers / A2 Flyers** level (ages 7–10), using free word lists from [Cambridge English Young Learners](https://www.cambridgeenglish.org/exams-and-tests/young-learners/) and themes inspired by early-reader books (family stories, school life, adventures).

**10 vocabulary packs** (60 words): family, school, feelings, adventure, weather, animals, town, action verbs, food, body & health.

**4 grammar lessons**: present continuous, comparatives, question words, past simple.

Word data lives in `src/data/syllabus.ts`.

## Roadmap

- [ ] More lesson packs (numbers, family, school)
- [ ] Pet evolution / leveling system
- [ ] Daily streaks and achievements
- [ ] Parent dashboard
- [ ] Offline PWA support
