'use client'

import { useState } from 'react'
import { useQuestStore } from '@/store/questStore'
import TabBar from '@/components/TabBar'
import ThemeProvider from '@/components/ThemeProvider'
import { getDatesInMonth, todayKey } from '@/utils/dates'

export default function CalendarPage() {
  const history = useQuestStore(s => s.history)
  const tasks = useQuestStore(s => s.tasks)
  const pinnedDates = useQuestStore(s => s.pinnedDates)
  const stats = useQuestStore(s => s.stats)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const today = todayKey()
  const dates = getDatesInMonth(year, month)
  const firstDow = new Date(`${year}-${String(month + 1).padStart(2, '0')}-01T12:00:00`).getDay()
  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function getDotColor(dateKey: string) {
    const rec = history[dateKey]
    if (!rec || rec.tasks.length === 0) return null
    if (rec.perfectDay) return 'var(--green)'
    const someDone = rec.tasks.some((t: any) => t.status === 'completed' || t.status === 'partial')
    return someDone ? 'var(--orange)' : 'var(--text-muted)'
  }

  const pinnedThisMonth = pinnedDates.filter(p => p.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
  const selectedRecord = selected ? history[selected] : null

  return (
    <ThemeProvider>
      <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 90 }}>

        {/* Header */}
        <div style={{ padding: '56px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="btn-press" onClick={prevMonth}
            style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 22 }}>‹</button>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{monthLabel}</h1>
          <button className="btn-press" onClick={nextMonth}
            style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 22 }}>›</button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, padding: '0 20px 20px' }}>
          {[
            { label: 'Perfect', value: stats.perfectDays, color: 'var(--green)' },
            { label: 'Streak', value: stats.currentStreak, color: 'var(--orange)' },
            { label: 'Best', value: stats.bestStreak, color: 'var(--purple)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ flex: 1, padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 20px', marginBottom: 8 }}>
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 20px', gap: '4px 0' }}>
          {Array(firstDow).fill(null).map((_, i) => <div key={`e-${i}`} />)}
          {dates.map(dateKey => {
            const day = parseInt(dateKey.split('-')[2])
            const isToday = dateKey === today
            const dotColor = getDotColor(dateKey)
            const hasPinned = pinnedDates.some(p => p.date === dateKey)
            const isSelected = selected === dateKey
            const isFuture = dateKey > today

            return (
              <button
                key={dateKey}
                className="btn-press"
                onClick={() => setSelected(isSelected ? null : dateKey)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer',
                  opacity: isFuture ? 0.4 : 1,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 16,
                  background: isSelected ? 'var(--purple)' : isToday ? 'var(--card-elevated)' : 'transparent',
                  border: isToday ? '2px solid var(--purple)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontSize: 15, fontWeight: isToday ? 700 : 400,
                    color: isSelected ? '#fff' : isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}>{day}</span>
                </div>
                <div style={{ display: 'flex', gap: 2, height: 6, alignItems: 'center' }}>
                  {dotColor && <div style={{ width: 5, height: 5, borderRadius: 3, background: dotColor }} />}
                  {hasPinned && <div style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--purple)' }} />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected day summary */}
        {selected && (
          <div className="animate-slide-up" style={{ margin: '16px 20px 0' }}>
            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 12 }}>
                {new Date(selected + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              {!selectedRecord || selectedRecord.tasks.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No tasks recorded.</p>
              ) : (
                selectedRecord.tasks.map((t: any) => (
                  <div key={t.taskId} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }}>
                      {t.status === 'completed' ? '✓' : t.status === 'partial' ? '~' : '○'}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                      {tasks.find(tk => tk.id === t.taskId)?.title ?? t.taskId}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pinned this month */}
        {pinnedThisMonth.length > 0 && (
          <div style={{ margin: '20px 20px 0' }}>
            <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 10 }}>
              Pinned This Month
            </p>
            {pinnedThisMonth.map(p => (
              <div key={p.id} className="card" style={{ padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, color: 'var(--text-primary)' }}>{p.label}</span>
                <span style={{ fontSize: 13, color: 'var(--purple)' }}>
                  {new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}

        <TabBar />
      </div>
    </ThemeProvider>
  )
}
