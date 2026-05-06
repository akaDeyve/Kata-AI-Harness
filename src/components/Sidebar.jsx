export default function Sidebar({ tasks, selectedTaskId, onSelectTask }) {
  const groups = {}
  tasks.forEach(task => {
    if (!groups[task.group]) groups[task.group] = []
    groups[task.group].push(task)
  })

  const difficultyColors = {
    'Leicht': 'bg-green-600/30 text-green-400',
    'Mittel': 'bg-yellow-600/30 text-yellow-400',
    'Schwer': 'bg-red-600/30 text-red-400',
  }

  return (
    <div className="w-64 bg-[#252526] border-r border-[#3c3c3c] flex flex-col overflow-hidden select-none shrink-0">
      <div className="px-4 py-3 text-xs font-semibold text-[#bbbbbb] uppercase tracking-wider border-b border-[#3c3c3c] font-sans">
        Aufgaben
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {Object.entries(groups).map(([group, groupTasks]) => (
          <div key={group}>
            <div className="px-4 py-2 text-[11px] font-semibold text-[#858585] uppercase font-sans">
              {group}
            </div>
            {groupTasks.map(task => (
              <button
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 font-sans ${
                  selectedTaskId === task.id
                    ? 'bg-[#37373d] text-white border-l-2 border-[#007acc]'
                    : 'text-[#cccccc] hover:bg-[#2a2a2d] border-l-2 border-transparent'
                }`}
              >
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${difficultyColors[task.difficulty] || 'bg-gray-600/30 text-gray-400'}`}>
                  {task.difficulty}
                </span>
                <span className="truncate">{task.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
