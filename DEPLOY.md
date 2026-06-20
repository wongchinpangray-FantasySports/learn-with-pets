# Deploy BB8 English Learning Tool

## What is already set up in this repo

- Production server: `server/preview.mjs` (static app + TTS API proxy)
- `render.yaml` — one-click deploy on [Render](https://render.com)
- `Dockerfile` — optional container deploy
- Build verified with `npm run build`

## Your steps (Render — recommended)

### 1. Push code to GitHub

```bash
git init
git add .
git commit -m "Prepare BB8 English for deployment"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. Create Render web service

1. Sign in at [render.com](https://render.com) → **New** → **Blueprint** (or **Web Service**)
2. Connect your GitHub repo
3. If using Blueprint, Render reads `render.yaml` automatically
4. If manual setup:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `node server/preview.mjs`
   - **Health check path:** `/api/tts/status`

### 3. Add environment variable (required for premium voice)

In Render → your service → **Environment**:

| Key | Value |
|-----|--------|
| `ELEVENLABS_API_KEY` | Your key from [elevenlabs.io](https://elevenlabs.io) → Profile → API Keys |

Do **not** commit this key to Git.

### 4. Deploy and test

1. Click **Deploy** and wait for the build to finish
2. Open your `https://….onrender.com` URL
3. Check bottom nav shows **✨ Premium voice**
4. Test **Learn** (audio) and **Practice** (microphone — use Chrome + HTTPS)

---

## Local production test (before or after deploy)

```bash
npm install
npm run build
# Set ELEVENLABS_API_KEY in .env first
npm run start:prod
```

Visit `http://localhost:4173` and `http://localhost:4173/api/tts/status`.

---

## Optional: Docker

```bash
docker build -t bb8-english .
docker run -p 4173:4173 -e ELEVENLABS_API_KEY=your_key_here bb8-english
```

---

## Notes

- **HTTPS** is required for microphone practice in browsers (Render provides this automatically).
- Progress and coins are saved in each browser via localStorage (no cloud accounts yet).
- Free Render tiers may sleep after inactivity; first visit can take ~30s to wake up.
