export const IPC = {
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

export type IPCChannel = (typeof IPC)[keyof typeof IPC]
