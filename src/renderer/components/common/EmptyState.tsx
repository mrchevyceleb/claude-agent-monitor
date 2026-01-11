import { cn } from '../../utils/cn'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      {icon && <div className="text-text-disabled mb-4">{icon}</div>}
      <h3 className="text-text-secondary font-medium mb-1">{title}</h3>
      {description && <p className="text-text-disabled text-sm text-center mb-4">{description}</p>}
      {action}
    </div>
  )
}
