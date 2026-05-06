import { useState, useEffect, useRef } from 'react'
import { Puzzle, Lightbulb } from './Icons'

function AnimatedContent({ children, taskId }) {
  const [visible, setVisible] = useState(false)
  const prevId = useRef(taskId)

  useEffect(() => {
    if (prevId.current !== taskId) {
      setVisible(false)
      prevId.current = taskId
      const frame = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(frame)
    } else {
      setVisible(true)
    }
  }, [taskId])

  return (
    <div className={`transition-all duration-300 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {children}
    </div>
  )
}

export default function TaskPanel({ task }) {
  if (!task) {
    return (
      <div className="bg-[#1e1e1e] border-b border-[#3c3c3c] p-6 flex items-center justify-center text-[#858585] font-sans shrink-0"
        style={{ minHeight: '120px' }}>
        <div className="text-center">
          <Puzzle size={36} className="text-[#858585] mb-1" />
          <p className="text-base mb-1 text-[#cccccc]">Wähle eine Aufgabe aus der Seitenleiste</p>
          <p className="text-xs text-[#666]">Praktische Code-Muster für den Job-Alltag</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1e1e1e] border-b border-[#3c3c3c] p-6 shrink-0 font-sans">
      <AnimatedContent taskId={task.id}>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-lg font-semibold text-white">{task.title}</h2>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
            task.difficulty === 'Leicht' ? 'bg-green-600/30 text-green-400' :
            task.difficulty === 'Mittel' ? 'bg-yellow-600/30 text-yellow-400' :
            'bg-red-600/30 text-red-400'
          }`}>
            {task.difficulty}
          </span>
        </div>
        <p className="text-[#cccccc] text-sm leading-relaxed mb-3">
          {task.description}
        </p>
        {task.hint && (
          <details className="text-sm group">
            <summary className="text-[#569cd6] cursor-pointer hover:text-[#6cb6f0] select-none transition-colors">
              <span className="inline-flex items-center gap-1.5"><Lightbulb size={14} /> Tipp anzeigen</span>
            </summary>
            <p className="mt-2 text-[#858585] italic pl-4 border-l-2 border-[#3c3c3c] animate-fade-in">
              {task.hint}
            </p>
          </details>
        )}
      </AnimatedContent>
    </div>
  )
}
