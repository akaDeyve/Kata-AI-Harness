import { Brackets, ShieldCheck, Layout, Cloud } from './Icons'

const GROUP_ICONS = {
  'Array-Operationen': <Brackets size={15} />,
  'Sicherer Datenzugriff': <ShieldCheck size={15} />,
  'Rendering-Muster': <Layout size={15} />,
  'API & State': <Cloud size={15} />,
}

const dotColors = {
  'Leicht': 'bg-[#a8e6cf]',
  'Mittel': 'bg-[#ffd3b6]',
  'Schwer': 'bg-[#ffaaa5]',
}

const pillClasses = {
  'Leicht': 'bg-[#a8e6cf18] text-[#a8e6cf]',
  'Mittel': 'bg-[#ffd3b618] text-[#ffd3b6]',
  'Schwer': 'bg-[#ffaaa518] text-[#ffaaa5]',
}

export default function Sidebar({ tasks, selectedTaskId, onSelectTask, collapsed, onToggleCollapse }) {
  const groups = {}
  tasks.forEach(t => { if (!groups[t.group]) groups[t.group] = []; groups[t.group].push(t) })

  return (
    <div className={`flex flex-col overflow-hidden select-none shrink-0 border-r border-borderc bg-s1 transition-[width,min-width] duration-200 ${collapsed ? 'w-12 min-w-[48px]' : 'w-[220px] min-w-[220px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between h-[52px] px-3.5 border-b border-borderc shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-[26px] h-[26px] bg-accent rounded-[6px] flex items-center justify-center flex-shrink-0 text-[13px] font-bold text-white tracking-tight">CL</div>
            <span className="text-[13px] font-semibold text-text tracking-wide whitespace-nowrap">CodeLab</span>
          </div>
        )}
        <button onClick={onToggleCollapse} className={`w-[26px] h-[26px] rounded-[6px] border border-border2 bg-transparent text-t2 flex items-center justify-center flex-shrink-0 hover:bg-s3 hover:text-text transition-all ${collapsed ? 'mx-auto' : ''}`} title="Sidebar einklappen">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          {Object.entries(groups).map(([group, gTasks]) => (
            <div key={group} className="mb-1">
              <div className="text-[9.5px] font-semibold tracking-[0.12em] uppercase text-t3 px-3.5 pt-3 pb-1">{group}</div>
              {gTasks.map(task => (
                <button key={task.id} onClick={() => onSelectTask(task.id)}
                  className={`flex items-center gap-2.5 w-full px-3.5 py-[7px] text-left cursor-pointer transition-colors relative whitespace-nowrap ${
                    selectedTaskId === task.id ? 'bg-accent-dim text-text' : 'text-t2 hover:bg-s2'
                  }`}>
                  {selectedTaskId === task.id && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent rounded-r-sm" />}
                  <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${dotColors[task.difficulty] || 'bg-t3'}`} />
                  <span className="text-xs truncate flex-1">{task.name}</span>
                  <span className={`text-[9px] font-semibold px-[7px] py-[2px] rounded-full flex-shrink-0 ${pillClasses[task.difficulty] || ''}`}>{task.difficulty === 'Leicht' ? 'Easy' : task.difficulty === 'Mittel' ? 'Mid' : 'Hard'}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Collapsed icon rail */}
      {collapsed && (
        <div className="flex flex-col items-center gap-0.5 py-2.5 flex-1 overflow-hidden">
          {Object.keys(groups).map((group, i) => (
            <div key={group} className="w-8 h-8 rounded-md flex items-center justify-center text-t3 cursor-pointer hover:bg-s3 transition-colors" title={group}>
              {GROUP_ICONS[group] || <span className="text-[10px] font-bold">{group[0]}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
