import { create } from 'zustand'

interface LogStore {
  logs: Map<string, LogEntry[]>
  isLoading: Map<string, boolean>

  // Actions
  setLogs: (agentId: string, entries: LogEntry[]) => void
  appendLogs: (agentId: string, entries: LogEntry[]) => void
  clearLogs: (agentId: string) => void
  setLoading: (agentId: string, loading: boolean) => void

  // Selectors
  getLogs: (agentId: string) => LogEntry[]
  getFilteredLogs: (agentId: string, level?: string, search?: string) => LogEntry[]
}

const MAX_LOG_ENTRIES = 10000

export const useLogStore = create<LogStore>((set, get) => ({
  logs: new Map(),
  isLoading: new Map(),

  setLogs: (agentId, entries) =>
    set((state) => {
      const newLogs = new Map(state.logs)
      newLogs.set(agentId, entries.slice(-MAX_LOG_ENTRIES))
      return { logs: newLogs }
    }),

  appendLogs: (agentId, entries) =>
    set((state) => {
      const newLogs = new Map(state.logs)
      const existing = newLogs.get(agentId) || []
      const combined = [...existing, ...entries].slice(-MAX_LOG_ENTRIES)
      newLogs.set(agentId, combined)
      return { logs: newLogs }
    }),

  clearLogs: (agentId) =>
    set((state) => {
      const newLogs = new Map(state.logs)
      newLogs.delete(agentId)
      return { logs: newLogs }
    }),

  setLoading: (agentId, loading) =>
    set((state) => {
      const newLoading = new Map(state.isLoading)
      newLoading.set(agentId, loading)
      return { isLoading: newLoading }
    }),

  getLogs: (agentId) => get().logs.get(agentId) || [],

  getFilteredLogs: (agentId, level, search) => {
    let logs = get().logs.get(agentId) || []

    if (level && level !== 'ALL') {
      const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR']
      const minLevel = levels.indexOf(level)
      logs = logs.filter((log) => levels.indexOf(log.level) >= minLevel)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      logs = logs.filter((log) => log.message.toLowerCase().includes(searchLower))
    }

    return logs
  },
}))
