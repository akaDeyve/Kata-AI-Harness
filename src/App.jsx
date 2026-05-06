import { useState, useCallback, useRef, useEffect } from 'react'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import RightPanel from './components/RightPanel'
import StatusBar from './components/StatusBar'
import ApiKeyModal from './components/ApiKeyModal'
import Toast from './components/Toast'
import tasks from './data/tasks.json'

const STORAGE_PREFIX = 'code_trainer_code_'

function loadSavedCode(taskId) {
  try { return localStorage.getItem(`${STORAGE_PREFIX}${taskId}`) } catch { return null }
}
function saveCodeToStorage(taskId, code) {
  try { localStorage.setItem(`${STORAGE_PREFIX}${taskId}`, code) } catch { }
}

/* ── Security helpers ── */
function isValidUrl(string) {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch { return false }
}

function sanitizeBaseUrl(url) {
  return url.replace(/\/+$/, '') // remove trailing slashes
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(text))
  return div.innerHTML
}

export default function App() {
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id || null)
  const [code, setCode] = useState(() => {
    const firstTask = tasks[0]
    if (!firstTask) return ''
    const saved = loadSavedCode(firstTask.id)
    return saved ?? (firstTask.starter || '')
  })
  const [feedback, setFeedback] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [correction, setCorrection] = useState(null)
  const [isCorrectionLoading, setIsCorrectionLoading] = useState(false)
  const [showApiModal, setShowApiModal] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  const [apiConfig, setApiConfig] = useState(() => ({
    key: localStorage.getItem('api_key') || '',
    baseUrl: localStorage.getItem('api_base_url') || 'https://api.openai.com/v1',
    model: localStorage.getItem('api_model') || 'gpt-4o-mini',
    apiType: localStorage.getItem('api_type') || 'openai',
  }))

  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  const showToast = useCallback((message, type = 'info') => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, type, key: Date.now() })
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }, [])

  const handleSelectTask = useCallback((taskId) => {
    setSelectedTaskId(taskId)
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      const saved = loadSavedCode(taskId)
      setCode(saved ?? (task.starter || ''))
    }
    setFeedback(null)
    setCorrection(null)
  }, [])

  const handleResetCode = useCallback(() => {
    const task = tasks.find(t => t.id === selectedTaskId)
    if (task) { setCode(task.starter || ''); showToast('Code zurückgesetzt', 'info') }
  }, [selectedTaskId, showToast])

  useEffect(() => {
    if (selectedTaskId && code) saveCodeToStorage(selectedTaskId, code)
  }, [code, selectedTaskId])

  const handleSaveApiConfig = useCallback((config) => {
    setApiConfig(config)
    localStorage.setItem('api_key', config.key)
    localStorage.setItem('api_base_url', config.baseUrl)
    localStorage.setItem('api_model', config.model)
    localStorage.setItem('api_type', config.apiType)
    setShowApiModal(false)
  }, [])

  /* ── AI calls ── */
  const buildPrompts = () => {
    const system = `Du bist ein erfahrener Coding-Mentor. Bewerte den Code basierend auf der Aufgabenstellung.
Antworte NUR auf Deutsch.
Gib zuerst eine Punktzahl von 1-10 im Format "Score: X/10".
Gib dann eine kurze, konstruktive Bewertung (3-5 Saetze).
Wenn du Code-Beispiele zeigst, nutze Markdown-Codebloecke.`
    const user = `Aufgabe: ${selectedTask.title}\nBeschreibung: ${selectedTask.description}\n\nMein Code:\n\`\`\`\n${code}\n\`\`\`\n\nBitte bewerte meinen Code.`
    return { system, user }
  }

  const callOpenCode = async (baseUrl, system, user) => {
    const url = sanitizeBaseUrl(baseUrl).replace(/\/v1\/?$/, '').replace(/\/$/, '')
    if (!isValidUrl(url)) throw new Error('Ungültige Base-URL für OpenCode')
    const s = await fetch(`${url}/session`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Coding-Trainer' }),
    })
    if (!s.ok) throw new Error(`Session-Fehler: ${s.status}`)
    const { id: sid } = await s.json()
    const m = await fetch(`${url}/session/${sid}/message`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parts: [{ type: 'text', text: system }, { type: 'text', text: user }] }),
    })
    if (!m.ok) throw new Error(`Message-Fehler: ${m.status}`)
    const d = await m.json()
    return d.parts?.filter(p => p.type === 'text' || p.type === 'tool-result').map(p => p.text || p.content || '').join('\n') || 'Keine Antwort.'
  }

  const callOpenAI = async (system, user) => {
    const url = sanitizeBaseUrl(apiConfig.baseUrl)
    if (!isValidUrl(url)) throw new Error('Ungültige Base-URL')
    const r = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiConfig.key}` },
      body: JSON.stringify({ model: apiConfig.model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.7, max_tokens: 1500 }),
    })
    if (!r.ok) throw new Error(`API-Fehler: ${r.status}`)
    return (await r.json()).choices?.[0]?.message?.content || 'Keine Antwort.'
  }

  const handleGetFeedback = useCallback(async () => {
    if ((apiConfig.apiType !== 'opencode' && !apiConfig.key) || !selectedTask) { setShowApiModal(true); return }
    setIsLoading(true); setFeedback(null)
    try {
      const { system, user } = buildPrompts()
      const content = apiConfig.apiType === 'opencode' ? await callOpenCode(apiConfig.baseUrl, system, user) : await callOpenAI(system, user)
      const scoreMatch = content.match(/Score:\s*(\d+)\/10/i)
      setFeedback({ content, score: scoreMatch ? parseInt(scoreMatch[1]) : null })
    } catch (err) { setFeedback({ content: `Fehler: ${err.message}`, score: null, isError: true }) }
    finally { setIsLoading(false) }
  }, [apiConfig, selectedTask, code])

  const handleGetCorrection = useCallback(async () => {
    if ((apiConfig.apiType !== 'opencode' && !apiConfig.key) || !selectedTask) { setShowApiModal(true); return }
    setIsCorrectionLoading(true); setCorrection(null)
    try {
      const system = `Du bist ein Coding-Mentor. Verbessere den Code des Nutzers.
Antworte NUR auf Deutsch.
1. Korrigiere Fehler
2. Verbessere Code-Qualitaet
3. Erkläre kurz (2-3 Saetze), was verbessert wurde
4. Zeige verbesserten Code in Markdown-Codeblock`
      const user = `Aufgabe: ${selectedTask.title}\nBeschreibung: ${selectedTask.description}\n\nMein Code:\n\`\`\`\n${code}\n\`\`\`\n\nBitte zeige die korrigierte Version.`
      const content = apiConfig.apiType === 'opencode' ? await callOpenCode(apiConfig.baseUrl, system, user) : await callOpenAI(system, user)
      setCorrection({ content })
    } catch (err) { setCorrection({ content: `Fehler: ${err.message}`, isError: true }) }
    finally { setIsCorrectionLoading(false) }
  }, [apiConfig, selectedTask, code])

  /* ── Progress data ── */
  const groupProgress = tasks.reduce((acc, t) => {
    if (!acc[t.group]) acc[t.group] = { total: 0, done: 0 }
    acc[t.group].total++
    return acc
  }, {})

  return (
    <div className="h-full flex bg-bg overflow-hidden">
      <Sidebar
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={handleSelectTask}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar
          task={selectedTask}
          onApiClick={() => setShowApiModal(true)}
          hasApiKey={!!apiConfig.key || apiConfig.apiType === 'opencode'}
          onReset={handleResetCode}
          onGetFeedback={handleGetFeedback}
          onGetCorrection={handleGetCorrection}
          isLoading={isLoading}
          isCorrectionLoading={isCorrectionLoading}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="flex-1 overflow-hidden">
              <Editor code={code} onChange={setCode} />
            </div>
          </div>

          <RightPanel
            task={selectedTask}
            feedback={feedback}
            correction={correction}
            isLoading={isLoading}
            isCorrectionLoading={isCorrectionLoading}
            onGetFeedback={handleGetFeedback}
            onGetCorrection={handleGetCorrection}
            showToast={showToast}
            groupProgress={groupProgress}
            collapsed={rightPanelCollapsed}
            onToggleCollapse={() => setRightPanelCollapsed(v => !v)}
          />
        </div>

        <StatusBar task={selectedTask} code={code} />
      </div>

      {showApiModal && <ApiKeyModal config={apiConfig} onSave={handleSaveApiConfig} onClose={() => setShowApiModal(false)} />}
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} />}
    </div>
  )
}
