/* ── AI Provider Registry ── */
import { GEMINI_CONFIG, callGemini } from './gemini'
import { OPENROUTER_CONFIG, callOpenRouter } from './openrouter'
import { OLLAMA_CONFIG, callOllama } from './ollama'
import { OPENCODE_CONFIG, callOpenCode } from './opencode'

export const PROVIDER_REGISTRY = {
  gemini: { config: GEMINI_CONFIG, handler: callGemini },
  openrouter: { config: OPENROUTER_CONFIG, handler: callOpenRouter },
  ollama: { config: OLLAMA_CONFIG, handler: callOllama },
  opencode: { config: OPENCODE_CONFIG, handler: (cfg, system, user) => callOpenCode(cfg.baseUrl, system, user) },
}

export const PROVIDERS = Object.values(PROVIDER_REGISTRY).map(({ config }) => config)

export const DEFAULT_PROVIDER = 'gemini'

export function getProviderHandler(apiType) {
  const entry = PROVIDER_REGISTRY[apiType]
  if (!entry) throw new Error(`Unbekannter Anbieter: ${apiType}`)
  return entry.handler
}
