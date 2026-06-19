import {
  LayoutDashboard,
  CalendarDays,
  Tags,
  ListTodo,
  Lightbulb,
  Settings,
  Clock,
  Target,
  MessageSquare,
  Moon,
  Sun
} from 'lucide-react'
import { useStore } from '../stores/appStore'
import type { ViewType } from '../types'

const navItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'topics', label: 'Topics', icon: Tags },
  { id: 'activities', label: 'Activities', icon: ListTodo },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'settings', label: 'Settings', icon: Settings }
]

export default function Sidebar() {
  const { currentView, setCurrentView, activities, settings, updateSettings } = useStore()

  const isDark = settings.theme === 'dark' ||
    (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  function toggleDark() {
    updateSettings({ theme: isDark ? 'light' : 'dark' })
  }

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0]
  const todayActivities = activities.filter(
    (a) => a.startTime.split('T')[0] === today
  )
  const todayMinutes = todayActivities.reduce((sum, a) => sum + a.duration, 0)

  return (
    <aside className="w-56 bg-surface border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-text-primary text-sm">My Time Tracker</h1>
            <p className="text-xs text-text-secondary">Track your journey</p>
          </div>
          <button
            onClick={toggleDark}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors shrink-0"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          )
        })}

        {/* Focus Mode + AI Chat — separated */}
        <div className="pt-2 mt-2 border-t border-border space-y-1">
          {([
            { id: 'focus-mode' as const, label: 'Focus Mode', icon: Target },
            { id: 'ai-chat' as const, label: 'AI Assistant', icon: MessageSquare }
          ]).map(item => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Today's Stats */}
      <div className="p-4 border-t border-border">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-text-secondary">Today's Progress</p>
            <p className="text-xs text-text-secondary">
              {Math.round((todayMinutes / ((settings.dailyGoalHours ?? 6) * 60)) * 100)}%
            </p>
          </div>
          <p className="text-xl font-bold text-primary">
            {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Goal: {settings.dailyGoalHours ?? 6}h · {todayActivities.length} activities
          </p>
          <div className="mt-2 h-1.5 bg-primary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (todayMinutes / ((settings.dailyGoalHours ?? 6) * 60)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Version */}
      <div className="p-3 text-center">
        <p className="text-xs text-text-secondary">v1.0.0</p>
      </div>
    </aside>
  )
}