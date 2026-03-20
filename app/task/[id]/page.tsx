'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuestStore } from '@/store/questStore'
import { Task, Category, Priority, RepeatType } from '@/types'
import { generateId } from '@/utils/tasks'
import ThemeProvider from '@/components/ThemeProvider'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function TaskFormPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isNew = id === 'new'

  const tasks = useQuestStore(s => s.tasks)
  const addTask = useQuestStore(s => s.addTask)
  const updateTask = useQuestStore(s => s.updateTask)
  const deleteTask = useQuestStore(s => s.deleteTask)

  const existing = tasks.find(t => t.id === id)

  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState<Category>('health')
  const [priority, setPriority] = useState<Priority>('medium')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [repeatType, setRepeatType] = useState<RepeatType>('daily')
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([])
  const [newSubtask, setNewSubtask] = useState('')
  const [saved, setSaved] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const doneMsgs = ['Done.', 'Done, really?', 'Done? Great!', 'Quest saved.', 'Got it.']

  useEffect(() => {
    if (existing) {
      setTitle(existing.title)
      setNotes(existing.notes ?? '')
      setCategory(existing.category)
      setPriority(existing.priority)
      setTimeStart(existing.timeStart ?? '')
      setTimeEnd(existing.timeEnd ?? '')
      setRepeatType(existing.repeat.type)
      setCustomDays(existing.repeat.days ?? [1, 2, 3, 4, 5])
      setSubtasks(existing.subtasks)
    }
  }, [existing])

  function toggleCustomDay(d: number) {
    setCustomDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  function addSubtask() {
    if (!newSubtask.trim()) return
    setSubtasks(prev => [...prev, { id: generateId(), title: newSubtask.trim(), completed: false }])
    setNewSubtask('')
  }

  function toggleSubtask(id: string) {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s))
  }

  function removeSubtask(id: string) {
    setSubtasks(prev => prev.filter(s => s.id !== id))
  }

  function handleSave() {
    if (!title.trim()) return
    const data: Omit<Task, 'id' | 'createdAt'> = {
      title: title.trim(),
      notes: notes.trim() || null,
      category,
      priority,
      subtasks,
      timeStart: timeStart || null,
      timeEnd: timeEnd || null,
      repeat: {
        type: repeatType,
        days: repeatType === 'custom' ? customDays : undefined,
      },
      isActive: true,
    }
    if (isNew) {
      addTask(data)
    } else if (existing) {
      updateTask(existing.id, data)
    }
    const msg = doneMsgs[Math.floor(Math.random() * doneMsgs.length)]
    setSaveMsg(msg)
    setSaved(true)
    setTimeout(() => router.back(), 1000)
  }

  function handleDelete() {
    if (existing) {
      deleteTask(existing.id)
      router.replace('/today')
    }
  }

  function handleDeleteClick() {
    if (confirmDelete) {
      handleDelete()
    } else {
      setConfirmDelete(true)
    }
  }

  const catOptions: { value: Category; label: string; color: string }[] = [
    { value: 'health', label: 'Health', color: 'var(--red)' },
    { value: 'work',   label: 'Work',   color: 'var(--blue)' },
    { value: 'fun',    label: 'Fun',    color: 'var(--green)' },
  ]

  const prioOptions: { value: Priority; label: string }[] = [
    { value: 'high',   label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low',    label: 'Low' },
  ]

  const repeatOptions: { value: RepeatType; label: string }[] = [
    { value: 'one-time',  label: 'Once' },
    { value: 'daily',     label: 'Daily' },
    { value: 'weekdays',  label: 'Weekdays' },
    { value: 'custom',    label: 'Custom' },
  ]

  return (
    <ThemeProvider>
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

        {/* Done confirmation overlay */}
        {saved && (
          <div className="animate-fade-in" style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          }}>
            <div className="animate-bounce-in" style={{
              background: 'var(--card)', borderRadius: 24, padding: '32px 40px',
              textAlign: 'center', border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{saveMsg}</p>
            </div>
          </div>
        )}

        {/* Header — Cancel only, no Save */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '56px 20px 16px' }}>
          <button
            className="btn-press"
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 17, fontWeight: 500 }}
          >
            Cancel
          </button>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
            {isNew ? 'New Quest' : 'Edit Quest'}
          </h1>
          <div style={{ width: 60 }} />
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Title */}
          <Section label="Title">
            <input
              autoFocus={isNew}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What's the quest?"
              style={inputStyle}
            />
          </Section>

          {/* Category */}
          <Section label="Category">
            <div style={{ display: 'flex', gap: 8 }}>
              {catOptions.map(opt => (
                <button
                  key={opt.value}
                  className="btn-press"
                  onClick={() => setCategory(opt.value)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 12,
                    background: category === opt.value ? opt.color : 'var(--card)',
                    color: category === opt.value ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${category === opt.value ? opt.color : 'var(--border)'}`,
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Priority */}
          <Section label="Priority">
            <div style={{ display: 'flex', gap: 8 }}>
              {prioOptions.map(opt => (
                <button
                  key={opt.value}
                  className="btn-press"
                  onClick={() => setPriority(opt.value)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 12,
                    background: priority === opt.value ? 'var(--card-elevated)' : 'var(--card)',
                    color: priority === opt.value ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: `1px solid ${priority === opt.value ? 'var(--purple)' : 'var(--border)'}`,
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Time */}
          <Section label="Time (optional)">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Start</p>
                <input
                  type="time"
                  value={timeStart}
                  onChange={e => setTimeStart(e.target.value)}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                />
              </div>
              <div style={{ paddingTop: 20, color: 'var(--text-muted)', fontSize: 18 }}>→</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>End</p>
                <input
                  type="time"
                  value={timeEnd}
                  onChange={e => setTimeEnd(e.target.value)}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                />
              </div>
            </div>
            {timeEnd && timeStart && timeEnd <= timeStart && (
              <p style={{ fontSize: 12, color: 'var(--orange)', marginTop: 6 }}>End time should be after start time.</p>
            )}
          </Section>

          {/* Repeat */}
          <Section label="Repeat">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {repeatOptions.map(opt => (
                <button
                  key={opt.value}
                  className="btn-press"
                  onClick={() => setRepeatType(opt.value)}
                  style={{
                    flex: 1, minWidth: 72, padding: '10px 0', borderRadius: 12,
                    background: repeatType === opt.value ? 'var(--purple)' : 'var(--card)',
                    color: repeatType === opt.value ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${repeatType === opt.value ? 'var(--purple)' : 'var(--border)'}`,
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {repeatType === 'custom' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {DAYS.map((d, i) => (
                  <button
                    key={i}
                    className="btn-press"
                    onClick={() => toggleCustomDay(i)}
                    style={{
                      flex: 1, aspectRatio: '1', borderRadius: '50%',
                      background: customDays.includes(i) ? 'var(--purple)' : 'var(--card)',
                      color: customDays.includes(i) ? '#fff' : 'var(--text-muted)',
                      border: `1px solid ${customDays.includes(i) ? 'var(--purple)' : 'var(--border)'}`,
                      fontSize: 13, fontWeight: 700,
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </Section>

          {/* Sub Quests */}
          <Section label="Sub Quests (optional)">
            {subtasks.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, padding: '10px 14px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                {/* Checkbox */}
                <button
                  className="btn-press"
                  onClick={() => toggleSubtask(s.id)}
                  style={{
                    width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                    border: `2px solid ${s.completed ? 'var(--green)' : 'var(--border)'}`,
                    background: s.completed ? 'var(--green)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {s.completed && <span style={{ color: '#000', fontSize: 12, fontWeight: 800 }}>✓</span>}
                </button>
                {/* Title */}
                <span style={{
                  fontSize: 15, flex: 1,
                  color: s.completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                  textDecoration: s.completed ? 'line-through' : 'none',
                }}>
                  {s.title}
                </span>
                {/* Remove — small, unobtrusive */}
                <button
                  className="btn-press"
                  onClick={() => removeSubtask(s.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, lineHeight: 1, padding: '0 4px' }}
                >
                  −
                </button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubtask()}
                placeholder="Add a sub quest..."
                style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
              />
              <button
                className="btn-press"
                onClick={addSubtask}
                style={{
                  padding: '0 16px', borderRadius: 12,
                  background: 'var(--card)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: 20,
                }}
              >
                +
              </button>
            </div>
          </Section>

          {/* Notes */}
          <Section label="Notes (optional)">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any details..."
              rows={3}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
            />
          </Section>

          {/* Done button */}
          <button
            className="btn-press"
            onClick={handleSave}
            disabled={!title.trim()}
            style={{
              width: '100%', padding: '18px', borderRadius: 18,
              background: title.trim() ? 'var(--green)' : 'var(--card)',
              color: title.trim() ? '#000' : 'var(--text-muted)',
              fontSize: 17, fontWeight: 700, border: 'none',
              marginTop: 8,
              boxShadow: title.trim() ? '0 4px 20px rgba(48,209,88,0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Done
          </button>

          {/* Delete */}
          {!isNew && !confirmDelete && (
            <button
              className="btn-press"
              onClick={() => setConfirmDelete(true)}
              style={{
                width: '100%', padding: '16px', borderRadius: 16,
                background: 'rgba(255,55,95,0.08)', border: '1px solid rgba(255,55,95,0.2)',
                color: 'var(--red)', fontSize: 15, fontWeight: 600,
              }}
            >
              Delete Quest
            </button>
          )}

          {!isNew && confirmDelete && (
            <div className="animate-slide-up card" style={{ padding: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Delete this quest?
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                This removes it from today and all future days. Your history is kept.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-press"
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 14,
                    background: 'var(--card-elevated)', border: 'none',
                    color: 'var(--text-secondary)', fontWeight: 600, fontSize: 15,
                  }}
                >
                  Keep it
                </button>
                <button
                  className="btn-press"
                  onClick={handleDelete}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 14,
                    background: 'var(--red)', border: 'none',
                    color: '#fff', fontWeight: 700, fontSize: 15,
                  }}
                >
                  Yes, delete
                </button>
              </div>
            </div>
          )}

          <div style={{ height: 48 }} />
        </div>
      </div>
    </ThemeProvider>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 10 }}>
        {label}
      </p>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 14,
  background: 'var(--card)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontSize: 16,
  outline: 'none',
  marginBottom: 0,
}
