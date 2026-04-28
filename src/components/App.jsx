import { useEffect } from 'react'
import { useTaskContext } from '../context/TaskContext'
import TaskForm from './TaskForm'
import TaskList from './TaskList'
import Timer from './Timer'
import Summary from './Summary'

function App() {
  const { tasks, timerState, sessionHistory, addSession } = useTaskContext()
  const { isActive, isFocusMode, currentTaskId, startTimer, pauseTimer } = timerState

  const handleSessionComplete = () => {
    addSession(timerState.currentTaskId, 'focus')
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)) return
      if (e.code === 'Space') {
        e.preventDefault()
        if (isActive) {
          pauseTimer()
        } else if (!isFocusMode || currentTaskId) {
          startTimer()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, isFocusMode, currentTaskId, startTimer, pauseTimer])

  return (
    <div className="min-h-screen bg-[#0f0c1d]" style={{ background: 'linear-gradient(135deg, #0f0c1d 0%, #1a0d3a 40%, #0e1224 100%)' }}>
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-16 left-8 w-[28rem] h-[28rem] bg-purple-700/20 rounded-full blur-[96px] animate-pulse" />
        <div
          className="absolute bottom-16 right-8 w-[36rem] h-[36rem] bg-pink-700/15 rounded-full blur-[112px] animate-pulse"
          style={{ animationDelay: '1.8s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44rem] h-[44rem] bg-violet-800/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-[2.6rem] font-bold text-white mb-1.5 tracking-tight leading-none">
            <span aria-hidden="true" className="mr-2">🎯</span>Focus Board
          </h1>
          <p className="text-purple-300/70 text-base font-medium">
            Stay focused · Take breaks · Get things done
          </p>
        </header>

        {/* Two-column main area */}
        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-5 items-start mb-5">

          {/* ── Left column: Timer + Add Task ── */}
          <div className="flex flex-col gap-4">
            <Timer
              timerState={timerState}
              tasks={tasks}
              onSessionComplete={handleSessionComplete}
            />

            {/* Add Task card */}
            <div className="bg-white/[0.06] backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/[0.08]">
              <h2 className="text-xl font-bold text-white mb-3">
                Add Task
              </h2>
              <TaskForm />
            </div>
          </div>

          {/* ── Right column: Task List ── */}
          <TaskList />
        </div>

        {/* Full-width stats */}
        <Summary sessionHistory={sessionHistory} />

        {/* Footer hint */}
        <footer className="mt-6 text-center text-purple-500/35 text-xs">
          Press{' '}
          <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.08] font-mono text-purple-300/50 text-[11px] border border-white/10">
            Space
          </kbd>{' '}
          to start / pause timer
        </footer>
      </div>
    </div>
  )
}

export default App
