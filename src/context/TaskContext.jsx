import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useTimer } from '../hooks/useTimer'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const { tasks, addTask, completeTask, deleteTask, updateTaskSessions } = useTasks()
  const [sessionHistory, setSessionHistory] = useState([])
  
  const addSession = useCallback((taskId, type = 'focus') => {
    const session = {
      id: Date.now(),
      taskId,
      type,
      timestamp: new Date().toISOString(),
    }
    setSessionHistory((prev) => [...prev, session])
    if (type === 'focus' && taskId) {
      updateTaskSessions(taskId)
    }
  }, [updateTaskSessions])

  const timerState = useTimer(null)

  const contextValue = useMemo(() => ({
    tasks,
    addTask,
    completeTask,
    deleteTask,
    updateTaskSessions,
    sessionHistory,
    addSession,
    timerState,
  }), [tasks, addTask, completeTask, deleteTask, updateTaskSessions, sessionHistory, addSession, timerState])

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider')
  }
  return context
}

export default TaskContext
