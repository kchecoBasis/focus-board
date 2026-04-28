import { createContext, useContext, useMemo } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useTimer } from '../hooks/useTimer'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const { tasks, addTask, completeTask, deleteTask, updateTaskSessions } = useTasks()
  
  // Initialize timer with first task ID if available
  const initialTaskId = tasks.length > 0 ? tasks[0].id : null
  const timerState = useTimer(initialTaskId)

  const contextValue = useMemo(() => ({
    tasks,
    addTask,
    completeTask,
    deleteTask,
    updateTaskSessions,
    timerState,
  }), [tasks, addTask, completeTask, deleteTask, updateTaskSessions, timerState])

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
