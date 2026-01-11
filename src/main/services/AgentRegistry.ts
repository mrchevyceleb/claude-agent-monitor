import { join } from 'path'
import { getDebugDir } from '../utils/paths'
import { discoverTodos, calculateProgress, determineStatusFromTodos } from './TodoParser'
import { discoverDebugFiles, LogStreamer } from './LogStreamer'
import { discoverAgentDefs } from './AgentDefParser'
import { logger } from '../utils/logger'

export class AgentRegistry {
  private agents: Map<string, AgentState> = new Map()
  private agentDefs: Map<string, AgentDefinition> = new Map()
  private logStreamer: LogStreamer

  constructor() {
    this.logStreamer = new LogStreamer(10000)
  }

  /**
   * Discover agents from existing todo and debug files
   */
  async discover(): Promise<void> {
    logger.info('Discovering agents...')

    // Load agent definitions
    this.agentDefs = await discoverAgentDefs()
    logger.info(`Found ${this.agentDefs.size} agent definitions`)

    // Discover todos
    const todos = await discoverTodos()
    const debugFiles = await discoverDebugFiles()

    // Create agents from todos
    for (const todo of todos) {
      const logFile = debugFiles.get(todo.agentId) || ''
      const progress = calculateProgress(todo.todos)
      const status = determineStatusFromTodos(todo.todos)

      // Try to match with an agent definition
      let name = `Agent ${todo.agentId.slice(0, 8)}`
      let type = 'general'

      const agent: AgentState = {
        id: todo.agentId,
        sessionId: todo.sessionId,
        name,
        type,
        status,
        tasks: todo.todos,
        taskProgress: progress,
        logFile,
        todoFile: todo.filepath,
        projectPath: null,
        startTime: null,
        lastActivity: new Date(),
        error: null,
      }

      this.agents.set(todo.agentId, agent)

      // Initialize log streamer if we have a log file
      if (logFile) {
        await this.logStreamer.init(todo.agentId, logFile)
      }
    }

    // Create agents from debug files that don't have todos
    for (const [agentId, logFile] of debugFiles) {
      if (!this.agents.has(agentId)) {
        const agent: AgentState = {
          id: agentId,
          sessionId: null,
          name: `Agent ${agentId.slice(0, 8)}`,
          type: 'general',
          status: 'idle',
          tasks: [],
          taskProgress: { completed: 0, total: 0 },
          logFile,
          todoFile: '',
          projectPath: null,
          startTime: null,
          lastActivity: new Date(),
          error: null,
        }

        this.agents.set(agentId, agent)
        await this.logStreamer.init(agentId, logFile)
      }
    }

    logger.info(`Discovered ${this.agents.size} agents`)
  }

  /**
   * Get all agents sorted by activity (running first, then by lastActivity)
   */
  getAll(): AgentState[] {
    return Array.from(this.agents.values()).sort((a, b) => {
      // Running agents first
      if (a.status === 'running' && b.status !== 'running') return -1
      if (a.status !== 'running' && b.status === 'running') return 1

      // Error agents second
      if (a.status === 'error' && b.status !== 'error') return -1
      if (a.status !== 'error' && b.status === 'error') return 1

      // Then by last activity
      return b.lastActivity.getTime() - a.lastActivity.getTime()
    })
  }

  /**
   * Get a specific agent by ID
   */
  get(id: string): AgentState | null {
    return this.agents.get(id) || null
  }

  /**
   * Add a new agent
   */
  add(agent: AgentState): void {
    this.agents.set(agent.id, agent)

    // Initialize log streamer if we have a log file
    if (agent.logFile && !this.logStreamer.has(agent.id)) {
      this.logStreamer.init(agent.id, agent.logFile)
    }
  }

  /**
   * Update an existing agent
   */
  update(id: string, updates: Partial<AgentState>): void {
    const agent = this.agents.get(id)
    if (agent) {
      Object.assign(agent, updates)

      // Initialize log streamer if log file was added
      if (updates.logFile && !this.logStreamer.has(id)) {
        this.logStreamer.init(id, updates.logFile)
      }
    }
  }

  /**
   * Remove an agent
   */
  remove(id: string): void {
    this.agents.delete(id)
    this.logStreamer.clear(id)
  }

  /**
   * Get log entries for an agent
   */
  getLogs(agentId: string, limit?: number): LogEntry[] {
    return this.logStreamer.getEntries(agentId, limit)
  }

  /**
   * Read new log entries for an agent
   */
  async readNewLogs(agentId: string): Promise<LogEntry[]> {
    const agent = this.agents.get(agentId)
    if (!agent || !agent.logFile) {
      return []
    }

    // Initialize if not already
    if (!this.logStreamer.has(agentId)) {
      await this.logStreamer.init(agentId, agent.logFile)
      return this.logStreamer.getEntries(agentId)
    }

    return this.logStreamer.readNew(agentId)
  }

  /**
   * Set an agent definition
   */
  setAgentDef(name: string, def: AgentDefinition): void {
    this.agentDefs.set(name, def)
  }

  /**
   * Get an agent definition by name
   */
  getAgentDef(name: string): AgentDefinition | null {
    return this.agentDefs.get(name) || null
  }

  /**
   * Get all agent definitions
   */
  getAllDefs(): AgentDefinition[] {
    return Array.from(this.agentDefs.values())
  }

  /**
   * Get count of running agents
   */
  getRunningCount(): number {
    return Array.from(this.agents.values()).filter((a) => a.status === 'running').length
  }

  /**
   * Get count of agents with errors
   */
  getErrorCount(): number {
    return Array.from(this.agents.values()).filter((a) => a.status === 'error').length
  }
}
