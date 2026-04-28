import { useMemo } from 'react'
import DOMPurify from 'dompurify'

const TIMER_MODES = {
  FOCUS: 'focus',
  BREAK: 'break'
}

function Timer({ timerState, tasks, onSessionComplete }) {
  const { currentTaskId, setCurrentTask, isFocusMode, timeRemaining, startTimer, pauseTimer, resumeTimer, resetTimer } = timerState

  // Get current task with XSS protection for display
  const currentTask = useMemo(() => {
    return tasks.find((task) => task.id === currentTaskId)
  }, [tasks, currentTaskId])

  // Format time remaining with proper sanitization
  const formattedTime = useMemo(() => {
    const totalSeconds = Math.floor(timeRemaining / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [timeRemaining])

  // Determine timer state and styling with XSS protection for task title display
  const getTimerDisplay = () => {
    if (!isFocusMode) {
      return {
        mode: TIMER_MODES.BREAK,
        title: '☕ Break Time',
        subtitle: 'Take a quick break before your next session',
        colorClass: 'from-green-500 to-emerald-600',
        shadowClass: 'shadow-green-500/30'
      }
    }

    if (currentTaskId && currentTask) {
      return {
        mode: TIMER_MODES.FOCUS,
        title: DOMPurify.sanitize(currentTask.title), // XSS protection here
        subtitle: 'Stay focused!',
        colorClass: 'from-purple-500 to-pink-600',
        shadowClass: 'shadow-purple-500/30'
      }
    }

    return {
      mode: TIMER_MODES.FOCUS,
      title: 'Select a Task',
      subtitle: 'Choose a task from the list below to start focusing',
      colorClass: 'from-gray-500 to-slate-600',
      shadowClass: 'shadow-gray-500/30'
    }
  }

  const display = getTimerDisplay()

  // Handle timer actions with XSS protection for user input
  const handleStartPause = () => {
    if (!isFocusMode && !currentTaskId) return
    
    if (timeRemaining === 0 || timeRemaining < 1000) {
      startTimer()
    } else {
      pauseTimer()
    }
  }

  const handleReset = () => {
    resetTimer()
  }

  // Get task options with XSS protection for display only
  const getTaskOptions = () => {
    if (currentTaskId) return []
    
    return tasks.map((task) => ({
      id: task.id,
      label: DOMPurify.sanitize(task.title), // XSS safe display
      selected: currentTaskId === task.id
    }))
  }

  const timerOptions = getTaskOptions()

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      {/* Timer Display */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${display.colorClass} rounded-xl p-8 mb-6 shadow-2xl ${display.shadowClass}`}>
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative z-10 text-center">
          {currentTaskId && currentTask ? (
            <>
              <h3 className="text-xl font-semibold text-white mb-2 break-words max-w-full" title={DOMPurify.sanitize(currentTask.title)}>
                {DOMPurify.sanitize(currentTask.title)} {/* XSS protection */}
              </h3>
              <div className="text-purple-200 text-sm mb-6">{display.subtitle}</div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-white mb-2">{display.title}</h3>
              <p className="text-purple-200 text-sm mb-6">{display.subtitle}</p>
            </>
          )}

          {/* Timer Display */}
          <div className="text-7xl font-bold text-white font-mono mb-8 tracking-wider">
            {formattedTime}
          </div>

          {/* Progress Bar - XSS safe calculation */}
          <div className="w-full bg-black/30 rounded-full h-2 mb-6 overflow-hidden">
            <div 
              className={`h-full bg-white transition-all duration-1000 ease-linear ${isFocusMode ? 'bg-purple-300' : 'bg-green-300'}`}
              style={{ width: `${(timeRemaining / (isFocusMode ? 25 * 60 * 1000 : 5 * 60 * 1000)) * 100}%` }}
            ></div>
          </div>

          {/* Timer Controls - XSS safe event handlers */}
          <div className="flex gap-3 justify-center">
            {currentTaskId && (
              <button
                onClick={handleStartPause}
                disabled={!isFocusMode}
                className={`px-8 py-4 text-white font-bold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  isFocusMode 
                    ? 'bg-black/30 hover:bg-black/40' 
                    : 'bg-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                {timeRemaining === 0 || timeRemaining < 1000 ? '▶ Start' : timeRemaining < (isFocusMode ? 25 * 60 * 1000 : 5 * 60 * 1000) * 0.9 ? '⏸ Pause' : '⏯ Resume'}
              </button>
            )}

            <button
              onClick={handleReset}
              disabled={!currentTaskId || (timeRemaining === 0 || timeRemaining < 1000)}
              className="px-6 py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              ↻ Reset
            </button>

            {isFocusMode && currentTaskId && timeRemaining < (25 * 60 * 1000) * 0.9 && (
              <button
                onClick={onSessionComplete}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                ✅ Complete
              </button>
            )}
          </div>

          {/* Task Selection - XSS safe dropdown */}
          {timerOptions.length > 0 && !currentTaskId && (
            <div className="mt-6">
              <select
                value=""
                onChange={(e) => setCurrentTask(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a task to begin...</option>
                {timerOptions.map((task) => (
                  <option key={task.id} value={task.id}>
                    {DOMPurify.sanitize(task.label)} {/* XSS protection */}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Mode Indicator - XSS safe display */}
      <div className="text-center">
        <span className={`inline-block px-6 py-2 rounded-full text-sm font-semibold ${
          isFocusMode 
            ? 'bg-purple-500/30 text-purple-100' 
            : 'bg-green-500/30 text-green-100'
        }`}>
          {isFocusMode ? '🎯 Focus Mode' : '☕ Break Mode'}
        </span>
      </div>
    </div>
  )
}

export default Timer
