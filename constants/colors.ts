export const dark = {
  bg: '#000000',
  card: '#1C1C1E',
  cardElevated: '#2C2C2E',
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1A6',
  textMuted: '#636366',
  border: 'rgba(255,255,255,0.08)',
  glass: 'rgba(28,28,30,0.82)',
  // Accent
  green: '#30D158',
  greenMuted: 'rgba(48,209,88,0.14)',
  blue: '#0A84FF',
  blueMuted: 'rgba(10,132,255,0.14)',
  orange: '#FF9F0A',
  red: '#FF375F',
  redMuted: 'rgba(255,55,95,0.14)',
  purple: '#BF5AF2',
  purpleMuted: 'rgba(191,90,242,0.14)',
}

export const light = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  cardElevated: '#E5E5EA',
  textPrimary: '#000000',
  textSecondary: '#3C3C43',
  textMuted: '#8E8E93',
  border: 'rgba(0,0,0,0.06)',
  glass: 'rgba(255,255,255,0.85)',
  green: '#34C759',
  greenMuted: 'rgba(52,199,89,0.12)',
  blue: '#007AFF',
  blueMuted: 'rgba(0,122,255,0.12)',
  orange: '#FF9500',
  red: '#FF3B30',
  redMuted: 'rgba(255,59,48,0.12)',
  purple: '#AF52DE',
  purpleMuted: 'rgba(175,82,222,0.12)',
}

// Category → color key mapping
// Health = Red, Work = Blue, Fun = Green (Apple Health convention)
export const categoryColor = {
  health: { dark: dark.red,   light: light.red   },
  work:   { dark: dark.blue,  light: light.blue  },
  fun:    { dark: dark.green, light: light.green },
} as const

export const priorityColor = {
  high:   { dark: dark.red,    light: light.red    },
  medium: { dark: dark.orange, light: light.orange },
  low:    { dark: dark.textMuted, light: light.textMuted },
} as const
