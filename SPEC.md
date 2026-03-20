# Daily Quest — Product Spec

**Version:** 1.0
**Platform:** Next.js PWA (web-first, installable on phone)
**Status:** Pre-build

---

## Core Philosophy

These four rules guide every decision in this app:

1. **Free must be life-changing.** A user who never pays should still become more consistent and more honest with themselves. That's the brand promise.
2. **Never gate the core loop.** Create task → do it → honest check → see progress. This loop must always be free.
3. **Premium = deeper, not essential.** Premium gives more insight and personalization. It makes a great experience better — it doesn't lock what should be basic.
4. **Users first, revenue second.** Build something people love. Revenue follows.

---

## What is Daily Quest

A calm, mobile-first daily checklist app where **honesty is the core mechanic** — not just a feature. It tracks two things: what you got done, and how honest you were about it. Both are celebrated.

**One-line pitch:** "A daily checklist that rewards you for being honest about what you actually did."

**What it is NOT:** Not a project manager, not a timer app, not a social tool, not a gamified RPG.

---

## Core Feature: The Honest Check

When a user taps a checkbox to complete a task, a modal appears asking: "Did you really do this?" with rotating prompts like "Be honest with yourself", "Done for real?", "Honestly completed?"

Three buttons:
- **"Yes, I did it"** → marks complete, shows a warm confirmation message
- **"Partly done"** → marks partial, logged honestly, shows an encouraging message
- **"Not yet"** → keeps task active, shows a supportive honesty message like "Respect for being honest."

All three choices are positive. Partial and "not yet" are never punished — honesty in any form is celebrated.

The Honest Check can be toggled off in Settings for users who prefer a simpler experience.

### Dual Metric System
- **Completion Rate** = tasks honestly completed / total tasks
- **Honesty Rate** = days where user engaged with Honest Check / total days tracked

### Contextual Messages

On completion:
- Default: "Nice — checked off honestly.", "Done. For real.", "That's the way.", "Clean work."
- First of day: "First one today. Let's go.", "Day started. Nice."
- Perfect day (all tasks done): "Every. Single. One.", "Perfect day. You earned it."
- Streak milestone (every 5): "{n} days straight!", "{n}-day streak!"

On "Partly done":
- "Progress is progress.", "Halfway is still movement.", "Partial counts. Seriously.", "Something is better than nothing."

On "Not yet":
- "Respect for being honest.", "No shame. Still on your list.", "Honesty is progress too.", "Better honest than faking it.", "That takes courage."

**Tone rules (non-negotiable):** Calm, warm, supportive. Never manipulative, never guilt-heavy, never shaming missed days.

---

## App Structure — 4 Tabs

### Tab 1: Today (Home)
- Header: greeting by time of day + user name ("Good morning, Ven")
- Streak badge (flame icon + count) if streak > 0
- Progress ring (circular, animated, shows percentage)
- Sub-label: "X of Y quests"
- 3 stat cards in a row: Total Completed (green), Honest "not yet" count (blue), Best Streak (orange)
- Task list, sorted by time (tasks without time appear at bottom), each card shows:
  - Checkbox (triggers Honest Check on tap)
  - Category color dot (green = Health, blue = Work, orange = Fun)
  - Title
  - Optional priority indicator (subtle — high priority gets a small accent mark)
  - Optional time (formatted as 6:00 AM)
  - Optional subtask count (2/4)
  - Chevron to edit
- Floating action button (bottom right) to add new task
- Empty state: floating leaf icon + "No quests today" + "Tap + to begin"

### Tab 2: Calendar
- Monthly grid with day dots:
  - Green = perfect day (all tasks completed)
  - Yellow/orange = partial (some done)
  - Gray = missed (neutral, NOT red)
  - Purple dot = has pinned date
- Month navigation arrows
- Tap a date to see that day's task summary
- Stats row: Perfect Days, Current Streak, Best Streak
- "Pinned This Month" section shows any pinned dates for visible month

### Tab 3: Progress
- 4 big stat cards (2x2 grid): Perfect Days, Honest Days, Current Streak, Best Streak
- Completion Rate bar (green) with percentage
- Honesty Rate bar (blue) with percentage
- Lifetime section: Total completed, Honest "not yet", Days tracked

### Tab 4: Me
- Profile card: avatar initial (gradient circle), name, total quests completed
- Preferences section: Appearance toggle (Dark/Light), Notification toggle + time picker, Honest Check toggle (on/off)
- Pinned Dates section: list of user-added dates with add/remove
- Export Data button (downloads JSON)
- Reset All Data button (destructive, red)

---

## Onboarding (4 steps)

1. **Welcome** — sparkle icon, "Daily Quest" title, "A daily checklist that rewards you for being honest.", "Get Started" button
2. **Name** — "What should we call you?" + text input for name/nickname
3. **Theme** — "Pick your vibe" — two cards: Dark (moon icon) and Light (sun icon), selectable
4. **Ready** — "You're all set, {name}!" + preview of seed tasks + "Start My Journey" button

Step indicator dots at bottom (animated width change for active step).

---

## Seed Data (pre-loaded on first launch)

The app must NOT start empty. Include these:

1. Morning routine (6:00 AM, daily, subtasks: Make the bed, Drink water, Brush teeth)
2. Stretching (6:15 AM, daily, subtasks: Neck stretch, Shoulder rolls, Hamstrings)
3. Review priorities (6:30 AM, daily, no subtasks)
4. Workout (7:00 AM, weekdays Mon–Fri, no subtasks)
5. Stay hydrated (no time, daily, no subtasks)
6. Wind down & sleep (10:00 PM, daily, no subtasks)

---

## Task Data Model

```typescript
interface Task {
  id: string;
  title: string;
  notes: string | null;
  category: "health" | "work" | "fun";   // default: "health"
  priority: "high" | "medium" | "low";   // default: "medium"
  subtasks: { id: string; title: string; completed: boolean }[];
  time: string | null;           // "HH:MM" 24h format
  repeat: {
    type: "one-time" | "daily" | "weekdays" | "custom";
    days?: number[];             // 0=Sun, 1=Mon ... 6=Sat
  };
  createdAt: string;             // ISO
  isActive: boolean;             // soft delete
}

interface DayTask {
  taskId: string;
  completed: boolean;
  partiallyDone: boolean;        // true = user tapped "Partly done"
  honestCheck: boolean;          // true = user went through Honest Check
  skipped: boolean;
  completedAt: string | null;    // ISO
}

interface DayRecord {
  date: string;                  // "YYYY-MM-DD"
  tasks: DayTask[];
  perfectDay: boolean;
}

interface UserProfile {
  name: string;
  theme: "dark" | "light";
  notifications: {
    enabled: boolean;
    time: string;                // "HH:MM" — daily reminder time
  };
  honestCheckEnabled: boolean;   // default: true
  onboardingComplete: boolean;
  createdAt: string;
}

interface UserStats {
  totalCompleted: number;
  totalHonestNotYet: number;
  bestStreak: number;
  currentStreak: number;
  totalDaysTracked: number;
  perfectDays: number;
  honestDays: number;
}

interface PinnedDate {
  id: string;
  label: string;
  date: string;                  // "YYYY-MM-DD"
}
```

---

## Task Form Fields

- Title (required)
- Category: 3 toggle buttons — Health (green), Work (blue), Fun (orange)
- Priority: 3 toggle buttons — High, Medium, Low (default: Medium)
- Notes (optional textarea)
- Time (optional time picker)
- Repeat: toggle buttons — Once, Daily, Weekdays, Custom
  - If "Custom": 7 day buttons S M T W T F S (toggleable)
- Steps (subtasks): list with checkboxes + add input + remove X
- Save button (disabled if no title)
- Delete button (only in edit mode, red/destructive style)

---

## Pinned Dates Feature

Users can manually add important dates (birthdays, deadlines, bills) from the Me tab:
- Form: label + date picker
- Shows as purple dots on calendar
- Listed in "Pinned This Month" section on Calendar tab
- Manageable (add/remove) from Me tab

---

## Daily Logic Rules

### Daily Reset
- "Today" is determined by local device date (`YYYY-MM-DD`)
- Tasks for the day are generated at first app open of that date
- Repeat tasks are evaluated against the current day of week
- No automatic rollover — missed tasks are simply recorded as incomplete
- One-time tasks that were not completed on their created date are marked skipped

### Streak Calculation
- A streak day = any day where at least 1 task was completed
- Streak increments at midnight (date change), not at task completion
- Missing a full day resets streak to 0
- Partial days (some but not all tasks done) maintain the streak — completion, not perfection, keeps the chain
- Best streak is persisted and never decremented

### Perfect Day
- Triggered when ALL tasks for the day are marked completed (via Honest Check "Yes")
- Tasks marked "Not yet" do NOT count toward perfect day
- Perfect day flag is set on `DayRecord` and never retroactively removed

---

## Notifications (PWA — Browser Push)

- Uses Web Push API (Notification API + Service Worker)
- User enables in Me tab + picks a daily reminder time
- Single daily notification: "Time for your quests, {name}." (or rotating variants)
- Notification variants:
  - Default: "Time for your quests, {name}."
  - Streak active: "Your {n}-day streak is waiting."
  - Morning (before 9 AM): "Good morning, {name}. Quests are ready."
- On notification tap: opens app to Today tab
- Permission request is deferred — only asked after onboarding is complete, never on first load
- Graceful degradation: if permission denied, notifications section in Me tab shows explanation, no nag

---

## Data Export

- Available in Me tab: "Export My Data"
- Downloads a single `daily-quest-export.json` containing:
  - `profile` (UserProfile)
  - `tasks` (Task[])
  - `history` (DayRecord[])
  - `stats` (UserStats)
  - `pinnedDates` (PinnedDate[])
  - `exportedAt` (ISO timestamp)
- No import in v1 — export only (backup use case)

---

## Monetization Path (Designed In, Not Built Yet)

The MVP is fully free with no paywalls. However, the architecture should support future premium features without a rewrite.

### Suggested Pricing (v2)
- **Free** — $0, forever
- **Premium** — $2.99/month or $24.99/year (saves ~30%)

### Future Premium Features (v2)
- **Cloud sync** — account creation (email/magic link), data synced across devices
- **Advanced analytics** — monthly breakdowns, trend charts, full history
- **Multiple reminders** — up to 3 notifications per day
- **Custom themes** — additional color palettes beyond dark/light
- **Multiple profiles** — useful for families or partner accounts

### How free users discover premium (no dark patterns)
1. **The stats tease** — Monthly stats section is visible but blurred with a small "Unlock" label. Curiosity, not pressure.
2. **The 30-day moment** — After 30 days of consistent use, offer a 7-day free trial. They've already proven they love the app.
3. **The sync nudge** — When a user exports data, mention: "Want your data automatically backed up across devices? That's Premium."

### Design decisions that support this now
- `UserProfile` includes `id` field (optional in v1, required in v2 for cloud sync)
- Store layer is abstracted (localStorage in v1, swappable to API calls in v2)
- No hardcoded localStorage keys in components — all data flows through store
- Keep auth-related routes empty but reserved in folder structure (`/auth/`)

---

## Design System

### Theme: Dark Mode (default)
```
Background:       #000000
Card:             #1C1C1E
Card elevated:    #2C2C2E
Text primary:     #F5F5F7
Text secondary:   #A1A1A6
Text muted:       #636366
Accent (green):   #30D158
Accent muted:     rgba(48,209,88,0.14)
Accent on text:   #000000
Blue:             #0A84FF
Blue muted:       rgba(10,132,255,0.14)
Orange:           #FF9F0A
Pink/danger:      #FF375F
Purple:           #BF5AF2
Border:           rgba(255,255,255,0.08)
Glass:            rgba(28,28,30,0.82)
```

### Theme: Light Mode
```
Background:       #F2F2F7
Card:             #FFFFFF
Card elevated:    #E5E5EA
Text primary:     #000000
Text secondary:   #3C3C43
Text muted:       #8E8E93
Accent (green):   #34C759
Accent muted:     rgba(52,199,89,0.12)
Accent on text:   #FFFFFF
Blue:             #007AFF
Blue muted:       rgba(0,122,255,0.12)
Orange:           #FF9500
Pink/danger:      #FF3B30
Purple:           #AF52DE
Border:           rgba(0,0,0,0.06)
Glass:            rgba(255,255,255,0.85)
```

### Typography
- Font stack: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif
- Secondary: DM Sans (Google Fonts)
- Screen titles: 34px, weight 700, letter-spacing -0.5px
- Section headers: 13px, weight 600, uppercase, letter-spacing 1.5px
- Task titles: 16px, weight 600
- Body: 15px, weight 500
- Small labels: 11–12px, weight 500–600

### UI Principles
- Rounded cards (border-radius 16–20px)
- Large tap targets (minimum 44x44px — Apple HIG standard)
- Generous whitespace
- Subtle colored glow blobs behind stat numbers (blurred, absolute positioned)
- 1px borders using theme border color
- Tab bar: frosted glass effect (backdrop-filter: blur(40px) saturate(180%))
- No red for missed days — neutral gray only

### Animations & Micro-interactions
- **Button press:** scale(0.96) on pointer down, spring back on release
- **Checkmark:** bounceCheck animation (scale 0→1.25→1) on task completion
- **Progress ring:** stroke-dashoffset transition, spring curve (0.8s cubic-bezier(0.34,1.56,0.64,1))
- **Screen elements:** staggered slideUp on mount (translateY 16px→0, opacity 0→1, each 40–50ms staggered)
- **Modal:** scale(0.88)→1 + translateY(8px)→0 with blur backdrop
- **Toast notifications:** slide in from top, glass morphism pill
- **Confetti:** 45 particles on perfect day completion
- **FAB:** subtle pulsing glow (box-shadow oscillation)
- **Empty state:** floating animation on leaf icon (translateY 0→-5px→0, 3s loop)
- **Sparkle in Honest Check modal:** pulse (scale 1→1.12→1, 2s loop)

### Confetti Spec
Trigger: user completes the LAST task of the day (more than 1 task total)
- 45 particles
- Colors: #30D158, #0A84FF, #FF9F0A, #FF375F, #BF5AF2
- Random x (0–100%), random delay (0–0.6s), random duration (1.2–2.4s)
- Each particle: width 4–10px, height 1.4x width, borderRadius 2
- Animation: translateY(0→100vh) + translateX(random ±30px drift) + rotate(0–720deg)
- Auto-dismiss after 3s

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Web + PWA, no app store friction |
| Language | TypeScript | Type safety, catches data model errors early |
| Styling | Tailwind CSS | Fast iteration, no CSS bloat |
| UI Components | shadcn/ui | Accessible, unstyled base, we control the look |
| State | Zustand | Simple, no boilerplate, persists easily |
| Storage | localStorage (via Zustand persist middleware) | Offline-first, zero backend in v1 |
| Notifications | Web Push API + Service Worker | Native-feeling daily reminders |
| PWA | next-pwa | Installable on phone home screen |
| Fonts | Google Fonts (DM Sans) | Free, fast |
| Deployment | Vercel | Free tier, zero config for Next.js |

### No backend in v1. No auth in v1. No database in v1.
Everything lives in localStorage. This keeps it fast to build and free to run.

---

## Folder Structure

```
daily-quest/
├── SPEC.md
├── app/
│   ├── layout.tsx                  Root layout + theme provider
│   ├── page.tsx                    Redirects to /today or /onboarding
│   ├── globals.css
│   ├── (tabs)/
│   │   ├── layout.tsx              Tab bar layout
│   │   ├── today/
│   │   │   └── page.tsx
│   │   ├── calendar/
│   │   │   └── page.tsx
│   │   ├── progress/
│   │   │   └── page.tsx
│   │   └── me/
│   │       └── page.tsx
│   ├── onboarding/
│   │   └── page.tsx
│   ├── task/
│   │   └── [id]/
│   │       └── page.tsx            Add/edit task modal
│   ├── addpin/
│   │   └── page.tsx
│   └── auth/                       Reserved for v2 (cloud sync)
│       └── .gitkeep
├── components/
│   ├── ProgressRing.tsx
│   ├── TaskCard.tsx
│   ├── HonestCheckModal.tsx
│   ├── StreakBadge.tsx
│   ├── Confetti.tsx
│   ├── Btn.tsx                     Haptic-feel button wrapper
│   ├── Toast.tsx
│   └── TabBar.tsx
├── store/
│   └── questStore.ts               Zustand + localStorage persistence
├── types/
│   └── index.ts
├── utils/
│   ├── dates.ts                    Date helpers, day-of-week logic
│   ├── tasks.ts                    Task scheduling, repeat resolution
│   └── streaks.ts                  Streak calculation
├── constants/
│   ├── colors.ts                   Theme tokens (dark + light)
│   ├── messages.ts                 All honest check + toast messages
│   └── seedData.ts
└── public/
    ├── manifest.json               PWA manifest
    └── icons/                      App icons (various sizes for install)
```

---

## Non-Negotiables

- Offline-first — app works without internet
- No mandatory account creation
- No paywall on core experience
- No ads in MVP
- No shame mechanics ever
- Honesty is always rewarded, never punished
- Recovery after missed days is always supported
- Missed days are GRAY on calendar, never red
- Calm tone in all copy and UI
- Data persists locally between sessions
- Notification permission is never asked on first load
- Export is always available — user owns their data

---

## Open Questions (Decide Before Building)

1. Should subtask completion also trigger an Honest Check? Or only the parent task?
2. If a task has a time (e.g. 10:00 PM), should it be visually greyed out before that time?
3. Should "one-time" tasks auto-archive after the day passes, or stay visible?
4. On a perfect day, should completed tasks show a different visual state (e.g. green background) vs a normal completion?
