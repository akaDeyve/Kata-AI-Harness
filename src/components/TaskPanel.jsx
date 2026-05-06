export default function TaskPanel({ task }) {
  if (!task) {
    return (
      <div className="bg-[#1e1e1e] border-b border-[#3c3c3c] p-6 flex items-center justify-center text-[#858585] font-sans shrink-0"
        style={{ minHeight: '120px' }}>
        <div className="text-center">
          <p className="text-lg mb-1">🧩 Waehle eine Aufgabe aus der Seitenleiste</p>
          <p className="text-xs text-[#666]">Praktische Code-Muster fuer den Job-Alltag</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1e1e1e] border-b border-[#3c3c3c] p-6 shrink-0 font-sans">
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
        <details className="text-sm">
          <summary className="text-[#569cd6] cursor-pointer hover:text-[#6cb6f0] select-none">
            💡 Tipp anzeigen
          </summary>
          <p className="mt-2 text-[#858585] italic pl-4 border-l-2 border-[#3c3c3c]">
            {task.hint}
          </p>
        </details>
      )}
    </div>
  )
}
