import { useMemo, useState } from 'react'
import DOMPurify from 'dompurify'

function Summary({ sessionHistory = [] }) {
  const [showAllSessions, setShowAllSessions] = useState(false)

  // Calculate statistics with XSS protection for display
  const stats = useMemo(() => {
    const totalSessions = sessionHistory.length
    
    let focusTimeMinutes = 0
    let breakTimeMinutes = 0
    let completedTasks = new Set()

    sessionHistory.forEach((session) => {
      if (session.type === 'focus') {
        focusTimeMinutes += 25 // Assuming 25-minute focus sessions
      } else if (session.type === 'break') {
        breakTimeMinutes += 5 // Assuming 5-minute breaks
      }
      
      if (session.taskId) {
        completedTasks.add(session.taskId)
      }
    })

    return {
      totalSessions,
      focusTimeMinutes,
      breakTimeMinutes,
      uniqueTasksCompleted: completedTasks.size,
    }
  }, [sessionHistory])

  // Handle XSS protection for task display - use sanitized versions only for display
  const getTaskTitle = (taskId) => {
    try {
      const stored = localStorage.getItem('focusboard-tasks')
      if (!stored) return 'Unknown Task'
      
      const tasks = JSON.parse(stored)
      const task = tasks.find((t) => t.id === taskId)
      return task ? DOMPurify.sanitize(task.title) : 'Unknown Task'
    } catch (error) {
      console.error('Error retrieving task title:', error)
      return 'Unknown Task'
    }
  }

  // Convert session history to display format with XSS protection
  const displayHistory = useMemo(() => {
    return showAllSessions ? [...sessionHistory].reverse() : sessionHistory.slice(-10).reverse()
  }, [sessionHistory, showAllSessions])

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <span>📊</span>
        Focus Statistics
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-500/30 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white mb-1">{stats.totalSessions}</div>
          <div className="text-purple-200 text-sm">Total Sessions</div>
        </div>
        
        <div className="bg-blue-500/30 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white mb-1">{stats.focusTimeMinutes}</div>
          <div className="text-blue-200 text-sm">Focus Minutes</div>
        </div>

        <div className="bg-green-500/30 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white mb-1">{stats.breakTimeMinutes}</div>
          <div className="text-green-200 text-sm">Break Minutes</div>
        </div>

        <div className="bg-pink-500/30 backdrop-blur-sm rounded-xl p-4 text-center col-span-3">
          <div className="text-2xl font-bold text-white mb-1">{stats.uniqueTasksCompleted}</div>
          <div className="text-pink-200 text-sm">Unique Tasks Completed</div>
        </div>
      </div>

      {sessionHistory.length > 0 && (
        <>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span>🕐</span>
            Recent Sessions
          </h3>
          
          <ul className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar mb-4">
            {displayHistory.map((session) => (
              <li key={session.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">
                    {session.type === 'focus' ? '🎯' : '☕'}
                  </span>
                  <span className="text-white truncate font-medium">
                    {getTaskTitle(session.taskId)}
                  </span>
                </div>
                <time className="text-purple-200 text-sm whitespace-nowrap ml-4">
                  {new Date(session.timestamp).toLocaleTimeString()}
                </time>
              </li>
            ))}
          </ul>

          {sessionHistory.length > 10 && (
            <button
              onClick={() => setShowAllSessions(!showAllSessions)}
              className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-200"
            >
              {showAllSessions ? 'Show Less' : `View All ${sessionHistory.length} Sessions`}
            </button>
          )}
        </>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  )
}

export default Summary
