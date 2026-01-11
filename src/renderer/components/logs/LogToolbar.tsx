import { Search, ArrowDown } from 'lucide-react'
import { Input } from '../common/Input'
import { Select } from '../common/Select'
import { Button } from '../common/Button'
import { cn } from '../../utils/cn'

interface LogToolbarProps {
  logLevel: string
  onLogLevelChange: (level: string) => void
  searchTerm: string
  onSearchChange: (search: string) => void
  autoScroll: boolean
  onAutoScrollChange: (enabled: boolean) => void
  logCount: number
}

export function LogToolbar({
  logLevel,
  onLogLevelChange,
  searchTerm,
  onSearchChange,
  autoScroll,
  onAutoScrollChange,
  logCount,
}: LogToolbarProps) {
  const levelOptions = [
    { value: 'ALL', label: 'All Levels' },
    { value: 'DEBUG', label: 'Debug' },
    { value: 'INFO', label: 'Info' },
    { value: 'WARN', label: 'Warn' },
    { value: 'ERROR', label: 'Error' },
  ]

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-bg-surface border-b border-border">
      <Select
        value={logLevel}
        onChange={(e) => onLogLevelChange(e.target.value)}
        options={levelOptions}
        className="w-28"
      />
      <Input
        type="text"
        placeholder="Search logs..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        icon={<Search className="w-4 h-4" />}
        className="flex-1 max-w-xs"
      />
      <Button
        variant={autoScroll ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onAutoScrollChange(!autoScroll)}
        title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
      >
        <ArrowDown className={cn('w-4 h-4', autoScroll && 'animate-bounce')} />
      </Button>
      <span className="text-xs text-text-disabled ml-auto">
        {logCount.toLocaleString()} entries
      </span>
    </div>
  )
}
