import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, EyeSlash, Warning, RotateCcw } from "./Icons";

// @babel/standalone wird dynamisch geladen (spart ~4MB im initialen Bundle)
let babelPromise = null;
function getBabel() {
  if (!babelPromise) {
    babelPromise = import("@babel/standalone").then((m) => m.transform);
  }
  return babelPromise;
}

const PREVIEW_TIMEOUT = 3000; // max render time before showing error

export default function CodePreview({ code, task }) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [error, setError] = useState(null);
  const [isTranspiling, setIsTranspiling] = useState(false);
  const iframeRef = useRef(null);
  const timerRef = useRef(null);

  // Reset when task changes
  useEffect(() => {
    setError(null);
    setPreviewContent("");
    setShowPreview(false);
  }, [task?.id]);

  const handleToggle = useCallback(() => {
    if (showPreview) {
      setShowPreview(false);
      return;
    }
    generatePreview();
  }, [showPreview, code, task]);

  const generatePreview = useCallback(async () => {
    if (!code || !code.trim()) {
      setError("Kein Code zum Anzeigen.");
      setShowPreview(true);
      return;
    }

    setIsTranspiling(true);
    setError(null);

    try {
      // Dynamisch @babel/standalone laden
      const transform = await getBabel();

      // Try to transpile the JSX code
      let transpiled;
      try {
        transpiled = transform(code, {
          presets: ["react"],
          filename: "UserCode.jsx",
          retainLines: false,
          compact: true,
        }).code;
      } catch (babelError) {
        setError(`JSX-Transpilierungsfehler: ${babelError.message}`);
        setIsTranspiling(false);
        setShowPreview(true);
        return;
      }

      // Build the iframe HTML with the transpiled code
      const html = buildPreviewHtml(transpiled);
      setPreviewContent(html);
      setIsTranspiling(false);
      setShowPreview(true);
    } catch (err) {
      setError(`Fehler: ${err.message}`);
      setIsTranspiling(false);
      setShowPreview(true);
    }
  }, [code, task]);

  // Handle iframe errors
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      // Check if the iframe content has errors
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const errorEl = iframeDoc.getElementById("preview-error");
        if (errorEl) {
          setError(errorEl.textContent);
        }
      }
    } catch {
      // Cross-origin errors are expected for sandboxed iframes
    }
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-s1 border-b border-borderc select-none shrink-0">
        <div className="flex items-center gap-2 text-[11px] text-t3 font-mono">
          <button
            onClick={handleToggle}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
              showPreview
                ? "bg-accent/20 text-accent"
                : "text-t3 hover:text-text hover:bg-s3"
            }`}
            title={showPreview ? "Code-Ansicht" : "Live-Vorschau"}
          >
            {showPreview ? <EyeSlash size={12} /> : <Eye size={12} />}
            {showPreview ? "Code" : "Preview"}
          </button>
        </div>
        {showPreview && (
          <button
            onClick={generatePreview}
            className="text-xs px-2 py-1 rounded text-t3 hover:text-text hover:bg-s3 transition-all"
            title="Vorschau neu laden"
          >
            <span className="inline-flex items-center gap-1">
              <RotateCcw size={12} /> Neu laden
            </span>
          </button>
        )}
      </div>

      {/* Preview / Editor area */}
      <div className="flex-1 overflow-hidden relative">
        {!showPreview ? (
          <div className="h-full flex items-center justify-center text-t2">
            <div className="text-center">
              <Eye size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                Klicke auf <strong className="text-accent">Preview</strong> für
                eine Live-Vorschau
              </p>
              <p className="text-xs text-t3 mt-1">
                Dein Code wird in einer sicheren Sandbox ausgeführt
              </p>
            </div>
          </div>
        ) : isTranspiling ? (
          <div className="h-full flex items-center justify-center">
            <svg
              className="animate-spin w-6 h-6 text-accent"
              viewBox="0 0 24 24"
            >
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
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="max-w-md">
              <div className="flex items-start gap-2 p-4 rounded-lg bg-red-900/10 border border-red-900/20">
                <span className="text-red shrink-0 mt-0.5">
                  <Warning size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-red mb-1">
                    Preview-Fehler
                  </p>
                  <pre className="text-xs text-red/80 whitespace-pre-wrap font-mono">
                    {error}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            onLoad={handleIframeLoad}
            srcDoc={previewContent}
            title="Code Preview"
            sandbox="allow-scripts"
            className="w-full h-full border-0 bg-white"
            style={{ backgroundColor: "white" }}
            allow=""
          />
        )}
      </div>
    </div>
  );
}

/* ── Build a self-contained HTML page for the iframe ── */

/**
 * Sanitize user code before injection into iframe srcDoc.
 * Blocks common escape patterns that could access the parent window
 * or exfiltrate data despite the sandbox attribute.
 */
function sanitizeUserCode(code) {
  if (!code) return code;
  // Remove attempts to access parent/top/frameElement
  // These are basic patterns; the sandbox attribute is the primary defense
  const patterns = [
    /window\s*\.\s*parent/gi,
    /window\s*\[\s*['"]parent['"]\s*\]/gi,
    /top\s*\.\s*location/gi,
    /top\s*\.\s*localStorage/gi,
    /top\s*\.\s*sessionStorage/gi,
    /top\s*\.\s*document/gi,
    /frameElement/gi,
    /window\s*\.\s*opener/gi,
  ];
  let sanitized = code;
  for (const pattern of patterns) {
    sanitized = sanitized.replace(pattern, 'undefined');
  }
  return sanitized;
}

function buildPreviewHtml(transpiledCode) {
  // Sanitize transpiled code: strip potential parent-access attempts
  const sanitized = sanitizeUserCode(transpiledCode);

  // Wrap the user's code to render it
  const renderScript = `
<script>
(function(){
  "use strict";
  // Block parent/top/frameElement access
  try { delete window.parent; } catch(e) {}
  try { delete window.top; } catch(e) {}
  try { delete window.frameElement; } catch(e) {}
})();
try {
  // Execute the user's sanitized transpiled code
  ${sanitized}
  
  // Try to find a component function and render it
  var rootEl = document.getElementById('root');
  
  // Typische Komponenten-Namen aus den Aufgaben
  var commonNames = ['Counter', 'UserList', 'ThemeButton', 'FocusForm', 'TodoApp', 'TodoList', 'PerformanceDemo', 'ProductCard', 'ProductGrid', 'ProductFinder', 'ProductList', 'UserCard', 'UserProfile', 'Dashboard', 'VolumeControl', 'SortableList', 'EditProductForm', 'UserPage'];
  var componentToRender = null;
  for (var i = 0; i < commonNames.length; i++) {
    if (typeof window[commonNames[i]] === 'function') {
      componentToRender = window[commonNames[i]];
      break;
    }
  }
  
  // Fallback: try to find any uppercase function on window
  if (!componentToRender) {
    try {
      var globalKeys = Object.keys(window);
      for (var j = 0; j < globalKeys.length; j++) {
        var key = globalKeys[j];
        if (typeof window[key] === 'function' 
            && key[0] === key[0].toUpperCase() 
            && key !== 'React' 
            && key !== 'ReactDOM'
            && !window[key].prototype?.isReactComponent) {
          componentToRender = window[key];
          break;
        }
      }
    } catch (e) {
      // ignore window enumeration errors
    }
  }
  
  if (componentToRender) {
    var root = ReactDOM.createRoot(rootEl);
    root.render(React.createElement(componentToRender));
  } else {
    rootEl.innerHTML = '<div style="padding:20px;font-family:sans-serif;color:#666;text-align:center;"><p style="font-size:14px;">Code ausgef&uuml;hrt</p><p style="font-size:12px;margin-top:8px;">Keine React-Komponente gefunden.</p></div>';
  }
} catch (e) {
  document.getElementById('root').innerHTML = '<div id="preview-error" style="padding:16px;font-family:monospace;font-size:13px;color:#c00;background:#fff0f0;border-bottom:2px solid #fcc;"><strong>Runtime-Fehler:</strong><br>' + e.message + '<br><br><pre style="font-size:11px;color:#666;white-space:pre-wrap;margin:0;">' + e.stack + '</pre></div>';
}
<\/script>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; color: #333; }
    #root { min-height: 100vh; padding: 16px; }
    /* Basic styling for common elements */
    .card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #fafafa; }
    button { 
      padding: 6px 14px; border: 1px solid #d0d0d0; border-radius: 6px; 
      background: #fff; cursor: pointer; font-size: 13px; margin: 2px;
      transition: all 0.15s ease;
    }
    button:hover { background: #f0f0f0; border-color: #aaa; }
    button:active { transform: scale(0.97); }
    ul { list-style: none; padding: 0; }
    li { padding: 8px 12px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 8px; font-size: 14px; }
    h2 { font-size: 18px; margin-bottom: 12px; color: #222; }
    input { padding: 6px 10px; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 13px; margin: 2px; }
    select { padding: 6px 10px; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 13px; background: #fff; }
  </style>
</head>
<body>
  <div id="root"></div>
  ${renderScript}
</body>
</html>`;
}
