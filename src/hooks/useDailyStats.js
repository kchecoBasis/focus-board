import { useMemo } from 'react'

export function useDailyStats(tasks, sessionHistory) {
  return useMemo(() => {
    const today = new Date().toDateString()
    
    let totalSessionsToday = 0
    let totalTimeToday = 0

    tasks.forEach((task) => {
      if (task.completedSessions > 0) {
        // Estimate sessions completed today based on sessionHistory
        const taskSessions = sessionHistory.filter(
          (session) =>
            session.taskId === task.id &&
            new Date(session.timestamp).toDateString() === today
        )
        totalSessionsToday += taskSessions.length
        
        // Each focus session is 25 minutes
        totalTimeToday += taskSessions.length * 25
      }
    })

    return {
      totalSessionsToday,
      totalTimeToday,
    }
  }, [tasks, sessionHistory])
}
