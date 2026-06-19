import { useMemo, useState } from 'react'
import { Plus, Search, Tag, TrendingUp, Clock, Edit2, Trash2 } from 'lucide-react'
import { useStore } from '../stores/appStore'
import type { TopicCategory } from '../types'
import { CATEGORY_LABELS } from '../utils/constants'

const CATEGORY_COLORS: Record<TopicCategory, string> = {
  technology: '#6366F1',
  business: '#8B5CF6',
  science: '#10B981',
  arts: '#F59E0B',
  health: '#EF4444',
  personal: '#EC4899',
  news: '#64748B',
  other: '#94A3B8'
}

export default function Topics() {
  const { topics, openTopicModal, deleteTopic } = useStore()

  // Group topics by category
  const topicsByCategory = useMemo(() => {
    const grouped: Record<TopicCategory, typeof topics> = {
      technology: [],
      business: [],
      science: [],
      arts: [],
      health: [],
      personal: [],
      news: [],
      other: []
    }

    topics.forEach((topic) => {
      grouped[topic.category].push(topic)
    })

    // Sort each category by usage count
    Object.keys(grouped).forEach((cat) => {
      grouped[cat as TopicCategory].sort((a, b) => b.usageCount - a.usageCount)
    })

    return grouped
  }, [topics])

  // Overall stats
  const stats = useMemo(() => {
    return {
      totalTopics: topics.length,
      totalUsage: topics.reduce((sum, t) => sum + t.usageCount, 0),
      topTopic: [...topics].sort((a, b) => b.usageCount - a.usageCount)[0]?.name || 'None'
    }
  }, [topics])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TopicCategory | 'all'>('all')

  // Filter topics
  const filteredTopics = useMemo(() => {
    let filtered = topics

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [topics, selectedCategory, searchTerm])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Topics</h1>
          <p className="text-text-secondary mt-1">
            Track and manage topics you've discovered
          </p>
        </div>
        <button
          onClick={() => openTopicModal()}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors shadow-card"
        >
          <Plus className="w-4 h-4" />
          Add Topic
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Topics</p>
              <p className="text-xl font-bold text-text-primary">{stats.totalTopics}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Usage</p>
              <p className="text-xl font-bold text-text-primary">{stats.totalUsage}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Most Used</p>
              <p className="text-xl font-bold text-text-primary truncate">{stats.topTopic}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {(Object.keys(CATEGORY_COLORS) as TopicCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'text-white'
                  : 'bg-surface text-text-secondary hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: selectedCategory === cat ? CATEGORY_COLORS[cat] : undefined
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      {filteredTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-surface rounded-xl p-4 shadow-card hover:shadow-elevated transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className="px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: CATEGORY_COLORS[topic.category] }}
                >
                  {CATEGORY_LABELS[topic.category]}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openTopicModal(topic)}
                    className="p-1.5 rounded hover:bg-gray-100 text-text-secondary"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTopic(topic.id)}
                    className="p-1.5 rounded hover:bg-gray-100 text-error"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-text-primary mb-1">{topic.name}</h3>
              {topic.description && (
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                  {topic.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                  Used <span className="font-medium text-text-primary">{topic.usageCount}</span> times
                </span>
                <span className="text-text-secondary text-xs">
                  Last: {new Date(topic.lastUsedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface rounded-xl shadow-card">
          <Tag className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">No topics found</p>
          <button
            onClick={() => openTopicModal()}
            className="mt-4 text-primary hover:text-primary-dark"
          >
            Add your first topic
          </button>
        </div>
      )}
    </div>
  )
}