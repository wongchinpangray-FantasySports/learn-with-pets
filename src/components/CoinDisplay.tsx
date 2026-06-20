interface CoinDisplayProps {
  amount: number
  size?: 'sm' | 'md' | 'lg'
}

export function CoinDisplay({ amount, size = 'md' }: CoinDisplayProps) {
  const sizes = {
    sm: 'text-base px-3 py-1',
    md: 'text-xl px-4 py-2',
    lg: 'text-2xl px-5 py-3',
  }

  return (
    <div
      className={`
        inline-flex items-center gap-2 bg-sun/90 rounded-full font-kid font-bold
        text-amber-900 shadow-md border-2 border-sun-dark
        ${sizes[size]}
      `}
    >
      <span className="animate-bounceSlow">🪙</span>
      <span>{amount}</span>
    </div>
  )
}
