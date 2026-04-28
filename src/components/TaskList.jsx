import { useCallback } from 'react'
import DOMPurify from 'dompurify'

function TaskItem({ task, isSelected, onSelect, onToggle, onDelete }) {
  return (
    <li className={`group flex items-center justify-between p-4 mb-3 rounded-xl transition-all duration-200 ${
      isSelected
        ? 'bg-purple-600/80 shadow-lg shadow-purple-500/30'
        : 'bg-white/10 hover:bg-white/20'
    }`}>
      <button
        onClick={() => onSelect(task.id)}
        className={`flex items-center gap-4 flex-1 text-left ${
          isSelected ? 'text-white' : 'text-gray-100 hover:text-white'
        }`}
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
            onToggle(task.id)
          }}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-green-500 border-green-500'
              : isSelected
                ? 'border-purple-300 hover:border-white'
                : 'border-gray-400 hover:border-white'
          }`}
        >
          {task.completed && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className={`text-lg ${task.completed ? 'line-through opacity-60' : ''}`}>
          {DOMPurify.sanitize(task.title)}
        </span>
      </button>

      <div className="flex items-center gap-4">
        <div className={`text-sm font-medium ${isSelected ? 'text-purple-200' : 'text-gray-300'}`}>
          🎯 {task.completedSessions} sessions
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
          aria-label={`Delete task ${DOMPurify.sanitize(task.title)}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </li>
  )
}

function TaskList({ tasks, newTaskTitle, setNewTaskTitle, handleAddTask, completeTask, deleteTask, currentTaskId, setCurrentTask }) {
  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (newTaskTitle.trim()) {
      handleAddTask(e)
    }
  }, [newTaskTitle, handleAddTask])

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span>📋</span>
        Tasks ({tasks.length})
      </h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(DOMPurify.sanitize(e.target.value))}
            placeholder="Add a new task..."
            aria-label="New task title"
            className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Add
          </button>
        </div>
      </form>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-purple-200">
          <p className="text-lg mb-2">No tasks yet</p>
          <p className="text-sm opacity-75">Add a task to start focusing!</p>
        </div>
      ) : (
        <ul className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  )
}

export default TaskList
