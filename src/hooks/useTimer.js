import { useState, useEffect, useCallback, useRef } from 'react'

const FOCUS_DURATION_MS = 25 * 60 * 1000
const BREAK_DURATION_MS = 5 * 60 * 1000
const POMODOROS_BEFORE_LONG_BREAK = 4

export function useTimer(initialTaskId) {
  const [timeRemaining, setTimeRemaining] = useState(FOCUS_DURATION_MS)
  const [isActive, setIsActive] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(true)
  const [currentTaskId, setCurrentTaskId] = useState(initialTaskId || null)
  const [pomodoroCount, setPomodoroCount] = useState(0)

  const prevFocusModeRef = useRef(true)

  // Track completed pomodoros when focus session finishes (focus→break flip)
  useEffect(() => {
    if (prevFocusModeRef.current && !isFocusMode) {
      setPomodoroCount((c) => c + 1)
    }
    prevFocusModeRef.current = isFocusMode
  }, [isFocusMode])

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1000)
      }, 1000)
      return () => clearInterval(timer)
    } else if (isActive && timeRemaining === 0) {
      setIsActive(false)
      setIsFocusMode((prev) => {
        setTimeRemaining(prev ? BREAK_DURATION_MS : FOCUS_DURATION_MS)
        return !prev
      })
    }
  }, [isActive, timeRemaining])

  // Focus mode requires a selected task; break mode can start freely
  const startTimer = useCallback(() => {
    if (isFocusMode && !currentTaskId) return
    setIsActive(true)
  }, [isFocusMode, currentTaskId])

  const pauseTimer = useCallback(() => {
    setIsActive(false)
  }, [])

  const resumeTimer = useCallback(() => {
    if (isFocusMode && !currentTaskId) return
    setIsActive(true)
  }, [isFocusMode, currentTaskId])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    setIsFocusMode(true)
    setTimeRemaining(FOCUS_DURATION_MS)
  }, [])

  const setCurrentTask = useCallback((taskId) => {
    setCurrentTaskId(taskId)
    setIsActive(false)
    setIsFocusMode(true)
    setTimeRemaining(FOCUS_DURATION_MS)
  }, [])

  return {
    timeRemaining,
    isActive,
    isFocusMode,
    currentTaskId,
    pomodoroCount,
    pomodorosBeforeLongBreak: POMODOROS_BEFORE_LONG_BREAK,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setCurrentTask,
  }
}
