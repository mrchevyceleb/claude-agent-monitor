import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron'
import { join } from 'path'
import { AgentRegistry } from './services/AgentRegistry'

let tray: Tray | null = null

export function createTray(mainWindow: BrowserWindow, registry: AgentRegistry): Tray {
  // Create a simple icon (16x16 colored square)
  // In production, you'd use a proper icon file
  const icon = nativeImage.createEmpty()

  // Try to load icon from resources, fall back to empty
  try {
    const iconPath = join(__dirname, '../../resources/tray-icon.png')
    const loadedIcon = nativeImage.createFromPath(iconPath)
    if (!loadedIcon.isEmpty()) {
      tray = new Tray(loadedIcon.resize({ width: 16, height: 16 }))
    } else {
      // Create a simple colored icon
      tray = new Tray(createDefaultIcon())
    }
  } catch {
    tray = new Tray(createDefaultIcon())
  }

  updateTrayMenu(mainWindow, registry)

  tray.setToolTip('Claude Agent Monitor')

  // Click to show/hide
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // Update menu periodically
  setInterval(() => {
    updateTrayMenu(mainWindow, registry)
  }, 5000)

  return tray
}

function updateTrayMenu(mainWindow: BrowserWindow, registry: AgentRegistry): void {
  if (!tray) return

  const runningCount = registry.getRunningCount()
  const errorCount = registry.getErrorCount()

  let statusText = 'No agents running'
  if (runningCount > 0) {
    statusText = `${runningCount} agent${runningCount > 1 ? 's' : ''} running`
  }
  if (errorCount > 0) {
    statusText += ` (${errorCount} error${errorCount > 1 ? 's' : ''})`
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Monitor',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      },
    },
    { type: 'separator' },
    {
      label: statusText,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        mainWindow.removeAllListeners('close')
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)

  // Update tooltip
  tray.setToolTip(`Claude Agent Monitor - ${statusText}`)
}

function createDefaultIcon(): nativeImage {
  // Create a simple 16x16 icon with a colored circle
  // This is a PNG with a blue circle
  const size = 16
  const canvas = Buffer.alloc(size * size * 4)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      const dx = x - size / 2
      const dy = y - size / 2
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < size / 2 - 1) {
        // Blue fill
        canvas[idx] = 88 // R
        canvas[idx + 1] = 166 // G
        canvas[idx + 2] = 255 // B
        canvas[idx + 3] = 255 // A
      } else if (dist < size / 2) {
        // Anti-aliased edge
        const alpha = Math.max(0, 1 - (dist - (size / 2 - 1)))
        canvas[idx] = 88
        canvas[idx + 1] = 166
        canvas[idx + 2] = 255
        canvas[idx + 3] = Math.round(alpha * 255)
      } else {
        // Transparent
        canvas[idx] = 0
        canvas[idx + 1] = 0
        canvas[idx + 2] = 0
        canvas[idx + 3] = 0
      }
    }
  }

  return nativeImage.createFromBuffer(canvas, { width: size, height: size })
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
