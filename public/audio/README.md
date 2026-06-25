# Background music (BGM)

Drop your royalty-free MP3 here as **`bgm.mp3`**.

The app will use it automatically. If the file is missing, the built-in synth loop plays instead.

## Recommended sources (free for commercial use)

1. **[Pixabay Music](https://pixabay.com/music/search/happy%20kids/)** — search “happy kids”, “cute ukulele”, etc.  
   License: [Pixabay Content License](https://pixabay.com/service/license/) (free for commercial use; no attribution required, but credit is appreciated).

2. Good starting tracks to preview:
   - [Jolly (Cute Kids Ukulele Music)](https://pixabay.com/music/happy-childrens-tunes-jolly-cute-kids-ukulele-music-329450/) — ~1:41, loops well
   - [Fun Happy Loop - Kids Energy](https://pixabay.com/music/happy-childrens-tunes-fun-happy-loop-kids-energy-357904/) — ~1:04, short loop

## Steps

1. Create a free Pixabay account (needed to download).
2. Listen to a few tracks and pick one that fits BB8 English.
3. Download **MP3**.
4. Rename the file to **`bgm.mp3`** and put it in this folder:
   ```
   public/audio/bgm.mp3
   ```
5. Restart dev server or redeploy:
   ```bash
   npm run dev
   ```
6. Open the app → tap once → you should hear the MP3 (not the synth beeps).

## Tips

- Prefer **loop-friendly** tracks (steady mood, no long intro/outro).
- Keep file size reasonable (under ~3 MB) for faster loads on mobile.
- If a composer asks for credit on Pixabay, add their name in your app’s About/Credits screen.

## After you add a file

Commit and push (the MP3 is safe to commit if the license allows it):

```bash
git add public/audio/bgm.mp3
git commit -m "Add royalty-free BGM track"
git push
```

Update `public/audio/CREDITS.txt` with track title and artist if you want to record attribution.
