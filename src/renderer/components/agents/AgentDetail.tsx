import { AgentStatus } from './AgentStatus'
import { AgentControls } from './AgentControls'
import { TaskQueue } from '../tasks/TaskQueue'
import { LogViewer } from '../logs/LogViewer'
import { formatRelativeTime, formatAgentId } from '../../utils/formatters'

interface AgentDetailProps {
  agent: AgentState
}

export function AgentDetail({ agent }: AgentDetailProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {agent.name || `Agent ${formatAgentId(agent.id)}`}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <AgentStatus status={agent.status} showLabel />
              <span className="text-xs text-text-disabled">
                ID: {formatAgentId(agent.id)}
              </span>
              {agent.startTime && (
                <span className="text-xs text-text-disabled">
                  Started {formatRelativeTime(agent.startTime)}
                </span>
              )}
            </div>
            {agent.projectPath && (
              <div className="mt-2 text-xs text-text-secondary font-mono truncate">
                {agent.projectPath}
              </div>
            )}
            {agent.error && (
              <div className="mt-2 text-xs text-status-error">
                {agent.error}
              </div>
            )}
          </div>
          <AgentControls agentId={agent.id} status={agent.status} />
        </div>
      </div>

      {/* Tasks section */}
      {agent.tasks.length > 0 && (
        <div className="flex-shrink-0 border-b border-border">
          <div className="px-4 py-2 bg-bg-surface">
            <h3 className="text-sm font-medium text-text-secondary">
              Tasks ({agent.taskProgress.completed}/{agent.taskProgress.total} completed)
            </h3>
          </div>
          <div className="max-h-48 overflow-auto">
            <TaskQueue tasks={agent.tasks} />
          </div>
        </div>
      )}

      {/* Logs section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 bg-bg-surface border-b border-border">
          <h3 className="text-sm font-medium text-text-secondary">Logs</h3>
        </div>
        <div className="flex-1 min-h-0">
          <LogViewer agentId={agent.id} />
        </div>
      </div>
    </div>
  )
}
