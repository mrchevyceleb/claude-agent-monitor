import { Check, Circle, Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

interface TaskItemProps {
  task: TodoItem
}

export function TaskItem({ task }: TaskItemProps) {
  const statusConfig = {
    completed: {
      icon: Check,
      iconClass: 'text-status-completed',
      textClass: 'text-text-secondary line-through',
    },
    in_progress: {
      icon: Loader2,
      iconClass: 'text-accent animate-spin',
      textClass: 'text-text-primary',
    },
    pending: {
      icon: Circle,
      iconClass: 'text-text-disabled',
      textClass: 'text-text-secondary',
    },
  }

  const config = statusConfig[task.status]
  const Icon = config.icon

  return (
    <div className="flex items-start gap-2 px-4 py-2">
      <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.iconClass)} />
      <span className={cn('text-sm', config.textClass)}>
        {task.status === 'in_progress' ? task.activeForm : task.content}
      </span>
    </div>
  )
}
