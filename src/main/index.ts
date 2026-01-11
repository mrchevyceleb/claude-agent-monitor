import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { setupIpcHandlers } from './ipc/handlers'
import { AgentRegistry } from './services/AgentRegistry'
import { FileWatcher } from './services/FileWatcher'
import { createTray } from './tray'
import { logger } from './utils/logger'

let mainWindow: BrowserWindow | null = null
let agentRegistry: AgentRegistry | null = null
let fileWatcher: FileWatcher | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: '#0d1117',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'default',
    frame: true,
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', (event) => {
    // Minimize to tray instead of closing
    event.preventDefault()
    mainWindow?.hide()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the renderer
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

async function initServices(): Promise<void> {
  logger.info('Initializing services...')

  // Create agent registry
  agentRegistry = new AgentRegistry()
  await agentRegistry.discover()
  logger.info(`Discovered ${agentRegistry.getAll().length} agents`)

  // Create file watcher
  fileWatcher = new FileWatcher(agentRegistry, mainWindow!)
  fileWatcher.start()
  logger.info('File watcher started')

  // Set up IPC handlers
  setupIpcHandlers(agentRegistry, fileWatcher)
  logger.info('IPC handlers registered')
}

app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.claude.agent-monitor')

  // Default open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  await initServices()

  // Create system tray
  if (mainWindow) {
    createTray(mainWindow, agentRegistry!)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // Don't quit on macOS
  if (process.platform !== 'darwin') {
    // Actually, we want to keep running in tray
    // So don't quit here either
  }
})

app.on('before-quit', () => {
  // Stop file watcher
  if (fileWatcher) {
    fileWatcher.stop()
  }

  // Force close window
  if (mainWindow) {
    mainWindow.removeAllListeners('close')
    mainWindow.close()
  }
})

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error.message)
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', String(reason))
})
