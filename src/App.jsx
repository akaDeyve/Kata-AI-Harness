import { useState, useCallback, useRef, useEffect } from 'react'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import CodePreview from './components/CodePreview'
import EditorToolbar from './components/EditorToolbar'
import RightPanel from './components/RightPanel'
import StatusBar from './components/StatusBar'
import ApiKeyModal from './components/ApiKeyModal'
import GenerateTaskModal from './components/GenerateTaskModal'
import Toast from './components/Toast'
import { callAI, safeJsonParse } from './lib/api'
import tasksData from './data/tasks.json'

const STORAGE_PREFIX = 'code_trainer_code_'
const STORAGE_TASKS_KEY = 'code_trainer_tasks'

function loadSavedCode(taskId) {
  try { return localStorage.getItem(`${STORAGE_PREFIX}${taskId}`) } catch { return null }
}
function saveCodeToStorage(taskId, code) {
  try { localStorage.setItem(`${STORAGE_PREFIX}${taskId}`, code) } catch { }
}

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('code_trainer_tasks')
    if (saved) {
      const parsed = safeJsonParse(saved)
      if (Array.isArray(parsed)) return parsed
    }
    return tasksData
  })
  const [selectedTaskId, setSelectedTaskId] = useState(() => tasksData[0]?.id || null)
  const [code, setCode] = useState(() => {
    const firstTask = tasksData[0]
    if (!firstTask) return ''
    const saved = loadSavedCode(firstTask.id)
    return saved ?? (firstTask.starter || '')
  })
  const [feedback, setFeedback] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [correction, setCorrection] = useState(null)
  const [isCorrectionLoading, setIsCorrectionLoading] = useState(false)
  const [showApiModal, setShowApiModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewSplit, setPreviewSplit] = useState(50) // percentage for split view
  const splitViewRef = useRef(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(220)
  const [rightPanelWidth, setRightPanelWidth] = useState(260)

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
    setFeedback(null)
    setCorrection(null)
    // code will be set by the useEffect watching selectedTaskId
  }, [])

  const handleResetCode = useCallback(() => {
    const task = tasks.find(t => t.id === selectedTaskId)
    if (task) { setCode(task.starter || ''); showToast('Code zurückgesetzt', 'info') }
  }, [selectedTaskId, tasks, showToast])

  // Load code when task changes
  useEffect(() => {
    const task = tasks.find(t => t.id === selectedTaskId)
    if (task) {
      const saved = loadSavedCode(selectedTaskId)
      setCode(saved ?? (task.starter || ''))
    }
  }, [selectedTaskId, tasks])

  // Save code to localStorage
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
  const handleGetFeedback = useCallback(async () => {
    if ((apiConfig.apiType !== 'opencode' && !apiConfig.key) || !selectedTask) { setShowApiModal(true); return }
    setIsLoading(true); setFeedback(null)
    try {
      const system = `Du bist ein erfahrener Coding-Mentor. Bewerte den Code basierend auf der Aufgabenstellung.
Antworte NUR auf Deutsch.
Gib zuerst eine Punktzahl von 1-10 im Format "Score: X/10".
Gib dann eine kurze, konstruktive Bewertung (3-5 Saetze).
Wenn du Code-Beispiele zeigst, nutze Markdown-Codebloecke.`
      const user = `Aufgabe: ${selectedTask.title}\nBeschreibung: ${selectedTask.description}\n\nMein Code:\n\`\`\`\n${code}\n\`\`\`\n\nBitte bewerte meinen Code.`
      const content = await callAI(apiConfig, system, user)
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
      const content = await callAI(apiConfig, system, user)
      setCorrection({ content })
    } catch (err) { setCorrection({ content: `Fehler: ${err.message}`, isError: true }) }
    finally { setIsCorrectionLoading(false) }
  }, [apiConfig, selectedTask, code])

  /* ── Generate task handler ── */
  const handleSaveGeneratedTask = useCallback((newTask) => {
    setTasks(prev => {
      const updated = [...prev, newTask]
      try { localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
      return updated
    })
    setSelectedTaskId(newTask.id)
    setShowGenerateModal(false)
    showToast('Neue Aufgabe wurde hinzugefügt!', 'success')
  }, [showToast])

  /* ── Progress data ── */
  const groupProgress = (tasks || []).reduce((acc, t) => {
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
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar
          task={selectedTask}
          onApiClick={() => setShowApiModal(true)}
          hasApiKey={!!apiConfig.key || apiConfig.apiType === 'opencode'}
          onReset={handleResetCode}
          onGetFeedback={handleGetFeedback}
          onGetCorrection={handleGetCorrection}
          onGenerateTask={() => setShowGenerateModal(true)}
          isLoading={isLoading}
          isCorrectionLoading={isCorrectionLoading}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <EditorToolbar code={code} onReset={handleResetCode} showToast={showToast} onTogglePreview={() => setShowPreview(v => !v)} showPreview={showPreview} />
            <div ref={splitViewRef} className="flex-1 flex overflow-hidden">
              {showPreview ? (
                <>
                  <div className="overflow-hidden" style={{ width: `${100 - previewSplit}%` }}>
                    <Editor code={code} onChange={setCode} />
                  </div>
                  <div
                    className="w-1 cursor-col-resize hover:bg-accent/40 active:bg-accent/60 bg-border transition-colors shrink-0 relative z-10"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      const parent = splitViewRef.current
                      if (!parent) return
                      const rect = parent.getBoundingClientRect()
                      const onMove = (ev) => {
                        const pct = ((ev.clientX - rect.left) / rect.width) * 100
                        setPreviewSplit(Math.max(20, Math.min(80, pct)))
                      }
                      const onUp = () => {
                        document.removeEventListener('mousemove', onMove)
                        document.removeEventListener('mouseup', onUp)
                        document.body.style.cursor = ''
                      }
                      document.body.style.cursor = 'col-resize'
                      document.addEventListener('mousemove', onMove)
                      document.addEventListener('mouseup', onUp)
                    }}
                  />
                  <div className="overflow-hidden" style={{ width: `${previewSplit}%` }}>
                    <CodePreview code={code} task={selectedTask} />
                  </div>
                </>
              ) : (
                <div className="flex-1 overflow-hidden">
                  <Editor code={code} onChange={setCode} />
                </div>
              )}
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
            width={rightPanelWidth}
            onWidthChange={setRightPanelWidth}
          />
        </div>

        <StatusBar task={selectedTask} code={code} />
      </div>

      {showApiModal && <ApiKeyModal config={apiConfig} onSave={handleSaveApiConfig} onClose={() => setShowApiModal(false)} />}
      {showGenerateModal && (
        <GenerateTaskModal
          apiConfig={apiConfig}
          onSave={handleSaveGeneratedTask}
          onClose={() => setShowGenerateModal(false)}
          showToast={showToast}
        />
      )}
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} />}
    </div>
  )
}
