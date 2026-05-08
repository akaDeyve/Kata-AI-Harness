/* ── Shared AI API Helpers ── */
import { getProviderHandler, DEFAULT_PROVIDER, PROVIDERS } from '../modules/providers'

/**
 * Route to the correct provider based on apiType.
 */
export async function callAI(apiConfig, system, user) {
  const handler = getProviderHandler(apiConfig.apiType)
  return handler(apiConfig, system, user)
}

export { DEFAULT_PROVIDER, PROVIDERS }

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
