import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  getDataDir: () => ipcRenderer.invoke('get-data-dir'),

  // File operations
  readFile: (filename: string) => ipcRenderer.invoke('read-file', filename),
  writeFile: (filename: string, data: unknown) => ipcRenderer.invoke('write-file', filename, data),

  // Export
  exportData: (format: 'json' | 'csv' | 'md') => ipcRenderer.invoke('export-data', format),
  importData: () => ipcRenderer.invoke('import-data'),

  // Window controls
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  setLaunchOnStartup: (launch: boolean) => ipcRenderer.invoke('set-launch-on-startup', launch),

  // Activity tracker
  startTracking: () => ipcRenderer.invoke('tracker:start'),
  stopTracking: () => ipcRenderer.invoke('tracker:stop'),
  getTrackerStatus: () => ipcRenderer.invoke('tracker:status'),
  setIdleThreshold: (seconds: number) => ipcRenderer.invoke('tracker:setIdleThreshold', seconds),

  // Event listeners
  onQuickAdd: (callback: () => void) => {
    ipcRenderer.on('quick-add', callback)
    return () => ipcRenderer.removeListener('quick-add', callback)
  },

  // Tracker event listeners
  onTrackerStatus: (callback: (event: unknown, status: unknown) => void) => {
    ipcRenderer.on('tracker-status', callback)
    return () => ipcRenderer.removeListener('tracker-status', callback)
  },

  onAutoTrackedActivity: (callback: (event: unknown, activity: unknown) => void) => {
    ipcRenderer.on('auto-tracked-activity', callback)
    return () => ipcRenderer.removeListener('auto-tracked-activity', callback)
  },

  aiChat: (messages: { role: string; content: string }[], context: string) =>
    ipcRenderer.invoke('ai-chat', { messages, context }),
  explainCard: (title: string, summary: string, content: string) =>
    ipcRenderer.invoke('explain-card', { title, summary, content }),
  parseDocument: (filePath: string) =>
    ipcRenderer.invoke('parse-document', filePath),
  selectDocumentFile: () =>
    ipcRenderer.invoke('select-document-file')
})

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getUserDataPath: () => Promise<string>
      getDataDir: () => Promise<string>
      readFile: (filename: string) => Promise<unknown>
      writeFile: (filename: string, data: unknown) => Promise<boolean>
      exportData: (format: 'json' | 'csv' | 'md') => Promise<boolean>
      importData: () => Promise<boolean | { error: string }>
      minimizeToTray: () => Promise<void>
      setLaunchOnStartup: (launch: boolean) => Promise<void>
      onQuickAdd: (callback: () => void) => () => void
      // Tracker
      startTracking: () => Promise<{ success: boolean }>
      stopTracking: () => Promise<{ success: boolean }>
      getTrackerStatus: () => Promise<{
        isTracking: boolean
        currentActivity: unknown | null
        lastActiveTime: number
      }>
      setIdleThreshold: (seconds: number) => Promise<{ success: boolean }>
      onTrackerStatus: (callback: (event: unknown, status: unknown) => void) => () => void
      onAutoTrackedActivity: (callback: (event: unknown, activity: unknown) => void) => () => void
      aiChat: (messages: { role: string; content: string }[], context: string) => Promise<{ content?: string; error?: string }>
      explainCard: (title: string, summary: string, content: string) => Promise<{ content?: string; error?: string }>
      parseDocument: (filePath: string) => Promise<{ content?: string; error?: string }>
      selectDocumentFile: () => Promise<{ path: string; name: string; size: number } | null>
    }
  }
}
