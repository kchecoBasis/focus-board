import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TaskProvider } from '../context/TaskContext'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import Summary from '../components/Summary'

const Wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>

// ─── TaskForm ─────────────────────────────────────────────────────────────────

describe('TaskForm', () => {
  beforeEach(() => localStorage.clear())

  it('renders the main input field', () => {
    render(<TaskForm />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument()
  })

  it('shows the expand (+) button', () => {
    render(<TaskForm />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: 'Expand for description' })).toBeInTheDocument()
  })

  it('submits on Enter and clears input', async () => {
    const user = userEvent.setup()
    render(<TaskForm />, { wrapper: Wrapper })
    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'My test task{Enter}')
    expect(input.value).toBe('')
  })

  it('does not submit empty input', async () => {
    const user = userEvent.setup()
    render(<TaskForm />, { wrapper: Wrapper })
    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, '   {Enter}')
    expect(input.value.trim()).toBe('')
  })

  it('expands description panel when + is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskForm />, { wrapper: Wrapper })
    await user.click(screen.getByRole('button', { name: 'Expand for description' }))
    expect(screen.getByPlaceholderText('Add a description (optional)...')).toBeInTheDocument()
  })

  it('Cancel button clears state and collapses form', async () => {
    const user = userEvent.setup()
    render(<TaskForm />, { wrapper: Wrapper })
    await user.click(screen.getByRole('button', { name: 'Expand for description' }))
    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Some text')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(input.value).toBe('')
  })
})

// ─── TaskList ─────────────────────────────────────────────────────────────────

describe('TaskList', () => {
  beforeEach(() => localStorage.clear())

  it('renders empty state message when no tasks exist', () => {
    render(<TaskList />, { wrapper: Wrapper })
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('renders the Tasks heading', () => {
    render(<TaskList />, { wrapper: Wrapper })
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  it('shows tasks added via TaskForm sibling context', async () => {
    const user = userEvent.setup()
    render(
      <Wrapper>
        <TaskForm />
        <TaskList />
      </Wrapper>
    )
    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Context task{Enter}')
    expect(await screen.findByText('Context task')).toBeInTheDocument()
  })

  it('shows remaining count for incomplete tasks', async () => {
    const user = userEvent.setup()
    render(
      <Wrapper>
        <TaskForm />
        <TaskList />
      </Wrapper>
    )
    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Task A{Enter}')
    await user.type(input, 'Task B{Enter}')
    expect(await screen.findByText('2 remaining')).toBeInTheDocument()
  })
})

// ─── Summary ──────────────────────────────────────────────────────────────────

describe('Summary', () => {
  it('renders zero stats when sessionHistory is empty', () => {
    render(<Summary sessionHistory={[]} />)
    expect(screen.getByText('Focus Statistics')).toBeInTheDocument()
    const statNumbers = screen.getAllByText('0')
    expect(statNumbers.length).toBeGreaterThanOrEqual(3)
  })

  it('calculates focus time correctly', () => {
    const sessions = [
      { id: 1, taskId: 'a', type: 'focus', timestamp: new Date().toISOString() },
      { id: 2, taskId: 'a', type: 'focus', timestamp: new Date().toISOString() },
    ]
    render(<Summary sessionHistory={sessions} />)
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('calculates break time correctly', () => {
    const sessions = [
      { id: 1, taskId: 'a', type: 'break', timestamp: new Date().toISOString() },
    ]
    render(<Summary sessionHistory={sessions} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('counts unique tasks', () => {
    const sessions = [
      { id: 1, taskId: 'task-a', type: 'focus', timestamp: new Date().toISOString() },
      { id: 2, taskId: 'task-a', type: 'focus', timestamp: new Date().toISOString() },
      { id: 3, taskId: 'task-b', type: 'focus', timestamp: new Date().toISOString() },
    ]
    render(<Summary sessionHistory={sessions} />)
    expect(screen.getByText('Tasks done')).toBeInTheDocument()
  })

  it('shows Recent Sessions section when history is not empty', () => {
    const sessions = [
      { id: 1, taskId: 'a', type: 'focus', timestamp: new Date().toISOString() },
    ]
    render(<Summary sessionHistory={sessions} />)
    expect(screen.getByText('Recent Sessions')).toBeInTheDocument()
  })

  it('does not show Recent Sessions when history is empty', () => {
    render(<Summary sessionHistory={[]} />)
    expect(screen.queryByText('Recent Sessions')).not.toBeInTheDocument()
  })

  it('shows View All button when more than 10 sessions', () => {
    const sessions = Array.from({ length: 11 }, (_, i) => ({
      id: i,
      taskId: 'a',
      type: 'focus',
      timestamp: new Date().toISOString(),
    }))
    render(<Summary sessionHistory={sessions} />)
    expect(screen.getByText(/View all 11 sessions/i)).toBeInTheDocument()
  })
})
