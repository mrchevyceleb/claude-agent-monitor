import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
      primary: 'bg-accent text-white hover:bg-accent-hover',
      secondary: 'bg-bg-elevated text-text-primary hover:bg-bg-hover border border-border',
      danger: 'bg-status-error text-white hover:bg-red-600',
      ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
    }

    const sizeClasses = {
      sm: 'h-7 px-2 text-xs rounded',
      md: 'h-8 px-3 text-sm rounded-md',
      lg: 'h-10 px-4 text-base rounded-md',
    }

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="mr-2" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
