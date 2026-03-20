'use client'

import { Task, DayTask } from '@/types'
import { formatTime } from '@/utils/dates'
import Link from 'next/link'

interface Props {
  task: Task
  dayTask: DayTask
  onCheckboxTap: () => void
  isPerfectDay?: boolean
}

const catColor = {
  health: 'var(--red)',
  work:   'var(--blue)',
  fun:    'var(--green)',
}

export default function TaskCard({ task, dayTask, onCheckboxTap, isPerfectDay }: Props) {
  const done = dayTask.status === 'completed'
  const partial = dayTask.status === 'partial'
  const acted = done || partial

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        background: isPerfectDay && done
          ? 'rgba(48,209,88,0.06)'
          : done
          ? 'rgba(255,255,255,0.02)'
          : 'var(--card)',
        borderRadius: 16,
        border: '1px solid var(--border)',
        marginBottom: 10,
        transition: 'background 0.3s',
      }}
    >
      {/* Category dot */}
      <div style={{
        width: 4, height: 40, borderRadius: 2,
        background: catColor[task.category],
        flexShrink: 0,
      }} />

      {/* Checkbox */}
      <button
        className="btn-press"
        onClick={onCheckboxTap}
        style={{
          width: 26, height: 26, borderRadius: 13, flexShrink: 0,
          border: `2px solid ${acted ? catColor[task.category] : 'var(--border)'}`,
          background: acted ? catColor[task.category] : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {done && <span style={{ color: '#000', fontSize: 13, fontWeight: 800 }}>✓</span>}
        {partial && <span style={{ color: '#000', fontSize: 11, fontWeight: 800 }}>~</span>}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 16, fontWeight: 600,
          color: acted ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: done ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {task.title}
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
          {task.timeStart && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              {formatTime(task.timeStart)}
              {task.timeEnd ? ` → ${formatTime(task.timeEnd)}` : ''}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} steps
            </span>
          )}
          {task.priority === 'high' && (
            <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>●</span>
          )}
        </div>
      </div>

      {/* Edit chevron */}
      <Link
        href={`/task/${task.id}`}
        style={{ color: 'var(--text-muted)', fontSize: 18, textDecoration: 'none', flexShrink: 0 }}
      >
        ›
      </Link>
    </div>
  )
}
