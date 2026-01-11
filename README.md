# Claude Code Agent Monitor

> **WORK IN PROGRESS** - This project is under active development and may not work as intended. We're actively fixing issues and improving functionality.

A visual desktop application to monitor and manage [Claude Code](https://docs.anthropic.com/en/docs/claude-code) background agents in real-time.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)
![Electron](https://img.shields.io/badge/electron-28.x-47848F.svg)

## The Problem

When using Claude Code in the terminal, background agents can be hard to track:
- The main chat stream gets cluttered
- You lose sight of what background agents are doing
- Agent output scrolls by unnoticed during big tasks
- No easy way to monitor or kill runaway agents

## The Solution

A dedicated visual command center that sits alongside your terminal:

```
┌─────────────────┬────────────────────────────────────────────┐
│ AGENTS          │  docs-keeper (active)                      │
│ ───────────     │  ────────────────────────────────────      │
│ ● docs-keeper   │  TASKS            CONTROLS                 │
│   2 tasks       │  ✓ Explore        [Stop] [Kill]            │
│ ○ code-cleaner  │  ▶ Writing docs   CPU: ██████░░ 45%        │
│ ○ bug-hunter    │  ○ Commit         MEM: ████░░░░ 28%        │
│                 │                                            │
│                 │  LOGS                                      │
│                 │  [Filter ▼] [Search ___] [Auto-scroll ✓]   │
│                 │  ┌──────────────────────────────────────┐  │
│                 │  │ 12:42:55 [DEBUG] Writing temp file   │  │
│                 │  │ 12:42:55 [DEBUG] File written        │  │
│                 │  │ 12:42:56 [INFO]  Task completed      │  │
│                 │  └──────────────────────────────────────┘  │
└─────────────────┴────────────────────────────────────────────┘
```

## Features

- **Real-time Agent Monitoring** - See all background agents at a glance
- **Live Task Progress** - Watch todo items complete in real-time
- **Log Streaming** - Virtualized log viewer handles 10,000+ entries
- **Status Indicators** - Green (running), Gray (idle), Red (error)
- **Agent Controls** - Stop or kill agents directly from the UI
- **Log Filtering** - Filter by level (DEBUG/INFO/WARN/ERROR) + text search
- **Auto-scroll** - Smart pause when you scroll up, resume at bottom
- **System Tray** - Minimize to tray for background monitoring
- **Dark Theme** - Matches the terminal aesthetic

## How It Works

The monitor watches Claude Code's data files in `~/.claude/`:

| Data Source | Path | What It Contains |
|-------------|------|------------------|
| Tasks | `todos/*-agent-*.json` | Todo items and progress |
| Logs | `debug/*.txt` | Timestamped debug logs |
| Agents | `agents/*.md` | Custom agent definitions |
| Config | `.claude.json` | Global configuration |

All file watching is done with [chokidar](https://github.com/paulmillr/chokidar), safely handling atomic writes and rapid changes.

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Claude Code installed and configured

### From Source

```bash
# Clone the repository
git clone https://github.com/mrchevyceleb/claude-agent-monitor.git
cd claude-agent-monitor

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Package as Windows installer
npm run package
```

## Usage

1. Start the monitor: `npm run dev`
2. The app will automatically discover agents from your `~/.claude/` directory
3. Select an agent from the sidebar to view details
4. Watch tasks progress and logs stream in real-time
5. Use Stop/Kill buttons to control agents
6. Minimize to system tray for background monitoring

## Tech Stack

- **Electron 28** - Cross-platform desktop framework
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **chokidar** - File watching
- **react-window** - Virtualized lists
- **electron-vite** - Build tooling

## Project Structure

```
claude-agent-monitor/
├── src/
│   ├── main/           # Electron main process
│   │   ├── services/   # FileWatcher, AgentRegistry, LogStreamer
│   │   ├── ipc/        # IPC handlers and channels
│   │   └── utils/      # Path handling, safe file reading
│   ├── preload/        # Context bridge
│   └── renderer/       # React application
│       ├── components/ # UI components
│       ├── stores/     # Zustand stores
│       └── hooks/      # React hooks
├── types/              # TypeScript declarations
└── resources/          # App icons
```

## Known Issues

This is a work in progress. Current known issues:

- [ ] Agent definition parsing fails on complex YAML frontmatter
- [ ] Stop/Kill buttons update UI but don't actually terminate processes (need process ID tracking)
- [ ] No macOS/Linux support yet (Windows only)
- [ ] Missing app icons
- [ ] History viewer not yet implemented

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Built for use with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) by Anthropic
- Inspired by the need for better visibility into background agent activity

---

**Note:** This is an unofficial community tool and is not affiliated with or endorsed by Anthropic.
