/* ── Gemini Provider ── */
// ★ Empfohlen & Default – kostenloser API Key verfügbar
// Uses Gemini's OpenAI-compatible API (supports CORS for browser use)

export const GEMINI_CONFIG = {
  id: "gemini",
  name: "Gemini",
  defaultUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
  defaultModel: "gemini-3.1-flash-lite-preview",
  needsKey: true,
  recommended: true,
  hint: "Kostenloser API-Key unter https://aistudio.google.com/apikey",
};

const VALID_MODELS = [
  // Gemini 3.x
  "gemini-3.1-pro-preview",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
  // Gemini 2.5
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  // Gemini 2.0
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  // Gemini 1.5
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

export async function callGemini({ key, baseUrl, model }, system, user) {
  const url = baseUrl?.replace(/\/+$/, '') || GEMINI_CONFIG.defaultUrl
  const m = VALID_MODELS.includes(model) ? model : GEMINI_CONFIG.defaultModel

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
      max_tokens: 8192,
    }),
  })

  if (!r.ok) {
    const errBody = await r.json().catch(() => ({}))
    const errMsg = errBody?.error?.message || errBody?.error?.status || r.statusText
    throw new Error(`Gemini API-Fehler: ${r.status} – ${errMsg}`)
  }

  const data = await r.json()
  return data.choices?.[0]?.message?.content || 'Keine Antwort.'
}
