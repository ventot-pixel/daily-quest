import { Task } from '@/types'
import { getDayOfWeek } from './dates'

export function taskAppearsOnDate(task: Task, dateKey: string): boolean {
  if (!task.isActive) return false

  const taskCreated = task.createdAt.split('T')[0]

  // One-time: only on creation date
  if (task.repeat.type === 'one-time') {
    return dateKey === taskCreated
  }

  // Don't show before creation date
  if (dateKey < taskCreated) return false

  const dow = getDayOfWeek(dateKey)

  if (task.repeat.type === 'daily') return true

  if (task.repeat.type === 'weekdays') {
    return dow >= 1 && dow <= 5
  }

  if (task.repeat.type === 'custom' && task.repeat.days) {
    return task.repeat.days.includes(dow)
  }

  return false
}

export function getTasksForDate(tasks: Task[], dateKey: string): Task[] {
  return tasks
    .filter(t => taskAppearsOnDate(t, dateKey))
    .sort((a, b) => {
      const at = a.timeStart, bt = b.timeStart
      if (!at && !bt) return 0
      if (!at) return 1
      if (!bt) return -1
      return at.localeCompare(bt)
    })
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
