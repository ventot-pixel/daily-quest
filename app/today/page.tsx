'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuestStore } from '@/store/questStore'
import { getTasksForDate } from '@/utils/tasks'
import { todayKey, getGreeting } from '@/utils/dates'
import ProgressRing from '@/components/ProgressRing'
import TaskCard from '@/components/TaskCard'
import HonestCheckModal from '@/components/HonestCheckModal'
import TabBar from '@/components/TabBar'
import ThemeProvider from '@/components/ThemeProvider'
import { Task } from '@/types'

export default function TodayPage() {
  const router = useRouter()
  const profile = useQuestStore(s => s.profile)
  const tasks = useQuestStore(s => s.tasks)
  const history = useQuestStore(s => s.history)
  const stats = useQuestStore(s => s.stats)
  const ensureTodayRecord = useQuestStore(s => s.ensureTodayRecord)
  const resetTaskStatus = useQuestStore(s => s.resetTaskStatus)

  const [activeTask, setActiveTask] = useState<Task | null>(null)

  useEffect(() => {
    if (!profile?.onboardingComplete) { router.replace('/onboarding'); return }
    ensureTodayRecord()
  }, [profile, router, ensureTodayRecord])

  const today = todayKey()
  const todayRecord = history[today]
  const todayTasks = getTasksForDate(tasks, today)

  const completed = todayRecord?.tasks.filter(t => t.status === 'completed').length ?? 0
  const partial   = todayRecord?.tasks.filter(t => t.status === 'partial').length ?? 0
  const total     = todayTasks.length
  const progress  = total > 0 ? (completed + partial * 0.5) / total : 0
  const isPerfectDay = todayRecord?.perfectDay ?? false

  const honestCheckEnabled = profile?.honestCheckEnabled ?? true

  function handleCheckboxTap(task: Task) {
    const dayTask = todayRecord?.tasks.find(t => t.taskId === task.id)
    // If already acted on, reset it
    if (dayTask?.status) {
      resetTaskStatus(task.id)
      return
    }
    if (honestCheckEnabled) {
      setActiveTask(task)
    } else {
      // Direct complete without modal
      useQuestStore.getState().completeTask(task.id, 'completed')
    }
  }

  if (!profile) return null

  return (
    <ThemeProvider>
      <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 90 }}>
        {/* Header */}
        <div style={{ padding: '56px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 4 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                {getGreeting(profile.name)}
              </h1>
            </div>
            {stats.currentStreak > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(255,159,10,0.15)',
                borderRadius: 20, padding: '6px 12px',
                border: '1px solid rgba(255,159,10,0.3)',
              }}>
                <span style={{ fontSize: 16 }}>🔥</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--orange)' }}>
                  {stats.currentStreak}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress ring + stats */}
        <div style={{ padding: '0 20px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <ProgressRing size={100} strokeWidth={9} progress={progress} color="var(--green)">
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
              {Math.round(progress * 100)}%
            </span>
          </ProgressRing>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {completed} of {total} quests
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              {isPerfectDay ? '✦ Perfect day!' : total - completed > 0 ? `${total - completed} remaining` : 'All done today'}
            </p>
            {/* Mini stat pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <StatPill label="Best" value={`${stats.bestStreak}d`} color="var(--orange)" />
              <StatPill label="Honest" value={`${stats.honestDays}d`} color="var(--blue)" />
              <StatPill label="Perfect" value={`${stats.perfectDays}d`} color="var(--purple)" />
            </div>
          </div>
        </div>

        {/* Week strip */}
        <WeekStrip history={history} />

        {/* Task list */}
        <div style={{ padding: '8px 20px 160px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 14 }}>
            Today's Quests
          </p>

          {total === 0 ? (
            <EmptyState />
          ) : (
            todayTasks.map(task => {
              const dayTask = todayRecord?.tasks.find(t => t.taskId === task.id) ?? {
                taskId: task.id, status: null, honestCheck: false, completedAt: null,
              }
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  dayTask={dayTask}
                  onCheckboxTap={() => handleCheckboxTap(task)}
                  isPerfectDay={isPerfectDay}
                />
              )
            })
          )}
        </div>

        {/* FAB — raised clear of tab bar, left side to avoid last task */}
        <button
          className="btn-press animate-pulse-fab"
          onClick={() => router.push('/task/new')}
          style={{
            position: 'fixed', bottom: 116, right: 20,
            width: 52, height: 52, borderRadius: 26,
            background: 'var(--green)', border: 'none',
            fontSize: 26, color: '#000', fontWeight: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(48,209,88,0.4)',
            zIndex: 40,
          }}
        >
          +
        </button>

        {/* Honest Check Modal */}
        {activeTask && (
          <HonestCheckModal
            task={activeTask}
            isPerfectDay={completed + 1 === total}
            onClose={() => setActiveTask(null)}
          />
        )}

        <TabBar />
      </div>
    </ThemeProvider>
  )
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: 'var(--card)', borderRadius: 8, padding: '4px 10px',
      border: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
    </div>
  )
}

function WeekStrip({ history }: { history: Record<string, any> }) {
  const today = todayKey()
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push(key)
  }
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div style={{ padding: '0 20px 20px', display: 'flex', gap: 6 }}>
      {days.map((key, i) => {
        const rec = history[key]
        const isToday = key === today
        const hasTasks = rec && rec.tasks.length > 0
        const allDone = rec?.perfectDay
        const someDone = hasTasks && rec.tasks.some((t: any) => t.status === 'completed' || t.status === 'partial')
        const dotColor = allDone ? 'var(--green)' : someDone ? 'var(--orange)' : 'var(--border)'
        const dow = new Date(key + 'T12:00:00').getDay()

        return (
          <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: isToday ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {labels[dow]}
            </span>
            <div style={{
              width: isToday ? 10 : 8, height: isToday ? 10 : 8,
              borderRadius: '50%',
              background: dotColor,
              border: isToday ? '2px solid var(--text-primary)' : 'none',
            }} />
          </div>
        )
      })}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <div className="animate-float" style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
      <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No quests today</p>
      <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Tap + to begin</p>
    </div>
  )
}
