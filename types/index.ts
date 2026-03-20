export type Category = 'health' | 'work' | 'fun'
export type Priority = 'high' | 'medium' | 'low'
export type RepeatType = 'one-time' | 'daily' | 'weekdays' | 'custom'
export type CompletionStatus = 'completed' | 'partial' | 'skipped'
export type Theme = 'dark' | 'light'

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  notes: string | null
  category: Category
  priority: Priority
  subtasks: Subtask[]
  timeStart: string | null   // "HH:MM" 24h — when to start / get notified
  timeEnd: string | null     // "HH:MM" 24h — deadline notification
  repeat: {
    type: RepeatType
    days?: number[]          // 0=Sun … 6=Sat
  }
  createdAt: string          // ISO
  isActive: boolean
}

export interface DayTask {
  taskId: string
  status: CompletionStatus | null   // null = not yet acted on
  honestCheck: boolean
  completedAt: string | null
  subtaskCompletions: Record<string, boolean>  // subtaskId → done
}

export interface DayRecord {
  date: string               // "YYYY-MM-DD"
  tasks: DayTask[]
  perfectDay: boolean
}

export interface PinnedDate {
  id: string
  label: string
  date: string               // "YYYY-MM-DD"
}

export interface UserProfile {
  name: string
  theme: Theme
  notifications: {
    enabled: boolean
    time: string             // "HH:MM"
  }
  honestCheckEnabled: boolean
  startOfWeek: 'monday' | 'sunday'
  soundEnabled: boolean
  onboardingComplete: boolean
  createdAt: string
}

export interface UserStats {
  totalCompleted: number
  totalPartial: number
  totalHonestNotYet: number
  bestStreak: number
  currentStreak: number
  totalDaysTracked: number
  perfectDays: number
  honestDays: number
}
