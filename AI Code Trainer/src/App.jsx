import { useState } from "react";
import "./App.css";
import CodePanel from "./components/CodePanel";
import AIModal from "./components/AIModal";
import PreviewPanel from "./components/PreviewPanel";

const initialFiles = {
  "script.js": {
    name: "script.js",
    language: "javascript",
    value: "// Your JavaScript code here",
  },
  "style.css": {
    name: "style.css",
    language: "css",
    value: "/* Your CSS code here */",
  },
  "index.html": {
    name: "index.html",
    language: "html",
    value:
      "<!DOCTYPE html>\n<html>\n<head>\n    <title>My App</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>",
  },
};

function App() {
  const [files, setFiles] = useState(initialFiles);

  const code = `
    ${files["index.html"].value.replace("</head>", `<style>${files["style.css"].value}</style></head>`).replace("</body>", `<script>${files["script.js"].value}<\/script></body>`)}
  `;

  const handleFileChange = (fileName, newValue) => {
    setFiles((prev) => ({
      ...prev,
      [fileName]: { ...prev[fileName], value: newValue },
    }));
  };

  return (
    <>
      <div className="App">
        <div className="grid-container">
          <div className="box-1">
            <CodePanel files={files} onFileChange={handleFileChange} />
          </div>
          <div className="box-2">
            <PreviewPanel code={code} />
          </div>
          <div className="box-3">
            <AIModal />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
