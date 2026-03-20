'use client'

import { useState } from 'react'
import { Task, DayTask } from '@/types'
import { formatTime } from '@/utils/dates'
import Link from 'next/link'

interface Props {
  task: Task
  dayTask: DayTask
  onCheckboxTap: () => void
  onSubtaskToggle?: (subtaskId: string) => void
  isPerfectDay?: boolean
}

const catColor = {
  health: 'var(--red)',
  work:   'var(--blue)',
  fun:    'var(--green)',
}

export default function TaskCard({ task, dayTask, onCheckboxTap, onSubtaskToggle, isPerfectDay }: Props) {
  const done = dayTask.status === 'completed'
  const partial = dayTask.status === 'partial'
  const acted = done || partial
  const [expanded, setExpanded] = useState(false)
  const hasSubtasks = task.subtasks.length > 0
  const completions = dayTask.subtaskCompletions ?? {}
  const doneCount = Object.values(completions).filter(Boolean).length

  return (
    <div style={{ marginBottom: 10 }}>
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
          borderRadius: expanded && hasSubtasks ? '16px 16px 0 0' : 16,
          border: '1px solid var(--border)',
          borderBottom: expanded && hasSubtasks ? 'none' : '1px solid var(--border)',
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

        {/* Content — tap to expand subtasks */}
        <div
          style={{ flex: 1, minWidth: 0, cursor: hasSubtasks ? 'pointer' : 'default' }}
          onClick={() => hasSubtasks && setExpanded(e => !e)}
        >
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
            {hasSubtasks && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {doneCount}/{task.subtasks.length} sub quest{task.subtasks.length !== 1 ? 's' : ''}
              </span>
            )}
            {task.priority === 'high' && (
              <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>●</span>
            )}
          </div>
        </div>

        {/* Right side: expand chevron + edit icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {hasSubtasks && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 13,
                transition: 'transform 0.2s',
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                padding: '2px 4px',
              }}
            >
              ›
            </button>
          )}
          <Link
            href={`/task/${task.id}`}
            style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}
          >
            ✎
          </Link>
        </div>
      </div>

      {/* Subtasks expanded panel */}
      {expanded && hasSubtasks && (
        <div style={{
          background: 'var(--card)',
          borderRadius: '0 0 16px 16px',
          border: '1px solid var(--border)',
          borderTop: 'none',
          padding: '8px 16px 12px 56px',
        }}>
          {task.subtasks.map((sub, idx) => {
            const isDone = completions[sub.id] ?? false
            return (
              <button
                key={sub.id}
                className="btn-press"
                onClick={() => onSubtaskToggle?.(sub.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0',
                  borderBottom: idx < task.subtasks.length - 1 ? '1px solid var(--border)' : 'none',
                  background: 'none', border: 'none',
                  borderBottomWidth: idx < task.subtasks.length - 1 ? 1 : 0,
                  borderBottomStyle: 'solid',
                  borderBottomColor: 'var(--border)',
                  cursor: onSubtaskToggle ? 'pointer' : 'default',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 9, flexShrink: 0,
                  border: `2px solid ${isDone ? catColor[task.category] : 'var(--border)'}`,
                  background: isDone ? catColor[task.category] : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isDone && <span style={{ color: '#000', fontSize: 10, fontWeight: 800 }}>✓</span>}
                </div>
                <span style={{
                  fontSize: 14,
                  color: isDone ? 'var(--text-muted)' : 'var(--text-secondary)',
                  textDecoration: isDone ? 'line-through' : 'none',
                }}>
                  {sub.title}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
