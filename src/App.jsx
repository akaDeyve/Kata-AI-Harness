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
import ConfigSettingsModal from './components/ConfigSettingsModal'
import { callAI, loadApiConfig, storeApiConfig, DEFAULT_PROVIDER } from './lib/api'
import { FEEDBACK_PROMPT, CORRECTION_PROMPT } from './lib/prompts'
import { buildPluginState, loadSavedCode, saveCodeToStorage, getInitialTasks } from './lib/app-utils'

export default function App() {
  const [tasks, setTasks] = useState(getInitialTasks)
  const initialTaskId = tasks[0]?.id || null
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId)
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
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [moduleState, setModuleState] = useState(buildPluginState)
  const [showPreview, setShowPreview] = useState(false)
  const [previewSplit, setPreviewSplit] = useState(50) // percentage for split view
  const splitViewRef = useRef(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(220)
  const [rightPanelWidth, setRightPanelWidth] = useState(260)

  const [apiConfig, setApiConfig] = useState({ key: '', baseUrl: '', model: '', apiType: DEFAULT_PROVIDER })

  // Load saved API config asynchronously (decryption may need crypto.subtle)
  useEffect(() => {
    loadApiConfig().then(setApiConfig)
  }, [])

  const selectedTask = tasks.find((t) => t.id === selectedTaskId)

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
    const task = tasks.find((t) => t.id === selectedTaskId)
    if (task) {
      setCode(task.starter || '')
      showToast('Code zurückgesetzt', 'info')
    }
  }, [selectedTaskId, tasks, showToast])

  // Load code when task changes
  useEffect(() => {
    const task = tasks.find((t) => t.id === selectedTaskId)
    if (task) {
      const saved = loadSavedCode(selectedTaskId)
      setCode(saved ?? (task.starter || ''))
    }
  }, [selectedTaskId, tasks])

  // Save code to localStorage
  useEffect(() => {
    if (selectedTaskId && code) saveCodeToStorage(selectedTaskId, code)
  }, [code, selectedTaskId])

  const handleSaveApiConfig = useCallback(async (config) => {
    setApiConfig(config)
    await storeApiConfig(config)
    setShowApiModal(false)
  }, [])

  const handleModuleSettingsChange = useCallback(() => {
    const state = buildPluginState()
    setModuleState(state)
    if (state['feature:preview'] === false) {
      setShowPreview(false)
    }
  }, [])

  /* ── AI calls ── */
  const handleGetFeedback = useCallback(async () => {
    if ((apiConfig.apiType !== 'opencode' && !apiConfig.key) || !selectedTask) {
      setShowApiModal(true)
      return
    }
    setIsLoading(true)
    setFeedback(null)
    try {
      const user = `Aufgabe: ${selectedTask.title}\nBeschreibung: ${selectedTask.description}\n\nMein Code:\n\`\`\`\n${code}\n\`\`\`\n\nBitte bewerte meinen Code.`
      const content = await callAI(apiConfig, FEEDBACK_PROMPT, user)
      const scoreMatch = content.match(/Score:\s*(\d+)\/10/i)
      setFeedback({ content, score: scoreMatch ? parseInt(scoreMatch[1]) : null })
    } catch (err) {
      setFeedback({ content: `Fehler: ${err.message}`, score: null, isError: true })
    } finally {
      setIsLoading(false)
    }
  }, [apiConfig, selectedTask, code])

  const handleGetCorrection = useCallback(async () => {
    if ((apiConfig.apiType !== 'opencode' && !apiConfig.key) || !selectedTask) {
      setShowApiModal(true)
      return
    }
    setIsCorrectionLoading(true)
    setCorrection(null)
    try {
      const user = `Aufgabe: ${selectedTask.title}\nBeschreibung: ${selectedTask.description}\n\nMein Code:\n\`\`\`\n${code}\n\`\`\`\n\nBitte zeige die korrigierte Version.`
      const content = await callAI(apiConfig, CORRECTION_PROMPT, user)
      setCorrection({ content })
    } catch (err) {
      setCorrection({ content: `Fehler: ${err.message}`, isError: true })
    } finally {
      setIsCorrectionLoading(false)
    }
  }, [apiConfig, selectedTask, code])

  /* ── Generate task handler ── */
  const handleSaveGeneratedTask = useCallback(
    (newTask) => {
      setTasks((prev) => {
        const updated = [...prev, newTask]
        try {
          localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(updated))
        } catch {
          /* ignore */
        }
        return updated
      })
      setSelectedTaskId(newTask.id)
      setShowGenerateModal(false)
      showToast('Neue Aufgabe wurde hinzugefügt!', 'success')
    },
    [showToast],
  )

  const handleSplitResize = useCallback((e) => {
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
  }, [])

  return (
    <div className="h-full flex bg-bg overflow-hidden">
      <Sidebar
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={handleSelectTask}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
        onApiClick={() => setShowApiModal(true)}
        onSettingsClick={() => setShowSettingsModal(true)}
        hasApiKey={!!apiConfig.key || apiConfig.apiType === 'opencode'}
        onGenerateTask={moduleState['feature:generate'] !== false ? () => setShowGenerateModal(true) : undefined}
        onReset={handleResetCode}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar task={selectedTask} />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <EditorToolbar
              code={code}
              onReset={handleResetCode}
              showToast={showToast}
              onTogglePreview={() => setShowPreview((v) => !v)}
              showPreview={showPreview}
              enablePreview={moduleState['feature:preview'] !== false}
              language={selectedTask?.language || 'javascript'}
            />
            <div ref={splitViewRef} className="flex-1 flex overflow-hidden">
              {showPreview ? (
                <>
                  <div className="overflow-hidden" style={{ width: `${100 - previewSplit}%` }}>
                    <Editor code={code} onChange={setCode} language={selectedTask?.language || 'javascript'} />
                  </div>
                  <div
                    className="w-1 cursor-col-resize hover:bg-accent/40 active:bg-accent/60 bg-border transition-colors shrink-0 relative z-10"
                    onMouseDown={handleSplitResize}
                  />
                  <div className="overflow-hidden" style={{ width: `${previewSplit}%` }}>
                    <CodePreview code={code} task={selectedTask} />
                  </div>
                </>
              ) : (
                <div className="flex-1 overflow-hidden">
                  <Editor code={code} onChange={setCode} language={selectedTask?.language || 'javascript'} />
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
            collapsed={rightPanelCollapsed}
            onToggleCollapse={() => setRightPanelCollapsed((v) => !v)}
            width={rightPanelWidth}
            onWidthChange={setRightPanelWidth}
          />
        </div>

        <StatusBar task={selectedTask} code={code} />
      </div>

      {showApiModal && (
        <ApiKeyModal config={apiConfig} onSave={handleSaveApiConfig} onClose={() => setShowApiModal(false)} />
      )}
      {showGenerateModal && moduleState['feature:generate'] !== false && (
        <GenerateTaskModal
          apiConfig={apiConfig}
          onSave={handleSaveGeneratedTask}
          onClose={() => setShowGenerateModal(false)}
          showToast={showToast}
        />
      )}
      {showSettingsModal && (
        <ConfigSettingsModal
          onClose={() => setShowSettingsModal(false)}
          onSave={(newState) => {
            setModuleState(newState)
            if (newState['feature:preview'] === false) setShowPreview(false)
            showToast('Einstellungen gespeichert', 'success')
          }}
        />
      )}
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} />}
    </div>
  )
}
