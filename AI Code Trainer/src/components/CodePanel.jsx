import React from "react";
import ReactDOM from "react-dom";
import Editor from "@monaco-editor/react";
import "./CodePanel.css";

function CodePanel() {
  
  function handleEditorChange(value, event) {
    console.log("here is the current model value:", value);
  }

  return (
    <Editor
      height="90vh"
      defaultLanguage="javascript"
      defaultValue="// some comment"
      onChange={handleEditorChange}
    />
  );
}

export default CodePanel;
