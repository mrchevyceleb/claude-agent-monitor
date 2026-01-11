import { contextBridge } from 'electron'
import { electronAPI } from './api'

// Expose the electron API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI)
