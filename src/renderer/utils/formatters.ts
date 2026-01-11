import { formatDistanceToNow, format } from 'date-fns'

export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return 'Never'
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'HH:mm:ss')
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d, yyyy HH:mm:ss')
}

export function formatAgentId(id: string): string {
  return id.slice(0, 8)
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural || `${singular}s`
}

export function formatTaskProgress(completed: number, total: number): string {
  if (total === 0) return 'No tasks'
  return `${completed}/${total} ${pluralize(total, 'task')}`
}
