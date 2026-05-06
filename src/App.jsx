import { useState, useCallback } from 'react'
import TopBar from './components/TopBar'
import ActivityBar from './components/ActivityBar'
import Sidebar from './components/Sidebar'
import TaskPanel from './components/TaskPanel'
import Editor from './components/Editor'
import FeedbackPanel from './components/FeedbackPanel'
import StatusBar from './components/StatusBar'
import ApiKeyModal from './components/ApiKeyModal'
import tasks from './data/tasks.json'

export default function App() {
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id || null)
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [correction, setCorrection] = useState(null)
  const [isCorrectionLoading, setIsCorrectionLoading] = useState(false)
  const [showApiModal, setShowApiModal] = useState(false)
  const [apiConfig, setApiConfig] = useState(() => ({
    key: localStorage.getItem('api_key') || '',
    baseUrl: localStorage.getItem('api_base_url') || 'https://api.openai.com/v1',
    model: localStorage.getItem('api_model') || 'Big-Pickle',
    apiType: localStorage.getItem('api_type') || 'openai',
  }))

  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  const handleSelectTask = useCallback((taskId) => {
    setSelectedTaskId(taskId)
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setCode(task.starter || '')
    }
    setFeedback(null)
    setCorrection(null)
  }, [])

  const handleSaveApiConfig = useCallback((config) => {
    setApiConfig(config)
    localStorage.setItem('api_key', config.key)
    localStorage.setItem('api_base_url', config.baseUrl)
    localStorage.setItem('api_model', config.model)
    localStorage.setItem('api_type', config.apiType)
    setShowApiModal(false)
  }, [])

  const handleGetFeedback = useCallback(async () => {
    if (!apiConfig.key) {
      setShowApiModal(true)
      return
    }
    if (!selectedTask) return

    setIsLoading(true)
    setFeedback(null)

    const systemPrompt = `Du bist ein erfahrener Coding-Mentor. Bewerte den Code des Nutzers basierend auf der Aufgabenstellung.
Antworte NUR auf Deutsch.
Gib zuerst eine Punktzahl von 1-10 im Format "Score: X/10".
Gib dann eine kurze, konstruktive Bewertung (3-5 Saetze) mit Verbesserungsvorschlaegen.
Erwaehne, was gut geloest wurde und was verbessert werden kann.
Wenn du Code-Beispiele zeigst, nutze Markdown-Codebloecke mit Sprachangabe, z.B.:
\`\`\`javascript
// dein Code hier
\`\`\``

    const userPrompt = `Aufgabe: ${selectedTask.title}
Beschreibung: ${selectedTask.description}

Mein Code:
\`\`\`
${code}
\`\`\`

Bitte bewerte meinen Code.`

    try {
      let content = ''

      if (apiConfig.apiType === 'opencode') {
        // OpenCode Server API: Create session → Send message → Parse response
        const baseUrl = apiConfig.baseUrl.replace(/\/v1\/?$/, '').replace(/\/$/, '')

        // Step 1: Create a new session
        const sessionRes = await fetch(`${baseUrl}/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Coding-Trainer Feedback',
          }),
        })

        if (!sessionRes.ok) {
          const err = await sessionRes.text()
          throw new Error(`OpenCode Session-Fehler: ${sessionRes.status} - ${err}`)
        }

        const session = await sessionRes.json()
        const sessionId = session.id

        // Step 2: Send message
        const messageRes = await fetch(`${baseUrl}/session/${sessionId}/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parts: [
              { type: 'text', text: systemPrompt },
              { type: 'text', text: userPrompt },
            ],
          }),
        })

        if (!messageRes.ok) {
          const err = await messageRes.text()
          throw new Error(`OpenCode Message-Fehler: ${messageRes.status} - ${err}`)
        }

        const messageData = await messageRes.json()

        // Step 3: Extract text from parts
        if (messageData.parts) {
          content = messageData.parts
            .filter(p => p.type === 'text' || p.type === 'tool-result')
            .map(p => p.text || p.content || '')
            .join('\n')
        } else {
          content = 'Keine Antwort erhalten.'
        }
      } else {
        // OpenAI-compatible API
        const res = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiConfig.key}`,
          },
          body: JSON.stringify({
            model: apiConfig.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 1500,
          }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(`API-Fehler: ${res.status} - ${err}`)
        }

        const data = await res.json()
        content = data.choices?.[0]?.message?.content || 'Keine Antwort erhalten.'
      }

      const scoreMatch = content.match(/Score:\s*(\d+)\/10/i)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null

      setFeedback({ content, score })
    } catch (err) {
      setFeedback({ content: `Fehler: ${err.message}`, score: null, isError: true })
    } finally {
      setIsLoading(false)
    }
  }, [apiConfig, selectedTask, code])

  const handleGetCorrection = useCallback(async () => {
    if (!apiConfig.key) {
      setShowApiModal(true)
      return
    }
    if (!selectedTask) return

    setIsCorrectionLoading(true)
    setCorrection(null)

    const systemPrompt = `Du bist ein erfahrener Coding-Mentor. Deine Aufgabe ist es, den Code des Nutzers zu verbessern.
Antworte NUR auf Deutsch.

Analysiere den Code und gib eine verbesserte Version zurueck. Beachte dabei:
1. Korrigiere Fehler und schlechte Praktiken
2. Verbessere die Code-Qualitaet (Lesbarkeit, Performance, Best Practices)
3. Erkläre kurz (2-3 Saetze), was verbessert wurde
4. Zeige den verbesserten Code in einem Markdown-Codeblock mit Sprachangabe, z.B. \`\`\`javascript`

    const userPrompt = `Aufgabe: ${selectedTask.title}
Beschreibung: ${selectedTask.description}

Mein Code:
\`\`\`
${code}
\`\`\`

Bitte zeige mir die korrigierte Version meines Codes.`

    try {
      let content = ''

      if (apiConfig.apiType === 'opencode') {
        const baseUrl = apiConfig.baseUrl.replace(/\/v1\/?$/, '').replace(/\/$/, '')

        const sessionRes = await fetch(`${baseUrl}/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Coding-Trainer Korrektur' }),
        })

        if (!sessionRes.ok) {
          const err = await sessionRes.text()
          throw new Error(`OpenCode Session-Fehler: ${sessionRes.status} - ${err}`)
        }

        const session = await sessionRes.json()
        const sessionId = session.id

        const messageRes = await fetch(`${baseUrl}/session/${sessionId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parts: [
              { type: 'text', text: systemPrompt },
              { type: 'text', text: userPrompt },
            ],
          }),
        })

        if (!messageRes.ok) {
          const err = await messageRes.text()
          throw new Error(`OpenCode Message-Fehler: ${messageRes.status} - ${err}`)
        }

        const messageData = await messageRes.json()

        if (messageData.parts) {
          content = messageData.parts
            .filter(p => p.type === 'text' || p.type === 'tool-result')
            .map(p => p.text || p.content || '')
            .join('\n')
        } else {
          content = 'Keine Antwort erhalten.'
        }
      } else {
        const res = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiConfig.key}`,
          },
          body: JSON.stringify({
            model: apiConfig.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.4,
            max_tokens: 2000,
          }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(`API-Fehler: ${res.status} - ${err}`)
        }

        const data = await res.json()
        content = data.choices?.[0]?.message?.content || 'Keine Antwort erhalten.'
      }

      setCorrection({ content })
    } catch (err) {
      setCorrection({ content: `Fehler: ${err.message}`, isError: true })
    } finally {
      setIsCorrectionLoading(false)
    }
  }, [apiConfig, selectedTask, code])

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <TopBar
        onApiClick={() => setShowApiModal(true)}
        hasApiKey={!!apiConfig.key}
      />

      <div className="flex-1 flex overflow-hidden">
        <ActivityBar />
        <Sidebar
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={handleSelectTask}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <TaskPanel task={selectedTask} />

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <Editor code={code} onChange={setCode} />
            </div>
            <FeedbackPanel
              feedback={feedback}
              isLoading={isLoading}
              onGetFeedback={handleGetFeedback}
              correction={correction}
              isCorrectionLoading={isCorrectionLoading}
              onGetCorrection={handleGetCorrection}
            />
          </div>
        </div>
      </div>

      <StatusBar task={selectedTask} />

      {showApiModal && (
        <ApiKeyModal
          config={apiConfig}
          onSave={handleSaveApiConfig}
          onClose={() => setShowApiModal(false)}
        />
      )}
    </div>
  )
}
