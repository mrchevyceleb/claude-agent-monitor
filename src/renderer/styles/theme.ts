export const theme = {
  colors: {
    bg: {
      base: '#0d1117',
      surface: '#161b22',
      elevated: '#21262d',
      hover: '#30363d',
      active: 'rgba(56, 139, 253, 0.1)',
    },
    text: {
      primary: '#e6edf3',
      secondary: '#8b949e',
      disabled: '#484f58',
    },
    border: {
      default: '#30363d',
      muted: '#21262d',
    },
    status: {
      running: '#3fb950',
      idle: '#8b949e',
      error: '#f85149',
      stopped: '#484f58',
      pending: '#d29922',
      completed: '#3fb950',
    },
    log: {
      DEBUG: '#8b949e',
      INFO: '#58a6ff',
      WARN: '#d29922',
      ERROR: '#f85149',
    },
    accent: {
      primary: '#58a6ff',
      hover: '#79b8ff',
    },
  },
  fonts: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    mono: 'JetBrains Mono, Consolas, Monaco, monospace',
  },
  sizes: {
    sidebarWidth: 280,
    sidebarMinWidth: 200,
    sidebarMaxWidth: 400,
    headerHeight: 40,
  },
} as const

export type Theme = typeof theme
