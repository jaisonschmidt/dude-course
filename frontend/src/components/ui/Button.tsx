'use client'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  variant?: ButtonVariant
  className?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
}

export function Button({
  children,
  onClick,
  disabled = false,
  type = 'button',
  loading = false,
  variant = 'primary',
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`rounded-lg px-4 py-2 font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {loading ? 'Carregando...' : children}
    </button>
  )
}
