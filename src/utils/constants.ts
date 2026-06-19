import type { DeviceType, LocationType, TopicCategory } from '../types'

export const DEVICE_COLORS: Record<DeviceType, string> = {
  laptop: '#6366F1',
  desktop: '#8B5CF6',
  phone: '#22D3EE'
}

export const LOCATION_COLORS: Record<LocationType, string> = {
  home: '#10B981',
  office: '#6366F1',
  travel: '#F59E0B',
  cafe: '#EC4899',
  other: '#94A3B8'
}

export const CATEGORY_LABELS: Record<TopicCategory, string> = {
  technology: 'Technology',
  business: 'Business & Finance',
  science: 'Science',
  arts: 'Arts & Culture',
  health: 'Health & Wellness',
  personal: 'Personal Development',
  news: 'News & Current Events',
  other: 'Other'
}

export const chartTickColor = 'rgb(var(--color-text-secondary))'

export const chartTooltipStyle = {
  backgroundColor: 'rgb(var(--color-surface))',
  border: '1px solid rgb(var(--color-border))',
  borderRadius: '8px',
  boxShadow: 'var(--shadow-card)'
}
