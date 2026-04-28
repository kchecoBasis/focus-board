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
    
    // XSS-safe: sanitize user inputs before processing
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
    setIsExpanded(!isExpanded)
    // Focus appropriate field when expanded
    setTimeout(() => {
      if (!isExpanded && inputRef.current) {
        inputRef.current.focus()
      } else if (isExpanded && descRef.current) {
        descRef.current.focus()
      }
    }, 0)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2 items-start">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
        />
        
        <button
          type="button"
          onClick={toggleExpand}
          className={`px-4 py-3 rounded-lg border transition-all duration-200 ${
            isExpanded 
              ? 'bg-purple-600/80 border-purple-400 text-white' 
              : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:text-white'
          }`}
        >
          {isExpanded ? '→' : '+'}
        </button>
      </div>

      {/* Expanded view with description */}
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <textarea
          ref={descRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description (optional)..."
          rows="2"
          className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200 resize-none"
        />
        
        <div className="mt-3 flex gap-2">
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              inputValue.trim()
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
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
            className="px-6 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <p className="text-sm text-purple-300 mt-2">
        Press Enter to add a task, or use the + button for more options
      </p>
    </form>
  )
}

export default TaskForm
