import { cn } from '../../utils/cn'

interface AgentStatusProps {
  status: 'running' | 'idle' | 'error' | 'stopped'
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function AgentStatus({ status, size = 'md', showLabel = false }: AgentStatusProps) {
  const statusConfig = {
    running: {
      color: 'bg-status-running',
      label: 'Running',
      animate: true,
    },
    idle: {
      color: 'bg-status-idle',
      label: 'Idle',
      animate: false,
    },
    error: {
      color: 'bg-status-error',
      label: 'Error',
      animate: true,
    },
    stopped: {
      color: 'bg-status-stopped',
      label: 'Stopped',
      animate: false,
    },
  }

  const config = statusConfig[status]
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'rounded-full',
          dotSize,
          config.color,
          config.animate && 'animate-pulse-dot'
        )}
      />
      {showLabel && (
        <span className="text-xs text-text-secondary capitalize">{config.label}</span>
      )}
    </div>
  )
}
