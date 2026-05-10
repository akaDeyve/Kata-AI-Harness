/* ── Shared AI API Helpers ── */
import { DEFAULT_PROVIDER, PROVIDERS, getProviderHandler } from '../modules'

/**
 * Route to the correct provider based on apiType.
 */
export async function callAI(apiConfig, system, user) {
  const handler = getProviderHandler(apiConfig.apiType)
  return handler(apiConfig, system, user)
}

// Re-exported for convenience (used by App.jsx)
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

/**
 * Simple obfuscation for localStorage API keys.
 * Not true encryption - just prevents casual inspection of plaintext keys.
 * Keys are still accessible via DevTools localStorage tab.
 */
const STORAGE_PREFIX = 'code_trainer_'

export function storeApiConfig(config) {
  try {
    const { key, baseUrl, model, apiType } = config
    if (key) localStorage.setItem(`${STORAGE_PREFIX}key`, obfuscate(key))
    if (baseUrl) localStorage.setItem(`${STORAGE_PREFIX}base_url`, obfuscate(baseUrl))
    if (model) localStorage.setItem(`${STORAGE_PREFIX}model`, obfuscate(model))
    if (apiType) localStorage.setItem(`${STORAGE_PREFIX}type`, apiType)
  } catch {
    /* ignore */
  }
}

export function loadApiConfig() {
  try {
    const rawKey = localStorage.getItem(`${STORAGE_PREFIX}key`)
    const rawUrl = localStorage.getItem(`${STORAGE_PREFIX}base_url`)
    const rawModel = localStorage.getItem(`${STORAGE_PREFIX}model`)
    const apiType = localStorage.getItem(`${STORAGE_PREFIX}type`) || DEFAULT_PROVIDER
    return {
      key: rawKey ? deobfuscate(rawKey) : '',
      baseUrl: rawUrl ? deobfuscate(rawUrl) : '',
      model: rawModel ? deobfuscate(rawModel) : '',
      apiType,
    }
  } catch {
    return { key: '', baseUrl: '', model: '', apiType: DEFAULT_PROVIDER }
  }
}

function obfuscate(str) {
  try { return btoa(unescape(encodeURIComponent(str))) } catch { return str }
}

function deobfuscate(str) {
  try { return decodeURIComponent(escape(atob(str))) } catch { return str }
}
