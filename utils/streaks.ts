import { DayRecord } from '@/types'
import { toDateKey } from './dates'

export function calculateCurrentStreak(history: Record<string, DayRecord>): number {
  let streak = 0
  const today = new Date()

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = toDateKey(d)
    const record = history[key]

    const hadActivity = record?.tasks.some(t => t.status === 'completed' || t.status === 'partial')
    if (!hadActivity) {
      // Allow today to be empty (day not done yet)
      if (i === 0) continue
      break
    }
    streak++
  }

  return streak
}

export function calculateBestStreak(history: Record<string, DayRecord>): number {
  const keys = Object.keys(history).sort()
  let best = 0
  let current = 0
  let prevKey = ''

  for (const key of keys) {
    const hadActivity = history[key].tasks.some(
      t => t.status === 'completed' || t.status === 'partial'
    )
    if (!hadActivity) {
      current = 0
      prevKey = ''
      continue
    }

    if (prevKey) {
      const prev = new Date(prevKey + 'T12:00:00')
      const curr = new Date(key + 'T12:00:00')
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        current++
      } else {
        current = 1
      }
    } else {
      current = 1
    }

    if (current > best) best = current
    prevKey = key
  }

  return best
}
