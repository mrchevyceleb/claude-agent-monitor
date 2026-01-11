// === Agent State ===
interface AgentState {
  id: string
  sessionId: string | null
  name: string
  type: string
  status: 'running' | 'idle' | 'error' | 'stopped'
  tasks: TodoItem[]
  taskProgress: { completed: number; total: number }
  logFile: string
  todoFile: string
  projectPath: string | null
  startTime: Date | null
  lastActivity: Date
  error: string | null
}

// === Todo Item ===
interface TodoItem {
  content: string
  status: 'pending' | 'in_progress' | 'completed'
  activeForm: string
}

// === Log Entry ===
interface LogEntry {
  id: string
  timestamp: Date
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  message: string
  raw: string
}

// === Agent Definition (from agents/*.md) ===
interface AgentDefinition {
  name: string
  description: string
  model: 'haiku' | 'sonnet' | 'opus'
  color: string
  instructions: string
}

// === Electron API exposed via preload ===
interface ElectronAPI {
  // Subscriptions (return cleanup function)
  onAgentsChanged: (callback: (agents: AgentState[]) => void) => () => void
  onAgentUpdated: (callback: (agent: AgentState) => void) => () => void
  onTasksUpdated: (callback: (agentId: string, tasks: TodoItem[]) => void) => () => void
  onLogsAppended: (callback: (agentId: string, entries: LogEntry[]) => void) => () => void

  // Requests
  getAgents: () => Promise<AgentState[]>
  getAgent: (id: string) => Promise<AgentState | null>
  getLogs: (agentId: string, limit?: number) => Promise<LogEntry[]>

  // Actions
  stopAgent: (id: string) => Promise<void>
  killAgent: (id: string) => Promise<void>
  refresh: () => Promise<void>

  // Settings
  getSettings: () => Promise<AppSettings>
  setSettings: (settings: Partial<AppSettings>) => Promise<void>
}

interface AppSettings {
  sidebarWidth: number
  autoScroll: boolean
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
