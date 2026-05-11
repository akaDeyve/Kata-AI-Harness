import { useState, useEffect, useRef } from "react";
import { Clipboard, Check, Eye, EyeSlash, RotateCcw } from "./Icons";

export default function EditorToolbar({
  code,
  onReset,
  showToast,
  onTogglePreview,
  showPreview,
  enablePreview = true,
  language = 'javascript',
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (showToast) showToast("Code kopiert!", "success");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const lineCount = code ? code.split("\n").length : 0;

  return (
    <div className="flex items-center justify-between px-5 h-9 bg-bg border-b border-borderc select-none shrink-0">
      {/* File tab */}
      <div className="flex items-center h-full">
        <div className="flex items-center gap-2 h-full px-3 border-b-2 border-text -mb-px">
          <span className="text-[13px] font-medium text-text">code.{language === 'typescript' ? 'tsx' : 'jsx'}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-s3 text-t3 font-mono">{language}</span>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-t3 mr-2">{lineCount} Zeilen</span>
        {enablePreview && onTogglePreview && (
          <button
            onClick={onTogglePreview}
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
              showPreview
                ? "text-accent hover:bg-accent/10"
                : "text-t3 hover:text-text hover:bg-s2"
            }`}
            title={showPreview ? "Editor-Ansicht" : "Live-Vorschau"}
          >
            {showPreview ? <EyeSlash size={13} /> : <Eye size={13} />}
          </button>
        )}
        <button
          onClick={onReset}
          className="w-7 h-7 rounded flex items-center justify-center text-t3 hover:text-text hover:bg-s2 transition-colors"
          title="Aufgaben-Startercode wiederherstellen"
        >
          <RotateCcw size={13} />
        </button>
        <button
          onClick={handleCopy}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
            copied
              ? "text-green hover:bg-green-dim"
              : "text-t3 hover:text-text hover:bg-s2"
          }`}
          title={copied ? "Kopiert!" : "Code kopieren"}
        >
          {copied ? <Check size={13} /> : <Clipboard size={13} />}
        </button>
      </div>
    </div>
  );
}
