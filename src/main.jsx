import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Error boundary to catch runtime errors
window.addEventListener('error', (e) => {
  console.error('[Global Error]', e.message, e.filename, e.lineno)
})
window.addEventListener('unhandledrejection', (e) => {
  console.error('[Unhandled Rejection]', e.reason)
})

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (err) {
  console.error('[App Render Error]', err)
  document.getElementById('root').innerHTML = `
    <div style="padding:40px;font-family:monospace;background:#1a1a1a;color:#ff6b6b;min-height:100vh;">
      <h2>Runtime Error</h2>
      <pre style="white-space:pre-wrap;color:#f0f0f0;">${err.message}</pre>
      <pre style="white-space:pre-wrap;color:#aaa;font-size:12px;">${err.stack}</pre>
    </div>
  `
}
