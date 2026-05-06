import { useState } from 'react'
import { OpenAILogo, GroqLogo, OpenRouterLogo, OllamaLogo, OpenCodeLogo, GeminiLogo, Check, Close } from './Icons'

const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: <OpenAILogo size={26} className="text-green-400" />,
    url: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    needsKey: true,
    color: 'border-green-700/50 hover:border-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: <GeminiLogo size={26} className="text-[#4285F4]" />,
    url: '/gemini-api',
    model: 'gemini-3-flash-preview',
    needsKey: true,
    color: 'border-blue-600/50 hover:border-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'groq',
    name: 'Groq',
    icon: <GroqLogo size={26} className="text-[#F97316]" />,
    url: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
    needsKey: true,
    color: 'border-orange-700/50 hover:border-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: <OpenRouterLogo size={26} className="text-[#6467F2]" />,
    url: 'https://openrouter.ai/api/v1',
    model: 'openai/gpt-4o-mini',
    needsKey: true,
    color: 'border-indigo-700/50 hover:border-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    icon: <OllamaLogo size={26} className="text-purple-400" />,
    url: 'http://localhost:11434/v1',
    model: 'llama3',
    needsKey: false,
    color: 'border-purple-700/50 hover:border-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    icon: <OpenCodeLogo size={26} className="text-cyan-400" />,
    url: 'http://localhost:4096',
    model: '',
    needsKey: false,
    needsModel: false,
    color: 'border-cyan-700/50 hover:border-cyan-500',
    bgColor: 'bg-cyan-500/10',
    hint: 'opencode serve --port 4096',
  },
]

export default function ApiKeyModal({ config, onSave, onClose }) {
  const [selectedId, setSelectedId] = useState(
    PROVIDERS.find(p => p.url === config.baseUrl)?.id || 'openai'
  )
  const [key, setKey] = useState(config.key)
  const [customUrl, setCustomUrl] = useState(
    PROVIDERS.some(p => p.url === config.baseUrl) ? '' : config.baseUrl
  )
  const [customModel, setCustomModel] = useState(
    PROVIDERS.some(p => p.model === config.model) ? '' : config.model
  )

  const activeProvider = PROVIDERS.find(p => p.id === selectedId)
  const showUrlOverride = !!customUrl
  const showModelOverride = !!customModel && activeProvider?.needsModel !== false

  const handleSelectProvider = (provider) => {
    setSelectedId(provider.id)
    setCustomUrl('')
    setCustomModel('')
    // Save immediately if no key needed
    if (!provider.needsKey) {
      onSave({
        key: '',
        baseUrl: provider.url,
        model: provider.model,
        apiType: provider.id === 'opencode' ? 'opencode' : 'openai',
      })
    }
  }

  const handleSave = () => {
    const provider = activeProvider
    onSave({
      key: provider.needsKey ? key : '',
      baseUrl: customUrl || provider.url,
      model: customModel || provider.model,
      apiType: provider.id === 'opencode' ? 'opencode' : 'openai',
    })
  }

  const canSave = !activeProvider?.needsKey || (activeProvider?.needsKey && key.trim().length > 0)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 font-sans" onClick={onClose}>
      <div className="bg-s1 border border-borderc rounded-xl shadow-2xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-borderc">
          <h3 className="text-base font-semibold text-text">KI-Anbieter wählen</h3>
          <button onClick={onClose} className="text-t2 hover:text-text transition-colors p-0.5"><Close size={18} /></button>
        </div>

        {/* Provider grid */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {PROVIDERS.map(p => {
              const isActive = selectedId === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProvider(p)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border-2 transition-all duration-200 text-left
                    ${isActive
                      ? 'bg-s2 border-accent shadow-[0_0_12px_rgba(108,99,255,0.15)]'
                      : `bg-s3 border-borderc hover:bg-s2 ${p.color}`
                    }`}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-s1">{p.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-text">{p.name}</div>
                    <div className="text-xs text-t2 mt-0.5">{p.needsKey ? 'API-Key nötig' : 'Kein Key nötig'}</div>
                  </div>
                  {isActive && (
                    <span className="ml-auto text-accent"><Check size={18} /></span>
                  )}
                </button>
              )
            })}
          </div>

          {/* API-Key field (only for providers that need it) */}
          {activeProvider?.needsKey && (
            <div className="mb-4">
              <label className="block text-xs text-text mb-1.5 font-medium">API-Key</label>
              <input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder={`${activeProvider.name} API-Key (sk-...)`}
                className="w-full bg-s3 text-text text-sm rounded-lg px-3.5 py-2.5 border border-border2 focus:border-accent focus:outline-none font-mono placeholder:text-t3 transition-colors"
                autoFocus
              />
              <p className="text-xs text-t3 mt-1.5 flex items-center gap-1">🔒 Dein API-Key wird nur lokal im Browser gespeichert.</p>
            </div>
          )}

          {/* OpenCode hint */}
          {activeProvider?.id === 'opencode' && (
            <div className="mb-4 p-3 rounded-lg bg-s3 border border-borderc text-xs text-t2">
              <p className="mb-1">Starte den OpenCode-Server:</p>
              <code className="text-accent block font-mono">opencode serve --port 4096</code>
              <p className="mt-1.5 text-t3">Kein API-Key erforderlich – die Anfragen laufen lokal.</p>
            </div>
          )}

          {/* Advanced: URL & Model override */}
          <details className="text-xs text-t3 group mb-4">
            <summary className="cursor-pointer hover:text-text transition-colors select-none">
              Erweiterte Einstellungen
            </summary>
            <div className="mt-3 space-y-3 pl-2 border-l-2 border-borderc">
              <div>
                <label className="block text-xs text-t2 mb-1">Base URL überschreiben</label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder={activeProvider?.url || 'https://...'}
                  className="w-full bg-s3 text-text text-xs rounded px-3 py-2 border border-border2 focus:border-accent focus:outline-none font-mono placeholder:text-t3"
                />
              </div>
              {activeProvider?.needsModel !== false && (
                <div>
                  <label className="block text-xs text-t2 mb-1">Model überschreiben</label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={e => setCustomModel(e.target.value)}
                    placeholder={activeProvider?.model || 'gpt-4o-mini'}
                    className="w-full bg-s3 text-text text-xs rounded px-3 py-2 border border-border2 focus:border-accent focus:outline-none font-mono placeholder:text-t3"
                  />
                </div>
              )}
            </div>
          </details>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-t2 hover:text-text hover:bg-s3 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <div className="flex-1" />
            {activeProvider?.needsKey && (
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  canSave
                    ? 'bg-accent text-white hover:bg-[#7b73ff] active:scale-95'
                    : 'bg-s3 text-t3 cursor-not-allowed'
                }`}
              >
                Speichern
              </button>
            )}
            {!activeProvider?.needsKey && (
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-green-dim text-green hover:bg-[#3ecf8e28] active:scale-95 transition-all duration-200 inline-flex items-center gap-1.5"
              >
                <Check size={14} /> Bereit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
