import { useState, useEffect, useRef } from 'react'
import { Clipboard, Check } from './Icons'

export default function EditorToolbar({ code, onReset, showToast }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    if (showToast) showToast('Code kopiert!', 'success')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const lineCount = code ? code.split('\n').length : 0
  const charCount = code ? code.length : 0

  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-[#252526] border-b border-[#3c3c3c] select-none shrink-0">
      <div className="flex items-center gap-2 text-[11px] text-[#858585] font-mono">
        <span>{lineCount} Zeilen</span>
        <span className="text-[#3c3c3c]">|</span>
        <span>{charCount} Zeichen</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onReset}
          className="text-xs px-2.5 py-1 rounded text-[#858585] hover:text-white hover:bg-[#3c3c3c] transition-all duration-200"
          title="Aufgaben-Startercode wiederherstellen"
        >
          ↺ Zurücksetzen
        </button>
        <button
          onClick={handleCopy}
          className={`text-xs px-2.5 py-1 rounded transition-all duration-200 ${
            copied
              ? 'bg-green-700/50 text-green-300'
              : 'text-[#858585] hover:text-white hover:bg-[#3c3c3c]'
          }`}
          title={copied ? 'Kopiert!' : 'Code kopieren'}
        >
          {copied ? <span className="inline-flex items-center gap-1"><Check size={12} /> Kopiert!</span> : <span className="inline-flex items-center gap-1"><Clipboard size={12} /> Kopieren</span>}
        </button>
      </div>
    </div>
  )
}
