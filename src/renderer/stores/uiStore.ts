import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type StatusFilter = 'all' | 'running' | 'idle' | 'error'
type LogLevel = 'ALL' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

interface UIStore {
  // Selected agent
  selectedAgentId: string | null
  setSelectedAgentId: (id: string | null) => void

  // Sidebar
  sidebarWidth: number
  setSidebarWidth: (width: number) => void

  // Agent filter
  statusFilter: StatusFilter
  setStatusFilter: (filter: StatusFilter) => void

  // Log viewer
  logLevel: LogLevel
  setLogLevel: (level: LogLevel) => void
  logSearch: string
  setLogSearch: (search: string) => void
  autoScroll: boolean
  setAutoScroll: (enabled: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Selected agent
      selectedAgentId: null,
      setSelectedAgentId: (id) => set({ selectedAgentId: id }),

      // Sidebar
      sidebarWidth: 280,
      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      // Agent filter
      statusFilter: 'all',
      setStatusFilter: (filter) => set({ statusFilter: filter }),

      // Log viewer
      logLevel: 'ALL',
      setLogLevel: (level) => set({ logLevel: level }),
      logSearch: '',
      setLogSearch: (search) => set({ logSearch: search }),
      autoScroll: true,
      setAutoScroll: (enabled) => set({ autoScroll: enabled }),
    }),
    {
      name: 'claude-agent-monitor-ui',
      partialize: (state) => ({
        sidebarWidth: state.sidebarWidth,
        autoScroll: state.autoScroll,
        logLevel: state.logLevel,
      }),
    }
  )
)
