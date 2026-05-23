import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import "./CodePanel.css";

/**
 * CodePanel Component
 * Displays a code editor with tabs for switching between HTML, CSS, and JS files.
 * Receives file contents and a callback to notify parent of changes.
 */
function CodePanel({ files, onFileChange }) {
  // Reference to the Monaco editor instance
  const editorRef = useRef(null);
  
  // Track which file tab is currently active
  const [currentFileName, setCurrentFileName] = useState("index.html");
  
  // Get the currently selected file object
  const currentFile = files[currentFileName];

  /**
   * Called when the editor is mounted/initialized.
   * Sets up a listener to detect content changes and notify the parent.
   */
  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;
    
    // Listen for content changes in the editor
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      onFileChange(currentFileName, value);
    });
  }

  return (
    <div className="code-panel-container">
      {/* Tab buttons for switching between files */}
      <button
        disabled={currentFileName === "index.html"}
        onClick={() => setCurrentFileName("index.html")}
      >
        index.html
      </button>
      <button
        disabled={currentFileName === "style.css"}
        onClick={() => setCurrentFileName("style.css")}
      >
        style.css
      </button>
      <button
        disabled={currentFileName === "script.js"}
        onClick={() => setCurrentFileName("script.js")}
      >
        script.js
      </button>
      
      {/* Monaco code editor */}
      <Editor
        height="100%"
        width="100%"
        theme="vs-dark"
        onMount={handleEditorMount}
        path={currentFile.name}
        defaultLanguage={currentFile.language}
        defaultValue={currentFile.value}
      ></Editor>
    </div>
  );
}

export default CodePanel;
