/* ── OpenRouter Provider ── */

export const OPENROUTER_CONFIG = {
  id: 'openrouter',
  name: 'OpenRouter',
  defaultUrl: 'https://openrouter.ai/api/v1',
  defaultModel: 'openai/gpt-4o-mini',
  needsKey: true,
  recommended: false,
  hint: 'API-Key unter https://openrouter.ai/keys',
}

export async function callOpenRouter({ key, baseUrl, model }, system, user) {
  const url = baseUrl?.replace(/\/+$/, '') || OPENROUTER_CONFIG.defaultUrl
  const m = model || OPENROUTER_CONFIG.defaultModel

  const r = await fetch(`${url}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
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
  if (!r.ok) throw new Error(`OpenRouter API-Fehler: ${r.status}`)
  const data = await r.json()
  return data.choices?.[0]?.message?.content || 'Keine Antwort.'
}
