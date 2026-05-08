/* ── Shared AI API Helpers ── */

export function isValidUrl(string) {
  if (string.startsWith('/')) return true
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch { return false }
}

export function sanitizeBaseUrl(url) {
  return url.replace(/\/+$/, '')
}

/**
 * Call an OpenAI-compatible chat completion API.
 * @param {{ baseUrl: string, key: string, model: string }} apiConfig
 */
export async function callOpenAI(apiConfig, system, user) {
  const url = sanitizeBaseUrl(apiConfig.baseUrl)
  if (!isValidUrl(url)) throw new Error('Ungültige Base-URL')
  const r = await fetch(`${url}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiConfig.key}`,
    },
    body: JSON.stringify({
      model: apiConfig.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })
  if (!r.ok) throw new Error(`API-Fehler: ${r.status}`)
  return (await r.json()).choices?.[0]?.message?.content || 'Keine Antwort.'
}

/**
 * Call the OpenCode local API.
 */
export async function callOpenCode(baseUrl, system, user) {
  const url = sanitizeBaseUrl(baseUrl)
    .replace(/\/v1\/?$/, '')
    .replace(/\/+$/, '')
  if (!isValidUrl(url)) throw new Error('Ungültige Base-URL für OpenCode')

  const s = await fetch(`${url}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Coding-Trainer' }),
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

/** Route to the correct API based on apiType */
export async function callAI(apiConfig, system, user) {
  return apiConfig.apiType === 'opencode'
    ? callOpenCode(apiConfig.baseUrl, system, user)
    : callOpenAI(apiConfig, system, user)
}

/** Safe JSON parse that prevents prototype pollution */
export function safeJsonParse(str, fallback = null) {
  try {
    const parsed = JSON.parse(str)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const key in parsed) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          return fallback
        }
      }
    }
    return parsed
  } catch {
    return fallback
  }
}
