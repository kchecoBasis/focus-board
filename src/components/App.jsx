import { useTaskContext } from '../context/TaskContext'
import TaskForm from './TaskForm'
import TaskList from './TaskList'
import Timer from './Timer'
import Summary from './Summary'

function App() {
  const { tasks, timerState, deleteTask } = useTaskContext()
  const { isFocusMode } = timerState

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Header - XSS safe display */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎯 Focus Board</h1>
          <p className="text-purple-200">Stay focused, take breaks, get things done!</p>
        </header>

        {/* Timer Section */}
        <div className="mb-8">
          <Timer timerState={timerState} tasks={tasks} onSessionComplete={() => {}} />
        </div>

        {/* Task Management Section - XSS safe display */}
        <TaskForm />

        {tasks.length > 0 && (
          <div className="mt-6">
            <TaskList
              tasks={tasks}
              newTaskTitle=""
              setNewTaskTitle={() => {}}
              handleAddTask={() => {}}
              completeTask={timerState.setCurrentTask}
              deleteTask={deleteTask}
              currentTaskId={timerState.currentTaskId}
              setCurrentTask={timerState.setCurrentTask}
            />
          </div>
        )}

        {/* Summary Statistics - XSS safe */}
        <Summary />
      </div>
    </div>
  )
}

export default App
