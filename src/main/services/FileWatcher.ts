import { watch, FSWatcher } from 'chokidar'
import { BrowserWindow } from 'electron'
import { basename, dirname } from 'path'
import { getTodosDir, getDebugDir, getAgentsDir, extractAgentIdFromTodoFile, extractAgentIdFromDebugFile } from '../utils/paths'
import { AgentRegistry } from './AgentRegistry'
import { parseTodoFile } from './TodoParser'
import { parseAgentDef } from './AgentDefParser'
import { IPC } from '../ipc/channels'
import { logger } from '../utils/logger'

const WATCH_CONFIG = {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 100,
    pollInterval: 50,
  },
  usePolling: false,
  depth: 1,
  ignorePermissionErrors: true,
}

const DEBOUNCE = {
  todos: 50,
  debug: 100,
  agents: 500,
}

export class FileWatcher {
  private watcher: FSWatcher | null = null
  private registry: AgentRegistry
  private window: BrowserWindow
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(registry: AgentRegistry, window: BrowserWindow) {
    this.registry = registry
    this.window = window
  }

  start(): void {
    const watchPaths = [getTodosDir(), getDebugDir(), getAgentsDir()]

    logger.info('Starting file watcher for:', watchPaths.join(', '))

    this.watcher = watch(watchPaths, WATCH_CONFIG)

    this.watcher
      .on('add', (filepath) => this.handleFileChange(filepath, 'add'))
      .on('change', (filepath) => this.handleFileChange(filepath, 'change'))
      .on('unlink', (filepath) => this.handleFileChange(filepath, 'unlink'))
      .on('error', (error) => logger.error('Watcher error:', error.message))
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }

    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer)
    }
    this.debounceTimers.clear()
  }

  private handleFileChange(filepath: string, event: 'add' | 'change' | 'unlink'): void {
    const dir = dirname(filepath)
    const filename = basename(filepath)

    // Determine the type of file and appropriate debounce
    if (dir.endsWith('todos') && filename.endsWith('.json')) {
      this.debounce(`todo:${filepath}`, DEBOUNCE.todos, () => this.handleTodoChange(filepath, event))
    } else if (dir.endsWith('debug') && filename.endsWith('.txt')) {
      this.debounce(`debug:${filepath}`, DEBOUNCE.debug, () => this.handleDebugChange(filepath, event))
    } else if (dir.endsWith('agents') && filename.endsWith('.md')) {
      this.debounce(`agent:${filepath}`, DEBOUNCE.agents, () => this.handleAgentDefChange(filepath, event))
    }
  }

  private debounce(key: string, delay: number, callback: () => void): void {
    const existing = this.debounceTimers.get(key)
    if (existing) {
      clearTimeout(existing)
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(key)
      callback()
    }, delay)

    this.debounceTimers.set(key, timer)
  }

  private async handleTodoChange(filepath: string, event: 'add' | 'change' | 'unlink'): Promise<void> {
    const filename = basename(filepath)
    const agentId = extractAgentIdFromTodoFile(filename)

    if (!agentId) {
      return
    }

    logger.debug(`Todo ${event}: ${filename}`)

    if (event === 'unlink') {
      // Don't remove agent, just clear its tasks
      const agent = this.registry.get(agentId)
      if (agent) {
        this.registry.update(agentId, { tasks: [], status: 'stopped' })
        this.notifyAgentUpdated(agent)
      }
      return
    }

    const parsed = await parseTodoFile(filepath)
    if (!parsed) {
      return
    }

    // Update or create agent
    let agent = this.registry.get(agentId)
    if (agent) {
      const hasInProgress = parsed.todos.some((t) => t.status === 'in_progress')
      this.registry.update(agentId, {
        tasks: parsed.todos,
        todoFile: filepath,
        sessionId: parsed.sessionId,
        status: hasInProgress ? 'running' : agent.status === 'running' ? 'idle' : agent.status,
        lastActivity: new Date(),
        taskProgress: {
          completed: parsed.todos.filter((t) => t.status === 'completed').length,
          total: parsed.todos.length,
        },
      })
      agent = this.registry.get(agentId)!
    } else {
      // New agent discovered
      const hasInProgress = parsed.todos.some((t) => t.status === 'in_progress')
      agent = {
        id: agentId,
        sessionId: parsed.sessionId,
        name: `Agent ${agentId.slice(0, 8)}`,
        type: 'general',
        status: hasInProgress ? 'running' : 'idle',
        tasks: parsed.todos,
        taskProgress: {
          completed: parsed.todos.filter((t) => t.status === 'completed').length,
          total: parsed.todos.length,
        },
        logFile: '',
        todoFile: filepath,
        projectPath: null,
        startTime: new Date(),
        lastActivity: new Date(),
        error: null,
      }
      this.registry.add(agent)
    }

    this.notifyAgentUpdated(agent)
    this.notifyTasksUpdated(agentId, parsed.todos)
  }

  private async handleDebugChange(filepath: string, event: 'add' | 'change' | 'unlink'): Promise<void> {
    const filename = basename(filepath)
    const agentId = extractAgentIdFromDebugFile(filename)

    if (!agentId) {
      return
    }

    logger.debug(`Debug ${event}: ${filename}`)

    if (event === 'unlink') {
      return
    }

    // Update agent with log file path
    let agent = this.registry.get(agentId)
    if (agent) {
      this.registry.update(agentId, {
        logFile: filepath,
        lastActivity: new Date(),
      })
    } else {
      // Create new agent from debug file
      agent = {
        id: agentId,
        sessionId: null,
        name: `Agent ${agentId.slice(0, 8)}`,
        type: 'general',
        status: 'running',
        tasks: [],
        taskProgress: { completed: 0, total: 0 },
        logFile: filepath,
        todoFile: '',
        projectPath: null,
        startTime: new Date(),
        lastActivity: new Date(),
        error: null,
      }
      this.registry.add(agent)
    }

    // Read new log entries and notify
    const newEntries = await this.registry.readNewLogs(agentId)
    if (newEntries.length > 0) {
      this.notifyLogsAppended(agentId, newEntries)
    }
  }

  private async handleAgentDefChange(filepath: string, event: 'add' | 'change' | 'unlink'): Promise<void> {
    const filename = basename(filepath, '.md')
    logger.debug(`Agent def ${event}: ${filename}`)

    if (event === 'unlink') {
      return
    }

    const def = await parseAgentDef(filepath)
    if (def) {
      this.registry.setAgentDef(def.name, def)

      // Update any agents with this type
      for (const agent of this.registry.getAll()) {
        if (agent.type === def.name) {
          this.registry.update(agent.id, { name: def.name })
          this.notifyAgentUpdated(this.registry.get(agent.id)!)
        }
      }
    }
  }

  private notifyAgentUpdated(agent: AgentState): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(IPC.AGENT_UPDATED, agent)
    }
  }

  private notifyTasksUpdated(agentId: string, tasks: TodoItem[]): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(IPC.TASKS_UPDATED, agentId, tasks)
    }
  }

  private notifyLogsAppended(agentId: string, entries: LogEntry[]): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(IPC.LOGS_APPENDED, agentId, entries)
    }
  }

  notifyAgentsChanged(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(IPC.AGENTS_CHANGED, this.registry.getAll())
    }
  }
}
