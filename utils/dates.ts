export function toDateKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0] // "YYYY-MM-DD"
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function formatTime(time: string): string {
  // "06:00" → "6:00 AM"
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

export function getGreeting(name: string): string {
  const h = new Date().getHours()
  if (h < 12) return `Good morning, ${name}`
  if (h < 17) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
}

export function getDayOfWeek(dateKey: string): number {
  // Returns 0=Sun … 6=Sat
  return new Date(dateKey + 'T12:00:00').getDay()
}

export function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(toDateKey(d))
  }
  return days
}

export function getDatesInMonth(year: number, month: number): string[] {
  const days: string[] = []
  const count = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= count; d++) {
    days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  return days
}

export function isFutureDate(dateKey: string): boolean {
  return dateKey > todayKey()
}

export function isPastDate(dateKey: string): boolean {
  return dateKey < todayKey()
}
