import { useState } from 'react'

export default function ApiKeyModal({ config, onSave, onClose }) {
  const [key, setKey] = useState(config.key)
  const [baseUrl, setBaseUrl] = useState(config.baseUrl)
  const [model, setModel] = useState(config.model)
  const [apiType, setApiType] = useState(config.apiType || 'openai')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ key, baseUrl, model, apiType })
  }

  const presets = [
    { name: 'OpenAI', url: 'https://api.openai.com/v1', model: 'gpt-4o-mini', apiType: 'openai' },
    { name: 'Groq', url: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile', apiType: 'openai' },
    { name: 'OpenRouter', url: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini', apiType: 'openai' },
    { name: 'Ollama', url: 'http://localhost:11434/v1', model: 'llama3', apiType: 'openai' },
    { name: 'OpenCode', url: 'http://localhost:4096', model: '', apiType: 'opencode' },
  ]

  const applyPreset = (preset) => {
    setBaseUrl(preset.url)
    setModel(preset.model)
    setApiType(preset.apiType)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-sans" onClick={onClose}>
      <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-5">API-Einstellungen</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#cccccc] mb-1.5">API-Key</label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-[#3c3c3c] text-white text-sm rounded px-3 py-2 border border-[#555] focus:border-[#007acc] focus:outline-none font-mono placeholder:text-[#666]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#cccccc] mb-1.5">Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full bg-[#3c3c3c] text-white text-sm rounded px-3 py-2 border border-[#555] focus:border-[#007acc] focus:outline-none font-mono placeholder:text-[#666]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#cccccc] mb-1.5">Model-Name</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              disabled={apiType === 'opencode'}
              className="w-full bg-[#3c3c3c] text-white text-sm rounded px-3 py-2 border border-[#555] focus:border-[#007acc] focus:outline-none font-mono placeholder:text-[#666] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm text-[#cccccc] mb-1.5">API-Typ</label>
            <select
              value={apiType}
              onChange={e => setApiType(e.target.value)}
              className="w-full bg-[#3c3c3c] text-white text-sm rounded px-3 py-2 border border-[#555] focus:border-[#007acc] focus:outline-none font-sans"
            >
              <option value="openai">OpenAI-kompatibel (/chat/completions)</option>
              <option value="opencode">OpenCode Server (/session/message)</option>
            </select>
          </div>

          {apiType === 'opencode' && (
            <div className="text-xs text-[#858585] bg-[#3c3c3c]/50 rounded p-3">
              <p className="mb-1"><strong className="text-[#cccccc]">OpenCode Server API</strong></p>
              <p>Der OpenCode-Server muss laufen. Starte mit:</p>
              <code className="text-[#569cd6] mt-1 block">opencode serve --port 4096</code>
              <p className="mt-1">Kein API-Key erforderlich.</p>
            </div>
          )}

          <div>
            <label className="block text-sm text-[#858585] mb-2">Schnellauswahl</label>
            <div className="flex flex-wrap gap-2">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="text-xs px-3 py-1.5 rounded border border-[#555] text-[#cccccc] hover:bg-[#3c3c3c] hover:border-[#007acc] transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#cccccc] hover:bg-[#3c3c3c] rounded transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-[#0e639c] text-white rounded hover:bg-[#1177bb] transition-colors font-medium"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
