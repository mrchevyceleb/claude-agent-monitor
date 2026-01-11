type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

const LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

let currentLevel: LogLevel = 'INFO'

export function setLogLevel(level: LogLevel): void {
  currentLevel = level
}

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[currentLevel]
}

function formatMessage(level: LogLevel, message: string, ...args: any[]): string {
  const timestamp = new Date().toISOString()
  const formattedArgs = args.length > 0 ? ' ' + args.map(String).join(' ') : ''
  return `${timestamp} [${level}] ${message}${formattedArgs}`
}

export const logger = {
  debug(message: string, ...args: any[]): void {
    if (shouldLog('DEBUG')) {
      console.log(formatMessage('DEBUG', message, ...args))
    }
  },

  info(message: string, ...args: any[]): void {
    if (shouldLog('INFO')) {
      console.log(formatMessage('INFO', message, ...args))
    }
  },

  warn(message: string, ...args: any[]): void {
    if (shouldLog('WARN')) {
      console.warn(formatMessage('WARN', message, ...args))
    }
  },

  error(message: string, ...args: any[]): void {
    if (shouldLog('ERROR')) {
      console.error(formatMessage('ERROR', message, ...args))
    }
  },
}
