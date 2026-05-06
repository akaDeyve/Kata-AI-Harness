import { ArrowUpDown, ArrowLeftRight, ChevronRight } from './Icons'

export default function StatusBar({ task, code = '' }) {
  const lineCount = code ? code.split('\n').length : 1
  const charCount = code ? code.length : 0

  return (
    <div className="h-[28px] flex items-center justify-between px-5 bg-s1 border-t border-borderc shrink-0 select-none">
      <div className="flex items-center gap-3.5">
        <span className="flex items-center gap-1.5 text-[10.5px] text-t3">
          <span className="w-[5px] h-[5px] rounded-full bg-green animate-pulse" />
          Bereit
        </span>
        {task && (
          <span className="text-[10.5px] text-t3 inline-flex items-center gap-1">
            {task.group} <ChevronRight size={10} className="opacity-60" /> {task.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-t3 px-[7px] py-[2px] bg-s3 rounded">React + Vite</span>
        <span className="text-[10px] text-t3 px-[7px] py-[2px] bg-s3 rounded">JSX</span>
        <span className="text-[10px] text-t3 px-[7px] py-[2px] bg-s3 rounded inline-flex items-center gap-1"><ArrowUpDown size={10} /> {lineCount}</span>
        <span className="text-[10px] text-t3 px-[7px] py-[2px] bg-s3 rounded inline-flex items-center gap-1"><ArrowLeftRight size={10} /> {charCount}</span>
      </div>
    </div>
  )
}
