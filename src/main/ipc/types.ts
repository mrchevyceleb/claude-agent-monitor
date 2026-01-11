// Re-export types for IPC usage
// These types are defined in types/global.d.ts but we reference them here for convenience

export type { AgentState, TodoItem, LogEntry, AgentDefinition, AppSettings }

// Serializable versions for IPC (Dates become strings)
export interface SerializedAgentState extends Omit<AgentState, 'startTime' | 'lastActivity'> {
  startTime: string | null
  lastActivity: string
}

export interface SerializedLogEntry extends Omit<LogEntry, 'timestamp'> {
  timestamp: string
}

// Convert AgentState to serializable format
export function serializeAgent(agent: AgentState): SerializedAgentState {
  return {
    ...agent,
    startTime: agent.startTime?.toISOString() ?? null,
    lastActivity: agent.lastActivity.toISOString(),
  }
}

// Convert LogEntry to serializable format
export function serializeLogEntry(entry: LogEntry): SerializedLogEntry {
  return {
    ...entry,
    timestamp: entry.timestamp.toISOString(),
  }
}

// Parse serialized AgentState back to original format
export function deserializeAgent(agent: SerializedAgentState): AgentState {
  return {
    ...agent,
    startTime: agent.startTime ? new Date(agent.startTime) : null,
    lastActivity: new Date(agent.lastActivity),
  }
}

// Parse serialized LogEntry back to original format
export function deserializeLogEntry(entry: SerializedLogEntry): LogEntry {
  return {
    ...entry,
    timestamp: new Date(entry.timestamp),
  }
}
