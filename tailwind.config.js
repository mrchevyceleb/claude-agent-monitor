/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
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
          DEFAULT: '#30363d',
          muted: '#21262d',
        },
        status: {
          running: '#3fb950',
          idle: '#8b949e',
          error: '#f85149',
          pending: '#d29922',
          completed: '#3fb950',
        },
        log: {
          debug: '#8b949e',
          info: '#58a6ff',
          warn: '#d29922',
          error: '#f85149',
        },
        accent: {
          DEFAULT: '#58a6ff',
          hover: '#79b8ff',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      animation: {
        'pulse-error': 'pulse-error 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-error': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
}
