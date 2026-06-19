import { useState, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Laptop, Monitor, Smartphone, Filter } from 'lucide-react'
import { useStore } from '../stores/appStore'
import type { Activity, DeviceType } from '../types'
import { DEVICE_COLORS } from '../utils/constants'

export default function Calendar() {
  const { activities, topics, setSelectedDate, selectedDate } = useStore()
  const [filterDevice, setFilterDevice] = useState<DeviceType | 'all'>('all')

  // Get activities for selected date
  const selectedDateActivities = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    let filtered = activities.filter((a) => a.startTime.split('T')[0] === dateStr)

    if (filterDevice !== 'all') {
      filtered = filtered.filter((a) => a.device === filterDevice)
    }

    return filtered.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
  }, [activities, selectedDate, filterDevice])

  // Get events for calendar
  const events = useMemo(() => {
    const eventMap: Record<string, { count: number; devices: Set<DeviceType> }> = {}

    activities.forEach((activity) => {
      const date = activity.startTime.split('T')[0]
      if (!eventMap[date]) {
        eventMap[date] = { count: 0, devices: new Set() }
      }
      eventMap[date].count++
      eventMap[date].devices.add(activity.device)
    })

    return Object.entries(eventMap).map(([date, data]) => ({
      date,
      display: 'dot',
      backgroundColor: 'transparent',
      borderColor: 'transparent'
    }))
  }, [activities])

  // Monthly stats
  const monthlyStats = useMemo(() => {
    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    const monthActivities = activities.filter((a) => {
      const actDate = new Date(a.startTime)
      return actDate >= firstDay && actDate <= lastDay
    })

    const totalMinutes = monthActivities.reduce((sum, a) => sum + a.duration, 0)
    const deviceBreakdown = { laptop: 0, desktop: 0, phone: 0 }
    monthActivities.forEach((a) => {
      deviceBreakdown[a.device] += a.duration
    })

    // Find most active day
    const dayCounts: Record<string, number> = {}
    monthActivities.forEach((a) => {
      const day = a.startTime.split('T')[0]
      dayCounts[day] = (dayCounts[day] || 0) + a.duration
    })

    const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]

    return {
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      activityCount: monthActivities.length,
      deviceBreakdown,
      mostActiveDay: mostActiveDay
        ? new Date(mostActiveDay[0]).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })
        : 'N/A'
    }
  }, [activities, selectedDate])

  const handleDateClick = (info: { dateStr: string }) => {
    setSelectedDate(new Date(info.dateStr))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Calendar</h1>
          <p className="text-text-secondary mt-1">
            View and manage your activities by date
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-surface rounded-xl p-6 shadow-card">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            events={events}
            dateClick={handleDateClick}
            height="auto"
            dayMaxEvents={3}
            eventDisplay="dot"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Month Stats */}
          <div className="bg-surface rounded-xl p-6 shadow-card">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Hours</span>
                <span className="font-semibold text-text-primary">
                  {monthlyStats.totalHours}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Activities</span>
                <span className="font-semibold text-text-primary">
                  {monthlyStats.activityCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Most Active Day</span>
                <span className="font-semibold text-text-primary">
                  {monthlyStats.mostActiveDay}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-text-secondary mb-2">Device Breakdown</p>
              <div className="space-y-2">
                {Object.entries(monthlyStats.deviceBreakdown).map(([device, minutes]) => (
                  <div key={device} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: DEVICE_COLORS[device as DeviceType] }}
                    />
                    <span className="text-sm text-text-secondary capitalize">{device}</span>
                    <span className="text-sm font-medium text-text-primary ml-auto">
                      {Math.round(minutes / 60 * 10) / 10}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Day */}
          <div className="bg-surface rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </h3>
              <button
                onClick={() => setFilterDevice('all')}
                className="p-1.5 rounded hover:bg-gray-100 text-text-secondary"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1 mb-4">
              {(['all', 'laptop', 'desktop', 'phone'] as const).map((device) => (
                <button
                  key={device}
                  onClick={() => setFilterDevice(device)}
                  className={`flex-1 py-1.5 text-xs rounded transition-colors ${
                    filterDevice === device
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {device === 'all' ? 'All' : device.charAt(0).toUpperCase() + device.slice(1)}
                </button>
              ))}
            </div>

            {/* Activities list */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {selectedDateActivities.length > 0 ? (
                selectedDateActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 rounded-lg bg-background hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="w-1 h-full min-h-[40px] rounded-full"
                        style={{ backgroundColor: DEVICE_COLORS[activity.device] }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate">
                          {activity.title}
                        </p>
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
                        <div className="flex items-center gap-2 mt-1">
                          {activity.device === 'laptop' && (
                            <Laptop className="w-3 h-3 text-primary" />
                          )}
                          {activity.device === 'desktop' && (
                            <Monitor className="w-3 h-3 text-secondary" />
                          )}
                          {activity.device === 'phone' && (
                            <Smartphone className="w-3 h-3 text-accent" />
                          )}
                          <span className="text-xs text-text-secondary capitalize">
                            {activity.location}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-text-secondary py-4">
                  No activities for this day
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}