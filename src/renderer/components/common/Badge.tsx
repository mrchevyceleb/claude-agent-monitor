import { cn } from '../../utils/cn'

interface BadgeProps {
  variant?: 'default' | 'running' | 'idle' | 'error' | 'pending'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variantClasses = {
    default: 'bg-bg-elevated text-text-secondary',
    running: 'bg-status-running/20 text-status-running',
    idle: 'bg-status-idle/20 text-status-idle',
    error: 'bg-status-error/20 text-status-error',
    pending: 'bg-status-pending/20 text-status-pending',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
