import { memo } from 'react'
import { cn } from '../../utils/cn'
import { formatTime } from '../../utils/formatters'

interface LogLineProps {
  entry: LogEntry
  style?: React.CSSProperties
  searchTerm?: string
}

const levelColors = {
  DEBUG: 'text-log-debug',
  INFO: 'text-log-info',
  WARN: 'text-log-warn',
  ERROR: 'text-log-error',
}

function highlightSearch(text: string, searchTerm?: string): React.ReactNode {
  if (!searchTerm) return text

  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <mark key={i} className="bg-accent/30 text-text-primary rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export const LogLine = memo(function LogLine({ entry, style, searchTerm }: LogLineProps) {
  const timestamp = typeof entry.timestamp === 'string'
    ? new Date(entry.timestamp)
    : entry.timestamp

  return (
    <div
      style={style}
      className={cn(
        'flex items-start gap-2 px-4 py-0.5 font-mono text-xs hover:bg-bg-hover',
        entry.level === 'ERROR' && 'bg-status-error/5'
      )}
    >
      <span className="text-text-disabled flex-shrink-0 w-16">
        {formatTime(timestamp)}
      </span>
      <span className={cn('flex-shrink-0 w-12', levelColors[entry.level])}>
        {entry.level}
      </span>
      <span className="text-text-primary flex-1 break-all">
        {highlightSearch(entry.message, searchTerm)}
      </span>
    </div>
  )
})
