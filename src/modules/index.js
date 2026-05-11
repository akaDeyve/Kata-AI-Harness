/* ═══════════════════════════════════════════
   Central Module Registry
   Now backed by the @harness/* plugin system.
   Re-exports for backward compatibility.
   ═══════════════════════════════════════════ */

// Plugin System – direkt imports werden von app-utils und ConfigSettingsModal verwendet
// (über plugin-bridge.js, nicht über dieses Modul)

// Backward compatibility – only what's actually consumed by src/
export { getTasksForDatasets } from '@harness/feature-tasks'

// Config exports used by App.jsx and lib/api.js
import { GEMINI_CONFIG, callGemini } from '@harness/provider-gemini'
import { OPENROUTER_CONFIG, callOpenRouter } from '@harness/provider-openrouter'
import { OLLAMA_CONFIG, callOllama } from '@harness/provider-ollama'
import { OPENCODE_CONFIG, callOpenCode } from '@harness/provider-opencode'
import { getEnabledPluginIds } from './plugin-bridge.js'

export const PROVIDERS = [GEMINI_CONFIG, OPENROUTER_CONFIG, OLLAMA_CONFIG, OPENCODE_CONFIG]
export const DEFAULT_PROVIDER = 'gemini'

export function getProviderHandler(apiType) {
  const handlers = { gemini: callGemini, openrouter: callOpenRouter, ollama: callOllama, opencode: (c, s, u) => callOpenCode(c.baseUrl, s, u) }
  const handler = handlers[apiType]
  if (!handler) throw new Error(`Unbekannter Anbieter: ${apiType}`)
  return handler
}

export function getEnabledProviders() {
  const enabledIds = getEnabledPluginIds()
  const all = ['gemini', 'openrouter', 'ollama', 'opencode']
  if (enabledIds.length === 0) return all
  return all.filter(id => enabledIds.includes(`provider:${id}`))
}