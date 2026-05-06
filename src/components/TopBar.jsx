import { Key, Check, RotateCcw, Clipboard, Wrench, Robot } from './Icons'

const pillClasses = {
  'Leicht': 'bg-[#a8e6cf18] text-[#a8e6cf]',
  'Mittel': 'bg-[#ffd3b618] text-[#ffd3b6]',
  'Schwer': 'bg-[#ffaaa518] text-[#ffaaa5]',
}

export default function TopBar({ task, onApiClick, hasApiKey, onReset, onGetFeedback, onGetCorrection, isLoading, isCorrectionLoading }) {
  return (
    <div className="h-[52px] flex items-center justify-between px-5 border-b border-borderc bg-s1 shrink-0 gap-3 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-[13.5px] font-semibold text-text whitespace-nowrap overflow-hidden text-ellipsis">{task?.title || 'CodeLab'}</span>
        {task && <span className={`text-[10px] font-semibold px-2 py-[3px] rounded-full ${pillClasses[task.difficulty] || ''}`}>{task.difficulty === 'Leicht' ? 'Easy' : task.difficulty === 'Mittel' ? 'Mid' : 'Hard'}</span>}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={onReset} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-app border border-border2 bg-transparent text-t2 text-[11.5px] font-medium hover:bg-s3 hover:text-text transition-all" title="Zurücksetzen">
          <RotateCcw size={13} /> Reset
        </button>

        <button onClick={onApiClick} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-app border text-[11.5px] font-medium transition-all ${
          hasApiKey
            ? 'border-green-700/40 bg-green-dim text-green hover:bg-[#3ecf8e28]'
            : 'border-border2 bg-transparent text-t2 hover:bg-s3 hover:text-text'
        }`}>
          {hasApiKey ? <Check size={13} /> : <Key size={13} />} API
        </button>

        <button onClick={onGetCorrection} disabled={isCorrectionLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-app border border-border2 bg-transparent text-t2 text-[11.5px] font-medium hover:bg-s3 hover:text-text transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Wrench size={13} /> Korrektur
        </button>

        <button onClick={onGetFeedback} disabled={isLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-app bg-accent text-white text-[11.5px] font-medium border border-transparent hover:bg-[#7b73ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Robot size={13} /> AI-Feedback
        </button>
      </div>
    </div>
  )
}
