import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Activity, Topic, AppSettings, ViewType, TopicCategory } from '../types'

export interface TrackedActivity {
  id: string
  appName: string
  windowTitle: string
  startTime: string
  endTime: string | null
  duration: number
}

const AUTO_TRACKING_SESSION_TITLE = 'Auto-tracked session'
const AUTO_TRACKING_MERGE_GAP_MS = 5000

function formatTrackedSegment(tracked: TrackedActivity): string {
  const durationMinutes = Math.max(1, Math.round(tracked.duration / 60))
  const hasDistinctWindowTitle = tracked.windowTitle.trim() && tracked.windowTitle !== tracked.appName

  if (hasDistinctWindowTitle) {
    return `${tracked.appName}: ${tracked.windowTitle} (${durationMinutes}m)`
  }

  return `${tracked.appName} (${durationMinutes}m)`
}

interface AppState {
  // Navigation
  currentView: ViewType
  setCurrentView: (view: ViewType) => void

  // Data
  activities: Activity[]
  topics: Topic[]
  settings: AppSettings

  // Auto-tracking state
  isAutoTracking: boolean
  currentTrackingActivity: TrackedActivity | null
  setAutoTracking: (isTracking: boolean) => void
  setCurrentTrackingActivity: (activity: TrackedActivity | null) => void

  // Modal states
  isActivityModalOpen: boolean
  isTopicModalOpen: boolean
  isQuickAddOpen: boolean
  editingActivity: Activity | null
  editingTopic: Topic | null

  // Selected date for calendar
  selectedDate: Date
  setSelectedDate: (date: Date) => void

  // Initialize data from storage
  initializeData: () => Promise<void>

  // Activity CRUD
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateActivity: (id: string, updates: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  setEditingActivity: (activity: Activity | null) => void
  addAutoTrackedActivity: (tracked: TrackedActivity) => void

  // Topic CRUD
  addTopic: (topic: Omit<Topic, 'id' | 'usageCount' | 'createdAt' | 'lastUsedAt'>) => void
  updateTopic: (id: string, updates: Partial<Topic>) => void
  deleteTopic: (id: string) => void
  incrementTopicUsage: (id: string) => void

  // Settings
  updateSettings: (settings: Partial<AppSettings>) => void

  // Modal controls
  openActivityModal: (activity?: Activity) => void
  closeActivityModal: () => void
  openTopicModal: (topic?: Topic) => void
  closeTopicModal: () => void
  openQuickAdd: () => void
  closeQuickAdd: () => void

  // Data persistence
  saveToStorage: () => Promise<void>

  // Helper functions
  getActivitiesForDate: (date: Date) => Activity[]
  getTopicsByCategory: (category: TopicCategory) => Topic[]
}

function buildMergedActivity(
  existing: Activity,
  incoming: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>,
  now: string
): Activity {
  const mergedNotes = existing.notes
    ? `${existing.notes}\n${incoming.notes}`.trim()
    : incoming.notes

  return {
    ...existing,
    endTime: incoming.endTime,
    duration: existing.duration + incoming.duration,
    notes: mergedNotes,
    updatedAt: now
  }
}

const defaultSettings: AppSettings = {
  theme: 'light',
  language: 'en',
  startMinimized: false,
  launchOnStartup: false,
  dailyReminderTime: '18:00',
  weeklySummary: true,
  idleDetection: true,
  idleThreshold: 300,
  dailyGoalHours: 6,
  blockedApps: [],
  sidebarCollapsed: false
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  currentView: 'dashboard',
  activities: [],
  topics: [],
  settings: defaultSettings,
  isActivityModalOpen: false,
  isTopicModalOpen: false,
  isQuickAddOpen: false,
  editingActivity: null,
  editingTopic: null,
  selectedDate: new Date(),
  isAutoTracking: false,
  currentTrackingActivity: null,

  // Navigation
  setCurrentView: (view) => set({ currentView: view }),

  // Auto-tracking
  setAutoTracking: (isTracking) => set({ isAutoTracking: isTracking }),
  setCurrentTrackingActivity: (activity) => set({ currentTrackingActivity: activity }),

  // Date selection
  setSelectedDate: (date) => set({ selectedDate: date }),

  // Initialize data from storage
  initializeData: async () => {
    try {
      if (window.electronAPI) {
        const activities = await window.electronAPI.readFile('activities.json')
        const topics = await window.electronAPI.readFile('topics.json')
        const settings = await window.electronAPI.readFile('settings.json')

        set({
          activities: (activities as Activity[]) || [],
          topics: (topics as Topic[]) || [],
          settings: { ...defaultSettings, ...(settings as AppSettings) }
        })
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  },

  // Activity CRUD
  addActivity: (activityData) => {
    const now = new Date().toISOString()
    const newActivity: Activity = {
      ...activityData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    }

    set((state) => ({
      activities: [...state.activities, newActivity],
      isActivityModalOpen: false,
      editingActivity: null
    }))

    // Increment topic usage
    activityData.topics.forEach((topicId) => {
      get().incrementTopicUsage(topicId)
    })

    get().saveToStorage()
  },

  updateActivity: (id, updates) => {
    set((state) => ({
      activities: state.activities.map((act) =>
        act.id === id
          ? { ...act, ...updates, updatedAt: new Date().toISOString() }
          : act
      ),
      isActivityModalOpen: false,
      editingActivity: null
    }))
    get().saveToStorage()
  },

  deleteActivity: (id) => {
    set((state) => ({
      activities: state.activities.filter((act) => act.id !== id)
    }))
    get().saveToStorage()
  },

  setEditingActivity: (activity) => set({ editingActivity: activity }),

  // Auto-tracked activity handler
  addAutoTrackedActivity: (tracked: TrackedActivity) => {
    const activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> = {
      title: AUTO_TRACKING_SESSION_TITLE,
      startTime: tracked.startTime,
      endTime: tracked.endTime || new Date().toISOString(),
      duration: Math.floor(tracked.duration / 60),
      trackingSource: 'auto',
      device: 'desktop',
      location: 'office',
      topics: [],
      projectPath: '',
      notes: formatTrackedSegment(tracked),
      productivityRating: 3
    }

    const now = new Date().toISOString()
    set((state) => {
      const lastActivity = state.activities[state.activities.length - 1]
      const trackedStart = new Date(activity.startTime).getTime()
      const lastActivityEnd = lastActivity ? new Date(lastActivity.endTime).getTime() : 0
      const shouldMerge =
        lastActivity?.trackingSource === 'auto' &&
        trackedStart - lastActivityEnd <= AUTO_TRACKING_MERGE_GAP_MS

      if (shouldMerge && lastActivity) {
        return {
          activities: state.activities.map((existing) =>
            existing.id === lastActivity.id
              ? buildMergedActivity(existing, activity, now)
              : existing
          )
        }
      }

      return {
        activities: [...state.activities, { ...activity, id: uuidv4(), createdAt: now, updatedAt: now }]
      }
    })

    get().saveToStorage()
  },

  // Topic CRUD
  addTopic: (topicData) => {
    const now = new Date().toISOString()
    const newTopic: Topic = {
      ...topicData,
      id: uuidv4(),
      usageCount: 0,
      createdAt: now,
      lastUsedAt: now
    }

    set((state) => ({
      topics: [...state.topics, newTopic],
      isTopicModalOpen: false,
      editingTopic: null
    }))
    get().saveToStorage()
  },

  updateTopic: (id, updates) => {
    set((state) => ({
      topics: state.topics.map((topic) =>
        topic.id === id ? { ...topic, ...updates } : topic
      ),
      isTopicModalOpen: false,
      editingTopic: null
    }))
    get().saveToStorage()
  },

  deleteTopic: (id) => {
    set((state) => ({
      topics: state.topics.filter((topic) => topic.id !== id)
    }))
    get().saveToStorage()
  },

  incrementTopicUsage: (id) => {
    set((state) => ({
      topics: state.topics.map((topic) =>
        topic.id === id
          ? { ...topic, usageCount: topic.usageCount + 1, lastUsedAt: new Date().toISOString() }
          : topic
      )
    }))
    get().saveToStorage()
  },

  // Settings
  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }))
    get().saveToStorage()
  },

  // Modal controls
  openActivityModal: (activity) => {
    set({
      isActivityModalOpen: true,
      editingActivity: activity || null
    })
  },

  closeActivityModal: () => {
    set({
      isActivityModalOpen: false,
      editingActivity: null
    })
  },

  openTopicModal: (topic) => {
    set({
      isTopicModalOpen: true,
      editingTopic: topic || null
    })
  },

  closeTopicModal: () => {
    set({
      isTopicModalOpen: false,
      editingTopic: null
    })
  },

  openQuickAdd: () => set({ isQuickAddOpen: true }),
  closeQuickAdd: () => set({ isQuickAddOpen: false }),

  // Save to storage
  saveToStorage: async () => {
    try {
      if (window.electronAPI) {
        const { activities, topics, settings } = get()
        await window.electronAPI.writeFile('activities.json', activities)
        await window.electronAPI.writeFile('topics.json', topics)
        await window.electronAPI.writeFile('settings.json', settings)
      }
    } catch (error) {
      console.error('Failed to save data:', error)
    }
  },

  // Helper functions
  getActivitiesForDate: (date) => {
    const { activities } = get()
    const dateStr = date.toISOString().split('T')[0]
    return activities.filter((act) => act.startTime.split('T')[0] === dateStr)
  },

  getTopicsByCategory: (category) => {
    const { topics } = get()
    return topics.filter((topic) => topic.category === category)
  }
}))
