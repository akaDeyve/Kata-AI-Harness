import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

function parseAndRenderContent(content) {
  if (!content) return null

  const parts = []
  let remaining = content
  let key = 0
  const regex = /```(\w*)\s*\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(content)) !== null) {
    // Text before this code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: content.slice(lastIndex, match.index),
        key: key++,
      })
    }

    const language = match[1] || 'javascript'
    const code = match[2].replace(/^\n/, '')

    parts.push({
      type: 'code',
      language,
      code,
      key: key++,
    })

    lastIndex = regex.lastIndex
  }

  // Remaining text after last code block
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      text: content.slice(lastIndex),
      key: key++,
    })
  }

  // If no code blocks found, render as plain text
  if (parts.length === 0) {
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#cccccc]">
        {content}
      </p>
    )
  }

  return parts.map((part) => {
    if (part.type === 'text') {
      return (
        <p key={part.key} className="text-sm leading-relaxed whitespace-pre-wrap text-[#cccccc] mb-2 last:mb-0">
          {part.text}
        </p>
      )
    }
    return (
      <div key={part.key} className="my-3 rounded-lg overflow-hidden border border-[#3c3c3c]">
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#2d2d2d] text-xs text-[#858585] border-b border-[#3c3c3c]">
          <span>{part.language || 'code'}</span>
          <button
            onClick={() => navigator.clipboard.writeText(part.code)}
            className="hover:text-white transition-colors"
            title="In Zwischenablage kopieren"
          >
            📋
          </button>
        </div>
        <SyntaxHighlighter
          language={part.language || 'javascript'}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.8rem',
            lineHeight: '1.5',
            background: '#1a1a2e',
          }}
          showLineNumbers={false}
          wrapLines
        >
          {part.code}
        </SyntaxHighlighter>
      </div>
    )
  })
}

function Spinner({ size = 'w-3 h-3' }) {
  return (
    <svg className={`animate-spin ${size}`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function FeedbackPanel({
  feedback,
  isLoading,
  onGetFeedback,
  correction,
  isCorrectionLoading,
  onGetCorrection,
}) {
  return (
    <div className="bg-[#1e1e1e] border-t border-[#3c3c3c] shrink-0 font-sans">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#3c3c3c] bg-[#252526]">
        <span className="text-xs text-[#858585] font-medium uppercase tracking-wider">
          Feedback
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onGetCorrection}
            disabled={isCorrectionLoading || isLoading}
            className={`text-xs px-4 py-1.5 rounded font-medium transition-colors ${
              isCorrectionLoading
                ? 'bg-[#3c3c3c] text-[#858585] cursor-not-allowed'
                : 'bg-[#2d6a4f] text-white hover:bg-[#40916c]'
            }`}
          >
            {isCorrectionLoading ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Korrigiere...
              </span>
            ) : (
              '\uD83D\uDD27 Korrektur'
            )}
          </button>
          <button
            onClick={onGetFeedback}
            disabled={isLoading}
            className={`text-xs px-4 py-1.5 rounded font-medium transition-colors ${
              isLoading
                ? 'bg-[#3c3c3c] text-[#858585] cursor-not-allowed'
                : 'bg-[#0e639c] text-white hover:bg-[#1177bb]'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Analysiere...
              </span>
            ) : (
              '\uD83E\uDD16 AI-Feedback'
            )}
          </button>
        </div>
      </div>

      <div className="h-48 overflow-y-auto p-4">
        {!feedback && !correction && !isLoading && !isCorrectionLoading && (
          <p className="text-sm text-[#858585] italic">
            Schreibe deinen Code und klicke auf &quot;AI-Feedback&quot; fuer eine Bewertung oder auf &quot;Korrektur&quot; fuer eine verbesserte Version.
          </p>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-[#858585]">
              <Spinner size="w-8 h-8" />
              <p className="text-sm mt-2">Analysiere deinen Code...</p>
            </div>
          </div>
        )}

        {isCorrectionLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-[#858585]">
              <Spinner size="w-8 h-8" />
              <p className="text-sm mt-2">Erstelle Korrekturvorschlag...</p>
            </div>
          </div>
        )}

        {feedback && !isLoading && (
          <div>
            {feedback.score !== null && (
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-lg font-bold ${
                  feedback.score >= 8 ? 'text-green-400' :
                  feedback.score >= 5 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  Score: {feedback.score}/10
                </span>
                <div className="flex-1 h-2 bg-[#3c3c3c] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      feedback.score >= 8 ? 'bg-green-500' :
                      feedback.score >= 5 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${(feedback.score / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {feedback.isError ? (
              <p className="text-sm text-red-400 whitespace-pre-wrap">{feedback.content}</p>
            ) : (
              parseAndRenderContent(feedback.content)
            )}
          </div>
        )}

        {correction && !isCorrectionLoading && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-green-400">
              <span className="text-lg">✅</span>
              <span className="text-sm font-semibold">Korrekturvorschlag</span>
            </div>
            {correction.isError ? (
              <p className="text-sm text-red-400 whitespace-pre-wrap">{correction.content}</p>
            ) : (
              parseAndRenderContent(correction.content)
            )}
          </div>
        )}
      </div>
    </div>
  )
}
