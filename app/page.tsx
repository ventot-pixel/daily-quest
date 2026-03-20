'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuestStore } from '@/store/questStore'

export default function Root() {
  const router = useRouter()
  const profile = useQuestStore(s => s.profile)

  useEffect(() => {
    if (profile?.onboardingComplete) {
      router.replace('/today')
    } else {
      router.replace('/onboarding')
    }
  }, [profile, router])

  return (
    <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div style={{ fontSize: 28, color: 'var(--text-muted)' }}>✦</div>
    </div>
  )
}
