/* ═══════════════════════════════════════════
   @harness/provider-ollama
   Ollama Local AI Provider
   ═══════════════════════════════════════════ */

export const harness = {
  name: '@harness/provider-ollama',
  id: 'provider:ollama',
  type: 'aiProvider',
  contributes: { aiProviders: ['ollama'] },
  activationEvents: ['onDemand'],
}

export const OLLAMA_CONFIG = {
  id: 'ollama',
  name: 'Ollama',
  defaultUrl: 'http://localhost:11434/v1',
  defaultModel: 'llama3',
  needsKey: false,
  recommended: false,
  hint: 'Lokalen Ollama-Server starten: ollama serve',
}

export async function callOllama({ baseUrl, model }, system, user) {
  const url = baseUrl?.replace(/\/+$/, '') || OLLAMA_CONFIG.defaultUrl
  const m = model || OLLAMA_CONFIG.defaultModel

  const r = await fetch(`${url}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: m,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })
  if (!r.ok) throw new Error(`Ollama API-Fehler: ${r.status}`)
  const data = await r.json()
  return data.choices?.[0]?.message?.content || 'Keine Antwort.'
}

export function activate(context) {
  context.setConfig('provider', OLLAMA_CONFIG)
  return { config: OLLAMA_CONFIG, call: callOllama }
}
