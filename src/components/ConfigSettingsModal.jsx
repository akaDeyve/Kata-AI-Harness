import { useState } from 'react'
import { saveEnabledPluginIds, togglePlugin } from '../modules/plugin-bridge'
import { buildPluginState } from '../lib/app-utils'
import { Close, Check, Settings, Plugs, Lightning, Globe, Lightbulb, Star } from './Icons'

const TABS = [
  { id: 'providers', label: 'AI Provider', Icon: Plugs },
  { id: 'features', label: 'Features', Icon: Lightning },
  { id: 'languages', label: 'Sprachen', Icon: Globe },
]

export default function ConfigSettingsModal({ onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('providers')
  const [pluginState, setPluginState] = useState(buildPluginState)
  const [hasChanges, setHasChanges] = useState(false)

  const pluginsByType = getPluginsByTypeFromState(pluginState)

  const handleToggle = (pluginId) => {
    // Update localStorage via togglePlugin
    togglePlugin(pluginId)
    // Read back the fresh state from localStorage
    const freshState = buildPluginState()
    setPluginState(freshState)
    setHasChanges(true)
  }

  const handleSave = () => {
    // Sync App.jsx with current localStorage state
    if (onSave) onSave(buildPluginState())
    onClose()
  }

  const handleReset = () => {
    // Clear disabled list = all enabled
    saveEnabledPluginIds([])
    const freshState = buildPluginState()
    setPluginState(freshState)
    setHasChanges(true)
  }

  const getEnabledCount = (type) => {
    const typeMap = { providers: 'providers', features: 'features', languages: 'languages' }
    return (pluginsByType[typeMap[type]] || []).filter((p) => p.enabled).length
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 font-sans"
      onClick={onClose}
    >
      <div
        className="bg-s1 border border-borderc rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-borderc shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text">Einstellungen</h3>
              <p className="text-xs text-t2">Module aktivieren oder deaktivieren</p>
            </div>
          </div>
          <button onClick={onClose} className="text-t2 hover:text-text p-0.5" aria-label="Schließen">
            <Close size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-borderc shrink-0">
          {TABS.map((tab) => {
            const count = getEnabledCount(tab.id)
            const total = (pluginsByType[tab.id] || []).length
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-accent text-text bg-s2'
                    : 'border-transparent text-t2 hover:text-text hover:bg-s3'
                }`}
              >
                <span>
                  <tab.Icon size={14} />
                </span>
                {tab.label}
                <span className="text-xs text-t3 bg-s3 px-1.5 py-0.5 rounded">
                  {count}/{total}
                </span>
              </button>
            )
          })}
        </div>

        {/* Module list */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* AI Providers */}
          {activeTab === 'providers' && (
            <div className="space-y-2">
              <p className="text-xs text-t3 mb-3">
                Wähle welche AI-Anbieter verfügbar sein sollen. Mindestens ein Provider muss aktiv sein.
              </p>
              {pluginsByType.providers.map((plugin) => (
                <ModuleCard
                  key={plugin.id}
                  module={plugin}
                  enabled={plugin.enabled}
                  onToggle={() => handleToggle(plugin.id)}
                />
              ))}
              <div className="mt-4 p-3 rounded-lg bg-s3 border border-borderc text-xs text-t2">
                <p className="mb-1 flex items-start gap-1">
                  <Lightbulb size={14} className="shrink-0 mt-0.5" />{' '}
                  <span>
                    <strong>Tipp:</strong> Gemini bietet einen kostenlosen API-Key und ist als Standard empfohlen.
                  </span>
                </p>
                <p>Lokale Provider (Ollama, OpenCode) benötigen keinen API-Key.</p>
              </div>
            </div>
          )}

          {/* Features */}
          {activeTab === 'features' && (
            <div className="space-y-2">
              <p className="text-xs text-t3 mb-3">Aktiviere oder deaktiviere Hauptfunktionen der Anwendung.</p>
              {pluginsByType.features.map((plugin) => (
                <ModuleCard
                  key={plugin.id}
                  module={plugin}
                  enabled={plugin.enabled}
                  onToggle={() => handleToggle(plugin.id)}
                />
              ))}
            </div>
          )}

          {/* Languages */}
          {activeTab === 'languages' && (
            <div className="space-y-2">
              <p className="text-xs text-t3 mb-3">Programmiersprachen die im Editor verfügbar sind.</p>
              {pluginsByType.languages.map((plugin) => (
                <ModuleCard
                  key={plugin.id}
                  module={plugin}
                  enabled={plugin.enabled}
                  onToggle={() => handleToggle(plugin.id)}
                />
              ))}
              <div className="mt-4 p-3 rounded-lg bg-s3 border border-borderc text-xs text-t2">
                <p className="flex items-start gap-1">
                  <Lightbulb size={14} className="shrink-0 mt-0.5" />{' '}
                  <span>
                    <strong>Hinweis:</strong> Deaktivierte Sprachen werden im Editor nicht mehr angezeigt.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-borderc shrink-0">
          <button onClick={handleReset} className="text-xs text-t3 hover:text-text transition-colors">
            Auf Standard zurücksetzen
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-t2 hover:text-text hover:bg-s3 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-5 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                hasChanges ? 'bg-accent text-white hover:bg-accent/90' : 'bg-s3 text-t3 cursor-not-allowed'
              }`}
            >
              <Check size={14} /> Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Build plugins-by-type from the plugin state map.
 * Returns { providers, languages, features } arrays.
 */
function getPluginsByTypeFromState(pluginState) {
  const providers = []
  const languages = []
  const features = []

  const labels = {
    'provider:gemini': 'Gemini',
    'provider:openrouter': 'OpenRouter',
    'provider:ollama': 'Ollama',
    'provider:opencode': 'OpenCode',
    'plugin:javascript': 'JavaScript',
    'plugin:python': 'Python',
    'plugin:typescript': 'TypeScript',
    'feature:preview': 'Code Preview',
    'feature:tasks': 'Task Datasets',
    'feature:generate': 'KI-Aufgaben Generierung',
  }

  const descriptions = {
    'provider:gemini': 'Google Gemini – kostenloser API-Key',
    'provider:openrouter': 'OpenRouter – Multi-Model Gateway',
    'provider:ollama': 'Ollama – lokal, kein API-Key nötig',
    'provider:opencode': 'OpenCode – lokal, kein API-Key nötig',
    'plugin:javascript': 'JavaScript / React Unterstützung',
    'plugin:python': 'Python Unterstützung',
    'plugin:typescript': 'TypeScript Unterstützung',
    'feature:preview': 'Live-Vorschau von React/JSX-Code',
    'feature:tasks': 'Vordefinierte Programmieraufgaben',
    'feature:generate': 'Neue Aufgaben per KI generieren',
  }

  for (const [id, enabled] of Object.entries(pluginState)) {
    const entry = { id, name: labels[id] || id, description: descriptions[id] || '', enabled }
    if (id.startsWith('provider:')) providers.push(entry)
    else if (id.startsWith('plugin:')) languages.push(entry)
    else if (id.startsWith('feature:')) features.push(entry)
  }

  return { providers, languages, features }
}

function ModuleCard({ module, enabled, onToggle }) {
  return (
    <div
      className={`flex items-center justify-between p-3.5 rounded-lg border ${
        enabled ? 'bg-s2 border-borderc' : 'bg-s3/50 border-border2 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3">
        <div>
          <div className="text-sm font-medium text-text flex items-center gap-2">
            {module.name}
            {module.id === 'provider:gemini' && (
              <span className="text-[10px] font-semibold bg-accent/20 text-accent px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                <Star size={10} /> EMPFOHLEN
              </span>
            )}
          </div>
          <div className="text-xs text-t2 mt-0.5">{module.description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full ${enabled ? 'bg-accent' : 'bg-s3 border border-borderc'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
