import { useMemo } from 'react'
import DOMPurify from 'dompurify'

const FOCUS_DURATION_MS = 25 * 60 * 1000
const BREAK_DURATION_MS = 5 * 60 * 1000

function PomodoroTracker({ count, total }) {
  const current = count % total
  return (
    <div className="mb-5">
      <p className="text-white/50 text-xs font-semibold mb-2">
        Session {current + 1} of {total}
      </p>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-500 ${
              i < current
                ? 'w-3.5 h-3.5 bg-white shadow shadow-white/40'
                : i === current
                  ? 'w-3.5 h-3.5 bg-white'
                  : 'w-3 h-3 bg-white/25'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function Timer({ timerState, tasks, onSessionComplete }) {
  const {
    currentTaskId,
    setCurrentTask,
    isFocusMode,
    timeRemaining,
    isActive,
    pomodoroCount,
    pomodorosBeforeLongBreak,
    startTimer,
    pauseTimer,
    resetTimer,
  } = timerState

  const currentTask = useMemo(
    () => tasks.find((t) => t.id === currentTaskId),
    [tasks, currentTaskId]
  )

  // MM : SS format with explicit spaces around the colon
  const { minutes, seconds } = useMemo(() => {
    const total = Math.floor(timeRemaining / 1000)
    return {
      minutes: String(Math.floor(total / 60)).padStart(2, '0'),
      seconds: String(total % 60).padStart(2, '0'),
    }
  }, [timeRemaining])

  const totalDuration = isFocusMode ? FOCUS_DURATION_MS : BREAK_DURATION_MS
  const progressPercent = (timeRemaining / totalDuration) * 100

  // Vivid purple-to-pink gradient matching the wireframe
  const cardGradient = isFocusMode
    ? 'from-[#4a1d96] via-[#7c3aed] to-[#be185d]'
    : 'from-[#064e3b] via-[#065f46] to-[#047857]'

  const progressColor = isFocusMode ? 'bg-white' : 'bg-emerald-300'

  const isStartDisabled = isFocusMode && !currentTaskId
  const canComplete = isFocusMode && currentTaskId && timeRemaining < FOCUS_DURATION_MS

  const startLabel = isActive ? 'Pause' : timeRemaining < totalDuration ? 'Resume' : 'Start'
  const StartIcon = isActive
    ? () => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      )
    : () => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )

  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br ${cardGradient}`}
    >
      {/* Subtle inner highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      <div className="relative z-10 p-6">
        <PomodoroTracker count={pomodoroCount} total={pomodorosBeforeLongBreak} />

        {/* Task name / state label */}
        <div className="text-center mb-5">
          {currentTaskId && currentTask ? (
            <>
              <h3
                className="text-2xl font-bold text-white leading-snug break-words"
                title={DOMPurify.sanitize(currentTask.title)}
              >
                {DOMPurify.sanitize(currentTask.title)}
              </h3>
              {currentTask.description && (
                <p className="text-white/55 text-sm mt-1 truncate">
                  {DOMPurify.sanitize(currentTask.description)}
                </p>
              )}
              <p className="text-purple-200/80 text-sm mt-1 font-medium">
                {isFocusMode ? 'Stay focused!' : 'Recharge before next session'}
              </p>
            </>
          ) : isFocusMode ? (
            <>
              <h3 className="text-2xl font-bold text-white/60">Select a Task</h3>
              <p className="text-white/40 text-sm mt-1">Choose a task to start focusing</p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-white">Break Time</h3>
              <p className="text-white/60 text-sm mt-1">Recharge before your next session ☕</p>
            </>
          )}
        </div>

        {/* Timer digits with spaced colon */}
        <div className="flex items-center justify-center mb-4">
          <span className="text-[5.5rem] font-bold text-white font-mono leading-none tracking-tight tabular-nums">
            {minutes}
          </span>
          <span className="text-[4rem] font-bold text-white/70 font-mono leading-none mx-2 mb-2">
            :
          </span>
          <span className="text-[5.5rem] font-bold text-white font-mono leading-none tracking-tight tabular-nums">
            {seconds}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/15 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${progressColor}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Three-button control row */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={isActive ? pauseTimer : startTimer}
            disabled={isStartDisabled}
            aria-label={startLabel}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
              transition-all duration-150 border
              disabled:opacity-40 disabled:cursor-not-allowed
              ${isStartDisabled
                ? 'bg-white/10 border-white/10 text-white/40'
                : 'bg-white/15 hover:bg-white/25 border-white/20 text-white'}
            `}
          >
            <StartIcon />
            {startLabel}
          </button>

          <button
            onClick={resetTimer}
            aria-label="Reset timer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>

          {canComplete && (
            <button
              onClick={onSessionComplete}
              aria-label="Complete session"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </button>
          )}
        </div>

        {/* Task selector dropdown */}
        {!currentTaskId && tasks.length > 0 && (
          <div className="mt-5">
            <select
              value=""
              onChange={(e) => setCurrentTask(e.target.value)}
              aria-label="Select task to focus on"
              className="w-full px-4 py-2.5 bg-white/15 border border-white/25 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer"
            >
              <option value="" disabled>Select a task to begin...</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id} className="text-gray-900">
                  {DOMPurify.sanitize(task.title)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Focus Mode badge */}
      <div className="relative z-10 border-t border-white/15 px-6 py-3 flex justify-center">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" strokeWidth="2" />
          </svg>
          {isFocusMode ? 'Focus Mode' : 'Break Mode'}
        </span>
      </div>
    </div>
  )
}

export default Timer
