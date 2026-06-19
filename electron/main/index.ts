import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog } from 'electron'
import type { NativeImage } from 'electron'
import { spawn } from 'child_process'
import type { ChildProcess } from 'child_process'
import path from 'path'
import fs from 'fs'
import log from 'electron-log'
import { initTracker, startTracking, stopTracking, setupTrackerIPC, getTrackingStatus, setIdleThreshold } from './tracker'

// Configure logging
log.transports.file.level = 'info'
log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs', 'main.log')
log.info('Application starting...')

// Global exception handlers
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error)
  dialog.showErrorBox('Application Error', `An unexpected error occurred: ${error.message}`)
  app.exit(1)
})

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection:', reason)
})

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false
let apeBackendProcess: ChildProcess | null = null

function startApeBackend() {
  const apeBackendDir = path.join(app.getAppPath(), 'anti-procrastination-engine', 'backend')
  log.info('Starting APE backend from:', apeBackendDir)

  apeBackendProcess = spawn('npx', ['tsx', 'src/index.ts'], {
    cwd: apeBackendDir,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env }
  })

  apeBackendProcess.stdout?.on('data', (data: Buffer) => {
    log.info('[APE]', data.toString().trim())
  })

  apeBackendProcess.stderr?.on('data', (data: Buffer) => {
    const msg = data.toString().trim()
    // Port already in use means a backend is already running — that's fine
    if (msg.includes('EADDRINUSE')) {
      log.info('APE backend: port 3001 already in use, using existing instance')
    } else {
      log.warn('[APE]', msg)
    }
  })

  apeBackendProcess.on('exit', (code) => {
    log.info('APE backend exited with code', code)
    apeBackendProcess = null
  })

  apeBackendProcess.on('error', (err) => {
    log.error('APE backend failed to start:', err)
  })
}

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

// Data storage path
const userDataPath = app.getPath('userData')
const dataDir = path.join(userDataPath, 'data')

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

function getAssetPath(...paths: string[]): string {
  const basePath = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../../resources')
  return path.join(basePath, ...paths)
}

type ExportActivity = {
  title?: string
  startTime?: string
  endTime?: string
  duration?: number
  device?: string
  location?: string
  topics?: string[]
  notes?: string
  productivityRating?: number
}

type ExportTopic = {
  id?: string
  name?: string
  category?: string
  description?: string
  usageCount?: number
  lastUsedAt?: string
}

function formatMarkdownExport(activities: ExportActivity[], topics: ExportTopic[]) {
  const topicNameById = new Map(
    topics
      .filter((topic) => topic.id && topic.name)
      .map((topic) => [topic.id as string, topic.name as string])
  )

  const lines: string[] = [
    '# My Time Tracker Export',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Activities: ${activities.length}`,
    `- Topics: ${topics.length}`,
    '',
    '## Activities',
    ''
  ]

  if (activities.length === 0) {
    lines.push('No activities recorded.', '')
  } else {
    activities.forEach((activity, index) => {
      const topicNames = (activity.topics || []).map((topicId) => topicNameById.get(topicId) || topicId)
      lines.push(`### ${index + 1}. ${activity.title || 'Untitled Activity'}`)
      lines.push('')
      lines.push(`- Start: ${activity.startTime || 'N/A'}`)
      lines.push(`- End: ${activity.endTime || 'N/A'}`)
      lines.push(`- Duration (minutes): ${activity.duration ?? 0}`)
      lines.push(`- Device: ${activity.device || 'N/A'}`)
      lines.push(`- Location: ${activity.location || 'N/A'}`)
      lines.push(`- Productivity rating: ${activity.productivityRating ?? 'N/A'}`)
      lines.push(`- Topics: ${topicNames.length > 0 ? topicNames.join(', ') : 'None'}`)
      lines.push(`- Notes: ${activity.notes?.trim() ? activity.notes : 'None'}`)
      lines.push('')
    })
  }

  lines.push('## Topics', '')

  if (topics.length === 0) {
    lines.push('No topics recorded.', '')
  } else {
    topics.forEach((topic, index) => {
      lines.push(`### ${index + 1}. ${topic.name || 'Untitled Topic'}`)
      lines.push('')
      lines.push(`- Category: ${topic.category || 'N/A'}`)
      lines.push(`- Usage count: ${topic.usageCount ?? 0}`)
      lines.push(`- Last used: ${topic.lastUsedAt || 'N/A'}`)
      lines.push(`- Description: ${topic.description?.trim() ? topic.description : 'None'}`)
      lines.push('')
    })
  }

  return lines.join('\n')
}

function createTray() {
  // Create a simple 16x16 icon for tray
  const iconPath = getAssetPath('icon.png')
  let trayIcon: NativeImage

  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  } else {
    // Create a simple colored square as fallback
    trayIcon = nativeImage.createEmpty()
  }

  tray = new Tray(trayIcon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Subjective App',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    {
      label: 'Quick Add Activity',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
        mainWindow?.webContents.send('quick-add')
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('Subjective Knowledge App')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
}

function createWindow() {
  log.info('Creating main window...')

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Subjective Knowledge App',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true
    },
    show: false,
    backgroundColor: '#F8FAFC'
  })

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    log.info('Window ready to show')
    mainWindow?.show()
  })

  // Handle close to tray
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Load the app
  if (VITE_DEV_SERVER_URL) {
    log.info('Loading dev server:', VITE_DEV_SERVER_URL)
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, '../../dist/index.html')
    log.info('Loading production build:', indexPath)
    mainWindow.loadFile(indexPath)
  }
}

// IPC Handlers for data operations
ipcMain.handle('get-user-data-path', () => userDataPath)
ipcMain.handle('get-data-dir', () => dataDir)

ipcMain.handle('read-file', async (_event, filename: string) => {
  const filePath = path.join(dataDir, filename)
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(data)
    }
    return null
  } catch (error) {
    log.error('Error reading file:', error)
    return null
  }
})

ipcMain.handle('write-file', async (_event, filename: string, data: unknown) => {
  const filePath = path.join(dataDir, filename)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    log.error('Error writing file:', error)
    return false
  }
})

ipcMain.handle('export-data', async (_event, format: 'json' | 'csv' | 'md') => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    title: 'Export Data',
    defaultPath: `my-time-tracker-export.${format}`,
    filters:
      format === 'json'
        ? [{ name: 'JSON', extensions: ['json'] }]
        : format === 'csv'
          ? [{ name: 'CSV', extensions: ['csv'] }]
          : [{ name: 'Markdown', extensions: ['md'] }]
  })

  if (result.canceled || !result.filePath) return false

  try {
    const activitiesPath = path.join(dataDir, 'activities.json')
    const topicsPath = path.join(dataDir, 'topics.json')

    let exportData: { activities: unknown[]; topics: unknown[] } = { activities: [], topics: [] }

    if (fs.existsSync(activitiesPath)) {
      exportData = {
        ...exportData,
        ...(JSON.parse(fs.readFileSync(activitiesPath, 'utf-8')) as Partial<typeof exportData>)
      }
    }
    if (fs.existsSync(topicsPath)) {
      const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8')) as unknown[]
      exportData = { ...exportData, topics }
    }

    if (format === 'json') {
      fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 2), 'utf-8')
    } else if (format === 'csv') {
      // CSV format
      const activities = (exportData as { activities: unknown[] }).activities || []
      const headers = ['title', 'startTime', 'endTime', 'duration', 'device', 'location', 'topics', 'notes', 'productivityRating']
      const csvRows = [headers.join(',')]

      for (const act of activities as Record<string, unknown>[]) {
        const row = headers.map(h => {
          const val = act[h]
          if (Array.isArray(val)) return `"${val.join(';')}"`
          if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`
          return val ?? ''
        })
        csvRows.push(row.join(','))
      }

      fs.writeFileSync(result.filePath, csvRows.join('\n'), 'utf-8')
    } else {
      const markdown = formatMarkdownExport(
        exportData.activities as ExportActivity[],
        exportData.topics as ExportTopic[]
      )
      fs.writeFileSync(result.filePath, markdown, 'utf-8')
    }

    return true
  } catch (error) {
    log.error('Export error:', error)
    return false
  }
})

ipcMain.handle('minimize-to-tray', () => {
  mainWindow?.hide()
})

// Load APE env vars for AI calls
function loadApeEnv(): Record<string, string> {
  const envPath = path.join(app.getAppPath(), 'anti-procrastination-engine', 'backend', '.env')
  try {
    const content = fs.readFileSync(envPath, 'utf-8')
    const result: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const eq = t.indexOf('=')
      if (eq > 0) result[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
    }
    return result
  } catch { return {} }
}

interface ChatMessage { role: 'user' | 'assistant'; content: string }

ipcMain.handle('ai-chat', async (_event, { messages, context }: { messages: ChatMessage[]; context: string }) => {
  const env = loadApeEnv()
  // Use Anthropic key if configured (like the proxy DeepSeek), otherwise fallback to OpenAI keys
  const apiKey = env.ANTHROPIC_API_KEY || env.OPENAI_API_KEY
  const rawBaseUrl = env.ANTHROPIC_API_KEY ? env.ANTHROPIC_BASE_URL : env.OPENAI_BASE_URL
  const model = env.ANTHROPIC_API_KEY ? (env.ANTHROPIC_DEFAULT_OPUS_MODEL ?? 'deepseek-chat') : (env.OPENAI_MODEL ?? 'gpt-4o')
  
  const baseUrl = rawBaseUrl ?? 'https://api.silra.cn/'

  if (!apiKey) return { error: 'No API key configured' }

  // Ensure /v1/chat/completions endpoint structure
  const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  let fetchUrl = cleanUrl
  if (!fetchUrl.endsWith('/v1') && !fetchUrl.includes('/v1/')) {
    fetchUrl = `${fetchUrl}/v1`
  }
  fetchUrl = `${fetchUrl}/chat/completions`

  try {
    const res = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ 
        model, 
        max_tokens: 4000, 
        messages: [{ role: 'system', content: context }, ...messages] 
      })
    })
    const data = await res.json() as { choices?: { message?: { content?: string } }[]; error?: { message: string } }
    if (data.error) return { error: data.error.message }
    return { content: data.choices?.[0]?.message?.content ?? '' }
  } catch (err) {
    log.error('AI chat error:', err)
    return { error: 'AI request failed' }
  }
})

ipcMain.handle('explain-card', async (_event, { title, summary, content }: { title: string; summary: string; content: string }) => {
  const env = loadApeEnv()
  const apiKey = env.ANTHROPIC_API_KEY
  const baseUrl = env.ANTHROPIC_BASE_URL ?? 'https://api.silra.cn/'
  const model = env.ANTHROPIC_DEFAULT_OPUS_MODEL ?? 'deepseek-chat'

  if (!apiKey) {
    log.warn('AI Explainer: No API key found in config.')
    return { error: 'API key is not configured.' }
  }

  // Clean URLs to avoid double slashes
  const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

  const systemMessage = `You are a helpful knowledge assistant built inside the Subjective Knowledge App. 
Your job is to read the title, summary, and details of a card, and provide a clear, engaging, and simplified explanation.
Structure your output using clean markdown. Use bullet points or simple definitions. Keep the explanation under 200 words.`

  const userPrompt = `Please explain this knowledge card:
Title: ${title}
Summary: ${summary}
Details:
${content}`

  // Safely ensure /v1/ is present in the endpoint URL
  let fetchUrl = cleanUrl
  if (!fetchUrl.endsWith('/v1') && !fetchUrl.includes('/v1/')) {
    fetchUrl = `${fetchUrl}/v1`
  }
  fetchUrl = `${fetchUrl}/chat/completions`

  try {
    log.info(`Requesting explanation for "${title}" using model "${model}" from endpoint "${fetchUrl}"`)
    const res = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 600,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt }
        ]
      })
    })

    const responseData = await res.json() as {
      choices?: { message?: { content?: string } }[]
      error?: { message: string }
    }

    if (responseData.error) {
      log.error('DeepSeek proxy error response:', responseData.error)
      return { error: responseData.error.message }
    }

    const aiContent = responseData.choices?.[0]?.message?.content ?? ''
    return { content: aiContent }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    log.error('AI Explainer fetch request failed:', errorMsg)
    return { error: `Request failed: ${errorMsg}` }
  }
})

ipcMain.handle('parse-document', async (_event, filePath: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { error: 'File does not exist' }
    }
    const ext = path.extname(filePath).toLowerCase()
    
    // For plain text/code files
    const textExtensions = ['.txt', '.md', '.markdown', '.json', '.js', '.ts', '.html', '.css', '.csv']
    if (textExtensions.includes(ext)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      return { content }
    }

    // For other documents (pdf, docx, pptx, xlsx, etc.) we use markitdown via python
    return new Promise((resolve) => {
      const pythonScript = `
import sys
from markitdown import MarkItDown
try:
    md = MarkItDown()
    result = md.convert(sys.argv[1])
    print(result.text_content)
except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    sys.exit(1)
`
      const py = spawn('python', ['-c', pythonScript, filePath])
      
      let stdout = ''
      let stderr = ''
      
      if (py.stdout) {
        py.stdout.on('data', (data) => {
          stdout += data.toString()
        })
      }
      
      if (py.stderr) {
        py.stderr.on('data', (data) => {
          stderr += data.toString()
        })
      }
      
      py.on('close', (code) => {
        if (code === 0) {
          resolve({ content: stdout })
        } else {
          log.error('Python parsing failed:', stderr)
          resolve({ error: stderr || 'Failed to convert document' })
        }
      })
    })
  } catch (error: any) {
    log.error('parse-document error:', error)
    return { error: error.message || 'Unknown error' }
  }
})

ipcMain.handle('select-document-file', async () => {
  try {
    if (!mainWindow) return null
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Document/Book',
      properties: ['openFile'],
      filters: [
        { 
          name: 'Documents & Books', 
          extensions: ['pdf', 'docx', 'pptx', 'txt', 'md', 'json', 'html', 'css', 'js', 'ts', 'csv'] 
        }
      ]
    })
    
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    
    const filePath = result.filePaths[0]
    const fileName = path.basename(filePath)
    const stats = fs.statSync(filePath)
    
    return {
      path: filePath,
      name: fileName,
      size: stats.size
    }
  } catch (error: any) {
    log.error('select-document-file error:', error)
    return null
  }
})

// App lifecycle
app.whenReady().then(() => {
  log.info('App ready, creating window...')
  startApeBackend()
  createWindow()
  createTray()

  // Initialize activity tracker after window is created
  if (mainWindow) {
    initTracker(mainWindow)
    setupTrackerIPC()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  isQuitting = true
  if (apeBackendProcess) {
    apeBackendProcess.kill()
    apeBackendProcess = null
  }
})

log.info('Main process initialized')
