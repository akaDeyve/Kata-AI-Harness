const LANGUAGE_LABELS = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
}

export default function StatusBar({ task, code = '' }) {
  const lineCount = code ? code.split('\n').length : 1
  const charCount = code ? code.length : 0
  const language = task?.language || 'javascript'
  const langLabel = LANGUAGE_LABELS[language] || language

  return (
    <div className="h-8 flex items-center justify-between px-5 bg-bg border-t border-borderc shrink-0 select-none">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-xs text-t3">
          <span className="w-1.5 h-1.5 rounded-full bg-green" />
          Bereit
        </span>
        {task && <span className="text-xs text-t3">{task.title || task.name}</span>}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-t3">{langLabel}</span>
        <span className="text-xs text-t3">{charCount} Chars</span>
        <span className="text-xs text-t3">{lineCount} Lines</span>
      </div>
    </div>
  )
}
