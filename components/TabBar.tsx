'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/today',    label: 'Today',    icon: '☀️' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/progress', label: 'Progress', icon: '📊' },
  { href: '/me',       label: 'Me',       icon: '👤' },
]

export default function TabBar() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        zIndex: 50,
      }}
    >
      {tabs.map(tab => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="btn-press"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '10px 0 6px',
              textDecoration: 'none',
            }}
          >
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.3px',
              color: active ? 'var(--purple)' : 'var(--text-muted)',
              transition: 'color 0.2s',
            }}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
