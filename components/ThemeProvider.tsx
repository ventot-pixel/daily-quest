'use client'

import { useEffect } from 'react'
import { useQuestStore } from '@/store/questStore'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useQuestStore(s => s.profile?.theme ?? 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <>{children}</>
}
