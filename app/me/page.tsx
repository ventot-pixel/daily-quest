'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuestStore } from '@/store/questStore'
import TabBar from '@/components/TabBar'
import ThemeProvider from '@/components/ThemeProvider'
import { Theme } from '@/types'

export default function MePage() {
  const router = useRouter()
  const profile = useQuestStore(s => s.profile)
  const stats = useQuestStore(s => s.stats)
  const pinnedDates = useQuestStore(s => s.pinnedDates)
  const updateProfile = useQuestStore(s => s.updateProfile)
  const addPinnedDate = useQuestStore(s => s.addPinnedDate)
  const removePinnedDate = useQuestStore(s => s.removePinnedDate)
  const resetAllData = useQuestStore(s => s.resetAllData)

  const [pinLabel, setPinLabel] = useState('')
  const [pinDate, setPinDate] = useState('')
  const [showReset, setShowReset] = useState(false)

  if (!profile) return null

  function handleThemeToggle() {
    const next: Theme = profile!.theme === 'dark' ? 'light' : 'dark'
    updateProfile({ theme: next })
    document.documentElement.setAttribute('data-theme', next)
  }

  function handleExport() {
    const data = {
      profile,
      tasks: useQuestStore.getState().tasks,
      history: useQuestStore.getState().history,
      stats,
      pinnedDates,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily-quest-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleAddPin() {
    if (!pinLabel.trim() || !pinDate) return
    addPinnedDate(pinLabel.trim(), pinDate)
    setPinLabel('')
    setPinDate('')
  }

  function handleReset() {
    resetAllData()
    router.replace('/onboarding')
  }

  const initial = profile.name.charAt(0).toUpperCase()

  return (
    <ThemeProvider>
      <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 90 }}>

        {/* Header */}
        <div style={{ padding: '56px 20px 24px' }}>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>Me</h1>
        </div>

        {/* Profile card */}
        <div className="card" style={{ margin: '0 20px 20px', padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 28, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--purple), var(--blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{initial}</span>
          </div>
          <div>
            <p style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>{profile.name}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {stats.totalCompleted} quests completed
            </p>
          </div>
        </div>

        {/* Preferences */}
        <SectionHeader>Preferences</SectionHeader>
        <div className="card" style={{ margin: '0 20px 20px', padding: '4px 0' }}>

          <ToggleRow
            label="Dark Mode"
            value={profile.theme === 'dark'}
            onChange={handleThemeToggle}
          />
          <ToggleRow
            label="Honest Check"
            value={profile.honestCheckEnabled}
            onChange={v => updateProfile({ honestCheckEnabled: v })}
          />
          <ToggleRow
            label="Sound Effects"
            value={profile.soundEnabled}
            onChange={v => updateProfile({ soundEnabled: v })}
          />

          {/* Notification row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Daily Reminder</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {profile.notifications.enabled && (
                <input
                  type="time"
                  value={profile.notifications.time}
                  onChange={e => updateProfile({ notifications: { ...profile.notifications, time: e.target.value } })}
                  style={{
                    background: 'var(--card-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', borderRadius: 8, padding: '4px 8px', fontSize: 14,
                    colorScheme: 'dark',
                  }}
                />
              )}
              <Toggle value={profile.notifications.enabled} onChange={v => updateProfile({ notifications: { ...profile.notifications, enabled: v } })} />
            </div>
          </div>
        </div>

        {/* Pinned Dates */}
        <SectionHeader>Pinned Dates</SectionHeader>
        <div style={{ margin: '0 20px 8px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              value={pinLabel}
              onChange={e => setPinLabel(e.target.value)}
              placeholder="Label (e.g. Birthday)"
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 12,
                background: 'var(--card)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none',
              }}
            />
            <input
              type="date"
              value={pinDate}
              onChange={e => setPinDate(e.target.value)}
              style={{
                padding: '12px 10px', borderRadius: 12,
                background: 'var(--card)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                colorScheme: 'dark',
              }}
            />
            <button
              className="btn-press"
              onClick={handleAddPin}
              disabled={!pinLabel.trim() || !pinDate}
              style={{
                padding: '0 16px', borderRadius: 12,
                background: pinLabel.trim() && pinDate ? 'var(--purple)' : 'var(--card)',
                color: pinLabel.trim() && pinDate ? '#fff' : 'var(--text-muted)',
                border: 'none', fontSize: 20, fontWeight: 300,
              }}
            >
              +
            </button>
          </div>

          {pinnedDates.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--text-muted)', padding: '8px 0' }}>No pinned dates yet.</p>
          ) : (
            pinnedDates.map(p => (
              <div key={p.id} className="card" style={{ padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 600 }}>{p.label}</span>
                  <span style={{ fontSize: 13, color: 'var(--purple)', marginLeft: 10 }}>
                    {new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <button
                  className="btn-press"
                  onClick={() => removePinnedDate(p.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 20 }}
                >×</button>
              </div>
            ))
          )}
        </div>

        {/* Data */}
        <SectionHeader>Data</SectionHeader>
        <div style={{ margin: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn-press"
            onClick={handleExport}
            style={{
              width: '100%', padding: '16px', borderRadius: 16,
              background: 'var(--card)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: 16, fontWeight: 600,
            }}
          >
            Export My Data
          </button>

          {!showReset ? (
            <button
              className="btn-press"
              onClick={() => setShowReset(true)}
              style={{
                width: '100%', padding: '16px', borderRadius: 16,
                background: 'rgba(255,55,95,0.08)', border: '1px solid rgba(255,55,95,0.2)',
                color: 'var(--red)', fontSize: 16, fontWeight: 600,
              }}
            >
              Reset All Data
            </button>
          ) : (
            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 16 }}>
                This will delete everything — tasks, history, and your profile. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-press" onClick={() => setShowReset(false)}
                  style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'var(--card-elevated)', border: 'none', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Cancel
                </button>
                <button className="btn-press" onClick={handleReset}
                  style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'var(--red)', border: 'none', color: '#fff', fontWeight: 700 }}>
                  Yes, Reset
                </button>
              </div>
            </div>
          )}
        </div>

        <TabBar />
      </div>
    </ThemeProvider>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', padding: '0 20px', marginBottom: 10 }}>
      {children}
    </p>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className="btn-press"
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 28, borderRadius: 14,
        background: value ? 'var(--green)' : 'var(--card-elevated)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 23 : 3,
        width: 22, height: 22, borderRadius: 11,
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{label}</span>
      <Toggle value={value} onChange={onChange} />
    </div>
  )
}
