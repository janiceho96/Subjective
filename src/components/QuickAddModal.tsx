import { useState } from 'react'
import { X, Clock, Laptop, Monitor, Smartphone } from 'lucide-react'
import { useStore } from '../stores/appStore'
import type { DeviceType, LocationType } from '../types'

const DEVICES: { value: DeviceType; icon: typeof Laptop; label: string }[] = [
  { value: 'laptop', icon: Laptop, label: 'Laptop' },
  { value: 'desktop', icon: Monitor, label: 'Desktop' },
  { value: 'phone', icon: Smartphone, label: 'Phone' }
]

export default function QuickAddModal() {
  const { isQuickAddOpen, closeQuickAdd, addActivity, topics } = useStore()

  const [title, setTitle] = useState('')
  const [device, setDevice] = useState<DeviceType>('laptop')
  const [location, setLocation] = useState<LocationType>('home')
  const [duration, setDuration] = useState(60)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('Please enter an activity title')
      return
    }

    const now = new Date()
    const startTime = new Date(now.getTime() - duration * 60000)
    const endTime = now

    addActivity({
      title: title.trim(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      device,
      location,
      topics: selectedTopics,
      projectPath: '',
      notes: notes.trim(),
      productivityRating: 3
    })

    // Reset form
    setTitle('')
    setDevice('laptop')
    setLocation('home')
    setDuration(60)
    setSelectedTopics([])
    setNotes('')

    closeQuickAdd()
  }

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    )
  }

  if (!isQuickAddOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl w-full max-w-md shadow-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Quick Add Activity</h2>
          <button
            onClick={closeQuickAdd}
            className="p-1 rounded hover:bg-gray-100 text-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you just do?"
              autoFocus
              className="w-full px-3 py-3 rounded-lg border border-border bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg"
            />
          </div>

          {/* Device */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Device</label>
            <div className="flex gap-2">
              {DEVICES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDevice(d.value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                    device === d.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-secondary hover:bg-gray-100'
                  }`}
                >
                  <d.icon className="w-4 h-4" />
                  <span className="text-sm">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Duration</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="15"
                max="240"
                step="15"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex items-center gap-1 text-text-primary font-mono w-20">
                <Clock className="w-4 h-4 text-text-secondary" />
                <span>
                  {Math.floor(duration / 60)}h {duration % 60}m
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>15m</span>
              <span>1h</span>
              <span>2h</span>
              <span>4h</span>
            </div>
          </div>

          {/* Topics */}
          {topics.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Topics</label>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggleTopic(topic.id)}
                    className={`px-2 py-1 rounded-full text-xs transition-colors ${
                      selectedTopics.includes(topic.id)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a quick note about what you worked on..."
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Actions */}
          <button
            type="submit"
            className="w-full px-4 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors font-medium"
          >
            Add Activity
          </button>
        </form>
      </div>
    </div>
  )
}
