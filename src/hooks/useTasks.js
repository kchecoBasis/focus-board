import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'focusboard-tasks'

export function useTasks() {
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to parse tasks from localStorage:', error)
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. Cannot save tasks.')
      } else {
        console.error('Failed to save tasks to localStorage:', error)
      }
    }
  }, [tasks])

  const addTask = useCallback((title, description = '') => {
    const newTask = {
      id: uuidv4(),
      title,
      description,
      completedSessions: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
    return newTask
  }, [])

  const completeTask = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    )
  }, [])

  const deleteTask = useCallback((taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }, [])

  const updateTaskSessions = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completedSessions: task.completedSessions + 1 } : task
      )
    )
  }, [])

  return { tasks, addTask, completeTask, deleteTask, updateTaskSessions }
}
