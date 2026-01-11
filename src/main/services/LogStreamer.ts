import { promises as fs } from 'fs'
import { join, basename } from 'path'
import { getDebugDir, extractAgentIdFromDebugFile } from '../utils/paths'
import { readFromPosition, safeStats } from '../utils/safeRead'
import { logger } from '../utils/logger'

const LOG_REGEX = /^(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\s+\[(\w+)\]\s+(.*)$/

export interface LogBuffer {
  agentId: string
  filepath: string
  position: number
  entries: LogEntry[]
}

/**
 * Parse a single log line into a LogEntry
 */
export function parseLogLine(line: string, index: number): LogEntry | null {
  const match = line.match(LOG_REGEX)
  if (!match) {
    // Handle lines that don't match the format (continuation lines, etc.)
    if (line.trim()) {
      return {
        id: `log-${index}-${Date.now()}`,
        timestamp: new Date(),
        level: 'DEBUG',
        message: line,
        raw: line,
      }
    }
    return null
  }

  return {
    id: `log-${index}-${Date.now()}`,
    timestamp: new Date(match[1]),
    level: match[2] as LogEntry['level'],
    message: match[3],
    raw: line,
  }
}

/**
 * Parse multiple log lines
 */
export function parseLogContent(content: string, startIndex: number = 0): LogEntry[] {
  const lines = content.split('\n')
  const entries: LogEntry[] = []

  for (let i = 0; i < lines.length; i++) {
    const entry = parseLogLine(lines[i], startIndex + i)
    if (entry) {
      entries.push(entry)
    }
  }

  return entries
}

/**
 * LogStreamer class for efficient log file tailing
 */
export class LogStreamer {
  private buffers: Map<string, LogBuffer> = new Map()
  private maxEntries: number

  constructor(maxEntries: number = 10000) {
    this.maxEntries = maxEntries
  }

  /**
   * Initialize a log buffer for an agent
   */
  async init(agentId: string, filepath: string): Promise<LogEntry[]> {
    const content = await this.readFull(filepath)
    const entries = parseLogContent(content)

    // Keep only the last maxEntries
    const trimmedEntries = entries.slice(-this.maxEntries)

    const stats = await safeStats(filepath)
    const position = stats?.size ?? 0

    this.buffers.set(agentId, {
      agentId,
      filepath,
      position,
      entries: trimmedEntries,
    })

    return trimmedEntries
  }

  /**
   * Read new content from a log file since last position
   */
  async readNew(agentId: string): Promise<LogEntry[]> {
    const buffer = this.buffers.get(agentId)
    if (!buffer) {
      return []
    }

    const result = await readFromPosition(buffer.filepath, buffer.position)
    if (!result || !result.content) {
      return []
    }

    const newEntries = parseLogContent(result.content, buffer.entries.length)
    buffer.position = result.newPosition

    // Add new entries and trim if needed
    buffer.entries.push(...newEntries)
    if (buffer.entries.length > this.maxEntries) {
      buffer.entries = buffer.entries.slice(-this.maxEntries)
    }

    return newEntries
  }

  /**
   * Read the full content of a log file
   */
  private async readFull(filepath: string): Promise<string> {
    try {
      return await fs.readFile(filepath, 'utf-8')
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return ''
      }
      throw err
    }
  }

  /**
   * Get all entries for an agent
   */
  getEntries(agentId: string, limit?: number): LogEntry[] {
    const buffer = this.buffers.get(agentId)
    if (!buffer) {
      return []
    }

    if (limit && limit < buffer.entries.length) {
      return buffer.entries.slice(-limit)
    }

    return buffer.entries
  }

  /**
   * Clear buffer for an agent
   */
  clear(agentId: string): void {
    this.buffers.delete(agentId)
  }

  /**
   * Clear all buffers
   */
  clearAll(): void {
    this.buffers.clear()
  }

  /**
   * Check if we have a buffer for an agent
   */
  has(agentId: string): boolean {
    return this.buffers.has(agentId)
  }
}

/**
 * Discover all debug log files
 */
export async function discoverDebugFiles(): Promise<Map<string, string>> {
  const debugDir = getDebugDir()
  const result = new Map<string, string>()

  try {
    const files = await fs.readdir(debugDir)
    const logFiles = files.filter((f) => f.endsWith('.txt'))

    for (const file of logFiles) {
      const agentId = extractAgentIdFromDebugFile(file)
      if (agentId) {
        result.set(agentId, join(debugDir, file))
      }
    }
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      logger.error('Error discovering debug files:', err.message)
    }
  }

  return result
}
