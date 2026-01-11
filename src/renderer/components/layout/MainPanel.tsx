import { useUIStore } from '../../stores/uiStore'
import { useAgent } from '../../hooks/useAgents'
import { AgentDetail } from '../agents/AgentDetail'
import { EmptyState } from '../common/EmptyState'
import { Bot } from 'lucide-react'

export function MainPanel() {
  const selectedAgentId = useUIStore((state) => state.selectedAgentId)
  const agent = useAgent(selectedAgentId)

  if (!selectedAgentId || !agent) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-base">
        <EmptyState
          icon={<Bot className="w-12 h-12" />}
          title="No agent selected"
          description="Select an agent from the sidebar to view details"
        />
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden bg-bg-base">
      <AgentDetail agent={agent} />
    </div>
  )
}
