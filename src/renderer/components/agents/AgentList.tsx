import { useUIStore } from '../../stores/uiStore'
import { AgentCard } from './AgentCard'
import { EmptyState } from '../common/EmptyState'
import { Bot } from 'lucide-react'

interface AgentListProps {
  agents: AgentState[]
}

export function AgentList({ agents }: AgentListProps) {
  const { selectedAgentId, setSelectedAgentId } = useUIStore()

  if (agents.length === 0) {
    return (
      <EmptyState
        icon={<Bot className="w-8 h-8" />}
        title="No agents"
        description="No agents match the current filter"
        className="py-8"
      />
    )
  }

  return (
    <div className="divide-y divide-border">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          isSelected={agent.id === selectedAgentId}
          onClick={() => setSelectedAgentId(agent.id)}
        />
      ))}
    </div>
  )
}
