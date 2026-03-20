'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task, DayRecord, DayTask, UserProfile, UserStats, PinnedDate } from '@/types'
import { seedTasks } from '@/constants/seedData'
import { todayKey } from '@/utils/dates'
import { getTasksForDate, generateId } from '@/utils/tasks'
import { calculateCurrentStreak, calculateBestStreak } from '@/utils/streaks'

interface QuestStore {
  // Data
  profile: UserProfile | null
  tasks: Task[]
  history: Record<string, DayRecord>  // keyed by "YYYY-MM-DD"
  pinnedDates: PinnedDate[]

  // Derived / cached stats
  stats: UserStats

  // Profile actions
  setProfile: (profile: UserProfile) => void
  updateProfile: (partial: Partial<UserProfile>) => void

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, partial: Partial<Task>) => void
  deleteTask: (id: string) => void

  // Day actions
  ensureTodayRecord: () => void
  completeTask: (taskId: string, status: 'completed' | 'partial') => void
  notYetTask: (taskId: string) => void
  resetTaskStatus: (taskId: string) => void

  // Pinned dates
  addPinnedDate: (label: string, date: string) => void
  removePinnedDate: (id: string) => void

  // Misc
  resetAllData: () => void
  recalcStats: () => void
}

const defaultProfile: UserProfile = {
  name: '',
  theme: 'dark',
  notifications: { enabled: false, time: '08:00' },
  honestCheckEnabled: true,
  startOfWeek: 'monday',
  soundEnabled: true,
  onboardingComplete: false,
  createdAt: new Date().toISOString(),
}

const defaultStats: UserStats = {
  totalCompleted: 0,
  totalPartial: 0,
  totalHonestNotYet: 0,
  bestStreak: 0,
  currentStreak: 0,
  totalDaysTracked: 0,
  perfectDays: 0,
  honestDays: 0,
}

export const useQuestStore = create<QuestStore>()(
  persist(
    (set, get) => ({
      profile: null,
      tasks: [],
      history: {},
      pinnedDates: [],
      stats: defaultStats,

      setProfile: (profile) => {
        set({ profile })
        // Seed tasks on first setup
        if (get().tasks.length === 0) {
          set({ tasks: seedTasks })
        }
        get().ensureTodayRecord()
      },

      updateProfile: (partial) => {
        const current = get().profile
        if (!current) return
        set({ profile: { ...current, ...partial } })
      },

      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set(s => ({ tasks: [...s.tasks, task] }))
        get().ensureTodayRecord()
      },

      updateTask: (id, partial) => {
        set(s => ({
          tasks: s.tasks.map(t => t.id === id ? { ...t, ...partial } : t),
        }))
      },

      deleteTask: (id) => {
        set(s => ({
          tasks: s.tasks.map(t => t.id === id ? { ...t, isActive: false } : t),
        }))
      },

      ensureTodayRecord: () => {
        const { tasks, history } = get()
        const today = todayKey()
        if (history[today]) return

        const todayTasks = getTasksForDate(tasks, today)
        const dayTasks: DayTask[] = todayTasks.map(t => ({
          taskId: t.id,
          status: null,
          honestCheck: false,
          completedAt: null,
        }))

        set(s => ({
          history: {
            ...s.history,
            [today]: { date: today, tasks: dayTasks, perfectDay: false },
          },
        }))
      },

      completeTask: (taskId, status) => {
        const today = todayKey()
        set(s => {
          const record = s.history[today]
          if (!record) return s

          const updatedTasks = record.tasks.map(t =>
            t.taskId === taskId
              ? { ...t, status, honestCheck: true, completedAt: new Date().toISOString() }
              : t
          )

          const allDone = updatedTasks.every(t => t.status === 'completed')

          const updatedRecord: DayRecord = {
            ...record,
            tasks: updatedTasks,
            perfectDay: allDone,
          }

          return {
            history: { ...s.history, [today]: updatedRecord },
          }
        })
        get().recalcStats()
      },

      notYetTask: (taskId) => {
        const today = todayKey()
        set(s => {
          const record = s.history[today]
          if (!record) return s
          const updatedTasks = record.tasks.map(t =>
            t.taskId === taskId
              ? { ...t, status: null, honestCheck: true }
              : t
          )
          return { history: { ...s.history, [today]: { ...record, tasks: updatedTasks } } }
        })
        get().recalcStats()
      },

      resetTaskStatus: (taskId) => {
        const today = todayKey()
        set(s => {
          const record = s.history[today]
          if (!record) return s
          const updatedTasks = record.tasks.map(t =>
            t.taskId === taskId
              ? { ...t, status: null, honestCheck: false, completedAt: null }
              : t
          )
          return { history: { ...s.history, [today]: { ...record, tasks: updatedTasks, perfectDay: false } } }
        })
        get().recalcStats()
      },

      addPinnedDate: (label, date) => {
        const pinned: PinnedDate = { id: generateId(), label, date }
        set(s => ({ pinnedDates: [...s.pinnedDates, pinned] }))
      },

      removePinnedDate: (id) => {
        set(s => ({ pinnedDates: s.pinnedDates.filter(p => p.id !== id) }))
      },

      recalcStats: () => {
        const { history } = get()
        let totalCompleted = 0
        let totalPartial = 0
        let totalHonestNotYet = 0
        let perfectDays = 0
        let honestDays = 0
        let totalDaysTracked = 0

        for (const record of Object.values(history)) {
          if (record.tasks.length === 0) continue
          totalDaysTracked++
          if (record.perfectDay) perfectDays++

          const hadHonest = record.tasks.some(t => t.honestCheck)
          if (hadHonest) honestDays++

          for (const t of record.tasks) {
            if (t.status === 'completed') totalCompleted++
            if (t.status === 'partial') totalPartial++
            if (t.honestCheck && t.status === null) totalHonestNotYet++
          }
        }

        const currentStreak = calculateCurrentStreak(history)
        const bestStreak = Math.max(
          calculateBestStreak(history),
          get().stats.bestStreak
        )

        set({
          stats: {
            totalCompleted,
            totalPartial,
            totalHonestNotYet,
            bestStreak,
            currentStreak,
            totalDaysTracked,
            perfectDays,
            honestDays,
          },
        })
      },

      resetAllData: () => {
        set({
          profile: null,
          tasks: [],
          history: {},
          pinnedDates: [],
          stats: defaultStats,
        })
      },
    }),
    {
      name: 'daily-quest-store',
    }
  )
)
