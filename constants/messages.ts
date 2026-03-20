export const onCompletion = {
  default: [
    'Nice — checked off honestly.',
    'Done. For real.',
    "That's the way.",
    'Clean work.',
    'Another one in the books.',
  ],
  firstOfDay: [
    'First one today. Let\'s go.',
    'Day started. Nice.',
    "That's how it begins.",
  ],
  perfectDay: [
    'Every. Single. One.',
    'Perfect day. You earned it.',
    'All of them. Seriously.',
  ],
  streakMilestone: (n: number) => [
    `${n} days straight!`,
    `${n}-day streak!`,
    `${n} days. You're locked in.`,
  ],
}

export const onPartial = [
  'Progress is progress.',
  'Halfway is still movement.',
  'Partial counts. Seriously.',
  'Something is better than nothing.',
  'Some is better than none.',
]

export const onNotYet = [
  'Respect for being honest.',
  'No shame. Still on your list.',
  'Honesty is progress too.',
  'Better honest than faking it.',
  'That takes courage.',
  'No pressure — come back when you\'re ready.',
]

export const onComeback = [
  'Glad you came back.',
  'Every restart counts.',
  'Back at it. Good.',
  'The streak starts again today.',
]

export const honestCheckPrompts = [
  'Did you really do this?',
  'Be honest with yourself.',
  'Done for real?',
  'Honestly completed?',
  'Hand on heart — done?',
]

export function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}
