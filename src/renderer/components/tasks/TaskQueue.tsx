import { TaskItem } from './TaskItem'
import { TaskProgress } from './TaskProgress'
import { EmptyState } from '../common/EmptyState'
import { ListTodo } from 'lucide-react'

interface TaskQueueProps {
  tasks: TodoItem[]
  showProgress?: boolean
}

export function TaskQueue({ tasks, showProgress = true }: TaskQueueProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ListTodo className="w-6 h-6" />}
        title="No tasks"
        description="This agent has no tasks"
        className="py-6"
      />
    )
  }

  const completed = tasks.filter((t) => t.status === 'completed').length
  const total = tasks.length

  return (
    <div>
      {showProgress && (
        <div className="px-4 py-2">
          <TaskProgress completed={completed} total={total} />
        </div>
      )}
      <div className="divide-y divide-border-muted">
        {tasks.map((task, index) => (
          <TaskItem key={`${task.content}-${index}`} task={task} />
        ))}
      </div>
    </div>
  )
}
