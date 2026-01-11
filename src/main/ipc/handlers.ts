import { ipcMain } from 'electron'
import Store from 'electron-store'
import { IPC } from './channels'
import { AgentRegistry } from '../services/AgentRegistry'
import { FileWatcher } from '../services/FileWatcher'
import { logger } from '../utils/logger'

const store = new Store<AppSettings>({
  defaults: {
    sidebarWidth: 280,
    autoScroll: true,
    logLevel: 'INFO',
  },
})

export function setupIpcHandlers(registry: AgentRegistry, fileWatcher: FileWatcher): void {
  // Get all agents
  ipcMain.handle(IPC.GET_AGENTS, () => {
    return registry.getAll()
  })

  // Get a specific agent
  ipcMain.handle(IPC.GET_AGENT, (_, id: string) => {
    return registry.get(id)
  })

  // Get logs for an agent
  ipcMain.handle(IPC.GET_LOGS, (_, agentId: string, limit?: number) => {
    return registry.getLogs(agentId, limit)
  })

  // Stop an agent (graceful)
  ipcMain.handle(IPC.STOP_AGENT, async (_, id: string) => {
    logger.info(`Stopping agent: ${id}`)
    const agent = registry.get(id)
    if (agent) {
      registry.update(id, { status: 'stopped' })
      fileWatcher.notifyAgentsChanged()
    }
    // Note: Actually stopping requires knowing the process ID
    // For now, we just update the status
  })

  // Kill an agent (force)
  ipcMain.handle(IPC.KILL_AGENT, async (_, id: string) => {
    logger.info(`Killing agent: ${id}`)
    const agent = registry.get(id)
    if (agent) {
      registry.update(id, { status: 'stopped', error: 'Killed by user' })
      fileWatcher.notifyAgentsChanged()
    }
    // Note: Actually killing requires knowing the process ID
    // For now, we just update the status
  })

  // Refresh all agents
  ipcMain.handle(IPC.REFRESH, async () => {
    logger.info('Refreshing agents...')
    await registry.discover()
    fileWatcher.notifyAgentsChanged()
  })

  // Get settings
  ipcMain.handle(IPC.GET_SETTINGS, () => {
    return store.store
  })

  // Set settings
  ipcMain.handle(IPC.SET_SETTINGS, (_, settings: Partial<AppSettings>) => {
    for (const [key, value] of Object.entries(settings)) {
      store.set(key as keyof AppSettings, value)
    }
    return store.store
  })

  logger.info('IPC handlers registered')
}
