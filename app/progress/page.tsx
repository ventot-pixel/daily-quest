'use client'

import { useQuestStore } from '@/store/questStore'
import TabBar from '@/components/TabBar'
import ThemeProvider from '@/components/ThemeProvider'
import ProgressRing from '@/components/ProgressRing'

export default function ProgressPage() {
  const stats = useQuestStore(s => s.stats)

  const completionRate = stats.totalDaysTracked > 0
    ? (stats.totalCompleted + stats.totalPartial * 0.5) /
      Math.max(stats.totalCompleted + stats.totalPartial + stats.totalHonestNotYet, 1)
    : 0

  const honestyRate = stats.totalDaysTracked > 0
    ? stats.honestDays / stats.totalDaysTracked
    : 0

  const bigStats = [
    { label: 'Perfect Days', value: stats.perfectDays, color: 'var(--green)' },
    { label: 'Honest Days',  value: stats.honestDays,  color: 'var(--blue)' },
    { label: 'Best Streak',  value: stats.bestStreak,  color: 'var(--orange)' },
    { label: 'Cur. Streak',  value: stats.currentStreak, color: 'var(--purple)' },
  ]

  return (
    <ThemeProvider>
      <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 90 }}>

        {/* Header */}
        <div style={{ padding: '56px 20px 24px' }}>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
            Progress
          </h1>
        </div>

        {/* Big stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 24px' }}>
          {bigStats.map(s => (
            <div key={s.label} className="card" style={{ padding: '20px 16px', position: 'relative', overflow: 'hidden' }}>
              {/* Glow blob */}
              <div style={{
                position: 'absolute', top: -10, right: -10,
                width: 60, height: 60, borderRadius: 30,
                background: s.color, opacity: 0.12, filter: 'blur(20px)',
              }} />
              <p style={{ fontSize: 36, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Rate bars */}
        <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <RateBar label="Completion Rate" rate={completionRate} color="var(--green)" />
          <RateBar label="Honesty Rate" rate={honestyRate} color="var(--blue)" />
        </div>

        {/* Rings */}
        <div style={{ padding: '0 20px 24px', display: 'flex', justifyContent: 'center', gap: 40 }}>
          <div style={{ textAlign: 'center' }}>
            <ProgressRing size={90} strokeWidth={8} progress={completionRate} color="var(--green)">
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                {Math.round(completionRate * 100)}%
              </span>
            </ProgressRing>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontWeight: 600 }}>COMPLETION</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <ProgressRing size={90} strokeWidth={8} progress={honestyRate} color="var(--blue)">
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                {Math.round(honestyRate * 100)}%
              </span>
            </ProgressRing>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontWeight: 600 }}>HONESTY</p>
          </div>
        </div>

        {/* Lifetime */}
        <div style={{ padding: '0 20px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 12 }}>
            Lifetime
          </p>
          <div className="card" style={{ padding: '4px 0' }}>
            {[
              { label: 'Tasks completed', value: stats.totalCompleted },
              { label: 'Partially done', value: stats.totalPartial },
              { label: 'Honest not yet', value: stats.totalHonestNotYet },
              { label: 'Days tracked', value: stats.totalDaysTracked },
            ].map((row, i, arr) => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{row.label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 20 }} />
        <TabBar />
      </div>
    </ThemeProvider>
  )
}

function RateBar({ label, rate, color }: { label: string; rate: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{Math.round(rate * 100)}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'var(--card-elevated)' }}>
        <div style={{
          height: 8, borderRadius: 4, background: color,
          width: `${Math.round(rate * 100)}%`,
          transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
    </div>
  )
}
