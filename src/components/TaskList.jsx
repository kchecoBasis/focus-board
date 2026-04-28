import { useTaskContext } from '../context/TaskContext'
import DOMPurify from 'dompurify'

function SessionPips({ count }) {
  const MAX = 8
  const show = Math.min(count, MAX)
  return (
    <div
      className="flex items-center gap-1 mt-1.5"
      aria-label={`${count} completed session${count !== 1 ? 's' : ''}`}
    >
      {Array.from({ length: show }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400/70" />
      ))}
      {count > MAX && (
        <span className="text-purple-400/60 text-[10px] ml-0.5">+{count - MAX}</span>
      )}
    </div>
  )
}

function TaskItem({ task, isSelected, onSelect, onToggle, onDelete }) {
  const safeTitle = DOMPurify.sanitize(task.title)
  const safeDesc = task.description ? DOMPurify.sanitize(task.description) : ''

  return (
    <li
      className={`group flex items-start justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${
        isSelected
          ? 'bg-purple-600/25 ring-1 ring-purple-500/40 shadow-md shadow-purple-900/30'
          : 'bg-white/[0.04] hover:bg-white/[0.07]'
      }`}
    >
      {/* Completion toggle + content */}
      <button
        onClick={() => onSelect(task.id)}
        className="flex items-start gap-3 flex-1 text-left min-w-0"
        aria-pressed={isSelected}
        aria-label={`Select task: ${safeTitle}`}
      >
        {/* Circle checkbox */}
        <div
          role="checkbox"
          aria-checked={task.completed}
          aria-label={`Mark "${safeTitle}" as ${task.completed ? 'incomplete' : 'complete'}`}
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onToggle(task.id) }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault(); e.stopPropagation(); onToggle(task.id)
            }
          }}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500'
              : isSelected
                ? 'border-purple-300/70 hover:border-white'
                : 'border-white/25 hover:border-white/60'
          }`}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <span
            className={`text-[0.9rem] font-medium leading-snug block truncate ${
              task.completed
                ? 'text-white/30 line-through'
                : isSelected
                  ? 'text-white'
                  : 'text-white/85'
            }`}
          >
            {safeTitle}
          </span>
          {safeDesc && (
            <span className="text-xs text-white/35 block truncate mt-0.5">{safeDesc}</span>
          )}
          {task.completedSessions > 0 && (
            <SessionPips count={task.completedSessions} />
          )}
        </div>
      </button>

      {/* Delete button */}
      <button
        onClick={() => onDelete(task.id)}
        aria-label={`Delete task: ${safeTitle}`}
        className="ml-2 mt-0.5 flex-shrink-0 p-1.5 rounded-lg text-white/25 hover:text-red-300 hover:bg-red-500/15 transition-all duration-150 focus-visible:ring-1 focus-visible:ring-red-400"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </li>
  )
}

function TaskList() {
  const { tasks, completeTask, deleteTask, timerState } = useTaskContext()
  const { currentTaskId, setCurrentTask } = timerState
  const remaining = tasks.filter((t) => !t.completed).length

  return (
    <div className="bg-white/[0.06] backdrop-blur-md rounded-2xl shadow-xl border border-white/[0.08] flex flex-col min-h-[480px] lg:min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07]">
        <svg className="w-5 h-5 text-white/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h2 className="text-base font-bold text-white tracking-tight">Tasks</h2>
        <span className="text-white/30 font-light">|</span>
        <span className="text-sm text-white/50 font-medium">{remaining} remaining</span>
      </div>

      {/* Task list body */}
      <div className="flex-1 overflow-y-auto px-3 py-3 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="text-4xl mb-3 opacity-30">📝</div>
            <p className="text-white/30 text-sm font-medium">No tasks yet</p>
            <p className="text-white/20 text-xs mt-1">Add one to start your first Pomodoro</p>
          </div>
        ) : (
          <ul className="space-y-1.5" role="list">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={currentTaskId === task.id}
                onSelect={setCurrentTask}
                onToggle={completeTask}
                onDelete={deleteTask}
              />
            ))}
          </ul>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  )
}

export default TaskList
