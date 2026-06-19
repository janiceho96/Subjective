import { useEffect, useRef, useState } from 'react'
import { useStore } from '../stores/appStore'

const APE_URL = 'http://localhost:3001'
const POLL_INTERVAL_MS = 1000
const POLL_TIMEOUT_MS = 15000

export default function FocusMode() {
  const { addActivity } = useStore()
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const startTimeRef = useRef<string>(new Date().toISOString())
  const addActivityRef = useRef(addActivity)

  // Keep ref current without re-running the tracking effect
  useEffect(() => {
    addActivityRef.current = addActivity
  }, [addActivity])

  // Poll until the APE backend responds, then show the iframe
  useEffect(() => {
    let cancelled = false
    const deadline = Date.now() + POLL_TIMEOUT_MS

    async function poll() {
      while (!cancelled && Date.now() < deadline) {
        try {
          const res = await fetch(`${APE_URL}/health`)
          if (res.ok) {
            if (!cancelled) setReady(true)
            return
          }
        } catch {
          // still starting
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
      }
      if (!cancelled) setFailed(true)
    }

    poll()
    return () => { cancelled = true }
  }, [])

  // Log a time-tracker activity when the user leaves Focus Mode
  useEffect(() => {
    const start = new Date().toISOString()
    startTimeRef.current = start

    return () => {
      const end = new Date().toISOString()
      const durationMs = new Date(end).getTime() - new Date(start).getTime()
      const durationMinutes = Math.max(1, Math.round(durationMs / 60000))

      addActivityRef.current({
        title: 'Focus Mode Session',
        startTime: start,
        endTime: end,
        duration: durationMinutes,
        trackingSource: 'auto',
        device: 'laptop',
        location: 'home',
        topics: [],
        notes: 'Automatically tracked from Focus Mode',
        productivityRating: 4
      })
    }
  }, [])

  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-text-secondary">
        <p className="text-lg font-semibold">Could not connect to Focus Mode</p>
        <p className="text-sm">The Anti-Procrastination Engine backend did not start in time.</p>
        <button
          onClick={() => { setFailed(false); setReady(false) }}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-text-secondary">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Starting Focus Mode...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <iframe
        src={APE_URL}
        className="w-full h-full border-0"
        title="Focus Mode"
        allow="autoplay"
      />
    </div>
  )
}
