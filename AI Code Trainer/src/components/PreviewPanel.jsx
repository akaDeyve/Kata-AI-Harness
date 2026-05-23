import { useState, useEffect, useRef } from "react";
import "./PreviewPanel.css";

function PreviewPanel({ code }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const doc = iframeRef.current.contentDocument;
    doc.open();
    doc.write(code);
    doc.close();
  }, [code]);

  return (
    <iframe
      ref={iframeRef}
      id="preview"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}

export default PreviewPanel;
