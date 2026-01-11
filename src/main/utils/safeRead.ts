import { promises as fs } from 'fs'

/**
 * Safely read a JSON file, handling atomic writes and transient errors.
 * Claude Code uses atomic writes (write to .tmp, then rename), so we
 * need to retry if the file is temporarily unavailable.
 */
export async function safeReadJson<T>(filepath: string): Promise<T | null> {
  const maxRetries = 3
  const retryDelay = 50

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const content = await fs.readFile(filepath, 'utf-8')
      return JSON.parse(content) as T
    } catch (err: any) {
      // File might be in the middle of atomic write
      if (err.code === 'ENOENT' || err.code === 'EBUSY') {
        await sleep(retryDelay)
        continue
      }
      // JSON parse error - file is corrupt or empty
      if (err instanceof SyntaxError) {
        return null
      }
      throw err
    }
  }
  return null
}

/**
 * Safely read a text file, handling transient errors.
 */
export async function safeReadText(filepath: string): Promise<string | null> {
  const maxRetries = 3
  const retryDelay = 50

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fs.readFile(filepath, 'utf-8')
    } catch (err: any) {
      if (err.code === 'ENOENT' || err.code === 'EBUSY') {
        await sleep(retryDelay)
        continue
      }
      throw err
    }
  }
  return null
}

/**
 * Read a file from a specific byte position (for tailing logs).
 */
export async function readFromPosition(
  filepath: string,
  position: number
): Promise<{ content: string; newPosition: number } | null> {
  try {
    const stats = await fs.stat(filepath)
    if (stats.size <= position) {
      return { content: '', newPosition: position }
    }

    const handle = await fs.open(filepath, 'r')
    try {
      const buffer = Buffer.alloc(stats.size - position)
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, position)
      return {
        content: buffer.toString('utf-8', 0, bytesRead),
        newPosition: position + bytesRead,
      }
    } finally {
      await handle.close()
    }
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return null
    }
    throw err
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath)
    return true
  } catch {
    return false
  }
}

/**
 * Get file stats safely
 */
export async function safeStats(filepath: string): Promise<{ size: number; mtime: Date } | null> {
  try {
    const stats = await fs.stat(filepath)
    return { size: stats.size, mtime: stats.mtime }
  } catch {
    return null
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
