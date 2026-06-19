import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useStore } from '../stores/appStore'
import type { TopicCategory } from '../types'
import { CATEGORY_LABELS } from '../utils/constants'

const CATEGORIES: TopicCategory[] = [
  'technology',
  'business',
  'science',
  'arts',
  'health',
  'personal',
  'news',
  'other'
]

export default function TopicModal() {
  const { isTopicModalOpen, closeTopicModal, editingTopic, addTopic, updateTopic } = useStore()

  const [formData, setFormData] = useState({
    name: '',
    category: 'technology' as TopicCategory,
    description: ''
  })

  useEffect(() => {
    if (editingTopic) {
      setFormData({
        name: editingTopic.name,
        category: editingTopic.category,
        description: editingTopic.description
      })
    } else {
      setFormData({
        name: '',
        category: 'technology',
        description: ''
      })
    }
  }, [editingTopic, isTopicModalOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Please enter a topic name')
      return
    }

    if (editingTopic) {
      updateTopic(editingTopic.id, formData)
    } else {
      addTopic(formData)
    }

    closeTopicModal()
  }

  if (!isTopicModalOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl w-full max-w-md shadow-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">
            {editingTopic ? 'Edit Topic' : 'Add Topic'}
          </h2>
          <button
            onClick={closeTopicModal}
            className="p-1 rounded hover:bg-gray-100 text-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Topic Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Machine Learning, Budgeting"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as TopicCategory })
              }
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description or notes about this topic..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeTopicModal}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors"
            >
              {editingTopic ? 'Update' : 'Add'} Topic
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}