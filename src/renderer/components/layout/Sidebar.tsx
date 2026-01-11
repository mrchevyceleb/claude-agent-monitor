import { RefreshCw } from 'lucide-react'
import { useAgentStore } from '../../stores/agentStore'
import { useUIStore } from '../../stores/uiStore'
import { useAgentActions } from '../../hooks/useAgents'
import { AgentList } from '../agents/AgentList'
import { Button } from '../common/Button'
import { cn } from '../../utils/cn'

type StatusFilter = 'all' | 'running' | 'idle' | 'error'

export function Sidebar() {
  const agents = useAgentStore((state) => state.agents)
  const { statusFilter, setStatusFilter } = useUIStore()
  const { refresh } = useAgentActions()

  const runningCount = agents.filter((a) => a.status === 'running').length
  const idleCount = agents.filter((a) => a.status === 'idle').length
  const errorCount = agents.filter((a) => a.status === 'error').length

  const filteredAgents = agents.filter((agent) => {
    if (statusFilter === 'all') return true
    return agent.status === statusFilter
  })

  const filterOptions: { value: StatusFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: agents.length },
    { value: 'running', label: 'Running', count: runningCount },
    { value: 'idle', label: 'Idle', count: idleCount },
    { value: 'error', label: 'Error', count: errorCount },
  ]

  return (
    <div className="h-full flex flex-col bg-bg-surface border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary">Agents</h2>
        <Button variant="ghost" size="sm" onClick={refresh} title="Refresh agents">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Agent list */}
      <div className="flex-1 overflow-auto">
        <AgentList agents={filteredAgents} />
      </div>

      {/* Filter */}
      <div className="border-t border-border p-3">
        <div className="text-xs font-medium text-text-secondary mb-2">Filter</div>
        <div className="space-y-1">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                'w-full flex items-center justify-between px-2 py-1 rounded text-sm transition-colors',
                statusFilter === option.value
                  ? 'bg-bg-active text-accent'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              )}
            >
              <span>{option.label}</span>
              <span className="text-xs">{option.count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
