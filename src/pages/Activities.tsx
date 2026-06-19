import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Laptop,
  Monitor,
  Smartphone,
  MapPin,
  Clock,
  FolderOpen,
  Edit2,
  Trash2,
  Star
} from 'lucide-react'
import { useStore } from '../stores/appStore'
import type { Activity, DeviceType, LocationType } from '../types'
import { DEVICE_COLORS } from '../utils/constants'

const DEVICE_ICONS = { laptop: Laptop, desktop: Monitor, phone: Smartphone }

const LOCATION_LABELS: Record<LocationType, string> = {
  home: 'Home',
  office: 'Office',
  travel: 'Travel',
  cafe: 'Cafe',
  other: 'Other'
}

export default function Activities() {
  const { activities, topics, openActivityModal, deleteActivity } = useStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterDevice, setFilterDevice] = useState<DeviceType | 'all'>('all')
  const [filterLocation, setFilterLocation] = useState<LocationType | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'duration'>('date')

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = [...activities]

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          (a.projectPath || '').toLowerCase().includes(term) ||
          a.notes.toLowerCase().includes(term) ||
          a.topics.some((tId) => {
            const topic = topics.find((t) => t.id === tId)
            return topic?.name.toLowerCase().includes(term)
          })
      )
    }

    // Device filter
    if (filterDevice !== 'all') {
      filtered = filtered.filter((a) => a.device === filterDevice)
    }

    // Location filter
    if (filterLocation !== 'all') {
      filtered = filtered.filter((a) => a.location === filterLocation)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      }
      return b.duration - a.duration
    })

    return filtered
  }, [activities, topics, searchTerm, filterDevice, filterLocation, sortBy])

  // Stats
  const stats = useMemo(() => {
    return {
      total: activities.length,
      totalHours: Math.round(activities.reduce((sum, a) => sum + a.duration, 0) / 60 * 10) / 10,
      avgDuration:
        activities.length > 0
          ? Math.round(activities.reduce((sum, a) => sum + a.duration, 0) / activities.length)
          : 0
    }
  }, [activities])

  const getTopicsForActivity = (topicIds: string[]) => {
    return topicIds
      .map((id) => topics.find((t) => t.id === id))
      .filter(Boolean)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Activities</h1>
          <p className="text-text-secondary mt-1">
            View and manage all your tracked activities
          </p>
        </div>
        <button
          onClick={() => openActivityModal()}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors shadow-card"
        >
          <Plus className="w-4 h-4" />
          Add Activity
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl p-4 shadow-card">
          <p className="text-sm text-text-secondary">Total Activities</p>
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 shadow-card">
          <p className="text-sm text-text-secondary">Total Time</p>
          <p className="text-2xl font-bold text-text-primary">{stats.totalHours}h</p>
        </div>
        <div className="bg-surface rounded-xl p-4 shadow-card">
          <p className="text-sm text-text-secondary">Average Duration</p>
          <p className="text-2xl font-bold text-text-primary">{stats.avgDuration}m</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-xl p-4 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex gap-2">
            {/* Device filter */}
            <select
              value={filterDevice}
              onChange={(e) => setFilterDevice(e.target.value as DeviceType | 'all')}
              className="px-3 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Devices</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="phone">Phone</option>
            </select>

            {/* Location filter */}
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value as LocationType | 'all')}
              className="px-3 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Locations</option>
              <option value="home">Home</option>
              <option value="office">Office</option>
              <option value="travel">Travel</option>
              <option value="cafe">Cafe</option>
              <option value="other">Other</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'duration')}
              className="px-3 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="date">Sort by Date</option>
              <option value="duration">Sort by Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => {
            const DeviceIcon = DEVICE_ICONS[activity.device]
            const activityTopics = getTopicsForActivity(activity.topics)

            return (
              <div
                key={activity.id}
                className="bg-surface rounded-xl p-4 shadow-card hover:shadow-elevated transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Device indicator */}
                  <div
                    className="w-1 h-full min-h-[80px] rounded-full"
                    style={{ backgroundColor: DEVICE_COLORS[activity.device] }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-text-primary">{activity.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(activity.startTime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <DeviceIcon className="w-3.5 h-3.5" />
                            {activity.device}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {LOCATION_LABELS[activity.location]}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openActivityModal(activity)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteActivity(activity.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Duration and rating */}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-medium text-text-primary">
                        {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= activity.productivityRating
                                ? 'text-warning fill-warning'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Topics */}
                    {activityTopics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {activityTopics.map(
                          (topic) =>
                            topic && (
                              <span
                                key={topic.id}
                                className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {topic.name}
                              </span>
                            )
                        )}
                      </div>
                    )}

                    {activity.projectPath && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
                        <FolderOpen className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate">{activity.projectPath}</span>
                      </div>
                    )}

                    {/* Notes */}
                    {activity.notes && (
                      <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                        {activity.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 bg-surface rounded-xl shadow-card">
            <p className="text-text-secondary">No activities found</p>
            <button
              onClick={() => openActivityModal()}
              className="mt-4 text-primary hover:text-primary-dark"
            >
              Add your first activity
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
