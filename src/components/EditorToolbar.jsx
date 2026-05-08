import { useState, useEffect, useRef } from 'react'
import { Clipboard, Check, Eye, EyeSlash } from './Icons'

export default function EditorToolbar({ code, onReset, showToast, onTogglePreview, showPreview, enablePreview = true }) {
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
    <div className="flex items-center justify-between px-4 py-1.5 bg-s1 border-b border-borderc select-none shrink-0">
      <div className="flex items-center gap-2 text-[11px] text-t3 font-mono">
        <span>{lineCount} Zeilen</span>
        <span className="text-border2">|</span>
        <span>{charCount} Zeichen</span>
      </div>
      <div className="flex items-center gap-1.5">
        {enablePreview && onTogglePreview && (
          <button
            onClick={onTogglePreview}
            className={`text-xs px-2.5 py-1 rounded transition-all duration-200 ${
              showPreview
                ? 'bg-accent/20 text-accent'
                : 'text-t3 hover:text-text hover:bg-s3'
            }`}
            title={showPreview ? 'Editor-Ansicht' : 'Live-Vorschau'}
          >
            <span className="inline-flex items-center gap-1">
              {showPreview ? <EyeSlash size={12} /> : <Eye size={12} />}
              {showPreview ? 'Editor' : 'Preview'}
            </span>
          </button>
        )}
        <button
          onClick={onReset}
          className="text-xs px-2.5 py-1 rounded text-t3 hover:text-text hover:bg-s3"
          title="Aufgaben-Startercode wiederherstellen"
        >
          ↺ Zurücksetzen
        </button>
        <button
          onClick={handleCopy}
          className={`text-xs px-2.5 py-1 rounded ${
            copied
              ? 'bg-green/30 text-green'
              : 'text-t3 hover:text-text hover:bg-s3'
          }`}
          title={copied ? 'Kopiert!' : 'Code kopieren'}
        >
          {copied ? <span className="inline-flex items-center gap-1"><Check size={12} /> Kopiert!</span> : <span className="inline-flex items-center gap-1"><Clipboard size={12} /> Kopieren</span>}
        </button>
      </div>
    </div>
  )
}
