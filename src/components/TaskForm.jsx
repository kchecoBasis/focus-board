import { useState, useRef } from 'react'
import DOMPurify from 'dompurify'
import { useTaskContext } from '../context/TaskContext'

function TaskForm() {
  const [inputValue, setInputValue] = useState('')
  const [description, setDescription] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef(null)
  const descRef = useRef(null)
  const { addTask } = useTaskContext()

  const handleSubmit = (e) => {
    e.preventDefault()
    const safeTitle = DOMPurify.sanitize(inputValue.trim())
    const safeDesc = DOMPurify.sanitize(description.trim())
    if (safeTitle) {
      addTask(safeTitle, safeDesc)
      setInputValue('')
      setDescription('')
      setIsExpanded(false)
    }
  }

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev)
    setTimeout(() => {
      if (!isExpanded && inputRef.current) inputRef.current.focus()
      else if (isExpanded && descRef.current) descRef.current.focus()
    }, 0)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2 items-center">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.08] text-white text-sm placeholder-white/30 border border-white/[0.12] focus:border-purple-400/60 focus:ring-1 focus:ring-purple-500/40 outline-none transition-all duration-200"
        />
        <button
          type="button"
          onClick={toggleExpand}
          aria-label={isExpanded ? 'Collapse form' : 'Expand for description'}
          className={`w-10 h-10 rounded-xl border text-lg font-light transition-all duration-200 flex items-center justify-center flex-shrink-0 ${
            isExpanded
              ? 'bg-purple-600/60 border-purple-400/60 text-white'
              : 'bg-white/[0.08] border-white/[0.12] text-white/50 hover:bg-white/15 hover:text-white'
          }`}
        >
          {isExpanded ? '↑' : '+'}
        </button>
      </div>

      {/* Expandable description + submit */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-44 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <textarea
          ref={descRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description (optional)..."
          rows="2"
          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] text-white text-sm placeholder-white/30 border border-white/[0.12] focus:border-purple-400/60 focus:ring-1 focus:ring-purple-500/40 outline-none transition-all duration-200 resize-none"
        />
        <div className="mt-2.5 flex gap-2">
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              inputValue.trim()
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-500 hover:to-violet-500 shadow-md shadow-purple-500/20 hover:shadow-purple-500/30'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            Add Task
          </button>
          <button
            type="button"
            onClick={() => {
              setInputValue('')
              setDescription('')
              setIsExpanded(false)
            }}
            className="px-5 py-2 rounded-xl text-sm bg-white/[0.06] text-white/50 hover:bg-white/12 hover:text-white/80 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}

export default TaskForm
