# Focus Board — Project Overview

## Description

**Focus Board** is a Pomodoro-style productivity application built with React 18, Vite, and Tailwind CSS. It helps users stay focused through structured 25-minute work sessions and 5-minute breaks, with task management and session history tracked locally in the browser.

---

## Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| Framework | React 18 | Component-based UI |
| Build tool | Vite 5 | Dev server, HMR, production bundling |
| Styling | Tailwind CSS v3 (JIT) | Utility-first responsive design |
| CSS processing | PostCSS + Autoprefixer | Compiles Tailwind directives |
| Security | DOMPurify | XSS sanitization of user inputs |
| State | React Hooks + Context API | Hook-based state, no prop drilling |
| Persistence | localStorage | Task data survives page refresh |
| Unit tests | Vitest + React Testing Library | Hooks and component behaviour |
| E2E tests | Playwright | Full user flows in Chromium |

---

## Architecture

### Component tree

```
main.jsx
└── TaskContextProvider          (src/context/TaskContext.jsx)
    └── App.jsx                  (layout, keyboard shortcut)
        ├── Timer.jsx            (Pomodoro timer card)
        ├── TaskForm.jsx         (expandable add-task form)
        ├── TaskList.jsx         (task rows, selection, delete)
        └── Summary.jsx          (4-stat cards + session history)
```

### State: two custom hooks in Context

All application state lives in two hooks exposed through `TaskContext`:

#### `useTimer` (`src/hooks/useTimer.js`)

| State | Type | Description |
|---|---|---|
| `timeRemaining` | `number` (ms) | Milliseconds left in current interval |
| `isActive` | `boolean` | Whether the countdown is ticking |
| `isFocusMode` | `boolean` | `true` = focus, `false` = break |
| `currentTaskId` | `string \| null` | ID of the selected task |
| `pomodoroCount` | `number` | Completed focus sessions this page load |

Key design decisions:
- Timer runs via a single `useEffect` with `setInterval` at 100ms, self-clearing on unmount or when `isActive` flips.
- Mode flip (focus → break) is detected by a `useRef` (`prevFocusModeRef`) and triggers the pomodoro counter increment.
- `startTimer` and `resumeTimer` guard against starting a focus session without a selected task (`if (isFocusMode && !currentTaskId) return`), but break mode starts freely.

#### `useTasks` (`src/hooks/useTasks.js`)

| State | Type | Description |
|---|---|---|
| `tasks` | `Task[]` | Ordered array of task objects |

Each `Task` object shape:
```ts
{
  id: string;            // uuid v4
  title: string;         // sanitized at submission
  description: string;   // optional, sanitized at submission
  completedSessions: number;
  completed: boolean;
  createdAt: string;     // ISO timestamp
}
```

Key design decisions:
- Tasks are loaded from `localStorage` on mount and written back on every mutation via a `useEffect`.
- Mutations (`addTask`, `completeTask`, `deleteTask`, `updateSessionCount`) all use functional `setState` to avoid stale closure bugs.
- `addTask` returns the new task object so callers can chain operations if needed.

### Data flow

```
User action
  → Component calls context method (e.g. addTask, startTimer)
  → Custom hook updates local state
  → useEffect side effect (localStorage sync, timer interval)
  → React re-renders affected components
```

No third-party state library is used; the Context + hooks pattern keeps the footprint minimal.

---

## Security

### XSS defence-in-depth

| Point | Mechanism |
|---|---|
| At submission | `DOMPurify.sanitize()` on title and description in `TaskForm.handleSubmit` |
| At render | `DOMPurify.sanitize()` on all user strings in `Timer`, `TaskList`, `Summary` |
| HTTP headers | CSP `<meta>` in `index.html` restricts `script-src` to `'self'` |

### Security test results (manual)

| Attack vector | Outcome |
|---|---|
| `<script>alert(1)</script>` in task title | Stripped — renders as plain text |
| `<img src=x onerror=alert(1)>` | Stripped |
| `javascript:alert(1)` in description | Stripped |

---

## Layout & Design

### Desktop layout (≥ 1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│                        🎯 Focus Board                           │
│               Stay focused · Take breaks · Get things done      │
├──────────────────────────────┬──────────────────────────────────┤
│  Timer card (480px fixed)    │  Task list (1fr)                 │
│  ┌──────────────────────┐    │  Tasks | 2 remaining             │
│  │ Session 1 of 4       │    │  ○ Review code          🗑        │
│  │ ● ○ ○ ○              │    │  ○ Write docs           🗑        │
│  │   Task Title         │    │                                  │
│  │   Stay focused!      │    │                                  │
│  │     25 : 00          │    │                                  │
│  │  ━━━━━━━━━━━━━━━━━━  │    │                                  │
│  │  ▶ Start  ↻ Reset    │    │                                  │
│  │     ⊙ Focus Mode     │    │                                  │
│  └──────────────────────┘    │                                  │
│                              │                                  │
│  Add Task                    │                                  │
│  [ What needs to be done? +] │                                  │
├──────────────────────────────┴──────────────────────────────────┤
│  Focus Statistics                                               │
│  [🕐 Sessions] [⊙ Focus min] [☕ Break min] [✓ Tasks done]     │
│  Complete your first session to see history here               │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile layout (< 1024px)

Columns collapse to a single vertical stack:
Timer → Add Task → Task List → Stats

### Colour palette

| Context | Tailwind gradient | Feeling |
|---|---|---|
| Focus mode timer | `from-[#4a1d96] via-[#7c3aed] to-[#be185d]` | Deep work energy |
| Break mode timer | `from-[#064e3b] via-[#065f46] to-[#047857]` | Calm restoration |
| Sessions stat | purple accent | |
| Focus min stat | blue accent | |
| Break min stat | teal accent | |
| Tasks done stat | pink accent | |

---

## Testing Strategy

### Unit / component tests (Vitest + RTL)

Located in `src/test/`. Run with `npm test`.

| File | What's tested |
|---|---|
| `useTimer.test.js` | Init, start, pause, resume, reset, task selection, mode flip, pomodoro count |
| `useTasks.test.js` | Init from localStorage, add (with/without description), toggle, delete, updateSessionCount, persistence |
| `components.test.jsx` | TaskForm submission and expand, TaskList rendering and interaction, Summary stats and history display |

Test environment: `jsdom` via Vitest. DOMPurify and `localStorage` are mocked in `src/test/setup.js`.

### E2E tests (Playwright)

Located in `e2e/focusboard.spec.js`. Run with `npm run test:e2e`.

Covers: page load, task creation, task deletion, task completion, timer controls, session completion, and localStorage persistence across reloads.

Playwright config auto-starts the Vite dev server on port 5174 if not already running.

---

## Development Decisions & Trade-offs

### Why Context API over Redux / Zustand?

The app has two interrelated state domains (timer and tasks) that need to share `currentTaskId`. The Context + hooks pattern achieves this with zero additional dependencies and is easy to test because each hook can be exercised independently.

### Why Vitest over Jest?

Vitest integrates with the Vite pipeline directly, meaning the same transform config (Babel for JSX, CSS modules) applies to both app code and tests without a separate Jest config. It also supports ESM natively.

### Why DOMPurify at both submission and render?

Defence-in-depth: if a future code path stores data to localStorage without sanitizing first (e.g., a bulk import), the render-time sanitization acts as the last line of defence. The double sanitization cost is negligible for this data volume.

### Why no PostCSS config existed originally?

The project initially loaded Tailwind via CDN in `index.html`. After migrating to a proper Vite/PostCSS pipeline, `postcss.config.js` was added and the CDN link removed, enabling full JIT mode with arbitrary values (e.g., `lg:grid-cols-[480px_1fr]`).

---

## Known Limitations & Future Work

| Item | Priority | Notes |
|---|---|---|
| Customizable durations (25/5 min) | High | Settings modal or inline inputs |
| Audio notifications on timer end | Medium | HTML5 Audio API, ~1 hour effort |
| Session history persistence | Medium | Store in localStorage alongside tasks |
| Long-break mode (session 4 → 15 min) | Medium | `POMODOROS_BEFORE_LONG_BREAK` constant already exists in `useTimer` |
| Productivity charts | Low | Recharts or Chart.js for weekly insights |
| Cloud sync / multi-device | Low | Requires auth + backend |

---

*Last updated: April 2026*
