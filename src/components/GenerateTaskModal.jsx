import { useState } from 'react'
import { callAI } from '../lib/api'
import { Close, Sparkle } from './Icons'

const CATEGORIES = [
  { id: 'React Hooks', icon: '🪝', desc: 'useState, useEffect, useContext, useRef, useReducer, useMemo' },
  { id: 'Props & Komponenten', icon: '🔗', desc: 'Prop Drilling, Destructuring, Komponenten-Kommunikation' },
  { id: 'CSS & Styling', icon: '🎭', desc: 'Tailwind, CSS, Responsive Design' },
  { id: 'Array-Operationen', icon: '📊', desc: 'map, filter, find, reduce & Co.' },
]

const DIFFICULTIES = [
  { id: 'Leicht', label: 'Easy', color: 'bg-[#a8e6cf18] text-[#a8e6cf]' },
  { id: 'Mittel', label: 'Mid', color: 'bg-[#ffd3b618] text-[#ffd3b6]' },
  { id: 'Schwer', label: 'Hard', color: 'bg-[#ffaaa518] text-[#ffaaa5]' },
]

export default function GenerateTaskModal({ apiConfig, onSave, onClose, showToast }) {
  const [category, setCategory] = useState(CATEGORIES[0].id)
  const [difficulty, setDifficulty] = useState('Leicht')
  const [concept, setConcept] = useState('')
  const [generatedTask, setGeneratedTask] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const needsKey = apiConfig.apiType !== 'opencode' && !apiConfig.key

  const handleGenerate = async () => {
    if (needsKey) {
      setError('Bitte konfiguriere zuerst einen API-Key in den API-Einstellungen.')
      return
    }
    setIsGenerating(true)
    setError(null)
    setGeneratedTask(null)

    const systemPrompt = `Du bist ein erfahrener Coding-Dozent. Erstelle eine neue Programmieraufgabe für React-Entwickler.

Antworte NUR mit einem validen JSON-Objekt, ohne zusätzlichen Text. Keine Markdown-Formatierung. Das JSON muss exakt dieses Schema haben:
{
  "id": <number>,
  "group": "${category}",
  "name": "<Kurzer, prägnanter Name (max 40 Zeichen)>",
  "difficulty": "${difficulty}",
  "title": "<Aussagekräftiger Titel mit der verwendeten Methode>",
  "description": "<Detaillierte Aufgabenbeschreibung (2-4 Sätze) auf Deutsch. Beschreibe genau, was der Nutzer implementieren soll. Nenne die zu verwendenden Methoden/Patterns.>",
  "hint": "<Hilfreicher Tipp (2-3 Sätze) auf Deutsch. Erkläre die Lösung nicht komplett, aber gib eine starke Richtung vor.>",
  "starter": "<React-Code als String. Verwende React.useState (nicht import). Baue eine sinnvolle Komponente mit Platzhalter-Kommentaren wo der Nutzer Code einfügen soll.>"
}`

    const userPrompt = `Erstelle eine ${difficulty === 'Leicht' ? 'einfache' : difficulty === 'Mittel' ? 'mittel-schwere' : 'schwere'} React-Aufgabe zum Thema "${category}".

${
  concept
    ? `Das gewünschte Konzept: ${concept}`
    : `Wähle ein geeignetes Unterthema aus "${category}" und erstelle eine praxisnahe Aufgabe.`
}

Die Aufgabe soll:
- Ein klares, realistisches Szenario aus dem Berufsalltag beschreiben
- Einen vollständigen, kompilierbaren React-Starter-Code enthalten (mit React.useState statt import)
- Platzhalter-Kommentare wie "// Dein Code hier" enthalten
- Schritt-für-Schritt nachvollziehbar sein
- Keine externen APIs oder Bibliotheken voraussetzen (außer React)`

    try {
      const content = await callAI(apiConfig, systemPrompt, userPrompt)
      // Parse the JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Kein gültiges JSON in der Antwort gefunden.')
      const task = JSON.parse(jsonMatch[0])

      // Validate
      if (!task.name || !task.title || !task.description || !task.starter) {
        throw new Error('Unvollständige Aufgaben-Daten erhalten.')
      }

      // Assign a unique ID
      task.id = Date.now()
      setGeneratedTask(task)
      showToast('Aufgabe generiert! Bitte überprüfen und speichern.', 'success')
    } catch (err) {
      setError(`Fehler bei der Generierung: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = () => {
    if (!generatedTask) return
    setIsSaving(true)
    onSave(generatedTask)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 font-sans" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div
        className="bg-s1 border border-borderc rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-borderc shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
              <Sparkle size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text">KI-Aufgabe generieren</h3>
              <p className="text-xs text-t2">Erstelle eine neue Programmieraufgabe per KI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-t2 hover:text-text p-0.5" aria-label="Schließen"><Close size={18} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {needsKey && (
            <div className="p-3 rounded-lg bg-yellow-900/10 border border-yellow-700/30 text-yellow-400 text-xs flex items-start gap-2">
              <span>⚠️</span>
              <span>Bitte konfiguriere zuerst einen API-Anbieter (oben rechts auf API klicken), um Aufgaben generieren zu lassen.</span>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-t2 mb-2 uppercase tracking-wider">Kategorie</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`text-left px-3 py-2.5 rounded-lg border text-xs ${
                    category === c.id
                      ? 'bg-accent/10 border-accent text-text'
                      : 'bg-s3 border-borderc text-t2 hover:bg-s2 hover:text-text'
                  }`}
                >
                  <span className="text-sm block mb-0.5">{c.icon} {c.id}</span>
                  <span className="text-t3 text-[10px]">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-t2 mb-2 uppercase tracking-wider">Schwierigkeitsgrad</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium ${
                    difficulty === d.id
                      ? 'bg-s2 border-accent text-text'
                      : 'bg-s3 border-borderc text-t2 hover:bg-s2'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Concept / custom topic */}
          <div>
            <label className="block text-xs font-semibold text-t2 mb-2 uppercase tracking-wider">
              Spezifisches Konzept <span className="text-t3 font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder="z.B. 'useReducer mit Context API für globalen State', 'useMemo für Performance-Optimierung', 'Custom Hooks erstellen' ..."
              className="w-full bg-s3 text-text text-sm rounded-lg px-3.5 py-2.5 border border-border2 focus:border-accent focus:outline-none placeholder:text-t3 resize-none"
              rows={2}
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || needsKey}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent text-white text-sm font-semibold border border-transparent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generiere Aufgabe...
              </>
            ) : (
              <>
                <Sparkle size={16} />
                Aufgabe generieren
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-900/10 border border-red-900/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Preview of generated task */}
          {generatedTask && (
            <div className="border border-accent/30 rounded-lg overflow-hidden animate-fade-in">
              <div className="bg-accent/10 px-4 py-2.5 border-b border-accent/20 flex items-center justify-between">
                <span className="text-sm font-semibold text-accent flex items-center gap-2">
                  <Check size={16} /> Generierte Aufgabe
                </span>
                <span className="text-xs text-t2">{generatedTask.difficulty}</span>
              </div>
              <div className="p-4 space-y-3 bg-s2">
                <div>
                  <span className="text-xs text-t3">Name</span>
                  <p className="text-sm text-text font-medium">{generatedTask.name}</p>
                </div>
                <div>
                  <span className="text-xs text-t3">Titel</span>
                  <p className="text-sm text-text">{generatedTask.title}</p>
                </div>
                <div>
                  <span className="text-xs text-t3">Beschreibung</span>
                  <p className="text-sm text-t2 leading-relaxed">{generatedTask.description}</p>
                </div>
                {generatedTask.hint && (
                  <div>
                    <span className="text-xs text-t3">Tipp</span>
                    <p className="text-sm text-t2 italic">{generatedTask.hint}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-t3">Starter-Code</span>
                  <pre className="mt-1 p-3 rounded-lg bg-black/40 border border-borderc text-xs font-mono text-t2 overflow-x-auto max-h-40 overflow-y-auto">
                    {generatedTask.starter}
                  </pre>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-accent/20 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-[#7b73ff] transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Wird gespeichert...' : 'Aufgabe speichern & hinzufügen'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── API call helper ── */
// Uses shared `callAI` from ../lib/api
