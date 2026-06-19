import { useState } from 'react'
import {
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Check,
  Play,
  Square,
  Activity,
  AlertCircle
} from 'lucide-react'
import { useStore } from '../stores/appStore'

export default function Settings() {
  const { settings, updateSettings, isAutoTracking, currentTrackingActivity, setAutoTracking, setCurrentTrackingActivity, initializeData } = useStore()
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importError, setImportError] = useState<string | null>(null)

  const handleStartTracking = async () => {
    if (window.electronAPI) {
      await window.electronAPI.startTracking()
      setAutoTracking(true)
    }
  }

  const handleStopTracking = async () => {
    if (window.electronAPI) {
      await window.electronAPI.stopTracking()
      setAutoTracking(false)
      setCurrentTrackingActivity(null)
    }
  }

  const handleIdleThresholdChange = async (seconds: number) => {
    updateSettings({ idleThreshold: seconds })
    if (window.electronAPI) {
      await window.electronAPI.setIdleThreshold(seconds)
    }
  }

  const handleLaunchOnStartupChange = async (launch: boolean) => {
    updateSettings({ launchOnStartup: launch })
    if (window.electronAPI) {
      await window.electronAPI.setLaunchOnStartup(launch)
    }
  }

  const handleExport = async (format: 'json' | 'csv' | 'md') => {
    try {
      if (window.electronAPI) {
        const success = await window.electronAPI.exportData(format)
        setExportStatus(success ? 'success' : 'error')
        setTimeout(() => setExportStatus('idle'), 3000)
      }
    } catch (error) {
      setExportStatus('error')
      setTimeout(() => setExportStatus('idle'), 3000)
    }
  }

  const handleImport = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.importData()
        if (result === true) {
          setImportStatus('success')
          await initializeData() // Refresh store with new data
          setTimeout(() => setImportStatus('idle'), 3000)
        } else if (typeof result === 'object' && result.error) {
          setImportStatus('error')
          setImportError(result.error)
          setTimeout(() => {
            setImportStatus('idle')
            setImportError(null)
          }, 5000)
        } else {
          // Cancelled or generic false
          setImportStatus('idle')
        }
      }
    } catch (error) {
      setImportStatus('error')
      setImportError('An unexpected error occurred during import')
      setTimeout(() => {
        setImportStatus('idle')
        setImportError(null)
      }, 5000)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Configure your preferences</p>
      </div>

      {/* Appearance */}
      <div className="bg-surface rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Appearance</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Theme</p>
              <p className="text-sm text-text-secondary">Choose your preferred color scheme</p>
            </div>
            <div className="flex gap-2">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'system', icon: Monitor, label: 'System' }
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateSettings({ theme: theme.value as 'light' | 'dark' | 'system' })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    settings.theme === theme.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-secondary hover:bg-gray-100'
                  }`}
                >
                  <theme.icon className="w-4 h-4" />
                  <span className="text-sm">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Daily Goal</p>
              <p className="text-sm text-text-secondary">Target hours to track per day</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={24}
                value={settings.dailyGoalHours ?? 6}
                onChange={(e) => updateSettings({ dailyGoalHours: Math.max(1, Math.min(24, parseInt(e.target.value) || 6)) })}
                className="w-16 px-3 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-center"
              />
              <span className="text-sm text-text-secondary">hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-surface rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Notifications</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Daily Reminder</p>
              <p className="text-sm text-text-secondary">Get reminded to track your day</p>
            </div>
            <input
              type="time"
              value={settings.dailyReminderTime}
              onChange={(e) => updateSettings({ dailyReminderTime: e.target.value })}
              className="px-3 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Weekly Summary</p>
              <p className="text-sm text-text-secondary">Receive weekly progress reports</p>
            </div>
            <button
              onClick={() => updateSettings({ weeklySummary: !settings.weeklySummary })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.weeklySummary ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  settings.weeklySummary ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Idle Detection</p>
              <p className="text-sm text-text-secondary">Alert when you've been idle too long</p>
            </div>
            <button
              onClick={() => updateSettings({ idleDetection: !settings.idleDetection })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.idleDetection ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  settings.idleDetection ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Tracking */}
      <div className="bg-surface rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Auto Activity Tracking
        </h2>

        <div className="space-y-4">
          {/* Start/Stop Button */}
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div>
              <p className="font-medium text-text-primary">Activity Tracker</p>
              <p className="text-sm text-text-secondary">
                {isAutoTracking ? 'Currently tracking your activities' : 'Click to start auto-tracking'}
              </p>
              {currentTrackingActivity && isAutoTracking && (
                <p className="text-sm text-primary mt-1">
                  Tracking: {currentTrackingActivity.appName}
                </p>
              )}
            </div>
            {isAutoTracking ? (
              <button
                onClick={handleStopTracking}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-error hover:bg-red-600 text-white transition-colors"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            ) : (
              <button
                onClick={handleStartTracking}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success hover:bg-green-600 text-white transition-colors"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
            )}
          </div>

          {/* Idle Threshold */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Idle Threshold</p>
              <p className="text-sm text-text-secondary">Stop tracking after this idle time</p>
            </div>
            <select
              value={settings.idleThreshold}
              onChange={(e) => handleIdleThresholdChange(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={60}>1 minute</option>
              <option value={180}>3 minutes</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
              <option value={900}>15 minutes</option>
            </select>
          </div>

          <p className="text-xs text-text-secondary">
            Note: Auto-tracking monitors which application is in focus and logs time automatically.
          </p>
        </div>
      </div>

      {/* Startup */}
      <div className="bg-surface rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Startup</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Start Minimized</p>
              <p className="text-sm text-text-secondary">Launch app minimized to system tray</p>
            </div>
            <button
              onClick={() => updateSettings({ startMinimized: !settings.startMinimized })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.startMinimized ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  settings.startMinimized ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Launch on Startup</p>
              <p className="text-sm text-text-secondary">Start app when computer boots</p>
            </div>
            <button
              onClick={() => handleLaunchOnStartupChange(!settings.launchOnStartup)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.launchOnStartup ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  settings.launchOnStartup ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-surface rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Data Management</h2>

        <div className="space-y-6">
          {/* Export */}
          <div className="space-y-4">
            <div>
              <p className="font-medium text-text-primary">Export Data</p>
              <p className="text-sm text-text-secondary">Download your data as JSON, CSV, or Markdown</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleExport('json')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-gray-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-gray-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => handleExport('md')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-gray-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                MD
              </button>
            </div>
          </div>

          {/* Import */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <p className="font-medium text-text-primary">Import Data</p>
              <p className="text-sm text-text-secondary">Import your data from a JSON backup file</p>
            </div>
            <button
              onClick={handleImport}
              disabled={importStatus === 'success'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              Choose JSON File
            </button>
          </div>

          {/* Status Messages */}
          {(exportStatus !== 'idle' || importStatus !== 'idle') && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                (exportStatus === 'success' || importStatus === 'success')
                  ? 'bg-success/10 text-success'
                  : 'bg-error/10 text-error'
              }`}
            >
              {(exportStatus === 'success' || importStatus === 'success') ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm">
                    {exportStatus === 'success' ? 'Export successful!' : 'Import successful! Data refreshed.'}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">
                    {exportStatus === 'error' ? 'Export failed. Please try again.' : `Import failed: ${importError}`}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div className="bg-surface rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-text-primary mb-4">About</h2>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>
            <span className="font-medium text-text-primary">My Time Tracker</span> v1.0.0
          </p>
          <p>Track what you did on your laptop, desktop, and phone.</p>
          <p>Discover new topics and get insights to improve your productivity.</p>
        </div>
      </div>
    </div>
  )
}
