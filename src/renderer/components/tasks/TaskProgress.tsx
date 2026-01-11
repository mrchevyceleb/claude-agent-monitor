import { cn } from '../../utils/cn'

interface TaskProgressProps {
  completed: number
  total: number
  className?: string
}

export function TaskProgress({ completed, total, className }: TaskProgressProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0

  return (
    <div className={cn('w-full', className)}>
      <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-status-completed transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
