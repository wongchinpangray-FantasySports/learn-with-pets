interface ProgressBarProps {
  label: string
  value: number
  emoji: string
  color: string
}

export function ProgressBar({ label, value, emoji, color }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="font-kid font-medium text-gray-700 text-sm">
          {emoji} {label}
        </span>
        <span className="font-kid font-bold text-sm text-gray-600">{value}%</span>
      </div>
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}
