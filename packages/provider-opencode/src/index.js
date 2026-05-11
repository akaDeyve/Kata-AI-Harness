/* ═══════════════════════════════════════════
   @harness/provider-opencode
   OpenCode Local AI Provider
   ═══════════════════════════════════════════ */

export const harness = {
  name: '@harness/provider-opencode',
  id: 'provider:opencode',
  type: 'aiProvider',
  contributes: { aiProviders: ['opencode'] },
  activationEvents: ['onDemand'],
}

export const OPENCODE_CONFIG = {
  id: 'opencode',
  name: 'OpenCode',
  defaultUrl: 'http://localhost:4096',
  defaultModel: '',
  needsKey: false,
  needsModel: false,
  recommended: false,
  hint: 'OpenCode-Server starten: opencode serve --port 4096',
}

export async function callOpenCode(baseUrl, system, user) {
  const url = baseUrl?.replace(/\/+$/, '').replace(/\/v1\/?$/, '') || OPENCODE_CONFIG.defaultUrl

  const s = await fetch(`${url}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Code Trainer' }),
  })
  if (!s.ok) throw new Error(`Session-Fehler: ${s.status}`)
  const { id: sid } = await s.json()

  const m = await fetch(`${url}/session/${sid}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parts: [
        { type: 'text', text: system },
        { type: 'text', text: user },
      ],
    }),
  })
  if (!m.ok) throw new Error(`Message-Fehler: ${m.status}`)
  const d = await m.json()
  return (
    d.parts
      ?.filter(p => p.type === 'text' || p.type === 'tool-result')
      .map(p => p.text || p.content || '')
      .join('\n') || 'Keine Antwort.'
  )
}

export function activate(context) {
  context.setConfig('provider', OPENCODE_CONFIG)
  return { config: OPENCODE_CONFIG, call: callOpenCode }
}
