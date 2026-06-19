import { useEffect, useRef, useState } from 'react'
import { useStore } from '../stores/appStore'
import type { Activity } from '../types'
import { Send, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function buildContext(activities: Activity[]): string {
  const today = new Date().toISOString().split('T')[0]
  const last7 = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const recent = activities.filter((a: Activity) => a.startTime >= last7)
  const todayActs = activities.filter((a: Activity) => a.startTime.startsWith(today))

  const totalMinutes = recent.reduce((s: number, a: Activity) => s + a.duration, 0)
  const todayMinutes = todayActs.reduce((s: number, a: Activity) => s + a.duration, 0)

  const byDay: Record<string, number> = {}
  for (const a of recent) {
    const d = a.startTime.split('T')[0]
    byDay[d] = (byDay[d] ?? 0) + a.duration
  }

  const recentList = recent
    .slice(-10)
    .map(a => `- ${a.title} (${a.duration}min, rating ${a.productivityRating}/5)`)
    .join('\n')

  return `USER ACTIVITY DATA (last 7 days):
Today: ${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m tracked across ${todayActs.length} activities
Week total: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m across ${recent.length} activities
Daily breakdown: ${Object.entries(byDay).map(([d, m]) => `${d}: ${Math.floor(m / 60)}h${m % 60}m`).join(', ')}

Recent activities:
${recentList || 'No recent activities logged'}`
}

export default function AIChat() {
  const { activities } = useStore()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I can see your time tracking data and help you understand your productivity patterns, suggest improvements, or just chat about how you're spending your time. What would you like to know?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const context = buildContext(activities)
      const result = await window.electronAPI.aiChat(
        history.map(m => ({ role: m.role, content: m.content })),
        context
      )
      if (result.error) {
        setMessages(h => [...h, { role: 'assistant', content: `Error: ${result.error}` }])
      } else {
        setMessages(h => [...h, { role: 'assistant', content: result.content ?? '' }])
      }
    } catch {
      setMessages(h => [...h, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-text-primary">AI Assistant</h2>
            <p className="text-xs text-text-secondary">Knows your activity data · Powered by AI</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-primary to-secondary'
                : 'bg-gray-200'
            }`}>
              {msg.role === 'assistant'
                ? <Bot className="w-4 h-4 text-white" />
                : <User className="w-4 h-4 text-gray-600" />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-surface text-text-primary rounded-tl-sm border border-border'
                : 'bg-primary text-white rounded-tr-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about your productivity, patterns, or goals..."
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-xs text-text-secondary mt-2 text-center">
          Your activity data is sent to the AI to provide personalized responses
        </p>
      </div>
    </div>
  )
}
