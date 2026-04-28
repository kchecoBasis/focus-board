import { useState, useEffect, useCallback } from 'react'

const FOCUS_DURATION = 25 * 60 // 25 minutes in seconds
const BREAK_DURATION = 5 * 60 // 5 minutes in seconds

export function useTimer(initialTaskId) {
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION)
  const [isActive, setIsActive] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(true)
  const [currentTaskId, setCurrentTaskId] = useState(initialTaskId || null)

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0) {
      setIsActive(false)
      // Toggle between focus and break mode
      setIsFocusMode((prev) => !prev)
      setTimeLeft(prevIsFocusMode => prevIsFocusMode ? BREAK_DURATION : FOCUS_DURATION)
    }
  }, [isActive, timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = useCallback(() => {
    if (currentTaskId) {
      setIsActive(true)
    }
  }, [currentTaskId])

  const pauseTimer = useCallback(() => {
    setIsActive(false)
  }, [])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    setIsFocusMode(true)
    setTimeLeft(FOCUS_DURATION)
  }, [])

  const setCurrentTask = useCallback((taskId) => {
    setCurrentTaskId(taskId)
    setIsActive(false)
    setIsFocusMode(true)
    setTimeLeft(FOCUS_DURATION)
  }, [])

  return {
    timeLeft,
    formatTime,
    isActive,
    isFocusMode,
    currentTaskId,
    startTimer,
    pauseTimer,
    resetTimer,
    setCurrentTask,
  }
}
