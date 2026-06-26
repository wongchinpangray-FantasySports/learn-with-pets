import { useGameStore } from '../store/gameStore'

const SPEED_LABELS: Record<number, string> = {
  0.5: 'Super slow 🐢',
  0.6: 'Very slow',
  0.75: 'Just right 👍',
  0.9: 'A bit faster',
  1.1: 'Fast 🚀',
}

function labelForSpeed(speed: number): string {
  const closest = Object.keys(SPEED_LABELS)
    .map(Number)
    .reduce((prev, curr) =>
      Math.abs(curr - speed) < Math.abs(prev - speed) ? curr : prev
    )
  return SPEED_LABELS[closest] ?? 'Just right'
}

export function NarrationSpeedControl({ compact = false }: { compact?: boolean }) {
  const { narrationSpeed, setNarrationSpeed } = useGameStore()

  if (compact) {
    return (
      <div className="rounded-xl bg-purple-50/80 border border-purple-100 px-3 py-2">
        <div className="flex items-center gap-3">
          <span className="font-kid text-xs font-semibold text-gray-600 shrink-0">
            🐾 Speed
          </span>
          <input
            type="range"
            min={0.5}
            max={1.1}
            step={0.05}
            value={narrationSpeed}
            onChange={(e) => setNarrationSpeed(parseFloat(e.target.value))}
            className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-grape min-w-0"
            aria-label="Voice speed for all lessons"
          />
          <span className="font-kid text-[10px] text-grape font-medium shrink-0 w-16 text-right">
            {labelForSpeed(narrationSpeed)}
          </span>
        </div>
        <p className="font-kid text-[10px] text-gray-400 mt-1 text-center">
          Saved for Learn &amp; Challenge too
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-purple-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-kid font-semibold text-gray-700 text-sm">
          🐾 Voice speed
        </span>
        <span className="font-kid text-xs text-grape font-medium">
          {labelForSpeed(narrationSpeed)}
        </span>
      </div>
      <input
        type="range"
        min={0.5}
        max={1.1}
        step={0.05}
        value={narrationSpeed}
        onChange={(e) => setNarrationSpeed(parseFloat(e.target.value))}
        className="w-full h-3 rounded-full appearance-none cursor-pointer accent-grape"
        aria-label="Narration speed"
      />
      <div className="flex justify-between font-kid text-xs text-gray-400 mt-1">
        <span>Slower</span>
        <span>Faster</span>
      </div>
      <p className="font-kid text-xs text-gray-400 mt-2 text-center">
        Applies to all lessons and challenges
      </p>
    </div>
  )
}
