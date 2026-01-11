import { useState } from 'react'
import { Square, XCircle } from 'lucide-react'
import { Button } from '../common/Button'
import { useAgentActions } from '../../hooks/useAgents'

interface AgentControlsProps {
  agentId: string
  status: string
}

export function AgentControls({ agentId, status }: AgentControlsProps) {
  const { stopAgent, killAgent } = useAgentActions()
  const [isConfirmingKill, setIsConfirmingKill] = useState(false)

  const handleStop = async () => {
    await stopAgent(agentId)
  }

  const handleKill = async () => {
    if (!isConfirmingKill) {
      setIsConfirmingKill(true)
      // Auto-reset after 3 seconds
      setTimeout(() => setIsConfirmingKill(false), 3000)
      return
    }

    await killAgent(agentId)
    setIsConfirmingKill(false)
  }

  const isActive = status === 'running' || status === 'idle'

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleStop}
        disabled={!isActive}
        title="Stop agent gracefully"
      >
        <Square className="w-3 h-3 mr-1" />
        Stop
      </Button>
      <Button
        variant={isConfirmingKill ? 'danger' : 'secondary'}
        size="sm"
        onClick={handleKill}
        disabled={!isActive}
        title="Force kill agent"
      >
        <XCircle className="w-3 h-3 mr-1" />
        {isConfirmingKill ? 'Confirm Kill' : 'Kill'}
      </Button>
    </div>
  )
}
