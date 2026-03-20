'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuestStore } from '@/store/questStore'
import { getTasksForDate } from '@/utils/tasks'
import { todayKey } from '@/utils/dates'
import TaskCard from '@/components/TaskCard'
import HonestCheckModal from '@/components/HonestCheckModal'
import ThemeProvider from '@/components/ThemeProvider'
import TabBar from '@/components/TabBar'
import { Task } from '@/types'

export default function DayPage() {
  const params = useParams()
  const router = useRouter()
  const dateKey = params.date as string

  const tasks = useQuestStore(s => s.tasks)
  const history = useQuestStore(s => s.history)
  const profile = useQuestStore(s => s.profile)
  const ensureTodayRecord = useQuestStore(s => s.ensureTodayRecord)
  const resetTaskStatus = useQuestStore(s => s.resetTaskStatus)
  const toggleSubtask = useQuestStore(s => s.toggleSubtask)

  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const today = todayKey()
  const isToday = dateKey === today
  const isPast = dateKey < today
  const isFuture = dateKey > today

  useEffect(() => {
    if (isToday) ensureTodayRecord()
  }, [isToday, ensureTodayRecord])

  const dayTasks = getTasksForDate(tasks, dateKey)
  const record = history[dateKey]
  const honestCheckEnabled = profile?.honestCheckEnabled ?? true

  const completed = record?.tasks.filter(t => t.status === 'completed').length ?? 0
  const total = dayTasks.length
  const isPerfectDay = record?.perfectDay ?? false

  const dateLabel = new Date(dateKey + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  function handleCheckboxTap(task: Task) {
    if (!isToday) return
    const dayTask = record?.tasks.find(t => t.taskId === task.id)
    if (dayTask?.status) {
      resetTaskStatus(task.id)
      return
    }
    if (honestCheckEnabled) {
      setActiveTask(task)
    } else {
      useQuestStore.getState().completeTask(task.id, 'completed')
    }
  }

  return (
    <ThemeProvider>
      <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 90 }}>

        {/* Header */}
        <div style={{ padding: '56px 20px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="btn-press"
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 17, cursor: 'pointer', padding: '4px 0' }}
          >
            ‹ Back
          </button>
        </div>

        <div style={{ padding: '4px 20px 24px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4 }}>
            {dateLabel}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {isFuture
              ? `${total} quest${total !== 1 ? 's' : ''} scheduled`
              : isPast
              ? `${completed} of ${total} completed`
              : 'Today'}
          </p>
        </div>

        {/* Task list */}
        <div style={{ padding: '0 20px 160px' }}>
          {dayTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No quests</p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                {isFuture ? 'Nothing scheduled yet' : 'Nothing was scheduled this day'}
              </p>
            </div>
          ) : (
            dayTasks.map(task => {
              const dayTask = record?.tasks.find(t => t.taskId === task.id) ?? {
                taskId: task.id, status: null, honestCheck: false, completedAt: null, subtaskCompletions: {},
              }
              return (
                <div key={task.id}>
                  <TaskCard
                    task={task}
                    dayTask={dayTask}
                    onCheckboxTap={() => handleCheckboxTap(task)}
                    onSubtaskToggle={isToday ? (subtaskId) => toggleSubtask(task.id, subtaskId) : undefined}
                    isPerfectDay={isPerfectDay}
                  />
                  {/* Notes inline below card */}
                  {task.notes && (
                    <div style={{
                      margin: '-6px 0 12px 0',
                      padding: '10px 16px 12px',
                      background: 'var(--card)',
                      borderRadius: '0 0 14px 14px',
                      border: '1px solid var(--border)',
                      borderTop: 'none',
                    }}>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{task.notes}</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* FAB — add task (today and future) */}
        {!isPast && (
          <button
            className="btn-press animate-pulse-fab"
            onClick={() => router.push('/task/new')}
            style={{
              position: 'fixed', bottom: 116, right: 20,
              width: 52, height: 52, borderRadius: 26,
              background: 'var(--green)', border: 'none',
              fontSize: 26, color: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(48,209,88,0.4)',
              zIndex: 40,
            }}
          >
            +
          </button>
        )}

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
