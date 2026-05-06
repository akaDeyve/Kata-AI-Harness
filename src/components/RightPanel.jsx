import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Info, Clipboard, Warning, Wrench, Sparkle } from './Icons'

/* ── Helpers ── */

function parseContent(content) {
  if (!content) return null
  const parts = []
  let key = 0
  const regex = /```(\w*)\s*\n([\s\S]*?)```/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'text', text: content.slice(lastIndex, match.index), key: key++ })
    parts.push({ type: 'code', language: match[1] || 'javascript', code: match[2].replace(/^\n/, ''), key: key++ })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < content.length) parts.push({ type: 'text', text: content.slice(lastIndex), key: key++ })
  if (parts.length === 0) return <p className="text-[11.5px] leading-relaxed whitespace-pre-wrap text-t2">{content}</p>
  return parts.map(p => p.type === 'text'
    ? <p key={p.key} className="text-[11.5px] leading-relaxed whitespace-pre-wrap text-t2 mb-2 last:mb-0">{p.text}</p>
    : <CodeBlock key={p.key} {...p} />
  )
}

function CodeBlock({ language, code }) {
  return (
    <div className="my-2 rounded-app overflow-hidden border border-borderc">
      <div className="flex items-center justify-between px-3 py-1 bg-s2 border-b border-borderc">
        <span className="text-[10px] text-t3 font-mono">{language || 'code'}</span>
        <button onClick={() => navigator.clipboard.writeText(code)} className="text-t3 hover:text-text transition-colors"><Clipboard size={12} /></button>
      </div>
      <SyntaxHighlighter language={language || 'javascript'} style={oneDark} customStyle={{ margin: 0, padding: '0.75rem', fontSize: '0.75rem', lineHeight: '1.6', background: '#0a0b0d' }} showLineNumbers={false} wrapLines>{code}</SyntaxHighlighter>
    </div>
  )
}

function Spinner() {
  return <svg className="animate-spin w-5 h-5 text-accent" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
}

/* ── Tabs ── */

const TABS = [
  { id: 'info', label: 'Info', icon: <Info size={14} /> },
]

/* ── Main ── */

export default function RightPanel({ task, feedback, correction, isLoading, isCorrectionLoading, onGetFeedback, onGetCorrection, showToast, groupProgress, collapsed, onToggleCollapse }) {
  const [activeTab, setActiveTab] = useState('info')

  return (
    <div className={`flex flex-col overflow-hidden shrink-0 border-l border-borderc bg-s1 transition-[width,min-width] duration-200 ${collapsed ? 'w-12 min-w-[48px]' : 'w-[260px] min-w-[260px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between h-[52px] px-3.5 border-b border-borderc shrink-0">
        {!collapsed && <span className="text-xs font-semibold text-text whitespace-nowrap">Aufgaben-Info</span>}
        <button onClick={onToggleCollapse} className={`w-[26px] h-[26px] rounded-[6px] border border-border2 bg-transparent text-t2 flex items-center justify-center flex-shrink-0 hover:bg-s3 hover:text-text transition-all ${collapsed ? 'mx-auto' : ''}`}>
          {collapsed ? '‹' : '›'}
        </button>
      </div>

      {/* Tabs */}
      {!collapsed && (
        <div className="flex border-b border-borderc shrink-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2.5 text-center text-[10.5px] font-semibold tracking-wider uppercase cursor-pointer border-b-2 transition-all ${
                activeTab === t.id ? 'text-accent border-accent' : 'text-t3 border-transparent hover:text-t2'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
          {activeTab === 'info' && (
            <>
              {/* KI-Feedback card */}
              <div className="bg-s2 border border-borderc rounded-app p-3">
                <div className="flex items-center gap-1.5 mb-1.5 text-accent">
                  <Sparkle size={12} />
                  <span className="text-[9px] font-bold tracking-[0.14em] uppercase">KI-Feedback</span>
                </div>
                {!feedback && !correction && !isLoading && !isCorrectionLoading && (
                  <p className="text-[11.5px] leading-relaxed text-t2">Schreibe deinen Code und klicke auf <em className="text-accent font-semibold not-italic">AI-Feedback</em> für eine Bewertung oder auf <em className="text-accent font-semibold not-italic">Korrektur</em> für die Musterlösung.</p>
                )}
                {(isLoading || isCorrectionLoading) && (
                  <div className="flex items-center justify-center py-6">
                    <Spinner />
                  </div>
                )}
                {feedback && !isLoading && (
                  <div className="animate-fade-in">
                    {feedback.score !== null && (
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-sm font-bold ${feedback.score >= 8 ? 'text-[#a8e6cf]' : feedback.score >= 5 ? 'text-[#ffd3b6]' : 'text-[#ffaaa5]'}`}>Score: {feedback.score}/10</span>
                        <div className="flex-1 h-[3px] bg-s3 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${feedback.score >= 8 ? 'bg-[#a8e6cf]' : feedback.score >= 5 ? 'bg-[#ffd3b6]' : 'bg-[#ffaaa5]'}`} style={{ width: `${feedback.score * 10}%` }} />
                        </div>
                      </div>
                    )}
                    {feedback.isError
                      ? <div className="flex items-start gap-2 p-2 rounded bg-red-900/10 border border-red-900/20"><span className="text-red shrink-0"><Warning size={16} /></span><p className="text-[11.5px] text-red/80 whitespace-pre-wrap">{feedback.content}</p></div>
                      : parseContent(feedback.content)
                    }
                  </div>
                )}
                {correction && !isCorrectionLoading && (
                  <div className="animate-fade-in">
                    {correction.isError
                      ? <div className="flex items-start gap-2 p-2 rounded bg-red-900/10 border border-red-900/20"><span className="text-red shrink-0"><Warning size={16} /></span><p className="text-[11.5px] text-red/80 whitespace-pre-wrap">{correction.content}</p></div>
                      : parseContent(correction.content)
                    }
                  </div>
                )}
              </div>

              <div className="h-px bg-border" />

              {/* Concepts */}
              {task && (
                <>
                  <div>
                    <h4 className="text-[11.5px] font-semibold text-text mb-1">{task.title}</h4>
                    <p className="text-[11.5px] leading-relaxed text-t2">{task.description}</p>
                  </div>
                  {task.hint && (
                    <details className="text-[11.5px]">
                      <summary className="text-yellow cursor-pointer hover:underline select-none inline-flex items-center gap-1.5">
                        <Wrench size={12} /> Tipp anzeigen
                      </summary>
                      <p className="mt-2 text-t2 italic pl-3 border-l-2 border-borderc">{task.hint}</p>
                    </details>
                  )}
                </>
              )}
            </>
          )}


        </div>
      )}
    </div>
  )
}
