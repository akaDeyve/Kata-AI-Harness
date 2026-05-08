import { Key, Check, RotateCcw, Clipboard, Wrench, Robot, Sparkle, Settings } from './Icons'

const pillClasses = {
  'Leicht': 'bg-[#a8e6cf18] text-[#a8e6cf]',
  'Mittel': 'bg-[#ffd3b618] text-[#ffd3b6]',
  'Schwer': 'bg-[#ffaaa518] text-[#ffaaa5]',
}

export default function TopBar({ task, onApiClick, hasApiKey, onReset, onGetFeedback, onGetCorrection, onGenerateTask, onSettingsClick, showPreview, isLoading, isCorrectionLoading }) {
  return (
    <div className="h-[52px] flex items-center justify-between px-5 border-b border-borderc bg-s1 shrink-0 gap-3 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-base font-semibold text-text whitespace-nowrap overflow-hidden text-ellipsis">{task?.title || 'CodeLab'}</span>
        {task && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pillClasses[task.difficulty] || ''}`}>{task.difficulty === 'Leicht' ? 'Easy' : task.difficulty === 'Mittel' ? 'Mid' : 'Hard'}</span>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onReset} className="inline-flex items-center gap-2 px-3 py-2 rounded-app border border-border2 bg-transparent text-t2 text-sm font-medium hover:bg-s3 hover:text-text" title="Zurücksetzen">
          <RotateCcw size={14} /> Reset
        </button>

        <button onClick={onApiClick} className={`inline-flex items-center gap-2 px-3 py-2 rounded-app border text-sm font-medium ${
          hasApiKey
            ? 'border-green/40 bg-green-dim text-green hover:bg-green-dim'
            : 'border-border2 bg-transparent text-t2 hover:bg-s3 hover:text-text'
        }`}>
          {hasApiKey ? <Check size={14} /> : <Key size={14} />} API
        </button>

        <button onClick={onGetCorrection} disabled={isCorrectionLoading} className="inline-flex items-center gap-2 px-3 py-2 rounded-app border border-border2 bg-transparent text-t2 text-sm font-medium hover:bg-s3 hover:text-text disabled:opacity-50 disabled:cursor-not-allowed">
          <Wrench size={14} /> Korrektur
        </button>

        <button onClick={onGetFeedback} disabled={isLoading} className="inline-flex items-center gap-2 px-3 py-2 rounded-app bg-accent text-white text-sm font-medium border border-transparent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed">
          <Robot size={14} /> AI-Feedback
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {onGenerateTask && (
          <button onClick={onGenerateTask} className="inline-flex items-center gap-2 px-3 py-2 rounded-app border border-border2 bg-transparent text-t2 text-sm font-medium hover:bg-s3 hover:text-text" title="KI-Aufgabe generieren">
            <Sparkle size={14} /> Generieren
          </button>
        )}

        <div className="w-px h-6 bg-border mx-1" />

        <button onClick={onSettingsClick} className="inline-flex items-center gap-2 px-3 py-2 rounded-app border border-border2 bg-transparent text-t2 text-sm font-medium hover:bg-s3 hover:text-text" title="Einstellungen">
          <Settings size={14} /> Einstellungen
        </button>
      </div>
    </div>
  )
}
