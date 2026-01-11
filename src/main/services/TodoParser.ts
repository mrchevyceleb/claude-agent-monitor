import { promises as fs } from 'fs'
import { join, basename } from 'path'
import { getTodosDir, extractAgentIdFromTodoFile, extractSessionIdFromTodoFile } from '../utils/paths'
import { safeReadJson } from '../utils/safeRead'
import { logger } from '../utils/logger'

export interface ParsedTodo {
  agentId: string
  sessionId: string | null
  filepath: string
  todos: TodoItem[]
}

/**
 * Parse a single todo file
 */
export async function parseTodoFile(filepath: string): Promise<ParsedTodo | null> {
  const filename = basename(filepath)
  const agentId = extractAgentIdFromTodoFile(filename)
  const sessionId = extractSessionIdFromTodoFile(filename)

  if (!agentId) {
    logger.warn(`Could not extract agent ID from: ${filename}`)
    return null
  }

  const todos = await safeReadJson<TodoItem[]>(filepath)
  if (!todos) {
    return {
      agentId,
      sessionId,
      filepath,
      todos: [],
    }
  }

  return {
    agentId,
    sessionId,
    filepath,
    todos,
  }
}

/**
 * Discover all todo files and parse them
 */
export async function discoverTodos(): Promise<ParsedTodo[]> {
  const todosDir = getTodosDir()
  const results: ParsedTodo[] = []

  try {
    const files = await fs.readdir(todosDir)
    const todoFiles = files.filter((f) => f.endsWith('.json') && f.includes('-agent-'))

    for (const file of todoFiles) {
      const filepath = join(todosDir, file)
      const parsed = await parseTodoFile(filepath)
      if (parsed) {
        results.push(parsed)
      }
    }
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      logger.error('Error discovering todos:', err.message)
    }
  }

  return results
}

/**
 * Calculate task progress from todo items
 */
export function calculateProgress(todos: TodoItem[]): { completed: number; total: number } {
  const total = todos.length
  const completed = todos.filter((t) => t.status === 'completed').length
  return { completed, total }
}

/**
 * Determine agent status from todo items
 */
export function determineStatusFromTodos(todos: TodoItem[]): 'running' | 'idle' {
  const hasInProgress = todos.some((t) => t.status === 'in_progress')
  return hasInProgress ? 'running' : 'idle'
}
