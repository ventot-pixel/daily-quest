'use client'

import { useState } from 'react'
import { Task } from '@/types'
import { pick, honestCheckPrompts, onCompletion, onPartial, onNotYet } from '@/constants/messages'
import { useQuestStore } from '@/store/questStore'

interface Props {
  task: Task
  onClose: () => void
  isPerfectDay?: boolean
}

type Phase = 'ask' | 'result'

export default function HonestCheckModal({ task, onClose, isPerfectDay }: Props) {
  const completeTask = useQuestStore(s => s.completeTask)
  const notYetTask = useQuestStore(s => s.notYetTask)

  const [phase, setPhase] = useState<Phase>('ask')
  const [resultMsg, setResultMsg] = useState('')
  const [resultEmoji, setResultEmoji] = useState('')

  const prompt = pick(honestCheckPrompts)

  function handleYes() {
    completeTask(task.id, 'completed')
    const msg = isPerfectDay
      ? pick(onCompletion.perfectDay)
      : pick(onCompletion.default)
    setResultMsg(msg)
    setResultEmoji('✓')
    setPhase('result')
    setTimeout(onClose, 1800)
  }

  function handlePartial() {
    completeTask(task.id, 'partial')
    setResultMsg(pick(onPartial))
    setResultEmoji('~')
    setPhase('result')
    setTimeout(onClose, 1800)
  }

  function handleNotYet() {
    notYetTask(task.id)
    setResultMsg(pick(onNotYet))
    setResultEmoji('♡')
    setPhase('result')
    setTimeout(onClose, 1800)
  }

  const categoryColor = task.category === 'health'
    ? 'var(--red)'
    : task.category === 'work'
    ? 'var(--blue)'
    : 'var(--green)'

  return (
    <div
      className="animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end',
        padding: '0 16px 32px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          background: 'var(--card)',
          borderRadius: 24,
          padding: '28px 24px',
          border: '1px solid var(--border)',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {phase === 'ask' ? (
          <>
            {/* Sparkle + prompt */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
              <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 8 }}>
                {prompt}
              </p>
              <p style={{
                fontSize: 18, fontWeight: 700, color: 'var(--text-primary)',
                borderLeft: `3px solid ${categoryColor}`,
                paddingLeft: 12, textAlign: 'left',
              }}>
                {task.title}
              </p>
            </div>

            {/* Yes */}
            <button
              className="btn-press"
              onClick={handleYes}
              style={{
                width: '100%', padding: '16px', borderRadius: 14,
                background: 'var(--green)', color: '#000',
                fontSize: 16, fontWeight: 700, border: 'none', marginBottom: 10,
              }}
            >
              Yes, I did it
            </button>

            {/* Partly done */}
            <button
              className="btn-press"
              onClick={handlePartial}
              style={{
                width: '100%', padding: '16px', borderRadius: 14,
                background: 'var(--card-elevated)', color: 'var(--text-secondary)',
                fontSize: 16, fontWeight: 600, border: '1px solid var(--border)',
                marginBottom: 10,
              }}
            >
              Partly done
            </button>

            {/* Not yet */}
            <button
              className="btn-press"
              onClick={handleNotYet}
              style={{
                width: '100%', padding: '14px',
                background: 'none', border: 'none',
                color: 'var(--text-muted)', fontSize: 15, fontWeight: 500,
              }}
            >
              Not yet
            </button>
          </>
        ) : (
          <div className="animate-bounce-in" style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{resultEmoji}</div>
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{resultMsg}</p>
          </div>
        )}
      </div>
    </div>
  )
}
