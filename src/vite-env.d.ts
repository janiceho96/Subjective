/// <reference types="vite/client" />

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
