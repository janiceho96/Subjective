import { useMemo } from 'react'
import { Lightbulb } from 'lucide-react'
import { useStore } from '../stores/appStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import type { Suggestion } from '../types'
import { DEVICE_COLORS, LOCATION_COLORS, chartTickColor, chartTooltipStyle } from '../utils/constants'

export default function Insights() {
  const { activities, topics } = useStore()

  // Analyze patterns and generate insights
  const suggestions = useMemo((): Suggestion[] => {
    const result: Suggestion[] = []

    // Get last 7 days data
    const last7Days: string[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      last7Days.push(date.toISOString().split('T')[0])
    }

    const weekActivities = activities.filter((a) =>
      last7Days.includes(a.startTime.split('T')[0])
    )

    // Pattern: Peak productivity hours
    const hourCounts: Record<number, { count: number; total: number }> = {}
    weekActivities.forEach((a) => {
      const hour = new Date(a.startTime).getHours()
      if (!hourCounts[hour]) hourCounts[hour] = { count: 0, total: 0 }
      hourCounts[hour].count++
      hourCounts[hour].total += a.duration
    })

    const peakHour = Object.entries(hourCounts).sort(
      (a, b) => b[1].total - a[1].total
    )[0]

    if (peakHour) {
      const hour = parseInt(peakHour[0])
      const timeLabel = hour >= 12 ? 'afternoon' : 'morning'
      result.push({
        id: 'peak-hours',
        type: 'pattern',
        title: 'Peak Productivity Time',
        description: `You're most productive during the ${timeLabel} (${hour}:00 - ${
          hour + 1
        }:00). Consider scheduling important tasks during this window.`,
        priority: 'high'
      })
    }

    // Pattern: Device usage
    const deviceUsage: Record<string, number> = { laptop: 0, desktop: 0, phone: 0 }
    weekActivities.forEach((a) => {
      deviceUsage[a.device] += a.duration
    })

    const totalDeviceTime =
      deviceUsage.laptop + deviceUsage.desktop + deviceUsage.phone
    const laptopPercent = (deviceUsage.laptop / totalDeviceTime) * 100

    if (laptopPercent > 70) {
      result.push({
        id: 'device-balance',
        type: 'diversity',
        title: 'Device Balance Tip',
        description:
          'You primarily use your laptop for most activities. Consider if desktop or phone could be more efficient for certain tasks.',
        priority: 'medium'
      })
    }

    // Pattern: Topic diversity
    const topicCounts: Record<string, number> = {}
    weekActivities.forEach((a) => {
      a.topics.forEach((tId) => {
        const topic = topics.find((t) => t.id === tId)
        if (topic) {
          topicCounts[topic.name] = (topicCounts[topic.name] || 0) + 1
        }
      })
    })

    const uniqueTopics = Object.keys(topicCounts).length
    if (uniqueTopics < 3 && weekActivities.length > 5) {
      result.push({
        id: 'topic-diversity',
        type: 'diversity',
        title: 'Explore New Topics',
        description:
          'You seem to focus on a narrow set of topics. Exploring new areas could lead to fresh insights and opportunities.',
        priority: 'medium'
      })
    } else if (uniqueTopics > 5) {
      result.push({
        id: 'topic-engagement',
        type: 'productivity',
        title: 'Great Topic Diversity!',
        description: `You've explored ${uniqueTopics} different topics this week. This variety shows good curiosity and learning!`,
        priority: 'low'
      })
    }

    // Compare with last week
    const last14Days: string[] = []
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      last14Days.push(date.toISOString().split('T')[0])
    }

    const lastWeekActivities = activities.filter(
      (a) =>
        last14Days.slice(0, 7).includes(a.startTime.split('T')[0]) &&
        !last7Days.includes(a.startTime.split('T')[0])
    )

    const thisWeekMinutes = weekActivities.reduce((sum, a) => sum + a.duration, 0)
    const lastWeekMinutes = lastWeekActivities.reduce((sum, a) => sum + a.duration, 0)

    if (thisWeekMinutes > lastWeekMinutes * 1.2) {
      result.push({
        id: 'improvement',
        type: 'productivity',
        title: 'Excellent Progress!',
        description: `You've increased your tracking by ${Math.round(
          ((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100
        )}% compared to last week. Keep up the great work!`,
        priority: 'high'
      })
    } else if (thisWeekMinutes < lastWeekMinutes * 0.8) {
      result.push({
        id: 'decrease',
        type: 'tip',
        title: 'Stay Consistent',
        description:
          'Your tracking is down this week compared to last. Try setting a daily reminder to maintain your tracking habit.',
        priority: 'medium'
      })
    }

    return result
  }, [activities, topics])

  // Device distribution data
  const deviceData = useMemo(() => {
    const usage: Record<string, number> = { laptop: 0, desktop: 0, phone: 0 }
    activities.forEach((a) => {
      usage[a.device] += a.duration
    })

    return Object.entries(usage).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(value / 60 * 10) / 10,
      color: DEVICE_COLORS[name as keyof typeof DEVICE_COLORS]
    }))
  }, [activities])

  // Location distribution data
  const locationData = useMemo(() => {
    const usage: Record<string, number> = { home: 0, office: 0, travel: 0, cafe: 0, other: 0 }
    activities.forEach((a) => {
      usage[a.location] += a.duration
    })

    return Object.entries(usage)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(value / 60 * 10) / 10,
        color: LOCATION_COLORS[name as keyof typeof LOCATION_COLORS]
      }))
  }, [activities])

  // Weekly trend data
  const weeklyData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayActivities = activities.filter((a) => a.startTime.split('T')[0] === dateStr)

      const byDevice = { laptop: 0, desktop: 0, phone: 0 }
      dayActivities.forEach((a) => {
        byDevice[a.device] += a.duration / 60
      })

      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        laptop: Math.round(byDevice.laptop * 10) / 10,
        desktop: Math.round(byDevice.desktop * 10) / 10,
        phone: Math.round(byDevice.phone * 10) / 10
      })
    }
    return days
  }, [activities])

  // Top topics
  const topTopics = useMemo(() => {
    const topicCounts: Record<string, number> = {}
    activities.forEach((a) => {
      a.topics.forEach((tId) => {
        const topic = topics.find((t) => t.id === tId)
        if (topic) {
          topicCounts[topic.name] = (topicCounts[topic.name] || 0) + 1
        }
      })
    })

    return Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }, [activities, topics])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Insights</h1>
        <p className="text-text-secondary mt-1">
          AI-powered analysis and suggestions to improve your productivity
        </p>
      </div>

      {/* Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`bg-surface rounded-xl p-4 shadow-card border-l-4 ${
              suggestion.priority === 'high'
                ? 'border-l-primary'
                : suggestion.priority === 'medium'
                ? 'border-l-warning'
                : 'border-l-success'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  suggestion.priority === 'high'
                    ? 'bg-primary/10 text-primary'
                    : suggestion.priority === 'medium'
                    ? 'bg-warning/10 text-warning'
                    : 'bg-success/10 text-success'
                }`}
              >
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">{suggestion.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{suggestion.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Device Trend */}
        <div className="bg-surface rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Weekly Device Trend
          </h3>
          <div className="h-64">
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
                <Bar dataKey="laptop" stackId="a" fill="#6366F1" name="Laptop" />
                <Bar dataKey="desktop" stackId="a" fill="#8B5CF6" name="Desktop" />
                <Bar dataKey="phone" stackId="a" fill="#22D3EE" name="Phone" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-surface rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Device Distribution
          </h3>
          {deviceData.some((d) => d.value > 0) ? (
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceData
                      .filter((d) => d.value > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}h`} contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {deviceData
                  .filter((d) => d.value > 0)
                  .map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-text-secondary">{item.name}</span>
                      <span className="text-sm font-medium text-text-primary">
                        {item.value}h
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-secondary">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Distribution */}
        <div className="bg-surface rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Location Distribution
          </h3>
          {locationData.length > 0 ? (
            <div className="space-y-3">
              {locationData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-text-secondary w-20">{item.name}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(item.value / Math.max(...locationData.map((d) => d.value))) * 100}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-text-primary w-12 text-right">
                    {item.value}h
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-text-secondary">
              No data available
            </div>
          )}
        </div>

        {/* Top Topics */}
        <div className="bg-surface rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Top Topics</h3>
          {topTopics.length > 0 ? (
            <div className="space-y-3">
              {topTopics.map((topic, index) => (
                <div key={topic.name} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-secondary w-6">
                    {index + 1}.
                  </span>
                  <span className="flex-1 text-text-primary truncate">{topic.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(topic.count / topTopics[0].count) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text-primary w-8 text-right">
                      {topic.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-text-secondary">
              No topics tracked yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
