import { ReactNode } from 'react'

interface BigButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'md' | 'lg' | 'xl'
  disabled?: boolean
  className?: string
}

const variants = {
  primary: 'bg-berry hover:bg-berry-dark text-white shadow-lg shadow-berry/30',
  secondary: 'bg-sun hover:bg-sun-dark text-gray-800 shadow-lg shadow-sun/30',
  success: 'bg-mint hover:bg-mint-light text-white shadow-lg shadow-mint/30',
  danger: 'bg-red-400 hover:bg-red-500 text-white shadow-lg',
  ghost: 'bg-white/80 hover:bg-white text-gray-700 shadow-md',
}

const sizes = {
  md: 'px-6 py-3 text-lg',
  lg: 'px-8 py-4 text-xl',
  xl: 'px-10 py-5 text-2xl',
}

export function BigButton({
  children,
  onClick,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  className = '',
}: BigButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        font-kid font-semibold rounded-2xl transition-all duration-200
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </button>
  )
}
