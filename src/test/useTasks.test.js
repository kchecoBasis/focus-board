import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTasks } from '../hooks/useTasks'

describe('useTasks', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with empty tasks when localStorage is empty', () => {
    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks).toEqual([])
  })

  it('initializes with tasks stored in localStorage', () => {
    const storedTasks = [
      { id: 'abc', title: 'Existing task', completedSessions: 0, completed: false, createdAt: '2026-01-01' },
    ]
    localStorage.setItem('focusboard-tasks', JSON.stringify(storedTasks))
    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Existing task')
  })

  it('falls back to empty array on invalid localStorage data', () => {
    localStorage.setItem('focusboard-tasks', 'not-json')
    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks).toEqual([])
  })

  it('addTask creates a new task with correct shape', () => {
    const { result } = renderHook(() => useTasks())
    act(() => { result.current.addTask('My new task') })
    expect(result.current.tasks).toHaveLength(1)
    const task = result.current.tasks[0]
    expect(task.title).toBe('My new task')
    expect(task.completed).toBe(false)
    expect(task.completedSessions).toBe(0)
    expect(task.id).toBeDefined()
    expect(task.createdAt).toBeDefined()
  })

  it('addTask appends tasks in order', () => {
    const { result } = renderHook(() => useTasks())
    act(() => { result.current.addTask('Task A') })
    act(() => { result.current.addTask('Task B') })
    expect(result.current.tasks[0].title).toBe('Task A')
    expect(result.current.tasks[1].title).toBe('Task B')
  })

  it('completeTask toggles completed status', () => {
    const { result } = renderHook(() => useTasks())
    act(() => { result.current.addTask('Toggle me') })
    const id = result.current.tasks[0].id

    act(() => { result.current.completeTask(id) })
    expect(result.current.tasks[0].completed).toBe(true)

    act(() => { result.current.completeTask(id) })
    expect(result.current.tasks[0].completed).toBe(false)
  })

  it('deleteTask removes the task', () => {
    const { result } = renderHook(() => useTasks())
    act(() => { result.current.addTask('Delete me') })
    const id = result.current.tasks[0].id

    act(() => { result.current.deleteTask(id) })
    expect(result.current.tasks).toHaveLength(0)
  })

  it('deleteTask only removes the targeted task', () => {
    const { result } = renderHook(() => useTasks())
    act(() => { result.current.addTask('Keep me') })
    act(() => { result.current.addTask('Remove me') })
    const removeId = result.current.tasks[1].id

    act(() => { result.current.deleteTask(removeId) })
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Keep me')
  })

  it('updateTaskSessions increments completedSessions', () => {
    const { result } = renderHook(() => useTasks())
    act(() => { result.current.addTask('Session task') })
    const id = result.current.tasks[0].id

    act(() => { result.current.updateTaskSessions(id) })
    expect(result.current.tasks[0].completedSessions).toBe(1)

    act(() => { result.current.updateTaskSessions(id) })
    expect(result.current.tasks[0].completedSessions).toBe(2)
  })

  it('persists tasks to localStorage on change', () => {
    const { result } = renderHook(() => useTasks())
    act(() => { result.current.addTask('Persist me') })
    const stored = JSON.parse(localStorage.getItem('focusboard-tasks'))
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe('Persist me')
  })
})
