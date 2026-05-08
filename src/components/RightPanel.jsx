import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Info,
  Clipboard,
  Warning,
  Sparkle,
  Wrench,
  Robot,
  Lightbulb,
  CaretRight,
  CaretLeft,
} from "./Icons";

/* ── Helpers ── */

function parseContent(content) {
  if (!content) return null;
  const parts = [];
  let key = 0;
  const regex = /```(\w*)\s*\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex)
      parts.push({
        type: "text",
        text: content.slice(lastIndex, match.index),
        key: key++,
      });
    parts.push({
      type: "code",
      language: match[1] || "javascript",
      code: match[2].replace(/^\n/, ""),
      key: key++,
    });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length)
    parts.push({ type: "text", text: content.slice(lastIndex), key: key++ });
  if (parts.length === 0)
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-t2">
        {content}
      </p>
    );
  return parts.map((p) =>
    p.type === "text" ? (
      <p
        key={p.key}
        className="text-sm leading-relaxed whitespace-pre-wrap text-t2 mb-2 last:mb-0"
      >
        {p.text}
      </p>
    ) : (
      <CodeBlock key={p.key} {...p} />
    ),
  );
}

function CodeBlock({ language, code }) {
  return (
    <div className="my-3 rounded-app overflow-hidden border border-borderc">
      <div className="flex items-center justify-between px-3 py-1.5 bg-s2 border-b border-borderc">
        <span className="text-xs text-t3 font-mono">{language || "code"}</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-t3 hover:text-text transition-colors"
        >
          <Clipboard size={14} />
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "javascript"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.9375rem",
          lineHeight: "1.6",
          background: "#0a0b0d",
        }}
        showLineNumbers={false}
        wrapLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5 text-accent" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ── Tabs ── */

const TABS = [
  { id: "info", label: "Info" },
  { id: "feedback", label: "Feedback" },
  { id: "solution", label: "Lösung" },
];

/* ── Main ── */

export default function RightPanel({
  task,
  feedback,
  correction,
  isLoading,
  isCorrectionLoading,
  onGetFeedback,
  onGetCorrection,
  showToast,
  collapsed,
  onToggleCollapse,
  width,
  onWidthChange,
}) {
  const [activeTab, setActiveTab] = useState("info");

  const handleResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    const handleMouseMove = (ev) => {
      const newWidth = Math.max(
        180,
        Math.min(500, startWidth - (ev.clientX - startX)),
      );
      onWidthChange(newWidth);
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
    };
    document.body.style.cursor = "col-resize";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="relative flex flex-col overflow-hidden shrink-0 border-l border-borderc bg-bg"
      style={{ width: collapsed ? 44 : width, minWidth: collapsed ? 44 : 260 }}
    >
      {/* Header with Tabs */}
      <div className="flex items-center justify-between h-12 px-2 border-b border-borderc shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-3 text-sm font-medium cursor-pointer border-b-2 transition-colors ${
                  activeTab === t.id
                    ? "text-text border-text"
                    : "text-t3 border-transparent hover:text-t2"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={`w-6 h-6 rounded text-t3 flex items-center justify-center flex-shrink-0 hover:text-text hover:bg-s2 transition-colors ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <CaretLeft size={14} /> : <CaretRight size={14} />}
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* ── Info Tab ── */}
          {activeTab === "info" && task && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-semibold text-text leading-snug">
                {task.title}
              </h3>
              <p className="text-sm leading-relaxed text-t2">
                {task.description}
              </p>

              {task.hint && (
                <details className="group">
                  <summary className="flex items-center gap-2 text-sm text-t3 cursor-pointer select-none list-none">
                    <span className="w-4 h-4 rounded-full border border-t3 flex items-center justify-center">
                      <Lightbulb size={10} className="text-t3" />
                    </span>
                    <span>Tipp anzeigen</span>
                  </summary>
                  <p className="mt-2 text-sm text-t3 leading-relaxed pl-6">
                    {task.hint}
                  </p>
                </details>
              )}
            </div>
          )}

          {activeTab === "info" && !task && (
            <div className="flex flex-col items-center justify-center h-full text-t3 gap-3">
              <Info size={28} />
              <p className="text-sm">Wähle eine Aufgabe aus</p>
            </div>
          )}

          {/* ── Feedback Tab ── */}
          {activeTab === "feedback" && (
            <div className="flex flex-col gap-4">
              {!feedback && !isLoading && (
                <div className="flex flex-col items-center justify-center py-8 text-t3 gap-3">
                  <Robot size={28} />
                  <p className="text-[13px] text-center">
                    Schreibe deinen Code und lass ihn von der KI bewerten.
                  </p>
                  <button
                    onClick={onGetFeedback}
                    className="mt-1 px-4 py-2 rounded-app bg-accent text-white text-[13px] font-medium hover:bg-accent/90">
                    AI-Feedback holen
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              )}

              {feedback && !isLoading && (
                <div>
                  {feedback.score !== null && (
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`text-sm font-bold ${feedback.score >= 8 ? "text-green" : feedback.score >= 5 ? "text-yellow" : "text-red"}`}
                      >
                        Score: {feedback.score}/10
                      </span>
                      <div className="flex-1 h-1 bg-s3 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${feedback.score >= 8 ? "bg-green" : feedback.score >= 5 ? "bg-yellow" : "bg-red"}`}
                          style={{ width: `${feedback.score * 10}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {feedback.isError ? (
                    <div className="flex items-start gap-2 p-3 rounded bg-red-dim border border-red/20">
                      <span className="text-red shrink-0">
                        <Warning size={18} />
                      </span>
                      <p className="text-[13px] text-red/80 whitespace-pre-wrap">
                        {feedback.content}
                      </p>
                    </div>
                  ) : (
                    parseContent(feedback.content)
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Solution Tab ── */}
          {activeTab === "solution" && (
            <div className="flex flex-col gap-4">
              {!correction && !isCorrectionLoading && (
                <div className="flex flex-col items-center justify-center py-8 text-t3 gap-3">
                  <Wrench size={28} />
                  <p className="text-[13px] text-center">
                    Hole dir die korrigierte Musterlösung.
                  </p>
                  <button
                    onClick={onGetCorrection}
                    className="mt-1 px-4 py-2 rounded-app bg-accent text-white text-[13px] font-medium hover:bg-accent/90"
                  >
                    Korrektur anzeigen
                  </button>
                </div>
              )}

              {isCorrectionLoading && (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              )}

              {correction && !isCorrectionLoading && (
                <div>
                  {correction.isError ? (
                    <div className="flex items-start gap-2 p-3 rounded bg-red-dim border border-red/20">
                      <span className="text-red shrink-0">
                        <Warning size={18} />
                      </span>
                      <p className="text-[13px] text-red/80 whitespace-pre-wrap">
                        {correction.content}
                      </p>
                    </div>
                  ) : (
                    parseContent(correction.content)
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Resize handle (left edge) */}
      {!collapsed && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent/40 active:bg-accent/60 z-10 transition-colors"
          onMouseDown={handleResize}
        />
      )}
    </div>
  );
}
