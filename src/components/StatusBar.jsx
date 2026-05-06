export default function StatusBar({ task }) {
  return (
    <div className="h-6 bg-[#007acc] flex items-center px-3 text-xs text-white select-none shrink-0 font-sans">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          Bereit
        </span>
        {task && (
          <>
            <span className="text-white/50">|</span>
            <span>{task.group} \u203A {task.name}</span>
          </>
        )}
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span>React + Vite</span>
        <span className="text-white/50">|</span>
        <span>UTF-8</span>
        <span className="text-white/50">|</span>
        <span>Ln 1, Col 1</span>
      </div>
    </div>
  )
}
