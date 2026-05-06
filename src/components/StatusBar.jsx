import { ArrowUpDown, ArrowLeftRight, ChevronRight } from './Icons'

export default function StatusBar({ task, code = '' }) {
  const lineCount = code ? code.split('\n').length : 1
  const charCount = code ? code.length : 0

  return (
    <div className="h-8 flex items-center justify-between px-5 bg-s1 border-t border-borderc shrink-0 select-none">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-xs text-t3">
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
          Bereit
        </span>
        {task && (
          <span className="text-xs text-t3 inline-flex items-center gap-1">
            {task.group} <ChevronRight size={12} className="opacity-60" /> {task.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-t3 px-2 py-0.5 bg-s3 rounded">React + Vite</span>
        <span className="text-xs text-t3 px-2 py-0.5 bg-s3 rounded">JSX</span>
        <span className="text-xs text-t3 px-2 py-0.5 bg-s3 rounded inline-flex items-center gap-1"><ArrowUpDown size={12} /> {lineCount}</span>
        <span className="text-xs text-t3 px-2 py-0.5 bg-s3 rounded inline-flex items-center gap-1"><ArrowLeftRight size={12} /> {charCount}</span>
      </div>
    </div>
  )
}
