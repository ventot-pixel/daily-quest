'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuestStore } from '@/store/questStore'
import { Theme } from '@/types'

export default function Onboarding() {
  const router = useRouter()
  const setProfile = useQuestStore(s => s.setProfile)

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [theme, setTheme] = useState<Theme>('dark')

  const steps = [
    <StepWelcome key="welcome" onNext={() => setStep(1)} />,
    <StepName key="name" name={name} onChange={setName} onNext={() => name.trim() && setStep(2)} />,
    <StepTheme key="theme" theme={theme} onChange={setTheme} onNext={() => setStep(3)} />,
    <StepReady
      key="ready"
      name={name.trim()}
      onStart={() => {
        setProfile({
          name: name.trim(),
          theme,
          notifications: { enabled: false, time: '08:00' },
          honestCheckEnabled: true,
          startOfWeek: 'monday',
          soundEnabled: true,
          onboardingComplete: true,
          createdAt: new Date().toISOString(),
        })
        // Apply theme immediately
        document.documentElement.setAttribute('data-theme', theme)
        router.replace('/today')
      }}
    />,
  ]

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: 'var(--bg)' }}
      data-theme={theme}
    >
      {/* Step dots */}
      {step < 3 && (
        <div className="flex justify-center gap-2 pt-14 pb-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: i === step ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === step ? 'var(--purple)' : 'var(--border)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {steps[step]}
      </div>
    </div>
  )
}

// ── Step 1: Welcome ────────────────────────────────────────
function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="animate-slide-up text-center w-full max-w-sm">
      <div style={{ fontSize: 64, marginBottom: 24 }}>✦</div>
      <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)', marginBottom: 12 }}>
        Daily Quest
      </h1>
      <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 48, lineHeight: 1.5 }}>
        A daily checklist that rewards you for being honest about what you actually did.
      </p>
      <button
        className="btn-press"
        onClick={onNext}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 16,
          background: 'var(--purple)',
          color: '#fff',
          fontSize: 17,
          fontWeight: 600,
          border: 'none',
        }}
      >
        Get Started
      </button>
    </div>
  )
}

// ── Step 2: Name ────────────────────────────────────────────
function StepName({ name, onChange, onNext }: { name: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div className="animate-slide-up w-full max-w-sm">
      <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        What should we call you?
      </h2>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>
        We'll use this to greet you each day.
      </p>
      <input
        autoFocus
        type="text"
        value={name}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onNext()}
        placeholder="Your name or nickname"
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 14,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontSize: 17,
          marginBottom: 24,
          outline: 'none',
        }}
      />
      <button
        className="btn-press"
        onClick={onNext}
        disabled={!name.trim()}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 16,
          background: name.trim() ? 'var(--purple)' : 'var(--card)',
          color: name.trim() ? '#fff' : 'var(--text-muted)',
          fontSize: 17,
          fontWeight: 600,
          border: 'none',
          transition: 'all 0.2s',
        }}
      >
        Continue
      </button>
    </div>
  )
}

// ── Step 3: Theme ────────────────────────────────────────────
function StepTheme({ theme, onChange, onNext }: { theme: Theme; onChange: (v: Theme) => void; onNext: () => void }) {
  return (
    <div className="animate-slide-up w-full max-w-sm">
      <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Pick your vibe
      </h2>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>
        You can always change this later.
      </p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {(['dark', 'light'] as Theme[]).map(t => (
          <button
            key={t}
            className="btn-press"
            onClick={() => onChange(t)}
            style={{
              flex: 1,
              padding: '24px 16px',
              borderRadius: 20,
              background: t === 'dark' ? '#1C1C1E' : '#FFFFFF',
              border: `2px solid ${theme === t ? 'var(--purple)' : 'var(--border)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
          >
            <span style={{ fontSize: 32 }}>{t === 'dark' ? '🌙' : '☀️'}</span>
            <span style={{
              fontSize: 15,
              fontWeight: 600,
              color: t === 'dark' ? '#F5F5F7' : '#000',
              textTransform: 'capitalize',
            }}>
              {t}
            </span>
          </button>
        ))}
      </div>
      <button
        className="btn-press"
        onClick={onNext}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 16,
          background: 'var(--purple)',
          color: '#fff',
          fontSize: 17,
          fontWeight: 600,
          border: 'none',
        }}
      >
        Continue
      </button>
    </div>
  )
}

// ── Step 4: Ready ─────────────────────────────────────────────
function StepReady({ name, onStart }: { name: string; onStart: () => void }) {
  const previews = ['Morning routine', 'Review priorities', 'Stay hydrated']
  return (
    <div className="animate-slide-up text-center w-full max-w-sm">
      <div style={{ fontSize: 56, marginBottom: 20 }}>🎯</div>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        You're all set, {name}!
      </h2>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>
        Here's a preview of your starter quests.
      </p>
      <div className="card" style={{ padding: '4px 0', marginBottom: 32, textAlign: 'left' }}>
        {previews.map((task, i) => (
          <div
            key={task}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderBottom: i < previews.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 11,
              border: '2px solid var(--border)',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 15, color: 'var(--text-primary)' }}>{task}</span>
          </div>
        ))}
      </div>
      <button
        className="btn-press"
        onClick={onStart}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 16,
          background: 'var(--green)',
          color: '#000',
          fontSize: 17,
          fontWeight: 700,
          border: 'none',
        }}
      >
        Start My Journey
      </button>
    </div>
  )
}
