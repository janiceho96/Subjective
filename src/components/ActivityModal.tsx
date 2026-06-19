import { useState, useEffect } from 'react'
import { X, Star, Clock, FolderOpen } from 'lucide-react'
import { useStore } from '../stores/appStore'
import type { DeviceType, LocationType } from '../types'

const DEVICES: DeviceType[] = ['laptop', 'desktop', 'phone']
const LOCATIONS: LocationType[] = ['home', 'office', 'travel', 'cafe', 'other']

function normalizeDroppedPath(event: React.DragEvent<HTMLDivElement>) {
  const filePath = event.dataTransfer.files[0]
    ? ((event.dataTransfer.files[0] as File & { path?: string }).path || event.dataTransfer.files[0].name)
    : ''
  const uriList = event.dataTransfer.getData('text/uri-list')
  const plainText = event.dataTransfer.getData('text/plain')
  const rawValue = filePath || uriList || plainText

  return rawValue
    .split('\n')[0]
    .replace(/^file:\/\/\/?/i, '')
    .replace(/\//g, '\\')
    .trim()
}

export default function ActivityModal() {
  const {
    isActivityModalOpen,
    closeActivityModal,
    editingActivity,
    addActivity,
    updateActivity,
    topics
  } = useStore()

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    device: 'laptop' as DeviceType,
    location: 'home' as LocationType,
    topics: [] as string[],
    projectPath: '',
    notes: '',
    productivityRating: 3
  })

  useEffect(() => {
    if (editingActivity) {
      const start = new Date(editingActivity.startTime)
      const end = new Date(editingActivity.endTime)

      setFormData({
        title: editingActivity.title,
        date: start.toISOString().split('T')[0],
        startTime: start.toTimeString().slice(0, 5),
        endTime: end.toTimeString().slice(0, 5),
        device: editingActivity.device,
        location: editingActivity.location,
        topics: editingActivity.topics,
        projectPath: editingActivity.projectPath || '',
        notes: editingActivity.notes,
        productivityRating: editingActivity.productivityRating
      })
    } else {
      // Reset form for new activity
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        device: 'laptop',
        location: 'home',
        topics: [],
        projectPath: '',
        notes: '',
        productivityRating: 3
      })
    }
  }, [editingActivity, isActivityModalOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const startTime = new Date(`${formData.date}T${formData.startTime}:00`)
    const endTime = new Date(`${formData.date}T${formData.endTime}:00`)
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000)

    if (duration <= 0) {
      alert('End time must be after start time')
      return
    }

    const activityData = {
      title: formData.title,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      device: formData.device,
      location: formData.location,
      topics: formData.topics,
      projectPath: formData.projectPath.trim(),
      notes: formData.notes,
      productivityRating: formData.productivityRating
    }

    if (editingActivity) {
      updateActivity(editingActivity.id, activityData)
    } else {
      addActivity(activityData)
    }
  }

  const toggleTopic = (topicId: string) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.includes(topicId)
        ? prev.topics.filter((id) => id !== topicId)
        : [...prev.topics, topicId]
    }))
  }

  const handlePathDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const nextPath = normalizeDroppedPath(event)

    if (!nextPath) {
      return
    }

    setFormData((prev) => ({
      ...prev,
      projectPath: nextPath
    }))
  }

  if (!isActivityModalOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl w-full max-w-lg shadow-modal max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">
            {editingActivity ? 'Edit Activity' : 'Add Activity'}
          </h2>
          <button
            onClick={closeActivityModal}
            className="p-1 rounded hover:bg-gray-100 text-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What did you work on?"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Device */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Device *</label>
            <div className="flex gap-2">
              {DEVICES.map((device) => (
                <button
                  key={device}
                  type="button"
                  onClick={() => setFormData({ ...formData, device })}
                  className={`flex-1 py-2 rounded-lg border transition-colors capitalize ${
                    formData.device === device
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-secondary hover:bg-gray-100'
                  }`}
                >
                  {device}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Location</label>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((location) => (
                <button
                  key={location}
                  type="button"
                  onClick={() => setFormData({ ...formData, location })}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors capitalize ${
                    formData.location === location
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-secondary hover:bg-gray-100'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Topics</label>
            {topics.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggleTopic(topic.id)}
                    className={`px-2 py-1 rounded-full text-xs transition-colors ${
                      formData.topics.includes(topic.id)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No topics available. Add topics first.</p>
            )}
          </div>

          {/* Project path */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Work Path
            </label>
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handlePathDrop}
              className="rounded-lg border border-dashed border-border bg-background-alt p-3 transition-colors hover:border-primary"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                  <FolderOpen className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-text-secondary">
                    Drag a file or folder here, or paste the path manually.
                  </p>
                  <input
                    type="text"
                    value={formData.projectPath}
                    onChange={(e) => setFormData({ ...formData, projectPath: e.target.value })}
                    placeholder="C:\\Projects\\MyApp\\src"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Productivity Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, productivityRating: star })}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= formData.productivityRating
                        ? 'text-warning fill-warning'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeActivityModal}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors"
            >
              {editingActivity ? 'Update' : 'Add'} Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
