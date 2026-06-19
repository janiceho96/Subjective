import { useMemo } from 'react'
import {
  Clock,
  TrendingUp,
  Target,
  Flame,
  Laptop,
  Monitor,
  Smartphone,
  Plus,
  ArrowRight
} from 'lucide-react'
import { useStore } from '../stores/appStore'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { DEVICE_COLORS, chartTickColor, chartTooltipStyle } from '../utils/constants'

export default function Dashboard() {
  const { activities, topics, setCurrentView, openQuickAdd } = useStore()

  const today = new Date().toISOString().split('T')[0]
  const todayActivities = activities.filter(
    (a) => a.startTime.split('T')[0] === today
  )

  // Today's stats
  const todayMinutes = todayActivities.reduce((sum, a) => sum + a.duration, 0)
  const topTopic = useMemo(() => {
    const topicCounts: Record<string, number> = {}
    todayActivities.forEach((a) => {
      a.topics.forEach((tId) => {
        const topic = topics.find((t) => t.id === tId)
        if (topic) {
          topicCounts[topic.name] = (topicCounts[topic.name] || 0) + 1
        }
      })
    })
    return Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
  }, [todayActivities, topics])

  // Device breakdown
  const deviceBreakdown = useMemo(() => {
    const breakdown = { laptop: 0, desktop: 0, phone: 0 }
    todayActivities.forEach((a) => {
      breakdown[a.device] += a.duration
    })
    return [
      { name: 'Laptop', value: breakdown.laptop, color: DEVICE_COLORS.laptop },
      { name: 'Desktop', value: breakdown.desktop, color: DEVICE_COLORS.desktop },
      { name: 'Phone', value: breakdown.phone, color: DEVICE_COLORS.phone }
    ].filter((d) => d.value > 0)
  }, [todayActivities])

  // Weekly data for chart
  const weeklyData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayActivities = activities.filter((a) => a.startTime.split('T')[0] === dateStr)
      const totalMinutes = dayActivities.reduce((sum, a) => sum + a.duration, 0)

      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Math.round(totalMinutes / 60 * 10) / 10
      })
    }
    return days
  }, [activities])

  // Streak calculation
  const streak = useMemo(() => {
    let count = 0
    const date = new Date()

    while (true) {
      const dateStr = date.toISOString().split('T')[0]
      const hasActivity = activities.some((a) => a.startTime.split('T')[0] === dateStr)

      if (hasActivity) {
        count++
        date.setDate(date.getDate() - 1)
      } else {
        break
      }
    }

    return count
  }, [activities])

  // Recent activities
  const recentActivities = useMemo(
    () =>
      [...activities]
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 5),
    [activities]
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Welcome back! Here's your progress today.</p>
        </div>
        <button
          onClick={openQuickAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors shadow-card"
        >
          <Plus className="w-4 h-4" />
          Quick Add
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Today's Time"
          value={`${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m`}
          color="primary"
        />
        <StatCard
          icon={TrendingUp}
          label="Activities Today"
          value={todayActivities.length.toString()}
          color="secondary"
        />
        <StatCard
          icon={Target}
          label="Top Topic"
          value={topTopic}
          color="accent"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${streak} days`}
          color="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-surface rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Weekly Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chartTickColor, fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chartTickColor, fontSize: 12 }}
                  unit="h"
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="hours" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-surface rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Device Usage Today</h3>
          {deviceBreakdown.length > 0 ? (
            <div className="h-48 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${Math.round(value / 60 * 10) / 10}h`}
                    contentStyle={chartTooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {deviceBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-text-secondary">{item.name}</span>
                    <span className="text-sm font-medium text-text-primary">
                      {Math.round(item.value / 60 * 10) / 10}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-secondary">
              No activities logged today
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-surface rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Recent Activities</h3>
          <button
            onClick={() => setCurrentView('activities')}
            className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-background hover:bg-gray-100 transition-colors"
              >
                <div
                  className="w-1 h-12 rounded-full"
                  style={{
                    backgroundColor: DEVICE_COLORS[activity.device]
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{activity.title}</p>
                  <p className="text-sm text-text-secondary">
                    {new Date(activity.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}{' '}
                    -{' '}
                    {new Date(activity.endTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">
                    {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                  </p>
                  <div className="flex items-center gap-1 text-xs text-text-secondary">
                    {activity.device === 'laptop' && <Laptop className="w-3 h-3" />}
                    {activity.device === 'desktop' && <Monitor className="w-3 h-3" />}
                    {activity.device === 'phone' && <Smartphone className="w-3 h-3" />}
                    <span className="capitalize">{activity.device}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-text-secondary">
            <p>No activities yet. Start tracking!</p>
            <button
              onClick={openQuickAdd}
              className="mt-2 text-primary hover:text-primary-dark"
            >
              Add your first activity
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string
  color: 'primary' | 'secondary' | 'accent' | 'warning'
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    warning: 'bg-warning/10 text-warning'
  }

  return (
    <div className="bg-surface rounded-xl p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="text-xl font-bold text-text-primary">{value}</p>
        </div>
      </div>
    </div>
  )
}
