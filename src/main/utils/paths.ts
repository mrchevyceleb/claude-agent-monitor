import { homedir } from 'os'
import { join } from 'path'

/**
 * Get the Claude Code data directory path
 * On Windows: C:\Users\{user}\.claude
 * On macOS/Linux: ~/.claude
 */
export function getClaudeDir(): string {
  return join(homedir(), '.claude')
}

/**
 * Get the todos directory path
 */
export function getTodosDir(): string {
  return join(getClaudeDir(), 'todos')
}

/**
 * Get the debug logs directory path
 */
export function getDebugDir(): string {
  return join(getClaudeDir(), 'debug')
}

/**
 * Get the agents definitions directory path
 */
export function getAgentsDir(): string {
  return join(getClaudeDir(), 'agents')
}

/**
 * Get the projects directory path
 */
export function getProjectsDir(): string {
  return join(getClaudeDir(), 'projects')
}

/**
 * Get the plans directory path
 */
export function getPlansDir(): string {
  return join(getClaudeDir(), 'plans')
}

/**
 * Get the main config file path
 */
export function getConfigPath(): string {
  return join(getClaudeDir(), '.claude.json')
}

/**
 * Extract agent ID from a todo filename
 * Format: {SESSION_UUID}-agent-{AGENT_UUID}.json
 */
export function extractAgentIdFromTodoFile(filename: string): string | null {
  const match = filename.match(/-agent-([a-f0-9-]+)\.json$/)
  return match ? match[1] : null
}

/**
 * Extract session ID from a todo filename
 * Format: {SESSION_UUID}-agent-{AGENT_UUID}.json
 */
export function extractSessionIdFromTodoFile(filename: string): string | null {
  const match = filename.match(/^([a-f0-9-]+)-agent-/)
  return match ? match[1] : null
}

/**
 * Extract agent ID from a debug log filename
 * Format: {AGENT_UUID}.txt
 */
export function extractAgentIdFromDebugFile(filename: string): string | null {
  const match = filename.match(/^([a-f0-9-]+)\.txt$/)
  return match ? match[1] : null
}
