import { useMemo, useState } from 'react'

const STAT_CONFIG = [
  {
    key: 'totalSessions',
    label: 'Sessions',
    iconColor: 'text-purple-400',
    ringColor: 'ring-purple-500/40',
    bgColor: 'bg-purple-500/10',
    cardBorder: 'border-purple-500/20',
    valueColor: 'text-white',
    labelColor: 'text-purple-400',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
        <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'focusTimeMinutes',
    label: 'Focus min',
    iconColor: 'text-blue-400',
    ringColor: 'ring-blue-500/40',
    bgColor: 'bg-blue-500/10',
    cardBorder: 'border-blue-500/20',
    valueColor: 'text-white',
    labelColor: 'text-blue-400',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
        <line x1="12" y1="2" x2="12" y2="5" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="19" x2="12" y2="22" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="12" x2="5" y2="12" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="19" y1="12" x2="22" y2="12" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'breakTimeMinutes',
    label: 'Break min',
    iconColor: 'text-teal-400',
    ringColor: 'ring-teal-500/40',
    bgColor: 'bg-teal-500/10',
    cardBorder: 'border-teal-500/20',
    valueColor: 'text-white',
    labelColor: 'text-teal-400',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="6" y1="1" x2="6" y2="4" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="1" x2="10" y2="4" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="1" x2="14" y2="4" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'uniqueTasksCompleted',
    label: 'Tasks done',
    iconColor: 'text-pink-400',
    ringColor: 'ring-pink-500/40',
    bgColor: 'bg-pink-500/10',
    cardBorder: 'border-pink-500/20',
    valueColor: 'text-white',
    labelColor: 'text-pink-400',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
        <path d="M9 12l2 2 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

function StatCard({ config, value }) {
  const { Icon } = config
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-4 py-5 text-center ${config.bgColor} ${config.cardBorder}`}
    >
      <div className={`${config.iconColor} ${config.ringColor} ring-1 rounded-full p-2 ${config.bgColor}`}>
        <Icon />
      </div>
      <span className={`text-3xl font-bold tabular-nums leading-none ${config.valueColor}`}>
        {value}
      </span>
      <span className={`text-xs font-semibold mt-0.5 ${config.labelColor}`}>
        {config.label}
      </span>
    </div>
  )
}

function Summary({ sessionHistory = [] }) {
  const [showAll, setShowAll] = useState(false)

  const stats = useMemo(() => {
    let focusTimeMinutes = 0
    let breakTimeMinutes = 0
    const uniqueTasks = new Set()
    sessionHistory.forEach((s) => {
      if (s.type === 'focus') focusTimeMinutes += 25
      else if (s.type === 'break') breakTimeMinutes += 5
      if (s.taskId) uniqueTasks.add(s.taskId)
    })
    return {
      totalSessions: sessionHistory.length,
      focusTimeMinutes,
      breakTimeMinutes,
      uniqueTasksCompleted: uniqueTasks.size,
    }
  }, [sessionHistory])

  const getTaskTitle = (taskId) => {
    try {
      const stored = localStorage.getItem('focusboard-tasks')
      if (!stored) return 'Unknown Task'
      const tasks = JSON.parse(stored)
      const task = tasks.find((t) => t.id === taskId)
      return task ? task.title : 'Unknown Task'
    } catch {
      return 'Unknown Task'
    }
  }

  const displayHistory = useMemo(() => {
    const rev = [...sessionHistory].reverse()
    return showAll ? rev : rev.slice(0, 8)
  }, [sessionHistory, showAll])

  return (
    <div className="bg-white/[0.06] backdrop-blur-md rounded-2xl border border-white/[0.08] shadow-xl p-5">
      {/* Section heading */}
      <h2 className="text-sm font-semibold text-white/50 mb-4">
        Focus Statistics
      </h2>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {STAT_CONFIG.map((cfg) => (
          <StatCard key={cfg.key} config={cfg} value={stats[cfg.key]} />
        ))}
      </div>

      {/* Session history */}
      {sessionHistory.length === 0 ? (
        <p className="text-center text-white/20 text-sm py-2">
          Complete your first session to see history here
        </p>
      ) : (
        <>
          <div className="border-t border-white/[0.07] pt-4">
            <h3 className="text-xs font-semibold text-white/30 mb-3">
              Recent Sessions
            </h3>
            <ul className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar" aria-label="Session history">
              {displayHistory.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between px-3.5 py-2 bg-white/[0.04] rounded-lg"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span aria-hidden="true" className="text-base flex-shrink-0">
                      {session.type === 'focus' ? '🎯' : '☕'}
                    </span>
                    <span className="text-white/70 text-sm truncate">{getTaskTitle(session.taskId)}</span>
                  </div>
                  <time className="text-white/30 text-xs ml-3 flex-shrink-0" dateTime={session.timestamp}>
                    {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </li>
              ))}
            </ul>
          </div>

          {sessionHistory.length > 8 && (
            <button
              onClick={() => setShowAll((p) => !p)}
              className="mt-3 w-full py-2 text-xs font-semibold text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition-all duration-150"
            >
              {showAll ? 'Show less' : `View all ${sessionHistory.length} sessions`}
            </button>
          )}
        </>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  )
}

export default Summary
