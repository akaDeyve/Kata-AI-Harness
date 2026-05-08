import { Brackets, Layout, Link, GitMerge } from './Icons'

const GROUP_ICONS = {
  'React Hooks': <Link size={15} />,
  'Props & Komponenten': <GitMerge size={15} />,
  'CSS & Styling': <Layout size={15} />,
  'Array-Operationen': <Brackets size={15} />,
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

export default function Sidebar({ tasks, selectedTaskId, onSelectTask, collapsed, onToggleCollapse, width, onWidthChange }) {
  const groups = {}
  tasks.forEach(t => { if (!groups[t.group]) groups[t.group] = []; groups[t.group].push(t) })

  const handleResize = (e) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = width
    const handleMouseMove = (ev) => {
      const newWidth = Math.max(160, Math.min(500, startWidth + (ev.clientX - startX)))
      onWidthChange(newWidth)
    }
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }
    document.body.style.cursor = 'col-resize'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="relative flex flex-col overflow-hidden select-none shrink-0 border-r border-borderc bg-s1" style={{ width: collapsed ? 48 : width, minWidth: collapsed ? 48 : 160 }}>
      {/* Header */}
      <div className="flex items-center justify-between h-[52px] px-3.5 border-b border-borderc shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 bg-accent rounded-[6px] flex items-center justify-center flex-shrink-0 text-sm font-bold text-white tracking-tight">CL</div>
            <span className="text-base font-semibold text-text tracking-wide whitespace-nowrap">CodeLab</span>
          </div>
        )}
        <button onClick={onToggleCollapse} className={`w-[26px] h-[26px] rounded-[6px] border border-border2 bg-transparent text-t2 flex items-center justify-center flex-shrink-0 hover:bg-s3 hover:text-text ${collapsed ? 'mx-auto' : ''}`} title="Sidebar einklappen">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          {Object.entries(groups).map(([group, gTasks]) => (
            <div key={group} className="mb-2">
              <div className="text-xs font-semibold tracking-[0.12em] uppercase text-t3 px-3.5 pt-4 pb-2">{group}</div>
              {gTasks.map(task => (
                <button key={task.id} onClick={() => onSelectTask(task.id)}
                  className={`flex items-center gap-3 w-full px-3.5 py-2 text-left cursor-pointer transition-colors relative whitespace-nowrap ${
                    selectedTaskId === task.id ? 'bg-accent-dim text-text' : 'text-t2 hover:bg-s2'
                  }`}>
                  {selectedTaskId === task.id && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent rounded-r-sm" />}
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[task.difficulty] || 'bg-t3'}`} />
                  <span className="text-sm truncate flex-1">{task.name}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${pillClasses[task.difficulty] || ''}`}>{task.difficulty === 'Leicht' ? 'Easy' : task.difficulty === 'Mittel' ? 'Mid' : 'Hard'}</span>
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

      {/* Resize handle */}
      {!collapsed && (
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent/40 active:bg-accent/60 z-10 transition-colors"
          onMouseDown={handleResize}
        />
      )}
    </div>
  )
}
