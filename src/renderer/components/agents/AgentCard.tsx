import { cn } from '../../utils/cn'
import { AgentStatus } from './AgentStatus'
import { formatRelativeTime, formatAgentId, formatTaskProgress } from '../../utils/formatters'

interface AgentCardProps {
  agent: AgentState
  isSelected: boolean
  onClick: () => void
}

export function AgentCard({ agent, isSelected, onClick }: AgentCardProps) {
  const hasActiveTasks = agent.tasks.some((t) => t.status === 'in_progress')

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 transition-colors',
        isSelected ? 'bg-bg-active' : 'hover:bg-bg-hover',
        agent.status === 'error' && 'border-l-2 border-status-error'
      )}
    >
      <div className="flex items-start gap-2">
        <AgentStatus status={agent.status} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium truncate', isSelected && 'text-accent')}>
              {agent.name || `Agent ${formatAgentId(agent.id)}`}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-text-secondary capitalize">
              {agent.status}
            </span>
            {agent.taskProgress.total > 0 && (
              <>
                <span className="text-text-disabled">·</span>
                <span className="text-xs text-text-secondary">
                  {formatTaskProgress(agent.taskProgress.completed, agent.taskProgress.total)}
                </span>
              </>
            )}
          </div>
          {hasActiveTasks && (
            <div className="mt-1 text-xs text-text-disabled truncate">
              {agent.tasks.find((t) => t.status === 'in_progress')?.activeForm}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
