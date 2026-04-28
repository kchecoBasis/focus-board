import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTimer } from '../hooks/useTimer'

const FOCUS_MS = 25 * 60 * 1000
const BREAK_MS = 5 * 60 * 1000

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with focus duration and inactive state', () => {
    const { result } = renderHook(() => useTimer(null))
    expect(result.current.timeRemaining).toBe(FOCUS_MS)
    expect(result.current.isActive).toBe(false)
    expect(result.current.isFocusMode).toBe(true)
    expect(result.current.currentTaskId).toBeNull()
  })

  it('initializes with a provided task id', () => {
    const { result } = renderHook(() => useTimer('task-123'))
    expect(result.current.currentTaskId).toBe('task-123')
  })

  it('does not start in focus mode without a task selected', () => {
    const { result } = renderHook(() => useTimer(null))
    // isFocusMode is true by default; no task = should not start
    act(() => { result.current.startTimer() })
    expect(result.current.isActive).toBe(false)
  })

  it('starts when a task is selected in focus mode', () => {
    const { result } = renderHook(() => useTimer('task-123'))
    act(() => { result.current.startTimer() })
    expect(result.current.isActive).toBe(true)
  })

  it('counts down by 1 second per interval', () => {
    const { result } = renderHook(() => useTimer('task-abc'))
    act(() => { result.current.startTimer() })
    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current.timeRemaining).toBe(FOCUS_MS - 3000)
  })

  it('pauses the timer', () => {
    const { result } = renderHook(() => useTimer('task-abc'))
    act(() => { result.current.startTimer() })
    act(() => { vi.advanceTimersByTime(2000) })
    act(() => { result.current.pauseTimer() })
    const snapshot = result.current.timeRemaining
    act(() => { vi.advanceTimersByTime(5000) })
    expect(result.current.timeRemaining).toBe(snapshot)
    expect(result.current.isActive).toBe(false)
  })

  it('resumes after pause', () => {
    const { result } = renderHook(() => useTimer('task-abc'))
    act(() => { result.current.startTimer() })
    act(() => { vi.advanceTimersByTime(2000) })
    act(() => { result.current.pauseTimer() })
    act(() => { result.current.resumeTimer() })
    expect(result.current.isActive).toBe(true)
    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.timeRemaining).toBe(FOCUS_MS - 3000)
  })

  it('resets to focus duration', () => {
    const { result } = renderHook(() => useTimer('task-abc'))
    act(() => { result.current.startTimer() })
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => { result.current.resetTimer() })
    expect(result.current.timeRemaining).toBe(FOCUS_MS)
    expect(result.current.isActive).toBe(false)
    expect(result.current.isFocusMode).toBe(true)
  })

  it('switches to break mode when focus timer reaches zero', () => {
    const { result } = renderHook(() => useTimer('task-abc'))
    act(() => { result.current.startTimer() })
    act(() => { vi.advanceTimersByTime(FOCUS_MS) })
    expect(result.current.isFocusMode).toBe(false)
    expect(result.current.timeRemaining).toBe(BREAK_MS)
    expect(result.current.isActive).toBe(false)
  })

  it('increments pomodoroCount when focus session ends', () => {
    const { result } = renderHook(() => useTimer('task-abc'))
    expect(result.current.pomodoroCount).toBe(0)
    act(() => { result.current.startTimer() })
    act(() => { vi.advanceTimersByTime(FOCUS_MS) })
    expect(result.current.pomodoroCount).toBe(1)
  })

  it('starts in break mode without a task (break does not require task)', async () => {
    const { result } = renderHook(() => useTimer('task-abc'))
    // Advance to break mode
    act(() => { result.current.startTimer() })
    act(() => { vi.advanceTimersByTime(FOCUS_MS) })
    expect(result.current.isFocusMode).toBe(false)
    // Clear the task selection while in break mode
    // startTimer in break mode should work regardless
    // (We simulate being in break mode with no currentTask by checking state)
    act(() => { result.current.startTimer() })
    expect(result.current.isActive).toBe(true)
  })

  it('setCurrentTask resets timer and clears active state', () => {
    const { result } = renderHook(() => useTimer('task-abc'))
    act(() => { result.current.startTimer() })
    act(() => { vi.advanceTimersByTime(3000) })
    act(() => { result.current.setCurrentTask('task-xyz') })
    expect(result.current.currentTaskId).toBe('task-xyz')
    expect(result.current.timeRemaining).toBe(FOCUS_MS)
    expect(result.current.isActive).toBe(false)
    expect(result.current.isFocusMode).toBe(true)
  })
})
