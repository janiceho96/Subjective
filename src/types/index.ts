export type DeviceType = 'laptop' | 'desktop' | 'phone'
export type LocationType = 'home' | 'office' | 'travel' | 'cafe' | 'other'
export type TopicCategory =
  | 'technology'
  | 'business'
  | 'science'
  | 'arts'
  | 'health'
  | 'personal'
  | 'news'
  | 'other'

export interface Activity {
  id: string
  title: string
  startTime: string // ISO string
  endTime: string // ISO string
  duration: number // minutes
  trackingSource?: 'manual' | 'auto'
  device: DeviceType
  location: LocationType
  topics: string[] // topic IDs
  projectPath?: string
  notes: string
  productivityRating: number // 1-5
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: string
  name: string
  category: TopicCategory
  description: string
  usageCount: number
  createdAt: string
  lastUsedAt: string
}

export interface DailySummary {
  date: string // YYYY-MM-DD
  totalMinutes: number
  activityCount: number
  deviceBreakdown: {
    laptop: number
    desktop: number
    phone: number
  }
  topTopics: string[]
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  startMinimized: boolean
  launchOnStartup: boolean
  dailyReminderTime: string
  weeklySummary: boolean
  idleDetection: boolean
  idleThreshold: number
  dailyGoalHours: number      // target hours per day, default 6
  blockedApps: string[]       // app names to flag during Focus Mode
  sidebarCollapsed: boolean   // compact sidebar state
}

export interface Suggestion {
  id: string
  type: 'productivity' | 'diversity' | 'pattern' | 'tip'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

export type ViewType = 'dashboard' | 'calendar' | 'topics' | 'activities' | 'insights' | 'settings' | 'focus-mode' | 'ai-chat' | 'pomodoro'
