import { ipcMain, BrowserWindow, powerMonitor } from 'electron'
import activeWindow from 'active-win'
import log from 'electron-log'
import { v4 as uuidv4 } from 'uuid'

// Types for activity tracking
export interface TrackedActivity {
  id: string
  appName: string
  windowTitle: string
  windowId?: number
  processId?: number
  processPath?: string
  startTime: string
  endTime: string | null
  duration: number // in seconds
}

// Windows API declarations
declare const global: { [key: string]: any }

let trackerInterval: NodeJS.Timeout | null = null
let currentActivity: TrackedActivity | null = null
let isTracking = false
let lastActiveTime = 0
let idleThreshold = 300 // 5 minutes in seconds
let mainWindow: BrowserWindow | null = null
let isPollingActiveWindow = false

// Initialize tracker with main window reference
export function initTracker(window: BrowserWindow) {
  mainWindow = window
  log.info('Activity tracker initialized')
}

// Start tracking active windows
export function startTracking() {
  if (isTracking) {
    log.info('Tracker already running')
    return
  }

  isTracking = true
  lastActiveTime = Date.now()

  // Poll every 3 seconds
  trackerInterval = setInterval(() => {
    void trackActiveWindow()
  }, 3000)

  // Capture the current foreground window immediately instead of waiting for the first interval.
  void trackActiveWindow()

  log.info('Activity tracking started')
}

// Stop tracking
export function stopTracking() {
  if (trackerInterval) {
    clearInterval(trackerInterval)
    trackerInterval = null
  }

  // End current activity if any
  if (currentActivity) {
    endCurrentActivity()
  }

  isTracking = false
  log.info('Activity tracking stopped')
}

// Set idle threshold (seconds)
export function setIdleThreshold(seconds: number) {
  idleThreshold = seconds
  log.info(`Idle threshold set to ${seconds} seconds`)
}

// Get current tracking status
export function getTrackingStatus() {
  return {
    isTracking,
    currentActivity,
    lastActiveTime
  }
}

// Track the currently active window
async function trackActiveWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return
  if (isPollingActiveWindow) return

  isPollingActiveWindow = true

  try {
    const activeWindowInfo = await getActiveWindowInfo()

    if (!activeWindowInfo) return

    const idleTime = powerMonitor.getSystemIdleTime()

    if (idleTime > idleThreshold) {
      // User is idle - end current activity
      if (currentActivity) {
        log.info(`User idle for ${idleTime}s, ending activity: ${currentActivity.appName}`)
        endCurrentActivity()
      }
      return
    }

    const now = Date.now()
    lastActiveTime = now

    // If the same window stays focused, only refresh the live duration.
    if (
      currentActivity &&
      currentActivity.windowId === activeWindowInfo.windowId &&
      currentActivity.processId === activeWindowInfo.processId
    ) {
      const startTime = new Date(currentActivity.startTime).getTime()
      currentActivity.duration = Math.floor((now - startTime) / 1000)
      currentActivity.windowTitle = activeWindowInfo.windowTitle

      // Send update to renderer
      sendTrackerUpdate()
      return
    }

    // Different app - end current and start new
    if (currentActivity) {
      endCurrentActivity()
    }

    // Start new activity
    startNewActivity(activeWindowInfo)

  } catch (error) {
    log.error('Error tracking window:', error)
  } finally {
    isPollingActiveWindow = false
  }
}

interface WindowInfo {
  appName: string
  windowTitle: string
  windowId: number
  processId: number
  processPath: string
}

async function getActiveWindowInfo(): Promise<WindowInfo | null> {
  try {
    const active = await activeWindow()

    if (!active || active.platform !== 'windows') {
      return null
    }

    return {
      appName: active.owner.name || 'Unknown Application',
      windowTitle: active.title || active.owner.name || 'Untitled Window',
      windowId: active.id,
      processId: active.owner.processId,
      processPath: active.owner.path || ''
    }
  } catch (error) {
    log.error('Error getting window info:', error)
    return null
  }
}

function startNewActivity(windowInfo: WindowInfo) {
  const now = new Date().toISOString()

  currentActivity = {
    id: uuidv4(),
    appName: windowInfo.appName,
    windowTitle: windowInfo.windowTitle,
    windowId: windowInfo.windowId,
    processId: windowInfo.processId,
    processPath: windowInfo.processPath,
    startTime: now,
    endTime: null,
    duration: 0
  }

  log.info(`Started tracking: ${windowInfo.appName} - ${windowInfo.windowTitle}`)
  sendTrackerUpdate()
}

function endCurrentActivity() {
  if (!currentActivity) return

  const now = new Date()
  currentActivity.endTime = now.toISOString()

  const startTime = new Date(currentActivity.startTime).getTime()
  currentActivity.duration = Math.floor((now.getTime() - startTime) / 1000)

  // Only save if duration > 10 seconds (filter out quick switches)
  if (currentActivity.duration > 10) {
    log.info(`Ended activity: ${currentActivity.appName} (${currentActivity.duration}s)`)

    // Send to renderer to save
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('auto-tracked-activity', currentActivity)
    }
  }

  currentActivity = null
  sendTrackerUpdate()
}

function sendTrackerUpdate() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('tracker-status', {
      isTracking,
      currentActivity
    })
  }
}

// IPC Handlers
export function setupTrackerIPC() {
  // Start/Stop tracking
  ipcMain.handle('tracker:start', () => {
    startTracking()
    return { success: true }
  })

  ipcMain.handle('tracker:stop', () => {
    stopTracking()
    return { success: true }
  })

  ipcMain.handle('tracker:status', () => {
    return getTrackingStatus()
  })

  ipcMain.handle('tracker:setIdleThreshold', (_event, seconds: number) => {
    setIdleThreshold(seconds)
    return { success: true }
  })
}

log.info('Tracker module loaded')
