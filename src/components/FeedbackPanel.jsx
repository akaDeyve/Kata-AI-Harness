import { useState, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Clipboard, Check, Sparkle, Warning, Wrench, Robot } from "./Icons";

/* ---------- Helpers ---------- */

function parseAndRenderContent(content, showToast) {
  if (!content) return null;

  const parts = [];
  let key = 0;
  const regex = /```(\w*)\s*\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        text: content.slice(lastIndex, match.index),
        key: key++,
      });
    }

    const language = match[1] || "javascript";
    const code = match[2].replace(/^\n/, "");

    parts.push({
      type: "code",
      language,
      code,
      key: key++,
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      text: content.slice(lastIndex),
      key: key++,
    });
  }

  if (parts.length === 0) {
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#cccccc]">
        {content}
      </p>
    );
  }

  return parts.map((part) => {
    if (part.type === "text") {
      return (
        <p
          key={part.key}
          className="text-sm leading-relaxed whitespace-pre-wrap text-[#cccccc] mb-2 last:mb-0"
        >
          {part.text}
        </p>
      );
    }
    return (
      <CodeBlock
        key={part.key}
        language={part.language}
        code={part.code}
        showToast={showToast}
      />
    );
  });
}

/* ---------- Copy button with feedback ---------- */

function CopyButton({ code, showToast }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (showToast) showToast("In Zwischenablage kopiert!", "success");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <button
      onClick={handleCopy}
      className={`text-xs px-2 py-1 rounded transition-all duration-200 ${
        copied
          ? "bg-green-700/50 text-green-300"
          : "text-[#858585] hover:text-white hover:bg-[#3c3c3c]"
      }`}
      title={copied ? "Kopiert!" : "In Zwischenablage kopieren"}
    >
      {copied ? (
        <span className="inline-flex items-center gap-1">
          <Check size={12} /> Kopiert!
        </span>
      ) : (
        <span className="inline-flex items-center gap-1">
          <Clipboard size={12} /> Kopieren
        </span>
      )}
    </button>
  );
}

/* ---------- Code block wrapper ---------- */

function CodeBlock({ language, code, showToast }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`my-3 rounded-lg overflow-hidden border border-[#3c3c3c] transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#2d2d2d] text-xs text-[#858585] border-b border-[#3c3c3c]">
        <span className="font-mono">{partLanguageLabel(language)}</span>
        <CopyButton code={code} showToast={showToast} />
      </div>
      <SyntaxHighlighter
        language={language || "javascript"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.8rem",
          lineHeight: "1.5",
          background: "#1a1a2e",
        }}
        showLineNumbers={false}
        wrapLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function partLanguageLabel(lang) {
  const map = {
    js: "JavaScript",
    ts: "TypeScript",
    jsx: "JSX",
    tsx: "TSX",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    sh: "Shell",
  };
  return map[lang] || lang || "code";
}

/* ---------- Spinner ---------- */

function Spinner({ size = "w-3 h-3" }) {
  return (
    <svg className={`animate-spin ${size}`} viewBox="0 0 24 24">
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

/* ---------- Score bar with animation ---------- */

function ScoreBar({ score }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(score * 10));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const colorClass =
    score >= 8 ? "bg-green-500" : score >= 5 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className={`text-xl font-bold min-w-[6rem] ${
          score >= 8
            ? "text-green-400"
            : score >= 5
              ? "text-yellow-400"
              : "text-red-400"
        }`}
      >
        Score: {score}/10
      </span>
      <div className="flex-1 h-2.5 bg-[#3c3c3c] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- Animated content wrapper ---------- */

function AnimatedSection({ children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`transition-all duration-400 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {children}
    </div>
  );
}

/* ---------- Empty state ---------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
      <Sparkle size={40} className="text-[#858585]" />
      <p className="text-sm text-[#858585] max-w-md leading-relaxed">
        Schreibe deinen Code und klicke auf{" "}
        <strong className="text-[#569cd6]">&quot;AI-Feedback&quot;</strong> fuer
        eine Bewertung oder auf{" "}
        <strong className="text-[#2d6a4f]">&quot;Korrektur&quot;</strong> fuer
        eine verbesserte Version.
      </p>
    </div>
  );
}

/* ---------- Main component ---------- */

export default function FeedbackPanel({
  feedback,
  isLoading,
  onGetFeedback,
  correction,
  isCorrectionLoading,
  onGetCorrection,
  showToast,
}) {
  return (
    <div className="bg-[#1e1e1e] border-t border-[#3c3c3c] shrink-0 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#3c3c3c] bg-[#252526]">
        <span className="text-xs text-[#858585] font-medium uppercase tracking-wider">
          Feedback
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onGetCorrection}
            disabled={isCorrectionLoading || isLoading}
            className={`text-xs px-4 py-1.5 rounded font-medium transition-all duration-200 ${
              isCorrectionLoading
                ? "bg-[#3c3c3c] text-[#858585] cursor-not-allowed"
                : "bg-[#2d6a4f] text-white hover:bg-[#40916c] active:scale-95"
            }`}
          >
            {isCorrectionLoading ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Korrigiere...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Wrench size={14} /> Korrektur
              </span>
            )}
          </button>
          <button
            onClick={onGetFeedback}
            disabled={isLoading}
            className={`text-xs px-4 py-1.5 rounded font-medium transition-all duration-200 ${
              isLoading
                ? "bg-[#3c3c3c] text-[#858585] cursor-not-allowed"
                : "bg-[#0e639c] text-white hover:bg-[#1177bb] active:scale-95"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Analysiere...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Robot size={14} /> AI-Feedback
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="h-48 overflow-y-auto p-4">
        {!feedback && !correction && !isLoading && !isCorrectionLoading && (
          <EmptyState />
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-[#858585]">
              <Spinner size="w-8 h-8" />
              <p className="text-sm mt-3 animate-pulse">
                Analysiere deinen Code...
              </p>
            </div>
          </div>
        )}

        {isCorrectionLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-[#858585]">
              <Spinner size="w-8 h-8" />
              <p className="text-sm mt-3 animate-pulse">
                Erstelle Korrekturvorschlag...
              </p>
            </div>
          </div>
        )}

        {feedback && !isLoading && (
          <AnimatedSection>
            {feedback.score !== null && <ScoreBar score={feedback.score} />}
            {feedback.isError ? (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-900/20 border border-red-800/30">
                <span className="text-red-400 shrink-0">
                  <Warning size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-red-300 mb-1">
                    Fehler
                  </p>
                  <p className="text-sm text-red-200/80 whitespace-pre-wrap">
                    {feedback.content}
                  </p>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                {parseAndRenderContent(feedback.content, showToast)}
              </div>
            )}
          </AnimatedSection>
        )}

        {correction && !isCorrectionLoading && (
          <AnimatedSection>
            {correction.isError ? (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-900/20 border border-red-800/30">
                <span className="text-red-400 shrink-0">
                  <Warning size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-red-300 mb-1">
                    Fehler
                  </p>
                  <p className="text-sm text-red-200/80 whitespace-pre-wrap">
                    {correction.content}
                  </p>
                </div>
              </div>
            ) : (
              <div>{parseAndRenderContent(correction.content, showToast)}</div>
            )}
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
