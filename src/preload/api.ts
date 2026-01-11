import { ipcRenderer } from 'electron'

const IPC = {
  // Events: Main -> Renderer
  AGENTS_CHANGED: 'agents:changed',
  AGENT_UPDATED: 'agent:updated',
  TASKS_UPDATED: 'tasks:updated',
  LOGS_APPENDED: 'logs:appended',

  // Requests: Renderer -> Main
  GET_AGENTS: 'get:agents',
  GET_AGENT: 'get:agent',
  GET_LOGS: 'get:logs',
  GET_HISTORY: 'get:history',

  // Actions: Renderer -> Main
  STOP_AGENT: 'action:stop',
  KILL_AGENT: 'action:kill',
  REFRESH: 'action:refresh',

  // Settings
  GET_SETTINGS: 'settings:get',
  SET_SETTINGS: 'settings:set',
} as const

export const electronAPI: ElectronAPI = {
  // Subscriptions (return cleanup function)
  onAgentsChanged: (callback: (agents: AgentState[]) => void) => {
    const handler = (_: Electron.IpcRendererEvent, agents: AgentState[]) => callback(agents)
    ipcRenderer.on(IPC.AGENTS_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC.AGENTS_CHANGED, handler)
  },

  onAgentUpdated: (callback: (agent: AgentState) => void) => {
    const handler = (_: Electron.IpcRendererEvent, agent: AgentState) => callback(agent)
    ipcRenderer.on(IPC.AGENT_UPDATED, handler)
    return () => ipcRenderer.removeListener(IPC.AGENT_UPDATED, handler)
  },

  onTasksUpdated: (callback: (agentId: string, tasks: TodoItem[]) => void) => {
    const handler = (_: Electron.IpcRendererEvent, agentId: string, tasks: TodoItem[]) =>
      callback(agentId, tasks)
    ipcRenderer.on(IPC.TASKS_UPDATED, handler)
    return () => ipcRenderer.removeListener(IPC.TASKS_UPDATED, handler)
  },

  onLogsAppended: (callback: (agentId: string, entries: LogEntry[]) => void) => {
    const handler = (_: Electron.IpcRendererEvent, agentId: string, entries: LogEntry[]) =>
      callback(agentId, entries)
    ipcRenderer.on(IPC.LOGS_APPENDED, handler)
    return () => ipcRenderer.removeListener(IPC.LOGS_APPENDED, handler)
  },

  // Requests
  getAgents: () => ipcRenderer.invoke(IPC.GET_AGENTS),

  getAgent: (id: string) => ipcRenderer.invoke(IPC.GET_AGENT, id),

  getLogs: (agentId: string, limit?: number) => ipcRenderer.invoke(IPC.GET_LOGS, agentId, limit),

  // Actions
  stopAgent: (id: string) => ipcRenderer.invoke(IPC.STOP_AGENT, id),

  killAgent: (id: string) => ipcRenderer.invoke(IPC.KILL_AGENT, id),

  refresh: () => ipcRenderer.invoke(IPC.REFRESH),

  // Settings
  getSettings: () => ipcRenderer.invoke(IPC.GET_SETTINGS),

  setSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke(IPC.SET_SETTINGS, settings),
}
